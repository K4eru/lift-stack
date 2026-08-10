import { Link } from 'react-router-dom'
import { Play, History } from 'lucide-react'
import useSWR from 'swr'
import { Card } from '../components/ui/Card'
import { useExercises } from '../hooks/useExercises'
import { workouts } from '../api/client'

export function Dashboard() {
  const { isLoading: loadingExercises, error: exerciseError } = useExercises()
  const { data: recent } = useSWR('workouts', () => workouts.list(), { revalidateOnFocus: false })

  const last = recent?.find((w) => w.completed_at)

  return (
    <div className="p-4 flex flex-col gap-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">¡Hola!</h1>
        <p className="text-muted-foreground text-sm">¿Listo para entrenar?</p>
      </header>

      <Link
        to="/sesion"
        className="w-full min-h-11 rounded-lg bg-primary text-on-primary font-medium px-4 py-3 flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
      >
        <Play size={20} /> Iniciar sesión
      </Link>

      <section>
        <h2 className="font-heading text-xl font-semibold mb-2 flex items-center gap-2">
          <History size={18} /> Última sesión
        </h2>
        {last ? (
          <Card>
            <p className="font-medium">{last.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(last.completed_at!).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-muted-foreground">Todavía no hay sesiones completadas.</p>
          </Card>
        )}
      </section>

      {loadingExercises && <p className="text-sm text-muted-foreground">Cargando ejercicios…</p>}
      {exerciseError && <p className="text-sm text-destructive">Error al cargar ejercicios.</p>}
    </div>
  )
}
