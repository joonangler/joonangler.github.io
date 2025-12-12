import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  message: string
  description?: string
  icon?: ReactNode
  className?: string
}

/**
 * Empty state component for consistent empty content display
 * Used across the application for empty lists and no results states
 *
 * @example
 * <EmptyState message="No posts found." />
 *
 * @example
 * <EmptyState
 *   message="No tags available."
 *   description="Create your first tag to get started."
 *   icon={<TagIcon className="h-12 w-12" />}
 * />
 */
export function EmptyState({ message, description, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16', className)}>
      {icon && (
        <div className="mb-4 flex justify-center text-muted-foreground opacity-50">
          {icon}
        </div>
      )}
      <p className="text-lg text-muted-foreground">{message}</p>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground/80">{description}</p>
      )}
    </div>
  )
}
