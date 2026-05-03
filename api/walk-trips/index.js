import { query } from '../../../../lib/db.js'
import { successResponse, errorResponse } from '../../../../lib/_middleware.js'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const result = await query(`
      SELECT 
        wt.*,
        g.id as guide_id,
        u.full_name as guide_name,
        u.avatar_url as guide_avatar,
        c.name as city_name,
        c.country
      FROM walk_trips wt
      JOIN guides g ON wt.guide_id = g.id
      JOIN users u ON g.user_id = u.id
      JOIN cities c ON wt.city_id = c.id
      WHERE wt.active = true AND g.is_active = true
      ORDER BY wt.title
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get walk trips error:', err)
    return errorResponse('Internal server error', 500)
  }
}
