import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { RestTimer } from '../components/RestTimer'
import { useExercises } from '../hooks/useExercises'
import { workouts, profiles } from '../api/client'
import type { Workout } from '../api/types'

export function WorkoutSession() {
  const { map, exercises } = useExercises()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [selectedId, setSelectedId] = useState('')
  const [search, setSearch] = useState('')
  const [reps, setReps] = useState(10)
  const [weight, setWeight] = useState(0)
  const [rest, setRest] = useState(90)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (rest <= 0) return
    const id = setTimeout(() => setRest((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [rest])

  useEffect(() => {
    profiles
      .list()
      .then(async (list) => {
        const profile = list[0] ?? (await profiles.create('Yo'))
        return workouts.start('Sesión rápida', profile.id)
      })
      .then(setWorkout)
      .catch((err) => setError(err.message || 'Error al iniciar sesión'))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return exercises.filter((ex) => (ex.name_es ?? ex.name).toLowerCase().includes(q))
  }, [exercises, search])

  const handleAddSet = useCallback(async () => {
    if (!workout || !selectedId) return
    try {
      const setNumber = (workout.sets?.filter((s) => s.exercise_id === selectedId).length || 0) + 1
      await workouts.addSet(workout.id, {
        exercise_id: selectedId,
        set_number: setNumber,
        reps,
        weight: weight || undefined,
        rest_seconds: rest,
      })
      setWorkout(await workouts.get(workout.id))
      setRest(rest)
    } catch (err) {
      setError((err as Error).message || 'Error al agregar serie')
    }
  }, [workout, selectedId, reps, weight, rest])

  const handleFinish = useCallback(async () => {
    if (!workout) return
    try {
      await workouts.update(workout.id, { completed_at: new Date().toISOString() })
      setError(null)
    } catch (err) {
      setError((err as Error).message || 'Error al finalizar sesión')
    }
  }, [workout])

  if (!workout) {
    return <p className="p-4 text-center text-muted-foreground">Iniciando sesión…</p>
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">{workout.name}</h1>
        <Button variant="destructive" onClick={handleFinish}>
          <Check size={18} /> Terminar
        </Button>
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <RestTimer seconds={rest} onSkip={() => setRest(0)} />

      <Card>
        <h2 className="font-heading text-lg font-semibold mb-3">Registrar serie</h2>
        <Input
          type="text"
          placeholder="Buscar ejercicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
          aria-label="Buscar ejercicio"
        />
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
          {filtered.slice(0, 15).map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedId(ex.id)}
              className={
                'text-left min-h-11 p-2 rounded-lg transition-colors cursor-pointer ' +
                (selectedId === ex.id ? 'bg-primary/20 border border-primary' : 'bg-muted hover:bg-muted/70')
              }
            >
              <span className="text-sm font-medium">{ex.name_es ?? ex.name}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Input type="number" name="reps" label="Reps" value={reps} onChange={(e) => setReps(Number(e.target.value))} />
          <Input type="number" name="weight" label="Peso (kg)" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          <Input type="number" name="rest" label="Descanso (s)" value={rest} onChange={(e) => setRest(Number(e.target.value))} />
        </div>
        <Button className="w-full" onClick={handleAddSet} disabled={!selectedId}>
          <Plus size={18} /> Agregar serie
        </Button>
      </Card>

      <section>
        <h2 className="font-heading text-lg font-semibold mb-2">Series realizadas ({workout.sets?.length || 0})</h2>
        <div className="flex flex-col gap-2">
          {workout.sets?.map((s) => (
            <Card key={s.id} className="py-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{map.get(s.exercise_id)?.name_es ?? map.get(s.exercise_id)?.name ?? s.exercise_id}</span>
                <span className="text-sm text-muted-foreground">
                  {s.reps} reps{s.weight ? ` • ${s.weight} kg` : ''}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
