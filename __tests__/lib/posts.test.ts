import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  getPostsBySeries,
  getPaginatedPosts,
  searchPosts,
  getPostsByYear,
  getPostArchive,
  getSeriesNavigation,
  getPostsByAuthor,
  getPostStats,
  getRecentlyUpdatedPosts,
} from '@/lib/posts'

describe('posts', () => {
  describe('getPostsByTag', () => {
    it('should get posts by exact tag match', async () => {
      const posts = await getPostsByTag('nextjs')

      expect(posts).toBeInstanceOf(Array)
      posts.forEach((post) => {
        expect(post.tags.map((t) => t.toLowerCase())).toContain('nextjs')
      })
    })

    it('should be case insensitive', async () => {
      const lowerCase = await getPostsByTag('nextjs')
      const upperCase = await getPostsByTag('NEXTJS')
      const mixedCase = await getPostsByTag('NextJS')

      expect(lowerCase.length).toBe(upperCase.length)
      expect(lowerCase.length).toBe(mixedCase.length)
    })

    it('should return empty array for non-existing tag', async () => {
      const posts = await getPostsByTag('non-existing-tag-xyz')
      expect(posts).toHaveLength(0)
    })

    it('should return all matching posts', async () => {
      const posts = await getPostsByTag('nextjs')

      if (posts.length > 0) {
        posts.forEach((post) => {
          expect(post.slug).toBeDefined()
          expect(post.title).toBeDefined()
        })
      }
    })
  })

  describe('getPostsBySeries', () => {
    it('should get posts by series name', async () => {
      // First check if any post has series
      const allPosts = await getAllPosts()
      const seriesPost = allPosts.find((p) => p.series)

      if (seriesPost && seriesPost.series) {
        const seriesPosts = await getPostsBySeries(seriesPost.series)

        expect(seriesPosts.length).toBeGreaterThan(0)
        seriesPosts.forEach((post) => {
          expect(post.series?.toLowerCase()).toBe(
            seriesPost.series!.toLowerCase()
          )
        })
      }
    })

    it('should sort posts by series order', async () => {
      const allPosts = await getAllPosts()
      const seriesPost = allPosts.find((p) => p.series)

      if (seriesPost && seriesPost.series) {
        const seriesPosts = await getPostsBySeries(seriesPost.series)

        // Check if sorted by seriesOrder
        for (let i = 0; i < seriesPosts.length - 1; i++) {
          const order1 = seriesPosts[i].seriesOrder ?? Number.MAX_SAFE_INTEGER
          const order2 = seriesPosts[i + 1].seriesOrder ?? Number.MAX_SAFE_INTEGER
          expect(order1).toBeLessThanOrEqual(order2)
        }
      }
    })

    it('should be case insensitive', async () => {
      const allPosts = await getAllPosts()
      const seriesPost = allPosts.find((p) => p.series)

      if (seriesPost && seriesPost.series) {
        const lower = await getPostsBySeries(seriesPost.series.toLowerCase())
        const upper = await getPostsBySeries(seriesPost.series.toUpperCase())

        expect(lower.length).toBe(upper.length)
      }
    })

    it('should return empty array for non-existing series', async () => {
      const posts = await getPostsBySeries('non-existing-series-xyz')
      expect(posts).toHaveLength(0)
    })
  })

  describe('getPaginatedPosts', () => {
    it('should return paginated posts with metadata', async () => {
      const result = await getPaginatedPosts(1, 10)

      expect(result.posts).toBeInstanceOf(Array)
      expect(result.totalPages).toBeGreaterThanOrEqual(1)
      expect(result.currentPage).toBe(1)
      expect(result.totalPosts).toBeGreaterThan(0)
    })

    it('should respect posts per page limit', async () => {
      const postsPerPage = 2
      const result = await getPaginatedPosts(1, postsPerPage)

      expect(result.posts.length).toBeLessThanOrEqual(postsPerPage)
    })

    it('should handle different pages', async () => {
      const page1 = await getPaginatedPosts(1, 2)
      const page2 = await getPaginatedPosts(2, 2)

      if (page1.totalPages > 1) {
        expect(page1.posts[0].slug).not.toBe(page2.posts[0]?.slug)
      }
    })

    it('should calculate total pages correctly', async () => {
      const allPosts = await getAllPosts()
      const postsPerPage = 5
      const result = await getPaginatedPosts(1, postsPerPage)

      const expectedPages = Math.ceil(allPosts.length / postsPerPage)
      expect(result.totalPages).toBe(expectedPages)
    })

    it('should handle page beyond total pages', async () => {
      const result = await getPaginatedPosts(9999, 10)

      expect(result.currentPage).toBeLessThanOrEqual(result.totalPages)
      expect(result.posts).toBeInstanceOf(Array)
    })

    it('should handle page 0 or negative', async () => {
      const result = await getPaginatedPosts(0, 10)

      expect(result.currentPage).toBe(1)
    })

    it('should handle first page', async () => {
      const result = await getPaginatedPosts(1, 10)

      expect(result.currentPage).toBe(1)
      expect(result.posts.length).toBeGreaterThan(0)
    })
  })

  describe('searchPosts', () => {
    it('should search by title', async () => {
      const allPosts = await getAllPosts()
      if (allPosts.length > 0) {
        const firstTitle = allPosts[0].title
        const searchTerm = firstTitle.split(' ')[0] // First word

        const results = await searchPosts(searchTerm)

        expect(results.length).toBeGreaterThan(0)
      }
    })

    it('should search by tag', async () => {
      const allPosts = await getAllPosts()
      const postWithTags = allPosts.find((p) => p.tags.length > 0)

      if (postWithTags) {
        const tag = postWithTags.tags[0]
        const results = await searchPosts(tag)

        expect(results.length).toBeGreaterThan(0)
        expect(results.some((p) => p.tags.includes(tag))).toBe(true)
      }
    })

    it('should be case insensitive', async () => {
      const lower = await searchPosts('next')
      const upper = await searchPosts('NEXT')

      expect(lower.length).toBe(upper.length)
    })

    it('should return empty array for empty query', async () => {
      const results = await searchPosts('')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for whitespace query', async () => {
      const results = await searchPosts('   ')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for non-matching query', async () => {
      const results = await searchPosts('xyzabc123notfound')
      expect(results).toHaveLength(0)
    })

    it('should trim query whitespace', async () => {
      const trimmed = await searchPosts('next')
      const withSpaces = await searchPosts('  next  ')

      expect(trimmed.length).toBe(withSpaces.length)
    })
  })

  describe('getPostsByYear', () => {
    it('should group posts by year', async () => {
      const postsByYear = await getPostsByYear()

      expect(typeof postsByYear).toBe('object')
      expect(Object.keys(postsByYear).length).toBeGreaterThan(0)
    })

    it('should have year keys as strings', async () => {
      const postsByYear = await getPostsByYear()

      Object.keys(postsByYear).forEach((year) => {
        expect(year).toMatch(/^\d{4}$/)
      })
    })

    it('should have posts arrays as values', async () => {
      const postsByYear = await getPostsByYear()

      Object.values(postsByYear).forEach((posts) => {
        expect(posts).toBeInstanceOf(Array)
        posts.forEach((post) => {
          expect(post.slug).toBeDefined()
        })
      })
    })

    it('should group posts correctly by year', async () => {
      const postsByYear = await getPostsByYear()

      Object.entries(postsByYear).forEach(([year, posts]) => {
        posts.forEach((post) => {
          const postYear = new Date(post.date).getFullYear().toString()
          expect(postYear).toBe(year)
        })
      })
    })
  })

  describe('getPostArchive', () => {
    it('should return archive with year/month grouping', async () => {
      const archive = await getPostArchive()

      expect(archive).toBeInstanceOf(Array)
      archive.forEach((item) => {
        expect(item.year).toBeDefined()
        expect(item.month).toBeDefined()
        expect(item.count).toBeGreaterThan(0)
        expect(item.posts).toBeInstanceOf(Array)
        expect(item.posts.length).toBe(item.count)
      })
    })

    it('should sort by year and month descending', async () => {
      const archive = await getPostArchive()

      for (let i = 0; i < archive.length - 1; i++) {
        const current = archive[i]
        const next = archive[i + 1]

        if (current.year === next.year) {
          expect(current.month).toBeGreaterThanOrEqual(next.month)
        } else {
          expect(current.year).toBeGreaterThan(next.year)
        }
      }
    })

    it('should have valid month numbers (1-12)', async () => {
      const archive = await getPostArchive()

      archive.forEach((item) => {
        expect(item.month).toBeGreaterThanOrEqual(1)
        expect(item.month).toBeLessThanOrEqual(12)
      })
    })

    it('should group posts correctly', async () => {
      const archive = await getPostArchive()

      archive.forEach((item) => {
        item.posts.forEach((post) => {
          const date = new Date(post.date)
          expect(date.getFullYear()).toBe(item.year)
          expect(date.getMonth() + 1).toBe(item.month)
        })
      })
    })
  })

  describe('getSeriesNavigation', () => {
    it('should return null for post without series', async () => {
      const allPosts = await getAllPosts()
      const postWithoutSeries = allPosts.find((p) => !p.series)

      if (postWithoutSeries) {
        const nav = await getSeriesNavigation(postWithoutSeries.slug)
        expect(nav).toBeNull()
      }
    })

    it('should return navigation for post with series', async () => {
      const allPosts = await getAllPosts()
      const postWithSeries = allPosts.find((p) => p.series)

      if (postWithSeries) {
        const nav = await getSeriesNavigation(postWithSeries.slug)

        expect(nav).not.toBeNull()
        expect(nav?.current).not.toBeNull()
        expect(nav?.seriesPosts).toBeInstanceOf(Array)
      }
    })

    it('should have correct previous/next posts', async () => {
      const allPosts = await getAllPosts()
      const postWithSeries = allPosts.find((p) => p.series)

      if (postWithSeries) {
        const nav = await getSeriesNavigation(postWithSeries.slug)

        if (nav) {
          const currentIndex = nav.seriesPosts.findIndex(
            (p) => p.slug === postWithSeries.slug
          )

          if (currentIndex > 0) {
            expect(nav.previous).not.toBeNull()
            expect(nav.previous?.slug).toBe(nav.seriesPosts[currentIndex - 1].slug)
          } else {
            expect(nav.previous).toBeNull()
          }

          if (currentIndex < nav.seriesPosts.length - 1) {
            expect(nav.next).not.toBeNull()
            expect(nav.next?.slug).toBe(nav.seriesPosts[currentIndex + 1].slug)
          } else {
            expect(nav.next).toBeNull()
          }
        }
      }
    })

    it('should return null for non-existing post', async () => {
      const nav = await getSeriesNavigation('non-existing-post')
      expect(nav).toBeNull()
    })
  })

  describe('getPostsByAuthor', () => {
    it('should get posts by author', async () => {
      const allPosts = await getAllPosts()
      const postWithAuthor = allPosts.find((p) => p.author)

      if (postWithAuthor && postWithAuthor.author) {
        const authorPosts = await getPostsByAuthor(postWithAuthor.author)

        expect(authorPosts.length).toBeGreaterThan(0)
        authorPosts.forEach((post) => {
          expect(post.author?.toLowerCase()).toBe(
            postWithAuthor.author!.toLowerCase()
          )
        })
      }
    })

    it('should be case insensitive', async () => {
      const allPosts = await getAllPosts()
      const postWithAuthor = allPosts.find((p) => p.author)

      if (postWithAuthor && postWithAuthor.author) {
        const lower = await getPostsByAuthor(postWithAuthor.author.toLowerCase())
        const upper = await getPostsByAuthor(postWithAuthor.author.toUpperCase())

        expect(lower.length).toBe(upper.length)
      }
    })

    it('should return empty array for non-existing author', async () => {
      const posts = await getPostsByAuthor('non-existing-author-xyz')
      expect(posts).toHaveLength(0)
    })
  })

  describe('getPostStats', () => {
    it('should return correct statistics', async () => {
      const stats = await getPostStats()

      expect(stats.totalPosts).toBeGreaterThan(0)
      expect(stats.totalWords).toBeGreaterThan(0)
      expect(stats.totalReadingMinutes).toBeGreaterThan(0)
      expect(stats.averageReadingTime).toBeGreaterThanOrEqual(0)
      expect(stats.tagCount).toBeGreaterThanOrEqual(0)
      expect(stats.seriesCount).toBeGreaterThanOrEqual(0)
    })

    it('should calculate average correctly', async () => {
      const allPosts = await getAllPosts()
      const stats = await getPostStats()

      const totalMinutes = allPosts.reduce(
        (sum, post) => sum + post.readingTime.minutes,
        0
      )
      const expectedAverage = Math.round(totalMinutes / allPosts.length)

      expect(stats.averageReadingTime).toBe(expectedAverage)
    })

    it('should count unique tags', async () => {
      const allPosts = await getAllPosts()
      const stats = await getPostStats()

      const uniqueTags = new Set<string>()
      allPosts.forEach((post) => {
        post.tags.forEach((tag) => uniqueTags.add(tag.toLowerCase()))
      })

      expect(stats.tagCount).toBe(uniqueTags.size)
    })

    it('should count unique series', async () => {
      const allPosts = await getAllPosts()
      const stats = await getPostStats()

      const uniqueSeries = new Set<string>()
      allPosts.forEach((post) => {
        if (post.series) {
          uniqueSeries.add(post.series.toLowerCase())
        }
      })

      expect(stats.seriesCount).toBe(uniqueSeries.size)
    })
  })

  describe('getRecentlyUpdatedPosts', () => {
    it('should return limited number of posts', async () => {
      const limit = 3
      const posts = await getRecentlyUpdatedPosts(limit)

      expect(posts.length).toBeLessThanOrEqual(limit)
    })

    it('should use default limit of 5', async () => {
      const posts = await getRecentlyUpdatedPosts()

      expect(posts.length).toBeLessThanOrEqual(5)
    })

    it('should return posts array', async () => {
      const posts = await getRecentlyUpdatedPosts()

      expect(posts).toBeInstanceOf(Array)
      posts.forEach((post) => {
        expect(post.slug).toBeDefined()
        expect(post.title).toBeDefined()
      })
    })

    it('should handle limit larger than total posts', async () => {
      const posts = await getRecentlyUpdatedPosts(9999)
      const allPosts = await getAllPosts()

      expect(posts.length).toBe(allPosts.length)
    })
  })
})
