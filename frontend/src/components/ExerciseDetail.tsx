import type { Exercise } from '../api/types'

interface Props {
  exercise: Exercise
  onBack: () => void
}

export function ExerciseDetail({ exercise, onBack }: Props) {
  const instructions = exercise.instructions?.en || ''

  return (
    <div className="p-4">
      <button
        className="bg-bg-secondary hover:bg-bg-tertiary text-text-secondary px-4 py-2 rounded-lg text-sm transition-colors mb-4"
        onClick={onBack}
      >
        ← Back
      </button>

      <div className="flex gap-4 items-center mb-4">
        {exercise.gif_url && (
          <img
            src={`/media/${exercise.gif_url}`}
            alt={exercise.name}
            className="w-44 h-44 rounded-xl object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{exercise.name}</h2>
          <p className="text-text-secondary">{exercise.equipment}</p>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-lg p-4 mb-4">
        <h3 className="font-semibold mb-2">Target Muscles</h3>
        <p><strong>Primary:</strong> {exercise.target}</p>
        {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
          <p><strong>Secondary:</strong> {exercise.secondary_muscles.join(', ')}</p>
        )}
      </div>

      {instructions && (
        <div className="bg-bg-secondary rounded-lg p-4">
          <h3 className="font-semibold mb-2">Instructions</h3>
          <p className="text-text-secondary">{instructions}</p>
        </div>
      )}
    </div>
  )
}
