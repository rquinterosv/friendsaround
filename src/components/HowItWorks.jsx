import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { ChevronLeft, ChevronRight, X, MapPin, Clock, Coffee, Sunset, Moon, Map, ExternalLink } from 'lucide-react'
import styles from './HowItWorks.module.css'
import TourDetailModal from './TourDetailModal'

const steps = [
  {
    num: '01',
    title: 'Pick your experience',
    desc: 'Walking tour, day trip, or a full week abroad. You choose the format, we handle the rest.',
  },
  {
    num: '02',
    title: 'We connect you with the right people',
    desc: 'Every experience runs with someone who actually knows what they\'re doing — local guides, vetted partners, real operators.',
  },
  {
    num: '03',
    title: 'You travel differently',
    desc: 'No bus. No script. No itinerary that looks like everyone else\'s Instagram.',
  },
]

const cities = [
  {
    name: 'Prague',
    image: '/images/prague-day-trip.jpg',
  },
  {
    name: 'Rome',
    image: '/images/prague-day-trip.jpg',
  },
  {
    name: 'Taghazout',
    image: '/images/saxon-switzerland.jpg',
  },
  {
    name: 'Dresden',
    image: '/images/dresden-day-trip.jpg',
  },
]

const pragueTours = [
  {
    id: 'bohemian',
    name: 'Bohemian and Saxon Switzerland',
    departure: 'From Prague',
    duration: 'Full day',
    price: '€140',
    image: 'https://images.unsplash.com/photo-1559628231-87984f0477db?w=800&q=80&auto=format&fit=crop',
  },
]

const toursData = {
  pragueHiking: {
    id: 'prague-hiking',
    name: 'Full-Day Hiking from Prague',
    category: 'Day trips',
    price: '140',
    duration: 'Full day — depart 6:45–7:30 AM, return 6–8 PM',
    distance: '10–12 km',
    difficulty: 'Moderate',
    departure: 'From Prague',
    image: '/images/prague-day-trip.jpg',
    highlights: [
      'Bastei Bridge — icon of Saxon Switzerland',
      'Pravčická Arch — largest natural sandstone arch in Europe',
      'Wild Gorge — serene boat ride through a hidden canyon',
    ],
    included: [
      'Hotel pick-up & drop-off',
      'National park entry fees',
      'Round-trip transport in a comfortable van',
      'Full à la carte lunch (vegetarian/vegan options available)',
      'Professional guide (English, Spanish, or Czech)',
    ],
    toBring: [
      'Valid passport or ID (crossing into Czech Republic)',
      'Comfortable hiking shoes with good grip',
      'Weather-appropriate clothing (layers recommended)',
      'Water and snacks for the trail',
    ],
    goodToKnow: [
      'Not suitable for children under 7 or those with limited mobility',
      'Tour itinerary may vary due to weather',
      'No drones allowed in the park',
      'Pick-up details sent the evening before',
    ],
  },
    taghazoutWeek: {
    id: 'taghazout-week',
    name: 'One Week in Morocco',
    category: 'Week trip',
    price: '600',
    duration: '7 days',
    departure: 'Agadir Airport',
    image: '/images/taghazout-week.jpg',
    itinerary: [
      { day: 1, description: 'Arrival, welcome tea, sunset beach walk, Moroccan dinner' },
      { day: 2, description: 'Surf lesson (2h) + free surfing (2h) + dinner' },
      { day: 3, description: 'Paradise Valley trip (optional) + free surfing (2h) + dinner' },
      { day: 4, description: 'Surf lesson (2h) + free surfing (2h) + dinner' },
      { day: 5, description: 'Surf lesson (2h) + free surfing (2h) + cooking class (optional)' },
      { day: 6, description: 'Surf lesson (2h) + free surfing (2h) + farewell dinner' },
      { day: 7, description: 'Breakfast + airport drop-off' },
    ],
    included: [
      'Airport transfers (Agadir)',
      'Accommodation',
      'Daily breakfast & dinners',
      'Surf coaching (board & wetsuit included)',
    ],
    optionalExtras: [
      { name: 'Sandboarding', price: '30' },
      { name: 'Paradise Valley', price: '30' },
      { name: 'Souk Al Ehad tour', price: '15' },
      { name: 'Yoga', price: '12' },
      { name: 'Quad', price: '20' },
      { name: 'Horse riding', price: '20' },
      { name: 'Camel riding', price: '20' },
      { name: 'Jet ski 15min', price: '35' },
      { name: 'Cooking class', price: '8' },
    ],
    goodToKnow: [
      'Minimum group size: 4 people',
      'Available September / October',
      'Bookings confirmed in August',
    ],
  },
  dresdenHiking: {
    id: 'dresden-hiking',
    name: 'Full-Day Hiking from Dresden',
    category: 'Day trips',
    price: '120',
    duration: 'Full day — depart 7:45–8:20 AM, return 5:00–7:00 PM',
    distance: '10–12 km',
    difficulty: 'Moderate',
    departure: 'From Dresden',
    image: '/images/saxon-switzerland.jpg',
    gallery: [
      '/images/saxon-switzerland.jpg',
      '/images/IMG_1146.JPEG',
      '/images/IMG_7649.JPEG',
      '/images/saxon.jpeg',
    ],
    highlights: [
      'Bastei Bridge — iconic views over Elbe River',
      'Lilienstein Mountain — dramatic rock formation',
      'Königstein Fortress — historic hilltop citadel',
    ],
    included: [
      'Hotel pick-up & drop-off',
      'National park entry fees',
      'Round-trip transport in a comfortable van',
      'Full à la carte lunch (vegetarian/vegan options available)',
      'Professional guide (English, German, or Czech)',
    ],
    toBring: [
      'Valid passport or ID (crossing into Czech Republic)',
      'Comfortable hiking shoes with good grip',
      'Weather-appropriate clothing (layers recommended)',
      'Water and snacks for the trail',
    ],
    goodToKnow: [
      'Not suitable for children under 7 or those with limited mobility',
      'Tour itinerary may vary due to weather',
      'No drones allowed in the park',
      'Pick-up details sent the evening before',
    ],
  },
}

function DayTripsModal({ guide, onClose }) {
  const guideName = guide?.name || 'Guide'
  const itinerary = guide?.days || guide?.itinerary || []
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
  const [taghazoutGuides, setTaghazoutGuides] = useState([])
  const [loadingPragueGuides, setLoadingPragueGuides] = useState(true)
  const [loadingRomeGuides, setLoadingRomeGuides] = useState(true)
  const [loadingTaghazoutGuides, setLoadingTaghazoutGuides] = useState(true)
  const [showDayTripsModal, setShowDayTripsModal] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [selectedTour, setSelectedTour] = useState(null)

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
    const fetchTaghazoutGuides = async () => {
      try {
        const q = query(collection(db, 'guides'), where('approved', '==', true))
        const snapshot = await getDocs(q)
        const guides = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(g => g.country === 'Morocco')
        setTaghazoutGuides(guides)
      } catch (err) {
        console.error('Error fetching Taghazout guides:', err)
      } finally {
        setLoadingTaghazoutGuides(false)
      }
    }
    fetchPragueGuides()
    fetchRomeGuides()
    fetchTaghazoutGuides()
  }, [])

  const pragueEnabled = pragueGuides.length > 0
  const romeEnabled = romeGuides.length > 0

  return (
    <section id="how" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <p className="section-label">How it works</p>
          <h2 className="section-title">
            Travel different.<br /><em>Here's how</em>
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
              ) : city.name === 'Taghazout' ? (
                <button
                  key={i}
                  className={styles.cityThumb}
                  onClick={() => setSelectedCity(selectedCity === 'taghazout' ? null : 'taghazout')}
                >
                  <img src={city.image} alt={city.name} className={styles.cityImg} />
                  <span className={styles.cityName}>{city.name}</span>
                </button>
              ) : city.name === 'Dresden' ? (
                <button
                  key={i}
                  className={styles.cityThumb}
                  onClick={() => setSelectedCity(selectedCity === 'dresden' ? null : 'dresden')}
                >
                  <img src={city.image} alt={city.name} className={styles.cityImg} />
                  <span className={styles.cityName}>{city.name}</span>
                </button>
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
                  <div key={tour.id} className={styles.tourCard} onClick={() => setSelectedTour(toursData.pragueHiking)}>
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
                </div>
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

        {selectedCity === 'taghazout' && (
          <div className={styles.pragueContent}>
            <div className={styles.contentHeader}>
              <span className="section-label">Taghazout</span>
            </div>

            <div className={styles.sectionTitleWrap}>
              <h3 className={styles.sectionTitleRow}>Week trip</h3>
            </div>
              <div className={styles.toursGrid}>
                <div className={styles.tourCard} onClick={() => setSelectedTour(toursData.taghazoutWeek)}>
                  <div className={styles.tourImageWrap}>
                    <img src={toursData.taghazoutWeek.image} alt="Taghazout Week" className={styles.tourImage} />
                  <span className={styles.tourDeparture}>Taghazout</span>
                </div>
                <div className={styles.tourBody}>
                  <h3 className={styles.tourName}>One Week in Morocco</h3>
                  <div className={styles.tourMeta}>
                    <span className={styles.tourDetail}>7 days</span>
                  </div>
                  <div className={styles.tourPrice}>
                    <span className={styles.tourPriceValue}>€600</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedCity === 'dresden' && (
          <div className={styles.pragueContent}>
            <div className={styles.contentHeader}>
              <span className="section-label">Dresden</span>
            </div>

            <div className={styles.sectionTitleWrap}>
              <h3 className={styles.sectionTitleRow}>Day trips</h3>
            </div>
            <div className={styles.toursGrid}>
              <div className={styles.tourCard} onClick={() => setSelectedTour(toursData.dresdenHiking)}>
                <div className={styles.tourImageWrap}>
                  <img src={toursData.dresdenHiking.image} alt="Dresden Day Trip" className={styles.tourImage} />
                  <span className={styles.tourDeparture}>From Dresden</span>
                </div>
                <div className={styles.tourBody}>
                  <h3 className={styles.tourName}>Full-Day Hiking from Dresden</h3>
                  <div className={styles.tourMeta}>
                    <span className={styles.tourDetail}>Full day</span>
                  </div>
                  <div className={styles.tourPrice}>
                    <span className={styles.tourPriceValue}>€120</span>
                  </div>
                </div>
              </div>
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

      {selectedTour && (
        <TourDetailModal
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
        />
      )}
    </section>
  )
}
