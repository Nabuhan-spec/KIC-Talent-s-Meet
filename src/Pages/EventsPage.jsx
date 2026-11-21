
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFest } from '../context/festcontext'

const CATEGORIES = ['All', 'Senior', 'Junior', 'Sub-Junior', 'House', 'General']

const formatDate = (date, options = {}) => {
  if (!date) return 'Schedule TBA'

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Schedule TBA'

  return parsed.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options,
  })
}

const getEventState = (event) => {
  if (String(event.status || '').toLowerCase() === 'completed') {
    return 'completed'
  }

  if (!event.event_date) return 'unscheduled'

  const time = new Date(event.event_date).getTime()

  if (!Number.isFinite(time)) return 'unscheduled'

  return Date.now() >= time ? 'ongoing' : 'upcoming'
}

function Countdown({ date }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!date) return <span className="fest-no-time">Schedule to be announced</span>

  const target = new Date(date).getTime()

  if (!Number.isFinite(target)) return <span className="fest-no-time">Invalid schedule</span>

  if (now >= target) {
    return (
      <div className="fest-live-label">
        <span className="fest-live-indicator" />
        EVENT STARTED
      </div>
    )
  }

  const difference = target - now

  const values = [
    { label: 'DAYS', value: Math.floor(difference / 86400000) },
    { label: 'HRS', value: Math.floor((difference % 86400000) / 3600000) },
    { label: 'MIN', value: Math.floor((difference % 3600000) / 60000) },
    { label: 'SEC', value: Math.floor((difference % 60000) / 1000) },
  ]

  return (
    <div className="fest-countdown">
      {values.map((item) => (
        <div className="fest-countdown-unit" key={item.label}>
          <strong>{String(item.value).padStart(2, '0')}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function EventModal({ event, onClose, participants, members, teams, results }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const eventParticipants = participants
    .filter((p) => p.event_id === event.id)
    .map((p) => members.find((m) => m.id === p.member_id))
    .filter(Boolean)

  const eventResults = results
    .filter((r) => r.event_id === event.id)
    .sort((a, b) => (a.position || 99) - (b.position || 99))

  const getTeamName = (id) =>
    teams.find((team) => team.id === id)?.name || 'Independent'

  const getMember = (id) => members.find((m) => m.id === id)

  return (
    <div className="fest-modal-backdrop" onClick={onClose}>
      <div
        className="fest-event-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={event.name}
      >
        <button className="fest-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="fest-modal-cover">
          <span className="fest-modal-kicker">KIC TALENT'S MEET · EVENT DETAILS</span>
          <span className="fest-modal-category">{event.category}</span>
          <h2>{event.name}</h2>
          <p>{event.description || 'Official festival competition.'}</p>
        </div>

        <div className="fest-modal-body">
          <div className="fest-modal-facts">
            <div>
              <span>DATE & TIME</span>
              <strong>
                {formatDate(event.event_date, {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </strong>
            </div>
            <div>
              <span>VENUE</span>
              <strong>{event.venue || 'To be announced'}</strong>
            </div>
            <div>
              <span>CATEGORY</span>
              <strong>{event.category || 'General'}</strong>
            </div>
            <div>
              <span>PARTICIPANTS</span>
              <strong>{eventParticipants.length} registered</strong>
            </div>
          </div>

          {getEventState(event) === 'upcoming' && (
            <div className="fest-modal-countdown">
              <span>COUNTDOWN TO THE EVENT</span>
              <Countdown date={event.event_date} />
            </div>
          )}

          {getEventState(event) === 'ongoing' && (
            <div className="fest-modal-countdown">
              <span>EVENT STATUS</span>
              <div className="fest-live-label">
                <span className="fest-live-indicator" />
                EVENT STARTED
              </div>
            </div>
          )}

          {eventResults.length > 0 && (
            <section className="fest-modal-section">
              <div className="fest-modal-section-heading">
                <span>01 / RESULTS</span>
                <h3>Hall of winners.</h3>
              </div>

              <div className="fest-winners">
                {eventResults.map((result) => {
                  const winner = getMember(result.member_id)

                  return (
                    <div className="fest-winner-row" key={result.id}>
                      <span className="fest-winner-rank">
                        #{result.position}
                      </span>
                      <div>
                        <strong>
                          {winner?.name || getTeamName(result.team_id)}
                        </strong>
                        <small>
                          {getTeamName(result.team_id || winner?.team_id)}
                        </small>
                      </div>
                      <b>{result.points || 0} pts</b>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <section className="fest-modal-section">
            <div className="fest-modal-section-heading">
              <span>{eventResults.length > 0 ? '02' : '01'} / PARTICIPANTS</span>
              <h3>The contenders.</h3>
              <p>{eventParticipants.length} students registered for this event.</p>
            </div>

            {eventParticipants.length === 0 ? (
              <p className="fest-empty">No participants registered yet.</p>
            ) : (
              <div className="fest-participant-list">
                {eventParticipants.map((student) => (
                  <div className="fest-participant" key={student.id}>
                    {student.photo_url ? (
                      <img src={student.photo_url} alt={student.name} />
                    ) : (
                      <div className="fest-participant-avatar">
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
          </section>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const {
    events = [],
    participants = [],
    members = [],
    teams = [],
    results = [],
  } = useFest()

  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'

  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.includes(initialCategory) ? initialCategory : 'All'
  )
  const [search, setSearch] = useState('')
  const [activeEvent, setActiveEvent] = useState(null)

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)

    if (category === 'All') {
      setSearchParams({})
    } else {
      setSearchParams({ category })
    }
  }

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (!a.event_date) return 1
      if (!b.event_date) return -1
      return new Date(a.event_date) - new Date(b.event_date)
    })
  }, [events])

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      const matchesCategory =
        selectedCategory === 'All' || event.category === selectedCategory

      const term = search.trim().toLowerCase()
      const matchesSearch =
        !term ||
        event.name?.toLowerCase().includes(term) ||
        event.venue?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term)

      return matchesCategory && matchesSearch
    })
  }, [sortedEvents, selectedCategory, search])

  const upcomingEvents = sortedEvents.filter(
    (event) => getEventState(event) === 'upcoming'
  )

  const featuredEvent = upcomingEvents[0]

  const totalParticipants = participants.length
  const completedCount = events.filter(
    (event) => getEventState(event) === 'completed'
  ).length

  const getParticipantCount = (eventId) =>
    participants.filter((p) => p.event_id === eventId).length

  const openEvent = (event) => setActiveEvent(event)
  const closeEvent = () => setActiveEvent(null)

  return (
    <div className="fest-events-page">

      {/* INTRO */}
      <section className="fest-events-intro">
        <div className="fest-intro-topline">
          <span>KARNATAKA ISLAMIC ACADEMY</span>
          <span>THE FESTIVAL EXPERIENCE · 2026</span>
        </div>

        <div className="fest-intro-main">
          <div>
            <div className="fest-eyebrow">
              <span className="fest-eyebrow-line" />
              COMPETITIONS & SCHEDULE
            </div>

            <h1>
              Every talent.
              <br />
              <span>One stage.</span>
            </h1>

            <p className="fest-intro-description">
              Discover the competitions, follow the schedule and witness
              the talents of KIC.
            </p>
          </div>

          <div className="fest-intro-side">
            <span>EVENTS CATALOGUE</span>
            <strong>{String(events.length).padStart(2, '0')}</strong>
            <small>COMPETITIONS</small>
          </div>
        </div>

        <div className="fest-intro-bottom">
          <span>01 — EXPLORE THE EVENTS</span>
          <span>SCROLL TO DISCOVER ↓</span>
        </div>
      </section>

      {/* STATS */}
      <section className="fest-event-stats">
        <div>
          <span>TOTAL EVENTS</span>
          <strong>{events.length}</strong>
        </div>
        <div>
          <span>UPCOMING</span>
          <strong>{upcomingEvents.length}</strong>
        </div>
        <div>
          <span>PARTICIPANTS</span>
          <strong>{totalParticipants}</strong>
        </div>
        <div>
          <span>COMPLETED</span>
          <strong>{completedCount}</strong>
        </div>
      </section>

      {/* FEATURED EVENT */}
      {featuredEvent && (
        <section className="fest-featured-section">
          <div className="fest-section-label">
            <span>01 / THE NEXT EVENT</span>
            <span>UP NEXT</span>
          </div>

          <button
            className="fest-featured-card"
            onClick={() => openEvent(featuredEvent)}
          >
            <div className="fest-featured-content">
              <span className="fest-featured-category">
                {featuredEvent.category || 'GENERAL'} COMPETITION
              </span>

              <h2>{featuredEvent.name}</h2>

              <p>
                {featuredEvent.description ||
                  'The next competition on the festival schedule.'}
              </p>

              <div className="fest-featured-meta">
                <span>◷ {formatDate(featuredEvent.event_date, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}</span>
                <span>⌖ {featuredEvent.venue || 'Venue TBA'}</span>
                <span>♙ {getParticipantCount(featuredEvent.id)} participants</span>
              </div>

              <div className="fest-featured-link">
                EXPLORE EVENT <span>↗</span>
              </div>
            </div>

            <div className="fest-featured-timer">
              <span>THE COUNTDOWN</span>
              <Countdown date={featuredEvent.event_date} />
              <small>UNTIL THE STAGE COMES ALIVE</small>
            </div>
            <span className="fest-featured-number">01</span>
          </button>
        </section>
      )}

      {/* EVENT DISCOVERY */}
      <section className="fest-discover-section">
        <div className="fest-section-label">
          <span>02 / EXPLORE THE CATALOGUE</span>
          <span>{filteredEvents.length} EVENTS FOUND</span>
        </div>

        <div className="fest-discover-heading">
          <h2>The event <span>line-up.</span></h2>
          <p>Find your competition. Follow its journey.</p>
        </div>

        <div className="fest-event-controls">
          <div className="fest-category-tabs">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="fest-event-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search competitions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {/* TIMELINE */}
        <div className="fest-event-timeline">
          {filteredEvents.length === 0 ? (
            <div className="fest-empty">
              No events found. Try another category or search term.
            </div>
          ) : (
            filteredEvents.map((event, index) => {
              const state = getEventState(event)
              const eventResults = results.filter(
                (result) => result.event_id === event.id
              )

              return (
                <article className="fest-timeline-item" key={event.id}>
                  <div className="fest-timeline-index">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div />
                  </div>

                  <button
                    className="fest-timeline-card"
                    onClick={() => openEvent(event)}
                  >
                    <div className="fest-timeline-date">
                      <strong>
                        {event.event_date
                          ? formatDate(event.event_date, {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'TBA'}
                      </strong>
                      <span>
                        {event.event_date
                          ? formatDate(event.event_date, { year: 'numeric' })
                          : 'DATE'}
                      </span>
                    </div>

                    <div className="fest-timeline-main">
                      <div className="fest-timeline-tags">
                        <span>{event.category || 'GENERAL'}</span>
                        <span className={`fest-state fest-state-${state}`}>
                          {state === 'upcoming'
                            ? 'UPCOMING'
                            : state === 'ongoing'
                              ? 'ONGOING'
                              : state === 'completed'
                                ? 'COMPLETED'
                                : 'SCHEDULE TBA'}
                        </span>
                        {eventResults.length > 0 && (
                          <span className="fest-results-tag">RESULTS</span>
                        )}
                      </div>

                      <h3>{event.name}</h3>

                      <p>
                        {event.description || 'Official festival competition.'}
                      </p>

                      <div className="fest-timeline-meta">
                        <span>◷ {formatDate(event.event_date, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</span>
                        <span>⌖ {event.venue || 'Venue TBA'}</span>
                        <span>♙ {getParticipantCount(event.id)} participants</span>
                      </div>

                      {state === 'upcoming' && (
                        <div className="fest-card-countdown">
                          <span>STARTS IN</span>
                          <Countdown date={event.event_date} />
                        </div>
                      )}
                    </div>

                    <div className="fest-timeline-arrow">↗</div>
                  </button>
                </article>
              )
            })
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="fest-events-footer">
        <span>KIC TALENT'S MEET</span>
        <span>CELEBRATING KNOWLEDGE · CREATIVITY · TALENT</span>
      </footer>

      {/* EVENT MODAL */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          onClose={closeEvent}
          participants={participants}
          members={members}
          teams={teams}
          results={results}
        />
      )}
    </div>
  )
}
