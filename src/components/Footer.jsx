import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.logo}>friends<em>around</em></span>
        <p className={styles.tagline}>Europe, as locals live it.</p>
        <p className={styles.copy}>© 2025 FriendsAround. Built with ♥ in Prague.</p>
      </div>
    </footer>
  )
}
