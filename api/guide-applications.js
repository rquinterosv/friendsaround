import { query } from '../../lib/db.js'
import { withAuth, isAdmin, successResponse, errorResponse } from '../../lib/_middleware.js'

export default async function handler(request) {
  // POST - Submit guide application (protected)
  if (request.method === 'POST') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    try {
      const { city_id, tour_title, tour_summary } = await request.json()

      if (!city_id || !tour_title || !tour_summary) {
        return errorResponse('city_id, tour_title, and tour_summary are required', 400)
      }

      // Get user from database
      const userResult = await query(
        'SELECT id FROM users WHERE firebase_uid = $1',
        [auth.user.uid]
      )

      if (userResult.rows.length === 0) {
        return errorResponse('User not found', 404)
      }

      const userId = userResult.rows[0].id

      // Check if user already has a pending or approved application
      const existingApp = await query(
        `SELECT * FROM guide_applications 
         WHERE user_id = $1 AND status IN ('pending', 'approved')`,
        [userId]
      )

      if (existingApp.rows.length > 0) {
        return errorResponse('You already have a pending or approved application', 400)
      }

      const result = await query(
        `INSERT INTO guide_applications (user_id, city_id, tour_title, tour_summary) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [userId, city_id, tour_title, tour_summary]
      )

      return successResponse(result.rows[0], 201)
    } catch (err) {
      console.error('Guide application error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  // GET - List pending applications (admin only)
  if (request.method === 'GET') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    const adminCheck = await isAdmin(auth.user)
    if (!adminCheck) {
      return errorResponse('Unauthorized - admin only', 403)
    }

    try {
      const result = await query(`
        SELECT ga.*, u.full_name, u.email, c.name as city_name, c.country
        FROM guide_applications ga
        JOIN users u ON ga.user_id = u.id
        JOIN cities c ON ga.city_id = c.id
        WHERE ga.status = 'pending'
        ORDER BY ga.created_at DESC
      `)

      return successResponse(result.rows)
    } catch (err) {
      console.error('Get applications error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
