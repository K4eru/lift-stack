import { useState, useEffect } from 'react'
import { ProfilePicker } from './components/ProfilePicker'
import { Dashboard } from './components/Dashboard'
import { ExerciseBrowser } from './components/ExerciseBrowser'
import { Templates } from './components/Templates'
import { WorkoutHistory } from './components/WorkoutHistory'
import { WorkoutSession } from './components/WorkoutSession'
import type { Profile } from './api/types'

type Screen = 'dashboard' | 'exercises' | 'templates' | 'workout' | 'history'

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [subViewActive, setSubViewActive] = useState(false)
  const [templateId, setTemplateId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const saved = localStorage.getItem('profile')
    if (saved) {
      setProfile(JSON.parse(saved))
    }
  }, [])

  const handleSelect = (profile: Profile) => {
    setProfile(profile)
    localStorage.setItem('profile', JSON.stringify(profile))
  }

  const handleLogout = () => {
    setProfile(null)
    localStorage.removeItem('profile')
    setScreen('dashboard')
    setSubViewActive(false)
    setTemplateId(undefined)
  }

  const handleStartWorkoutFromTemplate = (id: string) => {
    setTemplateId(id)
    setScreen('workout')
  }

  if (!profile) {
    return <ProfilePicker onSelect={handleSelect} />
  }

  const renderScreen = () => {
    switch (screen) {
      case 'exercises':
        return <ExerciseBrowser onSubViewChange={setSubViewActive} />
      case 'templates':
        return (
          <Templates
            onSubViewChange={setSubViewActive}
            onStartWorkout={handleStartWorkoutFromTemplate}
          />
        )
      case 'workout':
        return (
          <WorkoutSession
            profile={profile}
            templateId={templateId}
            onDone={() => {
              setScreen('dashboard')
              setTemplateId(undefined)
            }}
          />
        )
      case 'history':
        return <WorkoutHistory profileId={profile.id} />
      default:
        return <Dashboard profile={profile} onNavigate={(s) => setScreen(s as Screen)} />
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {screen !== 'dashboard' && !subViewActive && (
        <div className="p-4 border-b border-border">
          <button
            className="bg-bg-secondary hover:bg-bg-tertiary text-text-secondary px-4 py-2 rounded-lg text-sm transition-colors"
            onClick={() => setScreen('dashboard')}
          >
            &larr; Back
          </button>
        </div>
      )}
      {screen === 'dashboard' && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="text-text-secondary">{profile.name}</span>
          <button
            className="bg-bg-secondary hover:bg-bg-tertiary text-text-secondary px-4 py-2 rounded-lg text-sm transition-colors"
            onClick={handleLogout}
          >
            Switch Profile
          </button>
        </div>
      )}
      {renderScreen()}
    </div>
  )
}

export default App
