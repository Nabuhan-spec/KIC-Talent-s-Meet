import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FestProvider } from "./context/festcontext";
import Layout from "./components/layout";

import HomePage from "./Pages/HomePage";
import TeamsPage from "./Pages/TeamsPage";
import EventsPage from "./Pages/EventsPage";
import LeaderboardPage from "./Pages/LeaderboardPage";
import OfficialsPage from "./Pages/OfficialsPage";
import PhotoStudioPage from "./Pages/PhotoStudioPage";
import AdminPage from "./Pages/AdminPage";

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