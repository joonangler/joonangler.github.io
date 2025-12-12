'use client'

import { SearchResultCard } from './SearchResultCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import type { SearchResult } from '@/types/search'

interface SearchResultsProps {
  /**
   * Search results to display
   */
  results: SearchResult[]

  /**
   * Current search query
   */
  query: string

  /**
   * Loading state
   */
  isSearching?: boolean

  /**
   * Maximum number of results (for footer message)
   */
  maxResults?: number
}

/**
 * Search icon component
 */
function SearchIcon() {
  return (
    <svg
      className="h-12 w-12 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  )
}

/**
 * Loading skeleton for search results
 */
function SearchSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-64 animate-pulse">
          <div className="h-full bg-muted" />
        </Card>
      ))}
    </div>
  )
}

/**
 * Displays search results with loading and empty states
 *
 * States:
 * 1. Loading: Shows skeleton cards
 * 2. No query: Shows search prompt
 * 3. No results: Shows "no results" message
 * 4. Results: Shows result cards in grid
 *
 * @example
 * <SearchResults
 *   results={searchResults}
 *   query="typescript"
 *   isSearching={false}
 * />
 */
export function SearchResults({
  results,
  query,
  isSearching = false,
  maxResults,
}: SearchResultsProps) {
  // Loading state
  if (isSearching) {
    return (
      <div className="mt-8">
        <div className="mb-6">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        </div>
        <SearchSkeleton />
      </div>
    )
  }

  // No query entered
  if (!query.trim()) {
    return (
      <div className="mt-16">
        <EmptyState
          icon={<SearchIcon />}
          message="검색어를 입력하세요"
          description="제목, 설명, 태그, 시리즈에서 검색할 수 있습니다"
        />
      </div>
    )
  }

  // No results found
  if (results.length === 0) {
    return (
      <div className="mt-16">
        <EmptyState
          icon={<SearchIcon />}
          message={`"${query}"에 대한 검색 결과가 없습니다`}
          description="다른 키워드로 검색하거나 철자를 확인해 주세요"
        />
      </div>
    )
  }

  // Results found
  return (
    <div className="mt-8">
      {/* Results count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {results.length}
          </span>
          개의 검색 결과 - &quot;
          <span className="font-semibold text-foreground">{query}</span>
          &quot;
        </p>
      </div>

      {/* Results grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {results.map((result) => (
          <SearchResultCard key={result.slug} result={result} query={query} />
        ))}
      </div>

      {/* Results footer */}
      {maxResults && results.length >= maxResults && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          상위 {maxResults}개의 결과만 표시됩니다. 더 구체적인 검색어를 사용해 보세요.
        </div>
      )}
    </div>
  )
}
