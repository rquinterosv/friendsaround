import { useState } from 'react'
import styles from './SignupForm.module.css'

export default function SignupForm() {
  const [role, setRole] = useState('traveler')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section id="signup" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Early access</p>
          <h2 className={styles.title}>
            Be the first to<br />
            <em>experience it</em>
          </h2>
          <p className={styles.sub}>
            We're launching city by city, starting with Prague.
            Join the waitlist and we'll reach out when your city is live.
          </p>

          <div className={styles.perks}>
            {['First access to new cities', 'Founding member pricing', 'Direct line to the team'].map((p, i) => (
              <div key={i} className={styles.perk}>
                <span className={styles.check}>✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          {submitted ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>You're on the list.</h3>
              <p className={styles.successSub}>
                We'll reach out as soon as your city goes live.
                In the meantime, spread the word.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <h3 className={styles.formTitle}>Join the waitlist</h3>

              <div className={styles.toggle}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${role === 'traveler' ? styles.active : ''}`}
                  onClick={() => setRole('traveler')}
                >
                  I'm a traveler
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${role === 'guide' ? styles.active : ''}`}
                  onClick={() => setRole('guide')}
                >
                  I want to be a guide
                </button>
              </div>

              {role === 'guide' && (
                <p className={styles.guideNote}>
                  Guides earn money showing their city to travelers who actually want to be there.
                  We verify everyone — no experience required, just local knowledge.
                </p>
              )}

              <div className={styles.field}>
                <label className={styles.label}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={styles.input}
                  required
                />
              </div>

              {role === 'guide' && (
                <div className={styles.field}>
                  <label className={styles.label}>Your city</label>
                  <input
                    type="text"
                    placeholder="e.g. Prague, Lisbon, Sofia..."
                    className={styles.input}
                  />
                </div>
              )}

              <button type="submit" className={`primary ${styles.submit}`}>
                {role === 'traveler' ? 'Join the waitlist' : 'Apply as a guide'}
              </button>

              <p className={styles.privacy}>No spam. No sharing. Just updates when we're ready.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
