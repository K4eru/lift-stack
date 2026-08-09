import { useState } from 'react'
import type { Exercise } from '../api/types'

interface Props {
  exercises: Exercise[]
  quickPicks?: Exercise[]
  onSelect: (exercise: Exercise) => void
}

export function ExercisePicker({ exercises, quickPicks = [], onSelect }: Props) {
  const [search, setSearch] = useState('')
  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      {quickPicks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPicks.map((ex) => (
            <button
              key={ex.id}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              onClick={() => onSelect(ex)}
            >
              {ex.name}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 mb-2 text-sm"
      />

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {filtered.slice(0, 20).map((ex) => (
          <button
            key={ex.id}
            className="bg-bg-tertiary p-3 rounded-xl flex items-center justify-between text-left hover:bg-border transition-colors"
            onClick={() => onSelect(ex)}
          >
            <span className="text-sm">{ex.name}</span>
            <span className="text-xs text-text-secondary">{ex.equipment}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-text-secondary text-center py-4">No exercises found</p>
        )}
      </div>
    </div>
  )
}
