import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
}

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90',
  secondary: 'bg-secondary text-on-primary hover:bg-secondary/90',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'min-h-11 rounded-lg px-4 py-2 font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
