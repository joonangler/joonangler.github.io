import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeWork } from '@/components/home/HomeWork'
import { HomeServices } from '@/components/home/HomeServices'
import { getAllServices } from '@/lib/services'
import { getAllWork } from '@/lib/work'

const works = getAllWork()

// jsdom의 next/link는 trailingSlash 설정을 몰라 href 끝의 /를 뗀다 — 끝 슬래시는 빼고 견준다(BlogSectionNav 시험과 같은 방식). 운영 빌드의 슬래시는 빌드 산출물 grep으로 본다.
describe('HomeWork', () => {
  it('hides the work list link until the work tab is ready', () => {
    render(<HomeWork works={[works[0]]} />)
    expect(screen.queryByText('작업 전체 보기')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('heading', { name: '직접 만들어 운영하는 것' })).toBeTruthy()
  })

  it('draws nothing without work', () => {
    const { container } = render(<HomeWork works={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('draws only the cards it was given — no placeholder card', () => {
    render(<HomeWork works={[works[0]]} />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(screen.queryByText('이 홈페이지')).toBeNull()
  })
})

describe('HomeServices', () => {
  it('draws one card per service and links to all services', () => {
    const services = getAllServices()
    render(<HomeServices services={services} />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(services.length)
    expect(screen.getByRole('link', { name: '서비스 전체 보기' }).getAttribute('href')!.replace(/\/$/, '')).toBe('/services')
  })

  it('draws nothing without services', () => {
    const { container } = render(<HomeServices services={[]} />)
    expect(container.innerHTML).toBe('')
  })
})
