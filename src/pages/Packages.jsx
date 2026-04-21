import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import SignupForm from '../components/SignupForm'
import styles from './Packages.module.css'

const tiers = [
  {
    name: 'Free Explorer',
    tagline: 'We recommend, you explore',
    price: 'Free',
    priceNote: 'No cost, ever',
    includes: [
      'Curated list of free spots & hidden gems',
      'Self-guided 1, 2 or 3-day itinerary',
      'Local tips: where to eat, drink & wander',
      'Neighborhoods worth walking',
      'Best sunsets, parks & viewpoints',
    ],
    cta: 'Get the free guide',
  },
  {
    name: 'Local Companion',
    tagline: 'A real local by your side',
    price: 'From €40',
    priceNote: 'per day · per group',
    highlight: true,
    includes: [
      'Everything in Free Explorer',
      'A local friend walking with you',
      'Insider bars & restaurants only regulars know',
      'Choose 1, 2 or 3 days of company',
      'Flexible plans — day or night',
      'Local recommendations tailored to you',
    ],
    cta: 'Book a companion',
  },
  {
    name: 'Full Experience',
    tagline: 'We plan, you show up',
    price: 'Custom',
    priceNote: 'Min. 2–4 people · Quote on request',
    includes: [
      'Everything in Local Companion',
      'Restaurants & bars booked for you',
      'Day trips & activities arranged',
      'Transport between spots covered',
      'Custom itinerary built around your vibe',
      'Zero planning, zero decisions',
    ],
    cta: 'Request a quote',
  },
]

const pragueGuides = [
  {
    id: 'rafa',
    name: 'Rafa Quinteros',
    experience: 'Castle to Charles Bridge walk + local bar crawl',
    image: '/rafael.jpeg',
  },
  {
    id: 'marta',
    name: 'Marta Kowalski',
    experience: 'Historic pub crawl + local jazz bars',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face',
  },
]

const pragueTours = [
  {
    id: 'bohemian',
    name: 'Bohemian & Saxon Switzerland',
    departure: 'From Prague',
    duration: '10 hours',
    price: '€152',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Pravcicka_brana_001.jpg',
  },
  {
    id: 'narnia',
    name: 'Narnia Tour',
    departure: 'From Prague',
    duration: '12 hours',
    price: '€140',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Tyssaerwaende2.jpg',
  },
  {
    id: 'kutna',
    name: 'Kutna Hora Bone Church',
    departure: 'From Prague',
    duration: '4 hours',
    price: '€45',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kostnicek3.jpg/1280px-Kostnicek3.jpg',
  },
]

const galleries = [
  {
    city: 'Prague',
    country: 'Czech Republic',
    spots: [
      {
        spot: 'Charles Bridge',
        image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=900&q=80&auto=format&fit=crop',
      },
      {
        spot: 'Prague Castle',
        image: 'https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?w=900&q=80&auto=format&fit=crop',
      },
      {
        spot: 'Old Town Square',
        image: 'https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=900&q=80&auto=format&fit=crop',
      },
    ],
  },
  {
    city: 'Rome',
    country: 'Italy',
    spots: [
      {
        spot: 'Colosseum',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80&auto=format&fit=crop',
      },
      {
        spot: 'Trevi Fountain',
        image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=900&q=80&auto=format&fit=crop',
      },
      {
        spot: 'Pantheon',
        image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=900&q=80&auto=format&fit=crop',
      },
    ],
  },
]

export default function Packages() {
  const location = useLocation()
  const isPrague = location.pathname === '/prague'
  const [activeSection, setActiveSection] = useState('tiers')

  const scrollToCta = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <Link to="/" className={styles.backLink}>← Back to home</Link>
        </nav>

        {isPrague ? (
          <div className={styles.content}>
            <p className="section-label">Prague</p>
            <h1 className={styles.headline}>
              Your weekend in<br />
              <em>Prague</em>
            </h1>
            <p className={styles.sub}>
              Walking tours, day trips, and local experiences in Prague.
            </p>
          </div>
        ) : (
          <div className={styles.content}>
            <p className="section-label">How it works</p>
            <h1 className={styles.headline}>
              Three ways to<br />
              <em>drift</em> with us
            </h1>
            <p className={styles.sub}>
              Whether you want free tips or a fully planned trip, you pick how much
              (or how little) help you need. Available in Prague and Rome — for 1, 2 or 3 days.
            </p>
          </div>
        )}
      </section>

      {isPrague && (
        <section className={styles.tiersSection}>
          <div className="container">
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeSection === 'guides' ? styles.tabActive : ''}`}
                onClick={() => setActiveSection('guides')}
              >
                Walking tours
              </button>
              <button
                className={`${styles.tab} ${activeSection === 'tours' ? styles.tabActive : ''}`}
                onClick={() => setActiveSection('tours')}
              >
                Day trips
              </button>
            </div>

            {activeSection === 'guides' ? (
              <div className={styles.guidesGrid}>
                {pragueGuides.map((guide) => (
                  <Link to="/guides" key={guide.id} className={styles.guideCard}>
                    <img src={guide.image} alt={guide.name} className={styles.guideImage} />
                    <div className={styles.guideInfo}>
                      <h3 className={styles.guideName}>{guide.name}</h3>
                      <p className={styles.guideExperience}>{guide.experience}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.toursList}>
                {pragueTours.map((tour) => (
                  <Link to="/partners" key={tour.id} className={styles.tourCard}>
                    <div className={styles.tourImageWrap}>
                      <img src={tour.image} alt={tour.name} className={styles.tourImage} />
                      <span className={styles.tourDeparture}>{tour.departure}</span>
                    </div>
                    <div className={styles.tourBody}>
                      <h3 className={styles.tourName}>{tour.name}</h3>
                      <div className={styles.tourMeta}>
                        <span className={styles.tourDetail}>{tour.duration}</span>
                      </div>
                      <div className={styles.tourPrice}>
                        <span className={styles.tourPriceValue}>{tour.price}</span>
                        <span className={styles.tourPricePer}>/ person</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!isPrague && (
        <>
          <section className={styles.tiersSection}>
            <div className="container">
              <div className={styles.grid}>
                {tiers.map((tier, j) => (
                  <div
                    key={j}
                    className={`${styles.card} ${tier.highlight ? styles.highlight : ''}`}
                  >
                    {tier.highlight && <span className={styles.badge}>Most popular</span>}
                    <h3 className={styles.tierName}>{tier.name}</h3>
                    <p className={styles.tagline}>{tier.tagline}</p>
                    <div className={styles.priceBlock}>
                      <p className={styles.price}>{tier.price}</p>
                      <p className={styles.priceNote}>{tier.priceNote}</p>
                    </div>
                    <ul className={styles.includes}>
                      {tier.includes.map((item, k) => (
                        <li key={k}>{item}</li>
                      ))}
                    </ul>
                    <button className="primary" onClick={scrollToCta}>
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.gallerySection}>
            <div className="container">
              <p className="section-label" style={{ textAlign: 'center' }}>Where you'll go</p>
              <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '64px' }}>
                Prague & Rome, <em>up close</em>
              </h2>

              {galleries.map((g, i) => (
                <div key={i} className={styles.cityRow}>
                  <div className={styles.cityRowHeader}>
                    <h3 className={styles.cityRowName}>{g.city}</h3>
                    <span className={styles.cityRowCountry}>{g.country}</span>
                  </div>
                  <div className={styles.galleryGrid}>
                    {g.spots.map((s, j) => (
                      <div key={j} className={styles.galleryItem}>
                        <img src={s.image} alt={`${s.spot}, ${g.city}`} className={styles.galleryImg} />
                        <div className={styles.galleryCaption}>
                          <span className={styles.gallerySpot}>{s.spot}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <SignupForm />

      <Footer />
    </>
  )
}
