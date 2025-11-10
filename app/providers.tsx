'use client'

import { ThemeProvider } from 'next-themes'
import { type ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Client-side providers wrapper
 * Includes ThemeProvider for dark mode support
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
