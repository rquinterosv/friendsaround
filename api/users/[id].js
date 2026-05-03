import { query } from '../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id } = params

  if (!id) {
    return errorResponse('User ID is required', 400)
  }

  if (request.method === 'GET') {
    try {
      const result = await query(
        `SELECT id, full_name, avatar_url, visited_countries, created_at, role 
         FROM users WHERE id = $1`,
        [id]
      )

      if (result.rows.length === 0) {
        return errorResponse('User not found', 404)
      }

      const user = result.rows[0]

      // If user is a guide, include guide profile, walk_trip and day_trip data
      if (user.role === 'guide') {
        const guideResult = await query(
          `SELECT g.*, wt.*, dt.*, c.name as city_name, c.country 
           FROM guides g 
           LEFT JOIN walk_trips wt ON g.id = wt.guide_id 
           LEFT JOIN day_trips dt ON g.id = dt.guide_id 
           LEFT JOIN cities c ON g.city_id = c.id 
           WHERE g.user_id = $1 AND g.is_active = true`,
          [id]
        )
        user.guide_profile = guideResult.rows[0] || null
      }

      return successResponse(user)
    } catch (err) {
      console.error('Get user error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  if (request.method === 'PATCH') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    try {
      // Check if user is updating their own profile
      const userCheck = await query(
        'SELECT * FROM users WHERE id = $1 AND firebase_uid = $2',
        [id, auth.user.uid]
      )

      if (userCheck.rows.length === 0) {
        return errorResponse('Unauthorized', 403)
      }

      const { full_name, visited_countries } = await request.json()
      const updates = []
      const values = []
      let idx = 1

      if (full_name !== undefined) {
        updates.push(`full_name = $${idx++}`)
        values.push(full_name)
      }
      if (visited_countries !== undefined) {
        updates.push(`visited_countries = $${idx++}`)
        values.push(visited_countries)
      }

      if (updates.length === 0) {
        return errorResponse('No valid fields to update', 400)
      }

      values.push(id)
      const result = await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      )

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Update user error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
