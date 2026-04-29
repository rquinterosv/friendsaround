import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { MapPin, MessageSquare } from 'lucide-react'
import { getFlagUrl } from '../data/countries'
import Footer from '../components/Footer'
import styles from './Profile.module.css'

export default function UserProfile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndTestimonials = async () => {
      try {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', id))
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() })
          }
        } catch (err) {
          console.log('No user doc found, using testimonial data')
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
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUserAndTestimonials()
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

  return (
    <div className={styles.profilePage}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user?.name || 'User'} />
            ) : (
              <span>{user?.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <h1 className={styles.name}>{user?.name || 'Traveler'}</h1>
          {user?.bio && <p className={styles.bio}>{user.bio}</p>}
        </div>

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
            <p className={styles.empty}>No reviews yet.</p>
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
