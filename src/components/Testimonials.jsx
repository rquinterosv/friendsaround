import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, loginWithGoogle } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import styles from './Testimonials.module.css'

const initialForm = {
  name: '',
  trip: '',
  quote: '',
  email: '',
}

export default function Testimonials() {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [open, setOpen] = useState(false)
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
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'testimonials'), {
        ...form,
        userId: user?.uid,
        userEmail: user?.email,
        approved: false,
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

  return (
    <section className={styles.section}>
      <div className="container">
        <p className="section-label">From travelers</p>
        <h2 className="section-title" style={{ marginBottom: '24px' }}>
          Share your <em>drifter story</em>
        </h2>
        <p className={styles.intro}>
          We're just getting started — no curated quotes here yet. If you've traveled
          with us, tell us how it went. Your words may show up on this page.
        </p>

        <div className={styles.emptyCard}>
          {submitted ? (
            <div className={styles.successBlock}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>Thanks for sharing!</h3>
              <p className={styles.successSub}>
                We'll review your story and publish it soon.
              </p>
            </div>
          ) : !user ? (
            <div className={styles.authCta}>
              <p className={styles.ctaTitle}>Sign in to share your story</p>
              <p className={styles.ctaSub}>
                Sign in with Google or Facebook to tell us about your experience.
              </p>
              <button type="button" className="primary" onClick={handleGoogleLogin} disabled={authLoading}>
                {authLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          ) : !open ? (
            <div className={styles.cta}>
              <p className={styles.ctaTitle}>Be the first to share your story</p>
              <p className={styles.ctaSub}>
                It takes a minute. No logins, no stars to rate — just your words.
              </p>
              <button type="button" className="primary" onClick={() => setOpen(true)}>
                Share your story
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Your name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Marta K."
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Your trip</label>
                  <input
                    type="text"
                    value={form.trip}
                    onChange={update('trip')}
                    placeholder="Warsaw → Prague"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Your story</label>
                <textarea
                  value={form.quote}
                  onChange={update('quote')}
                  placeholder="Tell us what the trip was like — in your own words."
                  className={`${styles.input} ${styles.textarea}`}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="So we can reach you if we have questions"
                  className={styles.input}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Post my story'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
