import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Footer from '../components/Footer'
import styles from './About.module.css'

const guides = [
  {
    name: 'Martina Dvořáková',
    city: 'Prague, Czech Republic',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80&auto=format&fit=crop',
    tour: 'Hidden pubs of Žižkov',
    description:
      "Born and raised in Prague. I'll take you through the neighborhoods locals actually live in — late-night beers, family-run kitchens, and places no guidebook knows.",
  },
  {
    name: 'Luca Ferrari',
    city: 'Rome, Italy',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop',
    tour: 'Trastevere after dark',
    description:
      'Roman by birth, foodie by obsession. I show you the trattorias nonna would approve of and the wine bars where locals go after midnight.',
  },
  {
    name: 'Anna Kowalska',
    city: 'Kraków, Poland',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop',
    tour: 'Kazimierz stories & street food',
    description:
      'I grew up between Kraków and Warsaw. Expect forgotten courtyards, vodka bars without signs, and the best pierogi you will ever eat.',
  },
  {
    name: 'Paulo Almeida',
    city: 'Lisbon, Portugal',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop',
    tour: 'Fado nights in Alfama',
    description:
      "I'm a musician and lifelong Lisboeta. I bring you into the small fado houses where the voice matters more than the menu — and where dinner lasts all night.",
  },
]

const initialForm = {
  fullName: '',
  email: '',
  country: '',
  city: '',
  experience: '',
}

export default function About() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'guide_applications'), {
        ...form,
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Firestore error:', err)
      setError(`Something went wrong: ${err?.code || err?.message || 'unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const scrollToJoin = () => {
    document.getElementById('join-team')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <Link to="/" className={styles.backLink}>← Back to home</Link>
        </nav>

        <div className={styles.content}>
          <p className="section-label">Our local guides</p>
          <h1 className={styles.headline}>
            The people who<br />
            <em>know the city</em>
          </h1>
          <p className={styles.heroSub}>
            DrifterTrip isn't a tour company — it's a network of locals who open
            their city to travelers. Meet a few of them below, or apply to join
            the team if you'd love to share your own.
          </p>
          <div className={styles.heroActions}>
            <button className="primary" onClick={scrollToJoin}>Join our team</button>
          </div>
        </div>
      </section>

      <section className={styles.guidesSection}>
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>Meet the locals</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '56px' }}>
            Guides who <em>live it</em>
          </h2>

          <div className={styles.guidesGrid}>
            {guides.map((g, i) => (
              <article key={i} className={styles.guideCard}>
                <div className={styles.guidePhotoWrap}>
                  <img src={g.photo} alt={g.name} className={styles.guidePhoto} />
                </div>
                <div className={styles.guideBody}>
                  <h3 className={styles.guideName}>{g.name}</h3>
                  <p className={styles.guideCity}>{g.city}</p>
                  <p className={styles.guideTour}>{g.tour}</p>
                  <p className={styles.guideDesc}>{g.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="join-team" className={styles.joinSection}>
        <div className={styles.joinInner}>
          <div className={styles.joinLeft}>
            <p className="section-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Join our team</p>
            <h2 className={styles.joinTitle}>
              Know your city?<br />
              <em>Show it to the world.</em>
            </h2>
            <p className={styles.joinSub}>
              We're looking for locals in every European city — people who love
              where they live and want to share it their way. No tour-guide
              license required. Just real knowledge and good company.
            </p>

            <div className={styles.joinPerks}>
              {[
                'Set your own days and pace',
                'Keep most of what you earn',
                'Design your experience your way',
              ].map((p, i) => (
                <div key={i} className={styles.joinPerk}>
                  <span className={styles.joinCheck}>✓</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.joinRight}>
            {submitted ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>✓</div>
                <h3 className={styles.successTitle}>Application sent!</h3>
                <p className={styles.successSub}>
                  Thanks for applying. We'll review your experience and get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.formTitle}>Tell us about you</h3>

                <div className={styles.field}>
                  <label className={styles.label}>Full name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={update('fullName')}
                    placeholder="Jane Doe"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={update('country')}
                      placeholder="Czech Republic"
                      className={styles.input}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={update('city')}
                      placeholder="Prague"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>What would you like to show travelers?</label>
                  <textarea
                    value={form.experience}
                    onChange={update('experience')}
                    placeholder="Describe the tour, walk, or experience you'd love to offer — your favorite neighborhoods, hidden spots, the vibe you'd bring..."
                    className={`${styles.input} ${styles.textarea}`}
                    rows={5}
                    required
                  />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" className={`primary ${styles.submit}`} disabled={loading}>
                  {loading ? 'Sending...' : 'Send application'}
                </button>

                <p className={styles.privacy}>We review every application personally. No spam, ever.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
