import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  className?: string
}

/**
 * 페이지네이션 컴포넌트
 *
 * URL 쿼리 파라미터를 사용하는 서버 사이드 페이지네이션 UI입니다.
 *
 * @example
 * <Pagination currentPage={1} totalPages={5} basePath="/posts" />
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  // 페이지 번호 생성 로직
  const getPageNumbers = () => {
    const pages: (number | '...')[] = []

    if (totalPages <= 7) {
      // 7페이지 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 7페이지 초과 시 생략 표시
      if (currentPage <= 3) {
        // 시작 부분
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        // 끝 부분
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // 중간 부분
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }

    return pages
  }

  const pages = getPageNumbers()

  const getPageUrl = (page: number) => {
    if (page === 1) {
      return basePath
    }
    return `${basePath}?page=${page}`
  }

  return (
    <nav
      className={cn('flex items-center justify-center gap-2', className)}
      aria-label="Pagination"
    >
      {/* 이전 페이지 */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-950">
          <ChevronLeft className="h-4 w-4" />
        </div>
      )}

      {/* 페이지 번호 */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 w-9 items-center justify-center text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          )
        }

        const isCurrentPage = page === currentPage

        return (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-md border font-medium transition-colors',
              isCurrentPage
                ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-600 dark:bg-blue-600'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
            aria-label={isCurrentPage ? `Current page ${page}` : `Go to page ${page}`}
            aria-current={isCurrentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        )
      })}

      {/* 다음 페이지 */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-950">
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </nav>
  )
}
