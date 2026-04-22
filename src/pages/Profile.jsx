import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db, logout, uploadGuidePhoto } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Quote, Calendar, Settings, LogOut, Edit, TrendingUp, MessageSquare, Users, Map, Plus, X, Save, Upload, Trash2, Image } from 'lucide-react'
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

function createEmptyDay(dayNum) {
  return {
    day: dayNum,
    title: '',
    intro: '',
    sections: [
      { time: 'Morning', spots: [{ name: '', description: '', price: '', image: '', lat: '', lng: '' }] },
      { time: 'Afternoon', spots: [{ name: '', description: '', price: '', image: '', lat: '', lng: '' }] },
      { time: 'Evening', spots: [{ name: '', description: '', price: '', image: '', lat: '', lng: '' }] },
    ],
    budget: '',
  }
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
      const allReqSnap = await getDocs(collection(db, 'requests'))
      const reqItems = allReqSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.userId === user.uid)
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

  const [isGuide, setIsGuide] = useState(false)
  const [guideData, setGuideData] = useState(null)

  useEffect(() => {
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
  }, [user])

  if (isGuide && guideData) {
    return <GuideProfile user={user} guideData={guideData} onLogout={handleLogout} />
  }

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
              <p className={styles.email}>{user.email}</p>
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

function GuideMapPreview({ guide }) {
  const allSpots = guide?.days?.flatMap(day => 
    day.sections?.flatMap(s => s.spots?.filter(sp => sp.name && sp.lat && sp.lng) || []) || []
  ) || []

  const centerLat = allSpots.length > 0 
    ? allSpots.reduce((sum, s) => sum + parseFloat(s.lat), 0) / allSpots.length
    : 50.0755
  const centerLng = allSpots.length > 0 
    ? allSpots.reduce((sum, s) => sum + parseFloat(s.lng), 0) / allSpots.length
    : 14.4378

  if (allSpots.length === 0) {
    return (
      <div className={styles.mapPreviewEmpty}>
        <Map size={48} />
        <h3>Map Preview</h3>
        <p>Add coordinates to your spots to see them on the map</p>
        <p className={styles.hint}>Enter latitude and longitude for each spot in your itinerary</p>
      </div>
    )
  }

  return (
    <div className={styles.mapPreview}>
      <div className={styles.mapPreviewHeader}>
        <h3 className={styles.dashboardTitle}>Map Preview</h3>
        <span className={styles.dashboardSub}>{allSpots.length} spots on map</span>
      </div>
      <div className={styles.mapEmbed}>
        <iframe
          title="Guide Itinerary Map"
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: '8px' }}
          loading="lazy"
          srcDoc={`
            <!DOCTYPE html>
            <html>
            <head>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
              <style>
                * { margin: 0; padding: 0; }
                #map { height: 100%; width: 100%; }
                .custom-icon { background: #c45d3a; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
              </style>
            </head>
            <body>
              <div id="map"></div>
              <script>
                var map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '&copy; OpenStreetMap'
                }).addTo(map);
                
                var bounds = [];
                var spots = ${JSON.stringify(allSpots)};
                var defaultIcon = L.divIcon({ className: 'custom-icon', html: '📍', iconSize: [30, 30] });
                
                spots.forEach(function(spot, i) {
                  var marker = L.marker([parseFloat(spot.lat), parseFloat(spot.lng)], { icon: defaultIcon }).addTo(map);
                  marker.bindPopup('<strong>' + spot.name + '</strong><br>' + (spot.description || ''));
                  bounds.push(marker.getLatLng());
                });
                
                if (bounds.length > 0) {
                  map.fitBounds(bounds, { padding: [30, 30] });
                }
              </script>
            </body>
            </html>
          `}
        />
      </div>
      <a 
        href={`https://www.google.com/maps/dir/${allSpots.map(s => `${s.lat},${s.lng}`).join('/')}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.googleMapsBtn}
      >
        <MapPin size={16} />
        Open Route in Google Maps
      </a>
    </div>
  )
}

function GuideProfile({ user, guideData, onLogout }) {
  const [guide, setGuide] = useState({
    name: guideData?.name || user?.displayName || '',
    experience: guideData?.experience || '',
    bio: guideData?.bio || '',
    photoURL: guideData?.photoURL || user?.photoURL || '',
    city: guideData?.city || '',
    country: guideData?.country || '',
    days: guideData?.days || [],
    ...guideData,
  })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB')
      return
    }

    if (!user?.uid) {
      alert('Error: User not authenticated')
      return
    }

    setPhotoFile(file)
    setUploading(true)
    
    try {
      console.log('Uploading photo for user:', user.uid)
      const url = await uploadGuidePhoto(user.uid, file)
      console.log('Photo uploaded successfully:', url)
      setGuide({ ...guide, photoURL: url })
    } catch (err) {
      console.error('Error uploading photo:', err)
      alert(`Error uploading photo: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const guideRef = doc(db, 'guides', guide.id)
      await updateDoc(guideRef, {
        name: guide.name,
        experience: guide.experience,
        photoURL: guide.photoURL,
        city: guide.city,
        country: guide.country,
        days: guide.days,
        bio: guide.bio,
      })
      setEditing(false)
    } catch (err) {
      console.error('Error saving guide:', err)
    } finally {
      setSaving(false)
    }
  }

  const updateGuideField = (field, value) => {
    setGuide({ ...guide, [field]: value })
  }

  const addDay = () => {
    if (!guide.days) guide.days = []
    if (guide.days.length >= 3) return
    const newDay = createEmptyDay(guide.days.length + 1)
    setGuide({ ...guide, days: [...guide.days, newDay] })
  }

  const removeDay = (dayIndex) => {
    const newDays = guide.days.filter((_, i) => i !== dayIndex)
    newDays.forEach((day, i) => day.day = i + 1)
    setGuide({ ...guide, days: newDays })
  }

  const updateDay = (dayIndex, field, value) => {
    const newDays = [...guide.days]
    newDays[dayIndex] = { ...newDays[dayIndex], [field]: value }
    setGuide({ ...guide, days: newDays })
  }

  const updateSection = (dayIndex, sectionIndex, field, value) => {
    const newDays = [...guide.days]
    const newSections = [...newDays[dayIndex].sections]
    newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value }
    newDays[dayIndex] = { ...newDays[dayIndex], sections: newSections }
    setGuide({ ...guide, days: newDays })
  }

  const updateSpot = (dayIndex, sectionIndex, spotIndex, field, value) => {
    const newDays = [...guide.days]
    const newSections = [...newDays[dayIndex].sections]
    const newSpots = [...newSections[sectionIndex].spots]
    newSpots[spotIndex] = { ...newSpots[spotIndex], [field]: value }
    newSections[sectionIndex] = { ...newSections[sectionIndex], spots: newSpots }
    newDays[dayIndex] = { ...newDays[dayIndex], sections: newSections }
    setGuide({ ...guide, days: newDays })
  }

  const handlePhotoUrlUpdate = () => {
    if (newPhotoUrl.trim()) {
      setGuide({ ...guide, photoURL: newPhotoUrl.trim() })
      setNewPhotoUrl('')
    }
  }

  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            {editing ? (
              <button onClick={handleSave} className="primary" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="secondary">
                <Edit size={16} />
                Edit Profile
              </button>
            )}
            <button onClick={onLogout} className={styles.logoutBtn}>
              <LogOut size={16} />
            </button>
          </div>
        </nav>

        <div className={styles.content}>
          <p className="section-label">Guide profile</p>
          <h1 className={styles.headline}>
            Welcome,<br />
            <em>{guide?.name?.split(' ')[0] || 'guide'}</em>
          </h1>
        </div>
      </section>

      <section className={styles.profile}>
        <div className={styles.profileInner}>
          <div className={styles.userCard}>
            {editing ? (
              <div className={styles.photoEditor}>
                <img 
                  src={guide?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'} 
                  alt={guide?.name} 
                  className={styles.avatar} 
                />
                <label className={styles.uploadBtn}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className={styles.fileInput}
                    disabled={uploading}
                  />
                  {uploading ? (
                    <span>Uploading...</span>
                  ) : (
                    <>
                      <Image size={16} />
                      <span>Change Photo</span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <img 
                src={guide?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'} 
                alt={guide?.name} 
                className={styles.avatar} 
              />
            )}
            <div className={styles.userInfo}>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={guide?.name || ''}
                    onChange={(e) => updateGuideField('name', e.target.value)}
                    className={styles.nameInput}
                    placeholder="Your name"
                  />
                  <input
                    type="text"
                    value={guide?.city || ''}
                    onChange={(e) => updateGuideField('city', e.target.value)}
                    className={styles.cityInput}
                    placeholder="City"
                  />
                </>
              ) : (
                <>
                  <h3 className={styles.name}>{guide?.name || 'Guide'}</h3>
                  <p className={styles.email}>{guide?.country}, {guide?.city}</p>
                </>
              )}
              <span className={styles.guideBadge}>Local Guide</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.requests}>
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '32px' }}>
            Your <em>experience</em>
          </h2>

          {editing ? (
            <div className={styles.experienceEditor}>
              <textarea
                value={guide?.experience || ''}
                onChange={(e) => updateGuideField('experience', e.target.value)}
                placeholder="Describe your experience..."
                className={styles.experienceTextarea}
                rows={4}
              />
              <textarea
                value={guide?.bio || ''}
                onChange={(e) => updateGuideField('bio', e.target.value)}
                placeholder="Short bio for your profile..."
                className={styles.experienceTextarea}
                rows={3}
              />
            </div>
          ) : (
            <div className={styles.experienceDisplay}>
              <p className={styles.experienceText}>{guide?.experience}</p>
              <p className={styles.bioText}>{guide?.bio}</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.requests}>
        <div className="container">
          <div className={styles.daysHeader}>
            <h2 className="section-title">
              {guide?.city} {guide?.days?.length || 0}-day <em>tour</em>
            </h2>
            {editing && guide?.days?.length < 3 && (
              <button onClick={addDay} className={styles.addDayBtn}>
                <Plus size={16} />
                Add Day
              </button>
            )}
          </div>

          <div className={styles.tourEditor}>
            {guide?.days?.map((day, dayIndex) => (
              <div key={dayIndex} className={styles.dayEditor}>
                <div className={styles.dayEditorHeader}>
                  {editing ? (
                    <>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                        className={styles.dayTitleInput}
                        placeholder={`Day ${day.day} title`}
                      />
                      {guide.days.length > 1 && (
                        <button onClick={() => removeDay(dayIndex)} className={styles.removeDayBtn}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  ) : (
                    <h3 className={styles.dayTitle}>Day {day.day}: {day.title}</h3>
                  )}
                  <input
                    type="text"
                    value={day.budget || ''}
                    onChange={(e) => updateDay(dayIndex, 'budget', e.target.value)}
                    placeholder="Budget €"
                    className={styles.budgetInput}
                    disabled={!editing}
                  />
                </div>

                {editing && (
                  <input
                    type="text"
                    value={day.intro || ''}
                    onChange={(e) => updateDay(dayIndex, 'intro', e.target.value)}
                    className={styles.dayIntroInput}
                    placeholder="Intro for this day..."
                    style={{ width: '100%', marginBottom: '16px' }}
                  />
                )}

                {!editing && day.intro && (
                  <p className={styles.dayIntro}>{day.intro}</p>
                )}

                <div className={styles.sectionsEditor}>
                  {day.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={styles.sectionEditor}>
                      <span className={styles.sectionTime}>{section.time}</span>
                      <div className={styles.spotsEditor}>
                        {section.spots.map((spot, spotIndex) => (
                          <div key={spotIndex} className={styles.spotEditor}>
                            {editing ? (
                              <>
                                <input
                                  type="text"
                                  value={spot.name}
                                  onChange={(e) => updateSpot(dayIndex, sectionIndex, spotIndex, 'name', e.target.value)}
                                  placeholder="Spot name"
                                  className={styles.spotInput}
                                />
                                <textarea
                                  value={spot.description}
                                  onChange={(e) => updateSpot(dayIndex, sectionIndex, spotIndex, 'description', e.target.value)}
                                  placeholder="Description"
                                  className={styles.spotTextarea}
                                />
                                <div className={styles.spotCoordsRow}>
                                  <input
                                    type="text"
                                    value={spot.lat || ''}
                                    onChange={(e) => updateSpot(dayIndex, sectionIndex, spotIndex, 'lat', e.target.value)}
                                    placeholder="Latitude"
                                    className={styles.coordInput}
                                  />
                                  <input
                                    type="text"
                                    value={spot.lng || ''}
                                    onChange={(e) => updateSpot(dayIndex, sectionIndex, spotIndex, 'lng', e.target.value)}
                                    placeholder="Longitude"
                                    className={styles.coordInput}
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={spot.price}
                                  onChange={(e) => updateSpot(dayIndex, sectionIndex, spotIndex, 'price', e.target.value)}
                                  placeholder="Price"
                                  className={styles.priceInput}
                                />
                                <input
                                  type="url"
                                  value={spot.image || ''}
                                  onChange={(e) => updateSpot(dayIndex, sectionIndex, spotIndex, 'image', e.target.value)}
                                  placeholder="Image URL (https://...)"
                                  className={styles.spotInput}
                                />
                              </>
                            ) : (
                              spot.name && (
                                <div className={styles.spotDisplay}>
                                  {spot.image && (
                                    <img src={spot.image} alt={spot.name} className={styles.spotImage} />
                                  )}
                                  <strong>{spot.name}</strong>
                                  <p>{spot.description}</p>
                                  {spot.lat && spot.lng && (
                                    <span className={styles.spotCoords}>📍 {parseFloat(spot.lat).toFixed(4)}, {parseFloat(spot.lng).toFixed(4)}</span>
                                  )}
                                  <span>€{spot.price}</span>
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <GuideMapPreview guide={guide} />
        </div>
      </section>

      <Footer />
    </>
  )
}