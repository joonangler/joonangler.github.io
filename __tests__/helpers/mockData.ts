import type { Post } from '@/types/post'

/**
 * 테스트용 포스트 데이터
 */
export const mockPost: Post = {
  slug: 'test-post',
  title: 'Test Post Title',
  description: 'This is a test post description',
  date: '2025-01-28',
  tags: ['nextjs', 'typescript', 'testing'],
  content: '# Test Content\n\nThis is test content.',
  readingTime: { text: '5 min read', minutes: 5, time: 300000, words: 1000 },
  toc: [],
  author: 'Test Author',
}

export const mockPostWithSeries: Post = {
  ...mockPost,
  slug: 'test-post-with-series',
  series: 'Test Series',
  seriesOrder: 1,
}

export const mockPosts: Post[] = [
  {
    slug: 'post-1',
    title: 'First Post',
    description: 'Description for first post',
    date: '2025-01-28',
    tags: ['react', 'nextjs'],
    content: 'Content 1',
    readingTime: { text: '3 min read', minutes: 3, time: 180000, words: 600 },
    toc: [],
  },
  {
    slug: 'post-2',
    title: 'Second Post',
    description: 'Description for second post',
    date: '2025-01-27',
    tags: ['typescript', 'testing'],
    content: 'Content 2',
    readingTime: { text: '5 min read', minutes: 5, time: 300000, words: 1000 },
    toc: [],
  },
  {
    slug: 'post-3',
    title: 'Third Post',
    description: 'Description for third post',
    date: '2025-01-26',
    tags: ['nextjs', 'mdx'],
    content: 'Content 3',
    readingTime: { text: '4 min read', minutes: 4, time: 240000, words: 800 },
    toc: [],
  },
]

/**
 * 테스트용 MDX 콘텐츠
 */
export const mockMdxContent = `---
title: Test Post
description: Test description
date: 2025-01-28
tags: [test, mock]
---

# Test Heading

This is a test paragraph with **bold** and *italic* text.

## Subheading

\`\`\`typescript
function test() {
  return 'test'
}
\`\`\`

- List item 1
- List item 2
- List item 3
`

/**
 * 테스트용 Frontmatter
 */
export const mockFrontmatter = {
  title: 'Test Post',
  description: 'Test description',
  date: '2025-01-28',
  tags: ['test', 'mock'],
}

/**
 * 테스트용 TOC 데이터
 */
export const mockTocContent = `
# Heading 1
## Heading 2
### Heading 3
## Another Heading 2
### Nested Heading 3
#### Deep Heading 4
# Another Heading 1
`

/**
 * 테스트용 검색어
 */
export const mockSearchQueries = {
  simple: 'test',
  korean: '테스트',
  multiWord: 'next.js typescript',
  withSpecialChars: 'test@#$%',
  empty: '',
  whitespace: '   ',
}

/**
 * Mock 포스트 생성 헬퍼
 */
export function createMockPost(overrides?: Partial<Post>): Post {
  return {
    ...mockPost,
    ...overrides,
  }
}

/**
 * 여러 Mock 포스트 생성 헬퍼
 */
export function createMockPosts(count: number): Post[] {
  return Array.from({ length: count }, (_, i) => ({
    slug: `post-${i + 1}`,
    title: `Post ${i + 1}`,
    description: `Description for post ${i + 1}`,
    date: new Date(2025, 0, 28 - i).toISOString().split('T')[0],
    tags: ['tag1', 'tag2'],
    content: `Content ${i + 1}`,
    readingTime: {
      text: `${i + 2} min read`,
      minutes: i + 2,
      time: (i + 2) * 60000,
      words: (i + 2) * 200,
    },
    toc: [],
  }))
}
