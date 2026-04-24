import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db, logout } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Quote, LogOut } from 'lucide-react'
import { countryMap } from '../data/countries'
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

function CountryBadges({ codes = [], maxShow = 10 }) {
  if (!codes || codes.length === 0) return null
  const visible = codes.slice(0, maxShow)
  const remaining = codes.length - maxShow
  return (
    <div className={styles.countryBadges}>
      {visible.map(code => {
        const country = countryMap[code]
        return (
          <span key={code} className={styles.countryBadge}>
            <span>{country?.flag}</span>
            <span>{country?.name || code}</span>
          </span>
        )
      })}
      {remaining > 0 && (
        <span className={styles.countryBadgeMore}>+{remaining} more</span>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { id: profileId } = useParams()
  const viewUserId = profileId
  const [requests, setRequests] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewAsUser, setViewAsUser] = useState(null)
  const [isAlsoGuide, setIsAlsoGuide] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user && !viewUserId) {
      navigate('/')
      return
    }
    if (viewUserId) {
      loadUserData()
    } else if (user) {
      loadData()
    }
  }, [user, viewUserId, navigate, authLoading])

  const loadData = async () => {
    const targetUserId = viewUserId || user?.uid
    if (!targetUserId) {
      setLoading(false)
      return
    }
    
    try {
      const allReqSnap = await getDocs(collection(db, 'requests'))
      const reqItems = allReqSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === targetUserId)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setRequests(reqItems)
    } catch (err) {
      console.error('Error loading requests:', err)
      setRequests([])
    }
    
    try {
      const allTestSnap = await getDocs(collection(db, 'testimonials'))
      const testItems = allTestSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === targetUserId)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setTestimonials(testItems)
    } catch (testErr) {
      console.error('Error loading testimonials:', testErr)
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    if (!viewUserId) {
      loadData()
      return
    }

    let userData = null

    try {
      const userDoc = await getDoc(doc(db, 'users', viewUserId))
      if (userDoc.exists()) {
        userData = { id: viewUserId, type: 'user', ...userDoc.data() }
        setViewAsUser(userData)
      }
    } catch (err) {
      console.log('User not in users collection')
    }

    try {
      const guideQuery = query(collection(db, 'guides'), where('userId', '==', viewUserId))
      const guideSnap = await getDocs(guideQuery)
      if (!guideSnap.empty) {
        const guideData = guideSnap.docs[0].data()
        if (guideData.approved === true) {
          setIsAlsoGuide({ id: guideSnap.docs[0].id, ...guideData })
        }
        if (!userData) {
          userData = { id: guideSnap.docs[0].id, type: 'guide', ...guideData }
          setViewAsUser(userData)
        }
      }
    } catch (err) {
      console.log('User not in guides collection')
    }

    try {
      const allTestSnap = await getDocs(collection(db, 'testimonials'))
      const testItems = allTestSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === viewUserId && item.approved === true)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setTestimonials(testItems)
      
      if (!viewAsUser && testItems.length > 0) {
        setViewAsUser({
          displayName: testItems[0].name,
          photoURL: testItems[0].userPhotoURL,
          email: testItems[0].userEmail,
          type: 'user'
        })
      }
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

  const isOwnProfile = !viewUserId && user

  const [isGuide, setIsGuide] = useState(false)
  const [guideData, setGuideData] = useState(null)

  useEffect(() => {
    if (!isOwnProfile || !user) return
    
    const checkGuide = async () => {
      try {
        const guideQuery = query(collection(db, 'guides'), where('userId', '==', user.uid))
        const guideSnap = await getDocs(guideQuery)
        if (!guideSnap.empty && guideSnap.docs[0].data().approved === true) {
          setIsGuide(true)
          setGuideData({ id: guideSnap.docs[0].id, ...guideSnap.docs[0].data() })
        }
      } catch (err) {
        console.error('Error checking guide:', err)
      }
    }
    checkGuide()
  }, [user, isOwnProfile])

  if (authLoading) return null

  if (isGuide && guideData) {
    return (
      <>
        <section className={styles.hero}>
          <nav className={styles.nav}>
            <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={16} />
              Sign out
            </button>
          </nav>
          <div className={styles.content}>
            <p className="section-label">You are a guide</p>
            <h1 className={styles.headline}>
              Welcome back,<br />
              <em>{user.displayName?.split(' ')[0] || 'guide'}</em>
            </h1>
          </div>
        </section>
        <section className={styles.profile}>
          <div className="container">
            <div className={styles.guideRedirect}>
              <h2>Guide Profile</h2>
              <p>You have a guide profile. Click below to manage your guide profile.</p>
              <Link to={`/guide/${guideData.id}`} className="primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
                Go to Guide Profile
              </Link>
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <p style={{ marginBottom: '12px', color: 'var(--muted)' }}>You can also view your profile as a regular user to write reviews.</p>
                <Link to="/profile" className="secondary" style={{ display: 'inline-flex' }}>
                  View as User
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          {viewUserId && isOwnProfile === false && <Link to="/profile" className={styles.logoutBtn}>Back to My Profile</Link>}
          {!viewUserId && <button onClick={handleLogout} className={styles.logoutBtn}><LogOut size={16} />Sign out</button>}
        </nav>

        <div className={styles.content}>
          <p className="section-label">User profile</p>
          <h1 className={styles.headline}>
            {user?.displayName || viewAsUser?.displayName || 'Traveler'}'s profile
          </h1>
        </div>
      </section>

      <section className={styles.profile}>
        <div className={styles.profileInner}>
          <div className={styles.userCard}>
            {user?.photoURL || viewAsUser?.photoURL ? (
              <img src={user?.photoURL || viewAsUser?.photoURL} alt={user?.displayName || viewAsUser?.displayName} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.displayName?.charAt(0) || viewAsUser?.displayName?.charAt(0) || '?'}
              </div>
            )}
            <div className={styles.userInfo}>
              <h3 className={styles.name}>{user?.displayName || viewAsUser?.displayName || 'Traveler'}</h3>
              <CountryBadges codes={viewAsUser?.visited_countries} />
            </div>
          </div>
        </div>
      </section>

      {isAlsoGuide && viewUserId && isOwnProfile === false && (
        <section className={styles.requests}>
          <div className="container">
            <div className={styles.empty}>
              <p style={{ marginBottom: '16px' }}>This traveler is also a local guide</p>
              <Link to={`/guide/${isAlsoGuide.userId}`} className="primary" style={{ display: 'inline-flex' }}>
                View guide profile →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={styles.requests}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '32px' }}>
            <em>Trips</em>
          </h2>

          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : requests.length === 0 ? (
            <div className={styles.empty}>
              <p>No trips found.</p>
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
            <em>Reviews</em>
          </h2>

          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : testimonials.length === 0 ? (
            <div className={styles.empty}>
              <p>No reviews found.</p>
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
                  {test.photos && test.photos.length > 0 && (
                    <div className={styles.testimonialPhotos}>
                      {test.photos.filter(p => p).map((photo, i) => (
                        <img key={i} src={photo} alt={`Review photo ${i + 1}`} className={styles.testimonialPhoto} />
                      ))}
                    </div>
                  )}
                  <blockquote className={styles.testimonialQuote}>
                    <Quote size={18} className={styles.quoteIcon} />
                    {test.quote}
                  </blockquote>
                  <div className={styles.testimonialDate}>
                    <span>{formatDate(test.createdAt)}</span>
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