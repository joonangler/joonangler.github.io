import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning'
}

/**
 * Badge component for tags and labels
 *
 * @example
 * <Badge variant="default">Tag</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          {
            'bg-primary text-primary-foreground hover:bg-primary/80':
              variant === 'default',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80':
              variant === 'secondary',
            'border border-border bg-background hover:bg-accent':
              variant === 'outline',
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
              variant === 'success',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400':
              variant === 'warning',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'
