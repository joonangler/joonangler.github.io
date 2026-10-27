import path from 'path'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getPostBySlug,
  getAllPosts,
  getRecentPosts,
  getPostFrontmatter,
  postExists,
  getPostPaths,
} from '@/lib/mdx'

afterEach(() => vi.unstubAllEnvs())

describe('mdx', () => {
  describe('postExists', () => {
    it('should return true for existing post', () => {
      const exists = postExists('test-post')
      expect(exists).toBe(true)
    })

    it('should return false for non-existing post', () => {
      const exists = postExists('2025/non-existing-post')
      expect(exists).toBe(false)
    })

    it('should handle invalid slug format', () => {
      const exists = postExists('')
      expect(exists).toBe(false)
    })
  })

  describe('getPostFrontmatter', () => {
    it('should extract frontmatter from existing post', () => {
      const frontmatter = getPostFrontmatter('test-post')

      expect(frontmatter).not.toBeNull()
      expect(frontmatter?.title).toBeDefined()
      expect(frontmatter?.date).toBeDefined()
      expect(frontmatter?.description).toBeDefined()
      expect(frontmatter?.tags).toBeInstanceOf(Array)
    })

    it('should return null for non-existing post', () => {
      const frontmatter = getPostFrontmatter('2025/non-existing')
      expect(frontmatter).toBeNull()
    })

    it('should include reading time', () => {
      const frontmatter = getPostFrontmatter('test-post')

      expect(frontmatter?.readingTime).toBeDefined()
      expect(frontmatter?.readingTime?.text).toBeDefined()
      expect(frontmatter?.readingTime?.minutes).toBeGreaterThan(0)
      expect(frontmatter?.readingTime?.words).toBeGreaterThan(0)
    })

    it('should handle draft flag', () => {
      const frontmatter = getPostFrontmatter('test-post')

      expect(frontmatter).not.toBeNull()
      expect(typeof frontmatter?.draft).toBe('boolean')
    })
  })

  describe('getPostBySlug', () => {
    it('should get post with all required fields', async () => {
      const post = await getPostBySlug('test-post')

      expect(post).not.toBeNull()
      expect(post?.slug).toBe('test-post')
      expect(post?.title).toBeDefined()
      expect(post?.description).toBeDefined()
      expect(post?.date).toBeDefined()
      expect(post?.tags).toBeInstanceOf(Array)
      expect(post?.content).toBeDefined()
      expect(post?.readingTime).toBeDefined()
    })

    it('should include TOC in post', async () => {
      const post = await getPostBySlug('test-post')

      expect(post?.toc).toBeDefined()
      expect(Array.isArray(post?.toc)).toBe(true)
    })

    it('should return null for non-existing post', async () => {
      const post = await getPostBySlug('2025/non-existing-post')
      expect(post).toBeNull()
    })

    it('should handle post with series', async () => {
      // If any post has series, test it
      const post = await getPostBySlug('test-post')

      if (post && post.series) {
        expect(post.series).toBeDefined()
        expect(typeof post.series).toBe('string')
        if (post.seriesOrder !== undefined) {
          expect(typeof post.seriesOrder).toBe('number')
        }
      }
    })

    it('should calculate reading time correctly', async () => {
      const post = await getPostBySlug('test-post')

      expect(post?.readingTime).toBeDefined()
      expect(post?.readingTime.text).toMatch(/\d+ min read/)
      expect(post?.readingTime.minutes).toBeGreaterThan(0)
      expect(post?.readingTime.words).toBeGreaterThan(0)
    })

    it('should handle optional fields gracefully', async () => {
      const post = await getPostBySlug('test-post')

      // These fields are optional and should be undefined or have default values
      expect(post).not.toBeNull()
      // author, coverImage, modifiedDate can be undefined
    })

    it('should not include draft posts by default in getAllPosts', async () => {
      const posts = await getAllPosts()
      const draftPosts = posts.filter((p) => p.draft === true)
      expect(draftPosts.length).toBe(0)
    })
  })

  describe('getAllPosts', () => {
    it('should get all posts', async () => {
      const posts = await getAllPosts()

      expect(posts).toBeInstanceOf(Array)
      expect(posts.length).toBeGreaterThan(0)
    })

    it('should return posts sorted by date descending', async () => {
      const posts = await getAllPosts()

      for (let i = 0; i < posts.length - 1; i++) {
        const date1 = new Date(posts[i].date).getTime()
        const date2 = new Date(posts[i + 1].date).getTime()
        expect(date1).toBeGreaterThanOrEqual(date2)
      }
    })

    it('should not include draft posts by default', async () => {
      const posts = await getAllPosts()
      const draftPosts = posts.filter((p) => p.draft)
      expect(draftPosts.length).toBe(0)
    })

    it('should include draft posts when specified', async () => {
      const postsWithDrafts = await getAllPosts(true)
      const postsWithoutDrafts = await getAllPosts(false)

      expect(postsWithDrafts.length).toBeGreaterThanOrEqual(
        postsWithoutDrafts.length
      )
    })

    it('should include all required fields in each post', async () => {
      const posts = await getAllPosts()

      posts.forEach((post) => {
        expect(post.slug).toBeDefined()
        expect(post.title).toBeDefined()
        expect(post.description).toBeDefined()
        expect(post.date).toBeDefined()
        expect(post.tags).toBeInstanceOf(Array)
        expect(post.content).toBeDefined()
        expect(post.readingTime).toBeDefined()
      })
    })

    it('should handle posts from subdirectories', async () => {
      const posts = await getAllPosts()

      // Posts in subdirectories (fixtures/posts/2025/) get a flat slug: the file name only
      expect(posts.some((p) => p.slug === 'test-post')).toBe(true)
      expect(posts.every((p) => !p.slug.includes('/'))).toBe(true)
    })
  })

  describe('getRecentPosts', () => {
    it('should get recent posts with default limit', async () => {
      const recent = await getRecentPosts()

      expect(recent).toBeInstanceOf(Array)
      expect(recent.length).toBeLessThanOrEqual(5) // default limit
    })

    it('should respect custom limit', async () => {
      const limit = 3
      const recent = await getRecentPosts(limit)

      expect(recent.length).toBeLessThanOrEqual(limit)
    })

    it('should return posts sorted by date descending', async () => {
      const recent = await getRecentPosts()

      for (let i = 0; i < recent.length - 1; i++) {
        const date1 = new Date(recent[i].date).getTime()
        const date2 = new Date(recent[i + 1].date).getTime()
        expect(date1).toBeGreaterThanOrEqual(date2)
      }
    })

    it('should handle limit larger than total posts', async () => {
      const allPosts = await getAllPosts()
      const recent = await getRecentPosts(1000)

      expect(recent.length).toBe(allPosts.length)
    })

    it('should handle zero limit', async () => {
      const recent = await getRecentPosts(0)
      expect(recent).toBeInstanceOf(Array)
      expect(recent.length).toBe(0)
    })
  })

  describe('getPostPaths', () => {
    it('should return post paths for static generation', () => {
      const paths = getPostPaths()

      expect(paths).toBeInstanceOf(Array)
      expect(paths.length).toBeGreaterThan(0)
    })

    it('should return paths with slug array', () => {
      const paths = getPostPaths()

      paths.forEach((path) => {
        expect(path.slug).toBeInstanceOf(Array)
        expect(path.slug.length).toBeGreaterThan(0)
      })
    })

    it('should handle nested directories correctly', () => {
      const paths = getPostPaths()

      // Files in subdirectories (fixtures/posts/2025/) are exposed by file name only
      // e.g., { slug: ['test-post'] }
      expect(paths).toContainEqual({ slug: ['test-post'] })
      expect(paths.every((p) => p.slug.length === 1)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid slug gracefully', async () => {
      const post = await getPostBySlug('')
      expect(post).toBeNull()
    })

    it('should handle malformed slug', async () => {
      const post = await getPostBySlug('///invalid///')
      expect(post).toBeNull()
    })

    it('should not throw on empty posts directory', async () => {
      // This should not throw, just return empty array
      // Even if posts directory is empty, getAllPosts should work
      const posts = await getAllPosts()
      expect(posts).toBeInstanceOf(Array)
    })
  })

  describe('Content Validation', () => {
    it('should validate required frontmatter fields', async () => {
      const post = await getPostBySlug('test-post')

      expect(post).not.toBeNull()
      expect(post?.title).toBeDefined()
      expect(post?.title.length).toBeGreaterThan(0)
      expect(post?.date).toBeDefined()
      expect(post?.date).toMatch(/^\d{4}-\d{2}-\d{2}/)
    })

    it('should handle posts with minimal frontmatter', async () => {
      const post = await getPostBySlug('test-post')

      // Only title and date are required
      expect(post?.title).toBeDefined()
      expect(post?.date).toBeDefined()
    })

    it('should provide default values for optional fields', async () => {
      const post = await getPostBySlug('test-post')

      expect(post).not.toBeNull()
      expect(post?.description).toBeDefined() // Should be '' if not provided
      expect(post?.tags).toBeInstanceOf(Array) // Should be [] if not provided
      expect(post?.draft).toBeDefined() // Should be false if not provided
    })
  })
})

describe('drafts directory', () => {
  it('does not see drafts dir by default (NODE_ENV=test)', () => {
    expect(postExists('draft-in-drafts')).toBe(false)
  })
  it('sees drafts dir when INCLUDE_DRAFTS=1', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    expect(postExists('draft-in-drafts')).toBe(true)
  })
  it('is silent when the drafts dir does not exist', async () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1'); vi.stubEnv('DRAFTS_DIR', '/nonexistent/drafts')
    await expect(getAllPosts()).resolves.toBeInstanceOf(Array)
  })
  it('throws on posts/drafts slug collision', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    vi.stubEnv('DRAFTS_DIR', path.resolve(__dirname, '../fixtures/drafts-collision'))
    expect(() => getPostPaths()).toThrow(/slug collision: "test-post"/)
  })
})
