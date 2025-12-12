import { cn } from '@/lib/utils'

interface HighlightProps {
  /**
   * Text to search within and highlight
   */
  text: string

  /**
   * Query to highlight in the text
   */
  query: string

  /**
   * Additional CSS classes for the highlighted text
   */
  className?: string
}

/**
 * Maximum text length for highlighting (performance optimization)
 */
const MAX_HIGHLIGHT_LENGTH = 1000

/**
 * Highlights matched query text within a string
 *
 * Performs case-insensitive matching and wraps matched portions
 * in a <mark> element with appropriate styling for light/dark mode
 *
 * @example
 * <Highlight text="Next.js is awesome" query="next" />
 * // Renders: <mark>Next</mark>.js is awesome
 */
export function Highlight({ text, query, className }: HighlightProps) {
  // Early returns for performance
  if (!text) return null
  if (!query.trim()) return <>{text}</>

  // Skip highlighting for very long text (performance guard)
  if (text.length > MAX_HIGHLIGHT_LENGTH) {
    return <>{text}</>
  }

  const normalizedQuery = query.toLowerCase()
  const normalizedText = text.toLowerCase()

  // Skip if no matches found
  if (!normalizedText.includes(normalizedQuery)) {
    return <>{text}</>
  }

  // Build parts array with highlighted sections
  const parts: { text: string; highlighted: boolean }[] = []

  let lastIndex = 0
  let index = normalizedText.indexOf(normalizedQuery)

  // Find all occurrences
  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, index),
        highlighted: false,
      })
    }

    // Add matched text (preserve original case)
    parts.push({
      text: text.slice(index, index + normalizedQuery.length),
      highlighted: true,
    })

    lastIndex = index + normalizedQuery.length
    index = normalizedText.indexOf(normalizedQuery, lastIndex)
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      highlighted: false,
    })
  }

  return (
    <>
      {parts.map((part, i) =>
        part.highlighted ? (
          <mark
            key={i}
            className={cn(
              'bg-yellow-200 text-gray-900 dark:bg-yellow-900/50 dark:text-yellow-100',
              'font-semibold rounded px-0.5',
              'not-italic', // Override any italic styles
              className
            )}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}
