import { type Post, type SeriesInfo, type SeriesNavigation } from '@/types/post'
import { getAllPosts, getPostBySlug } from './mdx'
import { toSlug } from './utils'

/**
 * 시리즈 이름을 슬러그로 변환
 */
export function seriesToSlug(series: string): string {
  return toSlug(series)
}

/**
 * 모든 시리즈 가져오기
 */
export async function getAllSeries(): Promise<SeriesInfo[]> {
  const allPosts = await getAllPosts()
  const seriesMap = new Map<string, { originalName: string; posts: Post[] }>()

  // 시리즈가 있는 포스트만 필터링
  for (const post of allPosts) {
    if (post.series) {
      // 대소문자 구분 없이 그룹핑하기 위한 키
      const key = post.series.toLowerCase().trim()

      if (!seriesMap.has(key)) {
        seriesMap.set(key, {
          originalName: post.series.trim(), // 원본 이름 유지
          posts: [],
        })
      }

      seriesMap.get(key)!.posts.push(post)
    }
  }

  // SeriesInfo 배열 생성
  const series: SeriesInfo[] = Array.from(seriesMap.entries()).map(
    ([_key, { originalName, posts }]) => {
      // 시리즈 순서대로 정렬
      const sortedPosts = posts.sort((a, b) => {
        const orderA = a.seriesOrder ?? Number.MAX_SAFE_INTEGER
        const orderB = b.seriesOrder ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
      })

      // 총 읽기 시간 계산
      const totalReadingTime = sortedPosts.reduce(
        (sum, post) => sum + post.readingTime.minutes,
        0
      )

      // 커버 이미지가 있는 첫 번째 포스트의 커버 이미지 사용
      const coverImage = sortedPosts.find(post => post.coverImage)?.coverImage

      return {
        name: originalName, // 원본 이름 사용
        slug: seriesToSlug(originalName),
        count: sortedPosts.length,
        posts: sortedPosts,
        totalReadingTime,
        coverImage,
      }
    }
  )

  // 마지막 업데이트 날짜(시리즈의 마지막 포스트 게시 일자) 기준 내림차순 정렬
  series.sort((a, b) => +new Date(b.posts[b.posts.length - 1].date) - +new Date(a.posts[a.posts.length - 1].date))

  return series
}

/**
 * 특정 시리즈 정보 가져오기
 */
export async function getSeriesInfo(
  series: string
): Promise<SeriesInfo | null> {
  const allSeries = await getAllSeries()
  const normalizedSeries = series.toLowerCase().trim()

  return (
    allSeries.find(
      (s) => s.name === normalizedSeries || s.slug === normalizedSeries
    ) || null
  )
}

/**
 * 시리즈 네비게이션 정보 가져오기
 */
export async function getSeriesNavigation(
  slug: string
): Promise<SeriesNavigation | null> {
  const currentPost = await getPostBySlug(slug)

  if (!currentPost || !currentPost.series) {
    return null
  }

  const seriesInfo = await getSeriesInfo(currentPost.series)

  if (!seriesInfo) {
    return null
  }

  const currentIndex = seriesInfo.posts.findIndex((post) => post.slug === slug)

  if (currentIndex === -1) {
    return null
  }

  return {
    previous: currentIndex > 0 ? seriesInfo.posts[currentIndex - 1] : null,
    next:
      currentIndex < seriesInfo.posts.length - 1
        ? seriesInfo.posts[currentIndex + 1]
        : null,
    current: currentPost,
    series: seriesInfo,
  }
}

/**
 * 시리즈별 포스트 가져오기
 */
export async function getPostsBySeries(series: string): Promise<Post[]> {
  const seriesInfo = await getSeriesInfo(series)
  return seriesInfo?.posts || []
}

/**
 * 인기 시리즈 가져오기 (상위 N개)
 */
export async function getPopularSeries(
  limit: number = 5
): Promise<SeriesInfo[]> {
  const allSeries = await getAllSeries()
  return allSeries.slice(0, limit)
}

/**
 * 진행 중인 시리즈 가져오기 (최근 업데이트 기준)
 */
export async function getOngoingSeries(): Promise<SeriesInfo[]> {
  const allSeries = await getAllSeries()

  // 각 시리즈의 최신 포스트 날짜 기준으로 정렬
  const seriesWithLastUpdate = allSeries.map((series) => {
    const lastPost = series.posts[series.posts.length - 1]
    const lastUpdate = new Date(lastPost.date).getTime()

    return {
      series,
      lastUpdate,
    }
  })

  seriesWithLastUpdate.sort((a, b) => b.lastUpdate - a.lastUpdate)

  return seriesWithLastUpdate.map((item) => item.series)
}

/**
 * 완결된 시리즈 여부 확인
 */
export function isSeriesCompleted(seriesInfo: SeriesInfo): boolean {
  // 시리즈 순서가 1부터 연속적인지 확인
  const orders = seriesInfo.posts
    .map((post) => post.seriesOrder)
    .filter((order): order is number => order !== undefined)
    .sort((a, b) => a - b)

  if (orders.length === 0) {
    return false
  }

  // 1부터 시작하고 연속적인지 확인
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      return false
    }
  }

  return true
}

/**
 * 시리즈 진행률 계산
 */
export function getSeriesProgress(
  currentSlug: string,
  seriesInfo: SeriesInfo
): {
  current: number
  total: number
  percentage: number
} {
  const currentIndex = seriesInfo.posts.findIndex(
    (post) => post.slug === currentSlug
  )

  if (currentIndex === -1) {
    return { current: 0, total: seriesInfo.count, percentage: 0 }
  }

  const current = currentIndex + 1
  const total = seriesInfo.count
  const percentage = Math.round((current / total) * 100)

  return { current, total, percentage }
}

/**
 * 시리즈 검색
 */
export async function searchSeries(query: string): Promise<SeriesInfo[]> {
  if (!query || query.trim() === '') {
    return []
  }

  const allSeries = await getAllSeries()
  const lowerQuery = query.toLowerCase().trim()

  return allSeries.filter((series) =>
    series.name.toLowerCase().includes(lowerQuery)
  )
}

/**
 * 최근 시작된 시리즈 가져오기
 */
export async function getRecentSeries(
  limit: number = 5
): Promise<SeriesInfo[]> {
  const allSeries = await getAllSeries()

  // 첫 번째 포스트 날짜 기준으로 정렬
  const seriesWithStartDate = allSeries.map((series) => {
    const firstPost = series.posts[0]
    const startDate = new Date(firstPost.date).getTime()

    return {
      series,
      startDate,
    }
  })

  seriesWithStartDate.sort((a, b) => b.startDate - a.startDate)

  return seriesWithStartDate.slice(0, limit).map((item) => item.series)
}
