import styles from './Cities.module.css'

const cities = [
  { name: 'Prague', country: 'Czech Republic', tag: 'Beer, bridges & nightlife', color: '#8B9E94' },
  { name: 'Lisbon', country: 'Portugal', tag: 'Fado, hills & Atlantic sunsets', color: '#C4A882' },
  { name: 'Sofia', country: 'Bulgaria', tag: 'Underrated, unfiltered, alive', color: '#9E8BAA' },
  { name: 'Tallinn', country: 'Estonia', tag: 'Medieval cobblestones & saunas', color: '#7A9EAA' },
  { name: 'Kraków', country: 'Poland', tag: 'History, parties, great beer', color: '#AA907A' },
  { name: 'Tbilisi', country: 'Georgia', tag: 'Wine, architecture & soul', color: '#7AAA8B' },
]

export default function Cities() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className="section-label">Where we operate</p>
            <h2 className="section-title">Cities with a <em>real scene</em></h2>
          </div>
          <p className={styles.sub}>
            We started with the cities that are still alive — where locals go out, stay late,
            and haven't been priced out of their own neighborhoods yet.
          </p>
        </div>

        <div className={styles.grid}>
          {cities.map((city, i) => (
            <div key={i} className={styles.card} style={{ '--city-color': city.color }}>
              <div className={styles.cardBg} />
              <div className={styles.cardBody}>
                <div>
                  <h3 className={styles.cityName}>{city.name}</h3>
                  <span className={styles.country}>{city.country}</span>
                </div>
                <p className={styles.tag}>{city.tag}</p>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.more}>+ 6 more cities coming soon</p>
      </div>
    </section>
  )
}
