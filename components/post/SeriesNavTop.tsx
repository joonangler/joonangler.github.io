'use client'

// 1. React & Next.js
import { useState } from 'react'
import Link from 'next/link'

// 2. External libraries
import { ChevronDown, ChevronUp } from 'lucide-react'

// 3. Internal libraries
import { cn } from '@/lib/utils'

// 4. Types
import { type SeriesNavigation } from '@/types/post'

interface SeriesNavProps {
  navigation: SeriesNavigation
}

/**
 * 시리즈 네비게이션 컴포넌트
 *
 * 시리즈 내의 이전/다음 포스트로 이동할 수 있는 네비게이션과
 * 진행률, 전체 포스트 목록을 제공합니다.
 *
 * @example
 * <SeriesNavTop navigation={seriesNavigation} />
 */
export function SeriesNavTop({ navigation }: SeriesNavProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { current, series } = navigation

  // 현재 포스트의 인덱스
  const currentIndex = series.posts.findIndex((post) => post.slug === current.slug)
  const currentNumber = currentIndex + 1
  const totalPosts = series.count

  return (
    <div className="my-8 rounded-lg border border-border bg-card">
      {/* 헤더 */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Series</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              <Link
                href={`/series/${series.slug}`}
                className="underline-offset-4 transition-colors hover:underline"
                >
                {series.name}
              </Link>
            </h3>
          </div>
          <div className="text-right">
            <p className="mt-1 text-lg font-semibold text-foreground">
              Part {currentNumber} / {totalPosts}
            </p>
          </div>
        </div>
      </div>

      {/* 전체 목록 토글 */}
      <div className="border-t border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-foreground/10"
          aria-expanded={isExpanded}
          aria-controls="series-posts-list"
        >
          <span className="text-sm font-medium text-muted-foreground">
            View all posts in this series
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-ink-3" />
          ) : (
            <ChevronDown className="h-4 w-4 text-ink-3" />
          )}
        </button>

        {/* 전체 포스트 목록 */}
        {isExpanded && (
          <div
            id="series-posts-list"
            className="border-t border-border"
          >
            <ul className="divide-y divide-border">
              {series.posts.map((post) => {
                const isCurrent = post.slug === current.slug
                return (
                  <li key={post.slug}>
                    {isCurrent ? (
                      <div className="flex items-center gap-4 bg-foreground/5 px-6 py-3">
                        <span className="shrink-0 text-sm font-semibold text-foreground">
                          {post.seriesOrder || '?'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {post.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Current post
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/posts/${post.slug}`}
                        className={cn(
                          'flex items-center gap-4 px-6 py-3 transition-colors',
                          'hover:bg-foreground/10'
                        )}
                      >
                        <span className="shrink-0 text-sm font-medium text-muted-foreground">
                          {post.seriesOrder || '?'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground hover:text-foreground">
                            {post.title}
                          </p>
                        </div>
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
