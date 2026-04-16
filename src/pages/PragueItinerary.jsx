import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '../components/Footer'
import SignupForm from '../components/SignupForm'
import styles from './PragueItinerary.module.css'

// Fix default marker icons in leaflet + bundler
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createNumberedIcon(number) {
  return L.divIcon({
    className: styles.mapMarker,
    html: `<div class="${styles.markerInner}">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const itinerary = [
  {
    day: 1,
    title: 'The Castle, the Beer & the Bridge',
    intro: "You're going to walk a lot today, but every step is worth it. You start up high at the castle and work your way down to the river. The trick is to start early — at 9am the castle is half empty, by 11 it feels like an airport.",
    mapCenter: [50.0875, 14.4050],
    mapZoom: 14,
    sections: [
      {
        time: 'Morning',
        spots: [
          {
            name: 'Prague Castle',
            fullName: 'Prague Castle (Prazsky hrad)',
            description: "Get the audioguide at the entrance, not the group tour. The audioguide lets you go at your own pace and tells you things the umbrella-waving guides skip — like the hidden details in Mucha's stained glass windows inside St. Vitus Cathedral. If you go on a Tuesday or Wednesday, you'll dodge the worst crowds. Enter through the east gate (from Pohorelec) — almost nobody does, and you'll skip the main queue.",
            price: '12-15',
            coords: [50.0911, 14.4006],
          },
        ],
      },
      {
        time: 'Afternoon',
        spots: [
          {
            name: 'Restaurace U Labuti',
            description: "It's literally at the foot of the castle descent, on Hradcanske namesti. Order the svickova (sirloin in cream sauce) or the vepro-knedlo-zelo. This is real Czech food, not the watered-down tourist version. The portions are huge — don't order a starter unless you want to roll downhill.",
            price: '10-14',
            coords: [50.0895, 14.3975],
          },
          {
            name: 'U Glaubicu',
            fullName: 'U Glaubicu (Mala Strana)',
            description: 'Walk down to Mala Strana and stop at this bar that locals defend with their lives. No Instagrammable terrace, no waiters in leather aprons. Just properly poured Pilsner Urquell on tap and a "this is where we come after work" vibe. Order a pullitr (half-liter) and sit down. Nobody on a normal tour is going to tell you about this place.',
            price: '2-3',
            priceNote: 'per beer',
            coords: [50.0862, 14.4035],
          },
        ],
      },
      {
        time: 'Evening',
        spots: [
          {
            name: 'Charles Bridge',
            fullName: 'Charles Bridge (Karluv most)',
            description: "Yes, it's the most famous spot in Prague. But there's a way to enjoy it and a way to suffer through it. The right way: go after 8pm in summer or after 6pm in winter. Half the tourists are already at dinner. The statues light up, the castle glows above, and the river does the rest. Walk slowly, stop in the middle, look both ways.",
            price: 'Free',
            coords: [50.0865, 14.4114],
          },
        ],
      },
    ],
    budget: '28 - 38',
  },
  {
    day: 2,
    title: 'The Heart of Old Town',
    intro: "Today it's Stare Mesto — the Old Town. This is where Prague can either sweep you off your feet or let you down. It all depends on whether you stay on the surface or dig a little deeper. Let's dig.",
    mapCenter: [50.0880, 14.4200],
    mapZoom: 15,
    sections: [
      {
        time: 'Morning',
        spots: [
          {
            name: 'Old Town Square',
            fullName: 'Old Town Square + Astronomical Clock',
            description: "Yes, you're going. Everyone does. But the trick is to get there before 9am, when the square is nearly empty and you can take photos without 400 heads in the frame. The astronomical clock chimes every hour on the hour — honestly, the apostle show lasts 40 seconds and isn't that impressive, but the 15th-century mechanism is. What nobody does: climb the Old Town Hall tower right when it opens. The views are unreal and there's no queue.",
            price: '5',
            priceNote: 'Old Town Hall tower',
            coords: [50.0874, 14.4213],
          },
          {
            name: 'Clementinum',
            description: "A 5-minute walk from the square. The baroque library is one of the most beautiful in the world and almost nobody visits. You can only see it on a short guided tour (15 min), but it's worth every second. You go up the astronomical tower and get a perspective of Prague's skyline that doesn't show up on Instagram.",
            price: '6-8',
            coords: [50.0863, 14.4163],
          },
        ],
      },
      {
        time: 'Afternoon',
        spots: [
          {
            name: 'Lokal',
            fullName: 'Lokal (Dlouha 33)',
            description: 'This restaurant is an institution. Actual Czech people come here, not just tourists who "discovered a local spot." The unpasteurized Pilsner arrives by tank every day. Order the bramborove knedliky (potato dumplings) or the tatarak — yes, it\'s raw beef tartare and here you spread it yourself on garlic toast. If that\'s not your thing, the schnitzel is also massive.',
            price: '10-14',
            priceNote: 'main + beer',
            coords: [50.0903, 14.4249],
          },
          {
            name: 'Jewish Quarter',
            fullName: 'Jewish Quarter (Josefov)',
            description: "Stroll through the streets after lunch. If you're into history, the combined ticket to the old cemetery and synagogues is worth it. If not, just walk. The art nouveau facades on Parizska and Maiselova streets are a free open-air museum. Fun fact: Franz Kafka was born 50 meters from the Old Town Square — his rotating statue by David Cerny is inside the Quadrio mall (free and surreal).",
            price: '0-14',
            priceNote: 'depending on Jewish Quarter entry',
            coords: [50.0899, 14.4188],
          },
        ],
      },
      {
        time: 'Evening',
        spots: [
          {
            name: 'Hemingway Bar',
            description: "Hidden on a small street near the square (Karoliny Svetle 26). This is a serious cocktail bar — the best absinthe in Prague, daiquiris that will make you rethink everything you knew about daiquiris, and a speakeasy atmosphere without the pretension. Book ahead or go early (before 9pm) because it fills up fast. It's not cheap, but one night here beats three at a generic bar.",
            price: '10-16',
            priceNote: '2 cocktails',
            coords: [50.0835, 14.4149],
          },
        ],
      },
    ],
    budget: '31 - 57',
  },
  {
    day: 3,
    title: "The Prague That's Not in the Guidebooks",
    intro: "Last day. You've seen the castle, the bridge, the Old Town. Today we cross to the other side — Vinohrady, Zizkov, and the Prague where people actually live. This is where you fall in love.",
    mapCenter: [50.0760, 14.4350],
    mapZoom: 13,
    sections: [
      {
        time: 'Morning',
        spots: [
          {
            name: 'Riegrovy Sady',
            fullName: 'Riegrovy Sady (park + beer garden)',
            description: "Start the day in this park in the Vinohrady neighborhood. If the weather's nice, the beer garden has the best castle views in the entire city (yes, better than from the bridge). Grab a coffee or go straight for a beer — nobody's judging here. This is where locals walk their dogs, have picnics, and pretend to work on their laptops.",
            price: '2-4',
            priceNote: 'coffee or beer',
            coords: [50.0793, 14.4400],
          },
          {
            name: 'Zizkov TV Tower',
            description: "That brutalist tower with giant babies crawling up it (another David Cerny piece). It's ugly and beautiful at the same time. Go up to the observation deck — the 360-degree views are the best in Prague, hands down. And unlike the clock tower, there's never a queue here.",
            price: '12',
            coords: [50.0813, 14.4513],
          },
        ],
      },
      {
        time: 'Afternoon',
        spots: [
          {
            name: 'Cafe Sladkovsky',
            fullName: 'Cafe Sladkovsky (Sevastopolska 17)',
            description: "A neighborhood bistro where locals actually eat lunch. Czech daily menu at real prices, not tourist prices. It changes every day but there's always a soup + main option. The vibe is calm, the tables are small, and the food is honest. This is how Prague eats when you're not in the tourist zone.",
            price: '7-10',
            coords: [50.0752, 14.4405],
          },
          {
            name: 'Vysehrad',
            description: "The fortress everyone ignores. It's south of the center, on a hill overlooking the river, with a fraction of the castle crowds. Walk along the ramparts, visit the cemetery where Dvorak and Mucha are buried (free), and sit in the gardens watching the Vltava. The perfect place to say goodbye to Prague.",
            price: 'Free',
            coords: [50.0645, 14.4198],
          },
        ],
      },
      {
        time: 'Evening',
        spots: [
          {
            name: 'U Sudu',
            fullName: 'U Sudu (Vodickova 10)',
            description: "Your last night in Prague has to be here. From outside it looks like a small, normal bar. You walk in, and it turns out it has about 5 underground floors carved into rock. Each level is a different bar, each one weirder than the last. It's like Narnia but with beer at 1.50 euros. Thursdays and Fridays there's live music downstairs. Don't miss it.",
            price: '5-8',
            priceNote: '3-4 beers',
            coords: [50.0799, 14.4247],
          },
        ],
      },
    ],
    budget: '26 - 34',
  },
]

function DayMap({ day }) {
  const allSpots = day.sections.flatMap((s) => s.spots)
  const routeCoords = allSpots.map((s) => s.coords)

  return (
    <MapContainer
      center={day.mapCenter}
      zoom={day.mapZoom}
      className={styles.map}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &middot; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {allSpots.map((spot, i) => (
        <Marker key={i} position={spot.coords} icon={createNumberedIcon(i + 1)}>
          <Popup>{spot.fullName || spot.name}</Popup>
        </Marker>
      ))}
      <Polyline
        positions={routeCoords}
        pathOptions={{ color: '#C4571A', weight: 3, dashArray: '8 6', opacity: 0.7 }}
      />
    </MapContainer>
  )
}

export default function PragueItinerary() {
  const scrollToCta = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  let spotCounter = 0

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <Link to="/packages" className={styles.backLink}>← Packages</Link>
        </nav>

        <div className={styles.content}>
          <p className="section-label">Free itinerary</p>
          <h1 className={styles.headline}>
            Prague in 3 days<br />
            <em>like a local</em>
          </h1>
          <p className={styles.sub}>
            The guide your local friend would make you. No filters, no mass tourism.
            Just the places that are actually worth your time.
          </p>
          <p className={styles.totalBudget}>
            Estimated total spend: <strong>€85 - €129</strong> <span>(excluding accommodation & flights)</span>
          </p>
        </div>
      </section>

      <section className={styles.itinerarySection}>
        <div className="container">
          {itinerary.map((day) => {
            const isEven = day.day % 2 === 0
            spotCounter = 0

            return (
              <div key={day.day} className={styles.dayBlock}>
                <div className={styles.dayHeader}>
                  <span className={styles.dayNumber}>Day {day.day}</span>
                  <h2 className={styles.dayTitle}>{day.title}</h2>
                  <p className={styles.dayIntro}>{day.intro}</p>
                </div>

                <div className={`${styles.zigzag} ${isEven ? styles.zigzagReverse : ''}`}>
                  <div className={styles.zigzagContent}>
                    {day.sections.map((section, i) => (
                      <div key={i} className={styles.timeBlock}>
                        <h3 className={styles.timeLabel}>{section.time}</h3>
                        {section.spots.map((spot, j) => {
                          spotCounter++
                          return (
                            <div key={j} className={styles.spotCard}>
                              <div className={styles.spotHeader}>
                                <span className={styles.spotNumber}>{spotCounter}</span>
                                <h4 className={styles.spotName}>{spot.fullName || spot.name}</h4>
                              </div>
                              <p className={styles.spotDesc}>{spot.description}</p>
                              <div className={styles.spotPrice}>
                                <span className={styles.priceArrow}>→</span>
                                <span>
                                  Estimated price: {spot.price === 'Free' ? 'Free' : `€${spot.price}`}
                                  {spot.priceNote && ` (${spot.priceNote})`}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  <div className={styles.zigzagMap}>
                    <div className={styles.mapSticky}>
                      <DayMap day={day} />
                      <div className={styles.mapLegend}>
                        {day.sections.flatMap((s) => s.spots).map((spot, i) => (
                          <div key={i} className={styles.legendItem}>
                            <span className={styles.legendNumber}>{i + 1}</span>
                            <span className={styles.legendName}>{spot.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.dayBudget}>
                  Estimated day spend (excl. accommodation): <strong>€{day.budget}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <p className="section-label" style={{ textAlign: 'center' }}>Want to experience this with a local?</p>
            <h2 className="section-title" style={{ textAlign: 'center' }}>
              Not a guide — someone who knows<br />
              <em>the city like home</em>
            </h2>
            <p className={styles.ctaDesc}>
              Drifter Trip connects you with someone who actually lives in Prague
              to join you on this route (or a custom one).
            </p>
            <div className={styles.ctaDetails}>
              <div className={styles.ctaDetail}>
                <span className={styles.ctaDetailLabel}>From</span>
                <span className={styles.ctaDetailValue}>€40</span>
                <span className={styles.ctaDetailNote}>per person</span>
              </div>
              <div className={styles.ctaDetail}>
                <span className={styles.ctaDetailLabel}>Groups</span>
                <span className={styles.ctaDetailValue}>3 to 5</span>
                <span className={styles.ctaDetailNote}>people</span>
              </div>
              <div className={styles.ctaDetail}>
                <span className={styles.ctaDetailLabel}>Style</span>
                <span className={styles.ctaDetailValue}>Real</span>
                <span className={styles.ctaDetailNote}>no script, no tour bus</span>
              </div>
            </div>
            <button className="primary" onClick={scrollToCta}>
              Book your experience
            </button>
          </div>
        </div>
      </section>

      <SignupForm />
      <Footer />
    </>
  )
}
