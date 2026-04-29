import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { MapPin, MessageSquare, Calendar } from 'lucide-react'
import { getFlagUrl } from '../data/countries'
import Footer from '../components/Footer'
import styles from './Profile.module.css'

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [testimonials, setTestimonials] = useState([])
  const [isAlsoGuide, setIsAlsoGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to get user from users collection
        const userDoc = await getDoc(doc(db, 'users', id))
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() })
        } else {
          // Try to get user info from a testimonial (fallback)
          const q = query(
            collection(db, 'testimonials'),
            where('userId', '==', id)
          )
          const snapshot = await getDocs(q)
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data()
            setUser({
              id,
              displayName: data.name,
              photoURL: data.userPhotoURL,
            })
          } else {
            // Try Firebase Auth (only works for current user)
            const auth = getAuth()
            onAuthStateChanged(auth, (authUser) => {
              if (authUser && authUser.uid === id) {
                setUser({
                  id,
                  displayName: authUser.displayName,
                  photoURL: authUser.photoURL,
                  email: authUser.email,
                })
              } else {
                setNotFound(true)
                setLoading(false)
              }
            })
            return // Don't set loading false yet, wait for auth
          }
        }

        // Check if user is also a guide
        try {
          const guideQuery = query(
            collection(db, 'guides'),
            where('userId', '==', id)
          )
          const guideSnap = await getDocs(guideQuery)
          if (!guideSnap.empty && guideSnap.docs[0].data().approved === true) {
            setIsAlsoGuide({ id: guideSnap.docs[0].id, ...guideSnap.docs[0].data() })
          }
        } catch (err) {
          console.log('Not a guide')
        }

        // Fetch testimonials by this user
        const q = query(
          collection(db, 'testimonials'),
          where('userId', '==', id)
        )
        const snapshot = await getDocs(q)
        const items = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.approved === true || item.approved === undefined)
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        
        setTestimonials(items)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUserData()
    }
  }, [id])

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (notFound || !user) {
    return (
      <div className={styles.profilePage}>
        <div className="container">
          <div className={styles.notFound}>
            <h2>User not found</h2>
            <p>This user doesn't exist or has been removed.</p>
            <button className="primary" onClick={() => navigate('/')}>Go Home</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.profilePage}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user?.displayName || 'User'} />
            ) : (
              <span>{user?.displayName?.charAt(0) || '?'}</span>
            )}
          </div>
          <h1 className={styles.name}>{user?.displayName || 'Traveler'}</h1>
          {user?.bio && <p className={styles.bio}>{user.bio}</p>}
          {user?.createdAt && (
            <p className={styles.memberSince}>
              <Calendar size={14} />
              Member since {new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          )}
        </div>

        {isAlsoGuide && (
          <div className={styles.alsoGuideBanner}>
            <p>This traveler is also a local guide</p>
            <Link to={`/guide/${isAlsoGuide.id}`} className="primary">
              View guide profile →
            </Link>
          </div>
        )}

        {user?.visited_countries && user.visited_countries.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Countries Visited</h2>
            <div className={styles.flagsGrid}>
              {user.visited_countries.map((code, i) => (
                <div key={i} className={styles.flagItem}>
                  <img 
                    src={getFlagUrl(code)} 
                    alt={code}
                    className={styles.flag}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MessageSquare size={20} />
            Reviews Written ({testimonials.length})
          </h2>
          
          {testimonials.length === 0 ? (
            <p className={styles.empty}>No stories shared yet.</p>
          ) : (
            <div className={styles.testimonialsList}>
              {testimonials.map(item => (
                <div key={item.id} className={styles.testimonialCard}>
                  <blockquote className={styles.quote}>{item.quote}</blockquote>
                  <div className={styles.meta}>
                    <MapPin size={14} />
                    <span>{item.trip}</span>
                  </div>
                  {item.photos?.filter(p => p).length > 0 && (
                    <div className={styles.photos}>
                      {item.photos.filter(p => p).map((photo, i) => (
                        <img key={i} src={photo} alt="" className={styles.photo} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
