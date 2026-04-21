import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import styles from './HowItWorks.module.css'

const steps = [
  {
    num: '01',
    title: 'Pick your city',
    desc: 'Choose between Prague or Rome. Each city has its own vibe — nightlife, culture, hidden gems, or all of the above.',
  },
  {
    num: '02',
    title: 'Meet your local',
    desc: "Every guide is verified and hand-picked. You see their profile, their story, and what kind of weekend they'll show you.",
  },
  {
    num: '03',
    title: 'Live like a local',
    desc: 'No museum lines, no tour groups. Just you, your guide, and an actual weekend — coffee spots, bars, the places they never put on maps.',
  },
]

const cities = [
  {
    name: 'Prague',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=300&fit=crop',
  },
  {
    name: 'Rome',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop',
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

export default function HowItWorks() {
  const [selectedCity, setSelectedCity] = useState(null)
  const [pragueGuides, setPragueGuides] = useState([])
  const [romeGuides, setRomeGuides] = useState([])
  const [loadingPragueGuides, setLoadingPragueGuides] = useState(true)
  const [loadingRomeGuides, setLoadingRomeGuides] = useState(true)

  useEffect(() => {
    const fetchPragueGuides = async () => {
      try {
        const q = query(
          collection(db, 'guides'),
          where('approved', '==', true),
          where('country', '==', 'Czech Republic')
        )
        const snapshot = await getDocs(q)
        const guides = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setPragueGuides(guides)
      } catch (err) {
        console.error('Error fetching Prague guides:', err)
      } finally {
        setLoadingPragueGuides(false)
      }
    }
    const fetchRomeGuides = async () => {
      try {
        const q = query(
          collection(db, 'guides'),
          where('approved', '==', true),
          where('country', '==', 'Italy')
        )
        const snapshot = await getDocs(q)
        const guides = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setRomeGuides(guides)
      } catch (err) {
        console.error('Error fetching Rome guides:', err)
      } finally {
        setLoadingRomeGuides(false)
      }
    }
    fetchPragueGuides()
    fetchRomeGuides()
  }, [])

  const pragueEnabled = pragueGuides.length > 0
  const romeEnabled = romeGuides.length > 0

  return (
    <section id="how" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label">The experience</p>
          <h2 className="section-title">
            Three steps to a<br /><em>real trip</em>
          </h2>
        </div>

        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.num}>{step.num}</span>
              <div className={styles.line} />
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.whereOps}>
          <p className="section-label">Where we operate</p>
          <div className={styles.citiesRow}>
            {cities.map((city, i) => (
              city.name === 'Rome' ? (
                romeEnabled ? (
                  <button 
                    key={i} 
                    className={styles.cityThumb}
                    onClick={() => setSelectedCity(selectedCity === 'rome' ? null : 'rome')}
                  >
                    <img src={city.image} alt={city.name} className={styles.cityImg} />
                    <span className={styles.cityName}>{city.name}</span>
                  </button>
                ) : (
                  <div key={i} className={`${styles.cityThumb} ${styles.cityDisabled}`}>
                    <img src={city.image} alt={city.name} className={styles.cityImg} />
                    <span className={styles.cityName}>{city.name}</span>
                    <span className={styles.comingSoon}>Coming soon</span>
                  </div>
                )
              ) : city.name === 'Prague' ? (
                pragueEnabled ? (
                  <button 
                    key={i} 
                    className={styles.cityThumb}
                    onClick={() => setSelectedCity(selectedCity === 'prague' ? null : 'prague')}
                  >
                    <img src={city.image} alt={city.name} className={styles.cityImg} />
                    <span className={styles.cityName}>{city.name}</span>
                  </button>
                ) : (
                  <div key={i} className={`${styles.cityThumb} ${styles.cityDisabled}`}>
                    <img src={city.image} alt={city.name} className={styles.cityImg} />
                    <span className={styles.cityName}>{city.name}</span>
                    <span className={styles.comingSoon}>Coming soon</span>
                  </div>
                )
              ) : null
            ))}
          </div>
        </div>

        {selectedCity === 'prague' && pragueEnabled && (
          <div className={styles.pragueContent}>
            <div className={styles.contentHeader}>
              <span className="section-label">Prague</span>
            </div>

            <div className={styles.sectionTitleWrap}>
              <h3 className={styles.sectionTitleRow}>Walking tours</h3>
            </div>
            <div className={styles.guidesGrid}>
              {pragueGuides.map((guide) => (
                <Link to="/guides" key={guide.id} className={styles.guideCard}>
                  <img 
                    src={guide.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'} 
                    alt={guide.name} 
                    className={styles.guideImage} 
                  />
                  <div className={styles.guideInfo}>
                    <h3 className={styles.guideName}>{guide.name}</h3>
                    <p className={styles.guideExperience}>{guide.experience}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.sectionTitleWrap} style={{ marginTop: '64px' }}>
              <h3 className={styles.sectionTitleRow}>Day trips</h3>
            </div>
            <div className={styles.toursGrid}>
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {selectedCity === 'rome' && romeEnabled && (
          <div className={styles.pragueContent}>
            <div className={styles.contentHeader}>
              <span className="section-label">Rome</span>
            </div>

            <div className={styles.sectionTitleWrap}>
              <h3 className={styles.sectionTitleRow}>Walking tours</h3>
            </div>
            <div className={styles.guidesGrid}>
              {romeGuides.map((guide) => (
                <Link to="/guides" key={guide.id} className={styles.guideCard}>
                  <img 
                    src={guide.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'} 
                    alt={guide.name} 
                    className={styles.guideImage} 
                  />
                  <div className={styles.guideInfo}>
                    <h3 className={styles.guideName}>{guide.name}</h3>
                    <p className={styles.guideExperience}>{guide.experience}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
