import { type Metadata } from 'next'
import { Suspense } from 'react'
import { getAllPosts } from '@/lib/posts'
import { Container } from '@/components/layout/Container'
import { SearchInterface } from '@/components/search/SearchInterface'

/**
 * Metadata for the search page
 * Note: robots.index is false to prevent indexing of search results
 */
export const metadata: Metadata = {
  title: '검색',
  description: '블로그 포스트를 검색합니다. 제목, 설명, 태그, 시리즈에서 검색할 수 있습니다.',
  openGraph: {
    title: '검색',
    description: '블로그 포스트 검색',
  },
  robots: {
    index: false, // Don't index search results pages
    follow: true,
  },
}

/**
 * Search page component
 *
 * Server Component that:
 * 1. Fetches all posts on the server
 * 2. Extracts search query from URL params
 * 3. Passes data to client-side SearchInterface
 *
 * The actual search is performed client-side for instant results
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  // Fetch all posts on the server (cached by React)
  const posts = await getAllPosts()

  // Get initial query from URL (for direct links)
  const params = await searchParams
  const initialQuery = params.q || ''

  return (
    <Container className="py-12">
      <Suspense fallback={<SearchFallback />}>
        <SearchInterface posts={posts} initialQuery={initialQuery} />
      </Suspense>
    </Container>
  )
}

/**
 * Loading fallback for search interface
 */
function SearchFallback() {
  return (
    <div className="min-h-[60vh]">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">검색</h1>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
      <div className="mx-auto mb-8 max-w-2xl">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
