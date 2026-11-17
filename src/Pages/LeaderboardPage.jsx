import { useState, useMemo } from 'react'
import { useFest } from '../context/FestContext'

const CATEGORIES = ['All', 'Senior', 'Junior', 'Sub-Junior', 'House', 'General']

export default function LeaderboardPage() {
  const { teams, results, events, members } = useFest()
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Compute live team totals
  const teamStandings = useMemo(() => {
    return teams
      .map((team) => {
        const teamResults = results.filter((r) => {
          if (selectedCategory === 'All') return r.team_id === team.id
          const ev = events.find((e) => e.id === r.event_id)
          return r.team_id === team.id && ev?.category === selectedCategory
        })
        const totalPoints = teamResults.reduce((sum, r) => sum + Number(r.points || 0), 0)
        const firstPlaces = teamResults.filter((r) => r.position === 1).length
        const secondPlaces = teamResults.filter((r) => r.position === 2).length
        const thirdPlaces = teamResults.filter((r) => r.position === 3).length
        return { ...team, totalPoints, firstPlaces, secondPlaces, thirdPlaces }
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
  }, [teams, results, events, selectedCategory])

  // Group results by event
  const eventsWithResults = useMemo(() => {
    return events
      .filter((ev) => selectedCategory === 'All' || ev.category === selectedCategory)
      .map((ev) => ({
        ...ev,
        eventResults: results
          .filter((r) => r.event_id === ev.id)
          .sort((a, b) => (a.position || 99) - (b.position || 99)),
      }))
      .filter((ev) => ev.eventResults.length > 0)
  }, [events, results, selectedCategory])

  const getMemberName = (id) => members.find((m) => m.id === id)?.name
  const getTeamName = (id) => teams.find((t) => t.id === id)?.name || 'Team'

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-kicker">LIVE STANDINGS & WINNERS</div>
        <h1>Results & <span>Leaderboard.</span></h1>
        <p>Live team scores and individual competition podiums updated as results are published.</p>
      </div>

      {/* Category Filter */}
      <div className="pill-group" style={{ marginBottom: '32px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Team Scoreboard */}
      <div className="scoreboard-grid">
        {teamStandings.length === 0 ? (
          <div className="empty-state">No teams created yet.</div>
        ) : (
          teamStandings.map((team, idx) => (
            <div className={`score-card ${idx === 0 ? 'leader-card' : ''}`} key={team.id}>
              <div className="score-rank">#{idx + 1}</div>
              <div className="score-team-info">
                {team.logo_url && <img src={team.logo_url} alt={team.name} className="score-logo" />}
                <div>
                  <h2>{team.name}</h2>
                  <div className="medal-counts">
                    <span>🥇 {team.firstPlaces}</span>
                    <span>🥈 {team.secondPlaces}</span>
                    <span>🥉 {team.thirdPlaces}</span>
                  </div>
                </div>
              </div>
              <div className="score-points">
                <strong>{team.totalPoints}</strong>
                <span>POINTS</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event-by-Event Results */}
      <h2 className="sub-section-title">Published Event Results</h2>
      <div className="events-list-grid">
        {eventsWithResults.length === 0 ? (
          <div className="empty-state">No results published for {selectedCategory} yet.</div>
        ) : (
          eventsWithResults.map((ev) => (
            <div className="event-item-card" key={ev.id}>
              <div className="event-card-top">
                <span className="badge">{ev.category}</span>
                <span className="status-badge status-completed">Completed</span>
              </div>
              <h3>{ev.name}</h3>
              <div className="results-list" style={{ marginTop: '14px' }}>
                {ev.eventResults.map((r) => (
                  <div className="result-row" key={r.id}>
                    <span className="rank-pill">
                      {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : r.position === 3 ? '🥉' : `#${r.position}`}
                    </span>
                    <div>
                      <strong>{getMemberName(r.member_id) || getTeamName(r.team_id)}</strong>
                      <span className="muted-text"> • {getTeamName(r.team_id)}</span>
                    </div>
                    <span className="points-pill">+{r.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}