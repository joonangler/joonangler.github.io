import { type Post } from '@/types/post'
import { getAllPosts, getPostBySlug } from './mdx'

// Re-export from mdx
export { getAllPosts, getPostBySlug }

/**
 * 태그별 포스트 가져오기
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts()

  return allPosts.filter((post) =>
    post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  )
}

/**
 * 시리즈별 포스트 가져오기
 */
export async function getPostsBySeries(series: string): Promise<Post[]> {
  const allPosts = await getAllPosts()

  const seriesPosts = allPosts.filter(
    (post) => post.series?.toLowerCase() === series.toLowerCase()
  )

  // 시리즈 순서대로 정렬
  seriesPosts.sort((a, b) => {
    const orderA = a.seriesOrder ?? Number.MAX_SAFE_INTEGER
    const orderB = b.seriesOrder ?? Number.MAX_SAFE_INTEGER
    return orderA - orderB
  })

  return seriesPosts
}

/**
 * 페이지네이션된 포스트 가져오기
 */
export async function getPaginatedPosts(
  page: number = 1,
  postsPerPage: number = 10
): Promise<{
  posts: Post[]
  totalPages: number
  currentPage: number
  totalPosts: number
}> {
  const allPosts = await getAllPosts()
  const totalPosts = allPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const currentPage = Math.max(1, Math.min(page, totalPages))

  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const posts = allPosts.slice(startIndex, endIndex)

  return {
    posts,
    totalPages,
    currentPage,
    totalPosts,
  }
}

/**
 * 포스트 검색 (제목, 설명, 태그)
 */
export async function searchPosts(query: string): Promise<Post[]> {
  if (!query || query.trim() === '') {
    return []
  }

  const allPosts = await getAllPosts()
  const lowerQuery = query.toLowerCase().trim()

  return allPosts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(lowerQuery)
    const descriptionMatch = post.description.toLowerCase().includes(lowerQuery)
    const tagMatch = post.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    )
    const seriesMatch = post.series?.toLowerCase().includes(lowerQuery)

    return titleMatch || descriptionMatch || tagMatch || seriesMatch
  })
}

/**
 * 연도별 포스트 그룹화
 */
export async function getPostsByYear(): Promise<
  Record<string, Post[]>
> {
  const allPosts = await getAllPosts()
  const postsByYear: Record<string, Post[]> = {}

  for (const post of allPosts) {
    const year = new Date(post.date).getFullYear().toString()

    if (!postsByYear[year]) {
      postsByYear[year] = []
    }

    postsByYear[year].push(post)
  }

  return postsByYear
}

/**
 * 월별 포스트 아카이브
 */
export async function getPostArchive(): Promise<
  Array<{
    year: number
    month: number
    count: number
    posts: Post[]
  }>
> {
  const allPosts = await getAllPosts()
  const archiveMap = new Map<
    string,
    { year: number; month: number; posts: Post[] }
  >()

  for (const post of allPosts) {
    const date = new Date(post.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const key = `${year}-${month.toString().padStart(2, '0')}`

    if (!archiveMap.has(key)) {
      archiveMap.set(key, { year, month, posts: [] })
    }

    archiveMap.get(key)!.posts.push(post)
  }

  const archive = Array.from(archiveMap.values()).map((item) => ({
    ...item,
    count: item.posts.length,
  }))

  // 최신순 정렬
  archive.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year
    }
    return b.month - a.month
  })

  return archive
}

/**
 * 시리즈 내 이전/다음 포스트 가져오기
 */
export async function getSeriesNavigation(
  currentSlug: string
): Promise<{
  previous: Post | null
  next: Post | null
  current: Post | null
  seriesPosts: Post[]
} | null> {
  const currentPost = await getPostBySlug(currentSlug)

  if (!currentPost || !currentPost.series) {
    return null
  }

  const seriesPosts = await getPostsBySeries(currentPost.series)
  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentSlug
  )

  if (currentIndex === -1) {
    return null
  }

  return {
    previous: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
    next:
      currentIndex < seriesPosts.length - 1
        ? seriesPosts[currentIndex + 1]
        : null,
    current: currentPost,
    seriesPosts,
  }
}

/**
 * 특정 작성자의 포스트 가져오기
 */
export async function getPostsByAuthor(author: string): Promise<Post[]> {
  const allPosts = await getAllPosts()

  return allPosts.filter(
    (post) => post.author?.toLowerCase() === author.toLowerCase()
  )
}

/**
 * 포스트 통계 가져오기
 */
export async function getPostStats(): Promise<{
  totalPosts: number
  totalWords: number
  totalReadingMinutes: number
  averageReadingTime: number
  tagCount: number
  seriesCount: number
}> {
  const allPosts = await getAllPosts()

  const totalPosts = allPosts.length
  const totalWords = allPosts.reduce(
    (sum, post) => sum + post.readingTime.words,
    0
  )
  const totalReadingMinutes = allPosts.reduce(
    (sum, post) => sum + post.readingTime.minutes,
    0
  )
  const averageReadingTime =
    totalPosts > 0 ? Math.round(totalReadingMinutes / totalPosts) : 0

  // 고유 태그 수
  const uniqueTags = new Set<string>()
  allPosts.forEach((post) => {
    post.tags.forEach((tag) => uniqueTags.add(tag.toLowerCase()))
  })

  // 고유 시리즈 수
  const uniqueSeries = new Set<string>()
  allPosts.forEach((post) => {
    if (post.series) {
      uniqueSeries.add(post.series.toLowerCase())
    }
  })

  return {
    totalPosts,
    totalWords,
    totalReadingMinutes,
    averageReadingTime,
    tagCount: uniqueTags.size,
    seriesCount: uniqueSeries.size,
  }
}

/**
 * 최근 업데이트된 포스트 가져오기 (파일 수정 시간 기준)
 */
export async function getRecentlyUpdatedPosts(
  limit: number = 5
): Promise<Post[]> {
  // 현재는 date 기준으로 정렬하지만,
  // 실제로는 파일 시스템의 mtime을 확인하여 정렬 가능
  const allPosts = await getAllPosts()
  return allPosts.slice(0, limit)
}
