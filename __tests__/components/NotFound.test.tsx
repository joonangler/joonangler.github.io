import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotFound, { metadata } from '@/app/not-found'

describe('404', () => {
  it('says so in Korean and has one way out — home', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { level: 1, name: '페이지를 찾을 수 없습니다' })).toBeTruthy()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0].textContent).toBe('홈으로')
    expect(links[0].getAttribute('href')).toBe('/')
  })

  // Next가 404에 noindex를 스스로 넣는다 — 루트 메타의 index, follow가 남으면 robots가 둘이 된다
  it('clears the inherited robots so only the injected noindex remains', () => {
    expect(metadata.robots).toBeNull()
  })
})
