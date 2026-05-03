import { query } from '../../../../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id, dateId } = params

  if (request.method !== 'DELETE') {
    return errorResponse('Method not allowed', 405)
  }

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

    // Check if spots_taken is 0
    const dateCheck = await query(
      'SELECT * FROM available_dates WHERE id = $1 AND trip_id = $2',
      [dateId, id]
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
    console.error('Delete walk trip date error:', err)
    return errorResponse('Internal server error', 500)
  }
}
