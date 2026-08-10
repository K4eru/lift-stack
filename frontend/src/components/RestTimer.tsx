// ponytail: parent owns countdown state, RestTimer renders
export function RestTimer({ seconds, onSkip }: { seconds: number; onSkip: () => void }) {
  if (seconds <= 0) return null

  return (
    <div className="bg-accent/10 border border-accent rounded-xl p-4 mb-4 text-center">
      <p className="text-sm text-accent">Descanso</p>
      <p className="font-heading text-4xl font-bold">{seconds}s</p>
      <button className="min-h-11 px-3 text-xs underline mt-1 cursor-pointer" onClick={onSkip}>
        Saltar
      </button>
    </div>
  )
}
