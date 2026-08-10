import useSWR, { useSWRConfig } from 'swr'
import { exercises as api } from '../api/client'
import type { Exercise } from '../api/types'

export interface SpanishExercise extends Exercise {
  name_es?: string
  goal?: string
}

interface Translation {
  name: string
  goal: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useExercises() {
  const { data: raw, error, mutate } = useSWR<Exercise[]>('exercises', () => api.list())
  const { mutate: globalMutate } = useSWRConfig()
  const { data: translations } = useSWR<Record<string, Translation>>('translations', () =>
    fetcher('/exercises-es.json'),
  )

  const exercises: SpanishExercise[] = (raw ?? []).map((ex) => {
    const t = translations?.[ex.id]
    return {
      ...ex,
      name_es: t?.name,
      goal: t?.goal,
    }
  })

  const map = new Map<string, SpanishExercise>()
  for (const ex of exercises) map.set(ex.id, ex)

  const refresh = () => {
    mutate()
    void globalMutate('translations')
  }

  return { exercises, map, isLoading: !raw && !error, error, refresh }
}
