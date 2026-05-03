import { Pool } from 'pg'

const pool = new Pool({
  host: 'nylon-fawn-25684.j77.aws-eu-central-1.cockroachlabs.cloud',
  port: 26257,
  database: 'defaultdb',
  username: 'rafael',
  password: '31_EBCvDgSVruOzZj2pvtA',
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
