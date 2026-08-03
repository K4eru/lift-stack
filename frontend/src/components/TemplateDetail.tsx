import type { Template } from '../api/types'

interface Props {
  template: Template
  onBack: () => void
  onStartWorkout: (templateId: string) => void
}

export function TemplateDetail({ template, onBack, onStartWorkout }: Props) {
  return (
    <div className="p-4">
      <button
        className="bg-bg-secondary hover:bg-bg-tertiary px-4 py-2 rounded-lg text-sm text-text-secondary transition-colors mb-4"
        onClick={onBack}
      >
        &larr; Back
      </button>

      <h2 className="text-2xl font-bold">{template.name}</h2>
      {template.description && (
        <p className="text-text-secondary mt-2">{template.description}</p>
      )}

      <h3 className="text-lg font-semibold mt-6 mb-3">Exercises</h3>
      <div className="flex flex-col gap-2">
        {template.exercises.map((te, i) => (
          <div key={te.id} className="bg-bg-secondary p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {i + 1}. {te.exercise.name}
              </span>
              <span className="text-sm text-text-secondary">
                {te.exercise.equipment}
              </span>
            </div>
            {te.target_sets && te.target_reps && (
              <p className="text-sm text-text-secondary mt-1">
                {te.target_sets} sets &times; {te.target_reps} reps
                {te.target_weight ? ` @ ${te.target_weight}kg` : ''}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium mt-6 transition-colors"
        onClick={() => onStartWorkout(template.id)}
      >
        Start Workout
      </button>
    </div>
  )
}
