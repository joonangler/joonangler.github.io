import { type Metadata } from 'next'
import Link from 'next/link'
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
 * 2. Passes data to client-side SearchInterface
 *
 * The actual search is performed client-side for instant results
 * Note: initialQuery is read from URL on client side for static export compatibility
 */
export default async function SearchPage() {
  // Fetch all posts on the server (cached by React)
  const posts = await getAllPosts()

  return (
    <Container className="py-12">
      <Suspense fallback={<SearchFallback />}>
        <SearchInterface posts={posts} />
      </Suspense>
    </Container>
  )
}

/**
 * Loading fallback for search interface
 * 「로딩 중...」은 스크립트가 있을 때(html.js)만 보인다. 스크립트가 꺼진 기기는 검색을 못 쓰므로
 * 그렇다고 알리고 태그·시리즈로 가는 길을 준다.
 */
function SearchFallback() {
  return (
    <div className="min-h-[60vh]">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">검색</h1>
        <p className="hidden text-muted-foreground [.js_&]:block">로딩 중...</p>
        <noscript>
          <p className="text-muted-foreground">
            검색은 자바스크립트를 켜야 쓸 수 있습니다. 태그나 시리즈로 글을 찾아 보세요.
          </p>
          <p className="mt-4 flex justify-center gap-6 text-foreground">
            <Link href="/tags/" className="underline decoration-ink-3 underline-offset-4">태그</Link>
            <Link href="/series/" className="underline decoration-ink-3 underline-offset-4">시리즈</Link>
          </p>
        </noscript>
      </div>
      <div className="mx-auto mb-8 hidden max-w-2xl [.js_&]:block">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}
