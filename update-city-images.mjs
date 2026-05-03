import { Pool } from 'pg'

const COCKROACHDB_URL = 'postgresql://rafael:HVkz0wev0rHWmggduT3v7w@nylon-fawn-25684.j77.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'

const pool = new Pool({
  connectionString: COCKROACHDB_URL,
  ssl: { rejectUnauthorized: false }
})

async function updateCityImages() {
  try {
    console.log('Updating city cover images...')
    
    // Prague - use Unsplash image (from HowItWorks.jsx line 66)
    const pragueImg = 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80'
    const pragueResult = await pool.query(
      `UPDATE cities SET cover_image_url = $1 WHERE name = 'Prague' RETURNING *`,
      [pragueImg]
    )
    console.log('✓ Prague updated:', pragueResult.rows[0]?.cover_image_url || 'No change')
    
    // Rome - use Unsplash image (from HowItWorks.jsx line 67)
    const romeImg = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80'
    const romeResult = await pool.query(
      `UPDATE cities SET cover_image_url = $1 WHERE name = 'Rome' RETURNING *`,
      [romeImg]
    )
    console.log('✓ Rome updated:', romeResult.rows[0]?.cover_image_url || 'No change')
    
    // Taghazout - use local image (from HowItWorks.jsx line 7)
    const taghazoutImg = 'https://images.unsplash.com/photo-1502680390469-be582b836c6b?w=800&q=80'
    const taghazoutResult = await pool.query(
      `UPDATE cities SET cover_image_url = $1 WHERE name = 'Taghazout' RETURNING *`,
      [taghazoutImg]
    )
    console.log('✓ Taghazout updated:', taghazoutResult.rows[0]?.cover_image_url || 'No change')
    
    // Dresden - use local image (from HowItWorks.jsx line 8)
    const dresdenImg = 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80'
    const dresdenResult = await pool.query(
      `UPDATE cities SET cover_image_url = $1 WHERE name = 'Dresden' RETURNING *`,
      [dresdenImg]
    )
    console.log('✓ Dresden updated:', dresdenResult.rows[0]?.cover_image_url || 'No change')
    
    // Verify all cities have images
    console.log('\n--- Verification ---')
    const verifyResult = await pool.query('SELECT name, country, cover_image_url FROM cities ORDER BY name')
    verifyResult.rows.forEach(c => {
      console.log(`  ${c.name} (${c.country}): ${c.cover_image_url ? '✓ Has image' : '✗ No image'}`)
    })
    
    console.log('\n✅ Update completed!')
    await pool.end()
    process.exit(0)
    
  } catch (err) {
    console.error('Error:', err.message)
    await pool.end()
    process.exit(1)
  }
}

updateCityImages()
