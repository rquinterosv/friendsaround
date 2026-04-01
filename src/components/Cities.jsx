import styles from './Cities.module.css'

const cities = [
  { name: 'Prague', country: 'Czech Republic', tag: 'Beer, bridges & nightlife', color: '#8B9E94' },
  { name: 'Rome', country: 'Italy', tag: 'History, pasta & la dolce vita', color: '#C4A882' },
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
            We picked the cities where life happens on the streets — where locals stay out late,
            share their table, and show you the side tourists never see.
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

        <p className={styles.more}>More cities coming soon</p>
      </div>
    </section>
  )
}
