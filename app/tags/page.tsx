import { type Metadata } from 'next'
import Link from 'next/link'
import { getAllTags, getTagCloud } from '@/lib/tags'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { TagCloud } from '@/components/ui/TagCloud'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourblog.com'

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Browse posts by tags',
  alternates: {
    canonical: `${siteUrl}/tags`,
  },
  openGraph: {
    title: 'Tags',
    description: 'Browse posts by tags',
    url: `${siteUrl}/tags`,
  },
}

export default async function TagsPage() {
  const tags = await getAllTags()
  const tagCloud = await getTagCloud()
  // const popularTags = await getPopularTags(10)
  // const recentTags = await getRecentTags(5)

  if (tags.length === 0) {
    return (
      <Container className="py-12">
        <EmptyState message="No tags found." />
      </Container>
    )
  }

  return (
    <Container className="py-12">
      {/* 헤더 */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Tags</h1>
        <p className="text-lg text-muted-foreground">
          Explore {tags.length} {tags.length === 1 ? 'tag' : 'tags'} across all posts
        </p>
      </div>

      {/* 태그 클라우드 */}
      <section className="mb-16">
        {/* <h2 className="mb-6 text-2xl font-semibold text-foreground">Tag Cloud</h2> */}
        <Card className="p-8">
          <TagCloud tags={tagCloud} />
        </Card>
      </section>

      {/* 전체 태그 목록 */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-foreground">All Tags</h2>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${encodeURIComponent(tag.slug)}`}
            >
              <Badge variant="secondary" className="text-base">
                #{tag.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {tag.count}
                </span>
              </Badge>
            </Link>
          ))}
        </div>
      </section>

      {/* 인기 태그 */}
      {/* {popularTags.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-foreground">Popular Tags</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {popularTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${encodeURIComponent(tag.slug)}`}
              >
                <Card hover className="h-full text-center">
                  <Badge variant="default" className="mb-2">
                    #{tag.name}
                  </Badge>
                  <p className="text-2xl font-bold text-foreground">{tag.count}</p>
                  <p className="text-sm text-muted-foreground">
                    {tag.count === 1 ? 'post' : 'posts'}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )} */}

      {/* 최근 태그 */}
      {/* {recentTags.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-foreground">Recent Tags</h2>
          <div className="flex flex-wrap gap-3">
            {recentTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${encodeURIComponent(tag.slug)}`}
              >
                <Badge variant="secondary" className="text-base">
                  #{tag.name}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {tag.count}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )} */}

      {/* 전체 태그 목록 */}
      {/* <section>
        <h2 className="mb-6 text-2xl font-semibold text-foreground">All Tags</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Link key={tag.slug} href={`/tags/${encodeURIComponent(tag.slug)}`}>
              <Card hover className="h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      #{tag.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {tag.count} {tag.count === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6 text-muted-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section> */}
    </Container>
  )
}
