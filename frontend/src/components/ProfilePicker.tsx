import { useState, useEffect } from 'react'
import { profiles } from '../api/client'
import type { Profile } from '../api/types'

interface Props {
  onSelect: (profile: Profile) => void
}

export function ProfilePicker({ onSelect }: Props) {
  const [profileList, setProfileList] = useState<Profile[]>([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    profiles.list()
      .then(setProfileList)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load profiles'))
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const profile = await profiles.create(newName.trim())
      setProfileList(prev => [...prev, profile])
      setNewName('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create profile')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 px-4 text-center">
      <h1 className="text-3xl font-bold mb-2">Lift-Stack</h1>
      <p className="text-text-secondary mb-8">Select your profile</p>

      {error && <div className="text-red-500 text-center text-sm mb-4">{error}</div>}

      <div className="flex flex-col gap-3 mb-8">
        {profileList.map(profile => (
          <button
            key={profile.id}
            className="bg-bg-secondary hover:bg-bg-tertiary py-6 px-4 text-lg font-medium rounded-lg transition-colors"
            onClick={() => onSelect(profile)}
          >
            {profile.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New profile name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          className="flex-1 bg-bg-secondary border border-border rounded-lg px-4 py-3 text-white placeholder-text-secondary outline-none focus:border-accent"
        />
        <button
          className="bg-accent text-black font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          onClick={handleCreate}
        >
          Add Profile
        </button>
      </div>
    </div>
  )
}
