import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import SignupForm from '../components/SignupForm'
import styles from './Partners.module.css'

const tours = [
  {
    name: 'Bohemian & Saxon Switzerland',
    departure: 'From Prague',
    price: '€152',
    duration: '10 hours',
    age: '14+',
    groupSize: 'Max 14 guests',
    description:
      'Full-day guided hiking through Bohemian and Saxon Switzerland. Explore dramatic sandstone cliffs, ancient forests, and breathtaking natural landscapes with a local expert.',
    highlights: [
      'Pravčická Gate — Europe\'s largest natural sandstone arch',
      'Hike through wild gorges and ancient forests',
      'Traditional Czech lunch included',
      'Small group with local guide',
    ],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/5/5f/Pravcicka_brana_001.jpg',
  },
  {
    name: 'Bohemian & Saxon Switzerland',
    departure: 'From Dresden',
    price: '€129',
    duration: '10 hours',
    age: '14+',
    groupSize: 'Max 14 guests',
    description:
      'Hike through sandstone cliffs, forests, and river canyons in this stunning national park region just outside Dresden.',
    highlights: [
      'Cross the border from Germany into Czech wilderness',
      'Dramatic canyon and cliff formations',
      'Authentic local meal along the way',
      'Expert guide who grew up in the region',
    ],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/3/33/Lilienstein_Saxon_Switzerland.jpg',
  },
  {
    name: 'Narnia Tour',
    departure: 'From Prague',
    price: '€140',
    duration: '12 hours',
    age: '14+',
    groupSize: 'Max 14 guests',
    description:
      'Discover the surreal sandstone landscapes of Tisa Walls and the iconic Bastei Bridge — locations that inspired Chronicles of Narnia.',
    highlights: [
      'Tisa Walls — the real-life Narnia film location',
      'Bastei Bridge with panoramic Saxon views',
      'Cinematic landscapes you won\'t believe are real',
      'Locally sourced lunch in a traditional village',
    ],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/3/3f/Tyssaerwaende2.jpg',
  },
  {
    name: 'Narnia Tour',
    departure: 'From Dresden',
    price: '€129',
    duration: '12 hours',
    age: '14+',
    groupSize: 'Max 14 guests',
    description:
      'Cinema-inspired day trip featuring the mystical Tisa Walls and Bastei Bridge. Walk through landscapes that feel like stepping into another world.',
    highlights: [
      'Bastei Bridge — Germany\'s most iconic viewpoint',
      'Tisa rock formations from the Narnia films',
      'Full day immersed in nature and history',
      'Small group, personal attention from your guide',
    ],
    image:
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Basteibr%C3%BCcke_morgens_%28Zuschnitt%29.jpg',
  },
]

export default function Partners() {
  const scrollToBooking = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            drifter<em>trip</em>
          </Link>
          <div className={styles.navLinks}>
            <Link to="/packages" className={styles.navLink}>Packages</Link>
            <Link to="/" className={styles.backLink}>← Back to home</Link>
          </div>
        </nav>

        <div className={styles.content}>
          <p className="section-label">Guided tours</p>
          <h1 className={styles.headline}>
            Day trips that go<br />
            <em>beyond</em> the city
          </h1>
          <p className={styles.sub}>
            Not everything worth seeing is inside the city. We've curated the best
            day trips with local experts — small groups, real nature, and places
            most tourists never reach.
          </p>
        </div>
      </section>

      <section className={styles.trustBar}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>14</span>
              <span className={styles.trustLabel}>Max group size</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>Local</span>
              <span className={styles.trustLabel}>Expert guides</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>10–12h</span>
              <span className={styles.trustLabel}>Full-day adventures</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustNum}>Included</span>
              <span className={styles.trustLabel}>Traditional meals</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.toursSection}>
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>
            Available tours
          </p>
          <h2
            className="section-title"
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            Bohemian & Saxon <em>Switzerland</em>
          </h2>

          <div className={styles.toursList}>
            {tours.map((tour, j) => (
              <div key={j} className={styles.tourCard}>
                <div className={styles.tourImageWrap}>
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className={styles.tourImage}
                  />
                  <span className={styles.tourDeparture}>{tour.departure}</span>
                </div>
                <div className={styles.tourBody}>
                  <div className={styles.tourTop}>
                    <h3 className={styles.tourName}>{tour.name}</h3>
                    <div className={styles.tourMeta}>
                      <span className={styles.tourDetail}>{tour.duration}</span>
                      <span className={styles.tourDetail}>Ages {tour.age}</span>
                      <span className={styles.tourDetail}>{tour.groupSize}</span>
                    </div>
                    <p className={styles.tourDesc}>{tour.description}</p>
                  </div>
                  <ul className={styles.tourHighlights}>
                    {tour.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                  <div className={styles.tourFooter}>
                    <div className={styles.tourPrice}>
                      <span className={styles.tourPriceFrom}>from</span>
                      <span className={styles.tourPriceValue}>{tour.price}</span>
                      <span className={styles.tourPricePer}>/ person</span>
                    </div>
                    <button className={styles.bookBtn} onClick={scrollToBooking}>
                      Book this tour
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SignupForm />

      <Footer />
    </>
  )
}
