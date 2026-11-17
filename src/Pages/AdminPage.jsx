
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useFest } from '../context/FestContext'

const TABS = [
  'Branding',
  'Teams & Divisions',
  'Members',
  'Events & Roster',
  'Results',
  'Officials & News',
  'Photo Frames',
]

export default function AdminPage() {
  const {
    session,
    isAdmin,
    settings,
    teams,
    divisions,
    members,
    events,
    participants,
    results,
    officials,
    announcements,
    frames,
    refreshData,
    uploadMedia,
  } = useFest()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('Branding')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  // Form states
  const [brandForm, setBrandForm] = useState(null)
  const [teamForm, setTeamForm] = useState({ name: '', description: '' })
  const [divName, setDivName] = useState('')
  const [memberForm, setMemberForm] = useState({
    name: '',
    class_name: '',
    team_id: '',
    division_id: '',
    bio: '',
  })
  const [eventForm, setEventForm] = useState({
    name: '',
    category: 'Senior',
    description: '',
    venue: '',
    event_date: '',
    status: 'upcoming',
  })
  const [regForm, setRegForm] = useState({ event_id: '', member_id: '' })
  const [resultForm, setResultForm] = useState({
    event_id: '',
    member_id: '',
    team_id: '',
    position: 1,
    points: 10,
  })
  const [officialForm, setOfficialForm] = useState({
    name: '',
    designation: '',
    class_name: '',
    bio: '',
    display_order: 0,
  })
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    is_published: true,
  })
  const [frameTitle, setFrameTitle] = useState('')

  const notify = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 4000)
  }

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setBusy(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error
    } catch (err) {
      setAuthError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // ADMIN LOGIN SCREEN
  if (!session || !isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="login-brand-mark">Y</div>

          <div className="section-kicker">SECURE ADMINISTRATION</div>

          <h2>
            Welcome <span>Back.</span>
          </h2>

          <p className="login-description">
            Sign in with your authorised administrator account to manage the festival.
          </p>

          {session && !isAdmin && (
            <div className="error-box" role="alert">
              <strong>Access denied</strong>
              <p>
                You are signed in as {session.user.email}, but this account is
                not registered in the admin_users table.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="secondary-button login-submit"
              >
                Sign Out
              </button>
            </div>
          )}

          {!session && (
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label htmlFor="admin-email">Email Address</label>

                <input
                  id="admin-email"
                  type="email"
                  className="modern-input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="admin-password">Password</label>

                <div className="password-wrapper">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    className="modern-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="error-box" role="alert">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="primary-button login-submit"
              >
                {busy ? 'Signing In...' : 'Sign In to Dashboard'}
                {!busy && <span> ↗</span>}
              </button>
            </form>
          )}

          <div className="login-footer">
            <span className="login-status-dot"></span>
            Authorised organisers only
          </div>
        </div>
      </div>
    )
  }

  const currentBrand = brandForm || settings

  // SAVE FESTIVAL BRANDING
  const saveBranding = async (e) => {
    e.preventDefault()
    setBusy(true)

    try {
      let logo_url = currentBrand.logo_url
      let banner_url = currentBrand.banner_url

      const logoFile = e.target.logoFile?.files?.[0]
      const bannerFile = e.target.bannerFile?.files?.[0]

      if (logoFile) logo_url = await uploadMedia(logoFile, 'branding')
      if (bannerFile) banner_url = await uploadMedia(bannerFile, 'branding')

      const { error } = await supabase.from('festival_settings').upsert({
        id: 1,
        festival_name: currentBrand.festival_name,
        tagline: currentBrand.tagline,
        introduction: currentBrand.introduction,
        event_dates: currentBrand.event_dates,
        venue: currentBrand.venue,
        logo_url,
        banner_url,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      await refreshData()
      notify('✓ Festival branding updated!')
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  // ADD TEAM
  const addTeam = async (e) => {
    e.preventDefault()
    setBusy(true)

    try {
      let logo_url = null
      const file = e.target.teamLogo?.files?.[0]

      if (file) logo_url = await uploadMedia(file, 'teams')

      const { error } = await supabase
        .from('teams')
        .insert([{ ...teamForm, logo_url }])

      if (error) throw error

      setTeamForm({ name: '', description: '' })
      e.target.reset()

      await refreshData()
      notify('✓ Team added!')
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  // DELETE ITEM
  const deleteRow = async (table, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      await refreshData()
      notify('✓ Deleted successfully.')
    }
  }

  // ADD DIVISION
  const addDivision = async (e) => {
    e.preventDefault()

    if (!divName.trim()) return

    const { error } = await supabase
      .from('divisions')
      .insert([{ name: divName.trim() }])

    if (error) {
      alert(error.message)
    } else {
      setDivName('')
      await refreshData()
      notify('✓ Division added!')
    }
  }

  // ADD MEMBER
  const addMember = async (e) => {
    e.preventDefault()
    setBusy(true)

    try {
      let photo_url = null
      const file = e.target.memberPhoto?.files?.[0]

      if (file) photo_url = await uploadMedia(file, 'members')

      const payload = {
        ...memberForm,
        team_id: memberForm.team_id || null,
        division_id: memberForm.division_id || null,
        photo_url,
      }

      const { error } = await supabase.from('members').insert([payload])

      if (error) throw error

      setMemberForm({
        name: '',
        class_name: '',
        team_id: '',
        division_id: '',
        bio: '',
      })

      e.target.reset()

      await refreshData()
      notify('✓ Student member added!')
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  // ADD EVENT
  const addEvent = async (e) => {
    e.preventDefault()
    setBusy(true)

    try {
      const payload = {
        ...eventForm,
        event_date: eventForm.event_date
          ? new Date(eventForm.event_date).toISOString()
          : null,
      }

      const { error } = await supabase.from('events').insert([payload])

      if (error) throw error

      setEventForm({
        name: '',
        category: 'Senior',
        description: '',
        venue: '',
        event_date: '',
        status: 'upcoming',
      })

      await refreshData()
      notify('✓ Event created!')
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  // REGISTER PARTICIPANT
  const registerParticipant = async (e) => {
    e.preventDefault()

    if (!regForm.event_id || !regForm.member_id) return

    const { error } = await supabase
      .from('participants')
      .insert([regForm])

    if (error) {
      alert(error.message)
    } else {
      await refreshData()
      notify('✓ Participant registered to event!')
    }
  }

  // ADD RESULT
  const addResult = async (e) => {
    e.preventDefault()

    const chosenMember = members.find(
      (m) => m.id === resultForm.member_id
    )

    const finalTeamId =
      resultForm.team_id || chosenMember?.team_id || null

    const { error } = await supabase.from('results').insert([
      {
        event_id: resultForm.event_id,
        member_id: resultForm.member_id || null,
        team_id: finalTeamId,
        position: Number(resultForm.position),
        points: Number(resultForm.points),
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('id', resultForm.event_id)

      await refreshData()
      notify('✓ Result published & leaderboard updated!')
    }
  }

  // ADD OFFICIAL
  const addOfficial = async (e) => {
    e.preventDefault()
    setBusy(true)

    try {
      let photo_url = null
      const file = e.target.officialPhoto?.files?.[0]

      if (file) photo_url = await uploadMedia(file, 'officials')

      const { error } = await supabase.from('officials').insert([
        {
          ...officialForm,
          display_order: Number(officialForm.display_order || 0),
          photo_url,
        },
      ])

      if (error) throw error

      setOfficialForm({
        name: '',
        designation: '',
        class_name: '',
        bio: '',
        display_order: 0,
      })

      e.target.reset()

      await refreshData()
      notify('✓ Official added!')
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  // ADD ANNOUNCEMENT
  const addAnnouncement = async (e) => {
    e.preventDefault()

    const { error } = await supabase
      .from('announcements')
      .insert([newsForm])

    if (error) {
      alert(error.message)
    } else {
      setNewsForm({
        title: '',
        content: '',
        is_published: true,
      })

      await refreshData()
      notify('✓ Announcement saved!')
    }
  }

  // UPLOAD PHOTO FRAME
  const uploadFrame = async (e) => {
    e.preventDefault()
    setBusy(true)

    try {
      const file = e.target.frameFile?.files?.[0]

      if (!file) {
        throw new Error('Please choose a transparent PNG file.')
      }

      const frame_url = await uploadMedia(file, 'frames')

      const { error } = await supabase.from('photo_frames').insert([
        {
          title: frameTitle,
          frame_url,
          is_active: true,
        },
      ])

      if (error) throw error

      setFrameTitle('')
      e.target.reset()

      await refreshData()
      notify('✓ Photo Studio frame uploaded!')
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  // ADMIN DASHBOARD
  return (
    <div className="page-container">
      <div className="admin-topbar">
        <div>
          <div className="section-kicker">CONTROL CENTER</div>
          <h1>
            Admin <span>Dashboard.</span>
          </h1>
        </div>

        <button onClick={handleLogout} className="secondary-button">
          Sign Out
        </button>
      </div>

      {msg && <div className="toast-banner">{msg}</div>}

      {/* ADMIN NAVIGATION */}
      <div className="pill-group" style={{ marginBottom: '28px' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`filter-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. BRANDING */}
      {activeTab === 'Branding' && (
        <form className="admin-panel-box" onSubmit={saveBranding}>
          <h2>Festival Identity & Settings</h2>

          <div className="admin-grid-2">
            <label>
              Festival Name
              <input
                type="text"
                value={currentBrand.festival_name || ''}
                onChange={(e) =>
                  setBrandForm({
                    ...currentBrand,
                    festival_name: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Tagline
              <input
                type="text"
                value={currentBrand.tagline || ''}
                onChange={(e) =>
                  setBrandForm({
                    ...currentBrand,
                    tagline: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Festival Dates
              <input
                type="text"
                value={currentBrand.event_dates || ''}
                onChange={(e) =>
                  setBrandForm({
                    ...currentBrand,
                    event_dates: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Venue
              <input
                type="text"
                value={currentBrand.venue || ''}
                onChange={(e) =>
                  setBrandForm({
                    ...currentBrand,
                    venue: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Festival Logo (Image)
              <input type="file" name="logoFile" accept="image/*" />
            </label>

            <label>
              Hero Poster / Banner (Image)
              <input type="file" name="bannerFile" accept="image/*" />
            </label>
          </div>

          <label>
            Hero Introduction Paragraph
            <textarea
              rows="3"
              value={currentBrand.introduction || ''}
              onChange={(e) =>
                setBrandForm({
                  ...currentBrand,
                  introduction: e.target.value,
                })
              }
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="primary-button"
          >
            {busy ? 'Saving...' : 'Save Festival Settings'}
          </button>
        </form>
      )}

      {/* 2. TEAMS & DIVISIONS */}
      {activeTab === 'Teams & Divisions' && (
        <div className="admin-split">
          <div className="admin-panel-box">
            <h2>Add Team</h2>

            <form onSubmit={addTeam} className="admin-form">
              <input
                type="text"
                placeholder="Team Name (e.g., Phoenix House)"
                value={teamForm.name}
                onChange={(e) =>
                  setTeamForm({
                    ...teamForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <textarea
                rows="2"
                placeholder="Team Motto / Description"
                value={teamForm.description}
                onChange={(e) =>
                  setTeamForm({
                    ...teamForm,
                    description: e.target.value,
                  })
                }
              />

              <label>
                Team Logo
                <input
                  type="file"
                  name="teamLogo"
                  accept="image/*"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="primary-button"
              >
                Add Team
              </button>
            </form>

            <div className="admin-list">
              {teams.map((t) => (
                <div className="admin-list-item" key={t.id}>
                  <span>
                    <strong>{t.name}</strong>
                  </span>

                  <button
                    onClick={() => deleteRow('teams', t.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel-box">
            <h2>Manage Divisions</h2>

            <form onSubmit={addDivision} className="admin-form">
              <input
                type="text"
                placeholder="New Division Name"
                value={divName}
                onChange={(e) => setDivName(e.target.value)}
                required
              />

              <button type="submit" className="primary-button">
                Add Division
              </button>
            </form>

            <div className="admin-list">
              {divisions.map((d) => (
                <div className="admin-list-item" key={d.id}>
                  <span>{d.name}</span>

                  <button
                    onClick={() => deleteRow('divisions', d.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. MEMBERS */}
      {activeTab === 'Members' && (
        <div className="admin-panel-box">
          <h2>Add Student Member</h2>

          <form onSubmit={addMember} className="admin-grid-2">
            <input
              type="text"
              placeholder="Student Full Name"
              value={memberForm.name}
              onChange={(e) =>
                setMemberForm({
                  ...memberForm,
                  name: e.target.value,
                })
              }
              required
            />

            <input
              type="text"
              placeholder="Class / Department (e.g., B.Com Final)"
              value={memberForm.class_name}
              onChange={(e) =>
                setMemberForm({
                  ...memberForm,
                  class_name: e.target.value,
                })
              }
            />

            <select
              value={memberForm.team_id}
              onChange={(e) =>
                setMemberForm({
                  ...memberForm,
                  team_id: e.target.value,
                })
              }
            >
              <option value="">-- Select Team --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={memberForm.division_id}
              onChange={(e) =>
                setMemberForm({
                  ...memberForm,
                  division_id: e.target.value,
                })
              }
            >
              <option value="">-- Select Division --</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <label>
              Student Photo
              <input
                type="file"
                name="memberPhoto"
                accept="image/*"
              />
            </label>

            <button
              type="submit"
              disabled={busy}
              className="primary-button"
            >
              Add Member
            </button>
          </form>

          <div className="admin-list" style={{ marginTop: '24px' }}>
            {members.map((m) => (
              <div className="admin-list-item" key={m.id}>
                <span>
                  <strong>{m.name}</strong> ({m.class_name || 'Student'}) —{' '}
                  {teams.find((t) => t.id === m.team_id)?.name || 'No Team'}
                </span>

                <button
                  onClick={() => deleteRow('members', m.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EVENTS & ROSTER */}
      {activeTab === 'Events & Roster' && (
        <div className="admin-split">
          <div className="admin-panel-box">
            <h2>Create Event</h2>

            <form onSubmit={addEvent} className="admin-form">
              <input
                type="text"
                placeholder="Event Name (e.g., Classical Solo Song)"
                value={eventForm.name}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <select
                value={eventForm.category}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    category: e.target.value,
                  })
                }
              >
                <option value="Senior">Senior</option>
                <option value="Junior">Junior</option>
                <option value="Sub-Junior">Sub-Junior</option>
                <option value="House">House</option>
                <option value="General">General</option>
              </select>

              <input
                type="text"
                placeholder="Venue (e.g., Stage 1 - Main Hall)"
                value={eventForm.venue}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    venue: e.target.value,
                  })
                }
              />

              <input
                type="datetime-local"
                value={eventForm.event_date}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    event_date: e.target.value,
                  })
                }
              />

              <textarea
                rows="2"
                placeholder="Event rules or description"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    description: e.target.value,
                  })
                }
              />

              <button
                type="submit"
                disabled={busy}
                className="primary-button"
              >
                Create Event
              </button>
            </form>

            <div className="admin-list">
              {events.map((ev) => (
                <div className="admin-list-item" key={ev.id}>
                  <span>
                    <strong>{ev.name}</strong> [{ev.category}]
                  </span>

                  <button
                    onClick={() => deleteRow('events', ev.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel-box">
            <h2>Register Participant to Event</h2>

            <form onSubmit={registerParticipant} className="admin-form">
              <select
                value={regForm.event_id}
                onChange={(e) =>
                  setRegForm({
                    ...regForm,
                    event_id: e.target.value,
                  })
                }
                required
              >
                <option value="">-- Choose Event --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.category})
                  </option>
                ))}
              </select>

              <select
                value={regForm.member_id}
                onChange={(e) =>
                  setRegForm({
                    ...regForm,
                    member_id: e.target.value,
                  })
                }
                required
              >
                <option value="">-- Choose Student --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <button type="submit" className="primary-button">
                Assign Participant
              </button>
            </form>

            <div className="admin-list">
              {participants.slice(0, 20).map((p) => {
                const evName = events.find(
                  (e) => e.id === p.event_id
                )?.name

                const stName = members.find(
                  (m) => m.id === p.member_id
                )?.name

                return (
                  <div className="admin-list-item" key={p.id}>
                    <span>
                      {stName} → <strong>{evName}</strong>
                    </span>

                    <button
                      onClick={() => deleteRow('participants', p.id)}
                      className="delete-btn"
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. RESULTS */}
      {activeTab === 'Results' && (
        <div className="admin-panel-box">
          <h2>Publish Competition Result</h2>

          <form onSubmit={addResult} className="admin-grid-2">
            <select
              value={resultForm.event_id}
              onChange={(e) =>
                setResultForm({
                  ...resultForm,
                  event_id: e.target.value,
                })
              }
              required
            >
              <option value="">-- Select Event --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.category})
                </option>
              ))}
            </select>

            <select
              value={resultForm.member_id}
              onChange={(e) =>
                setResultForm({
                  ...resultForm,
                  member_id: e.target.value,
                })
              }
            >
              <option value="">
                -- Winning Student (Optional for Team Event) --
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <select
              value={resultForm.team_id}
              onChange={(e) =>
                setResultForm({
                  ...resultForm,
                  team_id: e.target.value,
                })
              }
            >
              <option value="">
                -- Winning Team (Auto-fills from student if blank) --
              </option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={resultForm.position}
              onChange={(e) =>
                setResultForm({
                  ...resultForm,
                  position: e.target.value,
                })
              }
            >
              <option value={1}>1st Place (First)</option>
              <option value={2}>2nd Place (Second)</option>
              <option value={3}>3rd Place (Third)</option>
            </select>

            <input
              type="number"
              step="0.5"
              placeholder="Points Awarded (e.g., 10)"
              value={resultForm.points}
              onChange={(e) =>
                setResultForm({
                  ...resultForm,
                  points: e.target.value,
                })
              }
              required
            />

            <button type="submit" className="primary-button">
              Publish Result
            </button>
          </form>

          <div className="admin-list" style={{ marginTop: '24px' }}>
            {results.map((r) => (
              <div className="admin-list-item" key={r.id}>
                <span>
                  <strong>#{r.position}</strong> •{' '}
                  {events.find((e) => e.id === r.event_id)?.name} —{' '}
                  {members.find((m) => m.id === r.member_id)?.name ||
                    teams.find((t) => t.id === r.team_id)?.name}{' '}
                  (+{r.points} pts)
                </span>

                <button
                  onClick={() => deleteRow('results', r.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. OFFICIALS & NEWS */}
      {activeTab === 'Officials & News' && (
        <div className="admin-split">
          <div className="admin-panel-box">
            <h2>Add Festival Official</h2>

            <form onSubmit={addOfficial} className="admin-form">
              <input
                type="text"
                placeholder="Official Name"
                value={officialForm.name}
                onChange={(e) =>
                  setOfficialForm({
                    ...officialForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Designation (e.g., Arts Club Secretary)"
                value={officialForm.designation}
                onChange={(e) =>
                  setOfficialForm({
                    ...officialForm,
                    designation: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Class or Department"
                value={officialForm.class_name}
                onChange={(e) =>
                  setOfficialForm({
                    ...officialForm,
                    class_name: e.target.value,
                  })
                }
              />

              <textarea
                rows="2"
                placeholder="Short Bio"
                value={officialForm.bio}
                onChange={(e) =>
                  setOfficialForm({
                    ...officialForm,
                    bio: e.target.value,
                  })
                }
              />

              <label>
                Profile Photo
                <input
                  type="file"
                  name="officialPhoto"
                  accept="image/*"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="primary-button"
              >
                Add Official
              </button>
            </form>

            <div className="admin-list">
              {officials.map((o) => (
                <div className="admin-list-item" key={o.id}>
                  <span>
                    <strong>{o.name}</strong> ({o.designation})
                  </span>

                  <button
                    onClick={() => deleteRow('officials', o.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-panel-box">
            <h2>Publish Announcement</h2>

            <form onSubmit={addAnnouncement} className="admin-form">
              <input
                type="text"
                placeholder="Announcement Title"
                value={newsForm.title}
                onChange={(e) =>
                  setNewsForm({
                    ...newsForm,
                    title: e.target.value,
                  })
                }
                required
              />

              <textarea
                rows="3"
                placeholder="Announcement Details..."
                value={newsForm.content}
                onChange={(e) =>
                  setNewsForm({
                    ...newsForm,
                    content: e.target.value,
                  })
                }
                required
              />

              <button type="submit" className="primary-button">
                Publish Announcement
              </button>
            </form>

            <div className="admin-list">
              {announcements.map((a) => (
                <div className="admin-list-item" key={a.id}>
                  <span>
                    <strong>{a.title}</strong>
                  </span>

                  <button
                    onClick={() => deleteRow('announcements', a.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. PHOTO FRAMES */}
      {activeTab === 'Photo Frames' && (
        <div className="admin-panel-box">
          <h2>Manage Photo Studio Frames (Transparent PNGs)</h2>

          <p className="muted-text" style={{ marginBottom: '16px' }}>
            Upload square (1080×1080) transparent PNG overlays so students
            can frame their photos in Photo Studio.
          </p>

          <form onSubmit={uploadFrame} className="admin-grid-2">
            <input
              type="text"
              placeholder="Frame Name (e.g., Official Fest Poster Frame)"
              value={frameTitle}
              onChange={(e) => setFrameTitle(e.target.value)}
              required
            />

            <input
              type="file"
              name="frameFile"
              accept="image/png"
              required
            />

            <button
              type="submit"
              disabled={busy}
              className="primary-button"
            >
              {busy ? 'Uploading...' : 'Upload Frame'}
            </button>
          </form>

          <div className="admin-list" style={{ marginTop: '24px' }}>
            {frames.map((f) => (
              <div className="admin-list-item" key={f.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <img
                    src={f.frame_url}
                    alt={f.title}
                    style={{
                      width: '44px',
                      height: '44px',
                      objectFit: 'contain',
                      background: '#000',
                    }}
                  />

                  <strong>{f.title}</strong>
                </div>

                <button
                  onClick={() => deleteRow('photo_frames', f.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
