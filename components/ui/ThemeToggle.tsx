'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * Theme toggle button for cycling between light, dark, and system modes
 * Uses next-themes for theme management
 * Shows a visual indicator when using system preference
 *
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        disabled
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  // Cycle through: light → dark → system
  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  // Determine which icon to show
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isSystemMode = theme === 'system'

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Current theme: ${theme}. Click to cycle themes.`}
      title={isSystemMode ? `Using system preference (${systemTheme})` : `${theme} mode`}
    >
      {currentTheme === 'dark' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}

      {/* System mode indicator */}
      {isSystemMode && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
      )}

      <span className="sr-only">
        {theme === 'light' && 'Light mode, click to switch to dark mode'}
        {theme === 'dark' && 'Dark mode, click to switch to system mode'}
        {theme === 'system' && `System mode (${systemTheme}), click to switch to light mode`}
      </span>
    </button>
  )
}
