import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-accent-cyan text-dark-900 hover:bg-accent-cyan/90': variant === 'default',
            'glass-effect hover:bg-white/10': variant === 'outline',
            'hover:bg-white/5': variant === 'ghost',
            'bg-white/10 hover:bg-white/20': variant === 'secondary'
          },
          {
            'px-4 py-2 text-sm': size === 'default',
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-6 py-3 text-base': size === 'lg'
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
