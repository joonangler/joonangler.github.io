import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

/**
 * Card component for content containers
 * Provides consistent styling with optional hover effect
 *
 * @example
 * <Card hover>
 *   <h3>Title</h3>
 *   <p>Content</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
          hover &&
            'transition-all duration-200 hover:shadow-md hover:border-foreground/20',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/**
 * Card Header component
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    />
  )
})

CardHeader.displayName = 'CardHeader'

/**
 * Card Title component
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-xl font-semibold leading-tight tracking-tight',
        className
      )}
      {...props}
    />
  )
})

CardTitle.displayName = 'CardTitle'

/**
 * Card Description component
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})

CardDescription.displayName = 'CardDescription'

/**
 * Card Content component
 */
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('pt-0', className)} {...props} />
})

CardContent.displayName = 'CardContent'

/**
 * Card Footer component
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    />
  )
})

CardFooter.displayName = 'CardFooter'
