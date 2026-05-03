import { query } from '../../../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id } = params

  if (request.method === 'POST') {
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

      const { date, max_capacity } = await request.json()

      if (!date) {
        return errorResponse('Date is required', 400)
      }

      const result = await query(
        `INSERT INTO available_dates (trip_type, trip_id, date, max_capacity) 
         VALUES ('walk', $1, $2, $3) 
         RETURNING *`,
        [id, date, max_capacity || 6]
      )

      return successResponse(result.rows[0], 201)
    } catch (err) {
      console.error('Add walk trip date error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
