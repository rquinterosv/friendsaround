import { Pool } from 'pg'

// Create a new Pool for each request (serverless-compatible)
function createPool() {
  return new Pool({
    connectionString: process.env.COCKROACHDB_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 1000
  })
}

export async function query(text, params) {
  const pool = createPool()
  let client
  try {
    client = await pool.connect()
    const result = await client.query(text, params)
    return result
  } catch (err) {
    console.error('Database query error:', err.message, err.stack)
    throw err
  } finally {
    if (client) {
      client.release()
    }
    await pool.end()
  }
}

export async function getClient() {
  const pool = createPool()
  return await pool.connect()
}
