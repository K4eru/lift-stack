import type { SpanishExercise } from '../hooks/useExercises'

export function ExerciseCard({ exercise }: { exercise: SpanishExercise }) {
  return (
    <div className="rounded-xl bg-card p-3">
      <p className="font-medium truncate">{exercise.name_es ?? exercise.name}</p>
      <p className="text-xs text-muted-foreground">
        {exercise.category} • {exercise.equipment}
      </p>
    </div>
  )
}
