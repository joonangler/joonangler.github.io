'use client'

// 1. React & Next.js
import { useState } from 'react'
import Link from 'next/link'

// 2. External libraries
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

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
 * <SeriesNavBottom navigation={seriesNavigation} />
 */
export function SeriesNavBottom({ navigation }: SeriesNavProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { previous, next, current, series } = navigation

  return (
    <div className="mt-20 mb-8 rounded-lg border border-border bg-card">
      {/* 이전/다음 네비게이션 */}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* 이전 포스트 */}
        {previous ? (
          <Link
            href={`/posts/${previous.slug}`}
            className="group flex items-center gap-3 p-6 transition-colors hover:bg-foreground/10"
          >
            <ChevronLeft className="h-5 w-5 shrink-0 text-ink-3 transition-transform group-hover:-translate-x-1" />
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-muted-foreground">
                Previous
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                {previous.title}
              </p>
              {previous.seriesOrder && (
                <p className="mt-1 text-xs text-ink-3">
                  Part {previous.seriesOrder}
                </p>
              )}
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-center p-6 text-ink-3">
            <p className="text-sm">First post</p>
          </div>
        )}

        {/* 다음 포스트 */}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="group flex items-center gap-3 p-6 transition-colors hover:bg-foreground/10"
          >
            <div className="flex-1 text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Next
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                {next.title}
              </p>
              {next.seriesOrder && (
                <p className="mt-1 text-xs text-ink-3">
                  Part {next.seriesOrder}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="flex items-center justify-center p-6 text-ink-3">
            <p className="text-sm">Last post</p>
          </div>
        )}
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
