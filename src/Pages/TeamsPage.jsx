import { useEffect, useMemo, useState } from 'react'
import { useFest } from '../context/festcontext'

export default function TeamsPage() {
  const {
    teams = [],
    divisions = [],
    members = [],
    participants = [],
    events = [],
    loading,
  } = useFest()

  const [selectedTeam, setSelectedTeam] = useState('ALL')
  const [selectedDivision, setSelectedDivision] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const safeTeams = Array.isArray(teams) ? teams : []
  const safeDivisions = Array.isArray(divisions) ? divisions : []
  const safeMembers = Array.isArray(members) ? members : []
  const safeParticipants = Array.isArray(participants) ? participants : []
  const safeEvents = Array.isArray(events) ? events : []

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return safeMembers.filter((member) => {
      const matchesTeam =
        selectedTeam === 'ALL' || String(member.team_id) === String(selectedTeam)

      const matchesDivision =
        selectedDivision === 'ALL' ||
        String(member.division_id) === String(selectedDivision)

      const matchesSearch =
        !query ||
        (member.name || '').toLowerCase().includes(query) ||
        (member.class_name || '').toLowerCase().includes(query)

      return matchesTeam && matchesDivision && matchesSearch
    })
  }, [safeMembers, selectedTeam, selectedDivision, searchQuery])

  const getTeamName = (id) =>
    safeTeams.find((team) => String(team.id) === String(id))?.name || 'Unassigned Team'

  const getDivisionName = (id) =>
    safeDivisions.find((division) => String(division.id) === String(id))?.name || 'General'

  const getMemberEvents = (memberId) => {
    const eventIds = safeParticipants
      .filter((participant) => String(participant.member_id) === String(memberId))
      .map((participant) => String(participant.event_id))

    return safeEvents.filter((event) => eventIds.includes(String(event.id)))
  }

  const openProfile = (member) => {
    setSelectedMember(member)
    setActiveTab('overview')
  }

  const closeProfile = () => {
    setSelectedMember(null)
  }

  // Close the profile modal with Escape and prevent background scrolling.
  useEffect(() => {
    if (!selectedMember) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeProfile()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [selectedMember])

  const totalMembers = safeMembers.length

  return (
    <main className="tp-page">
      {/* Page heading */}
      <header className="tp-header">
        <div className="tp-kicker">
          <span className="tp-kicker-dot" />
          HOUSES & COMPETITORS
        </div>

        <h1>
          Festival <span>Teams & Members.</span>
        </h1>

        <p>
          Explore team profiles, discover competitors, and view each
          student's festival participation.
        </p>

        <div className="tp-header-stats">
          <div className="tp-stat">
            <span className="tp-stat-number">{safeTeams.length}</span>
            <span className="tp-stat-label">Teams</span>
          </div>

          <div className="tp-stat-divider" />

          <div className="tp-stat">
            <span className="tp-stat-number">{totalMembers}</span>
            <span className="tp-stat-label">Members</span>
          </div>

          <div className="tp-stat-divider" />

          <div className="tp-stat">
            <span className="tp-stat-number">{safeDivisions.length}</span>
            <span className="tp-stat-label">Divisions</span>
          </div>
        </div>
      </header>

      {/* Team cards */}
      <section className="tp-section">
        <div className="tp-section-heading">
          <div>
            <span className="tp-section-eyebrow">THE COMPETITORS</span>
            <h2>Meet the teams</h2>
          </div>

          <span className="tp-section-count">
            {safeTeams.length} teams
          </span>
        </div>

        {safeTeams.length === 0 && !loading ? (
          <div className="tp-empty">
            <span className="tp-empty-icon">✦</span>
            <h3>No teams available</h3>
            <p>Teams will appear here once they have been added.</p>
          </div>
        ) : (
          <div className="tp-team-grid">
            {safeTeams.map((team, index) => {
              const teamMembers = safeMembers.filter(
                (member) => String(member.team_id) === String(team.id)
              )

              const isSelected = String(selectedTeam) === String(team.id)

              return (
                <button
                  type="button"
                  key={team.id}
                  className={`tp-team-card tp-team-${index % 3} ${
                    isSelected ? 'tp-team-selected' : ''
                  }`}
                  onClick={() =>
                    setSelectedTeam(isSelected ? 'ALL' : team.id)
                  }
                  aria-pressed={isSelected}
                >
                  <span className="tp-team-top">
                    <span className="tp-team-logo">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt="" />
                      ) : (
                        <span>
                          {(team.name || 'TM').slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>

                    <span className="tp-team-member-count">
                      {teamMembers.length} MEMBERS
                    </span>
                  </span>

                  <span className="tp-team-name">{team.name}</span>

                  <span className="tp-team-description">
                    {team.description ||
                      'Competing with passion, creativity, and team spirit.'}
                  </span>

                  <span className="tp-team-action">
                    {isSelected ? '✓ Currently selected' : 'View team members →'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Members section */}
      <section className="tp-section tp-members-section">
        <div className="tp-section-heading">
          <div>
            <span className="tp-section-eyebrow">STUDENT DIRECTORY</span>
            <h2>Meet the members</h2>
            <p className="tp-section-description">
              Search and explore the students participating in the festival.
            </p>
          </div>

          <span className="tp-result-count">
            {filteredMembers.length} results
          </span>
        </div>

        {/* Search and filters */}
        <div className="tp-controls">
          <div className="tp-search-wrap">
            <svg
              viewBox="0 0 24 24"
              className="tp-search-icon"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              className="tp-search"
              placeholder="Search by student name or class..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            {searchQuery && (
              <button
                type="button"
                className="tp-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="tp-filter-group">
            <span className="tp-filter-label">TEAM</span>
            <div className="tp-filter-options">
              <button
                type="button"
                className={`tp-filter ${
                  selectedTeam === 'ALL' ? 'tp-filter-active' : ''
                }`}
                onClick={() => setSelectedTeam('ALL')}
              >
                All teams
              </button>

              {safeTeams.map((team) => (
                <button
                  type="button"
                  key={team.id}
                  className={`tp-filter ${
                    String(selectedTeam) === String(team.id)
                      ? 'tp-filter-active'
                      : ''
                  }`}
                  onClick={() => setSelectedTeam(team.id)}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>

          <div className="tp-filter-group">
            <span className="tp-filter-label">DIVISION</span>
            <div className="tp-filter-options">
              <button
                type="button"
                className={`tp-filter ${
                  selectedDivision === 'ALL' ? 'tp-filter-active' : ''
                }`}
                onClick={() => setSelectedDivision('ALL')}
              >
                All divisions
              </button>

              {safeDivisions.map((division) => (
                <button
                  type="button"
                  key={division.id}
                  className={`tp-filter ${
                    String(selectedDivision) === String(division.id)
                      ? 'tp-filter-active'
                      : ''
                  }`}
                  onClick={() => setSelectedDivision(division.id)}
                >
                  {division.name}
                </button>
              ))}
            </div>
          </div>

          {(selectedTeam !== 'ALL' ||
            selectedDivision !== 'ALL' ||
            searchQuery) && (
            <button
              type="button"
              className="tp-reset-filters"
              onClick={() => {
                setSelectedTeam('ALL')
                setSelectedDivision('ALL')
                setSearchQuery('')
              }}
            >
              Reset filters ×
            </button>
          )}
        </div>

        {/* Student cards */}
        {loading ? (
          <div className="tp-empty">
            <div className="tp-loader" />
            <p>Loading festival members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="tp-empty">
            <span className="tp-empty-icon">⌕</span>
            <h3>No students found</h3>
            <p>Try changing your search or filters.</p>

            <button
              type="button"
              className="tp-reset-button"
              onClick={() => {
                setSelectedTeam('ALL')
                setSelectedDivision('ALL')
                setSearchQuery('')
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="tp-member-grid">
            {filteredMembers.map((member) => {
              const memberEvents = getMemberEvents(member.id)

              return (
                <article className="tp-member-card" key={member.id}>
                  <div className="tp-member-card-top">
                    <div className="tp-member-photo">
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.name} />
                      ) : (
                        <span>
                          {(member.name || '?').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="tp-member-info">
                      <h3>{member.name}</h3>
                      <p>
                        {member.class_name || 'Student'} ·{' '}
                        {getDivisionName(member.division_id)}
                      </p>
                      <span className="tp-member-team">
                        {getTeamName(member.team_id)}
                      </span>
                    </div>
                  </div>

                  {member.bio && (
                    <p className="tp-member-bio">{member.bio}</p>
                  )}

                  <div className="tp-member-card-footer">
                    <span className="tp-event-count">
                      <span className="tp-event-dot" />
                      {memberEvents.length} registered events
                    </span>

                    <button
                      type="button"
                      className="tp-view-profile"
                      onClick={() => openProfile(member)}
                      aria-label={`View ${member.name}'s profile`}
                      title="View student profile"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>View profile</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Student profile modal */}
      {selectedMember && (
        <div
          className="tp-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProfile()
          }}
        >
          <section
            className="tp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tp-modal-name"
          >
            <button
              type="button"
              className="tp-modal-close"
              onClick={closeProfile}
              aria-label="Close profile"
            >
              ×
            </button>

            <div className="tp-modal-header">
              <div className="tp-modal-photo">
                {selectedMember.photo_url ? (
                  <img
                    src={selectedMember.photo_url}
                    alt={selectedMember.name}
                  />
                ) : (
                  <span>
                    {(selectedMember.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="tp-modal-identity">
                <span className="tp-section-eyebrow">STUDENT PROFILE</span>
                <h2 id="tp-modal-name">{selectedMember.name}</h2>
                <p>
                  {selectedMember.class_name || 'Student'} ·{' '}
                  {getDivisionName(selectedMember.division_id)}
                </p>
                <span className="tp-member-team">
                  {getTeamName(selectedMember.team_id)}
                </span>
              </div>
            </div>

            <div className="tp-modal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'events'}
                className={activeTab === 'events' ? 'active' : ''}
                onClick={() => setActiveTab('events')}
              >
                Events
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'achievements'}
                className={activeTab === 'achievements' ? 'active' : ''}
                onClick={() => setActiveTab('achievements')}
              >
                Achievements
              </button>
            </div>

            <div className="tp-modal-content">
              {activeTab === 'overview' && (
                <div className="tp-tab-panel">
                  <h3>Student information</h3>

                  <div className="tp-info-grid">
                    <div className="tp-info-item">
                      <span>Full name</span>
                      <strong>{selectedMember.name || 'Not provided'}</strong>
                    </div>

                    <div className="tp-info-item">
                      <span>Class</span>
                      <strong>{selectedMember.class_name || 'Not provided'}</strong>
                    </div>

                    <div className="tp-info-item">
                      <span>Team</span>
                      <strong>{getTeamName(selectedMember.team_id)}</strong>
                    </div>

                    <div className="tp-info-item">
                      <span>Division</span>
                      <strong>
                        {getDivisionName(selectedMember.division_id)}
                      </strong>
                    </div>

                    <div className="tp-info-item">
                      <span>Registered events</span>
                      <strong>
                        {getMemberEvents(selectedMember.id).length}
                      </strong>
                    </div>
                  </div>

                  {selectedMember.bio && (
                    <div className="tp-about">
                      <h3>About</h3>
                      <p>{selectedMember.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="tp-tab-panel">
                  <h3>Registered events</h3>

                  {getMemberEvents(selectedMember.id).length === 0 ? (
                    <div className="tp-tab-empty">
                      <span>✦</span>
                      <p>No registered events found for this student.</p>
                    </div>
                  ) : (
                    <div className="tp-modal-event-list">
                      {getMemberEvents(selectedMember.id).map((event) => (
                        <div className="tp-modal-event" key={event.id}>
                          <span className="tp-modal-event-icon">✦</span>
                          <span>{event.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="tp-tab-panel">
                  <h3>Achievement passport</h3>

                  <div className="tp-tab-empty">
                    <span>🏆</span>
                    <p>Achievement records are not connected yet.</p>
                    <small>
                      Approved results and awards can appear here once the
                      results system is integrated.
                    </small>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}