import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, BookOpen } from 'lucide-react'
import { cn } from '../../lib/utils'

const items = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/sesion', label: 'Sesión', icon: Dumbbell },
  { to: '/ejercicios', label: 'Ejercicios', icon: BookOpen },
]

export function BottomNav() {
  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 inset-x-0 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2 min-h-11 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <Icon size={24} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
