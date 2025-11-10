import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import type { Post } from '@/types/post'

interface PostCardProps {
  post: Post
}

/**
 * Post card component for displaying post preview in list view
 *
 * @example
 * <PostCard post={post} />
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <Card hover className="h-full overflow-hidden">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              unoptimized
            />
          </div>
        )}

        <article className="flex h-full flex-col p-6">
          {/* Post metadata */}
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.readingTime && (
              <>
                <span>·</span>
                <span>{post.readingTime.text}</span>
              </>
            )}
          </div>

          {/* Post title */}
          <h2 className="mb-2 text-2xl font-bold text-foreground transition-colors hover:text-foreground/80">
            {post.title}
          </h2>

          {/* Post description */}
          {post.description && (
            <p className="mb-4 flex-grow text-muted-foreground line-clamp-2">
              {post.description}
            </p>
          )}

          {/* Series info */}
          {post.series && (
            <div className="mb-3 text-sm text-muted-foreground">
              <span className="font-medium">Series:</span> {post.series}
              {post.seriesOrder && ` (Part ${post.seriesOrder})`}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </article>
      </Card>
    </Link>
  )
}
