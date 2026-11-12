import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Pagination } from '@/components/ui/Pagination'

describe('Pagination', () => {
  it('labels the navigation and every control in Korean', () => {
    render(<Pagination currentPage={2} totalPages={3} basePath="/posts" />)
    expect(screen.getByRole('navigation', { name: '페이지 이동' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '이전 페이지' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '다음 페이지' })).toBeTruthy()
    const current = screen.getByRole('link', { name: '2페이지, 현재 페이지' })
    expect(current.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: '3페이지로 이동' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '1페이지로 이동' })).toBeTruthy()
  })
})
