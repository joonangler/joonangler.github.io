import NextLink from 'next/link'
import { type AnchorHTMLAttributes } from 'react'
import { cn, isSafeUrl } from '@/lib/utils'

interface MDXLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
}

/**
 * MDX 링크 컴포넌트
 * - 내부 링크: Next.js Link 사용
 * - 외부 링크: 새 탭 열기 + 아이콘 표시
 * - XSS 방어: 위험한 URL 차단
 */
export function MDXLink({ href, children, className, ...props }: MDXLinkProps) {
  // URL 안전성 검증 (XSS 방어)
  if (!isSafeUrl(href)) {
    console.warn(`[MDX Link] Unsafe URL blocked: ${href}`)
    return (
      <span className={cn('text-red-600 dark:text-red-400', className)}>
        {children} (unsafe link removed)
      </span>
    )
  }

  // 외부 링크 판별
  const isExternal = href.startsWith('http://') || href.startsWith('https://')
  const isAnchor = href.startsWith('#')

  // 공통 스타일
  const linkClassName = cn(
    'font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
    className
  )

  // 외부 링크
  if (isExternal) {
    return (
      <a
        href={href}
        className={cn(linkClassName, 'inline-flex items-center gap-1')}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
        <svg
          className="inline-block h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        <span className="sr-only">(새 탭에서 열림)</span>
      </a>
    )
  }

  // 앵커 링크 (#로 시작)
  if (isAnchor) {
    return (
      <a href={href} className={linkClassName} {...props}>
        {children}
      </a>
    )
  }

  // 내부 링크
  return (
    <NextLink href={href} className={linkClassName} {...props}>
      {children}
    </NextLink>
  )
}
