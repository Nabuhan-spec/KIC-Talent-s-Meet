import { useFest } from '../context/FestContext'

export default function OfficialsPage() {
  const { officials, loading } = useFest()

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="section-kicker">ORGANISING COMMITTEE</div>
        <h1>Festival <span>Officials.</span></h1>
        <p>Meet the faculty coordinators, student convenors, and committee leaders behind the festival.</p>
      </div>

      {officials.length === 0 && !loading ? (
        <div className="empty-state">Organising committee profiles will be published soon.</div>
      ) : (
        <div className="officials-grid">
          {officials.map((person) => (
            <div className="official-card" key={person.id}>
              {person.photo_url ? (
                <img src={person.photo_url} alt={person.name} className="official-photo" />
              ) : (
                <div className="official-avatar">{person.name.charAt(0).toUpperCase()}</div>
              )}
              <span className="badge">{person.designation || 'Committee Member'}</span>
              <h3>{person.name}</h3>
              {person.class_name && <span className="official-dept">{person.class_name}</span>}
              {person.bio && <p>{person.bio}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}