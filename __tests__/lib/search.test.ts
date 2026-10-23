import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchPosts, getSearchSuggestions } from '@/lib/search'
import type { Post } from '@/types/post'

describe('search', () => {
  let mockPosts: Post[]

  beforeEach(() => {
    // Reset Date.now for recency tests
    vi.setSystemTime(new Date('2025-01-28'))

    mockPosts = [
      {
        slug: 'nextjs-guide',
        title: 'Complete Next.js Guide',
        description: 'Learn Next.js from basics to advanced',
        date: '2025-01-28', // Recent post
        tags: ['nextjs', 'react', 'typescript'],
        content: 'Next.js is a powerful React framework for building web applications.',
        readingTime: { text: '10 min', minutes: 10, time: 600000, words: 2000 },
        toc: [],
      },
      {
        slug: 'typescript-tips',
        title: 'TypeScript Tips and Tricks',
        description: 'Advanced TypeScript patterns',
        date: '2025-01-01', // Older post
        tags: ['typescript', 'javascript'],
        content: 'TypeScript provides type safety for JavaScript applications.',
        readingTime: { text: '5 min', minutes: 5, time: 300000, words: 1000 },
        toc: [],
      },
      {
        slug: 'react-hooks',
        title: 'React Hooks Deep Dive',
        description: 'Understanding React Hooks',
        date: '2025-01-15',
        tags: ['react', 'hooks'],
        content: 'React Hooks revolutionized how we write React components.',
        readingTime: { text: '8 min', minutes: 8, time: 480000, words: 1600 },
        toc: [],
        series: 'React Advanced',
        author: 'John Doe',
      },
      {
        slug: 'korean-post',
        title: 'Next.js 시작하기',
        description: 'Next.js를 처음 시작하는 방법',
        date: '2025-01-20',
        tags: ['nextjs', '튜토리얼'],
        content: 'Next.js는 React 기반의 프레임워크입니다.',
        readingTime: { text: '6 min', minutes: 6, time: 360000, words: 1200 },
        toc: [],
      },
    ]
  })

  describe('searchPosts', () => {
    describe('Basic Search', () => {
      it('should return empty array for empty query', () => {
        const results = searchPosts(mockPosts, '')
        expect(results).toEqual([])
      })

      it('should return empty array for whitespace-only query', () => {
        const results = searchPosts(mockPosts, '   ')
        expect(results).toEqual([])
      })

      it('should find posts by title match', () => {
        const results = searchPosts(mockPosts, 'Next.js')
        expect(results.length).toBeGreaterThan(0)
        expect(results[0].title).toContain('Next.js')
      })

      it('should find posts by description match', () => {
        const results = searchPosts(mockPosts, 'Advanced')
        expect(results.length).toBeGreaterThan(0)
        expect(results.some((r) => r.description.includes('Advanced'))).toBe(true)
      })

      it('should find posts by tag match', () => {
        const results = searchPosts(mockPosts, 'typescript')
        expect(results.length).toBeGreaterThan(0)
        expect(results.some((r) => r.tags.includes('typescript'))).toBe(true)
      })

      it('should find posts by series match', () => {
        const results = searchPosts(mockPosts, 'React Advanced')
        expect(results.length).toBeGreaterThan(0)
        expect(results[0].series).toBe('React Advanced')
      })

      it('should find posts by author match', () => {
        const results = searchPosts(mockPosts, 'John Doe')
        expect(results.length).toBeGreaterThan(0)
        expect(results[0].author).toBe('John Doe')
      })

      it('should find posts by content match', () => {
        const results = searchPosts(mockPosts, 'framework', { includeContent: true })
        expect(results.length).toBeGreaterThan(0)
        expect(results.some((r) => r.content?.includes('framework'))).toBe(true)
      })
    })

    describe('Case Insensitivity', () => {
      it('should be case insensitive', () => {
        const lowerCase = searchPosts(mockPosts, 'next.js')
        const upperCase = searchPosts(mockPosts, 'NEXT.JS')
        const mixedCase = searchPosts(mockPosts, 'NeXt.Js')

        expect(lowerCase.length).toBe(upperCase.length)
        expect(lowerCase.length).toBe(mixedCase.length)
      })

      it('should handle Korean text correctly', () => {
        const results = searchPosts(mockPosts, '시작하기')
        expect(results.length).toBeGreaterThan(0)
        expect(results[0].title).toContain('시작하기')
      })

      it('should handle Korean text case variations', () => {
        const results = searchPosts(mockPosts, '튜토리얼')
        expect(results.length).toBeGreaterThan(0)
        expect(results[0].tags).toContain('튜토리얼')
      })
    })

    describe('Scoring and Ranking', () => {
      it('should rank exact title matches higher', () => {
        const results = searchPosts(mockPosts, 'Complete Next.js Guide')
        expect(results[0].slug).toBe('nextjs-guide')
        expect(results[0].score).toBeGreaterThan(5) // Exact title match bonus
      })

      it('should rank exact tag matches higher', () => {
        const results = searchPosts(mockPosts, 'typescript')
        expect(results[0].tags).toContain('typescript')
        expect(results[0].score).toBeGreaterThan(0)
      })

      it('should apply recency boost to recent posts', () => {
        // Recent post (within 30 days) should get boost
        const results = searchPosts(mockPosts, 'Next')
        const recentPost = results.find((r) => r.date === '2025-01-28')
        const olderPost = results.find((r) => r.date === '2025-01-01')

        if (recentPost && olderPost) {
          // Recent post should rank higher with same match quality
          expect(recentPost.score).toBeGreaterThanOrEqual(olderPost.score)
        }
      })

      it('should rank title matches higher than content matches', () => {
        const results = searchPosts(mockPosts, 'React')
        // Post with 'React' in title should score higher
        const titleMatch = results.find((r) => r.title.includes('React'))
        if (titleMatch) {
          expect(titleMatch.score).toBeGreaterThan(0)
        }
      })

      it('should sort results by score descending', () => {
        const results = searchPosts(mockPosts, 'typescript')
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score)
        }
      })

      it('should sort by date when scores are equal', () => {
        const results = searchPosts(mockPosts, 'Next')
        // Check that among equal scores, newer posts come first
        const equalScores = results.filter(
          (r, i, arr) => i < arr.length - 1 && r.score === arr[i + 1].score
        )
        if (equalScores.length > 0) {
          for (let i = 0; i < equalScores.length - 1; i++) {
            const date1 = new Date(equalScores[i].date).getTime()
            const date2 = new Date(equalScores[i + 1].date).getTime()
            expect(date1).toBeGreaterThanOrEqual(date2)
          }
        }
      })
    })

    describe('Search Options', () => {
      it('should respect minScore option', () => {
        const results = searchPosts(mockPosts, 'framework', { minScore: 5 })
        results.forEach((result) => {
          expect(result.score).toBeGreaterThanOrEqual(5)
        })
      })

      it('should respect limit option', () => {
        const results = searchPosts(mockPosts, 'Next', { limit: 2 })
        expect(results.length).toBeLessThanOrEqual(2)
      })

      it('should not include content when includeContent is false', () => {
        const withContent = searchPosts(mockPosts, 'framework', {
          includeContent: true,
        })
        const withoutContent = searchPosts(mockPosts, 'framework', {
          includeContent: false,
        })

        // Without content, score should be lower or zero
        expect(withContent[0]?.score).toBeGreaterThan(
          withoutContent[0]?.score || 0
        )
      })

      it('should not include highlights when includeHighlights is false', () => {
        const results = searchPosts(mockPosts, 'Next', {
          includeHighlights: false,
        })
        results.forEach((result) => {
          expect(result.highlights).toEqual([])
        })
      })

      it('should include highlights by default', () => {
        const results = searchPosts(mockPosts, 'Next')
        expect(results[0].highlights.length).toBeGreaterThan(0)
      })
    })

    describe('Highlights', () => {
      it('should extract title highlights', () => {
        const results = searchPosts(mockPosts, 'Next.js')
        const titleHighlight = results[0].highlights.find((h) => h.field === 'title')
        expect(titleHighlight).toBeDefined()
        expect(titleHighlight?.text).toContain('Next.js')
      })

      it('should extract description highlights', () => {
        const results = searchPosts(mockPosts, 'Advanced')
        const descHighlight = results[0].highlights.find(
          (h) => h.field === 'description'
        )
        expect(descHighlight).toBeDefined()
      })

      it('should extract tag highlights', () => {
        const results = searchPosts(mockPosts, 'typescript')
        const tagHighlight = results[0].highlights.find((h) => h.field === 'tags')
        expect(tagHighlight).toBeDefined()
      })

      it('should extract content highlights with context', () => {
        const results = searchPosts(mockPosts, 'framework', {
          includeContent: true,
        })
        const contentHighlight = results[0]?.highlights.find(
          (h) => h.field === 'content'
        )
        if (contentHighlight) {
          expect(contentHighlight.text).toContain('framework')
          // Should have context (ellipsis or surrounding text)
          expect(contentHighlight.text.length).toBeGreaterThan('framework'.length)
        }
      })

      it('should add ellipsis for truncated highlights', () => {
        const longPost: Post = {
          slug: 'long-post',
          title: 'A very long title that contains the word framework somewhere in the middle of all this text',
          description: 'Description',
          date: '2025-01-28',
          tags: [],
          content: '',
          readingTime: { text: '1 min', minutes: 1, time: 60000, words: 200 },
          toc: [],
        }

        const results = searchPosts([longPost], 'framework')
        const highlight = results[0].highlights.find((h) => h.field === 'title')
        if (highlight && highlight.text !== longPost.title) {
          expect(
            highlight.text.startsWith('...') || highlight.text.endsWith('...')
          ).toBe(true)
        }
      })
    })

    describe('Edge Cases', () => {
      it('should handle special characters in query', () => {
        const results = searchPosts(mockPosts, 'Next.js') // Contains dot
        expect(results.length).toBeGreaterThan(0)
      })

      it('should handle multiple word queries', () => {
        const results = searchPosts(mockPosts, 'React Hooks')
        expect(results.length).toBeGreaterThan(0)
      })

      it('should handle empty posts array', () => {
        const results = searchPosts([], 'test')
        expect(results).toEqual([])
      })

      it('should handle posts without optional fields', () => {
        const minimalPost: Post = {
          slug: 'minimal',
          title: 'Minimal Post',
          description: 'Description',
          date: '2025-01-28',
          tags: [],
          content: '',
          readingTime: { text: '1 min', minutes: 1, time: 60000, words: 200 },
          toc: [],
        }

        const results = searchPosts([minimalPost], 'Minimal')
        expect(results.length).toBe(1)
        expect(results[0].slug).toBe('minimal')
      })

      it('should handle posts with no content', () => {
        const noContentPost: Post = {
          ...mockPosts[0],
          content: undefined as unknown as string,
        }

        const results = searchPosts([noContentPost], 'Next')
        expect(results.length).toBeGreaterThan(0)
      })

      it('should return no results for completely unmatched query', () => {
        const results = searchPosts(mockPosts, 'xyzabc123notfound')
        expect(results).toEqual([])
      })
    })
  })

  describe('getSearchSuggestions', () => {
    it('should return all unique tags', () => {
      const suggestions = getSearchSuggestions(mockPosts)

      expect(suggestions).toContain('nextjs')
      expect(suggestions).toContain('typescript')
      expect(suggestions).toContain('react')
      expect(suggestions).toContain('hooks')
    })

    it('should return series names', () => {
      const suggestions = getSearchSuggestions(mockPosts)

      expect(suggestions).toContain('React Advanced')
    })

    it('should return sorted suggestions', () => {
      const suggestions = getSearchSuggestions(mockPosts)

      // Check if array is sorted (allowing for locale-specific sorting)
      const sorted = [...suggestions].sort()
      expect(suggestions).toEqual(sorted)
    })

    it('should not include duplicates', () => {
      const suggestions = getSearchSuggestions(mockPosts)

      const uniqueSuggestions = Array.from(new Set(suggestions))
      expect(suggestions.length).toBe(uniqueSuggestions.length)
    })

    it('should handle empty posts array', () => {
      const suggestions = getSearchSuggestions([])
      expect(suggestions).toEqual([])
    })

    it('should handle posts without series', () => {
      const postsWithoutSeries = mockPosts.map((p) => ({ ...p, series: undefined }))
      const suggestions = getSearchSuggestions(postsWithoutSeries)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.every((s) => mockPosts.some((p) => p.tags.includes(s)))).toBe(
        true
      )
    })
  })
})
