
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFest } from '../context/festcontext'

const CATEGORIES = [
  'All',
  'Senior',
  'Junior',
  'Sub-Junior',
  'House',
  'General',
]

// Live event countdown
function EventCountdown({ startAt }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!startAt) {
    return <div className="event-countdown-label">Schedule TBA</div>
  }

  const start = new Date(startAt).getTime()

  if (!Number.isFinite(start)) {
    return <div className="event-countdown-label">Invalid schedule</div>
  }

  if (now >= start) {
    return (
      <div className="event-countdown-started">
        <span className="event-live-dot" />
        EVENT STARTED
      </div>
    )
  }

  const difference = start - now

  const days = Math.floor(difference / 86400000)
  const hours = Math.floor((difference % 86400000) / 3600000)
  const minutes = Math.floor((difference % 3600000) / 60000)
  const seconds = Math.floor((difference % 60000) / 1000)

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ]

  return (
    <div className="event-countdown">
      <div className="event-countdown-label">EVENT STARTS IN</div>

      <div className="event-countdown-grid">
        {units.map((unit) => (
          <div className="event-countdown-unit" key={unit.label}>
            <strong>{String(unit.value).padStart(2, '0')}</strong>
            <span>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { events = [], participants = [], members = [], teams = [], results = [] } = useFest()

  const [searchParams, setSearchParams] = useSearchParams()

  const initialCat = searchParams.get('category') || 'All'

  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.includes(initialCat) ? initialCat : 'All'
  )

  const [activeEvent, setActiveEvent] = useState(null)

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)

    if (cat === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ category: cat })
    }
  }

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return events

    return events.filter((event) => event.category === selectedCategory)
  }, [events, selectedCategory])

  const getEventParticipants = (eventId) => {
    const pList = participants.filter(
      (participant) => participant.event_id === eventId
    )

    return pList
      .map((participant) =>
        members.find((member) => member.id === participant.member_id)
      )
      .filter(Boolean)
  }

  const getEventResults = (eventId) => {
    return results
      .filter((result) => result.event_id === eventId)
      .sort((a, b) => (a.position || 99) - (b.position || 99))
  }

  const getTeamName = (teamId) =>
    teams.find((team) => team.id === teamId)?.name || 'Independent'

  const getMember = (memberId) =>
    members.find((member) => member.id === memberId)

  const formatDate = (date, full = false) => {
    if (!date) return 'Schedule TBA'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return 'Schedule TBA'

    return parsedDate.toLocaleString('en-IN', {
      dateStyle: full ? 'full' : 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="page-container">

      {/* Page Header */}
      <div className="page-header">
        <div className="section-kicker">COMPETITIONS & SCHEDULE</div>

        <h1>
          Festival <span>Events.</span>
        </h1>

        <p>
          Explore competitions, check event schedules, view countdowns,
          participants and published results.
        </p>
      </div>

      {/* Category Filters */}
      <div className="pill-group" style={{ marginBottom: '32px' }}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`filter-pill ${
              selectedCategory === category ? 'active' : ''
            }`}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="events-list-grid">

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            No events found in the {selectedCategory} category yet.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const eventParticipants = getEventParticipants(event.id)
            const eventResults = getEventResults(event.id)

            return (
              <div
                className="event-item-card"
                key={event.id}
                onClick={() => setActiveEvent(event)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveEvent(event)
                  }
                }}
              >

                {/* Card Header */}
                <div className="event-card-top">
                  <span className="badge">{event.category}</span>

                  <span className={`status-badge status-${event.status}`}>
                    {eventResults.length > 0
                      ? 'Results Published'
                      : event.status || 'Scheduled'}
                  </span>
                </div>

                {/* Event Information */}
                <h3>{event.name}</h3>

                <p>
                  {event.description ||
                    'Click to view event schedule, venue and registered participants.'}
                </p>

                {/* Countdown */}
                {event.event_date && (
                  <EventCountdown startAt={event.event_date} />
                )}

                {/* Event Metadata */}
                <div className="event-meta-footer">
                  <span>📍 {event.venue || 'Venue TBA'}</span>

                  <span>🕒 {formatDate(event.event_date)}</span>

                  <span>👥 {eventParticipants.length} Participants</span>
                </div>

                <div className="event-card-action">
                  View Event Details →
                </div>

              </div>
            )
          })
        )}

      </div>

      {/* Event Details Modal */}
      {activeEvent && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveEvent(null)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setActiveEvent(null)}
              aria-label="Close event details"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="event-card-top">
              <span className="badge">{activeEvent.category}</span>

              <span
                className={`status-badge status-${activeEvent.status}`}
              >
                {activeEvent.status || 'Scheduled'}
              </span>
            </div>

            <h2>{activeEvent.name}</h2>

            <p className="modal-desc">
              {activeEvent.description || 'Official competition event.'}
            </p>

            {/* Modal Countdown */}
            {activeEvent.event_date && (
              <EventCountdown startAt={activeEvent.event_date} />
            )}

            {/* Event Information */}
            <div className="modal-info-row">
              <div>
                <strong>Venue:</strong>{' '}
                {activeEvent.venue || 'To Be Announced'}
              </div>

              <div>
                <strong>Schedule:</strong>{' '}
                {formatDate(activeEvent.event_date, true)}
              </div>
            </div>

            {/* Published Results */}
            {getEventResults(activeEvent.id).length > 0 && (
              <div className="modal-section">
                <h3>🏆 Published Results</h3>

                <div className="results-list">
                  {getEventResults(activeEvent.id).map((result) => {
                    const winner = getMember(result.member_id)

                    return (
                      <div className="result-row" key={result.id}>
                        <span className="rank-pill">
                          #{result.position}
                        </span>

                        <div>
                          <strong>
                            {winner
                              ? winner.name
                              : getTeamName(result.team_id)}
                          </strong>

                          <span className="muted-text">
                            {' '}•{' '}
                            {getTeamName(
                              result.team_id || winner?.team_id
                            )}
                          </span>
                        </div>

                        <span className="points-pill">
                          +{result.points} pts
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Registered Participants */}
            <div className="modal-section">
              <h3>
                👥 Registered Participants (
                {getEventParticipants(activeEvent.id).length})
              </h3>

              {getEventParticipants(activeEvent.id).length === 0 ? (
                <p className="muted-text">
                  No participants registered yet.
                </p>
              ) : (
                <div className="modal-participants-grid">
                  {getEventParticipants(activeEvent.id).map((student) => (
                    <div className="mini-participant-card" key={student.id}>

                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.name}
                        />
                      ) : (
                        <div className="mini-avatar">
                          {student.name?.charAt(0) || '?'}
                        </div>
                      )}

                      <div>
                        <strong>{student.name}</strong>
                        <span>{getTeamName(student.team_id)}</span>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
