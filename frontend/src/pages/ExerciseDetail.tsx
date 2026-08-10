import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useExercises } from '../hooks/useExercises'

export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>()
  const { map } = useExercises()
  const ex = id ? map.get(id) : undefined

  return (
    <div className="p-4">
      <Link to="/ejercicios" className="inline-flex items-center gap-1 text-muted-foreground mb-4">
        <ArrowLeft size={16} /> Volver
      </Link>
      <h1 className="font-heading text-2xl font-semibold mb-2">{ex?.name_es ?? ex?.name ?? 'Ejercicio'}</h1>
      {ex?.goal && <p className="text-accent mb-4">{ex.goal}</p>}
      {ex?.category && (
        <p className="text-sm text-muted-foreground mb-4">
          {ex.category} • {ex.equipment}
        </p>
      )}
      {ex?.instructions?.es && (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-2">Instrucciones</h2>
          <p className="text-sm text-foreground">{ex.instructions.es}</p>
        </div>
      )}
    </div>
  )
}
