import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MDXLink } from '@/components/mdx/Link'

describe('MDXLink', () => {
  it('draws internal and external links with an underline and no palette color', () => {
    render(
      <>
        <MDXLink href="/posts/a/">안</MDXLink>
        <MDXLink href="https://example.org">밖</MDXLink>
      </>
    )
    for (const a of screen.getAllByRole('link')) {
      // 낱개 클래스로 센다 — hover:underline은 쉬는 모양에 밑줄이 없다
      const classes = a.className.split(/\s+/)
      expect(classes).toContain('underline')
      expect(classes).toContain('decoration-ink-3')
      expect(classes.filter((c) => /^(hover:)?text-blue/.test(c))).toEqual([])
    }
  })
})
