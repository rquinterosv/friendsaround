import { config } from 'dotenv'
import { resolve } from 'path'
import { Pool } from 'pg'

config({ path: resolve('C:\Users\rafae\Documents\friendsaround\.env') })

console.log('URL loaded:', process.env.COOCKROACHDB_URL ? 'YES' : 'NO')

const pool = new Pool({
  connectionString: process.env.COOCKROACHDB_URL,
  ssl: { rejectUnauthorized: false }
})

try {
  const result = await pool.query('SELECT name, country FROM cities')
  console.log('Cities:')
  result.rows.forEach(c => console.log(`  ${c.name} (${c.country})`))
  await pool.end()
  process.exit(0)
} catch (err) {
  console.error('Error:', err.message)
  await pool.end()
  process.exit(1)
}
