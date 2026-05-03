import { query } from '../../../../lib/db.js'
import { successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const result = await query(`
      SELECT 
        g.*,
        u.full_name,
        u.avatar_url,
        c.name as city_name,
        c.country,
        wt.title as walk_trip_title,
        wt.description as walk_trip_desc,
        wt.duration,
        wt.meeting_point,
        wt.cover_image_url as walk_trip_image,
        dt.title as day_trip_title,
        dt.price as day_trip_price
      FROM guides g
      JOIN users u ON g.user_id = u.id
      LEFT JOIN cities c ON g.city_id = c.id
      LEFT JOIN walk_trips wt ON g.id = wt.guide_id AND wt.active = true
      LEFT JOIN day_trips dt ON g.id = dt.guide_id AND dt.active = true
      WHERE g.is_active = true
      ORDER BY u.full_name
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get guides error:', err)
    return errorResponse('Internal server error', 500)
  }
}
