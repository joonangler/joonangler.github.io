import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import { TableOfContents } from '@/components/post/TableOfContents'

const toc = [{ id: 'one', text: '첫째', level: 2 }]

describe('TableOfContents', () => {
  beforeAll(() => {
    // useScrollSpy가 IntersectionObserver를 쓴다
    globalThis.IntersectionObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return [] }
    } as unknown as typeof IntersectionObserver
  })

  it('names the collapsible summary by its visible text, and the nav 목차', () => {
    render(<TableOfContents toc={toc} variant="collapsible" />)
    const summary = screen.getByText('목차').closest('summary')!
    expect(summary).toBeTruthy()
    // 보이는 글자가 이름이 되므로 별도 aria-label을 두지 않는다
    expect(summary.hasAttribute('aria-label')).toBe(false)
    expect(screen.getByRole('navigation', { name: '목차', hidden: true })).toBeTruthy()
  })

  it('titles the sticky variant 목차', () => {
    render(<TableOfContents toc={toc} variant="sticky" />)
    expect(screen.getByRole('heading', { name: '목차' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: '목차' })).toBeTruthy()
  })
})
