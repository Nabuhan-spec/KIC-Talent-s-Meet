
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'

import { supabase } from '../lib/supabase'

const FestContext = createContext(null)

export function FestProvider({ children }) {
  const [festival, setFestival] = useState(null)
  const [teams, setTeams] = useState([])
  const [divisions, setDivisions] = useState([])
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [officials, setOfficials] = useState([])
  const [results, setResults] = useState([])
  const [participants, setParticipants] = useState([])
  const [photoFrames, setPhotoFrames] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        festivalRes,
        teamsRes,
        divisionsRes,
        membersRes,
        eventsRes,
        announcementsRes,
        officialsRes,
        resultsRes,
        participantsRes,
        framesRes
      ] = await Promise.all([
        supabase.from('festival_settings').select('*').limit(1).maybeSingle(),
        supabase.from('teams').select('*').order('name'),
        supabase.from('divisions').select('*').order('name'),
        supabase.from('members').select('*').order('name'),
        supabase.from('events').select('*').order('event_date'),
        supabase.from('announcements').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('officials').select('*').order('display_order'),
        supabase.from('results').select('*'),
        supabase.from('participants').select('*'),
        supabase.from('photo_frames').select('*').eq('is_active', true)
      ])

      const responses = [
        festivalRes, teamsRes, divisionsRes, membersRes, eventsRes,
        announcementsRes, officialsRes, resultsRes, participantsRes, framesRes
      ]

      const failed = responses.find(response => response.error)

      if (failed) throw failed.error

      setFestival(festivalRes.data)
      setTeams(teamsRes.data || [])
      setDivisions(divisionsRes.data || [])
      setMembers(membersRes.data || [])
      setEvents(eventsRes.data || [])
      setAnnouncements(announcementsRes.data || [])
      setOfficials(officialsRes.data || [])
      setResults(resultsRes.data || [])
      setParticipants(participantsRes.data || [])
      setPhotoFrames(framesRes.data || [])

    } catch (err) {
      console.error('Festival data error:', err)
      setError(err.message || 'Unable to load festival data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return (
    <FestContext.Provider value={{
      festival,
      teams,
      divisions,
      members,
      events,
      announcements,
      officials,
      results,
      participants,
      photoFrames,
      loading,
      error,
      refreshData
    }}>
      {children}
    </FestContext.Provider>
  )
}

export function useFest() {
  const context = useContext(FestContext)

  if (!context) {
    throw new Error('useFest must be used inside FestProvider')
  }

  return context
}
