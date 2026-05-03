import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginWithGoogle } from '../firebase'
import { submitGuideApplication, getCities } from '../lib/api'
import Footer from '../components/Footer'
import styles from './Guides.module.css'

// Keep old Firestore import for reference - will be removed after full migration
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
// import { db } from '../firebase'

const guides = [
  {
    id: 'rafa',
    name: 'Rafa Quinteros',
    city: 'Prague',
    experience: 'Castle to Charles Bridge walk + local bar crawl',
    image: '/rafael.jpeg',
    bio: "I've spent the last 4 years traveling the world — Latin America, Canada, New Zealand, Indonesia, Greece, Spain, Italy, Czech Republic, Germany, England, and more places still left to discover. Along the way I realized the best moments were never the tourist attractions. They were the nights out with locals, the hidden bars only regulars know about, the neighborhoods that don't appear on any travel guide.",
    origin: 'From Chile',
  },
]

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

export default function Guides() {
  const { user } = useAuth()
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    city: '',
    experience: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

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
      await addDoc(collection(db, 'guides'), {
        ...formData,
        userId: user?.uid,
        userEmail: user?.email,
        approved: false,
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
      setFormData({ name: '', email: '', country: '', city: '', experience: '' })
    } catch (err) {
      console.error('Firestore error:', err)
      setError(`Something went wrong: ${err?.code || err?.message || 'unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (selectedGuide) {
    return (
      <>
        <section className={styles.profileHero}>
          <nav className={styles.nav}>
            <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
            <button className={styles.backLink} onClick={() => setSelectedGuide(null)}>← Back to guides</button>
          </nav>
          <div className={styles.profileContent}>
            <img src={selectedGuide.image} alt={selectedGuide.name} className={styles.profileAvatar} />
            <div className={styles.profileInfo}>
              <p className="section-label">Your guide</p>
              <h1 className={styles.profileName}>{selectedGuide.name}</h1>
              <p className={styles.profileLocation}>{selectedGuide.city} · {selectedGuide.origin}</p>
            </div>
          </div>
        </section>

        <section className={styles.profileSection}>
          <div className={styles.profileInner}>
            <h2 className="section-title" style={{ marginBottom: '24px' }}>
              The <em>experience</em>
            </h2>
            <p className={styles.profileExperience}>{selectedGuide.experience}</p>

            <div className={styles.profileBio}>
              <p>{selectedGuide.bio}</p>
            </div>

            <button className="primary" style={{ marginTop: '32px' }}>
              Book this experience
            </button>
          </div>
        </section>

        <Footer />
      </>
    )
  }

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <Link to="/" className={styles.backLink}>← Back to home</Link>
        </nav>

        <div className={styles.content}>
          <p className="section-label">Our guides</p>
          <h1 className={styles.headline}>
            Locals who love<br />
            <em>showing off</em> their city
          </h1>
        </div>
      </section>

      <section className={styles.guidesSection}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '48px', textAlign: 'center' }}>
            Meet your <em>local friends</em>
          </h2>
          <div className={styles.guidesGrid}>
            {guides.map((guide, i) => (
              <div
                key={i}
                className={styles.guideCard}
                onClick={() => setSelectedGuide(guide)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedGuide(guide)}
              >
                <img src={guide.image} alt={guide.name} className={styles.guideImage} />
                <h3 className={styles.guideName}>{guide.name}</h3>
                <p className={styles.guideCity}>{guide.city}</p>
                <p className={styles.guideExperience}>{guide.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.becomeSection}>
        <div className={styles.becomeInner}>
          <div className={styles.becomeContent}>
            <h2 className="section-title">
              Become a <em>Guide</em>
            </h2>
            <p className={styles.becomeSub}>
              Live in an amazing city? Know the best spots people need to discover?
              You can make money showing travelers around — on your terms,
              your schedule, your city.
            </p>
          </div>

          {submitted ? (
            <div className={styles.successBlock}>
              <div className={styles.successIcon}>&#10003;</div>
              <h3 className={styles.successTitle}>Thanks for applying!</h3>
              <p className={styles.successSub}>
                We'll review your application and get in touch soon.
              </p>
            </div>
          ) : !user ? (
            <div className={styles.authCta}>
              <p className={styles.ctaTitle}>Sign in to apply</p>
              <p className={styles.ctaSub}>
                Sign in with Google to apply as a guide.
              </p>
              <button type="button" className="primary" onClick={handleGoogleLogin} disabled={authLoading}>
                {authLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          ) : !showForm ? (
            <div className={styles.applyCta}>
              <p className={styles.ctaTitle}>Apply to be a guide</p>
              <p className={styles.ctaSub}>
                Tell us about yourself and the experience you want to offer.
              </p>
              <button type="button" className="primary" onClick={() => setShowForm(true)}>
                Start application
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Full name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label htmlFor="country" className={styles.label}>Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  >
                    <option value="">Select a country</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Italy">Italy</option>
                    <option value="Spain">Spain</option>
                    <option value="France">France</option>
                    <option value="Germany">Germany</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Poland">Poland</option>
                    <option value="Austria">Austria</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Greece">Greece</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="city" className={styles.label}>City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Prague"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="experience" className={styles.label}>Describe the experience or tour you want to offer</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={4}
                  placeholder="Tell us what makes your tour special..."
                  required
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancel} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Apply to be a guide'}
                </button>
              </div>

              <p className={styles.terms}>
                By applying, you agree to our{' '}
                <button type="button" className={styles.termsLink} onClick={() => setShowTerms(true)}>Terms of Service</button> and{' '}
                <button type="button" className={styles.termsLink} onClick={() => setShowPrivacy(true)}>Privacy Policy</button>.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  )
}