import { query } from '../../../../lib/db.js'
import { withAuth, isAdmin, successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  if (request.method !== 'PATCH') {
    return errorResponse('Method not allowed', 405)
  }

  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const adminCheck = await isAdmin(auth.user)
  if (!adminCheck) {
    return errorResponse('Unauthorized - admin only', 403)
  }

  const { id } = params

  if (!id) {
    return errorResponse('Application ID is required', 400)
  }

  try {
    const { admin_notes } = await request.json()

    const result = await query(
      `UPDATE guide_applications 
       SET status = 'rejected', admin_notes = $1, reviewed_at = now() 
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [admin_notes || null, id]
    )

    if (result.rows.length === 0) {
      return errorResponse('Application not found or already processed', 404)
    }

    return successResponse({ 
      message: 'Application rejected',
      application: result.rows[0]
    })
  } catch (err) {
    console.error('Reject application error:', err)
    return errorResponse('Internal server error', 500)
  }
}
