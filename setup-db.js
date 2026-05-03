#!/usr/bin/env node

// Database setup script for Drifter Trip
// Run this script to initialize the database schema

require('dotenv').config({ path: '.env' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.COOCKROACHDB_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const schema = `
  -- Cities table
  CREATE TABLE IF NOT EXISTS cities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR NOT NULL,
    country         VARCHAR NOT NULL,
    cover_image_url VARCHAR,
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT now()
  );

  -- Insert default cities
  INSERT INTO cities (name, country) VALUES ('Prague', 'Czech Republic')
  ON CONFLICT DO NOTHING;

  INSERT INTO cities (name, country) VALUES ('Rome', 'Italy')
  ON CONFLICT DO NOTHING;

  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid      VARCHAR UNIQUE NOT NULL,
    email             VARCHAR UNIQUE NOT NULL,
    full_name         VARCHAR,
    avatar_url        VARCHAR,
    role              VARCHAR DEFAULT 'user',
    visited_countries VARCHAR[],
    created_at        TIMESTAMP DEFAULT now()
  );

  -- Guides table
  CREATE TABLE IF NOT EXISTS guides (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE REFERENCES users(id),
    city_id     UUID REFERENCES cities(id),
    bio         TEXT,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT now()
  );

  -- Walk trips table
  CREATE TABLE IF NOT EXISTS walk_trips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id        UUID UNIQUE REFERENCES guides(id),
    city_id         UUID REFERENCES cities(id),
    title           VARCHAR NOT NULL,
    description     TEXT,
    duration        VARCHAR,
    meeting_point   VARCHAR,
    cover_image_url VARCHAR,
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT now()
  );

  -- Day trips table
  CREATE TABLE IF NOT EXISTS day_trips (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id               UUID REFERENCES cities(id),
    guide_id              UUID REFERENCES guides(id),
    title                 VARCHAR NOT NULL,
    description           TEXT,
    price                 DECIMAL(10,2),
    duration              VARCHAR,
    difficulty            VARCHAR,
    departure_city        VARCHAR,
    highlights            TEXT[],
    included              TEXT[],
    what_to_bring         TEXT[],
    good_to_know          TEXT[],
    cover_image_url       VARCHAR,
    booking_type          VARCHAR DEFAULT 'form',
    external_booking_url  VARCHAR,
    active                BOOLEAN DEFAULT true,
    created_at            TIMESTAMP DEFAULT now()
  );

  -- Week trips table
  CREATE TABLE IF NOT EXISTS week_trips (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id         UUID REFERENCES cities(id),
    title           VARCHAR NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2),
    duration_days   INTEGER,
    highlights      TEXT[],
    included        TEXT[],
    itinerary       JSONB,
    cover_image_url VARCHAR,
    max_capacity    INTEGER DEFAULT 8,
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT now()
  );

  -- Available dates table
  CREATE TABLE IF NOT EXISTS available_dates (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_type     VARCHAR NOT NULL,
    trip_id       UUID NOT NULL,
    date          DATE NOT NULL,
    max_capacity  INTEGER DEFAULT 6,
    spots_taken   INTEGER DEFAULT 0,
    created_at    TIMESTAMP DEFAULT now()
  );

  -- Bookings table
  CREATE TABLE IF NOT EXISTS bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    trip_type           VARCHAR NOT NULL,
    trip_id             UUID NOT NULL,
    available_date_id   UUID REFERENCES available_dates(id),
    group_size          INTEGER DEFAULT 1,
    status              VARCHAR DEFAULT 'pending',
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT now()
  );

  -- Reviews table
  CREATE TABLE IF NOT EXISTS reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    content     TEXT NOT NULL,
    city        VARCHAR,
    created_at  TIMESTAMP DEFAULT now()
  );

  -- Guide applications table
  CREATE TABLE IF NOT EXISTS guide_applications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id),
    city_id       UUID REFERENCES cities(id),
    tour_title    VARCHAR NOT NULL,
    tour_summary  TEXT NOT NULL,
    status        VARCHAR DEFAULT 'pending',
    admin_notes   TEXT,
    created_at    TIMESTAMP DEFAULT now(),
    reviewed_at   TIMESTAMP
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_guides_user_id ON guides(user_id);
  CREATE INDEX IF NOT EXISTS idx_guides_city_id ON guides(city_id);
  CREATE INDEX IF NOT EXISTS idx_walk_trips_guide_id ON walk_trips(guide_id);
  CREATE INDEX IF NOT EXISTS idx_day_trips_guide_id ON day_trips(guide_id);
  CREATE INDEX IF NOT EXISTS idx_day_trips_city_id ON day_trips(city_id);
  CREATE INDEX IF NOT EXISTS idx_week_trips_city_id ON week_trips(city_id);
  CREATE INDEX IF NOT EXISTS idx_available_dates_trip_id ON available_dates(trip_id);
  CREATE INDEX IF NOT EXISTS idx_available_dates_trip_type ON available_dates(trip_type);
  CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_trip_type ON bookings(trip_type);
  CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
  CREATE INDEX IF NOT EXISTS idx_guide_applications_user_id ON guide_applications(user_id);
  CREATE INDEX IF NOT EXISTS idx_guide_applications_status ON guide_applications(status);
`

async function setupDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('Starting database setup...')
    await client.query(schema)
    console.log('Database schema created successfully!')
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('\nCreated tables:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
  } catch (err) {
    console.error('Setup error:', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

setupDatabase()
