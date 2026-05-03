#!/usr/bin/env node

// Seed data script for Drifter Trip
// Run: node seed-data.cjs

require('dotenv').config({ path: '.env' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.COOCKROACHDB_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function seedData() {
  const client = await pool.connect()
  
  try {
    console.log('Starting data seed...')
    
    // Get existing cities (Prague and Rome should already exist)
    const citiesResult = await client.query('SELECT * FROM cities')
    console.log('Existing cities:', citiesResult.rows)
    
    let pragueId, romeId, taghazoutId, dresdenId
    
    // Find Prague
    const prague = citiesResult.rows.find(c => c.name === 'Prague')
    if (prague) {
      pragueId = prague.id
      console.log('Found Prague:', pragueId)
    }
    
    // Find Rome
    const rome = citiesResult.rows.find(c => c.name === 'Rome')
    if (rome) {
      romeId = rome.id
      console.log('Found Rome:', romeId)
    }
    
    // Insert Taghazout
    const taghazoutResult = await client.query(`
      INSERT INTO cities (name, country) 
      VALUES ('Taghazout', 'Morocco') 
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
      RETURNING id
    `)
    taghazoutId = taghazoutResult.rows[0].id
    console.log('Taghazout ID:', taghazoutId)
    
    // Insert Dresden
    const dresdenResult = await client.query(`
      INSERT INTO cities (name, country) 
      VALUES ('Dresden', 'Germany') 
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
      RETURNING id
    `)
    dresdenId = dresdenResult.rows[0].id
    console.log('Dresden ID:', dresdenId)
    
    // Insert Day Trip for Prague
    if (pragueId) {
      await client.query(`
        INSERT INTO day_trips (
          city_id, title, description, price, duration, difficulty, 
          departure_city, highlights, included, what_to_bring, good_to_know,
          booking_type, active
        ) VALUES (
          $1, 
          'Full-Day Hiking in Bohemian & Saxon Switzerland',
          'Leave the city behind and set off on an unforgettable hiking adventure through one of Central Europe most breathtaking natural regions.',
          150.00,
          'Full day',
          'Moderate',
          'Prague',
          ARRAY['Bastei Bridge', 'Pravčická Arch', 'Wild Gorge boat ride'],
          ARRAY['Hotel pick-up & drop-off', 'National park entry fees', 'Round-trip transport', 'Full lunch', 'Professional guide'],
          ARRAY['Valid passport or ID', 'Hiking shoes', 'Weather-appropriate clothing', 'Water and snacks'],
          ARRAY['Not suitable for children under 7', 'Tour may vary due to weather', 'No drones allowed', 'Pick-up details sent evening before'],
          'form',
          true
        )
        ON CONFLICT (title) DO NOTHING
      `, [pragueId])
      console.log('✓ Prague day trip inserted')
    }
    
    // Insert Day Trip for Dresden
    if (dresdenId) {
      await client.query(`
        INSERT INTO day_trips (
          city_id, title, description, price, duration, difficulty, 
          departure_city, highlights, included, what_to_bring, good_to_know,
          booking_type, active
        ) VALUES (
          $1, 
          'Full-Day Hiking Adventure in Bohemian and Saxon Switzerland',
          130.00,
          'Full day',
          'Moderate',
          'Dresden',
          ARRAY['Bastei Bridge', 'Pravčická Arch', 'Wild Gorge boat ride'],
          ARRAY['Hotel pick-up & drop-off', 'National park entry fees', 'Round-trip transport', 'Full lunch', 'Professional guide'],
          ARRAY['Valid passport or ID', 'Hiking shoes', 'Weather-appropriate clothing', 'Water and snacks'],
          ARRAY['Not suitable for children under 7', 'Tour may vary due to weather', 'No drones allowed', 'Pick-up details sent evening before'],
          'form',
          true
        )
        ON CONFLICT (title) DO NOTHING
      `, [dresdenId])
      console.log('✓ Dresden day trip inserted')
    }
    
    // Insert Week Trip for Taghazout
    if (taghazoutId) {
      const itinerary = {
        "day1": ["Airport pick-up", "Check-in + Welcome tea", "Sunset beach walk", "Traditional Moroccan dinner"],
        "day2": ["Moroccan breakfast", "Surf lesson 2h", "Lunch", "Free surfing 2h", "Dinner"],
        "day3": ["Moroccan breakfast", "Paradise Valley trip (optional)", "Lunch", "Free surfing 2h", "Dinner"],
        "day4": ["Moroccan breakfast", "Surf lesson 2h", "Lunch", "Free surfing 2h", "Dinner"],
        "day5": ["Moroccan breakfast", "Surf lesson 2h", "Lunch", "Free surfing 2h", "Cooking class (optional)"],
        "day6": ["Moroccan breakfast", "Surf lesson 2h", "Lunch", "Free surfing 2h", "Farewell dinner"],
        "day7": ["Moroccan breakfast", "Airport drop-off"]
      }
      
      await client.query(`
        INSERT INTO week_trips (
          city_id, title, description, price, duration_days, 
          highlights, included, itinerary, max_capacity, active
        ) VALUES (
          $1,
          'One Week in Morocco — Surf, Sun & Culture',
          'Experience the perfect week of surfing, culture, and relaxation in beautiful Taghazout, Morocco.',
          600.00,
          7,
          ARRAY['Daily surf lessons', 'Paradise Valley', 'Moroccan cuisine', 'Local culture'],
          ARRAY['Airport transfers', 'Accommodation', 'Daily breakfast & dinners', 'Surf coaching', 'Board & wetsuit'],
          $2,
          8,
          true
        )
        ON CONFLICT (title) DO NOTHING
      `, [taghazoutId, JSON.stringify(itinerary)])
      console.log('✓ Taghazout week trip inserted')
    }
    
    // Verify data
    console.log('\n--- Verification ---')
    
    const citiesCheck = await client.query(`
      SELECT c.*, 
        COUNT(DISTINCT wt.id) FILTER (WHERE wt.active = true) as walk_count,
        COUNT(DISTINCT dt.id) FILTER (WHERE dt.active = true) as day_count,
        COUNT(DISTINCT wk.id) FILTER (WHERE wk.active = true) as week_count
      FROM cities c
      LEFT JOIN walk_trips wt ON c.id = wt.city_id
      LEFT JOIN day_trips dt ON c.id = dt.city_id
      LEFT JOIN week_trips wk ON c.id = wk.city_id
      GROUP BY c.id
    `)
    
    console.log('\nCities with service counts:')
    citiesCheck.rows.forEach(c => {
      const total = parseInt(c.walk_count) + parseInt(c.day_count) + parseInt(c.week_count)
      console.log(`  ${c.name} (${c.country}): ${c.walk_count} walk, ${c.day_count} day, ${c.week_count} week = ${total} total services ${total > 0 ? '✓ ACTIVE' : '✗ Coming soon'}`)
    })
    
    console.log('\n✅ Seed completed successfully!')
    
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seedData()
