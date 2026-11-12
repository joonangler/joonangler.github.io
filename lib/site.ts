/**
 * 사이트 틀의 탭 목록. 탭 이름·주소·준비 여부는 여기 한 곳에서 정한다.
 */

export const SITE_TITLE = 'Joonangler'

export type NavId = 'services' | 'work' | 'blog' | 'about' | 'contact'

export interface NavItem {
  id: NavId
  label: string
  href: string
  ready: boolean
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'services', label: '서비스', href: '/services/', ready: true },
  { id: 'work', label: '작업', href: '/work/', ready: false },
  { id: 'blog', label: '블로그', href: '/posts/', ready: true },
  { id: 'about', label: '소개', href: '/about/', ready: false },
  { id: 'contact', label: '문의', href: '/contact/', ready: true },
]

const BLOG_PREFIXES = ['/posts', '/series', '/tags', '/search']

export function getNavItems(): NavItem[] {
  return NAV_ITEMS.filter((item) => item.ready)
}

export function isNavReady(id: NavId): boolean {
  return NAV_ITEMS.some((item) => item.id === id && item.ready)
}

function startsWithSegment(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/** 지금 경로가 속한 탭. 접두어는 경로 조각 단위로 본다(`/services-old/`는 서비스가 아니다). */
export function getActiveNavId(pathname: string): NavId | null {
  if (BLOG_PREFIXES.some((p) => startsWithSegment(pathname, p))) return 'blog'
  for (const item of NAV_ITEMS) {
    if (item.id === 'blog') continue
    const base = item.href.replace(/\/$/, '')
    if (startsWithSegment(pathname, base)) return item.id
  }
  return null
}
