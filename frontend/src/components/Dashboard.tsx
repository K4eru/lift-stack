import type { Profile } from '../api/types'

type Screen = 'dashboard' | 'exercises' | 'templates' | 'workout' | 'history'

interface Props {
  profile: Profile
  onNavigate: (screen: Screen) => void
}

const actions: { id: Screen; icon: string; title: string; desc: string }[] = [
  { id: 'workout', icon: '🏋️', title: 'Start Workout', desc: 'Begin a new session' },
  { id: 'exercises', icon: '💪', title: 'Browse Exercises', desc: 'View exercise library' },
  { id: 'templates', icon: '📋', title: 'My Templates', desc: 'Workout templates' },
  { id: 'history', icon: '📊', title: 'Workout History', desc: 'Past workouts' },
]

export function Dashboard({ profile, onNavigate }: Props) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <h2 className="text-xl font-semibold text-text-secondary mt-2">Welcome, {profile.name}</h2>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {actions.map((a) => (
          <button
            key={a.id}
            className="bg-bg-secondary hover:bg-bg-tertiary p-6 flex flex-col items-center gap-2 rounded-lg transition-colors"
            onClick={() => onNavigate(a.id)}
          >
            <span className="text-5xl">{a.icon}</span>
            <span className="text-base font-semibold">{a.title}</span>
            <span className="text-xs text-text-secondary">{a.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
