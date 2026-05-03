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
        c.name as city_name,
        c.country
      FROM week_trips wt
      JOIN cities c ON wt.city_id = c.id
      WHERE wt.active = true
      ORDER BY wt.title
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get week trips error:', err)
    return errorResponse('Internal server error', 500)
  }
}
