import { useState, useEffect } from 'react'
import styles from './Hero.module.css'

const cities = ['Prague', 'Lisbon', 'Sofia', 'Tallinn', 'Kraków', 'Tbilisi']

export default function Hero() {
  const [cityIndex, setCityIndex] = useState(0)
  const [fading, setFading] = useState(false)

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

  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={styles.hero}>
      <nav className={styles.nav}>
        <span className={styles.logo}>friends<em>around</em></span>
        <button className="primary" onClick={scrollToSignup}>Get early access</button>
      </nav>

      <div className={styles.content}>
        <p className="section-label">Europe, the real way</p>

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

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>12</span>
            <span className={styles.statLabel}>Cities</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>Verified</span>
            <span className={styles.statLabel}>Local guides</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>€0</span>
            <span className={styles.statLabel}>Commission to join</span>
          </div>
        </div>
      </div>

      <div className={styles.imageGrid}>
        <div className={`${styles.imgBox} ${styles.img1}`}>
          <div className={styles.tag}>Prague, CZ</div>
        </div>
        <div className={`${styles.imgBox} ${styles.img2}`}>
          <div className={styles.tag}>Sofia, BG</div>
        </div>
        <div className={`${styles.imgBox} ${styles.img3}`}>
          <div className={styles.tag}>Lisbon, PT</div>
        </div>
      </div>
    </section>
  )
}
