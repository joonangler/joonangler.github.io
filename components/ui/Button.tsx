import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Reusable button component with multiple variants and sizes
 *
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          // Variant styles
          {
            'bg-primary text-primary-foreground hover:bg-primary/90':
              variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/90':
              variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground':
              variant === 'ghost',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground':
              variant === 'outline',
          },
          // Size styles
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-base': size === 'md',
            'h-11 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
