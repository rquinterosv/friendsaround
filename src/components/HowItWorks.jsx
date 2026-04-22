import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { ChevronLeft, ChevronRight, X, MapPin, Clock, Coffee, Sunset, Moon, Map, ExternalLink } from 'lucide-react'
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

function DayTripsModal({ guide, onClose }) {
  const guideName = guide?.name || 'Guide'
  const itinerary = guide?.days || []
  const [currentDay, setCurrentDay] = useState(0)
  const [showMap, setShowMap] = useState(false)

  const allSpots = itinerary.flatMap(day => 
    day.sections?.flatMap(s => s.spots?.filter(sp => sp.name) || []) || []
  )

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
          <div className={styles.modalHeader}>
            <span className="section-label">{guideName}'s Weekend</span>
            <h2 className={styles.modalTitle}>3-Day Itinerary</h2>
            <p className={styles.noItinerary}>No itinerary available yet.</p>
          </div>
        </div>
      </div>
    )
  }

  const nextDay = () => setCurrentDay((c) => (c + 1) % itinerary.length)
  const prevDay = () => setCurrentDay((c) => (c - 1 + itinerary.length) % itinerary.length)

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose}>
          <X size={24} />
        </button>
        <div className={styles.modalHeader}>
          <span className="section-label">{guideName}'s Weekend</span>
          <h2 className={styles.modalTitle}>{itinerary.length}-Day Itinerary</h2>
        </div>
        
        <div className={styles.carouselContainer}>
          <button className={styles.carouselBtn} onClick={prevDay} aria-label="Previous day">
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.carouselSlide}>
            <div className={styles.dayContent}>
              <div className={styles.dayHeader}>
                <h3 className={styles.dayTitle}>Day {itinerary[currentDay].day}: {itinerary[currentDay].title}</h3>
                {itinerary[currentDay].budget && (
                  <span className={styles.dayBudget}>€{itinerary[currentDay].budget}</span>
                )}
              </div>
              {itinerary[currentDay].intro && (
                <p className={styles.dayDescription}>{itinerary[currentDay].intro}</p>
              )}
              
              {(() => {
                const allSpots = itinerary[currentDay].sections?.flatMap(s => s.spots?.filter(sp => sp.name) || []) || []
                const spotImages = allSpots.filter(sp => sp.image)
                if (spotImages.length > 0) {
                  return (
                    <div className={styles.spotImagesGrid}>
                      {spotImages.map((spot, i) => (
                        <div key={i} className={styles.spotImageCard}>
                          <img src={spot.image} alt={spot.name} className={styles.spotImage} />
                          <span className={styles.spotImageLabel}>{spot.name}</span>
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              })()}
              
              <div className={styles.activitiesList}>
                {itinerary[currentDay].sections?.map((section, sectionIndex) => (
                  <div key={sectionIndex} className={styles.sectionBlock}>
                    <span className={styles.sectionTime}>{section.time}</span>
                    {section.spots?.filter(s => s.name).map((spot, spotIndex) => (
                      <div key={spotIndex} className={styles.activityItem}>
                        <MapPin size={14} className={styles.activityIcon} />
                        <div className={styles.spotContent}>
                          <span className={styles.activityText}>{spot.name}</span>
                          {spot.description && <span className={styles.spotDesc}>{spot.description}</span>}
                          {spot.price && <span className={styles.spotPrice}>€{spot.price}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button className={styles.carouselBtn} onClick={nextDay} aria-label="Next day">
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className={styles.carouselDots}>
          {itinerary.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === currentDay ? styles.dotActive : ''}`}
              onClick={() => setCurrentDay(i)}
              aria-label={`Go to day ${i + 1}`}
            />
          ))}
        </div>

        <div className={styles.mapSection}>
          <button 
            className={styles.mapButton}
            onClick={() => setShowMap(!showMap)}
          >
            <Map size={18} />
            {showMap ? 'Hide Map' : `View ${allSpots.length} Spots on Map`}
          </button>
          
          {showMap && (
            <div className={styles.mapContainer}>
              <div className={styles.mapEmbed}>
                {allSpots.length > 0 ? (
                  <iframe
                    title="Itinerary Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '8px' }}
                    loading="lazy"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                        <style>
                          * { margin: 0; padding: 0; }
                          #map { height: 100%; width: 100%; }
                          .custom-icon { background: #c45d3a; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
                        </style>
                      </head>
                      <body>
                        <div id="map"></div>
                        <script>
                          var map = L.map('map').setView([50.0755, 14.4378], 13);
                          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                          }).addTo(map);
                          
                          var bounds = [];
                          var spots = ${JSON.stringify(allSpots.map(s => ({ name: s.name, description: s.description })))};
                          var defaultIcon = L.divIcon({ className: 'custom-icon', html: '📍', iconSize: [24, 24] });
                          
                          spots.forEach(function(spot, i) {
                            var marker = L.marker([50.0755 + (Math.random() - 0.5) * 0.02, 14.4378 + (Math.random() - 0.5) * 0.02], { icon: defaultIcon }).addTo(map);
                            marker.bindPopup('<strong>' + spot.name + '</strong><br>' + (spot.description || ''));
                            bounds.push(marker.getLatLng());
                          });
                          
                          if (bounds.length > 0) {
                            map.fitBounds(bounds, { padding: [50, 50] });
                          }
                        </script>
                      </body>
                      </html>
                    `}
                  />
                ) : (
                  <div className={styles.noMapMessage}>
                    <MapPin size={32} />
                    <p>Add spots to see them on the map</p>
                  </div>
                )}
              </div>
              <a 
                href={`https://www.google.com/maps/search/${allSpots.map(s => encodeURIComponent(s.name)).join('/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.googleMapsLink}
              >
                <ExternalLink size={14} />
                Open in Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const [selectedCity, setSelectedCity] = useState(null)
  const [pragueGuides, setPragueGuides] = useState([])
  const [romeGuides, setRomeGuides] = useState([])
  const [loadingPragueGuides, setLoadingPragueGuides] = useState(true)
  const [loadingRomeGuides, setLoadingRomeGuides] = useState(true)
  const [showDayTripsModal, setShowDayTripsModal] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState(null)

  useEffect(() => {
    const fetchPragueGuides = async () => {
      try {
        const q = query(collection(db, 'guides'), where('approved', '==', true))
        const snapshot = await getDocs(q)
        const guides = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(g => g.country === 'Czech Republic')
        setPragueGuides(guides)
      } catch (err) {
        console.error('Error fetching Prague guides:', err)
      } finally {
        setLoadingPragueGuides(false)
      }
    }
    const fetchRomeGuides = async () => {
      try {
        const q = query(collection(db, 'guides'), where('approved', '==', true))
        const snapshot = await getDocs(q)
        const guides = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(g => g.country === 'Italy')
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
                <div key={guide.id} className={styles.guideCard}>
                  <img 
                    src={guide.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'} 
                    alt={guide.name} 
                    className={styles.guideImage} 
                  />
                  <div className={styles.guideInfo}>
                    <h3 className={styles.guideName}>{guide.name}</h3>
                    <p className={styles.guideExperience}>{guide.experience}</p>
                    <button 
                      className={styles.viewItineraryBtn}
                      onClick={() => {
                        setSelectedGuide(guide)
                        setShowDayTripsModal(true)
                      }}
                    >
                      View 3-Day Trip
                    </button>
                  </div>
                </div>
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
                <div key={guide.id} className={styles.guideCard}>
                  <img 
                    src={guide.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'} 
                    alt={guide.name} 
                    className={styles.guideImage} 
                  />
                  <div className={styles.guideInfo}>
                    <h3 className={styles.guideName}>{guide.name}</h3>
                    <p className={styles.guideExperience}>{guide.experience}</p>
                    <button 
                      className={styles.viewItineraryBtn}
                      onClick={() => {
                        setSelectedGuide(guide)
                        setShowDayTripsModal(true)
                      }}
                    >
                      View 3-Day Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDayTripsModal && (
        <DayTripsModal 
          guide={selectedGuide} 
          onClose={() => {
            setShowDayTripsModal(false)
            setSelectedGuide(null)
          }} 
        />
      )}
    </section>
  )
}
