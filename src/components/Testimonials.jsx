import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db, loginWithGoogle } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import styles from './Testimonials.module.css'

const cityToCountry = {
  rome: { country: 'italy', flag: '🇮🇹' },
  roma: { country: 'italy', flag: '🇮🇹' },
  italy: { country: 'italy', flag: '🇮🇹' },
  prague: { country: 'czech republic', flag: '🇨🇿' },
  warsaw: { country: 'poland', flag: '🇵🇱' },
  poland: { country: 'poland', flag: '🇵🇱' },
  berlin: { country: 'germany', flag: '🇩🇪' },
  germany: { country: 'germany', flag: '🇩🇪' },
  madrid: { country: 'spain', flag: '🇪🇸' },
  barcelona: { country: 'spain', flag: '🇪🇸' },
  spain: { country: 'spain', flag: '🇪🇸' },
  paris: { country: 'france', flag: '🇫🇷' },
  france: { country: 'france', flag: '🇫🇷' },
  london: { country: 'uk', flag: '🇬🇧' },
  uk: { country: 'uk', flag: '🇬🇧' },
  amsterdam: { country: 'netherlands', flag: '🇳🇱' },
  netherlands: { country: 'netherlands', flag: '🇳🇱' },
  lisbon: { country: 'portugal', flag: '🇵🇹' },
  portgual: { country: 'portugal', flag: '🇵🇹' },
  vienna: { country: 'austria', flag: '🇦🇹' },
  austria: { country: 'austria', flag: '🇦🇹' },
  budapest: { country: 'hungary', flag: '🇭🇺' },
  hungary: { country: 'hungary', flag: '🇭🇺' },
}

const initialForm = {
  trip: '',
  quote: '',
}

export default function Testimonials() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [carouselLoading, setCarouselLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(
          collection(db, 'testimonials'),
          where('approved', '==', true)
        )
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setTestimonials(items)
      } catch (err) {
        console.error('Error fetching testimonials:', err)
        try {
          const allSnap = await getDocs(collection(db, 'testimonials'))
          const items = allSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.approved === true)
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          setTestimonials(items)
        } catch (fallbackErr) {
          console.error('Fallback error:', fallbackErr)
        }
      } finally {
        setCarouselLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  const nextTestimonial = () => {
    setCurrentIndex(i => (i + 1) % testimonials.length)
  }

  const prevTestimonial = (e) => {
    e?.stopPropagation()
    setCurrentIndex(i => (i - 1 + testimonials.length) % testimonials.length)
  }

  const nextSlide = (e) => {
    e?.stopPropagation()
    setCurrentIndex(i => (i + 1) % testimonials.length)
  }

  const getFlag = (trip) => {
    if (!trip) return null
    const city = trip.toLowerCase().split(/[\s→,\-]/)[0]
    return cityToCountry[city]?.flag || '🌍'
  }

  const handleCarouselClick = () => {
    if (user && testimonials[currentIndex]?.userId === user.uid) {
      navigate('/profile')
    }
  }

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
        name: user?.displayName || form.name,
        trip: form.trip,
        quote: form.quote,
        email: user?.email || form.email,
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

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }))
    }
  }, [user])

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

        {!carouselLoading && testimonials.length > 0 && !submitted && !open && (
          <div 
            className={styles.carousel}
            onClick={user && testimonials[currentIndex]?.userId === user.uid ? handleCarouselClick : undefined}
          >
            <button className={styles.carouselBtn} onClick={prevTestimonial} aria-label="Previous">
              <ChevronLeft size={24} />
            </button>
            <div className={styles.carouselContent}>
              <img 
                src={testimonials[currentIndex].userPhotoURL || `https://ui-avatars.com/api/?name=${testimonials[currentIndex].name}&background=random`} 
                alt={testimonials[currentIndex].name}
                className={styles.carouselAvatar}
              />
              <blockquote className={styles.carouselQuote}>
                {testimonials[currentIndex].quote}
              </blockquote>
              <div className={styles.carouselMeta}>
                <cite className={styles.carouselName}>{testimonials[currentIndex].name}</cite>
                <span className={styles.carouselTrip}>
                  <MapPin size={14} />
                  {testimonials[currentIndex].trip} {getFlag(testimonials[currentIndex].trip)}
                </span>
              </div>
            </div>
            <button className={styles.carouselBtn} onClick={nextSlide} aria-label="Next">
              <ChevronRight size={24} />
            </button>
          </div>
        )}

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
