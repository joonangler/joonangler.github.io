'use client'

// React 및 Next.js
import { useCallback, useMemo } from 'react'

// 내부 라이브러리
import { useScrollSpy } from '@/hooks/use-scroll-spy'
import { cn } from '@/lib/utils'
import { HEADER_HEIGHT } from '@/lib/constants'

// 타입
import type { TOCItem } from '@/types'

interface TableOfContentsProps {
  toc: TOCItem[]
  className?: string
  /**
   * Variant of the TOC display
   * - 'sticky': Desktop sticky sidebar (default)
   * - 'collapsible': Mobile collapsible details element
   */
  variant?: 'sticky' | 'collapsible'
}

/**
 * TableOfContents Component
 * Displays a hierarchical table of contents with scroll spy
 * - Highlights current section based on scroll position
 * - Smooth scroll to section on click
 * - Sticky positioning on desktop
 * - Collapsible on mobile
 * - Accessible navigation with ARIA
 *
 * @example
 * // Sticky variant (desktop)
 * <TableOfContents toc={post.toc} variant="sticky" />
 *
 * @example
 * // Collapsible variant (mobile)
 * <TableOfContents toc={post.toc} variant="collapsible" />
 */
export function TableOfContents({
  toc,
  className,
  variant = 'sticky',
}: TableOfContentsProps) {
  // TOC가 비어있으면 렌더링하지 않음
  if (!toc || toc.length === 0) {
    return null
  }

  // 모든 헤딩 ID를 평면 배열로 추출
  const headingIds = useMemo(() => {
    const extractIds = (items: TOCItem[]): string[] => {
      return items.flatMap((item) => [
        item.id,
        ...(item.children ? extractIds(item.children) : []),
      ])
    }
    return extractIds(toc)
  }, [toc])

  // 스크롤 스파이로 현재 활성 헤딩 추적
  const activeId = useScrollSpy(headingIds)

  // 링크 클릭 시 부드러운 스크롤 (메모이제이션 및 에러 핸들링 추가)
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()

      const element = document.getElementById(id)

      if (!element) {
        console.warn(`TableOfContents: Heading with id "${id}" not found in DOM`)
        return
      }

      try {
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - HEADER_HEIGHT

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })

        // 키보드 포커스도 이동 (접근성 개선)
        element.focus({ preventScroll: true })
      } catch (error) {
        console.error('TableOfContents: Scroll navigation failed', error)
      }
    },
    []
  )

  // 재귀적으로 TOC 아이템 렌더링 (메모이제이션 추가)
  const renderTOCItem = useCallback(
    (item: TOCItem, level: number = 0): React.ReactNode => {
      const isActive = activeId === item.id
      const hasChildren = item.children && item.children.length > 0

      return (
        <li key={item.id} className={cn('my-1', level > 0 && 'ml-4')}>
          <a
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={cn(
              'block py-1 text-sm transition-colors hover:text-foreground',
              'border-l-2 pl-3',
              // 키보드 포커스 스타일 추가
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isActive
                ? 'border-primary font-semibold text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border'
            )}
            aria-current={isActive ? 'location' : undefined}
            tabIndex={0}
          >
            {item.text}
          </a>
          {hasChildren && (
            <ul className="mt-1" role="list">
              {item.children!.map((child) => renderTOCItem(child, level + 1))}
            </ul>
          )}
        </li>
      )
    },
    [activeId, handleClick]
  )

  // TOC 리스트 렌더링 (공통)
  const tocList = useMemo(
    () => (
      <ul className="toc-scrollbar space-y-1">
        {toc.map((item) => renderTOCItem(item, 0))}
      </ul>
    ),
    [toc, renderTOCItem]
  )

  // Collapsible variant (모바일용)
  if (variant === 'collapsible') {
    return (
      <details
        className={cn(
          'group rounded-lg border border-border bg-card',
          className
        )}
      >
        <summary
          className={cn(
            'flex cursor-pointer items-center justify-between p-4',
            'text-sm font-semibold uppercase tracking-wide text-card-foreground',
            'transition-colors hover:bg-accent',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'list-none [&::-webkit-details-marker]:hidden'
          )}
          aria-label="Toggle table of contents"
        >
          <span>On This Page</span>
          <svg
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              'group-open:rotate-180'
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </summary>
        <nav
          className="px-4 pb-4"
          aria-label="Table of contents"
          role="navigation"
        >
          {tocList}
        </nav>
      </details>
    )
  }

  // Sticky variant (데스크톱용)
  return (
    <nav
      className={cn(
        'p-4',
        className
      )}
      aria-label="Table of contents"
      role="navigation"
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-card-foreground">
        On This Page
      </h2>
      {tocList}
    </nav>
  )
}
