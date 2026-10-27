import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SeriesNavTop } from '@/components/post/SeriesNavTop'
import { createMockPost } from '../helpers/mockData'
import type { SeriesNavigation } from '@/types/post'

describe('SeriesNavTop', () => {
  it('links the series title to /series/<slug>', () => {
    const current = createMockPost({
      slug: 'slugged-series-1',
      series: '슬러그 픽스처 시리즈',
      seriesSlug: 'slugged-series',
    })
    const navigation: SeriesNavigation = {
      current,
      previous: null,
      next: null,
      series: {
        name: '슬러그 픽스처 시리즈',
        slug: 'slugged-series',
        count: 1,
        posts: [current],
        totalReadingTime: 1,
      },
    }

    render(<SeriesNavTop navigation={navigation} />)

    expect(
      screen.getByRole('link', { name: '슬러그 픽스처 시리즈' }).getAttribute('href')
    ).toBe('/series/slugged-series')
  })
})
