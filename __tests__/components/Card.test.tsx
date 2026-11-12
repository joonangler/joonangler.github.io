import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServiceCard, WorkCard } from '@/components/site/Card'
import { getServiceBySlug } from '@/lib/services'
import { getAllWork } from '@/lib/work'

const w = getAllWork()[0]
const s = getServiceBySlug('alpha')!

// jsdom의 next/link는 trailingSlash 설정을 몰라 href 끝의 /를 뗀다 — 끝 슬래시는 빼고 견준다(BlogSectionNav 시험과 같은 방식). 운영 빌드의 슬래시는 빌드 산출물 grep으로 본다.
describe('Card', () => {
  it('a work card without href is not a link', () => {
    render(<WorkCard work={w} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('a work card with href is a link and its cover is lazy with a size', () => {
    render(<WorkCard work={w} href="/work/one/" />)
    expect(screen.getByRole('link').getAttribute('href')!.replace(/\/$/, '')).toBe('/work/one')
    const img = screen.getByRole('img', { name: w.coverAlt })
    expect(img.getAttribute('loading')).toBe('lazy')
    expect(img.getAttribute('decoding')).toBe('async')
    expect(img.getAttribute('width')).toBe('1440')
    expect(img.getAttribute('height')).toBe('900')
  })

  it('service card shows the starting price', () => {
    render(<ServiceCard service={s} />)
    expect(screen.getByText('59,000원부터')).toBeTruthy()
    expect(screen.getByRole('link').getAttribute('href')!.replace(/\/$/, '')).toBe('/services/alpha')
    expect(screen.getByRole('heading', { name: s.title })).toBeTruthy()
  })
})
