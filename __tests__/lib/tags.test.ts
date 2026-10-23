import { describe, it, expect } from 'vitest'
import {
  normalizeTag,
  tagToSlug,
  getAllTags,
  getTagInfo,
  getPopularTags,
  getTagCloud,
  getRelatedTags,
  searchTags,
  getTagCount,
  getRecentTags,
} from '@/lib/tags'

describe('tags', () => {
  describe('normalizeTag', () => {
    it('should convert to lowercase', () => {
      expect(normalizeTag('TypeScript')).toBe('typescript')
    })

    it('should trim whitespace', () => {
      expect(normalizeTag('  nextjs  ')).toBe('nextjs')
    })

    it('should handle mixed case with spaces', () => {
      expect(normalizeTag('  Next.js  ')).toBe('next.js')
    })
  })

  describe('tagToSlug', () => {
    it('should convert tag to slug', () => {
      const slug = tagToSlug('TypeScript')
      expect(slug).toBe('typescript')
    })

    it('should handle special characters', () => {
      const slug = tagToSlug('Next.js')
      expect(slug).toMatch(/nextjs/)
    })
  })

  describe('getAllTags', () => {
    it('should return array of tags', async () => {
      const tags = await getAllTags()

      expect(tags).toBeInstanceOf(Array)
      expect(tags.length).toBeGreaterThan(0)
    })

    it('should have correct structure', async () => {
      const tags = await getAllTags()

      tags.forEach((tag) => {
        expect(tag.name).toBeDefined()
        expect(tag.slug).toBeDefined()
        expect(tag.count).toBeGreaterThan(0)
        expect(tag.posts).toBeInstanceOf(Array)
      })
    })

    it('should sort by count descending', async () => {
      const tags = await getAllTags()

      for (let i = 0; i < tags.length - 1; i++) {
        expect(tags[i].count).toBeGreaterThanOrEqual(tags[i + 1].count)
      }
    })

    it('should normalize tag names', async () => {
      const tags = await getAllTags()

      tags.forEach((tag) => {
        expect(tag.name).toBe(tag.name.toLowerCase().trim())
      })
    })
  })

  describe('getTagInfo', () => {
    it('should get tag info by name', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const firstTag = allTags[0].name
        const tagInfo = await getTagInfo(firstTag)

        expect(tagInfo).not.toBeNull()
        expect(tagInfo?.name).toBe(firstTag)
      }
    })

    it('should get tag info by slug', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const firstTag = allTags[0]
        const tagInfo = await getTagInfo(firstTag.slug)

        expect(tagInfo).not.toBeNull()
        expect(tagInfo?.slug).toBe(firstTag.slug)
      }
    })

    it('should be case insensitive', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const tag = allTags[0].name
        const lower = await getTagInfo(tag.toLowerCase())
        const upper = await getTagInfo(tag.toUpperCase())

        expect(lower?.name).toBe(upper?.name)
      }
    })

    it('should return null for non-existing tag', async () => {
      const tagInfo = await getTagInfo('non-existing-tag-xyz')
      expect(tagInfo).toBeNull()
    })
  })

  describe('getPopularTags', () => {
    it('should return popular tags', async () => {
      const popular = await getPopularTags(5)

      expect(popular).toBeInstanceOf(Array)
      expect(popular.length).toBeLessThanOrEqual(5)
    })

    it('should sort by count descending', async () => {
      const popular = await getPopularTags(10)

      for (let i = 0; i < popular.length - 1; i++) {
        expect(popular[i].count).toBeGreaterThanOrEqual(popular[i + 1].count)
      }
    })

    it('should use default limit of 10', async () => {
      const popular = await getPopularTags()
      expect(popular.length).toBeLessThanOrEqual(10)
    })

    it('should handle limit larger than total tags', async () => {
      const allTags = await getAllTags()
      const popular = await getPopularTags(9999)

      expect(popular.length).toBe(allTags.length)
    })
  })

  describe('getTagCloud', () => {
    it('should return tag cloud with weights', async () => {
      const cloud = await getTagCloud()

      expect(cloud).toBeInstanceOf(Array)
      cloud.forEach((tag) => {
        expect(tag.weight).toBeDefined()
        expect(tag.weight).toBeGreaterThanOrEqual(1)
        expect(tag.weight).toBeLessThanOrEqual(5)
      })
    })

    it('should sort alphabetically', async () => {
      const cloud = await getTagCloud()

      for (let i = 0; i < cloud.length - 1; i++) {
        const compare = cloud[i].name.localeCompare(cloud[i + 1].name)
        expect(compare).toBeLessThanOrEqual(0)
      }
    })

    it('should handle empty tags', async () => {
      // This would only happen if there are no posts
      const cloud = await getTagCloud()
      expect(cloud).toBeInstanceOf(Array)
    })

    it('should calculate weights correctly', async () => {
      const cloud = await getTagCloud()

      if (cloud.length > 1) {
        const maxCount = Math.max(...cloud.map((t) => t.count))
        const minCount = Math.min(...cloud.map((t) => t.count))

        cloud.forEach((tag) => {
          if (maxCount === minCount) {
            expect(tag.weight).toBe(1)
          } else {
            const expectedWeight =
              1 + ((tag.count - minCount) / (maxCount - minCount)) * 4
            expect(tag.weight).toBeCloseTo(expectedWeight, 1)
          }
        })
      }
    })
  })

  describe('getRelatedTags', () => {
    it('should return related tags', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const tag = allTags[0].name
        const related = await getRelatedTags(tag, 5)

        expect(related).toBeInstanceOf(Array)
        related.forEach((relatedTag) => {
          expect(relatedTag.name).not.toBe(tag)
        })
      }
    })

    it('should not include the tag itself', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const tag = allTags[0].name
        const related = await getRelatedTags(tag)

        related.forEach((relatedTag) => {
          expect(relatedTag.name.toLowerCase()).not.toBe(tag.toLowerCase())
        })
      }
    })

    it('should return empty array for non-existing tag', async () => {
      const related = await getRelatedTags('non-existing-tag-xyz')
      expect(related).toHaveLength(0)
    })

    it('should respect limit', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const tag = allTags[0].name
        const limit = 3
        const related = await getRelatedTags(tag, limit)

        expect(related.length).toBeLessThanOrEqual(limit)
      }
    })
  })

  describe('searchTags', () => {
    it('should search tags by query', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const tag = allTags[0].name
        const searchTerm = tag.substring(0, 3)

        const results = await searchTags(searchTerm)

        expect(results.length).toBeGreaterThan(0)
        results.forEach((result) => {
          expect(result.name.toLowerCase()).toContain(searchTerm.toLowerCase())
        })
      }
    })

    it('should be case insensitive', async () => {
      const lower = await searchTags('next')
      const upper = await searchTags('NEXT')

      expect(lower.length).toBe(upper.length)
    })

    it('should return empty array for empty query', async () => {
      const results = await searchTags('')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for whitespace query', async () => {
      const results = await searchTags('   ')
      expect(results).toHaveLength(0)
    })

    it('should return empty array for non-matching query', async () => {
      const results = await searchTags('xyzabc123notfound')
      expect(results).toHaveLength(0)
    })
  })

  describe('getTagCount', () => {
    it('should return tag count', async () => {
      const allTags = await getAllTags()
      if (allTags.length > 0) {
        const tag = allTags[0].name
        const count = await getTagCount(tag)

        expect(count).toBe(allTags[0].count)
      }
    })

    it('should return 0 for non-existing tag', async () => {
      const count = await getTagCount('non-existing-tag-xyz')
      expect(count).toBe(0)
    })
  })

  describe('getRecentTags', () => {
    it('should return recent tags', async () => {
      const recent = await getRecentTags(5)

      expect(recent).toBeInstanceOf(Array)
      expect(recent.length).toBeLessThanOrEqual(5)
    })

    it('should use default limit of 5', async () => {
      const recent = await getRecentTags()
      expect(recent.length).toBeLessThanOrEqual(5)
    })

    it('should return tags with proper structure', async () => {
      const recent = await getRecentTags()

      recent.forEach((tag) => {
        expect(tag.name).toBeDefined()
        expect(tag.slug).toBeDefined()
        expect(tag.count).toBeGreaterThan(0)
      })
    })
  })
})
