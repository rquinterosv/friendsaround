const { query, getClient } = require('../lib/db.js')
const cloudinary = require('../lib/cloudinary.js')
const { verifyToken } = require('../lib/firebase-admin.js')

// Helper to verify auth token from request
async function withAuth(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 }
  }
  
  const token = authHeader.split('Bearer ')[1]
  const decoded = await verifyToken(token)
  
  if (!decoded) {
    return { error: 'Invalid or expired token', status: 401 }
  }
  
  return { user: decoded }
}

// Helper to check if user is admin
async function isAdmin(user) {
  const result = await query(
    'SELECT role FROM users WHERE firebase_uid = $1',
    [user.uid]
  )
  return result.rows[0]?.role === 'admin'
}

// Helper to check if user is guide
async function isGuide(user) {
  const result = await query(
    'SELECT role FROM users WHERE firebase_uid = $1',
    [user.uid]
  )
  return result.rows[0]?.role === 'guide'
}

// Standard response helpers
function successResponse(data, status = 200) {
  return new Response(
    JSON.stringify({ success: true, data }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}

function errorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}

// Router function
async function handler(request) {
const url = new URL(request.url, `https://${request.headers.get('host')}`)
const pathname = url.pathname
const method = request.method

  // Parse route parameters
  let match

  // POST /api/users/sync
  if (pathname === '/api/users/sync' && method === 'POST') {
    return handleUsersSync(request)
  }

  // GET /api/users/:id
  match = pathname.match(/^\/api\/users\/([^/]+)$/)
  if (match && method === 'GET') {
    return handleGetUser(request, match[1])
  }

  // PATCH /api/users/:id
  match = pathname.match(/^\/api\/users\/([^/]+)$/)
  if (match && method === 'PATCH') {
    return handleUpdateUser(request, match[1])
  }

  // POST /api/upload/avatar
  if (pathname === '/api/upload/avatar' && method === 'POST') {
    return handleUploadAvatar(request)
  }

  // POST /api/upload/trip-image
  if (pathname === '/api/upload/trip-image' && method === 'POST') {
    return handleUploadTripImage(request)
  }

  // GET /api/cities
  if (pathname === '/api/cities' && method === 'GET') {
    return handleGetCities(request)
  }

  // POST /api/guide-applications
  if (pathname === '/api/guide-applications' && method === 'POST') {
    return handleCreateGuideApplication(request)
  }

  // GET /api/guide-applications
  if (pathname === '/api/guide-applications' && method === 'GET') {
    return handleGetGuideApplications(request)
  }

  // PATCH /api/guide-applications/:id/approve
  match = pathname.match(/^\/api\/guide-applications\/([^/]+)\/approve$/)
  if (match && method === 'PATCH') {
    return handleApproveGuideApplication(request, match[1])
  }

  // PATCH /api/guide-applications/:id/reject
  match = pathname.match(/^\/api\/guide-applications\/([^/]+)\/reject$/)
  if (match && method === 'PATCH') {
    return handleRejectGuideApplication(request, match[1])
  }

  // GET /api/guides
  if (pathname === '/api/guides' && method === 'GET') {
    return handleGetGuides(request)
  }

  // GET /api/guides/:id
  match = pathname.match(/^\/api\/guides\/([^/]+)$/)
  if (match && method === 'GET') {
    return handleGetGuide(request, match[1])
  }

  // PATCH /api/guides/:id
  match = pathname.match(/^\/api\/guides\/([^/]+)$/)
  if (match && method === 'PATCH') {
    return handleUpdateGuide(request, match[1])
  }

  // GET /api/walk-trips
  if (pathname === '/api/walk-trips' && method === 'GET') {
    return handleGetWalkTrips(request)
  }

  // GET /api/walk-trips/:id
  match = pathname.match(/^\/api\/walk-trips\/([^/]+)$/)
  if (match && method === 'GET') {
    return handleGetWalkTrip(request, match[1])
  }

  // PATCH /api/walk-trips/:id
  match = pathname.match(/^\/api\/walk-trips\/([^/]+)$/)
  if (match && method === 'PATCH') {
    return handleUpdateWalkTrip(request, match[1])
  }

  // POST /api/walk-trips/:id/dates
  match = pathname.match(/^\/api\/walk-trips\/([^/]+)\/dates$/)
  if (match && method === 'POST') {
    return handleAddWalkTripDate(request, match[1])
  }

  // DELETE /api/walk-trips/:id/dates/:dateId
  match = pathname.match(/^\/api\/walk-trips\/([^/]+)\/dates\/([^/]+)$/)
  if (match && method === 'DELETE') {
    return handleDeleteWalkTripDate(request, match[1], match[2])
  }

  // GET /api/day-trips
  if (pathname === '/api/day-trips' && method === 'GET') {
    return handleGetDayTrips(request)
  }

  // GET /api/day-trips/:id
  match = pathname.match(/^\/api\/day-trips\/([^/]+)$/)
  if (match && method === 'GET') {
    return handleGetDayTrip(request, match[1])
  }

  // PATCH /api/day-trips/:id
  match = pathname.match(/^\/api\/day-trips\/([^/]+)$/)
  if (match && method === 'PATCH') {
    return handleUpdateDayTrip(request, match[1])
  }

  // GET /api/week-trips
  if (pathname === '/api/week-trips' && method === 'GET') {
    return handleGetWeekTrips(request)
  }

  // GET /api/week-trips/:id
  match = pathname.match(/^\/api\/week-trips\/([^/]+)$/)
  if (match && method === 'GET') {
    return handleGetWeekTrip(request, match[1])
  }

  // POST /api/week-trips/:id/dates
  match = pathname.match(/^\/api\/week-trips\/([^/]+)\/dates$/)
  if (match && method === 'POST') {
    return handleAddWeekTripDate(request, match[1])
  }

  // DELETE /api/week-trips/:id/dates/:dateId
  match = pathname.match(/^\/api\/week-trips\/([^/]+)\/dates\/([^/]+)$/)
  if (match && method === 'DELETE') {
    return handleDeleteWeekTripDate(request, match[1], match[2])
  }

  // POST /api/bookings
  if (pathname === '/api/bookings' && method === 'POST') {
    return handleCreateBooking(request)
  }

  // GET /api/bookings/my
  if (pathname === '/api/bookings/my' && method === 'GET') {
    return handleGetMyBookings(request)
  }

  // PATCH /api/bookings/:id/cancel
  match = pathname.match(/^\/api\/bookings\/([^/]+)\/cancel$/)
  if (match && method === 'PATCH') {
    return handleCancelBooking(request, match[1])
  }

  // GET /api/reviews
  if (pathname === '/api/reviews' && method === 'GET') {
    return handleGetReviews(request)
  }

  // POST /api/reviews
  if (pathname === '/api/reviews' && method === 'POST') {
    return handleCreateReview(request)
  }

  return errorResponse('Route not found', 404)
}

// ==================== USERS ====================

async function handleUsersSync(request) {
  try {
    const { firebase_uid, email, full_name } = await request.json()
    
    if (!firebase_uid || !email) {
      return errorResponse('firebase_uid and email are required', 400)
    }

    const existing = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    )

    if (existing.rows.length > 0) {
      const result = await query(
        `UPDATE users SET email = $1, full_name = $2 WHERE firebase_uid = $3 RETURNING *`,
        [email, full_name, firebase_uid]
      )
      return successResponse(result.rows[0])
    } else {
      const result = await query(
        `INSERT INTO users (firebase_uid, email, full_name) VALUES ($1, $2, $3) RETURNING *`,
        [firebase_uid, email, full_name]
      )
      return successResponse(result.rows[0], 201)
    }
  } catch (err) {
    console.error('User sync error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleGetUser(request, id) {
  try {
    const result = await query(
      `SELECT id, full_name, avatar_url, visited_countries, created_at, role FROM users WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return errorResponse('User not found', 404)
    }

    const user = result.rows[0]

    if (user.role === 'guide') {
      const guideResult = await query(
        `SELECT g.*, wt.*, dt.*, c.name as city_name, c.country 
         FROM guides g 
         LEFT JOIN walk_trips wt ON g.id = wt.guide_id 
         LEFT JOIN day_trips dt ON g.id = dt.guide_id 
         LEFT JOIN cities c ON g.city_id = c.id 
         WHERE g.user_id = $1 AND g.is_active = true`,
        [id]
      )
      user.guide_profile = guideResult.rows[0] || null
    }

    return successResponse(user)
  } catch (err) {
    console.error('Get user error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleUpdateUser(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const userCheck = await query(
      'SELECT * FROM users WHERE id = $1 AND firebase_uid = $2',
      [id, auth.user.uid]
    )

    if (userCheck.rows.length === 0) {
      return errorResponse('Unauthorized', 403)
    }

    const { full_name, visited_countries } = await request.json()
    const updates = []
    const values = []
    let idx = 1

    if (full_name !== undefined) {
      updates.push(`full_name = $${idx++}`)
      values.push(full_name)
    }
    if (visited_countries !== undefined) {
      updates.push(`visited_countries = $${idx++}`)
      values.push(visited_countries)
    }

    if (updates.length === 0) {
      return errorResponse('No valid fields to update', 400)
    }

    values.push(id)
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    return successResponse(result.rows[0])
  } catch (err) {
    console.error('Update user error:', err)
    return errorResponse('Internal server error', 500)
  }
}

// ==================== UPLOAD ====================

async function handleUploadAvatar(request) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = formData.get('user_id')

    if (!file) {
      return errorResponse('No file uploaded', 400)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: `driftertrip/avatars/${userId || auth.user.uid}`,
      public_id: `avatar_${Date.now()}`,
      overwrite: true,
    })

    const dbResult = await query(
      'UPDATE users SET avatar_url = $1 WHERE firebase_uid = $2 RETURNING *',
      [result.secure_url, auth.user.uid]
    )

    if (dbResult.rows.length === 0) {
      return errorResponse('User not found', 404)
    }

    return successResponse({ 
      avatar_url: result.secure_url,
      user: dbResult.rows[0] 
    })
  } catch (err) {
    console.error('Avatar upload error:', err)
    return errorResponse('Upload failed', 500)
  }
}

async function handleUploadTripImage(request) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const guideCheck = await isGuide(auth.user)
  if (!guideCheck) {
    return errorResponse('Only guides can upload trip images', 403)
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const tripType = formData.get('trip_type')
    const tripId = formData.get('trip_id')

    if (!file || !tripType || !tripId) {
      return errorResponse('Missing required fields: file, trip_type, trip_id', 400)
    }

    if (!['walk', 'day'].includes(tripType)) {
      return errorResponse('trip_type must be "walk" or "day"', 400)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: `driftertrip/trips/${tripId}`,
      public_id: `${tripType}_cover_${Date.now()}`,
      overwrite: true,
    })

    const table = tripType === 'walk' ? 'walk_trips' : 'day_trips'
    const result = await query(
      `UPDATE ${table} SET cover_image_url = $1 WHERE id = $2 RETURNING *`,
      [uploadResult.secure_url, tripId]
    )

    if (result.rows.length === 0) {
      return errorResponse('Trip not found', 404)
    }

    return successResponse({ 
      cover_image_url: uploadResult.secure_url,
      trip: result.rows[0] 
    })
  } catch (err) {
    console.error('Trip image upload error:', err)
    return errorResponse('Upload failed', 500)
  }
}

// ==================== CITIES ====================

async function handleGetCities(request) {
  try {
    console.log('COCKROACHDB_URL exists:', !!process.env.COCKROACHDB_URL)
    console.log('COCKROACHDB_URL length:', process.env.COCKROACHDB_URL?.length)
    
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
    console.error('Get cities error:', err.message, err.stack)
    return errorResponse('Internal server error', 500)
  }
}

// ==================== GUIDE APPLICATIONS ====================

async function handleCreateGuideApplication(request) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { city_id, tour_title, tour_summary } = await request.json()

    if (!city_id || !tour_title || !tour_summary) {
      return errorResponse('city_id, tour_title, and tour_summary are required', 400)
    }

    const userResult = await query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [auth.user.uid]
    )

    if (userResult.rows.length === 0) {
      return errorResponse('User not found', 404)
    }

    const userId = userResult.rows[0].id

    const existingApp = await query(
      `SELECT * FROM guide_applications WHERE user_id = $1 AND status IN ('pending', 'approved')`,
      [userId]
    )

    if (existingApp.rows.length > 0) {
      return errorResponse('You already have a pending or approved application', 400)
    }

    const result = await query(
      `INSERT INTO guide_applications (user_id, city_id, tour_title, tour_summary) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, city_id, tour_title, tour_summary]
    )

    return successResponse(result.rows[0], 201)
  } catch (err) {
    console.error('Guide application error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleGetGuideApplications(request) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const adminCheck = await isAdmin(auth.user)
  if (!adminCheck) {
    return errorResponse('Unauthorized - admin only', 403)
  }

  try {
    const result = await query(`
      SELECT ga.*, u.full_name, u.email, c.name as city_name, c.country
      FROM guide_applications ga
      JOIN users u ON ga.user_id = u.id
      JOIN cities c ON ga.city_id = c.id
      WHERE ga.status = 'pending'
      ORDER BY ga.created_at DESC
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get applications error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleApproveGuideApplication(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const adminCheck = await isAdmin(auth.user)
  if (!adminCheck) {
    return errorResponse('Unauthorized - admin only', 403)
  }

  const client = await getClient()

  try {
    await client.query('BEGIN')

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

    const guideResult = await client.query(
      `INSERT INTO guides (user_id, city_id, bio) VALUES ($1, $2, $3) RETURNING *`,
      [app.user_id, app.city_id, '']
    )

    const guide = guideResult.rows[0]

    await client.query(
      `INSERT INTO walk_trips (guide_id, city_id, title, description) VALUES ($1, $2, $3, $4)`,
      [guide.id, app.city_id, app.tour_title, app.tour_summary]
    )

    await client.query(
      "UPDATE users SET role = 'guide' WHERE id = $1",
      [app.user_id]
    )

    await client.query(
      `UPDATE guide_applications SET status = 'approved', reviewed_at = now() WHERE id = $1`,
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

async function handleRejectGuideApplication(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const adminCheck = await isAdmin(auth.user)
  if (!adminCheck) {
    return errorResponse('Unauthorized - admin only', 403)
  }

  try {
    const { admin_notes } = await request.json()

    const result = await query(
      `UPDATE guide_applications SET status = 'rejected', admin_notes = $1, reviewed_at = now() WHERE id = $2 AND status = 'pending' RETURNING *`,
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

// ==================== GUIDES ====================

async function handleGetGuides(request) {
  try {
    const result = await query(`
      SELECT 
        g.*,
        u.full_name,
        u.avatar_url,
        c.name as city_name,
        c.country,
        wt.title as walk_trip_title,
        wt.description as walk_trip_desc,
        wt.duration,
        wt.meeting_point,
        wt.cover_image_url as walk_trip_image,
        dt.title as day_trip_title,
        dt.price as day_trip_price
      FROM guides g
      JOIN users u ON g.user_id = u.id
      LEFT JOIN cities c ON g.city_id = c.id
      LEFT JOIN walk_trips wt ON g.id = wt.guide_id AND wt.active = true
      LEFT JOIN day_trips dt ON g.id = dt.guide_id AND dt.active = true
      WHERE g.is_active = true
      ORDER BY u.full_name
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get guides error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleGetGuide(request, id) {
  try {
    const result = await query(`
      SELECT 
        g.*,
        u.full_name,
        u.avatar_url,
        u.visited_countries,
        c.name as city_name,
        c.country,
        wt.*,
        dt.*,
        (
          SELECT json_agg(json_build_object(
            'id', ad.id,
            'date', ad.date,
            'max_capacity', ad.max_capacity,
            'spots_taken', ad.spots_taken
          ))
          FROM available_dates ad
          WHERE ad.trip_id = wt.id AND ad.trip_type = 'walk'
        ) as available_dates
      FROM guides g
      JOIN users u ON g.user_id = u.id
      LEFT JOIN cities c ON g.city_id = c.id
      LEFT JOIN walk_trips wt ON g.id = wt.guide_id AND wt.active = true
      LEFT JOIN day_trips dt ON g.id = dt.guide_id AND dt.active = true
      WHERE g.id = $1 AND g.is_active = true
    `, [id])

    if (result.rows.length === 0) {
      return errorResponse('Guide not found', 404)
    }

    return successResponse(result.rows[0])
  } catch (err) {
    console.error('Get guide error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleUpdateGuide(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const guideCheck = await query(
      'SELECT * FROM guides WHERE id = $1 AND user_id = (SELECT id FROM users WHERE firebase_uid = $2)',
      [id, auth.user.uid]
    )

    if (guideCheck.rows.length === 0) {
      return errorResponse('Unauthorized - not your profile', 403)
    }

    const { bio } = await request.json()

    if (bio === undefined) {
      return errorResponse('No valid fields to update', 400)
    }

    const result = await query(
      'UPDATE guides SET bio = $1 WHERE id = $2 RETURNING *',
      [bio, id]
    )

    return successResponse(result.rows[0])
  } catch (err) {
    console.error('Update guide error:', err)
    return errorResponse('Internal server error', 500)
  }
}

// ==================== WALK TRIPS ====================

async function handleGetWalkTrips(request) {
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

async function handleGetWalkTrip(request, id) {
  try {
    const result = await query(`
      SELECT 
        wt.*,
        g.id as guide_id,
        g.bio as guide_bio,
        u.full_name as guide_name,
        u.avatar_url as guide_avatar,
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
          WHERE ad.trip_id = wt.id AND ad.trip_type = 'walk'
        ) as available_dates
      FROM walk_trips wt
      JOIN guides g ON wt.guide_id = g.id
      JOIN users u ON g.user_id = u.id
      JOIN cities c ON wt.city_id = c.id
      WHERE wt.id = $1
    `, [id])

    if (result.rows.length === 0) {
      return errorResponse('Walk trip not found', 404)
    }

    return successResponse(result.rows[0])
  } catch (err) {
    console.error('Get walk trip error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleUpdateWalkTrip(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const tripCheck = await query(`
      SELECT wt.* FROM walk_trips wt
      JOIN guides g ON wt.guide_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE wt.id = $1 AND u.firebase_uid = $2
    `, [id, auth.user.uid])

    if (tripCheck.rows.length === 0) {
      return errorResponse('Unauthorized - not your trip', 403)
    }

    const { title, description, duration, meeting_point, active } = await request.json()
    const updates = []
    const values = []
    let idx = 1

    if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title) }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description) }
    if (duration !== undefined) { updates.push(`duration = $${idx++}`); values.push(duration) }
    if (meeting_point !== undefined) { updates.push(`meeting_point = $${idx++}`); values.push(meeting_point) }
    if (active !== undefined) { updates.push(`active = $${idx++}`); values.push(active) }

    if (updates.length === 0) {
      return errorResponse('No valid fields to update', 400)
    }

    values.push(id)
    const result = await query(
      `UPDATE walk_trips SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    return successResponse(result.rows[0])
  } catch (err) {
    console.error('Update walk trip error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleAddWalkTripDate(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const tripCheck = await query(`
      SELECT wt.* FROM walk_trips wt
      JOIN guides g ON wt.guide_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE wt.id = $1 AND u.firebase_uid = $2
    `, [id, auth.user.uid])

    if (tripCheck.rows.length === 0) {
      return errorResponse('Unauthorized - not your trip', 403)
    }

    const { date, max_capacity } = await request.json()

    if (!date) {
      return errorResponse('Date is required', 400)
    }

    const result = await query(
      `INSERT INTO available_dates (trip_type, trip_id, date, max_capacity) VALUES ('walk', $1, $2, $3) RETURNING *`,
      [id, date, max_capacity || 6]
    )

    return successResponse(result.rows[0], 201)
  } catch (err) {
    console.error('Add walk trip date error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleDeleteWalkTripDate(request, id, dateId) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const tripCheck = await query(`
      SELECT wt.* FROM walk_trips wt
      JOIN guides g ON wt.guide_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE wt.id = $1 AND u.firebase_uid = $2
    `, [id, auth.user.uid])

    if (tripCheck.rows.length === 0) {
      return errorResponse('Unauthorized - not your trip', 403)
    }

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

    await query('DELETE FROM available_dates WHERE id = $1', [dateId])

    return successResponse({ message: 'Date deleted successfully' })
  } catch (err) {
    console.error('Delete walk trip date error:', err)
    return errorResponse('Internal server error', 500)
  }
}

// ==================== DAY TRIPS ====================

async function handleGetDayTrips(request) {
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
      WHERE dt.active = true AND g.is_active = true
      ORDER BY dt.title
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get day trips error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleGetDayTrip(request, id) {
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

async function handleUpdateDayTrip(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
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

// ==================== WEEK TRIPS ====================

async function handleGetWeekTrips(request) {
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

async function handleGetWeekTrip(request, id) {
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

async function handleAddWeekTripDate(request, id) {
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
      `INSERT INTO available_dates (trip_type, trip_id, date, max_capacity) VALUES ('week', $1, $2, $3) RETURNING *`,
      [id, date, max_capacity || 8]
    )

    return successResponse(result.rows[0], 201)
  } catch (err) {
    console.error('Add week trip date error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleDeleteWeekTripDate(request, id, dateId) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const adminCheck = await isAdmin(auth.user)
  if (!adminCheck) {
    return errorResponse('Unauthorized - admin only', 403)
  }

  try {
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

    await query('DELETE FROM available_dates WHERE id = $1', [dateId])

    return successResponse({ message: 'Date deleted successfully' })
  } catch (err) {
    console.error('Delete week trip date error:', err)
    return errorResponse('Internal server error', 500)
  }
}

// ==================== BOOKINGS ====================

async function handleCreateBooking(request) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const client = await getClient()

  try {
    await client.query('BEGIN')

    const {
      trip_type,
      trip_id,
      available_date_id,
      group_size,
      notes
    } = await request.json()

    if (!trip_type || !trip_id) {
      await client.query('ROLLBACK')
      return errorResponse('trip_type and trip_id are required', 400)
    }

    if (!['walk', 'day', 'week'].includes(trip_type)) {
      await client.query('ROLLBACK')
      return errorResponse('trip_type must be "walk", "day", or "week"', 400)
    }

    const userResult = await client.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [auth.user.uid]
    )

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return errorResponse('User not found', 404)
    }

    const userId = userResult.rows[0].id

    if (trip_type === 'day' && !available_date_id) {
      const tripResult = await client.query(
        'SELECT booking_type, external_booking_url FROM day_trips WHERE id = $1',
        [trip_id]
      )

      if (tripResult.rows.length > 0 && tripResult.rows[0].booking_type === 'external') {
        await client.query('COMMIT')
        return successResponse({
          external_booking: true,
          external_booking_url: tripResult.rows[0].external_booking_url
        })
      }
    }

    if ((trip_type === 'walk' || trip_type === 'week') && available_date_id) {
      const dateResult = await client.query(
        'SELECT * FROM available_dates WHERE id = $1 AND trip_id = $2 AND trip_type = $3',
        [available_date_id, trip_id, trip_type]
      )

      if (dateResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return errorResponse('Date not found', 404)
      }

      const date = dateResult.rows[0]

      if (date.spots_taken + (group_size || 1) > date.max_capacity) {
        await client.query('ROLLBACK')
        return errorResponse('Not enough spots available', 400)
      }

      await client.query(
        'UPDATE available_dates SET spots_taken = spots_taken + $1 WHERE id = $2',
        [group_size || 1, available_date_id]
      )
    }

    const result = await client.query(
      `INSERT INTO bookings (user_id, trip_type, trip_id, available_date_id, group_size, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, trip_type, trip_id, available_date_id, group_size || 1, notes || null]
    )

    await client.query('COMMIT')

    return successResponse(result.rows[0], 201)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Create booking error:', err)
    return errorResponse('Internal server error', 500)
  } finally {
    client.release()
  }
}

async function handleGetMyBookings(request) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const userResult = await query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [auth.user.uid]
    )

    if (userResult.rows.length === 0) {
      return errorResponse('User not found', 404)
    }

    const userId = userResult.rows[0].id

    const result = await query(`
      SELECT 
        b.*,
        CASE 
          WHEN b.trip_type = 'walk' THEN (SELECT title FROM walk_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'day' THEN (SELECT title FROM day_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'week' THEN (SELECT title FROM week_trips WHERE id = b.trip_id)
        END as trip_title,
        CASE 
          WHEN b.trip_type = 'walk' THEN (SELECT cover_image_url FROM walk_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'day' THEN (SELECT cover_image_url FROM day_trips WHERE id = b.trip_id)
          WHEN b.trip_type = 'week' THEN (SELECT cover_image_url FROM week_trips WHERE id = b.trip_id)
        END as trip_image,
        (SELECT date FROM available_dates WHERE id = b.available_date_id) as booking_date
      FROM bookings b
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [userId])

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get my bookings error:', err)
    return errorResponse('Internal server error', 500)
  }
}

async function handleCancelBooking(request, id) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  const client = await getClient()

  try {
    await client.query('BEGIN')

    const userResult = await client.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [auth.user.uid]
    )

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return errorResponse('User not found', 404)
    }

    const userId = userResult.rows[0].id

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    )

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return errorResponse('Booking not found', 404)
    }

    const booking = bookingResult.rows[0]

    if (booking.user_id !== userId) {
      await client.query('ROLLBACK')
      return errorResponse('Unauthorized - not your booking', 403)
    }

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK')
      return errorResponse('Booking already cancelled', 400)
    }

    if ((booking.trip_type === 'walk' || booking.trip_type === 'week') && booking.available_date_id) {
      await client.query(
        'UPDATE available_dates SET spots_taken = spots_taken - $1 WHERE id = $2',
        [booking.group_size, booking.available_date_id]
      )
    }

    const result = await client.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    )

    await client.query('COMMIT')

    return successResponse(result.rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Cancel booking error:', err)
    return errorResponse('Internal server error', 500)
  } finally {
    client.release()
  }
}

// ==================== REVIEWS ====================

async function handleGetReviews(request) {
  try {
    console.log('COCKROACHDB_URL exists:', !!process.env.COCKROACHDB_URL)
    console.log('COCKROACHDB_URL length:', process.env.COCKROACHDB_URL?.length)
    
    const result = await query(`
      SELECT 
        r.*,
        u.full_name,
        u.avatar_url,
        u.visited_countries
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `)

    return successResponse(result.rows)
  } catch (err) {
    console.error('Get reviews error:', err.message, err.stack)
    return errorResponse('Internal server error', 500)
  }
}

async function handleCreateReview(request) {
  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const { content, city } = await request.json()

    if (!content) {
      return errorResponse('Review content is required', 400)
    }

    const userResult = await query(
      'SELECT id, role FROM users WHERE firebase_uid = $1',
      [auth.user.uid]
    )

    if (userResult.rows.length === 0) {
      return errorResponse('User not found', 404)
    }

    const user = userResult.rows[0]

    if (user.role !== 'user') {
      return errorResponse('Only regular users can post reviews', 403)
    }

    const result = await query(
      `INSERT INTO reviews (user_id, content, city) VALUES ($1, $2, $3) RETURNING *`,
      [user.id, content, city || null]
    )

    return successResponse(result.rows[0], 201)
  } catch (err) {
    console.error('Create review error:', err)
    return errorResponse('Internal server error', 500)
  }
}

module.exports = handler
