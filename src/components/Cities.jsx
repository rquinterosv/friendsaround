import { Link } from 'react-router-dom'
import styles from './Cities.module.css'

const cities = [
  {
    name: 'Prague',
    country: 'Czech Republic',
    tagline: "You've heard of it. You haven't seen it yet.",
    color: '#8B9E94',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80&auto=format&fit=crop',
    guide: {
      name: 'Rafael',
      flag: '🇨🇱',
      tags: ['Walking Tour', 'Day Trip', 'Morocco Week'],
    },
    link: '/guide-profile/rafael',
    active: true,
  },
  {
    name: 'Rome',
    country: 'Italy',
    tagline: 'History, pasta & the side tourists never find.',
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
            <p className="section-label">Where we go</p>
            <h2 className="section-title">Real people.<br /><em>Real cities.</em> Experiences worth telling.</h2>
          </div>
        </div>

        <div className={styles.grid}>
          {cities.map((city, i) => (
            city.active ? (
              <Link
                key={i}
                to={city.link}
                className={styles.card}
                style={{ '--city-color': city.color }}
              >
                <div
                  className={styles.cardBg}
                  style={{ backgroundImage: `url(${city.image})` }}
                />
                <div className={styles.cardBody}>
                  <div>
                    <h3 className={styles.cityName}>{city.name}</h3>
                    <span className={styles.country}>{city.country}</span>
                    <p className={styles.tag}>{city.tagline}</p>
                  </div>
                  <div className={styles.guideInfo}>
                    <span className={styles.guideName}>{city.guide.name} {city.guide.flag}</span>
                    <span className={styles.guideTags}>{city.guide.tags.join(' · ')}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div
                key={i}
                className={styles.card}
                style={{ '--city-color': city.color }}
              >
                <div
                  className={styles.cardBg}
                  style={{ backgroundImage: `url(${city.image})`, filter: 'grayscale(100%)' }}
                />
                <div className={styles.cardOverlay}>
                  <span className={styles.comingSoon}>Joining soon</span>
                </div>
                <div className={styles.cardBody}>
                  <div>
                    <h3 className={styles.cityName}>{city.name}</h3>
                    <span className={styles.country}>{city.country}</span>
                    <p className={styles.tag}>{city.tagline}</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        <p className={styles.more}>More cities coming soon</p>
      </div>
    </section>
  )
}