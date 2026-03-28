import styles from './Testimonials.module.css'

const cards = [
  {
    quote: "I've traveled solo for 6 years. This was the first time I felt like I was actually inside a city, not just visiting it.",
    name: 'Marta K.',
    from: 'Warsaw → Prague',
    initials: 'MK',
  },
  {
    quote: "Our guide took us to a bar that had been open since 1962. Then we ended up at a rave in an abandoned warehouse. Zero regrets.",
    name: 'Thomas B.',
    from: 'Berlin → Sofia',
    initials: 'TB',
  },
  {
    quote: "Way cheaper than a tour package, way more real. I met people I'm still in touch with 8 months later.",
    name: 'Ana R.',
    from: 'São Paulo → Lisbon',
    initials: 'AR',
  },
]

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className="section-label">From travelers</p>
        <h2 className="section-title" style={{ marginBottom: '56px' }}>
          What people <em>actually said</em>
        </h2>

        <div className={styles.grid}>
          {cards.map((c, i) => (
            <div key={i} className={styles.card}>
              <p className={styles.quote}>"{c.quote}"</p>
              <div className={styles.author}>
                <div className={styles.avatar}>{c.initials}</div>
                <div>
                  <p className={styles.name}>{c.name}</p>
                  <p className={styles.trip}>{c.from}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
