'use client'

import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  /**
   * Callback when search query changes
   */
  onSearch?: (query: string) => void

  /**
   * Initial/default value for the search input
   */
  defaultValue?: string

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Auto-focus the input on mount
   */
  autoFocus?: boolean

  /**
   * Show search icon
   */
  showIcon?: boolean

  /**
   * Show keyboard shortcut hint (⌘K)
   */
  showShortcutHint?: boolean

  /**
   * Disabled state
   */
  disabled?: boolean
}

/**
 * Search input component with keyboard shortcuts and clear functionality
 *
 * Features:
 * - Cmd/Ctrl+K to focus
 * - Escape to clear and blur
 * - Clear button when text is present
 * - Responsive design
 * - Dark mode support
 *
 * @example
 * <SearchBar
 *   onSearch={(query) => console.log('Searching:', query)}
 *   placeholder="Search posts..."
 *   autoFocus
 * />
 */
export function SearchBar({
  onSearch,
  defaultValue = '',
  placeholder = 'Search...',
  className,
  autoFocus = false,
  showIcon = true,
  showShortcutHint = false,
  disabled = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    onSearch?.(newQuery)
  }

  // Clear search
  const handleClear = () => {
    setQuery('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }

      // Escape to clear and blur
      if (e.key === 'Escape') {
        if (query) {
          setQuery('')
          onSearch?.('')
          inputRef.current?.focus()
        } else {
          inputRef.current?.blur()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [query, onSearch])

  return (
    <div className={cn('relative', className)}>
      {/* Search Icon */}
      {showIcon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      )}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-lg border border-input bg-background',
          'px-4 py-2 text-sm',
          'placeholder:text-muted-foreground',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          showIcon && 'pl-10',
          (query || showShortcutHint) && 'pr-20'
        )}
        aria-label="Search"
        aria-describedby="search-description"
      />

      {/* Screen reader description */}
      <span id="search-description" className="sr-only">
        Press Cmd+K to focus search, Escape to clear
      </span>

      {/* Right side: Clear button or Keyboard hint */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'rounded p-1',
              'text-muted-foreground hover:text-foreground',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            )}
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {!query && showShortcutHint && (
          <kbd
            className={cn(
              'hidden sm:inline-flex',
              'items-center gap-1 rounded border border-border',
              'bg-muted px-2 py-1',
              'text-xs font-semibold text-muted-foreground'
            )}
          >
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  )
}
