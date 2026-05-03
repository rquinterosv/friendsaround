-- Drifter Trip Database Schema for CockroachDB (PostgreSQL-compatible)
-- Run these in order to respect foreign key dependencies

-- cities
-- Managed directly by admin. A city is shown on the platform
-- as long as it has at least 1 active service (walk, day, or week trip).

CREATE TABLE IF NOT EXISTS cities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR NOT NULL,
  country         VARCHAR NOT NULL,
  cover_image_url VARCHAR,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMP DEFAULT now()
);

-- Insert default cities on first run
INSERT INTO cities (name, country) VALUES ('Prague', 'Czech Republic')
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country) VALUES ('Rome', 'Italy')
ON CONFLICT DO NOTHING;


-- users
-- Every registered user, whether regular or guide.
-- Both types can upload and update their profile photo (avatar_url).

CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid      VARCHAR UNIQUE NOT NULL,
  email             VARCHAR UNIQUE NOT NULL,
  full_name         VARCHAR,
  avatar_url        VARCHAR,
  role              VARCHAR DEFAULT 'user', -- 'user' | 'guide' | 'admin'
  visited_countries VARCHAR[],
  created_at        TIMESTAMP DEFAULT now()
);


-- guides
-- Created automatically when admin approves a guide_application.
-- One guide per user (enforced by UNIQUE on user_id).
-- city_id is assigned by admin at approval time.

CREATE TABLE IF NOT EXISTS guides (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE REFERENCES users(id),
  city_id     UUID REFERENCES cities(id),
  bio         TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT now()
);


-- walk_trips
-- One per guide. The guide manages their own dates.
-- Free experience — tips based.

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


-- day_trips
-- Managed by the guide from their profile.
-- Can have an external booking link or use the site form.

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
  booking_type          VARCHAR DEFAULT 'form', -- 'form' | 'external'
  external_booking_url  VARCHAR,
  active                BOOLEAN DEFAULT true,
  created_at            TIMESTAMP DEFAULT now()
);


-- week_trips
-- Managed directly by admin.
-- Always uses the site form for booking.

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


-- available_dates
-- Applies to walk_trips and week_trips.
-- trip_type defines which table trip_id references.

CREATE TABLE IF NOT EXISTS available_dates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_type     VARCHAR NOT NULL,  -- 'walk' | 'week'
  trip_id       UUID NOT NULL,
  date          DATE NOT NULL,
  max_capacity  INTEGER DEFAULT 6,
  spots_taken   INTEGER DEFAULT 0,
  created_at    TIMESTAMP DEFAULT now()
);


-- bookings
-- Covers all 3 trip types.
-- available_date_id is null for day_trip with external booking.

CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id),
  trip_type           VARCHAR NOT NULL,  -- 'walk' | 'day' | 'week'
  trip_id             UUID NOT NULL,
  available_date_id   UUID REFERENCES available_dates(id),
  group_size          INTEGER DEFAULT 1,
  status              VARCHAR DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT now()
);


-- reviews
-- Only regular users (role: 'user') can post reviews.
-- Reviews are general travel stories shown on the homepage.
-- Not linked to guides or trips.

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  content     TEXT NOT NULL,
  city        VARCHAR,
  created_at  TIMESTAMP DEFAULT now()
);


-- guide_applications
-- Submitted by users who want to become guides.
-- Admin manually approves or rejects each one.
-- When approved, system automatically creates guide + walk_trip records
-- and updates user role to 'guide'.

CREATE TABLE IF NOT EXISTS guide_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  city_id       UUID REFERENCES cities(id),
  tour_title    VARCHAR NOT NULL,
  tour_summary  TEXT NOT NULL,
  status        VARCHAR DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  admin_notes   TEXT,
  created_at    TIMESTAMP DEFAULT now(),
  reviewed_at   TIMESTAMP
);

-- Create indexes for better performance
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
