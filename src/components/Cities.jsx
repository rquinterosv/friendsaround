import { Link } from 'react-router-dom'
import styles from './Cities.module.css'

const guides = [
  {
    name: 'Rafael',
    location: 'Prague · 🇨🇱',
    tags: ['Walking Tour', 'Day Trip', 'Morocco Week'],
    color: '#8B9E94',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80&auto=format&fit=crop',
    link: '/guide-profile/rafael',
    active: true,
  },
  {
    name: 'Coming soon',
    location: 'Rome · Italy',
    color: '#6B6B6B',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80&auto=format&fit=crop',
    active: false,
  },
]

export default function Cities() {
  return (
    <section className={styles.section} id="guides-section">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="section-label">Your local guides</p>
            <h2 className="section-title">Real people.<br /><em>Real cities.</em> Hand-picked experiences.</h2>
          </div>
        </div>

        <div className={styles.grid}>
          {guides.map((guide, i) => (
            guide.active ? (
              <Link
                key={i}
                to={guide.link}
                className={styles.card}
                style={{ '--city-color': guide.color }}
              >
                <div
                  className={styles.cardBg}
                  style={{ backgroundImage: `url(${guide.image})` }}
                />
                <div className={styles.cardBody}>
                  <div>
                    <h3 className={styles.cityName}>{guide.name}</h3>
                    <span className={styles.country}>{guide.location}</span>
                  </div>
                  <p className={styles.tag}>{guide.tags.join(' · ')}</p>
                </div>
              </Link>
            ) : (
              <div
                key={i}
                className={styles.card}
                style={{ '--city-color': guide.color }}
              >
                <div
                  className={styles.cardBg}
                  style={{ backgroundImage: `url(${guide.image})`, filter: 'grayscale(100%)' }}
                />
                <div className={styles.cardBody}>
                  <div>
                    <h3 className={styles.cityName}>{guide.name}</h3>
                    <span className={styles.country}>{guide.location}</span>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        <p className={styles.more}>More guides joining soon</p>
      </div>
    </section>
  )
}