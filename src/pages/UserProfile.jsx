import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db, logout, uploadGuidePhoto } from '../firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { MapPin, MessageSquare, Calendar, User, Edit, Save, LogOut, X, Search, ChevronDown, Upload } from 'lucide-react'
import { countries, countryMap, getFlagUrl } from '../data/countries'
import Footer from '../components/Footer'
import styles from './Profile.module.css'

function CountryBadges({ codes = [] }) {
  if (!codes || codes.length === 0) return null
  return (
    <div className={styles.countryBadges}>
      {codes.map(code => {
        const country = countryMap[code]
        return (
          <span key={code} className={styles.countryBadge} title={country?.name || code}>
            <img src={getFlagUrl(code)} alt={country?.name} className={styles.countryFlag} />
          </span>
        )
      })}
    </div>
  )
}

function CountrySelector({ selected = [], onChange }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const addCountry = (code) => {
    if (!selected.includes(code)) {
      onChange([...selected, code])
    }
    setSearch('')
    setOpen(false)
  }

  const removeCountry = (code) => {
    onChange(selected.filter(c => c !== code))
  }

  return (
    <div className={styles.countrySelector}>
      <div className={styles.countryTags}>
        {selected.map(code => {
          const country = countryMap[code]
          return (
            <span key={code} className={styles.countryTag}>
              <img src={getFlagUrl(code)} alt={country?.name} className={styles.countryFlag} />
              <span>{country?.name || code}</span>
              <button onClick={() => removeCountry(code)} className={styles.countryTagRemove}>
                <X size={12} />
              </button>
            </span>
          )
        })}
      </div>
      <div className={styles.countryDropdownWrapper}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={styles.countryDropdownToggle}
        >
          <Search size={14} />
          <span>Add country...</span>
          <ChevronDown size={14} />
        </button>
        {open && (
          <div className={styles.countryDropdown}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className={styles.countrySearch}
              autoFocus
            />
            <div className={styles.countryList}>
              {filtered.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => addCountry(country.code)}
                  className={styles.countryOption}
                  disabled={selected.includes(country.code)}
                >
                  <img src={getFlagUrl(country.code)} alt={country.name} className={styles.countryFlag} />
                  <span>{country.name}</span>
                  <span className={styles.countryCode}>{country.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [testimonials, setTestimonials] = useState([])
  const [isAlsoGuide, setIsAlsoGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({ displayName: '', visited_countries: [] })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if this is the current user's profile
        const auth = getAuth()
        onAuthStateChanged(auth, async (authUser) => {
          if (authUser && authUser.uid === id) {
            setIsOwnProfile(true)
          }
        })

        // Try to get user from users collection
        const userDoc = await getDoc(doc(db, 'users', id))
        let userData = null
        
        if (userDoc.exists()) {
          userData = { id, ...userDoc.data(), type: 'user' }
          setUser(userData)
        } else {
          // Try to get user info from a testimonial (fallback)
          const q = query(
            collection(db, 'testimonials'),
            where('userId', '==', id)
          )
          const snapshot = await getDocs(q)
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data()
            userData = {
              id,
              displayName: data.name,
              photoURL: data.userPhotoURL,
              email: data.userEmail,
              type: 'user'
            }
            setUser(userData)
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
        const q2 = query(
          collection(db, 'testimonials'),
          where('userId', '==', id)
        )
        const snapshot2 = await getDocs(q2)
        const items = snapshot2.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.approved === true || item.approved === undefined)
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        
        setTestimonials(items)

        if (!userData && items.length === 0) {
          setNotFound(true)
        }
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

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleEdit = () => {
    setEditData({
      displayName: user?.displayName || '',
      visited_countries: user?.visited_countries || [],
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const userRef = doc(db, 'users', id)
      await setDoc(userRef, {
        displayName: editData.displayName,
        visited_countries: editData.visited_countries,
      }, { merge: true })
      
      setUser(prev => ({
        ...prev,
        displayName: editData.displayName,
        visited_countries: editData.visited_countries,
      }))
      setEditing(false)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB')
      return
    }

    try {
      const url = await uploadGuidePhoto(id, file)
      setUser(prev => ({ ...prev, photoURL: url }))
      
      const userRef = doc(db, 'users', id)
      await updateDoc(userRef, { photoURL: url })
    } catch (err) {
      console.error('Error uploading photo:', err)
      alert(`Error uploading photo: ${err.message}`)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <section className={styles.hero}>
          <div className="container">
            <p>Loading...</p>
          </div>
        </section>
      </div>
    )
  }

  if (notFound || !user) {
    return (
      <div className={styles.profilePage}>
        <section className={styles.hero}>
          <nav className={styles.nav}>
            <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          </nav>
          <div className={styles.content}>
            <div className={styles.notFound}>
              <h2>User not found</h2>
              <p>This user doesn't exist or has been removed.</p>
              <button className="primary" onClick={() => navigate('/')}>Go Home</button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.profilePage}>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <div className={styles.navLinks}>
            <Link to="/guides" className={styles.navLink}>Our Guides</Link>
            <Link to="/partners" className={styles.navLink}>Day trips</Link>
            {isOwnProfile ? (
              <div className={styles.dropdown} ref={dropdownRef}>
                <button
                  type="button"
                  className={styles.dropdownToggle}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={16} />
                  <span>{user?.displayName?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <User size={16} />
                      My Profile
                    </Link>
                    <button className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); handleEdit(); }}>
                      <Edit size={16} />
                      Edit Profile
                    </button>
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/" className={styles.navLink}>Sign in</Link>
            )}
          </div>
          <button
            type="button"
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        {menuOpen && (
          <div className={styles.mobileMenu} role="dialog" aria-modal="true">
            <Link to="/guides" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Our Guides</Link>
            <Link to="/partners" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Day trips</Link>
            {isOwnProfile ? (
              <>
                <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  <User size={20} />
                  <span>My Profile</span>
                </Link>
                <button className={styles.mobileLink} onClick={() => { setMenuOpen(false); handleEdit(); }}>
                  <Edit size={20} />
                  <span>Edit Profile</span>
                </button>
                <button className={styles.mobileLink} onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  <LogOut size={20} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <Link to="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <User size={20} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        )}

        <div className={styles.content}>
          <p className="section-label">User profile</p>
          <h1 className={styles.headline}>
            {user?.displayName || 'Traveler'}'s profile
          </h1>
        </div>
      </section>

      <section className={styles.profile}>
        <div className="container">
          <div className={styles.userCard}>
            <div className={styles.avatarWrapper}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user?.displayName} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.displayName?.charAt(0) || '?'}
                </div>
              )}
              {isOwnProfile && editing && (
                <label className={styles.photoUpload}>
                  <Upload size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <div className={styles.userInfo}>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={editData.displayName}
                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                    className={styles.nameInput}
                    placeholder="Your name"
                  />
                  <div className={styles.countrySection}>
                    <label className={styles.countryLabel}>Countries I've visited</label>
                    <CountrySelector
                      selected={editData.visited_countries}
                      onChange={(countries) => setEditData({ ...editData, visited_countries: countries })}
                    />
                  </div>
                  <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                    <Save size={14} />
                    {saving ? '...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <h3 className={styles.name}>{user?.displayName || 'Traveler'}</h3>
                  <CountryBadges codes={user?.visited_countries} />
                  {user?.createdAt && (
                    <p className={styles.memberSince}>
                      <Calendar size={14} />
                      Member since {formatDate(user.createdAt)}
                    </p>
                  )}
                  {isOwnProfile && (
                    <button className={styles.editBtn} onClick={handleEdit}>
                      <Edit size={16} />
                      Edit Profile
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {isAlsoGuide && (
        <section className={styles.requests}>
          <div className="container">
            <div className={styles.empty}>
              <p style={{ marginBottom: '16px' }}>This traveler is also a local guide</p>
              <Link to={`/guide/${isAlsoGuide.id}`} className="primary" style={{ display: 'inline-flex' }}>
                View guide profile →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={styles.requests}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '32px' }}>
            <em>Reviews</em>
          </h2>

          {testimonials.length === 0 ? (
            <div className={styles.empty}>
              <p>No stories shared yet.</p>
            </div>
          ) : (
            <div className={styles.testimonialsList}>
              {testimonials.map((test) => (
                <div key={test.id} className={styles.testimonialCard}>
                  <div className={styles.testimonialHeader}>
                    <span className={styles.destination}>
                      <MapPin size={16} />
                      {test.trip} {test.trip?.split(' → ')[0] && (
                        <img 
                          src={getFlagUrl(test.trip?.split(' → ')[0].toLowerCase())} 
                          alt="" 
                          className={styles.tripFlag} 
                        />
                      )}
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
                    <MessageSquare size={18} className={styles.quoteIcon} />
                    {test.quote}
                  </blockquote>
                  <div className={styles.testimonialDate}>
                    <Calendar size={14} />
                    <span>{formatDate(test.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
