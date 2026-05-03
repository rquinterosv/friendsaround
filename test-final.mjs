import { Pool } from 'pg'

const COCKROACHDB_URL = 'postgresql://rafael:HVkz0wev0rHWmggduT3v7w@nylon-fawn-25684.j77.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'

console.log('Connecting...')

const pool = new Pool({
  connectionString: COCKROACHDB_URL,
  ssl: { rejectUnauthorized: false }
})

try {
  const result = await pool.query('SELECT name, country FROM cities')
  console.log('✓ Connected!')
  console.log('Cities:')
  result.rows.forEach(c => console.log(`  ${c.name} (${c.country})`))
  await pool.end()
  process.exit(0)
} catch (err) {
  console.error('Connection failed:', err.message)
  await pool.end()
  process.exit(1)
}
