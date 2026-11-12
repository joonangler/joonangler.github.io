import { type Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { Container } from '@/components/layout/Container'
import { PostListWithPagination } from '@/components/post/PostListWithPagination'
import { Suspense } from 'react'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourblog.com'

export const metadata: Metadata = {
  title: 'All Posts',
  description: 'Browse all blog posts',
  alternates: {
    canonical: `${siteUrl}/posts`,
  },
  openGraph: {
    title: 'All Posts',
    description: 'Browse all blog posts',
    url: `${siteUrl}/posts`,
  },
}

export default async function PostsPage() {
  const allPosts = await getAllPosts()

  return (
    <Container className="py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-foreground">All Posts</h1>
        <p className="text-lg text-muted-foreground">
          {allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'} published
        </p>
      </div>

      {/* 페이지네이션이 포함된 포스트 목록 */}
      <Suspense
        fallback={
          <div
            className="py-16 text-center text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <p>Loading posts...</p>
          </div>
        }
      >
        <PostListWithPagination allPosts={allPosts} postsPerPage={12} />
      </Suspense>
    </Container>
  )
}
