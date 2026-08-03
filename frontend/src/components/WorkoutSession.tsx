import { useState, useEffect, useCallback } from 'react'
import { workouts } from '../api/client'
import type { Profile, Workout } from '../api/types'

interface Props {
  profile: Profile
  onDone: () => void
}

export function WorkoutSession({ profile, onDone }: Props) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(0)
  const [duration, setDuration] = useState(0)
  const [notes, setNotes] = useState('')
  const [restTimer, setRestTimer] = useState(0)
  const [restSeconds, setRestSeconds] = useState(90)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    workouts
      .start('Quick Workout', profile.id)
      .then(setWorkout)
      .catch((err) => setError(err.message || 'Failed to start workout'))
  }, [profile.id])

  useEffect(() => {
    if (restTimer <= 0) return
    const id = setTimeout(() => setRestTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [restTimer])

  const handleAddSet = useCallback(async () => {
    if (!workout || !selectedExercise) return
    try {
      const setNumber = (workout.sets?.filter((s) => s.exercise_id === selectedExercise).length || 0) + 1
      await workouts.addSet(workout.id, {
        exercise_id: selectedExercise,
        set_number: setNumber,
        reps,
        weight: weight || undefined,
        duration_seconds: duration || undefined,
        rest_seconds: restSeconds,
        notes: notes || undefined,
      })
      const updated = await workouts.get(workout.id)
      setWorkout(updated)
      setNotes('')
      setRestTimer(restSeconds)
      setError(null)
    } catch (err) {
      setError((err as Error).message || 'Failed to add set')
    }
  }, [workout, selectedExercise, reps, weight, duration, notes, restSeconds])

  const handleFinish = useCallback(async () => {
    if (!workout) return
    try {
      await workouts.update(workout.id, { completed_at: new Date().toISOString() })
      setError(null)
      onDone()
    } catch (err) {
      setError((err as Error).message || 'Failed to finish workout')
    }
  }, [workout, onDone])

  if (!workout) {
    return (
      <div className="p-4 text-center text-text-secondary">
        <p>Starting workout...</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{workout.name}</h2>
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          onClick={handleFinish}
        >
          Finish
        </button>
      </div>

      {error && <div className="text-red-500 bg-red-600/10 border border-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <div className="bg-bg-secondary rounded-lg p-4 mb-4">
        <h3 className="font-semibold mb-3">Log Set</h3>

        <input
          type="text"
          placeholder="Exercise ID"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 mb-3 text-sm"
        />

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="text-xs text-text-secondary">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Duration (s)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-text-secondary">Rest (seconds)</label>
          <input
            type="number"
            value={restSeconds}
            onChange={(e) => setRestSeconds(Number(e.target.value))}
            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="mb-3">
          <label className="text-xs text-text-secondary">Notes</label>
          <input
            type="text"
            placeholder="Optional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-colors"
          onClick={handleAddSet}
          disabled={!selectedExercise}
        >
          Add Set
        </button>
      </div>

      {restTimer > 0 && (
        <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4 mb-4 text-center">
          <p className="text-sm text-blue-300">Rest Timer</p>
          <p className="text-4xl font-bold text-blue-100">{restTimer}s</p>
          <button
            className="text-xs text-blue-400 underline mt-1"
            onClick={() => setRestTimer(0)}
          >
            Skip
          </button>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Sets Logged ({workout.sets?.length || 0})</h3>
        <div className="space-y-2">
          {workout.sets?.map((set) => (
            <div key={set.id} className="bg-bg-secondary rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Set {set.set_number}</span>
                <span className="text-sm text-text-secondary">{set.reps} reps</span>
              </div>
              {set.weight && <p className="text-sm text-text-secondary">{set.weight} kg</p>}
              {set.duration_seconds && (
                <p className="text-sm text-text-secondary">{set.duration_seconds}s</p>
              )}
              {set.notes && <p className="text-xs text-text-secondary mt-1">{set.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
