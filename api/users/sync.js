import { query } from '../../lib/db.js'

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { firebase_uid, email, full_name } = await request.json()
    
    if (!firebase_uid || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'firebase_uid and email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if user exists
    const existing = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    )

    if (existing.rows.length > 0) {
      // Update existing user
      const result = await query(
        `UPDATE users 
         SET email = $1, full_name = $2 
         WHERE firebase_uid = $3 
         RETURNING *`,
        [email, full_name, firebase_uid]
      )
      return new Response(
        JSON.stringify({ success: true, data: result.rows[0] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      // Create new user
      const result = await query(
        `INSERT INTO users (firebase_uid, email, full_name) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [firebase_uid, email, full_name]
      )
      return new Response(
        JSON.stringify({ success: true, data: result.rows[0] }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (err) {
    console.error('User sync error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
