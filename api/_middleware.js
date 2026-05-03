import { verifyToken } from '../lib/firebase-admin.js'

// Helper to verify auth token from request
export async function withAuth(request) {
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
export async function isAdmin(user) {
  const { query } = await import('../lib/db.js')
  const result = await query(
    'SELECT role FROM users WHERE firebase_uid = $1',
    [user.uid]
  )
  return result.rows[0]?.role === 'admin'
}

// Helper to check if user is guide
export async function isGuide(user) {
  const { query } = await import('../lib/db.js')
  const result = await query(
    'SELECT role FROM users WHERE firebase_uid = $1',
    [user.uid]
  )
  return result.rows[0]?.role === 'guide'
}

// Standard response helper
export function successResponse(data, status = 200) {
  return new Response(
    JSON.stringify({ success: true, data }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}

export function errorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}
