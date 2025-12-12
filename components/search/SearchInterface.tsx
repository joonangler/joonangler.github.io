'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/ui/SearchBar'
import { SearchResults } from './SearchResults'
import { searchPosts } from '@/lib/search'
import { debounce } from '@/lib/utils'
import type { Post } from '@/types/post'

/**
 * Maximum number of search results to display
 */
const SEARCH_RESULT_LIMIT = 50

interface SearchInterfaceProps {
  /**
   * All posts to search through
   */
  posts: Post[]
}

/**
 * Main search interface component
 *
 * Orchestrates the search functionality:
 * - Manages search state
 * - Debounces search input
 * - Updates URL with query params
 * - Executes search and displays results
 *
 * @example
 * <SearchInterface posts={allPosts} />
 */
export function SearchInterface({ posts }: SearchInterfaceProps) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Debounced URL update
  const debouncedUrlUpdate = useMemo(
    () =>
      debounce((q: string) => {
        setIsSearching(false)

        // Update URL with search query
        const params = new URLSearchParams(searchParams.toString())
        if (q.trim()) {
          params.set('q', q)
        } else {
          params.delete('q')
        }

        // Update URL without scrolling
        const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
        router.push(newUrl, { scroll: false })
      }, 300),
    [router, searchParams]
  )

  // Handle search input
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setIsSearching(true)
    debouncedUrlUpdate(newQuery)
  }

  // Execute search with scoring and ranking
  const results = useMemo(() => {
    if (!query.trim()) {
      return []
    }

    return searchPosts(posts, query, {
      minScore: 0.5, // Filter out low-relevance results
      limit: SEARCH_RESULT_LIMIT,
      includeContent: true,
      includeHighlights: true,
    })
  }, [posts, query])

  // Sync query with URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || ''
    if (urlQuery !== query) {
      setQuery(urlQuery)
    }
  }, [searchParams, query])

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUrlUpdate.cancel()
    }
  }, [debouncedUrlUpdate])

  return (
    <div className="min-h-[60vh]">
      {/* Search Title */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">검색</h1>
        <p className="text-muted-foreground">
          제목, 설명, 태그, 시리즈에서 검색할 수 있습니다
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto mb-8 max-w-2xl">
        <SearchBar
          onSearch={handleSearch}
          defaultValue={query}
          placeholder="검색어를 입력하세요..."
          autoFocus
          showIcon
          showShortcutHint
        />
      </div>

      {/* Search Results */}
      <SearchResults
        results={results}
        query={query}
        isSearching={isSearching}
        maxResults={SEARCH_RESULT_LIMIT}
      />

      {/* Search Tips */}
      {!query && (
        <div className="mt-12 rounded-lg border border-border bg-muted/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">검색 팁</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <kbd className="rounded bg-background px-2 py-1 text-xs">⌘K</kbd>{' '}
              또는 <kbd className="rounded bg-background px-2 py-1 text-xs">Ctrl+K</kbd>를
              눌러 빠르게 검색창에 포커스할 수 있습니다
            </li>
            <li>
              • <kbd className="rounded bg-background px-2 py-1 text-xs">ESC</kbd>를
              눌러 검색어를 지울 수 있습니다
            </li>
            <li>
              • 검색 결과는 관련성 순으로 정렬됩니다 (제목 매치가 가장 높은 점수를
              받습니다)
            </li>
            <li>• 최근 30일 이내의 게시물은 검색 순위가 약간 올라갑니다</li>
          </ul>
        </div>
      )}
    </div>
  )
}
