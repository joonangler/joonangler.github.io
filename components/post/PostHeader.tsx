import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Badge } from '../ui/Badge'
import type { Post } from '@/types/post'

interface PostHeaderProps {
  post: Post
}

/**
 * Post header component for displaying post title and metadata
 * Used in post detail page
 *
 * @example
 * <PostHeader post={post} />
 */
export function PostHeader({ post }: PostHeaderProps) {
  return (
    <header className="mb-8 space-y-4">
      {/* Series breadcrumb */}
      {/* {post.series && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/series/${encodeURIComponent(post.series)}`}
            className="hover:text-foreground transition-colors"
          >
            {post.series}
          </Link>
          {post.seriesOrder && (
            <>
              <span>/</span>
              <span>Part {post.seriesOrder}</span>
            </>
          )}
        </div>
      )} */}

      {/* Title */}
      <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
        {post.title}
      </h1>

      {/* Description */}
      {post.description && (
        <p className="text-xl text-muted-foreground">{post.description}</p>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {/* Date */}
        <time dateTime={post.date}>{formatDate(post.date)}</time>

        {/* Reading time */}
        {post.readingTime && (
          <>
            <span>·</span>
            <span>{post.readingTime.text}</span>
          </>
        )}

        {/* Author */}
        {post.author && (
          <>
            <span>·</span>
            <span>by {post.author}</span>
          </>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
            >
              <Badge variant="secondary" className="hover:bg-secondary/80">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
