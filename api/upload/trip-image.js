import cloudinary from '../../lib/cloudinary.js'
import { query } from '../../lib/db.js'
import { withAuth, isGuide, successResponse, errorResponse } from '../../lib/_middleware.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

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

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: `driftertrip/trips/${tripId}`,
      public_id: `${tripType}_cover_${Date.now()}`,
      overwrite: true,
    })

    // Update the appropriate trip table
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
