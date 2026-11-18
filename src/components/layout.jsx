import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useFest } from '../context/festcontext'

export default function Layout() {
  const { settings, isAdmin } = useFest()
  const [menuOpen, setMenuOpen] = useState(false)

  const festTitle = settings?.festival_name || 'YOURFEST'

  return (
    <div className="site-wrapper">
      <nav className="navbar">
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={festTitle} className="brand-logo-img" />
          ) : (
            <span className="brand-mark">✦</span>
          )}
          <span>
            {festTitle.includes('FEST') ? (
              <>
                {festTitle.replace('FEST', '')}
                <span className="brand-highlight">FEST</span>
              </>
            ) : (
              festTitle
            )}
          </span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/events" onClick={() => setMenuOpen(false)}>Events</NavLink>
          <NavLink to="/teams" onClick={() => setMenuOpen(false)}>Teams</NavLink>
          <NavLink to="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</NavLink>
          <NavLink to="/officials" onClick={() => setMenuOpen(false)}>Officials</NavLink>
          <NavLink to="/studio" onClick={() => setMenuOpen(false)}>Photo Studio</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="admin-pill" onClick={() => setMenuOpen(false)}>
              Admin Panel
            </NavLink>
          )}
        </div>

        <div className="nav-right-actions">
          <Link to="/studio" className="nav-button">Photo Studio ↗</Link>
          <button
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <Link to="/" className="brand">
          <span className="brand-mark">✦</span>
          <span>{festTitle}</span>
        </Link>
        <span>© {new Date().getFullYear()} • {settings?.venue || 'COLLEGE ARTS FESTIVAL'}</span>
        <div className="footer-links">
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/officials">Officials</Link>
          <Link to="/admin">{isAdmin ? 'Dashboard' : 'Admin'}</Link>
        </div>
      </footer>
    </div>
  )
}