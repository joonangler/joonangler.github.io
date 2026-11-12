import { describe, expect, it } from 'vitest'
import { getActiveNavId, getNavItems, isNavReady } from '@/lib/site'

describe('site nav', () => {
  it('lists ready tabs in order', () => {
    expect(getNavItems().map((i) => i.label)).toEqual(['서비스', '블로그', '문의'])
  })
  it('knows which tabs are not ready yet', () => {
    expect(isNavReady('work')).toBe(false)
    expect(isNavReady('about')).toBe(false)
    expect(isNavReady('blog')).toBe(true)
  })
  it.each([
    ['/posts/', 'blog'],
    ['/posts/hello/', 'blog'],
    ['/tags/x/', 'blog'],
    ['/series/s/', 'blog'],
    ['/search/', 'blog'],
    ['/services/', 'services'],
    ['/services/web-app-fix/', 'services'],
    ['/contact/', 'contact'],
    ['/', null],
    ['/services-old/', null],
  ])('active tab of %s is %s', (p, id) => expect(getActiveNavId(p)).toBe(id))
})
