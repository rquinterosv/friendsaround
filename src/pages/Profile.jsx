import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Quote, LogOut, Edit, Save, X, Search, ChevronDown, User, Settings } from 'lucide-react'
import { countries, countryMap, getFlagUrl } from '../data/countries'
import { logout } from '../firebase'
import { getUser, updateUser, getGuide, getReviews } from '../lib/api'
import Footer from '../components/Footer'
import styles from './Profile.module.css'

// Keep old Firestore import for reference - will be removed after full migration
// import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
// import { db } from '../firebase'

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
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({ displayName: '', visited_countries: [] })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

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
      const result = await getUser(targetUserId)
      if (result.success && result.data) {
        setViewAsUser({ id: targetUserId, ...result.data })
      } else {
        setViewAsUser({ id: targetUserId, displayName: user?.displayName, photoURL: user?.photoURL })
      }
    } catch (err) {
      console.log('User not in users collection')
      setViewAsUser({ id: targetUserId, displayName: user?.displayName, photoURL: user?.photoURL })
    }
    
    // Keep requests from Firestore for now - will migrate later
    setRequests([])
    
    try {
      const { getReviews } = await import('../lib/api.js')
      const reviewResult = await getReviews()
      if (reviewResult.success) {
        const testItems = reviewResult.data
          .filter(item => item.user_id === targetUserId)
        setTestimonials(testItems)
      }
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
      const result = await getUser(viewUserId)
      if (result.success && result.data) {
        userData = { id: viewUserId, type: 'user', ...result.data }
        setViewAsUser(userData)
      }
    } catch (err) {
      console.log('User not in users collection')
    }

    try {
      // Check if user is also a guide
      const { getGuide } = await import('../lib/api.js')
      const guideResult = await getGuide(viewUserId)
      if (guideResult.success && guideResult.data) {
        setIsAlsoGuide(guideResult.data)
        if (!userData) {
          userData = { id: viewUserId, type: 'guide', ...guideResult.data }
          setViewAsUser(userData)
        }
      }
    } catch (err) {
      console.log('User not in guides collection')
    }

    try {
      const { getReviews } = await import('../lib/api.js')
      const reviewResult = await getReviews()
      if (reviewResult.success) {
        const testItems = reviewResult.data.filter(item => item.user_id === viewUserId)
        setTestimonials(testItems)
       
        if (!viewAsUser && testItems.length > 0) {
          setViewAsUser({
            displayName: testItems[0].full_name || testItems[0].name,
            photoURL: testItems[0].avatar_url,
            email: testItems[0].email,
            type: 'user'
          })
        }
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

  const handleEdit = () => {
    setEditData({
      displayName: user?.displayName || viewAsUser?.displayName || '',
      visited_countries: viewAsUser?.visited_countries || [],
    })
    setEditing(true)
  }

 const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateUser(user.uid, {
        full_name: editData.displayName,
        visited_countries: editData.visited_countries,
      })
      
      if (result.success) {
        setViewAsUser(prev => ({
          ...prev,
          full_name: editData.displayName,
          visited_countries: editData.visited_countries,
        }))
      }
      setEditing(false)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
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
          <div className={styles.navLinks}>
            <Link to="/guides" className={styles.navLink}>Our Guides</Link>
            <Link to="/partners" className={styles.navLink}>Day trips</Link>
            {!user ? (
              <Link to="/" className={styles.navLink}>Sign in</Link>
            ) : (
              <div className={styles.dropdown} ref={dropdownRef}>
                <button 
                  type="button" 
                  className={styles.dropdownToggle}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={16} />
                  <span>{user.displayName?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={14} />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link to="/profile" className={styles.dropdownItem} onClick={() => { setDropdownOpen(false); handleEdit(); }}>
                      <Edit size={16} />
                      Edit Profile
                    </Link>
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
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
            <Link to="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/guides" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Our Guides</Link>
            <Link to="/partners" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Day trips</Link>
            {!user ? (
              <button type="button" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                <User size={20} />
                <span>Sign in</span>
              </button>
            ) : (
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
            )}
          </div>
        )}

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
              {editing ? (
                <>
                  <div className={styles.editField}>
                    <input
                      type="text"
                      value={editData.displayName}
                      onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                      className={styles.nameInput}
                      placeholder="Your name"
                    />
                    <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                      <Save size={14} />
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                  <div className={styles.countrySection}>
                    <label className={styles.countryLabel}>Countries I've visited</label>
                    <CountrySelector
                      selected={editData.visited_countries}
                      onChange={(countries) => setEditData({ ...editData, visited_countries: countries })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3 className={styles.name}>{user?.displayName || viewAsUser?.displayName || 'Traveler'}</h3>
                  <CountryBadges codes={viewAsUser?.visited_countries} />
                </>
              )}
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