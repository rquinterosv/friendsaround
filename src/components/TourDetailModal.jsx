import styles from './TourDetailModal.module.css'

function TourDetailModal({ tour, onClose }) {
  if (!tour) return null

  const handleBookNow = () => {
    onClose()
    setTimeout(() => {
      document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.modalHeader}>
          <span className={styles.tourCategory}>{tour.category}</span>
          <h2 className={styles.modalTitle}>{tour.name}</h2>
          <div className={styles.priceBadge}>€{tour.price}/person</div>
        </div>

        <div className={styles.modalBody}>
          {tour.gallery && tour.gallery.length > 0 && (
            <div className={styles.gallerySection}>
              <h3 className={styles.sectionTitle}>Gallery</h3>
              <div className={styles.galleryGrid}>
                {tour.gallery.map((img, i) => (
                  <div key={i} className={styles.galleryItem}>
                    <img src={img} alt={`${tour.name} - Image ${i + 1}`} className={styles.galleryImage} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Duration</span>
              <span className={styles.infoValue}>{tour.duration}</span>
            </div>
            {tour.distance && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Distance</span>
                <span className={styles.infoValue}>{tour.distance}</span>
              </div>
            )}
            {tour.difficulty && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Difficulty</span>
                <span className={styles.infoValue}>{tour.difficulty}</span>
              </div>
            )}
            {tour.departure && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Departure</span>
                <span className={styles.infoValue}>{tour.departure}</span>
              </div>
            )}
          </div>

          {tour.highlights && tour.highlights.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Highlights</h3>
              <ul className={styles.highlightsList}>
                {tour.highlights.map((item, i) => (
                  <li key={i} className={styles.highlightItem}>
                    <span className={styles.bullet}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.itinerary && tour.itinerary.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Itinerary</h3>
              <div className={styles.itineraryList}>
                {tour.itinerary.map((day, i) => (
                  <div key={i} className={styles.dayItem}>
                    <span className={styles.dayNumber}>Day {day.day}</span>
                    <span className={styles.dayDescription}>{day.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tour.included && tour.included.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>What's Included</h3>
              <ul className={styles.includedList}>
                {tour.included.map((item, i) => (
                  <li key={i} className={styles.includedItem}>
                    <span className={styles.checkIcon}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.toBring && tour.toBring.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>What to Bring</h3>
              <ul className={styles.toBringList}>
                {tour.toBring.map((item, i) => (
                  <li key={i} className={styles.toBringItem}>
                    <span className={styles.dotIcon}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.goodToKnow && tour.goodToKnow.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Good to Know</h3>
              <ul className={styles.goodToKnowList}>
                {tour.goodToKnow.map((item, i) => (
                  <li key={i} className={styles.goodToKnowItem}>
                    <span className={styles.infoIcon}>ℹ</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.optionalExtras && tour.optionalExtras.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Optional Extras</h3>
              <ul className={styles.extrasList}>
                {tour.optionalExtras.map((item, i) => (
                  <li key={i} className={styles.extrasItem}>
                    <span className={styles.extrasText}>{item.name}</span>
                    <span className={styles.extrasPrice}>€{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.bookButton} onClick={handleBookNow}>
            Book this experience
          </button>
        </div>
      </div>
    </div>
  )
}

export default TourDetailModal
