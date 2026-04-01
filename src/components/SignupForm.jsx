import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import styles from './SignupForm.module.css'

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  destination: '',
  groupSize: '',
  travelDate: '',
}

export default function SignupForm() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await addDoc(collection(db, 'requests'), {
        ...form,
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="signup" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Book your trip</p>
          <h2 className={styles.title}>
            Ready to<br />
            <em>drift away?</em>
          </h2>
          <p className={styles.sub}>
            Tell us where you want to go and we'll connect you with a local
            who'll show you the real city. No scripts, no tours — just life.
          </p>

          <div className={styles.perks}>
            {['We reply within 24 hours', 'Personalized experience', 'No hidden fees'].map((p, i) => (
              <div key={i} className={styles.perk}>
                <span className={styles.check}>✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          {submitted ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>Request sent!</h3>
              <p className={styles.successSub}>
                We'll get back to you within 24 hours to plan your trip.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h3 className={styles.formTitle}>Plan your experience</h3>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>First name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={update('firstName')}
                    placeholder="Rafael"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={update('lastName')}
                    placeholder="Quinteros"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+56 9 1234 5678"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Destination</label>
                  <select
                    value={form.destination}
                    onChange={update('destination')}
                    className={styles.input}
                    required
                  >
                    <option value="">Select a city</option>
                    <option value="Prague">Prague</option>
                    <option value="Rome">Rome</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Group size</label>
                  <select
                    value={form.groupSize}
                    onChange={update('groupSize')}
                    className={styles.input}
                    required
                  >
                    <option value="">How many?</option>
                    <option value="1">1 person</option>
                    <option value="2">2 people</option>
                    <option value="3">3 people</option>
                    <option value="4">4 people</option>
                    <option value="5+">5+ people</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>When do you want to go?</label>
                <input
                  type="month"
                  value={form.travelDate}
                  onChange={update('travelDate')}
                  className={styles.input}
                  required
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={`primary ${styles.submit}`} disabled={loading}>
                {loading ? 'Sending...' : 'Send request'}
              </button>

              <p className={styles.privacy}>No spam. No sharing. We'll only contact you about your trip.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
