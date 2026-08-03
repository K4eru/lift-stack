import { useState, useEffect } from 'react'
import { ProfilePicker } from './components/ProfilePicker'
import { Dashboard } from './components/Dashboard'
import type { Profile } from './api/types'

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [, setScreen] = useState('dashboard')

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

  if (!profile) {
    return <ProfilePicker onSelect={handleSelect} />
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-text-secondary">{profile.name}</span>
        <button
          className="bg-bg-secondary hover:bg-bg-tertiary text-text-secondary px-4 py-2 rounded-lg text-sm transition-colors"
          onClick={() => {
            setProfile(null)
            localStorage.removeItem('profile')
          }}
        >
          Switch Profile
        </button>
      </div>
      <Dashboard profile={profile} onNavigate={setScreen} />
    </div>
  )
}

export default App
