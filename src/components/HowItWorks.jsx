import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, MapPin, Clock, Coffee, Sunset, Moon, Map, ExternalLink } from 'lucide-react'
import { getCities, getGuides, getDayTrips, getWeekTrips } from '../lib/api'
import styles from './HowItWorks.module.css'
import TourDetailModal from './TourDetailModal'
import taghazoutImg from '../assets/trips/tagazhout/IMG_7861.JPEG'
import dresdenImg from '../assets/trips/dresden/IMG_7614.JPEG'
import saxonImg1 from '../assets/trips/saxon/IMG_1146.JPEG'
import saxonImg2 from '../assets/trips/saxon/IMG_7649.JPEG'
import saxonImg3 from '../assets/trips/saxon/saxon.jpeg'
import taghazoutWeekImg1 from '../assets/trips/tagazhout/weektrip/3A5E3FA3-7241-48B0-A59B-D2D551E54E8D.JPEG'
import taghazoutWeekImg2 from '../assets/trips/tagazhout/weektrip/C6639E97-BB02-45E0-8261-FF46C23F844A.JPEG'
import taghazoutWeekImg3 from '../assets/trips/tagazhout/weektrip/IMG_0003.JPEG'

function AutoSlider({ images, alt }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <div className={styles.sliderWrap}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`${alt} ${i + 1}`}
          className={`${styles.sliderImage} ${i === current ? styles.sliderActive : ''}`}
        />
      ))}
    </div>
  )
}

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
  { name: 'Prague', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80' },
  { name: 'Rome', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' },
  { name: 'Taghazout', image: taghazoutImg },
  { name: 'Dresden', image: dresdenImg },
]

const pragueTours = [
  {
    id: 'bohemian',
    name: 'Bohemian and Saxon Switzerland',
    departure: 'From Prague',
    duration: 'Full day',
    price: '€140',
    gallery: [saxonImg1, saxonImg2, saxonImg3],
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
    image: 'https://images.unsplash.com/photo-1502680390469-be582b836c6b?w=800&q=80',
    gallery: [taghazoutWeekImg1, taghazoutWeekImg2, taghazoutWeekImg3],
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
    gallery: [saxonImg1, saxonImg2, saxonImg3],
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

  const allSpots = itinerary[currentDay]?.sections?.flatMap(s =>
    s.spots?.filter(sp => sp.name && sp.lat && sp.lng) || []
  ) || []

  const hasSpotsWithCoords = allSpots.length > 0

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
                    {section.description && (
                      <p className={styles.sectionDescription}>{section.description}</p>
                    )}
                    {section.spots?.map((spot, spotIndex) => (
                      <div key={spotIndex} className={styles.activityItem}>
                        <MapPin size={14} className={styles.activityIcon} />
                        <div className={styles.spotContent}>
                          {spot.name && <span className={styles.activityText}>{spot.name}</span>}
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

           {showMap && hasSpotsWithCoords && (
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

function PragueContent({ pragueGuides, setSelectedGuide, setShowDayTripsModal, setSelectedTour }) {
  return (
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
              <AutoSlider images={tour.gallery} alt={tour.name} />
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
  )
}

function RomeContent({ romeGuides, setSelectedGuide, setShowDayTripsModal }) {
  return (
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
  )
}

function TaghazoutContent({ setSelectedTour }) {
  return (
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
            <AutoSlider images={toursData.taghazoutWeek.gallery} alt="Taghazout Week" />
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
  )
}

function DresdenContent({ setSelectedTour }) {
  return (
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
            <AutoSlider images={toursData.dresdenHiking.gallery} alt="Dresden Day Trip" />
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
  )
}

export default function HowItWorks() {
  const [selectedCity, setSelectedCity] = useState(null)
  const [citiesData, setCitiesData] = useState([])
  const [pragueGuides, setPragueGuides] = useState([])
  const [romeGuides, setRomeGuides] = useState([])
  const [showDayTripsModal, setShowDayTripsModal] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [selectedTour, setSelectedTour] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cities with service counts
        const citiesResult = await getCities()
        if (citiesResult.success) {
          setCitiesData(citiesResult.data)
        }

        // Fetch guides
        const guidesResult = await getGuides()
        if (guidesResult.success) {
          const prague = guidesResult.data.filter(g => g.country === 'Czech Republic')
          const rome = guidesResult.data.filter(g => g.country === 'Italy')
          setPragueGuides(prague)
          setRomeGuides(rome)
        }

        // Fetch day trips for cities
        const dayTripsResult = await getDayTrips()
        if (dayTripsResult.success) {
          console.log('Day trips loaded:', dayTripsResult.data.length)
        }

        // Fetch week trips for cities
        const weekTripsResult = await getWeekTrips()
        if (weekTripsResult.success) {
          console.log('Week trips loaded:', weekTripsResult.data.length)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [])

  // Check if city has active services
  const getCityServices = (cityName) => {
    const city = citiesData.find(c => c.name === cityName)
    if (!city) return { hasServices: false, walk: 0, day: 0, week: 0 }
    const walkCount = parseInt(city.walk_trips_count) || 0
    const dayCount = parseInt(city.day_trips_count) || 0
    const weekCount = parseInt(city.week_trips_count) || 0
    return {
      hasServices: walkCount > 0 || dayCount > 0 || weekCount > 0,
      walk: walkCount,
      day: dayCount,
      week: weekCount
    }
  }

  const pragueServices = getCityServices('Prague')
  const romeServices = getCityServices('Rome')
  const taghazoutServices = getCityServices('Taghazout')
  const dresdenServices = getCityServices('Dresden')

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
            {cities.map((city, i) => {
              const cityKey = city.name.toLowerCase()
              const isSelected = selectedCity === cityKey
              
              // Get service counts for this city from API data
              const services = getCityServices(city.name)
              const isEnabled = services.hasServices

              const cityContent = isSelected && (
                <div className={styles.cityContentMobile}>
                  {city.name === 'Prague' && pragueServices.hasServices && (
                    <PragueContent
                      pragueGuides={pragueGuides}
                      setSelectedGuide={setSelectedGuide}
                      setShowDayTripsModal={setShowDayTripsModal}
                      setSelectedTour={setSelectedTour}
                    />
                  )}
                  {city.name === 'Rome' && romeServices.hasServices && (
                    <RomeContent
                      romeGuides={romeGuides}
                      setSelectedGuide={setSelectedGuide}
                      setShowDayTripsModal={setShowDayTripsModal}
                    />
                  )}
                  {city.name === 'Taghazout' && taghazoutServices.hasServices && (
                    <TaghazoutContent setSelectedTour={setSelectedTour} />
                  )}
                  {city.name === 'Dresden' && dresdenServices.hasServices && (
                    <DresdenContent setSelectedTour={setSelectedTour} />
                  )}
                </div>
              )

              return (
                <div key={i} className={styles.cityItem}>
                  {isEnabled ? (
                    <button
                      className={styles.cityThumb}
                      onClick={() => setSelectedCity(isSelected ? null : cityKey)}
                    >
                      <img src={city.image} alt={city.name} className={styles.cityImg} />
                      <span className={styles.cityName}>{city.name}</span>
                    </button>
                  ) : (
                    <div className={`${styles.cityThumb} ${styles.cityDisabled}`}>
                      <img src={city.image} alt={city.name} className={styles.cityImg} />
                      <span className={styles.cityName}>{city.name}</span>
                      <span className={styles.comingSoon}>Coming soon</span>
                    </div>
                  )}
                  {cityContent}
                </div>
              )
            })}
          </div>

          <div className={styles.desktopContent}>
            {selectedCity === 'prague' && pragueServices.hasServices && (
              <PragueContent
                pragueGuides={pragueGuides}
                setSelectedGuide={setSelectedGuide}
                setShowDayTripsModal={setShowDayTripsModal}
                setSelectedTour={setSelectedTour}
              />
            )}
            {selectedCity === 'rome' && romeServices.hasServices && (
              <RomeContent
                romeGuides={romeGuides}
                setSelectedGuide={setSelectedGuide}
                setShowDayTripsModal={setShowDayTripsModal}
              />
            )}
            {selectedCity === 'taghazout' && taghazoutServices.hasServices && (
              <TaghazoutContent setSelectedTour={setSelectedTour} />
            )}
            {selectedCity === 'dresden' && dresdenServices.hasServices && (
              <DresdenContent setSelectedTour={setSelectedTour} />
            )}
          </div>
        </div>
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
