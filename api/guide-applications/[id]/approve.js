import { query, getClient } from '../../../../lib/db.js'
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

  const client = await getClient()

  try {
    await client.query('BEGIN')

    // Get the application
    const appResult = await client.query(
      'SELECT * FROM guide_applications WHERE id = $1',
      [id]
    )

    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return errorResponse('Application not found', 404)
    }

    const app = appResult.rows[0]

    if (app.status !== 'pending') {
      await client.query('ROLLBACK')
      return errorResponse('Application already processed', 400)
    }

    // Create guide record
    const guideResult = await client.query(
      `INSERT INTO guides (user_id, city_id, bio) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [app.user_id, app.city_id, '']
    )

    const guide = guideResult.rows[0]

    // Create walk_trip record
    await client.query(
      `INSERT INTO walk_trips (guide_id, city_id, title, description) 
       VALUES ($1, $2, $3, $4)`,
      [guide.id, app.city_id, app.tour_title, app.tour_summary]
    )

    // Update user role to 'guide'
    await client.query(
      "UPDATE users SET role = 'guide' WHERE id = $1",
      [app.user_id]
    )

    // Update application status
    await client.query(
      `UPDATE guide_applications 
       SET status = 'approved', reviewed_at = now() 
       WHERE id = $1`,
      [id]
    )

    await client.query('COMMIT')

    return successResponse({ 
      message: 'Application approved successfully',
      guide: guide
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Approve application error:', err)
    return errorResponse('Internal server error', 500)
  } finally {
    client.release()
  }
}
