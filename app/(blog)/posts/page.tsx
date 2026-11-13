import { type Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { Container } from '@/components/layout/Container'
import { PostList } from '@/components/post/PostList'
import { PostListWithPagination } from '@/components/post/PostListWithPagination'
import { Suspense } from 'react'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourblog.com'

export const metadata: Metadata = {
  title: '글',
  description: '블로그의 모든 글',
  alternates: {
    canonical: `${siteUrl}/posts`,
  },
  openGraph: {
    title: '글',
    description: '블로그의 모든 글',
    url: `${siteUrl}/posts`,
  },
}

export default async function PostsPage() {
  const allPosts = await getAllPosts()

  return (
    <Container className="py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-foreground">글</h1>
        <p className="text-lg text-muted-foreground">
          글 {allPosts.length}편
        </p>
      </div>

      {/* 페이지네이션이 포함된 포스트 목록 */}
      {/* 대기 자리는 정적 HTML에 그대로 남는다 — 스크립트가 꺼진 기기도 첫 쪽 글 카드를 본다.
          하이드레이션 뒤 첫 쪽과 같은 마크업이라 화면이 바뀌지 않는다. */}
      <Suspense
        fallback={
          <PostList
            posts={allPosts.slice(0, 12)}
            emptyMessage="아직 올린 글이 없습니다"
          />
        }
      >
        <PostListWithPagination allPosts={allPosts} postsPerPage={12} />
      </Suspense>
    </Container>
  )
}
