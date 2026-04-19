import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, loginWithGoogle, logout } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import styles from './SignupForm.module.css'

const today = new Date().toISOString().split('T')[0]

const initialForm = {
  phone: '',
  destination: '',
  package: '',
  groupSize: '',
  arrivalDate: '',
  departureDate: '',
}

export default function SignupForm() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    setError('')
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Auth error:', err.code, err.message)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Please allow the popup to complete sign in')
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign in was cancelled')
      } else {
        setError(err.message)
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await addDoc(collection(db, 'requests'), {
        ...form,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        userPhotoURL: user.photoURL,
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Firestore error:', err)
      setError(`Something went wrong: ${err?.code || err?.message || 'unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
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
            <div className={styles.authBox}>
              <h3 className={styles.formTitle}>Sign in to continue</h3>
              <p className={styles.authSub}>Choose a sign-in method</p>

              <button
                type="button"
                className={styles.googleBtn}
                onClick={handleGoogleLogin}
                disabled={authLoading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.38-1.36-.38-2.09s.16-1.43.38-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {authLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <p className={styles.privacy}>No spam. We'll only contact you about your trip.</p>
            </div>
          </div>
        </div>
      </section>
    )
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
                  <label className={styles.label}>Package</label>
                  <select
                    value={form.package}
                    onChange={update('package')}
                    className={styles.input}
                    required
                  >
                    <option value="">Choose a plan</option>
                    <option value="Free Explorer">Free Explorer</option>
                    <option value="Local Companion">Local Companion</option>
                    <option value="Full Experience">Full Experience</option>
                  </select>
                </div>
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

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Arrival date</label>
                  <input
                    type="date"
                    value={form.arrivalDate}
                    onChange={update('arrivalDate')}
                    min={today}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Departure date</label>
                  <input
                    type="date"
                    value={form.departureDate}
                    onChange={update('departureDate')}
                    min={form.arrivalDate || today}
                    className={styles.input}
                    required
                  />
                </div>
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
