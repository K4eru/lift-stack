import type { SpanishExercise } from '../hooks/useExercises'
import { CATEGORY_ES, EQUIPMENT_ES } from '../lib/categories'

export function ExerciseCard({ exercise }: { exercise: SpanishExercise }) {
  return (
    <div className="rounded-xl bg-card p-3">
      <p className="font-medium truncate">{exercise.name_es ?? exercise.name}</p>
      <p className="text-xs text-muted-foreground">
        {CATEGORY_ES[exercise.category] ?? exercise.category} • {EQUIPMENT_ES[exercise.equipment] ?? exercise.equipment}
      </p>
    </div>
  )
}
