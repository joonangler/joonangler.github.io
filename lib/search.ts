import type { Post } from '@/types/post'
import type { SearchResult, SearchHighlight, SearchOptions } from '@/types/search'

/**
 * Field weights for search scoring
 * Higher weight = more important in search results
 */
const FIELD_WEIGHTS = {
  title: 3,
  description: 2,
  tags: 2.5,
  series: 1.5,
  content: 1,
  author: 0.5,
} as const

/**
 * Bonus scores for exact matches
 */
const EXACT_MATCH_BONUS = {
  title: 5,
  tag: 3,
} as const

/**
 * Recency boost for recent posts (last 30 days)
 */
const RECENCY_BOOST_MULTIPLIER = 1.1
const RECENCY_BOOST_DAYS = 30

/**
 * Context length for highlight snippets (characters on each side)
 */
const HIGHLIGHT_CONTEXT_LENGTH = 50

/**
 * Content preview lengths for performance optimization
 */
const CONTENT_PREVIEW_LENGTH = {
  SCORING: 500,
  HIGHLIGHT: 1000,
} as const

/**
 * Normalize text for search comparison
 * - Convert to lowercase
 * - Trim whitespace
 * - Normalize Unicode characters (NFC for Korean compatibility)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFC')
}

/**
 * Check if text contains query (case-insensitive, partial match)
 */
function matchText(text: string, query: string): boolean {
  return normalizeText(text).includes(normalizeText(query))
}

/**
 * Count occurrences of query in text
 */
function countMatches(text: string, query: string): number {
  const normalizedText = normalizeText(text)
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) return 0

  let count = 0
  let index = normalizedText.indexOf(normalizedQuery)

  while (index !== -1) {
    count++
    index = normalizedText.indexOf(normalizedQuery, index + 1)
  }

  return count
}

/**
 * Extract context around matched text for highlighting
 * Returns text snippet with context before and after the match
 */
function extractHighlight(
  text: string,
  query: string,
  contextLength: number = HIGHLIGHT_CONTEXT_LENGTH
): string | null {
  const normalizedText = normalizeText(text)
  const normalizedQuery = normalizeText(query)
  const index = normalizedText.indexOf(normalizedQuery)

  if (index === -1) return null

  // Calculate start and end positions with context
  const start = Math.max(0, index - contextLength)
  const end = Math.min(text.length, index + normalizedQuery.length + contextLength)

  // Extract snippet
  let snippet = text.slice(start, end)

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet
  if (end < text.length) snippet = snippet + '...'

  return snippet
}

/**
 * Calculate relevance score for a post based on query
 *
 * Scoring algorithm:
 * 1. Count matches in each field
 * 2. Multiply by field weight
 * 3. Add exact match bonuses
 * 4. Apply recency boost for recent posts
 *
 * @returns Relevance score (higher is more relevant)
 */
function calculateScore(
  post: Post,
  query: string,
  includeContent: boolean = true
): number {
  let score = 0
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) return 0

  // Title scoring
  const titleMatches = countMatches(post.title, normalizedQuery)
  score += titleMatches * FIELD_WEIGHTS.title

  // Exact title match bonus
  if (normalizeText(post.title) === normalizedQuery) {
    score += EXACT_MATCH_BONUS.title
  }

  // Description scoring
  const descriptionMatches = countMatches(post.description, normalizedQuery)
  score += descriptionMatches * FIELD_WEIGHTS.description

  // Tags scoring
  post.tags.forEach((tag) => {
    if (matchText(tag, normalizedQuery)) {
      score += FIELD_WEIGHTS.tags

      // Exact tag match bonus
      if (normalizeText(tag) === normalizedQuery) {
        score += EXACT_MATCH_BONUS.tag
      }
    }
  })

  // Series scoring
  if (post.series && matchText(post.series, normalizedQuery)) {
    score += FIELD_WEIGHTS.series
  }

  // Content scoring (first N chars for performance)
  if (includeContent && post.content) {
    const contentPreview = post.content.slice(0, CONTENT_PREVIEW_LENGTH.SCORING)
    const contentMatches = countMatches(contentPreview, normalizedQuery)
    score += contentMatches * FIELD_WEIGHTS.content
  }

  // Author scoring
  if (post.author && matchText(post.author, normalizedQuery)) {
    score += FIELD_WEIGHTS.author
  }

  // Recency boost (last 30 days get a 10% boost)
  const postDate = new Date(post.date)
  const daysSincePost =
    (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSincePost <= RECENCY_BOOST_DAYS) {
    score *= RECENCY_BOOST_MULTIPLIER
  }

  return score
}

/**
 * Extract highlights from a post for a given query
 *
 * Finds matching text snippets with context to show users
 * where their search query appears in the content
 */
function extractHighlights(
  post: Post,
  query: string,
  includeContent: boolean = true
): SearchHighlight[] {
  const highlights: SearchHighlight[] = []
  const normalizedQuery = normalizeText(query)

  // Title highlight
  const titleHighlight = extractHighlight(post.title, query)
  if (titleHighlight) {
    highlights.push({
      field: 'title',
      text: titleHighlight,
      matchedText: query,
    })
  }

  // Description highlight
  const descriptionHighlight = extractHighlight(post.description, query)
  if (descriptionHighlight) {
    highlights.push({
      field: 'description',
      text: descriptionHighlight,
      matchedText: query,
    })
  }

  // Tags highlight
  post.tags.forEach((tag) => {
    if (matchText(tag, normalizedQuery)) {
      highlights.push({
        field: 'tags',
        text: tag,
        matchedText: query,
      })
    }
  })

  // Series highlight
  if (post.series && matchText(post.series, normalizedQuery)) {
    const seriesHighlight = extractHighlight(post.series, query)
    if (seriesHighlight) {
      highlights.push({
        field: 'series',
        text: seriesHighlight,
        matchedText: query,
      })
    }
  }

  // Content highlight (first match only, for performance)
  if (includeContent && post.content) {
    const contentPreview = post.content.slice(0, CONTENT_PREVIEW_LENGTH.HIGHLIGHT)
    const contentHighlight = extractHighlight(contentPreview, query, 80)
    if (contentHighlight) {
      highlights.push({
        field: 'content',
        text: contentHighlight,
        matchedText: query,
      })
    }
  }

  // Author highlight
  if (post.author && matchText(post.author, normalizedQuery)) {
    highlights.push({
      field: 'author',
      text: post.author,
      matchedText: query,
    })
  }

  return highlights
}

/**
 * Search posts with scoring and ranking
 *
 * Performs a weighted multi-field search across all posts:
 * - Searches title, description, tags, series, content, author
 * - Ranks results by relevance score
 * - Extracts highlighted text snippets
 * - Applies configurable filters (minScore, limit)
 *
 * @param posts - All posts to search through
 * @param query - Search query string
 * @param options - Search configuration options
 * @returns Ranked search results with highlights
 *
 * @example
 * const results = searchPosts(allPosts, 'typescript', {
 *   minScore: 1,
 *   limit: 10,
 *   includeContent: true
 * })
 */
export function searchPosts(
  posts: Post[],
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const {
    minScore = 0,
    limit,
    includeContent = true,
    includeHighlights = true,
  } = options

  // Normalize query
  const normalizedQuery = normalizeText(query)

  // Empty query returns empty results
  if (!normalizedQuery) {
    return []
  }

  // Score and filter posts
  const scoredPosts: SearchResult[] = posts
    .map((post) => {
      const score = calculateScore(post, query, includeContent)

      // Early exit for zero score
      if (score === 0) {
        return null
      }

      // Extract highlights if requested
      const highlights = includeHighlights
        ? extractHighlights(post, query, includeContent)
        : []

      return {
        ...post,
        score,
        highlights,
      }
    })
    .filter((result): result is SearchResult => result !== null)
    .filter((result) => result.score >= minScore)

  // Sort by score (descending), then by date (newest first)
  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Apply limit if specified
  if (limit && limit > 0) {
    return scoredPosts.slice(0, limit)
  }

  return scoredPosts
}

/**
 * Get search suggestions based on existing tags and series
 * Useful for autocomplete or popular searches
 */
export function getSearchSuggestions(posts: Post[]): string[] {
  const suggestions = new Set<string>()

  posts.forEach((post) => {
    // Add tags
    post.tags.forEach((tag) => suggestions.add(tag))

    // Add series
    if (post.series) {
      suggestions.add(post.series)
    }
  })

  return Array.from(suggestions).sort()
}
