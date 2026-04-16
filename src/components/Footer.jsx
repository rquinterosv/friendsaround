import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
        <nav className={styles.links}>
          <Link to="/about" className={styles.link}>About us</Link>
          <Link to="/partners" className={styles.link}>Day trips</Link>
        </nav>
        <p className={styles.tagline}>Europe, as locals live it.</p>
        <p className={styles.copy}>© 2025 DrifterTrip. Built with ♥ in Prague.</p>
      </div>
    </footer>
  )
}
