import { useState, useEffect } from 'react'
import { exercises } from '../api/client'
import type { Exercise } from '../api/types'
import { ExerciseDetail } from './ExerciseDetail'

interface Props {
  onSubViewChange?: (inSubView: boolean) => void
}

export function ExerciseBrowser({ onSubViewChange }: Props) {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [equipment, setEquipment] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    exercises
      .list({
        search,
        category: category || undefined,
        equipment: equipment || undefined,
      })
      .then(setExerciseList)
      .catch((err) => setError(err.message || 'Failed to load exercises'))
      .finally(() => setLoading(false))
  }, [search, category, equipment])

  useEffect(() => {
    onSubViewChange?.(!!selectedExercise)
  }, [selectedExercise, onSubViewChange])

  if (selectedExercise) {
    return (
      <ExerciseDetail
        exercise={selectedExercise}
        onBack={() => setSelectedExercise(null)}
      />
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Exercise Browser</h2>

      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">All Categories</option>
          <option value="chest">Chest</option>
          <option value="back">Back</option>
          <option value="upper legs">Upper Legs</option>
          <option value="upper arms">Upper Arms</option>
          <option value="shoulders">Shoulders</option>
          <option value="waist">Waist</option>
        </select>
        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="bg-bg-secondary border border-border rounded-lg px-4 py-2 text-sm"
        >
          <option value="">All Equipment</option>
          <option value="body weight">Body Weight</option>
          <option value="dumbbell">Dumbbell</option>
          <option value="barbell">Barbell</option>
          <option value="cable">Cable</option>
        </select>
      </div>

      {error && (
        <div className="text-red-500 text-center py-8">{error}</div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && exerciseList.length === 0 && (
        <div className="text-center py-8 text-text-secondary">No exercises found</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {exerciseList.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-bg-secondary rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform"
            onClick={() => setSelectedExercise(exercise)}
          >
            {exercise.image && (
              <img
                src={`/media/${exercise.image}`}
                alt={exercise.name}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />
            )}
            <div className="p-3">
              <div className="text-sm font-medium truncate">{exercise.name}</div>
              <div className="text-xs text-text-secondary">{exercise.equipment}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
