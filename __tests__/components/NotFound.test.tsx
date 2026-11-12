import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

describe('404', () => {
  it('says so in Korean and has one way out — home', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' })).toBeTruthy()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0].textContent).toBe('홈으로')
    expect(links[0].getAttribute('href')).toBe('/')
  })
})
