import { useState, useEffect } from 'react'
import { workouts } from '../api/client'
import type { Workout } from '../api/types'

interface Props {
  profileId: string
}

export function WorkoutHistory({ profileId }: Props) {
  const [workoutList, setWorkoutList] = useState<Workout[]>([])
  const [selected, setSelected] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    workouts.list(profileId)
      .then(setWorkoutList)
      .catch((err) => setError(err.message || 'Failed to load workouts'))
      .finally(() => setLoading(false))
  }, [profileId])

  if (selected) {
    const uniqueExercises = new Set(selected.sets.map((s) => s.exercise_id)).size
    const duration = selected.completed_at
      ? Math.round(
          (new Date(selected.completed_at).getTime() -
            new Date(selected.started_at).getTime()) /
            60000,
        )
      : null

    return (
      <div className="p-4">
        <button
          className="text-blue-400 hover:text-blue-300 text-sm mb-4"
          onClick={() => setSelected(null)}
        >
          &larr; Back
        </button>
        <h2 className="text-2xl font-bold">{selected.name}</h2>
        <div className="text-sm text-text-secondary mt-1">
          {new Date(selected.started_at).toLocaleDateString()}
          {duration != null && ` \u00b7 ${duration} min`}
          {` \u00b7 ${uniqueExercises} exercises`}
          {` \u00b7 ${selected.sets.length} sets`}
        </div>
        {selected.notes && (
          <p className="text-sm mt-3 text-text-secondary">{selected.notes}</p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          {selected.sets.map((set) => (
            <div
              key={set.id}
              className="bg-bg-secondary p-3 rounded-lg flex justify-between text-sm"
            >
              <span>Set {set.set_number}</span>
              <span className="text-text-secondary">
                {set.reps} reps
                {set.weight != null && ` \u00b7 ${set.weight} kg`}
                {set.duration_seconds != null && ` \u00b7 ${set.duration_seconds}s`}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Workout History</h2>

      {error && <div className="text-red-500 text-center py-8">{error}</div>}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && workoutList.length === 0 && (
        <div className="text-center py-8 text-text-secondary">No workouts yet</div>
      )}

      <div className="flex flex-col gap-3">
        {workoutList.map((w) => {
          const uniqueExercises = new Set(w.sets.map((s) => s.exercise_id)).size
          const duration = w.completed_at
            ? Math.round(
                (new Date(w.completed_at).getTime() -
                  new Date(w.started_at).getTime()) /
                  60000,
              )
            : null
          return (
            <div
              key={w.id}
              className="bg-bg-secondary hover:bg-bg-tertiary p-4 rounded-xl cursor-pointer transition-colors"
              onClick={() => setSelected(w)}
            >
              <div className="flex justify-between">
                <span className="font-semibold">{w.name}</span>
                <span className="text-sm text-text-secondary">
                  {new Date(w.started_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-sm text-text-secondary mt-1">
                {uniqueExercises} exercises
                {duration != null && ` \u00b7 ${duration} min`}
                {` \u00b7 ${w.sets.length} sets`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
