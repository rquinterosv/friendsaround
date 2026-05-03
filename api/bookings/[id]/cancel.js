import { query, getClient } from '../../../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  if (request.method !== 'PATCH') {
    return errorResponse('Method not allowed', 405)
  }

  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const { id } = params

  if (!id) {
    return errorResponse('Booking ID is required', 400)
  }

  const client = await getClient()

  try {
    await client.query('BEGIN')

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

    // Get booking
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    )

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return errorResponse('Booking not found', 404)
    }

    const booking = bookingResult.rows[0]

    // Check if user owns this booking
    if (booking.user_id !== userId) {
      await client.query('ROLLBACK')
      return errorResponse('Unauthorized - not your booking', 403)
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK')
      return errorResponse('Booking already cancelled', 400)
    }

    // Restore spots_taken for walk and week trips
    if ((booking.trip_type === 'walk' || booking.trip_type === 'week') && booking.available_date_id) {
      await client.query(
        'UPDATE available_dates SET spots_taken = spots_taken - $1 WHERE id = $2',
        [booking.group_size, booking.available_date_id]
      )
    }

    // Update booking status
    const result = await client.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    )

    await client.query('COMMIT')

    return successResponse(result.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Cancel booking error:', err)
    return errorResponse('Internal server error', 500)
  } finally {
    client.release()
  }
}
