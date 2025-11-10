import Link from 'next/link'
import { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { Container } from '@/components/layout/Container'
import { PostList } from '@/components/post/PostList'
import { Button } from '@/components/ui/Button'
import { getPageMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/constants'

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    path: '/',
  })
}

export default async function Home() {
  // Get latest 6 posts for homepage
  const allPosts = await getAllPosts()
  const latestPosts = allPosts.slice(0, 6)

  return (
    <Container className="py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
          Welcome to My Blog
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          Exploring web development, TypeScript, and modern frameworks.
          Sharing knowledge and insights from my coding journey.
        </p>
      </section>

      {/* Latest Posts Section */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Latest Posts</h2>
          {allPosts.length > 6 && (
            <Link href="/posts">
              <Button variant="outline">View All Posts</Button>
            </Link>
          )}
        </div>
        <PostList
          posts={latestPosts}
          emptyMessage="No posts yet. Stay tuned for upcoming content!"
        />
      </section>
    </Container>
  )
}
