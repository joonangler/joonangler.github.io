import Link from 'next/link'
import { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { getAllPosts } from '@/lib/posts'
import { Container } from '@/components/layout/Container'
import { PostList } from '@/components/post/PostList'
import { Button } from '@/components/ui/Button'
import { getPageMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/constants'
import Image from 'next/image'

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
      {/* Hero Section - Profile Style */}
      <section className="mb-16 flex flex-col items-center text-center">
        {/* Profile Image Placeholder */}
        {/* <div className="mb-4 h-32 w-32 rounded-full bg-muted" /> */}
          <Image
            src={SITE_CONFIG.author.image}
            alt={SITE_CONFIG.author.name}
            width={128}
            height={128}
            className='mb-4 rounded-full'
          />

        {/* Name */}
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          {SITE_CONFIG.author.name}
        </h1>

        {/* Description */}
        <p className="mb-4 max-w-md text-muted-foreground">
          {SITE_CONFIG.description}
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a
            href={SITE_CONFIG.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <SiGithub className="h-8 w-8" />
          </a>
          <a
            href={`mailto:${SITE_CONFIG.author.email}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Email"
          >
            <Mail className="h-8 w-8" />
          </a>
        </div>
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
