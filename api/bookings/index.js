import { query, getClient } from '../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request) {
  // POST - Create a booking (protected)
  if (request.method === 'POST') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    const client = await getClient()

    try {
      await client.query('BEGIN')

      const {
        trip_type,
        trip_id,
        available_date_id,
        group_size,
        notes
      } = await request.json()

      if (!trip_type || !trip_id) {
        await client.query('ROLLBACK')
        return errorResponse('trip_type and trip_id are required', 400)
      }

      if (!['walk', 'day', 'week'].includes(trip_type)) {
        await client.query('ROLLBACK')
        return errorResponse('trip_type must be "walk", "day", or "week"', 400)
      }

      // Get user from database
      const userResult = await client.query(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [auth.user.uid]
      )

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return errorResponse('User not found', 404)
      }

      const userId = userResult.rows[0].id

      // For day trips with external booking, redirect to external URL
      if (trip_type === 'day' && !available_date_id) {
        const tripResult = await client.query(
          'SELECT booking_type, external_booking_url FROM day_trips WHERE id = $1',
          [trip_id]
        )

        if (tripResult.rows.length > 0 && tripResult.rows[0].booking_type === 'external') {
          await client.query('COMMIT')
          return successResponse({
            external_booking: true,
            external_booking_url: tripResult.rows[0].external_booking_url
          })
        }
      }

      // For walk and week trips, validate spots
      if ((trip_type === 'walk' || trip_type === 'week') && available_date_id) {
        const dateResult = await client.query(
          'SELECT * FROM available_dates WHERE id = $1 AND trip_id = $2 AND trip_type = $3',
          [available_date_id, trip_id, trip_type]
        )

        if (dateResult.rows.length === 0) {
          await client.query('ROLLBACK')
          return errorResponse('Date not found', 404)
        }

        const date = dateResult.rows[0]

        if (date.spots_taken + (group_size || 1) > date.max_capacity) {
          await client.query('ROLLBACK')
          return errorResponse('Not enough spots available', 400)
        }

        // Update spots_taken
        await client.query(
          'UPDATE available_dates SET spots_taken = spots_taken + $1 WHERE id = $2',
          [group_size || 1, available_date_id]
        )
      }

      // Create booking
      const result = await client.query(
        `INSERT INTO bookings (user_id, trip_type, trip_id, available_date_id, group_size, notes) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [userId, trip_type, trip_id, available_date_id, group_size || 1, notes || null]
      )

      await client.query('COMMIT')

      return successResponse(result.rows[0], 201)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Create booking error:', err)
      return errorResponse('Internal server error', 500)
    } finally {
      client.release()
    }
  }

  return errorResponse('Method not allowed', 405)
}
