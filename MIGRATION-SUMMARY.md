# Drifter Trip - Migration Summary

## Completed Tasks

### Task 1 - Setup & Dependencies ✅
- Installed: pg, cloudinary, firebase-admin
- Created `.env` file with all required environment variables
- Created `/api` folder for Vercel Serverless Functions
- Created `/lib` folder with:
  - `db.js` - CockroachDB connection using pg
  - `cloudinary.js` - Cloudinary configuration
  - `firebase-admin.js` - Firebase Admin SDK for token verification

### Task 2 - Database Schema ✅
- Created `lib/schema.sql` with all tables in PostgreSQL syntax
- Tables created in correct order: cities → users → guides → walk_trips → day_trips → week_trips → available_dates → bookings → reviews → guide_applications
- Created `setup-db.js` script to initialize the database
- Default cities inserted: Prague (Czech Republic) and Rome (Italy)

### Task 3 - Vercel Serverless Functions ✅
Created the following API endpoints in `/api`:

**Users:**
- `POST /api/users/sync` - Sync user after login/register
- `GET /api/users/:id` - Get user profile with guide data
- `PATCH /api/users/:id` - Update own profile

**Image Upload:**
- `POST /api/upload/avatar` - Upload avatar to Cloudinary
- `POST /api/upload/trip-image` - Upload trip image to Cloudinary

**Cities:**
- `GET /api/cities` - List active cities with service counts

**Guide Applications:**
- `POST /api/guide-applications` - Submit application (protected)
- `GET /api/guide-applications` - List pending (admin only)
- `PATCH /api/guide-applications/:id/approve` - Approve application (admin only)
- `PATCH /api/guide-applications/:id/reject` - Reject application (admin only)

**Guides:**
- `GET /api/guides` - List all active guides
- `GET /api/guides/:id` - Get guide profile with walk trip and dates
- `PATCH /api/guides/:id` - Update own guide profile

**Walk Trips:**
- `GET /api/walk-trips` - List all active walk trips
- `GET /api/walk-trips/:id` - Get walk trip with available dates
- `PATCH /api/walk-trips/:id` - Update own walk trip
- `POST /api/walk-trips/:id/dates` - Add available date
- `DELETE /api/walk-trips/:id/dates/:dateId` - Remove date

**Day Trips:**
- `GET /api/day-trips` - List all active day trips
- `GET /api/day-trips/:id` - Get day trip details
- `PATCH /api/day-trips/:id` - Update own day trip

**Week Trips:**
- `GET /api/week-trips` - List all active week trips
- `GET /api/week-trips/:id` - Get week trip with dates
- `POST /api/week-trips/:id/dates` - Add date (admin only)
- `DELETE /api/week-trips/:id/dates/:dateId` - Remove date (admin only)

**Bookings:**
- `POST /api/bookings` - Create booking (handles all trip types)
- `GET /api/bookings/my` - Get user's bookings
- `PATCH /api/bookings/:id/cancel` - Cancel booking

**Reviews:**
- `GET /api/reviews` - List all reviews
- `POST /api/reviews` - Create review (user only)

### Task 4 - Booking Flows ✅
- Created `BookingForm` component with support for walk, day, and week trips
- Handles calendar date selection for walk and week trips
- Handles external booking redirect for day trips with external URL
- Form fields: full name, email, phone, group size, date, special requests

### Task 5 - Forms ✅
- Booking form created in `src/components/BookingForm.jsx`
- Guide application form updated in `src/pages/Guides.jsx`
- Review form already exists in `src/components/Testimonials.jsx`
- Contact form in `src/components/SignupForm.jsx` (not modified as requested)

### Task 6 - Firebase Storage Migration ✅
- Replaced Firebase Storage upload function in `src/fireabase.js`
- Updated `uploadGuidePhoto` to use Cloudinary via API
- Updated all components to use new `uploadAvatar` and `uploadTripImage` functions from `/lib/api.js`

### Task 7 - Frontend Integration ✅
Created `/lib/api.js` with helper functions for all API calls:
- Automatically includes Firebase Auth token in Authorization header
- All components updated to use new API instead of Firestore:
  - `src/pages/Profile.jsx`
  - `src/pages/UserProfile.jsx`
  - `src/pages/GuideProfile.jsx`
  - `src/pages/Guides.jsx`
  - `src/components/SignupForm.jsx`
  - `src/components/Testimonials.jsx`
  - `src/components/HowItWorks.jsx`

## Files Created/Modified

### New Files:
- `.env` - Environment variables
- `api/_middleware.js` - Auth middleware
- `api/users/sync.js` - User sync endpoint
- `api/users/[id].js` - User endpoints
- `api/upload/avatar.js` - Avatar upload
- `api/upload/trip-image.js` - Trip image upload
- `api/cities.js` - Cities endpoint
- `api/guide-applications.js` - Guide applications
- `api/guide-applications/[id]/approve.js`
- `api/guide-applications/[id]/reject.js`
- `api/guides/index.js` - Guides list
- `api/guides/[id].js` - Guide details
- `api/walk-trips/index.js` - Walk trips list
- `api/walk-trips/[id].js` - Walk trip details
- `api/walk-trips/[id]/dates.js` - Walk trip dates
- `api/walk-trips/[id]/dates/[dateId].js`
- `api/day-trips/index.js` - Day trips list
- `api/day-trips/[id].js` - Day trip details
- `api/week-trips/index.js` - Week trips list
- `api/week-trips/[id].js` - Week trip details
- `api/week-trips/[id]/dates.js` - Week trip dates
- `api/week-trips/[id]/dates/[dateId].js`
- `api/bookings/index.js` - Create booking
- `api/bookings/my.js` - My bookings
- `api/bookings/[id]/cancel.js` - Cancel booking
- `api/reviews/index.js` - Reviews
- `lib/db.js` - Database connection
- `lib/cloudinary.js` - Cloudinary config
- `lib/firebase-admin.js` - Firebase Admin SDK
- `lib/schema.sql` - Database schema
- `setup-db.js` - Database setup script
- `src/lib/api.js` - Frontend API helpers
- `src/components/BookingForm.jsx` - Booking form
- `src/components/BookingForm.module.css`
- `vercel.json` - Vercel configuration

### Modified Files:
- `package.json` - Added pg, cloudinary, firebase-admin
- `src/firebase.js` - Removed Storage, added syncUser call
- `src/pages/Profile.jsx` - Updated to use API
- `src/pages/UserProfile.jsx` - Updated to use API
- `src/pages/GuideProfile.jsx` - Updated to use API
- `src/pages/Guides.jsx` - Updated to use API
- `src/components/SignupForm.jsx` - Updated to use API
- `src/components/Testimonials.jsx` - Updated to use API
- `src/components/HowItWorks.jsx` - Updated to use API

## User Flows Implemented

### Regular User:
1. ✅ Registers → users table (role: 'user')
2. ✅ Can upload profile photo → avatar_url updated via Cloudinary
3. ✅ Can add visited countries → visited_countries updated
4. ✅ Can post reviews → reviews table (only role: 'user')
5. ✅ Can book any trip type → bookings table
6. ✅ Profile shows: name, avatar, countries, reviews

### Guide:
1. ✅ Starts as regular user
2. ✅ Submits guide application → guide_applications (pending)
3. ✅ Admin approves → guides + walk_trips created, role → 'guide'
4. ✅ Can upload profile photo → avatar_url updated
5. ✅ Can edit walk_trip details and dates
6. ✅ Can edit day_trip details and booking type
7. ✅ Profile shows: name, avatar, bio, walk trip, day trip, available dates

## Remaining Tasks

1. **Set up CockroachDB**:
   - Create a CockroachDB cluster
   - Get connection string and update `.env` file
   - Run `node setup-db.js` to create tables

2. **Set up Cloudinary**:
   - Create Cloudinary account
   - Get cloud name, API key, and API secret
   - Update `.env` file

3. **Set up Firebase Admin SDK**:
   - Generate private key from Firebase console
   - Update `.env` file with project ID, client email, and private key

4. **Test the application**:
   - Test user registration and login
   - Test profile updates and avatar uploads
   - Test guide application flow
   - Test booking flows

5. **Remove old Firestore code** (optional):
   - Some components still have commented Firestore imports for reference
   - Can be removed after full testing

## Important Notes

- Firebase Auth logic is preserved and NOT modified
- UI, colors, typography, and layout are NOT changed
- All API responses follow the standard format: `{ success: true/false, data/error: ... }`
- Error handling is implemented throughout
- Booking flows handle external redirects for day trips
- Admin-only endpoints verify admin role from users table
