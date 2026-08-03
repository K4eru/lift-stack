import { useState, useEffect } from 'react'
import { ProfilePicker } from './components/ProfilePicker'
import type { Profile } from './api/types'

function App() {
  const [profile, setProfile] = useState<Profile | null>(null)

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
    <div className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
      <p className="text-text-secondary">Welcome, {profile.name}</p>
    </div>
  )
}

export default App
