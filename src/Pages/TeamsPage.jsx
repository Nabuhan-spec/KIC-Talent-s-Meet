import { useState, useMemo } from 'react'
import { useFest } from '../context/festcontext'

export default function TeamsPage() {
  const { teams, divisions, members, participants, events, loading } = useFest()
  const [selectedTeam, setSelectedTeam] = useState('ALL')
  const [selectedDivision, setSelectedDivision] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesTeam = selectedTeam === 'ALL' || m.team_id === selectedTeam
      const matchesDiv = selectedDivision === 'ALL' || m.division_id === selectedDivision
      const matchesSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.class_name && m.class_name.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesTeam && matchesDiv && matchesSearch
    })
  }, [members, selectedTeam, selectedDivision, searchQuery])

  const getTeamName = (id) => teams.find((t) => t.id === id)?.name || 'Unassigned Team'
  const getDivisionName = (id) => divisions.find((d) => d.id === id)?.name || 'General'
  const getMemberEvents = (memberId) => {
    const eventIds = participants.filter((p) => p.member_id === memberId).map((p) => p.event_id)
    return events.filter((e) => eventIds.includes(e.id))
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-kicker">HOUSES & COMPETITORS</div>
        <h1>Festival <span>Teams & Members.</span></h1>
        <p>Browse team profiles, filter by Senior, Junior, or Sub-Junior divisions, and search participants.</p>
      </div>

      {/* Team Profile Cards */}
      <div className="teams-overview-grid">
        {teams.length === 0 && !loading && (
          <div className="empty-state">Teams are being finalized. Check back soon!</div>
        )}
        {teams.map((team, idx) => {
          const teamMembers = members.filter((m) => m.team_id === team.id)
          const isSelected = selectedTeam === team.id
          return (
            <div
              key={team.id}
              className={`team-profile-card ${idx % 2 === 0 ? 'accent-purple' : 'accent-orange'} ${isSelected ? 'active-card' : ''}`}
              onClick={() => setSelectedTeam(isSelected ? 'ALL' : team.id)}
            >
              <div className="team-card-header">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="team-card-logo" />
                ) : (
                  <div className="team-card-avatar">{team.name.slice(0, 2).toUpperCase()}</div>
                )}
                <div>
                  <span className="badge">{teamMembers.length} Members</span>
                  <h2>{team.name}</h2>
                </div>
              </div>
              <p>{team.description || 'Competing with passion, creativity, and team spirit.'}</p>
              <span className="filter-hint">
                {isSelected ? '✓ Showing Team Members (Click to reset)' : 'Click to filter members →'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Search & Division Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search student by name or class..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="pill-group">
          <button
            className={`filter-pill ${selectedTeam === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedTeam('ALL')}
          >
            All Teams
          </button>
          {teams.map((t) => (
            <button
              key={t.id}
              className={`filter-pill ${selectedTeam === t.id ? 'active' : ''}`}
              onClick={() => setSelectedTeam(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="pill-group">
          <button
            className={`filter-pill ${selectedDivision === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedDivision('ALL')}
          >
            All Divisions
          </button>
          {divisions.map((d) => (
            <button
              key={d.id}
              className={`filter-pill ${selectedDivision === d.id ? 'active' : ''}`}
              onClick={() => setSelectedDivision(d.id)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Student Roster Grid */}
      <div className="members-grid">
        {filteredMembers.length === 0 ? (
          <div className="empty-state">No students match your current filter.</div>
        ) : (
          filteredMembers.map((member) => {
            const memberEvents = getMemberEvents(member.id)
            return (
              <div className="member-card" key={member.id}>
                <div className="member-top">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="member-photo" />
                  ) : (
                    <div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    <h3>{member.name}</h3>
                    <span className="member-meta">
                      {member.class_name || 'Student'} • {getDivisionName(member.division_id)}
                    </span>
                    <span className="team-tag">{getTeamName(member.team_id)}</span>
                  </div>
                </div>

                {member.bio && <p className="member-bio">{member.bio}</p>}

                <div className="member-events">
                  <span className="mini-label">Registered Events ({memberEvents.length}):</span>
                  {memberEvents.length === 0 ? (
                    <span className="muted-text">None listed yet</span>
                  ) : (
                    <div className="event-tags">
                      {memberEvents.map((ev) => (
                        <span key={ev.id} className="event-chip">{ev.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}