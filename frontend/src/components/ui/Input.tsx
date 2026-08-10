import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      {label && (id || props.name) && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'min-h-11 rounded-lg border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          'disabled:opacity-50 transition-colors duration-200',
          error && 'border-destructive',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
