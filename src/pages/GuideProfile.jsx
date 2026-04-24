import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, logout, uploadGuidePhoto } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Quote, Calendar, Settings, LogOut, Edit, TrendingUp, MessageSquare, Users, Map, Plus, X, Save, Upload, Trash2, Image, Search, ChevronDown } from 'lucide-react'
import { countries, countryMap, getFlagUrl } from '../data/countries'
import Footer from '../components/Footer'
import styles from './Profile.module.css'

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
              <span>{country?.flag}</span>
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
                  <span>{country.flag}</span>
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

export default function GuideProfile() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const [guideData, setGuideData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [loadAttempted, setLoadAttempted] = useState(false)

  const loadGuideData = async (guideId) => {
    if (!guideId) return
    
    setLoading(true)
    try {
      let data = null
      
      const guideRef = doc(db, 'guides', guideId)
      const guideSnap = await getDoc(guideRef)
      if (guideSnap.exists()) {
        data = { id: guideSnap.id, ...guideSnap.data() }
      } else {
        const q = query(collection(db, 'guides'), where('userId', '==', guideId))
        const snap = await getDocs(q)
        if (!snap.empty) {
          data = { id: snap.docs[0].id, ...snap.docs[0].data() }
        }
      }
      
      if (data) {
        setGuideData(data)
        setIsOwner(!!user && user.uid === data.userId)
      } else {
        setGuideData(null)
      }
    } catch (err) {
      console.error('Error loading guide data:', err)
      setGuideData(null)
    } finally {
      setLoading(false)
      setLoadAttempted(true)
    }
  }

  useEffect(() => {
    if (id && !loadAttempted) {
      loadGuideData(id)
    } else if (id && user) {
      setIsOwner(guideData?.userId === user.uid)
    }
  }, [id, user, guideData?.userId])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (loading) return null

  if (!guideData) {
    return (
      <>
        <section className={styles.hero}>
          <nav className={styles.nav}>
            <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
          </nav>
        </section>
        <section className={styles.profile}>
          <div className="container">
            <p>Guide not found</p>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  if (!isOwner && user) {
    return <GuidePublicProfile guide={guideData} />
  }

  if (isOwner && user) {
    return <GuideEditor user={user} guideData={guideData} onLogout={handleLogout} />
  }

  return <GuidePublicProfile guide={guideData} />
}

function GuideEditor({ user, guideData, onLogout }) {
  const [guide, setGuide] = useState({
    name: guideData?.name || user?.displayName || '',
    experience: guideData?.experience || '',
    bio: guideData?.bio || '',
    photoURL: guideData?.photoURL || user?.photoURL || '',
    city: guideData?.city || '',
    country: guideData?.country || '',
    days: guideData?.days || [],
    visited_countries: guideData?.visited_countries || [],
    ...guideData,
  })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

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

    setUploading(true)
    
    try {
      const url = await uploadGuidePhoto(user.uid, file)
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
        visited_countries: guide.visited_countries,
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
              <Link to={`/profile/${user.uid}`} className={styles.viewAsUserBtn}>
                View as User
              </Link>
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
              <div className={styles.countrySection}>
                <label className={styles.countryLabel}>Countries I've visited</label>
                <CountrySelector
                  selected={guide.visited_countries || []}
                  onChange={(countries) => updateGuideField('visited_countries', countries)}
                />
              </div>
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

          <div className={styles.guideDashboard}>
            <Link to={`/itinerario/${guide?.city?.toLowerCase()}`} className={styles.dashboardCard}>
              <Map size={32} />
              <span className={styles.dashboardTitle}>View Itinerary</span>
              <span className={styles.dashboardSub}>See on map</span>
            </Link>

            <div className={styles.dashboardCard}>
              <Users size={32} />
              <span className={styles.dashboardTitle}>Clients</span>
              <span className={styles.dashboardSub}>No bookings yet</span>
            </div>

            <div className={styles.dashboardCard}>
              <MessageSquare size={32} />
              <span className={styles.dashboardTitle}>Reviews</span>
              <span className={styles.dashboardSub}>No reviews yet</span>
            </div>

            <GuideMapPreview guide={guide} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
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

function GuidePublicProfile({ guide }) {
  const initial = guide?.name?.charAt(0) || '?'
  
  return (
    <>
      <section className={styles.hero}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>drifter<em>trip</em></Link>
        </nav>
        <div className={styles.content}>
          <p className="section-label">Local Guide</p>
          <h1 className={styles.headline}>
            {guide?.name}
          </h1>
          <p style={{ marginTop: '8px', color: 'var(--muted)' }}>
            {guide?.city}, {guide?.country}
          </p>
        </div>
      </section>

      <section className={styles.profile}>
        <div className={styles.profileInner}>
          <div className={styles.userCard}>
            {guide?.photoURL ? (
              <img src={guide.photoURL} alt={guide.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>{initial}</div>
            )}
            <div className={styles.userInfo}>
              <h3 className={styles.name}>{guide?.name}</h3>
              <p className={styles.email}>{guide?.city}, {guide?.country}</p>
              <CountryBadges codes={guide?.visited_countries} />
              <span className={styles.guideBadge}>Local Guide</span>
            </div>
          </div>
        </div>
      </section>

      {guide?.bio && (
        <section className={styles.requests}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: '16px' }}>
              About <em>{guide.name?.split(' ')[0]}</em>
            </h2>
            <p style={{ lineHeight: 1.7 }}>{guide.bio}</p>
          </div>
        </section>
      )}

      {guide?.experience && (
        <section className={styles.requests}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: '16px' }}>
              Experience
            </h2>
            <p style={{ lineHeight: 1.7 }}>{guide.experience}</p>
          </div>
        </section>
      )}

      {guide?.days?.length > 0 && (
        <section className={styles.requests}>
          <div className="container">
            <h2 className="section-title" style={{ marginBottom: '32px' }}>
              <em>Tours</em> & Experiences
            </h2>
            
            {guide.days.map((day, idx) => (
              <div key={idx} style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
                  Day {day.day}: {day.title}
                </h3>
                {day.intro && <p style={{ marginBottom: '16px', color: 'var(--muted)' }}>{day.intro}</p>}
                
                {day.sections?.map((section, sIdx) => (
                  <div key={sIdx} style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>{section.time}</p>
                    {section.spots?.filter(sp => sp.name).map((spot, pIdx) => (
                      <div key={pIdx} style={{ 
                        background: 'var(--card-bg)', 
                        padding: '16px', 
                        borderRadius: '8px',
                        marginBottom: '8px' 
                      }}>
                        <p style={{ fontWeight: 600 }}>{spot.name}</p>
                        {spot.description && <p style={{ color: 'var(--muted)', marginTop: '4px' }}>{spot.description}</p>}
                        {spot.price && <p style={{ marginTop: '8px', fontWeight: 600 }}>€{spot.price}</p>}
                      </div>
                    ))}
                  </div>
                ))}
                
                {day.budget && (
                  <p style={{ marginTop: '16px', fontWeight: 600 }}>
                    Estimated budget: €{day.budget}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}