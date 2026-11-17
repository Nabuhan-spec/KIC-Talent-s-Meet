import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FestProvider } from './context/FestContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TeamsPage from './pages/TeamsPage'
import EventsPage from './pages/EventsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import OfficialsPage from './pages/OfficialsPage'
import PhotoStudioPage from './pages/PhotoStudioPage'
import AdminPage from './pages/AdminPage'
import './App.css'

function App() {
  return (
    <FestProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/officials" element={<OfficialsPage />} />
            <Route path="/studio" element={<PhotoStudioPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FestProvider>
  )
}

export default App