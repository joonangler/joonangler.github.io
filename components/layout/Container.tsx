import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer'
}

/**
 * Container component for consistent max-width layout
 * Provides responsive padding and centering
 *
 * @example
 * <Container>
 *   <h1>Content</h1>
 * </Container>
 */
export function Container({
  children,
  className,
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </Component>
  )
}
