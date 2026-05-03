import { query } from '../../../../../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id } = params

  if (!id) {
    return errorResponse('Day trip ID is required', 400)
  }

  if (request.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          dt.*,
          g.id as guide_id,
          u.full_name as guide_name,
          u.avatar_url as guide_avatar,
          c.name as city_name,
          c.country
        FROM day_trips dt
        JOIN guides g ON dt.guide_id = g.id
        JOIN users u ON g.user_id = u.id
        JOIN cities c ON dt.city_id = c.id
        WHERE dt.id = $1
      `, [id])

      if (result.rows.length === 0) {
        return errorResponse('Day trip not found', 404)
      }

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Get day trip error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  if (request.method === 'PATCH') {
    const auth = await withAuth(request)
    if (auth.error) return errorResponse(auth.error, auth.status)

    try {
      // Check if user is the guide who owns this trip
      const tripCheck = await query(`
        SELECT dt.* FROM day_trips dt
        JOIN guides g ON dt.guide_id = g.id
        JOIN users u ON g.user_id = u.id
        WHERE dt.id = $1 AND u.firebase_uid = $2
      `, [id, auth.user.uid])

      if (tripCheck.rows.length === 0) {
        return errorResponse('Unauthorized - not your trip', 403)
      }

      const {
        title, description, price, duration, difficulty, departure_city,
        highlights, included, what_to_bring, good_to_know,
        cover_image_url, booking_type, external_booking_url, active
      } = await request.json()

      const updates = []
      const values = []
      let idx = 1

      if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title) }
      if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description) }
      if (price !== undefined) { updates.push(`price = $${idx++}`); values.push(price) }
      if (duration !== undefined) { updates.push(`duration = $${idx++}`); values.push(duration) }
      if (difficulty !== undefined) { updates.push(`difficulty = $${idx++}`); values.push(difficulty) }
      if (departure_city !== undefined) { updates.push(`departure_city = $${idx++}`); values.push(departure_city) }
      if (highlights !== undefined) { updates.push(`highlights = $${idx++}`); values.push(highlights) }
      if (included !== undefined) { updates.push(`included = $${idx++}`); values.push(included) }
      if (what_to_bring !== undefined) { updates.push(`what_to_bring = $${idx++}`); values.push(what_to_bring) }
      if (good_to_know !== undefined) { updates.push(`good_to_know = $${idx++}`); values.push(good_to_know) }
      if (cover_image_url !== undefined) { updates.push(`cover_image_url = $${idx++}`); values.push(cover_image_url) }
      if (booking_type !== undefined) { updates.push(`booking_type = $${idx++}`); values.push(booking_type) }
      if (external_booking_url !== undefined) { updates.push(`external_booking_url = $${idx++}`); values.push(external_booking_url) }
      if (active !== undefined) { updates.push(`active = $${idx++}`); values.push(active) }

      if (updates.length === 0) {
        return errorResponse('No valid fields to update', 400)
      }

      values.push(id)
      const result = await query(
        `UPDATE day_trips SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      )

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Update day trip error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
