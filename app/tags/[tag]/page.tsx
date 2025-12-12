import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllTags } from '@/lib/tags'
import { getPostsByTag } from '@/lib/posts'
import { Container } from '@/components/layout/Container'
import { PostList } from '@/components/post/PostList'
import { Badge } from '@/components/ui/Badge'
import { getPageMetadata } from '@/lib/seo'

interface TagPageProps {
  params: Promise<{
    tag: string
  }>
}

// generateStaticParams에서 반환되지 않은 경로는 404
export const dynamicParams = false

// 플레이스홀더 - 빈 배열 반환 시 빌드 에러 방지
const PLACEHOLDER_TAG = '__placeholder__'

export async function generateStaticParams() {
  const tags = await getAllTags()
  if (tags.length === 0) {
    return [{ tag: PLACEHOLDER_TAG }]
  }
  return tags.map((tag) => ({
    tag: tag.name,
  }))
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  return getPageMetadata({
    title: `${decodedTag} 태그`,
    description: `${decodedTag} 태그가 달린 모든 포스트`,
    path: `/tags/${tag}`,
  })
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const posts = await getPostsByTag(decodedTag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-4xl font-bold text-foreground">태그:</h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            #{decodedTag}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          총 {posts.length}개의 포스트
        </p>
      </div>

      <PostList posts={posts} emptyMessage={`"${decodedTag}" 태그가 달린 포스트가 없습니다.`} />
    </Container>
  )
}
