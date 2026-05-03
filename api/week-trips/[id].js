import { query } from '../../../../../../lib/db.js'
import { successResponse, errorResponse } from '../../../../../../lib/_middleware.js'

export default async function handler(request, { params }) {
  const { id } = params

  if (!id) {
    return errorResponse('Week trip ID is required', 400)
  }

  if (request.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          wt.*,
          c.name as city_name,
          c.country,
          (
            SELECT json_agg(json_build_object(
              'id', ad.id,
              'date', ad.date,
              'max_capacity', ad.max_capacity,
              'spots_taken', ad.spots_taken
            ))
            FROM available_dates ad
            WHERE ad.trip_id = wt.id AND ad.trip_type = 'week'
          ) as available_dates
        FROM week_trips wt
        JOIN cities c ON wt.city_id = c.id
        WHERE wt.id = $1
      `, [id])

      if (result.rows.length === 0) {
        return errorResponse('Week trip not found', 404)
      }

      return successResponse(result.rows[0])
    } catch (err) {
      console.error('Get week trip error:', err)
      return errorResponse('Internal server error', 500)
    }
  }

  return errorResponse('Method not allowed', 405)
}
