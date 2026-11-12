import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeriesNavTop } from '@/components/post/SeriesNavTop'
import { SeriesNavBottom } from '@/components/post/SeriesNavBottom'
import { createMockPost } from '../helpers/mockData'
import type { SeriesNavigation } from '@/types/post'

const posts = [1, 2, 3].map((n) =>
  createMockPost({ slug: `s-${n}`, title: `시리즈 ${n}편 제목`, series: '시험 시리즈', seriesSlug: 's', seriesOrder: n })
)
const nav = (i: number): SeriesNavigation => ({
  current: posts[i],
  previous: posts[i - 1] ?? null,
  next: posts[i + 1] ?? null,
  series: { name: '시험 시리즈', slug: 's', count: 3, posts, totalReadingTime: 3 },
})

describe('SeriesNavTop', () => {
  it('reads 시리즈 and {i} / {n}편, and marks the current post 읽는 중', () => {
    render(<SeriesNavTop navigation={nav(1)} />)
    expect(screen.getByText('시리즈')).toBeTruthy()
    expect(screen.getByText('2 / 3편')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '이 시리즈의 글 모두 보기' }))
    expect(screen.getByText('읽는 중')).toBeTruthy()
  })
})

describe('SeriesNavBottom', () => {
  it('names previous, next and the part numbers in Korean', () => {
    render(<SeriesNavBottom navigation={nav(1)} />)
    expect(screen.getByText('이전 글')).toBeTruthy()
    expect(screen.getByText('다음 글')).toBeTruthy()
    expect(screen.getByText('1편')).toBeTruthy()
    expect(screen.getByText('3편')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '이 시리즈의 글 모두 보기' }))
    expect(screen.getByText('읽는 중')).toBeTruthy()
  })

  it('says so at the first and last post', () => {
    const { unmount } = render(<SeriesNavBottom navigation={nav(0)} />)
    expect(screen.getByText('첫 글입니다')).toBeTruthy()
    unmount()
    render(<SeriesNavBottom navigation={nav(2)} />)
    expect(screen.getByText('마지막 글입니다')).toBeTruthy()
  })
})
