import { query } from '../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id } = params

  if (!id) {
    return errorResponse('Guide ID is required', 400)
  }

  if (request.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          g.*,
          u.full_name,
          u.avatar_url,
          u.visited_countries,
          c.name as city_name,
          c.country,
          wt.*,
          dt.*,
          (
            SELECT json_agg(json_build_object(
              'id', ad.id,
              'date', ad.date,
              'max_capacity', ad.max_capacity,
              'spots_taken', ad.spots_taken
            ))
            FROM available_dates ad
            WHERE ad.trip_id = wt.id AND ad.trip_type = 'walk'
          ) as available_dates
        FROM guides g
        JOIN users u ON g.user_id = u.id
        LEFT JOIN cities c ON g.city_id = c.id
        LEFT JOIN walk_trips wt ON g.id = wt.guide_id AND wt.active = true
        LEFT JOIN day_trips dt ON g.id = dt.guide_id AND dt.active = true
        WHERE g.id = $1 AND g.is_active = true
      `, [id])

      if (result.rows.length === 0) {
        return errorResponse('Guide not found', 404)
      }

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Get guide error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  if (request.method === 'PATCH') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    try {
      // Check if user is the owner of this guide profile
      const guideCheck = await query(
        'SELECT * FROM guides WHERE id = $1 AND user_id = (SELECT id FROM users WHERE firebase_uid = $2)',
        [id, auth.user.uid]
      )

      if (guideCheck.rows.length === 0) {
        return errorResponse('Unauthorized - not your profile', 403)
      }

      const { bio } = await request.json()

      if (bio === undefined) {
        return errorResponse('No valid fields to update', 400)
      }

      const result = await query(
        'UPDATE guides SET bio = $1 WHERE id = $2 RETURNING *',
        [bio, id]
      )

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Update guide error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
