import { useEffect } from 'react'

export function RestTimer({ seconds, onSkip }: { seconds: number; onSkip: () => void }) {
  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => onSkip(), 1000)
    return () => clearTimeout(id)
  }, [seconds, onSkip])

  if (seconds <= 0) return null

  return (
    <div className="bg-accent/10 border border-accent rounded-xl p-4 mb-4 text-center">
      <p className="text-sm text-accent">Descanso</p>
      <p className="font-heading text-4xl font-bold">{seconds}s</p>
      <button className="text-xs underline mt-1 cursor-pointer" onClick={onSkip}>
        Saltar
      </button>
    </div>
  )
}
