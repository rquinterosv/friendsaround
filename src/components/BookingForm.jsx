import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createBooking, getMyBookings } from '../lib/api'
import styles from './BookingForm.module.css'

export default function BookingForm({ tripType, tripId, availableDates = [], onSuccess }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    group_size: 1,
    notes: '',
    available_date_id: '',
    date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('Please sign in to book')
      setLoading(false)
      return
    }

    // For day trips without external booking, we don't need available_date_id
    const bookingData = {
      trip_type: tripType,
      trip_id: tripId,
      group_size: form.group_size,
      notes: form.notes,
    }

    if (tripType === 'walk' || tripType === 'week') {
      if (!form.available_date_id) {
        setError('Please select a date')
        setLoading(false)
        return
      }
      bookingData.available_date_id = form.available_date_id
    }

    try {
      const result = await createBooking(bookingData)

      if (result.success) {
        if (result.data.external_booking) {
          // Redirect to external booking URL
          window.open(result.data.external_booking_url, '_blank')
          setSubmitted(true)
        } else {
          setSubmitted(true)
          if (onSuccess) onSuccess(result.data)
        }
      } else {
        setError(result.error || 'Booking failed')
      }
    } catch (err) {
      console.error('Booking error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>Booking Submitted!</h3>
        <p className={styles.successSub}>
          We'll confirm your booking soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.formTitle}>Book This Trip</h3>

      {(tripType === 'walk' || tripType === 'week') && availableDates.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Select Date</label>
          <select
            value={form.available_date_id}
            onChange={(e) => setForm({ ...form, available_date_id: e.target.value })}
            className={styles.input}
            required
          >
            <option value="">Choose a date</option>
            {availableDates
              .filter(d => d.spots_taken < d.max_capacity)
              .map((date) => (
                <option key={date.id} value={date.id}>
                  {new Date(date.date).toLocaleDateString()} 
                  {' '}({date.max_capacity - date.spots_taken} spots left)
                </option>
              ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Full Name</label>
        <input
          type="text"
          value={user?.displayName || ''}
          className={styles.input}
          disabled
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          value={user?.email || ''}
          className={styles.input}
          disabled
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Group Size</label>
        <select
          value={form.group_size}
          onChange={(e) => setForm({ ...form, group_size: parseInt(e.target.value) })}
          className={styles.input}
          required
        >
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Special Requests (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Any special requirements or requests..."
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className="primary" disabled={loading}>
        {loading ? 'Submitting...' : 'Book Now'}
      </button>
    </form>
  )
}
