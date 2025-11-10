import type { Post } from './post'

/**
 * Search result with scoring and highlights
 */
export interface SearchResult extends Post {
  /**
   * Relevance score based on weighted field matching
   */
  score: number

  /**
   * Highlighted text snippets showing where matches were found
   */
  highlights: SearchHighlight[]
}

/**
 * Highlighted text snippet from a search match
 */
export interface SearchHighlight {
  /**
   * Field where the match was found
   */
  field: 'title' | 'description' | 'tags' | 'series' | 'content' | 'author'

  /**
   * Text snippet with context around the match
   */
  text: string

  /**
   * The actual matched text
   */
  matchedText: string
}

/**
 * Options for search configuration
 */
export interface SearchOptions {
  /**
   * Minimum score threshold for results (default: 0)
   */
  minScore?: number

  /**
   * Maximum number of results to return
   */
  limit?: number

  /**
   * Whether to search within post content (default: true)
   * Disable for better performance with large content
   */
  includeContent?: boolean

  /**
   * Whether to include highlights in results (default: true)
   */
  includeHighlights?: boolean
}
