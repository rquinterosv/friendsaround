import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

const cities = ['Prague', 'Rome']

export default function Hero() {
  const [cityIndex, setCityIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCityIndex(i => (i + 1) % cities.length)
        setFading(false)
      }, 400)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollToSignup = () => {
    setMenuOpen(false)
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={styles.hero}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
        <div className={styles.navLinks}>
          <Link to="/about" className={styles.navLink}>About us</Link>
          <Link to="/partners" className={styles.navLink}>Day trips</Link>
          <Link to="/packages" className={styles.navBtn}>Packages</Link>
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
          <Link to="/about" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>About us</Link>
          <Link to="/partners" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Day trips</Link>
          <Link to="/packages" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Packages</Link>
          <button className={`primary ${styles.mobileCta}`} onClick={scrollToSignup}>Join the waitlist</button>
        </div>
      )}

      <div className={styles.content}>
        <p className="section-label">Experience it like a local</p>

        <h1 className={styles.headline}>
          A local friend<br />
          in <span className={`${styles.city} ${fading ? styles.fade : ''}`}>{cities[cityIndex]}</span>
        </h1>

        <p className={styles.sub}>
          Weekend trips with a local who actually lives there.
          No tour bus. No script. Just a real person showing you their city —
          the bars, the neighborhoods, the nights out.
        </p>

        <div className={styles.actions}>
          <button className="primary" onClick={scrollToSignup}>Join the waitlist</button>
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
    </section>
  )
}
