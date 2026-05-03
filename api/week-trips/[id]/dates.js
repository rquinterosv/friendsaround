import { query } from '../../../../../../../lib/db.js'
import { withAuth, isAdmin, successResponse, errorResponse } from '../../../../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id } = params

  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const adminCheck = await isAdmin(auth.user)
  if (!adminCheck) {
    return errorResponse('Unauthorized - admin only', 403)
  }

  try {
    const { date, max_capacity } = await request.json()

    if (!date) {
      return errorResponse('Date is required', 400)
    }

    const result = await query(
      `INSERT INTO available_dates (trip_type, trip_id, date, max_capacity) 
       VALUES ('week', $1, $2, $3) 
       RETURNING *`,
      [id, date, max_capacity || 8]
    )

    return successResponse(result.rows[0], 201)
  } catch (err) {
    console.error('Add week trip date error:', err)
    return errorResponse('Internal server error', 500)
  }
}
