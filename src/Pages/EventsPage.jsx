import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFest } from '../context/FestContext'

const CATEGORIES = ['All', 'Senior', 'Junior', 'Sub-Junior', 'House', 'General']

export default function EventsPage() {
  const { events, participants, members, teams, results } = useFest()
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
    return events.filter((e) => e.category === selectedCategory)
  }, [events, selectedCategory])

  const getEventParticipants = (eventId) => {
    const pList = participants.filter((p) => p.event_id === eventId)
    return pList
      .map((p) => members.find((m) => m.id === p.member_id))
      .filter(Boolean)
  }

  const getEventResults = (eventId) => {
    return results
      .filter((r) => r.event_id === eventId)
      .sort((a, b) => (a.position || 99) - (b.position || 99))
  }

  const getTeamName = (teamId) => teams.find((t) => t.id === teamId)?.name || 'Independent'
  const getMember = (memberId) => members.find((m) => m.id === memberId)

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-kicker">COMPETITIONS & SCHEDULE</div>
        <h1>Festival <span>Events.</span></h1>
        <p>Select a category and click any event to inspect schedule, venue, participants, and results.</p>
      </div>

      {/* Category Tabs */}
      <div className="pill-group" style={{ marginBottom: '32px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="events-list-grid">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">No events found in the {selectedCategory} category yet.</div>
        ) : (
          filteredEvents.map((ev) => {
            const pCount = getEventParticipants(ev.id).length
            const hasResults = getEventResults(ev.id).length > 0
            return (
              <div className="event-item-card" key={ev.id} onClick={() => setActiveEvent(ev)}>
                <div className="event-card-top">
                  <span className="badge">{ev.category}</span>
                  <span className={`status-badge status-${ev.status}`}>
                    {hasResults ? 'Results Published' : ev.status}
                  </span>
                </div>
                <h3>{ev.name}</h3>
                <p>{ev.description || 'Click to view event schedule, venue, and registered participants.'}</p>
                <div className="event-meta-footer">
                  <span>📍 {ev.venue || 'Venue TBA'}</span>
                  <span>
                    🕒 {ev.event_date ? new Date(ev.event_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Schedule TBA'}
                  </span>
                  <span>👥 {pCount} Participants</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Event Details Modal */}
      {activeEvent && (
        <div className="modal-backdrop" onClick={() => setActiveEvent(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveEvent(null)}>✕</button>
            <div className="event-card-top">
              <span className="badge">{activeEvent.category}</span>
              <span className={`status-badge status-${activeEvent.status}`}>{activeEvent.status}</span>
            </div>
            <h2>{activeEvent.name}</h2>
            <p className="modal-desc">{activeEvent.description || 'Official competition event.'}</p>

            <div className="modal-info-row">
              <div><strong>Venue:</strong> {activeEvent.venue || 'To Be Announced'}</div>
              <div>
                <strong>Schedule:</strong>{' '}
                {activeEvent.event_date
                  ? new Date(activeEvent.event_date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })
                  : 'To Be Announced'}
              </div>
            </div>

            {/* Results Section (if published) */}
            {getEventResults(activeEvent.id).length > 0 && (
              <div className="modal-section">
                <h3>🏆 Published Results</h3>
                <div className="results-list">
                  {getEventResults(activeEvent.id).map((res) => {
                    const winner = getMember(res.member_id)
                    return (
                      <div className="result-row" key={res.id}>
                        <span className="rank-pill">#{res.position}</span>
                        <div>
                          <strong>{winner ? winner.name : getTeamName(res.team_id)}</strong>
                          <span className="muted-text"> • {getTeamName(res.team_id || winner?.team_id)}</span>
                        </div>
                        <span className="points-pill">+{res.points} pts</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Participants List */}
            <div className="modal-section">
              <h3>👥 Registered Participants ({getEventParticipants(activeEvent.id).length})</h3>
              {getEventParticipants(activeEvent.id).length === 0 ? (
                <p className="muted-text">No participants registered yet.</p>
              ) : (
                <div className="modal-participants-grid">
                  {getEventParticipants(activeEvent.id).map((student) => (
                    <div className="mini-participant-card" key={student.id}>
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} />
                      ) : (
                        <div className="mini-avatar">{student.name.charAt(0)}</div>
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