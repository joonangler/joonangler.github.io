'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { label: '글', href: '/posts/', prefix: '/posts' },
  { label: '시리즈', href: '/series/', prefix: '/series' },
  { label: '태그', href: '/tags/', prefix: '/tags' },
  { label: '검색', href: '/search/', prefix: '/search' },
] as const

function isIn(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/**
 * 블로그 구역 머리 — 이름과 둘째 줄(글·시리즈·태그·검색).
 * 사이트 내비가 블로그 안의 하위 길을 갖지 않으므로 여기서 보인다.
 */
export function BlogSectionNav() {
  const pathname = usePathname() ?? ''

  return (
    <div className="border-b border-border">
      <Container className="py-4">
        <Link
          href="/posts/"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          {SITE_CONFIG.blogName}
        </Link>
        <nav aria-label="블로그" className="mt-3 flex gap-6 text-sm">
          {SECTIONS.map((s) => {
            const active = isIn(pathname, s.prefix)
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'transition-colors hover:text-foreground',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </Link>
            )
          })}
        </nav>
      </Container>
    </div>
  )
}
