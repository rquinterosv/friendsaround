import { auth } from '../firebase.js'

const API_BASE = '' // Same domain, so empty string

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

async function getAuthHeadersForFormData() {
  const token = await auth.currentUser?.getIdToken()
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

// ==================== USERS ====================

export async function syncUser({ firebase_uid, email, full_name }) {
  const res = await fetch(`${API_BASE}/api/users/sync`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ firebase_uid, email, full_name }),
  })
  return res.json()
}

export async function getUser(id) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}

// ==================== UPLOAD ====================

export async function uploadAvatar(userId, file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)

  const res = await fetch(`${API_BASE}/api/upload/avatar`, {
    method: 'POST',
    headers: await getAuthHeadersForFormData(),
    body: formData,
  })
  return res.json()
}

export async function uploadTripImage(tripType, tripId, file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('trip_type', tripType)
  formData.append('trip_id', tripId)

  const res = await fetch(`${API_BASE}/api/upload/trip-image`, {
    method: 'POST',
    headers: await getAuthHeadersForFormData(),
    body: formData,
  })
  return res.json()
}

// ==================== CITIES ====================

export async function getCities() {
  const res = await fetch(`${API_BASE}/api/cities`, {
    method: 'GET',
  })
  return res.json()
}

// ==================== GUIDE APPLICATIONS ====================

export async function submitGuideApplication({ city_id, tour_title, tour_summary }) {
  const res = await fetch(`${API_BASE}/api/guide-applications`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ city_id, tour_title, tour_summary }),
  })
  return res.json()
}

export async function getPendingApplications() {
  const res = await fetch(`${API_BASE}/api/guide-applications`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

export async function approveApplication(id) {
  const res = await fetch(`${API_BASE}/api/guide-applications/${id}/approve`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

export async function rejectApplication(id, admin_notes) {
  const res = await fetch(`${API_BASE}/api/guide-applications/${id}/reject`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ admin_notes }),
  })
  return res.json()
}

// ==================== GUIDES ====================

export async function getGuides() {
  const res = await fetch(`${API_BASE}/api/guides`, {
    method: 'GET',
  })
  return res.json()
}

export async function getGuide(id) {
  const res = await fetch(`${API_BASE}/api/guides/${id}`, {
    method: 'GET',
  })
  return res.json()
}

export async function updateGuide(id, data) {
  const res = await fetch(`${API_BASE}/api/guides/${id}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}

// ==================== WALK TRIPS ====================

export async function getWalkTrips() {
  const res = await fetch(`${API_BASE}/api/walk-trips`, {
    method: 'GET',
  })
  return res.json()
}

export async function getWalkTrip(id) {
  const res = await fetch(`${API_BASE}/api/walk-trips/${id}`, {
    method: 'GET',
  })
  return res.json()
}

export async function updateWalkTrip(id, data) {
  const res = await fetch(`${API_BASE}/api/walk-trips/${id}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function addWalkTripDate(id, { date, max_capacity }) {
  const res = await fetch(`${API_BASE}/api/walk-trips/${id}/dates`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ date, max_capacity }),
  })
  return res.json()
}

export async function deleteWalkTripDate(id, dateId) {
  const res = await fetch(`${API_BASE}/api/walk-trips/${id}/dates/${dateId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

// ==================== DAY TRIPS ====================

export async function getDayTrips() {
  const res = await fetch(`${API_BASE}/api/day-trips`, {
    method: 'GET',
  })
  return res.json()
}

export async function getDayTrip(id) {
  const res = await fetch(`${API_BASE}/api/day-trips/${id}`, {
    method: 'GET',
  })
  return res.json()
}

export async function updateDayTrip(id, data) {
  const res = await fetch(`${API_BASE}/api/day-trips/${id}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}

// ==================== WEEK TRIPS ====================

export async function getWeekTrips() {
  const res = await fetch(`${API_BASE}/api/week-trips`, {
    method: 'GET',
  })
  return res.json()
}

export async function getWeekTrip(id) {
  const res = await fetch(`${API_BASE}/api/week-trips/${id}`, {
    method: 'GET',
  })
  return res.json()
}

export async function addWeekTripDate(id, { date, max_capacity }) {
  const res = await fetch(`${API_BASE}/api/week-trips/${id}/dates`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

export async function deleteWeekTripDate(id, dateId) {
  const res = await fetch(`${API_BASE}/api/week-trips/${id}/dates/${dateId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

// ==================== BOOKINGS ====================

export async function createBooking({ trip_type, trip_id, available_date_id, group_size, notes }) {
  const res = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ trip_type, trip_id, available_date_id, group_size, notes }),
  })
  return res.json()
}

export async function getMyBookings() {
  const res = await fetch(`${API_BASE}/api/bookings/my`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

export async function cancelBooking(id) {
  const res = await fetch(`${API_BASE}/api/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
  })
  return res.json()
}

// ==================== REVIEWS ====================

export async function getReviews() {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'GET',
  })
  return res.json()
}

export async function createReview({ content, city }) {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ content, city }),
  })
  return res.json()
}
