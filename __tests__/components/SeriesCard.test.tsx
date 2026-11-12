import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeriesCard } from '@/components/series/SeriesCard'
import { createMockPost } from '../helpers/mockData'

describe('SeriesCard', () => {
  it('counts parts and reading time in Korean', () => {
    const posts = [1, 2].map((n) => createMockPost({ slug: `c-${n}`, series: 'c', seriesSlug: 'c', seriesOrder: n, date: `2025-01-0${n}` }))
    render(<SeriesCard series={{ name: '카드 시리즈', slug: 'c', count: 2, posts, totalReadingTime: 7 }} />)
    expect(screen.getByText('2편')).toBeTruthy()
    expect(screen.getByText('읽는 데 7분')).toBeTruthy()
    expect(screen.getByText('시작')).toBeTruthy()
    expect(screen.getByText('최근')).toBeTruthy()
  })
})
