
import { useEffect, useMemo, useState } from 'react'
import { useFest } from '../context/festcontext'

function getWhatsAppNumber(phone) {
  let number = String(phone || '').replace(/\D/g, '')

  if (number.length === 10) {
    number = '91' + number
  }

  return number
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function OfficialsPage() {
  const { officials = [], loading } = useFest()
  const [search, setSearch] = useState('')
  const [activeDesignation, setActiveDesignation] = useState('All')
  const [selectedOfficial, setSelectedOfficial] = useState(null)

  const designations = useMemo(() => {
    const values = officials
      .map(person => person.designation)
      .filter(Boolean)

    return ['All', ...new Set(values)]
  }, [officials])

  const filteredOfficials = useMemo(() => {
    return officials.filter(person => {
      const matchesSearch = [
        person.name,
        person.designation,
        person.class_name,
        person.bio
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesDesignation =
        activeDesignation === 'All' ||
        person.designation === activeDesignation

      return matchesSearch && matchesDesignation
    })
  }, [officials, search, activeDesignation])

  useEffect(() => {
    if (!selectedOfficial) return

    const handleEscape = event => {
      if (event.key === 'Escape') setSelectedOfficial(null)
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [selectedOfficial])

  const getInitial = name =>
    name?.trim()?.charAt(0).toUpperCase() || '?'

  const getPhone = phone =>
    String(phone || '').replace(/\D/g, '')

  const getCallNumber = phone => {
    const number = getPhone(phone)
    return number.length === 10 ? '91' + number : number
  }

  return (
    <div className="page-container officials-page">

      <header className="officials-header">
        <div className="section-kicker">
          ORGANISING COMMITTEE
        </div>

        <h1>
          Meet Our <span>Officials.</span>
        </h1>

        <p>
          The people, leadership and dedication behind
          KIC Talent's Meet.
        </p>

        <div className="officials-count">
          <strong>{officials.length}</strong>
          <span>Festival Officials</span>
        </div>
      </header>

      <div className="officials-toolbar">
        <div className="officials-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search by name, designation or class..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="officials-filters">
          {designations.map(designation => (
            <button
              key={designation}
              className={
                activeDesignation === designation
                  ? 'official-filter active'
                  : 'official-filter'
              }
              onClick={() => setActiveDesignation(designation)}
            >
              {designation}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          Loading officials...
        </div>
      ) : filteredOfficials.length === 0 ? (
        <div className="empty-state">
          No officials found.
        </div>
      ) : (
        <div className="officials-premium-grid">
          {filteredOfficials.map(person => (
            <article
              className="official-premium-card"
              key={person.id}
            >
              <div className="official-card-image">
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={person.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="official-card-placeholder">
                    {getInitial(person.name)}
                  </div>
                )}

                <div className="official-image-overlay" />

                <span className="official-card-designation">
                  {person.designation || 'Committee Member'}
                </span>
              </div>

              <div className="official-card-content">
                <h3>{person.name}</h3>

                {person.class_name && (
                  <p className="official-card-class">
                    {person.class_name}
                  </p>
                )}

                <button
                  className="official-details-btn"
                  onClick={() => setSelectedOfficial(person)}
                >
                  <EyeIcon />
                  <span>View Details</span>
                  <span className="official-btn-arrow">↗</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedOfficial && (
        <div
          className="official-modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setSelectedOfficial(null)
            }
          }}
        >
          <section
            className="official-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedOfficial.name} profile`}
          >
            <button
              className="official-modal-close"
              onClick={() => setSelectedOfficial(null)}
              aria-label="Close profile"
            >
              ×
            </button>

            <div className="official-modal-top">
              {selectedOfficial.photo_url ? (
                <img
                  src={selectedOfficial.photo_url}
                  alt={selectedOfficial.name}
                  className="official-modal-photo"
                />
              ) : (
                <div className="official-modal-avatar">
                  {getInitial(selectedOfficial.name)}
                </div>
              )}

              <div className="official-modal-heading">
                <span className="section-kicker">
                  OFFICIAL PROFILE
                </span>

                <h2>{selectedOfficial.name}</h2>

                <span className="official-modal-designation">
                  {selectedOfficial.designation || 'Committee Member'}
                </span>

                {selectedOfficial.class_name && (
                  <p>{selectedOfficial.class_name}</p>
                )}
              </div>
            </div>

            <div className="official-modal-divider" />

            <div className="official-modal-info">
              <h3>About</h3>
              <p>
                {selectedOfficial.bio ||
                  'No biography has been added yet.'}
              </p>
            </div>

            {selectedOfficial.phone_number && (
              <div className="official-modal-contact">
                <a
                  href={`tel:${getCallNumber(selectedOfficial.phone_number)}`}
                  className="official-call-btn"
                >
                  <span>☎</span>
                  Call Official
                </a>

                <a
                  href={`https://wa.me/${getWhatsAppNumber(selectedOfficial.phone_number)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="official-whatsapp-btn"
                >
                  <span>◉</span>
                  WhatsApp
                </a>
              </div>
            )}
          </section>
        </div>
      )}

    </div>
  )
}
