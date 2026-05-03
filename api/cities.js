import { query } from '../../lib/db.js'
import { successResponse, errorResponse } from '../../lib/_middleware.js'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const result = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT wt.id) FILTER (WHERE wt.active = true) as walk_trips_count,
        COUNT(DISTINCT dt.id) FILTER (WHERE dt.active = true) as day_trips_count,
        COUNT(DISTINCT wk.id) FILTER (WHERE wk.active = true) as week_trips_count
      FROM cities c
      LEFT JOIN walk_trips wt ON c.id = wt.city_id AND wt.active = true
      LEFT JOIN day_trips dt ON c.id = dt.city_id AND dt.active = true  
      LEFT JOIN week_trips wk ON c.id = wk.city_id AND wk.active = true
      WHERE c.active = true
      GROUP BY c.id
      HAVING 
        COUNT(DISTINCT wt.id) FILTER (WHERE wt.active = true) > 0 OR
        COUNT(DISTINCT dt.id) FILTER (WHERE dt.active = true) > 0 OR
        COUNT(DISTINCT wk.id) FILTER (WHERE wk.active = true) > 0
      ORDER BY c.name
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get cities error:', err)
    return errorResponse('Internal server error', 500)
  }
}
