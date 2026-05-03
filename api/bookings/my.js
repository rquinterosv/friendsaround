import { query } from '../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    // Get user from database
    const userResult = await query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [auth.user.uid]
    )

    if (userResult.rows.length === 0) {
      return errorResponse('User not found', 404)
    }

    const userId = userResult.rows[0].id

    const result = await query(`
      SELECT 
        b.*,
        CASE 
          WHEN b.trip_type = 'walk' THEN (SELECT title FROM walk_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'day' THEN (SELECT title FROM day_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'week' THEN (SELECT title FROM week_trips WHERE id = b.trip_id)
        END as trip_title,
        CASE 
          WHEN b.trip_type = 'walk' THEN (SELECT cover_image_url FROM walk_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'day' THEN (SELECT cover_image_url FROM day_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'week' THEN (SELECT cover_image_url FROM week_trips WHERE id = b.trip_id)
        END as trip_image,
        (SELECT date FROM available_dates WHERE id = b.available_date_id) as booking_date
      FROM bookings b
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId])

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get my bookings error:', err)
    return errorResponse('Internal server error', 500)
  }
}
