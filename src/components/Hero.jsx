import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { loginWithGoogle, logout } from '../firebase'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import styles from './Hero.module.css'

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

function LoginPopup({ onClose, onShowTerms, onShowPrivacy }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)

  const handleGoogleLogin = async () => {
    if (!termsAccepted) {
      setShowTermsError(true)
      setError('Please accept the Terms and Privacy Policy to continue')
      return
    }
    setShowTermsError(false)
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle()
      onClose()
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Please allow the popup to complete sign in')
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign in was cancelled')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginOverlay} onClick={onClose}>
      <div className={styles.loginPopup} onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose}>×</button>
        <h3 className={styles.loginTitle}>Sign in to continue</h3>
        <p className={styles.loginSub}>Choose a sign-in method</p>
        
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
            <button type="button" onClick={() => { onShowTerms(); onClose(); }}>Terms of Service</button>
            {' '}and{' '}
            <button type="button" onClick={() => { onShowPrivacy(); onClose(); }}>Privacy Policy</button>
          </span>
        </label>
        {showTermsError && <p className={styles.termsError}>Please accept the Terms and Privacy Policy to continue</p>}

        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.38-1.36-.38-2.09s.16-1.43.38-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        {error && <p className={styles.loginError}>{error}</p>}
      </div>
    </div>
  )
}


  export default function Hero() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollToSignup = () => {
    setMenuOpen(false)
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  const [showLogin, setShowLogin] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setDropdownOpen(false)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <section className={styles.hero}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
        <div className={styles.navLinks}>
          <Link to="/guides" className={styles.navLink}>Our Guides</Link>
          <Link to="/partners" className={styles.navLink}>Day trips</Link>
          {!user ? (
            <button type="button" className={styles.navBtnOutline} onClick={() => setShowLogin(true)}>
              <User size={16} />
              <span>Sign in</span>
            </button>
          ) : (
            <div className={styles.dropdown} ref={dropdownRef}>
              <button 
                type="button" 
                className={styles.dropdownToggle}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User size={16} />
                <span>{user.displayName?.split(' ')[0] || 'Account'}</span>
                <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
          {showLogin && <LoginPopup onClose={() => setShowLogin(false)} onShowTerms={() => setShowTerms(true)} onShowPrivacy={() => setShowPrivacy(true)} />}
        </div>
        <button
          type="button"
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {menuOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-modal="true">
          <Link to="/guides" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Our Guides</Link>
          <Link to="/partners" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Day trips</Link>
          {!user ? (
            <button type="button" className={styles.mobileLinkBtn} onClick={() => { setMenuOpen(false); setShowLogin(true); }}>
              <User size={20} />
              <span>Sign in</span>
            </button>
          ) : (
            <>
              <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <User size={20} />
                <span>My Profile</span>
              </Link>
              <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <Settings size={20} />
                <span>Settings</span>
              </Link>
              <button className={styles.mobileLink} onClick={() => { handleLogout(); setMenuOpen(false); }}>
                <LogOut size={20} />
                <span>Sign out</span>
              </button>
            </>
          )}
          {!user && <button className={`primary ${styles.mobileCta}`} onClick={scrollToSignup}>Join the waitlist</button>}
        </div>
      )}
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} onShowTerms={() => setShowTerms(true)} onShowPrivacy={() => setShowPrivacy(true)} />}

      <div className={styles.content}>

        <h1 className={styles.headline}>
          We are happy.<br />
          We are friendly.<br />
          We are <em>Drifters</em>.
        </h1>

        <p className={styles.sub}>
          Travel experiences curated by locals who actually live there.
          No tour buses. No scripts. Just real people showing you their city.
        </p>

        <div className={styles.actions}>
          <button className="primary" onClick={() => document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' })}>Browse experiences</button>
          <button className="secondary" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>
            How it works
          </button>
        </div>
      </div>

      <div className={styles.imageGrid}>
        <Link to="/packages" className={`${styles.imgBox} ${styles.img1}`}>
          <div className={styles.tag}>Prague, CZ</div>
        </Link>
        <Link to="/packages" className={`${styles.imgBox} ${styles.img2}`}>
          <div className={styles.tag}>Rome, IT</div>
        </Link>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </section>
  )
}
