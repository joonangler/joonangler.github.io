import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import ServicesPage from '@/app/services/page'
import { PageBand } from '@/components/site/PageBand'

// jsdom의 next/link는 trailingSlash를 몰라 href 끝의 /를 뗀다 — 끝 슬래시는 빼고 견준다.
const href = (el: HTMLElement) => el.getAttribute('href')!.replace(/\/$/, '')

describe('PageBand', () => {
  it('draws the title as the h1 with a lead and a decorative canvas', () => {
    render(<PageBand title="서비스" lead="한 문장" />)
    expect(screen.getByRole('heading', { level: 1, name: '서비스' })).toBeTruthy()
    expect(screen.getByText('한 문장')).toBeTruthy()
    expect(document.querySelector('canvas')!.className).toContain('dot-mask-band')
  })
})

describe('ServicesPage', () => {
  it('has the h1 서비스', () => {
    render(<ServicesPage />)
    expect(screen.getByRole('heading', { level: 1, name: '서비스' })).toBeTruthy()
  })

  it('lists service cards in fixture order', () => {
    render(<ServicesPage />)
    const cards = screen
      .getAllByRole('link')
      .map(href)
      .filter((h) => h.startsWith('/services/'))
    expect(cards).toEqual(['/services/alpha', '/services/beta'])
  })

  it('writes four working principles as an unnumbered list', () => {
    render(<ServicesPage />)
    const heading = screen.getByRole('heading', { name: '일하는 방식' })
    const list = heading.closest('section')!.querySelector('ul, ol')!
    expect(list.tagName).toBe('UL')
    expect(within(list as HTMLElement).getAllByRole('listitem')).toHaveLength(4)
  })

  it('writes two things it does not do', () => {
    render(<ServicesPage />)
    const heading = screen.getByRole('heading', { name: '하지 않는 일' })
    const list = heading.closest('section')!.querySelector('ul')!
    expect(within(list as HTMLElement).getAllByRole('listitem')).toHaveLength(2)
  })

  it('has exactly one link to contact', () => {
    render(<ServicesPage />)
    expect(screen.getAllByRole('link').filter((a) => href(a) === '/contact')).toHaveLength(1)
  })
})
