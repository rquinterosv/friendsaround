import { query } from '../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id } = params

  if (request.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          wt.*,
          g.id as guide_id,
          g.bio as guide_bio,
          u.full_name as guide_name,
          u.avatar_url as guide_avatar,
          c.name as city_name,
          c.country,
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
        FROM walk_trips wt
        JOIN guides g ON wt.guide_id = g.id
        JOIN users u ON g.user_id = u.id
        JOIN cities c ON wt.city_id = c.id
        WHERE wt.id = $1
      `, [id])

      if (result.rows.length === 0) {
        return errorResponse('Walk trip not found', 404)
      }

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Get walk trip error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  if (request.method === 'PATCH') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    try {
      // Check if user is the guide who owns this trip
      const tripCheck = await query(`
        SELECT wt.* FROM walk_trips wt
        JOIN guides g ON wt.guide_id = g.id
        JOIN users u ON g.user_id = u.id
        WHERE wt.id = $1 AND u.firebase_uid = $2
      `, [id, auth.user.uid])

      if (tripCheck.rows.length === 0) {
        return errorResponse('Unauthorized - not your trip', 403)
      }

      const { title, description, duration, meeting_point, active } = await request.json()
      const updates = []
      const values = []
      let idx = 1

      if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title) }
      if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description) }
      if (duration !== undefined) { updates.push(`duration = $${idx++}`); values.push(duration) }
      if (meeting_point !== undefined) { updates.push(`meeting_point = $${idx++}`); values.push(meeting_point) }
      if (active !== undefined) { updates.push(`active = $${idx++}`); values.push(active) }

      if (updates.length === 0) {
        return errorResponse('No valid fields to update', 400)
      }

      values.push(id)
      const result = await query(
        `UPDATE walk_trips SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      )

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Update walk trip error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
