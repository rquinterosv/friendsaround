import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithGoogle } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { getReviews, createReview } from '../lib/api'
import styles from './Testimonials.module.css'

// Keep old Firestore import for reference - will be removed after full migration
// import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore'
// import { db } from '../firebase'

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
  photos: ['', '', ''],
}

function TermsModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose}>×</button>
        <h2 className={styles.modalTitle}>Terms of Service</h2>
        <div className={styles.modalContent}>
          <p><strong>1. Acceptance of Terms</strong></p>
          <p>By accessing and using Drifter Trip, you accept and agree to be bound by the terms and provision of this agreement.</p>
          <p><strong>2. Use License</strong></p>
          <p>Permission is granted to use Drifter Trip for personal, non-commercial use only.</p>
          <p><strong>3. User Conduct</strong></p>
          <p>You agree to use the service responsibly and not for any unlawful purpose.</p>
          <p><strong>4. Booking and Payments</strong></p>
          <p>All bookings are subject to availability. Payments are processed securely through third-party providers.</p>
          <p><strong>5. Cancellation Policy</strong></p>
          <p>Cancellations made 48 hours before the trip will receive a full refund. Later cancellations are non-refundable.</p>
          <p><strong>6. Limitation of Liability</strong></p>
          <p>Drifter Trip acts as a connector between travelers and local guides. We are not liable for any incidents during the experience.</p>
          <p><strong>7. Privacy</strong></p>
          <p>We collect and process personal data in accordance with our Privacy Policy.</p>
          <p><strong>8. Contact</strong></p>
          <p>For questions about these terms, contact us at hello@driftertrip.com</p>
        </div>
      </div>
    </div>
  )
}

function PrivacyModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose}>×</button>
        <h2 className={styles.modalTitle}>Privacy Policy</h2>
        <div className={styles.modalContent}>
          <p><strong>Information We Collect</strong></p>
          <p>We collect information you provide directly, including name, email, phone number, and trip preferences.</p>
          <p><strong>How We Use Your Information</strong></p>
          <p>We use your information to process your booking requests, connect you with local guides, communicate about your trips, and improve our services.</p>
          <p><strong>Data Sharing</strong></p>
          <p>We share your information only with local guides necessary for your trip. We do not sell your data to third parties.</p>
          <p><strong>Data Security</strong></p>
          <p>We implement appropriate security measures to protect your personal data.</p>
          <p><strong>Your Rights</strong></p>
          <p>You have the right to access, correct, or delete your personal data. Contact us to exercise these rights.</p>
          <p><strong>Contact</strong></p>
          <p>For privacy concerns, contact us at hello@driftertrip.com</p>
        </div>
      </div>
    </div>
  )
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
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'testimonials'))
        const items = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.approved === true || item.approved === undefined)
        items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setTestimonials(items)
      } catch (err) {
        console.error('Error fetching testimonials:', err)
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
    const userId = testimonials[currentIndex]?.userId
    if (!userId) return
    navigate(`/user/${userId}`)
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleGoogleLogin = async () => {
    if (!termsAccepted) {
      setShowTermsError(true)
      setError('Please accept the Terms and Privacy Policy to continue')
      return
    }
    setShowTermsError(false)
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
      const result = await createReview({
        content: form.quote,
        city: form.trip,
      })
      
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch (err) {
      console.error('API error:', err)
      setError(`Something went wrong: ${err?.message || 'unknown error'}`)
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
            onClick={testimonials[currentIndex]?.userId ? handleCarouselClick : undefined}
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
              <label className={`${styles.termsCheckbox} ${showTermsError ? styles.termsCheckboxError : ''}`}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked)
                    setShowTermsError(false)
                    setError('')
                  }}
                />
                <span>
                  I agree to the{' '}
                  <button type="button" onClick={() => setShowTerms(true)}>Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
                </span>
              </label>
              {showTermsError && <p className={styles.termsError}>Please accept the Terms and Privacy Policy to continue</p>}
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

              <div className={styles.field}>
                <label className={styles.label}>Add up to 3 photos (URLs)</label>
                <div className={styles.photosInputs}>
                  {form.photos.map((photo, i) => (
                    <input
                      key={i}
                      type="url"
                      value={photo}
                      onChange={(e) => {
                        const newPhotos = [...form.photos]
                        newPhotos[i] = e.target.value
                        setForm({ ...form, photos: newPhotos })
                      }}
                      placeholder={`Photo ${i + 1} URL`}
                      className={styles.input}
                    />
                  ))}
                </div>
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

              <p className={styles.terms}>
                By posting, you agree to our{' '}
                <button type="button" className={styles.termsLink} onClick={() => setShowTerms(true)}>Terms of Service</button> and{' '}
                <button type="button" className={styles.termsLink} onClick={() => setShowPrivacy(true)}>Privacy Policy</button>.
              </p>
            </form>
          )}
        </div>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </section>
  )
}
