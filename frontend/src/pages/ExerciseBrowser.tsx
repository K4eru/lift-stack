import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FixedSizeList } from 'react-window'
import { Input } from '../components/ui/Input'
import { ExerciseCard } from '../components/ExerciseCard'
import { useExercises } from '../hooks/useExercises'
import { cn } from '../lib/utils'

const CATEGORIES = ['Todas', 'Pecho', 'Espalda', 'Pierna', 'Brazo', 'Hombro', 'Core'] as const

const CHIP_TO_EN: Record<string, string> = {
  Pecho: 'chest',
  Espalda: 'back',
  Pierna: 'upper legs',
  Brazo: 'upper arms',
  Hombro: 'shoulders',
  Core: 'waist',
}

export function ExerciseBrowser() {
  const { exercises, isLoading, error, refresh } = useExercises()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Todas')
  const navigate = useNavigate()
  const [viewportH, setViewportH] = useState(window.innerHeight)

  useEffect(() => {
    const onR = () => setViewportH(window.innerHeight)
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])

  const listHeight = Math.max(200, viewportH - 260)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return exercises.filter((ex) => {
      const name = (ex.name_es ?? ex.name).toLowerCase()
      if (q && !name.includes(q)) return false
      if (category === 'Todas') return true
      return ex.category === CHIP_TO_EN[category]
    })
  }, [exercises, search, category])

  return (
    <div className="p-4">
      <h1 className="font-heading text-2xl font-semibold mb-4">Ejercicios</h1>

      <Input
        type="text"
        placeholder="Buscar ejercicios..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 sticky top-0 z-10"
        aria-label="Buscar ejercicios"
      />

      <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'shrink-0 min-h-11 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer',
              category === c ? 'bg-primary text-on-primary' : 'bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-destructive mb-2">Error al cargar ejercicios</p>
          <button className="underline text-primary cursor-pointer" onClick={() => refresh()}>
            Reintentar
          </button>
        </div>
      )}
      {isLoading && <p className="text-center py-8 text-muted-foreground">Cargando…</p>}
      {!isLoading && !error && filtered.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">No se encontraron ejercicios</p>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <FixedSizeList
          height={listHeight}
          width="100%"
          itemCount={filtered.length}
          itemSize={76}
          itemData={filtered}
          className="pb-20"
        >
          {({ index, style, data }) => {
            const ex = data[index]
            return (
              <div style={style} key={ex.id}>
                <button
                  className="w-full text-left cursor-pointer"
                  onClick={() => navigate(`/ejercicios/${ex.id}`)}
                  aria-label={ex.name_es ?? ex.name}
                >
                  <ExerciseCard exercise={ex} />
                </button>
              </div>
            )
          }}
        </FixedSizeList>
      )}
    </div>
  )
}
