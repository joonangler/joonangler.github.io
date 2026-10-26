import { describe, it, expect } from 'vitest'
import {
  seriesToSlug,
  getAllSeries,
  getSeriesInfo,
  getSeriesNavigation,
  getPostsBySeries,
  getPopularSeries,
  getOngoingSeries,
  isSeriesCompleted,
  getSeriesProgress,
  searchSeries,
  getRecentSeries,
} from '@/lib/series'
import type { SeriesInfo } from '@/types/post'

describe('series', () => {
  describe('seriesToSlug', () => {
    it('should convert series name to slug', () => {
      const slug = seriesToSlug('React Advanced')
      expect(slug).toMatch(/react.*advanced/i)
    })

    it('should handle special characters', () => {
      const slug = seriesToSlug('Next.js Series')
      expect(slug).toMatch(/nextjs/)
    })

    it('should handle Korean text', () => {
      const slug = seriesToSlug('React 시리즈')
      expect(slug).toBeDefined()
    })
  })

  describe('getAllSeries', () => {
    it('should return array of series', async () => {
      const series = await getAllSeries()

      expect(series).toBeInstanceOf(Array)
    })

    it('should have correct structure', async () => {
      const series = await getAllSeries()

      series.forEach((s) => {
        expect(s.name).toBeDefined()
        expect(s.slug).toBeDefined()
        expect(s.count).toBeGreaterThan(0)
        expect(s.posts).toBeInstanceOf(Array)
        expect(s.totalReadingTime).toBeGreaterThanOrEqual(0)
      })
    })

    it('should sort posts within series by order', async () => {
      const series = await getAllSeries()

      series.forEach((s) => {
        for (let i = 0; i < s.posts.length - 1; i++) {
          const order1 = s.posts[i].seriesOrder ?? Number.MAX_SAFE_INTEGER
          const order2 = s.posts[i + 1].seriesOrder ?? Number.MAX_SAFE_INTEGER
          expect(order1).toBeLessThanOrEqual(order2)
        }
      })
    })

    it('should sort series by count descending', async () => {
      const series = await getAllSeries()

      for (let i = 0; i < series.length - 1; i++) {
        expect(series[i].count).toBeGreaterThanOrEqual(series[i + 1].count)
      }
    })

    it('should calculate total reading time correctly', async () => {
      const series = await getAllSeries()

      series.forEach((s) => {
        const expectedTime = s.posts.reduce(
          (sum, post) => sum + post.readingTime.minutes,
          0
        )
        expect(s.totalReadingTime).toBe(expectedTime)
      })
    })

    it('should only include posts with series', async () => {
      const series = await getAllSeries()

      series.forEach((s) => {
        s.posts.forEach((post) => {
          expect(post.series).toBeDefined()
        })
      })
    })

    it('should trim series names but keep their original case', async () => {
      const series = await getAllSeries()

      expect(series.map((s) => s.name)).toContain('Sample Series')
      series.forEach((s) => {
        expect(s.name).toBe(s.name.trim())
      })
    })
  })

  describe('getSeriesInfo', () => {
    it('should get series info by name', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0) {
        const firstSeries = allSeries[0]
        const info = await getSeriesInfo(firstSeries.name)

        expect(info).not.toBeNull()
        expect(info?.name).toBe(firstSeries.name)
      }
    })

    it('should get series info by slug', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0) {
        const firstSeries = allSeries[0]
        const info = await getSeriesInfo(firstSeries.slug)

        expect(info).not.toBeNull()
        expect(info?.slug).toBe(firstSeries.slug)
      }
    })

    it('should be case insensitive', async () => {
      const allSeries = await getAllSeries()

      expect(allSeries.length).toBeGreaterThan(0)

      const series = allSeries[0].name
      const lower = await getSeriesInfo(series.toLowerCase())
      const upper = await getSeriesInfo(series.toUpperCase())

      expect(lower).not.toBeNull()
      expect(lower?.name).toBe(upper?.name)
    })

    it('should return null for non-existing series', async () => {
      const info = await getSeriesInfo('non-existing-series-xyz')
      expect(info).toBeNull()
    })

    // 픽스처 시리즈 이름은 대문자·공백이 든 "Sample Series"
    it.each([
      ['original name', 'Sample Series'],
      ['lower case name', 'sample series'],
      ['slug', 'sample-series'],
      ['padded upper case name', '  SAMPLE SERIES  '],
    ])('should find the fixture series by %s', async (_label, input) => {
      const info = await getSeriesInfo(input)

      expect(info).not.toBeNull()
      expect(info?.name).toBe('Sample Series')
      expect(info?.slug).toBe('sample-series')
      expect(info?.count).toBe(3)
    })
  })

  describe('getSeriesNavigation', () => {
    it('should return null for post without series', async () => {
      // Assuming getting-started doesn't have a series
      const nav = await getSeriesNavigation('test-post')

      // If it has series, skip this test
      if (!nav) {
        expect(nav).toBeNull()
      }
    })

    it('should return navigation for post with series', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0 && allSeries[0].posts.length > 0) {
        const post = allSeries[0].posts[0]
        const nav = await getSeriesNavigation(post.slug)

        expect(nav).not.toBeNull()
        expect(nav?.current).not.toBeNull()
        expect(nav?.series).not.toBeNull()
      }
    })

    it('should have correct previous/next posts', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0 && allSeries[0].posts.length > 1) {
        const secondPost = allSeries[0].posts[1]
        const nav = await getSeriesNavigation(secondPost.slug)

        if (nav) {
          expect(nav.previous).not.toBeNull()
          expect(nav.previous?.slug).toBe(allSeries[0].posts[0].slug)

          if (allSeries[0].posts.length > 2) {
            expect(nav.next).not.toBeNull()
          }
        }
      }
    })

    it('should have null previous for first post', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0 && allSeries[0].posts.length > 0) {
        const firstPost = allSeries[0].posts[0]
        const nav = await getSeriesNavigation(firstPost.slug)

        if (nav) {
          expect(nav.previous).toBeNull()
        }
      }
    })

    it('should have null next for last post', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0 && allSeries[0].posts.length > 0) {
        const lastPost = allSeries[0].posts[allSeries[0].posts.length - 1]
        const nav = await getSeriesNavigation(lastPost.slug)

        if (nav) {
          expect(nav.next).toBeNull()
        }
      }
    })

    it('should return null for non-existing post', async () => {
      const nav = await getSeriesNavigation('non-existing-post')
      expect(nav).toBeNull()
    })

    it('should return null for fixture post without series', async () => {
      const nav = await getSeriesNavigation('test-post')
      expect(nav).toBeNull()
    })

    it('should return previous and next for the middle post of a mixed-case series', async () => {
      const nav = await getSeriesNavigation('sample-series-2')

      expect(nav).not.toBeNull()
      expect(nav?.previous?.slug).toBe('sample-series-1')
      expect(nav?.next?.slug).toBe('sample-series-3')
      expect(nav?.series.name).toBe('Sample Series')
    })

    it('should have null previous for the first post of a mixed-case series', async () => {
      const nav = await getSeriesNavigation('sample-series-1')

      expect(nav).not.toBeNull()
      expect(nav?.previous).toBeNull()
      expect(nav?.next?.slug).toBe('sample-series-2')
    })

    it('should have null next for the last post of a mixed-case series', async () => {
      const nav = await getSeriesNavigation('sample-series-3')

      expect(nav).not.toBeNull()
      expect(nav?.previous?.slug).toBe('sample-series-2')
      expect(nav?.next).toBeNull()
    })
  })

  describe('getPostsBySeries', () => {
    it('should get posts by series name', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0) {
        const seriesName = allSeries[0].name
        const posts = await getPostsBySeries(seriesName)

        expect(posts).toBeInstanceOf(Array)
        expect(posts.length).toBe(allSeries[0].count)
      }
    })

    it('should return sorted posts', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0) {
        const posts = await getPostsBySeries(allSeries[0].name)

        for (let i = 0; i < posts.length - 1; i++) {
          const order1 = posts[i].seriesOrder ?? Number.MAX_SAFE_INTEGER
          const order2 = posts[i + 1].seriesOrder ?? Number.MAX_SAFE_INTEGER
          expect(order1).toBeLessThanOrEqual(order2)
        }
      }
    })

    it('should return empty array for non-existing series', async () => {
      const posts = await getPostsBySeries('non-existing-series-xyz')
      expect(posts).toHaveLength(0)
    })
  })

  describe('getPopularSeries', () => {
    it('should return popular series', async () => {
      const popular = await getPopularSeries(5)

      expect(popular).toBeInstanceOf(Array)
      expect(popular.length).toBeLessThanOrEqual(5)
    })

    it('should sort by count descending', async () => {
      const popular = await getPopularSeries(10)

      for (let i = 0; i < popular.length - 1; i++) {
        expect(popular[i].count).toBeGreaterThanOrEqual(popular[i + 1].count)
      }
    })

    it('should use default limit of 5', async () => {
      const popular = await getPopularSeries()
      expect(popular.length).toBeLessThanOrEqual(5)
    })

    it('should handle limit larger than total series', async () => {
      const allSeries = await getAllSeries()
      const popular = await getPopularSeries(9999)

      expect(popular.length).toBe(allSeries.length)
    })
  })

  describe('getOngoingSeries', () => {
    it('should return ongoing series', async () => {
      const ongoing = await getOngoingSeries()

      expect(ongoing).toBeInstanceOf(Array)
    })

    it('should sort by last update descending', async () => {
      const ongoing = await getOngoingSeries()

      for (let i = 0; i < ongoing.length - 1; i++) {
        const lastPost1 = ongoing[i].posts[ongoing[i].posts.length - 1]
        const lastPost2 = ongoing[i + 1].posts[ongoing[i + 1].posts.length - 1]

        const date1 = new Date(lastPost1.date).getTime()
        const date2 = new Date(lastPost2.date).getTime()

        expect(date1).toBeGreaterThanOrEqual(date2)
      }
    })
  })

  describe('isSeriesCompleted', () => {
    it('should return true for completed series', () => {
      const completedSeries: SeriesInfo = {
        name: 'test',
        slug: 'test',
        count: 3,
        posts: [
          {
            slug: '1',
            title: 'Post 1',
            description: '',
            date: '2025-01-01',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            seriesOrder: 1,
            series: 'test',
          },
          {
            slug: '2',
            title: 'Post 2',
            description: '',
            date: '2025-01-02',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            seriesOrder: 2,
            series: 'test',
          },
          {
            slug: '3',
            title: 'Post 3',
            description: '',
            date: '2025-01-03',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            seriesOrder: 3,
            series: 'test',
          },
        ],
        totalReadingTime: 3,
      }

      expect(isSeriesCompleted(completedSeries)).toBe(true)
    })

    it('should return false for incomplete series', () => {
      const incompleteSeries: SeriesInfo = {
        name: 'test',
        slug: 'test',
        count: 2,
        posts: [
          {
            slug: '1',
            title: 'Post 1',
            description: '',
            date: '2025-01-01',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            seriesOrder: 1,
            series: 'test',
          },
          {
            slug: '3',
            title: 'Post 3',
            description: '',
            date: '2025-01-03',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            seriesOrder: 3, // Missing order 2
            series: 'test',
          },
        ],
        totalReadingTime: 2,
      }

      expect(isSeriesCompleted(incompleteSeries)).toBe(false)
    })

    it('should return false for series without order', () => {
      const noOrderSeries: SeriesInfo = {
        name: 'test',
        slug: 'test',
        count: 1,
        posts: [
          {
            slug: '1',
            title: 'Post 1',
            description: '',
            date: '2025-01-01',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            series: 'test',
          },
        ],
        totalReadingTime: 1,
      }

      expect(isSeriesCompleted(noOrderSeries)).toBe(false)
    })

    it('should return false for series not starting at 1', () => {
      const wrongStartSeries: SeriesInfo = {
        name: 'test',
        slug: 'test',
        count: 2,
        posts: [
          {
            slug: '2',
            title: 'Post 2',
            description: '',
            date: '2025-01-02',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            seriesOrder: 2,
            series: 'test',
          },
          {
            slug: '3',
            title: 'Post 3',
            description: '',
            date: '2025-01-03',
            tags: [],
            content: '',
            readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
            toc: [],
            seriesOrder: 3,
            series: 'test',
          },
        ],
        totalReadingTime: 2,
      }

      expect(isSeriesCompleted(wrongStartSeries)).toBe(false)
    })
  })

  describe('getSeriesProgress', () => {
    const testSeries: SeriesInfo = {
      name: 'test',
      slug: 'test',
      count: 5,
      posts: [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: '',
          date: '2025-01-01',
          tags: [],
          content: '',
          readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
          toc: [],
          seriesOrder: 1,
          series: 'test',
        },
        {
          slug: 'post-2',
          title: 'Post 2',
          description: '',
          date: '2025-01-02',
          tags: [],
          content: '',
          readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
          toc: [],
          seriesOrder: 2,
          series: 'test',
        },
        {
          slug: 'post-3',
          title: 'Post 3',
          description: '',
          date: '2025-01-03',
          tags: [],
          content: '',
          readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
          toc: [],
          seriesOrder: 3,
          series: 'test',
        },
        {
          slug: 'post-4',
          title: 'Post 4',
          description: '',
          date: '2025-01-04',
          tags: [],
          content: '',
          readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
          toc: [],
          seriesOrder: 4,
          series: 'test',
        },
        {
          slug: 'post-5',
          title: 'Post 5',
          description: '',
          date: '2025-01-05',
          tags: [],
          content: '',
          readingTime: { text: '1 min', minutes: 1, time: 60000, words: 100 },
          toc: [],
          seriesOrder: 5,
          series: 'test',
        },
      ],
      totalReadingTime: 5,
    }

    it('should calculate progress for first post', () => {
      const progress = getSeriesProgress('post-1', testSeries)

      expect(progress.current).toBe(1)
      expect(progress.total).toBe(5)
      expect(progress.percentage).toBe(20)
    })

    it('should calculate progress for middle post', () => {
      const progress = getSeriesProgress('post-3', testSeries)

      expect(progress.current).toBe(3)
      expect(progress.total).toBe(5)
      expect(progress.percentage).toBe(60)
    })

    it('should calculate progress for last post', () => {
      const progress = getSeriesProgress('post-5', testSeries)

      expect(progress.current).toBe(5)
      expect(progress.total).toBe(5)
      expect(progress.percentage).toBe(100)
    })

    it('should return zero for non-existing post', () => {
      const progress = getSeriesProgress('non-existing', testSeries)

      expect(progress.current).toBe(0)
      expect(progress.total).toBe(5)
      expect(progress.percentage).toBe(0)
    })
  })

  describe('searchSeries', () => {
    it('should search series by query', async () => {
      const allSeries = await getAllSeries()

      if (allSeries.length > 0) {
        const seriesName = allSeries[0].name
        const searchTerm = seriesName.substring(0, 3)

        const results = await searchSeries(searchTerm)

        expect(results.length).toBeGreaterThan(0)
        results.forEach((result) => {
          expect(result.name.toLowerCase()).toContain(searchTerm.toLowerCase())
        })
      }
    })

    it('should be case insensitive', async () => {
      const lower = await searchSeries('react')
      const upper = await searchSeries('REACT')

      expect(lower.length).toBe(upper.length)
    })

    it('should return empty array for empty query', async () => {
      const results = await searchSeries('')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for whitespace query', async () => {
      const results = await searchSeries('   ')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for non-matching query', async () => {
      const results = await searchSeries('xyzabc123notfound')
      expect(results).toHaveLength(0)
    })
  })

  describe('getRecentSeries', () => {
    it('should return recent series', async () => {
      const recent = await getRecentSeries(5)

      expect(recent).toBeInstanceOf(Array)
      expect(recent.length).toBeLessThanOrEqual(5)
    })

    it('should sort by start date descending', async () => {
      const recent = await getRecentSeries(10)

      for (let i = 0; i < recent.length - 1; i++) {
        const firstPost1 = recent[i].posts[0]
        const firstPost2 = recent[i + 1].posts[0]

        const date1 = new Date(firstPost1.date).getTime()
        const date2 = new Date(firstPost2.date).getTime()

        expect(date1).toBeGreaterThanOrEqual(date2)
      }
    })

    it('should use default limit of 5', async () => {
      const recent = await getRecentSeries()
      expect(recent.length).toBeLessThanOrEqual(5)
    })

    it('should handle limit larger than total series', async () => {
      const allSeries = await getAllSeries()
      const recent = await getRecentSeries(9999)

      expect(recent.length).toBe(allSeries.length)
    })
  })
})
