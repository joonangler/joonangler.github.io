import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { getSeriesNavigation } from '@/lib/series'
import { getRelatedPosts } from '@/lib/related-posts'
import { Container } from '@/components/layout/Container'
import { PostHeader } from '@/components/post/PostHeader'
import { PostContent } from '@/components/post/PostContent'
import { SeriesNav } from '@/components/post/SeriesNav'
import { RelatedPosts } from '@/components/post/RelatedPosts'
import { TableOfContents } from '@/components/post/TableOfContents'
import { Comments } from '@/components/Comments'
import { getPageMetadata, getOgImageUrl } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '@/lib/json-ld'

interface PostPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug.split('/'),
  }))
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const slugString = slug.join('/')
  const post = await getPostBySlug(slugString)

  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
      description: '요청하신 포스트를 찾을 수 없습니다.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return getPageMetadata({
    title: post.title,
    description: post.description,
    path: `/posts/${slugString}`,
    image: getOgImageUrl(post.coverImage),
    type: 'article',
    publishedTime: post.date,
    modifiedTime: post.modifiedDate,
    tags: post.tags,
  })
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const slugString = slug.join('/')
  const post = await getPostBySlug(slugString)

  if (!post) {
    notFound()
  }

  // 시리즈 네비게이션 정보 가져오기
  const seriesNavigation = post.series ? await getSeriesNavigation(slugString) : null

  // 관련 포스트 가져오기
  const relatedPosts = await getRelatedPosts(post, 3)

  // TOC 존재 여부 확인
  const hasTOC = post.toc && post.toc.length > 0

  // JSON-LD 스키마 생성
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Posts', url: '/posts' },
    { name: post.title, url: `/posts/${slugString}` },
  ]

  return (
    <>
      <JsonLd data={generateBlogPostingSchema(post, slugString)} />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbItems)} />
      <Container className="py-12">
        {hasTOC ? (
        // TOC가 있는 경우: 2컬럼 레이아웃
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
            {/* 메인 콘텐츠 */}
            <article className="min-w-0">
              <PostHeader post={post} />

              {/* TOC (모바일용 collapsible) */}
              <div className="mb-6 lg:hidden">
                <TableOfContents toc={post.toc} variant="collapsible" />
              </div>

              {/* 시리즈 네비게이션 - 상단 */}
              {seriesNavigation && <SeriesNav navigation={seriesNavigation} />}

              <PostContent content={post.content} />

              {/* 시리즈 네비게이션 - 하단 */}
              {seriesNavigation && <SeriesNav navigation={seriesNavigation} />}

              {/* 관련 포스트 */}
              <RelatedPosts posts={relatedPosts} />

              {/* 댓글 */}
              <Comments />
            </article>

            {/* TOC 사이드바 (데스크톱용 sticky) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <TableOfContents toc={post.toc} variant="sticky" />
              </div>
            </aside>
          </div>
        </div>
      ) : (
        // TOC가 없는 경우: 기존 단일 컬럼 레이아웃
        <article className="mx-auto max-w-3xl">
          <PostHeader post={post} />

          {/* 시리즈 네비게이션 - 상단 */}
          {seriesNavigation && <SeriesNav navigation={seriesNavigation} />}

          <PostContent content={post.content} />

          {/* 시리즈 네비게이션 - 하단 */}
          {seriesNavigation && <SeriesNav navigation={seriesNavigation} />}

          {/* 관련 포스트 */}
          <RelatedPosts posts={relatedPosts} />

          {/* 댓글 */}
          <Comments />
        </article>
      )}
      </Container>
    </>
  )
}
