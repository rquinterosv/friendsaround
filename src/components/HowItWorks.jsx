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

export default function HowItWorks() {
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

        <div className={styles.callout}>
          <p className={styles.calloutText}>
            "We spent a weekend in Prague with a local. We drank beer at a bar from 1968, walked through neighborhoods that didn't have names on Google Maps, and stayed out until the city woke up again."
          </p>
          <span className={styles.calloutSource}>— Early traveler, Prague trip</span>
        </div>
      </div>
    </section>
  )
}
