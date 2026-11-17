import { Link } from 'react-router-dom'
import { useFest } from '../context/FestContext'

const categories = [
  { name: 'Senior', icon: '🎓', color: 'purple', count: 'Senior Division' },
  { name: 'Junior', icon: '⚡', color: 'orange', count: 'Junior Division' },
  { name: 'Sub-Junior', icon: '🌟', color: 'pink', count: 'Sub-Junior Division' },
  { name: 'House', icon: '🏆', color: 'blue', count: 'House Events' },
  { name: 'General', icon: '🎭', color: 'green', count: 'Open to Everyone' },
]

const features = [
  { icon: '👥', title: 'Our Teams', desc: 'Explore teams, divisions and participating students.', link: '/teams' },
  { icon: '🎤', title: 'Events', desc: 'Discover competitions, categories and event details.', link: '/events' },
  { icon: '🏅', title: 'Leaderboard', desc: 'Follow team scores and competition standings.', link: '/leaderboard' },
  { icon: '📸', title: 'Photo Studio', desc: 'Create your own fest profile picture with custom frames.', link: '/studio' },
]

export default function HomePage() {
  const { settings, teams, announcements, events } = useFest()

  const teamOne = teams[0]
  const teamTwo = teams[1]

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-glow glow-one"></div>
        <div className="hero-glow glow-two"></div>

        <div className="hero-content">
          <div className="eyebrow">
            <span className="live-dot"></span>
            {settings?.event_dates || 'THE OFFICIAL FESTIVAL WEBSITE'}
          </div>

          <h1>
            Beyond<br />
            <span className="gradient-text">Ordinary.</span>
          </h1>

          <p className="hero-description">
            {settings?.introduction ||
              'A celebration of creativity, talent, culture and competition. One stage. Countless possibilities.'}
          </p>

          <div className="hero-meta-badges">
            <span>📅 {settings?.event_dates || 'Dates TBA'}</span>
            <span>📍 {settings?.venue || 'Main Campus'}</span>
          </div>

          <div className="hero-actions">
            <Link to="/events" className="primary-button">Explore Events <span>↗</span></Link>
            <Link to="/teams" className="secondary-button">Discover Teams</Link>
          </div>

          <div className="hero-note">
            <span>✦</span> {settings?.tagline?.toUpperCase() || 'A NEW EXPERIENCE IS COMING'}
          </div>
        </div>

        <div className="hero-art">
          <div className="art-orbit orbit-one"></div>
          <div className="art-orbit orbit-two"></div>
          {settings?.banner_url ? (
            <img src={settings.banner_url} alt="Festival Poster" className="hero-poster-img" />
          ) : (
            <div className="art-core">
              <span className="core-star">✦</span>
              <span className="core-text">CREATE<br />INSPIRE<br />CONQUER</span>
            </div>
          )}
          <span className="floating-symbol symbol-one">✳</span>
          <span className="floating-symbol symbol-two">✦</span>
          <span className="floating-symbol symbol-three">✺</span>
          <div className="art-label">WHERE TALENT MEETS THE STAGE</div>
        </div>

        <div className="hero-bottom">
          <span>UNLEASH YOUR POTENTIAL</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="announcements-banner">
          <div className="section-kicker">📢 LATEST ANNOUNCEMENTS</div>
          <div className="announcements-grid">
            {announcements.slice(0, 3).map((item) => (
              <div className="announcement-card" key={item.id}>
                <span className="announcement-date">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="intro-section" id="features">
        <div className="section-kicker">THE EXPERIENCE</div>
        <div className="intro-heading">
          <h2>More than a fest.<br /><span>It's an experience.</span></h2>
          <p>
            Everything you need to experience the festival.
            Meet participants, explore competitions, follow results
            and create memories.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <Link to={feature.link} className="feature-card" key={feature.title}>
              <div className="feature-top">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-number">0{index + 1}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <span className="feature-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="events-section" id="events">
        <div className="section-kicker">COMPETE • CREATE • CONQUER</div>
        <div className="section-heading">
          <div>
            <h2>Explore the <span>Events.</span></h2>
            <p>Find your stage. Show the world what you can do.</p>
          </div>
          <span className="section-side-note">FIVE CATEGORIES / {events.length} EVENTS</span>
        </div>

        <div className="category-grid">
          {categories.map((category, index) => {
            const catCount = events.filter((e) => e.category === category.name).length
            return (
              <Link
                to={`/events?category=${encodeURIComponent(category.name)}`}
                className={`category-card ${category.color}`}
                key={category.name}
              >
                <span className="category-number">0{index + 1}</span>
                <span className="category-icon">{category.icon}</span>
                <div>
                  <span className="category-count">
                    {catCount > 0 ? `${catCount} Events` : category.count}
                  </span>
                  <h3>{category.name}</h3>
                </div>
                <span className="category-arrow">↗</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="teams-section" id="teams">
        <div className="teams-copy">
          <div className="section-kicker">THE SPIRIT OF COMPETITION</div>
          <h2>Different teams.<br /><span>One battlefield.</span></h2>
          <p>
            Discover the teams, meet their members and follow their
            journey throughout the festival.
          </p>
          <Link to="/teams" className="primary-button">Meet the Teams ↗</Link>
        </div>

        <div className="team-placeholder">
          <div className="team-orb orb-purple">
            {teamOne?.logo_url ? (
              <img src={teamOne.logo_url} alt={teamOne.name} className="orb-logo" />
            ) : (
              <span>{teamOne ? teamOne.name : <>TEAM<br />01</>}</span>
            )}
          </div>
          <div className="team-vs">VS</div>
          <div className="team-orb orb-orange">
            {teamTwo?.logo_url ? (
              <img src={teamTwo.logo_url} alt={teamTwo.name} className="orb-logo" />
            ) : (
              <span>{teamTwo ? teamTwo.name : <>TEAM<br />02</>}</span>
            )}
          </div>
          <span className="team-caption">THE RIVALRY BEGINS</span>
        </div>
      </section>

      <section className="closing-section" id="contact">
        <div className="closing-decoration">✳</div>
        <div className="section-kicker">YOUR MOMENT. YOUR STAGE.</div>
        <h2>Make it<br /><span>unforgettable.</span></h2>
        <p>Create your official festival frame in the Photo Studio or check the live leaderboard.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/studio" className="primary-button">Open Photo Studio ↗</Link>
          <Link to="/leaderboard" className="secondary-button">View Leaderboard</Link>
        </div>
      </section>
    </>
  )
}