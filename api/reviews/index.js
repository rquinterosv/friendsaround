import { query } from '../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request) {
  // GET - List all reviews (public)
  if (request.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          r.*,
          u.full_name,
          u.avatar_url,
          u.visited_countries
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `)

      return successResponse(result.rows)
    } catch (err) {
      console.error('Get reviews error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  // POST - Create a review (protected, user only)
  if (request.method === 'POST') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    try {
      const { content, city } = await request.json()

      if (!content) {
        return errorResponse('Review content is required', 400)
      }

      // Get user from database and check role
      const userResult = await query(
        'SELECT id, role FROM users WHERE firebase_uid = $1',
        [auth.user.uid]
      )

      if (userResult.rows.length === 0) {
        return errorResponse('User not found', 404)
      }

      const user = userResult.rows[0]

      // Only users with role 'user' can post reviews
      if (user.role !== 'user') {
        return errorResponse('Only regular users can post reviews', 403)
      }

      const result = await query(
        `INSERT INTO reviews (user_id, content, city) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [user.id, content, city || null]
      )

      return successResponse(result.rows[0], 201)
    } catch (err) {
      console.error('Create review error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
