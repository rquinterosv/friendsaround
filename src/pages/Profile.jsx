import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db, logout } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Quote } from 'lucide-react'
import Footer from '../components/Footer'
import styles from './Profile.module.css'

const cityToCountry = {
  rome: { country: 'italy', flag: '🇮🇹' },
  roma: { country: 'italy', flag: '🇮🇹' },
  italy: { country: 'italy', flag: '🇮🇹' },
  prague: { country: 'czech republic', flag: '🇨🇿' },
  warsaw: { country: 'poland', flag: '🇵🇱' },
  poland: { country: 'poland', flag: '🇵🇱' },
  berlin: { country: 'germany', flag: '🇩🇪' },
  germany: { country: 'germany', flag: '🇩🇪' },
  madrid: { country: 'spain', flag: '🇪🇸' },
  barcelona: { country: 'spain', flag: '🇪🇸' },
  spain: { country: 'spain', flag: '🇪🇸' },
  paris: { country: 'france', flag: '🇫🇷' },
  france: { country: 'france', flag: '🇫🇷' },
  london: { country: 'uk', flag: '🇬🇧' },
  uk: { country: 'uk', flag: '🇬🇧' },
  amsterdam: { country: 'netherlands', flag: '🇳🇱' },
  netherlands: { country: 'netherlands', flag: '🇳🇱' },
  lisbon: { country: 'portugal', flag: '🇵🇹' },
  portgual: { country: 'portugal', flag: '🇵🇹' },
  vienna: { country: 'austria', flag: '🇦🇹' },
  austria: { country: 'austria', flag: '🇦🇹' },
  budapest: { country: 'hungary', flag: '🇭🇺' },
  hungary: { country: 'hungary', flag: '🇭🇺' },
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const requestsQuery = query(collection(db, 'requests'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
      const reqSnap = await getDocs(requestsQuery)
      setRequests(reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
      console.error('Error loading requests:', err)
      setRequests([])
    }
    
    try {
      const allTestSnap = await getDocs(collection(db, 'testimonials'))
      const testItems = allTestSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === user.uid)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setTestimonials(testItems)
    } catch (testErr) {
      console.error('Error loading testimonials:', testErr)
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const getFlag = (trip) => {
    if (!trip) return '🌍'
    const city = trip.toLowerCase().split(/[\s→,\-]/)[0]
    return cityToCountry[city]?.flag || '🌍'
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user) return null

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <Link to="/" className={styles.backLink}>← Back to home</Link>
        </nav>

        <div className={styles.content}>
          <p className="section-label">Your profile</p>
          <h1 className={styles.headline}>
            Welcome back,<br />
            <em>{user.displayName?.split(' ')[0] || 'traveler'}</em>
          </h1>
        </div>
      </section>

      <section className={styles.profile}>
        <div className={styles.profileInner}>
          <div className={styles.userCard}>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={styles.userInfo}>
              <h3 className={styles.name}>{user.displayName || 'Traveler'}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.requests}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '32px' }}>
            Your <em>trips</em>
          </h2>

          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : requests.length === 0 ? (
            <div className={styles.empty}>
              <p>You haven't sent any trip requests yet.</p>
              <Link to="/#signup" className={styles.ctaBtn}>
                Plan your first trip
              </Link>
            </div>
          ) : (
            <div className={styles.requestsList}>
              {requests.map((req) => (
                <div key={req.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <span className={styles.destination}>{req.destination}</span>
                    <span className={styles.package}>{req.package}</span>
                  </div>
                  <div className={styles.requestDetails}>
                    <div className={styles.detail}>
                      <span className={styles.label}>Dates</span>
                      <span>{req.arrivalDate} - {req.departureDate}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>Group</span>
                      <span>{req.groupSize} people</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>Requested</span>
                      <span>{formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.requests}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '32px' }}>
            Your <em>stories</em>
          </h2>

          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : testimonials.length === 0 ? (
            <div className={styles.empty}>
              <p>You haven't shared any stories yet.</p>
              <Link to="/#testimonials" className={styles.ctaBtn}>
                Share your first story
              </Link>
            </div>
          ) : (
            <div className={styles.testimonialsList}>
              {testimonials.map((test) => (
                <div key={test.id} className={styles.testimonialCard}>
                  <div className={styles.testimonialHeader}>
                    <span className={styles.destination}>
                      <MapPin size={16} />
                      {test.trip} {getFlag(test.trip)}
                    </span>
                    <span className={`${styles.status} ${test.approved ? styles.approved : styles.pending}`}>
                      {test.approved ? 'Published' : 'Pending'}
                    </span>
                  </div>
                  <blockquote className={styles.testimonialQuote}>
                    <Quote size={18} className={styles.quoteIcon} />
                    {test.quote}
                  </blockquote>
                  <div className={styles.testimonialDate}>
                    {formatDate(test.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}