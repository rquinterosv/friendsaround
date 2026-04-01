import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import styles from './About.module.css'

export default function About() {
  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <Link to="/" className={styles.backLink}>← Back to home</Link>
        </nav>

        <div className={styles.content}>
          <p className="section-label">About us</p>
          <h1 className={styles.headline}>
            Built by a traveler,<br />
            <em>for travelers</em>
          </h1>
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.storyInner}>
          <div className={styles.profile}>
            <div className={styles.avatar}>RQ</div>
            <div className={styles.profileInfo}>
              <h3 className={styles.name}>Rafael Quinteros</h3>
              <p className={styles.role}>Founder & fellow drifter</p>
              <p className={styles.origin}>From Chile</p>
            </div>
          </div>

          <div className={styles.bio}>
            <p>
              I've spent the last 4 years traveling the world — Latin America, Canada,
              New Zealand, Indonesia, Greece, Spain, Italy, Czech Republic, Germany,
              England, and more places still left to discover.
            </p>
            <p>
              Along the way I realized the best moments were never the tourist attractions.
              They were the nights out with locals, the hidden bars only regulars know about,
              the neighborhoods that don't appear on any travel guide.
            </p>
            <p>
              I created DrifterTrip to help more people experience that. The idea is simple:
              connect travelers with local people who want to share their city — no tours, no luxury packages,
              just the real experience of living like a local in another country, even if it's just for a weekend.
            </p>
            <p>
              Right now we're starting with <strong>Prague</strong> and <strong>Rome</strong> — two cities
              I know well and that have the kind of energy that makes you want to stay a little longer.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.values}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '48px', textAlign: 'center' }}>
            What we <em>believe</em>
          </h2>
          <div className={styles.valuesGrid}>
            <div className={styles.value}>
              <span className={styles.valueNum}>01</span>
              <h3 className={styles.valueTitle}>Real over polished</h3>
              <p className={styles.valueDesc}>
                The best travel moments are unplanned. We connect you with real people, not scripted experiences.
              </p>
            </div>
            <div className={styles.value}>
              <span className={styles.valueNum}>02</span>
              <h3 className={styles.valueTitle}>Travel is for everyone</h3>
              <p className={styles.valueDesc}>
                You don't need a big budget to have an unforgettable trip. Just the right people and the right city.
              </p>
            </div>
            <div className={styles.value}>
              <span className={styles.valueNum}>03</span>
              <h3 className={styles.valueTitle}>Locals know best</h3>
              <p className={styles.valueDesc}>
                No algorithm can replace someone who's lived in a city their whole life. That's who we put you with.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
