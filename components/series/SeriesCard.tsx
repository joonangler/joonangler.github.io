import Link from 'next/link'
import Image from 'next/image'
import { type SeriesInfo } from '@/types/post'
import { isSeriesCompleted } from '@/lib/series'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Clock, FileText } from 'lucide-react'

interface SeriesCardProps {
  series: SeriesInfo
}

/**
 * 시리즈 카드 컴포넌트
 *
 * 시리즈의 기본 정보, 진행률, 완결 상태를 표시합니다.
 *
 * @example
 * <SeriesCard series={seriesInfo} />
 */
export function SeriesCard({ series }: SeriesCardProps) {
  const isCompleted = isSeriesCompleted(series)
  const firstPost = series.posts[0]
  const lastPost = series.posts[series.posts.length - 1]
  const totalMinutes = series.totalReadingTime

  return (
    <Link href={`/series/${encodeURIComponent(series.slug)}`} className="group">
      <Card hover className="h-full overflow-hidden">
        {/* 커버 이미지 */}
        {series.coverImage ? (
          <div className="relative aspect-video w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
            <Image
              src={series.coverImage}
              alt={series.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}

        {/* 콘텐츠 */}
        <div className="p-6">
          {/* 헤더 */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="mb-2 text-xl font-semibold text-foreground line-clamp-2">
                {series.name}
              </h3>
            </div>
            {/* <Badge
              variant={isCompleted ? 'default' : 'secondary'}
              className="ml-2 flex-shrink-0"
            >
              {isCompleted ? 'Completed' : 'Ongoing'}
            </Badge> */}
          </div>

          {/* 통계 */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>
                {series.count} part{series.count !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{totalMinutes} min read</span>
            </div>
          </div>

          {/* 진행률 바 */}
          {/* <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{series.count} posts</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: isCompleted ? '100%' : '75%' }}
              />
            </div>
          </div> */}

          {/* 날짜 정보 */}
          <div className="border-t border-gray-200 pt-4 text-xs text-muted-foreground dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1">Started</p>
                <p className="font-medium text-foreground">
                  {formatDate(firstPost.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="mb-1">Updated</p>
                <p className="font-medium text-foreground">
                  {formatDate(lastPost.date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
