import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BlogSectionNav } from '@/components/blog/BlogSectionNav'

const nav = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname }))

const current = () =>
  screen
    .getAllByRole('link')
    .filter((a) => a.getAttribute('aria-current') === 'page')
    .map((a) => a.textContent)

describe('BlogSectionNav', () => {
  beforeEach(() => {
    nav.pathname = '/'
  })

  it('marks only 시리즈 on a series page', () => {
    nav.pathname = '/series/sample-series/'
    render(<BlogSectionNav />)
    expect(current()).toEqual(['시리즈'])
  })
  it('marks only 글 on a post page', () => {
    nav.pathname = '/posts/hello/'
    render(<BlogSectionNav />)
    expect(current()).toEqual(['글'])
  })
  it('marks 태그 and 검색 on their pages', () => {
    nav.pathname = '/tags/x/'
    const { unmount } = render(<BlogSectionNav />)
    expect(current()).toEqual(['태그'])
    unmount()
    nav.pathname = '/search/'
    render(<BlogSectionNav />)
    expect(current()).toEqual(['검색'])
  })
  it('links the blog name to /posts/ and lists the four sections', () => {
    nav.pathname = '/posts/'
    render(<BlogSectionNav />)
    // jsdom에는 next.config의 trailingSlash가 없어 Link가 끝 슬래시를 뗀다 — 끝 슬래시는 무시하고 비교한다
    const href = (n: string) => screen.getByRole('link', { name: n }).getAttribute('href')!.replace(/\/$/, '')
    expect(href('Joonangler.log')).toBe('/posts')
    expect(['글', '시리즈', '태그', '검색'].map(href)).toEqual(['/posts', '/series', '/tags', '/search'])
  })
})
