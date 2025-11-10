import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Highlight } from './Highlight'
import { formatDate } from '@/lib/utils'
import type { SearchResult } from '@/types/search'

interface SearchResultCardProps {
  /**
   * Search result with score and highlights
   */
  result: SearchResult

  /**
   * Search query for highlighting
   */
  query: string

  /**
   * Show relevance score (for development/debugging)
   */
  showScore?: boolean
}

/**
 * Card component displaying a single search result
 *
 * Features:
 * - Highlighted title, description, and tags
 * - Content snippet preview
 * - Cover image (if available)
 * - Reading time and date
 * - Relevance score (optional, for dev)
 *
 * @example
 * <SearchResultCard result={searchResult} query="typescript" />
 */
export function SearchResultCard({
  result,
  query,
  showScore = process.env.NODE_ENV === 'development',
}: SearchResultCardProps) {
  return (
    <Link href={`/posts/${result.slug}`} className="group block">
      <Card hover className="relative h-full">
        {/* Development: Score Badge */}
        {showScore && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 z-10 text-xs"
          >
            Score: {result.score.toFixed(1)}
          </Badge>
        )}

        {/* Cover Image */}
        {result.coverImage && (
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={result.coverImage}
              alt={result.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-4">
          {/* Date and Reading Time */}
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <time dateTime={result.date}>{formatDate(result.date)}</time>
            {result.readingTime && (
              <>
                <span>·</span>
                <span>{result.readingTime.text}</span>
              </>
            )}
            {result.series && (
              <>
                <span>·</span>
                <span className="truncate">
                  <Highlight text={result.series} query={query} />
                </span>
              </>
            )}
          </div>

          {/* Title with Highlighting */}
          <h2 className="mb-2 line-clamp-2 text-xl font-bold leading-tight transition-colors group-hover:text-primary">
            <Highlight text={result.title} query={query} />
          </h2>

          {/* Description with Highlighting */}
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            <Highlight text={result.description} query={query} />
          </p>

          {/* Content Highlight Snippet */}
          {result.highlights.length > 0 && (
            <div className="mb-3 rounded-md bg-muted p-2 text-xs italic text-muted-foreground">
              <span className="not-italic">💬 </span>
              {result.highlights
                .filter((h) => h.field === 'content')
                .slice(0, 1)
                .map((highlight, index) => (
                  <span key={index}>
                    &quot;
                    <Highlight text={highlight.text} query={query} />
                    &quot;
                  </span>
                ))}
            </div>
          )}

          {/* Tags with Highlighting */}
          {result.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Highlight text={tag} query={query} />
                </Badge>
              ))}
              {result.tags.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{result.tags.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
