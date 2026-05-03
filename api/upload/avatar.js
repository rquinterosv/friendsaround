import cloudinary from '../../lib/cloudinary.js'
import { query } from '../../lib/db.js'
import { withAuth, successResponse, errorResponse } from '../../lib/_middleware.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  const auth = await withAuth(request)
  if (auth.error) return errorResponse(auth.error, auth.status)

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = formData.get('user_id')

    if (!file) {
      return errorResponse('No file uploaded', 400)
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: `driftertrip/avatars/${userId || auth.user.uid}`,
      public_id: `avatar_${Date.now()}`,
      overwrite: true,
    })

    // Update user's avatar_url in database
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
