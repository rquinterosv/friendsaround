import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://rafael:31_EBCvdgSVruOzZj2pvtA@nylon-fawn-25684.j77.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
  ssl: { rejectUnauthorized: false }
})

async function testCities() {
  try {
    const result = await pool.query(`
      SELECT c.*, 
        COUNT(DISTINCT wt.id) FILTER (WHERE wt.active = true) as walk_count,
        COUNT(DISTINCT dt.id) FILTER (WHERE dt.active = true) as day_count,
        COUNT(DISTINCT wk.id) FILTER (WHERE wk.active = true) as week_count
      FROM cities c
      LEFT JOIN walk_trips wt ON c.id = wt.city_id
      LEFT JOIN day_trips dt ON c.id = dt.city_id
      LEFT JOIN week_trips wk ON c.id = wk.city_id
      GROUP BY c.id
      ORDER BY c.name
    `)
    
    console.log('Cities with service counts:')
    result.rows.forEach(c => {
      const total = parseInt(c.walk_count) + parseInt(c.day_count) + parseInt(c.week_count)
      console.log(`  ${c.name} (${c.country}): ${c.walk_count} walk, ${c.day_count} day, ${c.week_count} week = ${total} services ${total > 0 ? '✓ ACTIVE' : '✗ Coming soon'}`)
    })
    
    await pool.end()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    await pool.end()
    process.exit(1)
  }
}

testCities()
