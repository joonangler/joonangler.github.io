import Link from 'next/link'
import Image from 'next/image'
import { type Post } from '@/types/post'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Calendar, Clock } from 'lucide-react'

interface RelatedPostsProps {
  posts: Post[]
}

/**
 * 관련 포스트 컴포넌트
 *
 * 현재 포스트와 관련된 다른 포스트들을 표시합니다.
 *
 * @example
 * const related = await getRelatedPosts(currentPost, 3)
 * <RelatedPosts posts={related} />
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="my-12 border-t border-gray-200 pt-12 dark:border-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Related Posts</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`} className="group">
            <Card hover className="h-full overflow-hidden">
              {/* 커버 이미지 */}
              {post.coverImage && (
                <div className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              {/* 콘텐츠 */}
              <div className="p-4">
                {/* 시리즈 정보 */}
                {post.series && (
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.series}
                      {post.seriesOrder && ` · Part ${post.seriesOrder}`}
                    </Badge>
                  </div>
                )}

                {/* 제목 */}
                <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2">
                  {post.title}
                </h3>

                {/* 설명 */}
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {post.description}
                </p>

                {/* 메타 정보 */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{post.readingTime.text}</span>
                  </div>
                </div>

                {/* 태그 */}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{post.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
