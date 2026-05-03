import { Pool } from 'pg'

const COCKROACHDB_URL = 'postgresql://rafael:31_EBCvdgSVruOzZj2pvtA@nylon-fawn-25684.j77.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'

console.log('Connecting...')

const pool = new Pool({
  connectionString: COCKROACHDB_URL,
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
