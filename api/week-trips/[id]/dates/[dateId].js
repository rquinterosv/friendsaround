import { query } from '../../../../../../../../lib/db.js'
import { withAuth, isAdmin, successResponse, errorResponse } from '../../../../../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id, dateId } = params

  if (request.method !== 'DELETE') {
    return errorResponse('Method not allowed', 405)
  }

  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const adminCheck = await isAdmin(auth.user)
  if (!adminCheck) {
    return errorResponse('Unauthorized - admin only', 403)
  }

  try {
    // Check if spots_taken is 0
    const dateCheck = await query(
      'SELECT * FROM available_dates WHERE id = $1 AND trip_id = $2 AND trip_type = $3',
      [dateId, id, 'week']
    )

    if (dateCheck.rows.length === 0) {
      return errorResponse('Date not found', 404)
    }

    if (dateCheck.rows[0].spots_taken > 0) {
      return errorResponse('Cannot delete date with bookings', 400)
    }

    await query(
      'DELETE FROM available_dates WHERE id = $1',
      [dateId]
    )

    return successResponse({ message: 'Date deleted successfully' })
  } catch (err) {
    console.error('Delete week trip date error:', err)
    return errorResponse('Internal server error', 500)
  }
}
