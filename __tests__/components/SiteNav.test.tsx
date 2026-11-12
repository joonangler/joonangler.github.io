import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SiteNav } from '@/components/site/SiteNav'

vi.mock('next/navigation', () => ({ usePathname: () => '/posts/hello/' }))

describe('SiteNav', () => {
  it('marks the blog tab current on a post', () => {
    render(<SiteNav />)
    expect(screen.getByRole('link', { name: '블로그' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: '서비스' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('link', { name: 'Joonangler' }).getAttribute('href')).toBe('/')
  })
  it('toggles the menu', () => {
    render(<SiteNav />)
    const btn = screen.getByRole('button', { name: '메뉴' })
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-expanded')).toBe('true')
  })
})
