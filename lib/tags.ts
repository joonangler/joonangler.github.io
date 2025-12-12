import { type Post, type TagInfo } from '@/types/post'
import { getAllPosts } from './mdx'
import { toSlug } from './utils'

/**
 * 태그 정규화 (소문자, 공백 제거)
 */
export function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim()
}

/**
 * 태그를 슬러그로 변환
 */
export function tagToSlug(tag: string): string {
  return toSlug(tag)
}

/**
 * 모든 태그 가져오기 (포스트 수 포함)
 */
export async function getAllTags(): Promise<TagInfo[]> {
  const allPosts = await getAllPosts()
  const tagMap = new Map<string, Post[]>()

  // 모든 포스트의 태그 수집
  for (const post of allPosts) {
    for (const tag of post.tags) {
      const normalizedTag = normalizeTag(tag)

      if (!tagMap.has(normalizedTag)) {
        tagMap.set(normalizedTag, [])
      }

      tagMap.get(normalizedTag)!.push(post)
    }
  }

  // TagInfo 배열 생성
  const tags: TagInfo[] = Array.from(tagMap.entries()).map(([tag, posts]) => ({
    name: tag,
    slug: tagToSlug(tag),
    count: posts.length,
    posts,
  }))

  // 포스트 수 기준 내림차순 정렬
  tags.sort((a, b) => b.count - a.count)

  return tags
}

/**
 * 특정 태그 정보 가져오기
 */
export async function getTagInfo(tag: string): Promise<TagInfo | null> {
  const allTags = await getAllTags()
  const normalizedTag = normalizeTag(tag)

  return (
    allTags.find(
      (t) => t.name === normalizedTag || t.slug === normalizedTag
    ) || null
  )
}

/**
 * 인기 태그 가져오기 (상위 N개)
 */
export async function getPopularTags(limit: number = 10): Promise<TagInfo[]> {
  const allTags = await getAllTags()
  return allTags.slice(0, limit)
}

/**
 * 태그 클라우드 데이터 생성 (가중치 포함)
 */
export async function getTagCloud(): Promise<
  Array<TagInfo & { weight: number }>
> {
  const allTags = await getAllTags()

  if (allTags.length === 0) {
    return []
  }

  // 최소/최대 포스트 수
  const counts = allTags.map((tag) => tag.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)

  // 가중치 계산 (1-5 범위)
  const tagCloud = allTags.map((tag) => {
    let weight = 1

    if (maxCount > minCount) {
      weight = 1 + ((tag.count - minCount) / (maxCount - minCount)) * 4
    }

    return {
      ...tag,
      weight: Math.round(weight * 10) / 10, // 소수점 1자리
    }
  })

  // 이름 기준 알파벳 순 정렬
  tagCloud.sort((a, b) => a.name.localeCompare(b.name))

  return tagCloud
}

/**
 * 관련 태그 가져오기 (같이 사용된 태그)
 */
export async function getRelatedTags(
  tag: string,
  limit: number = 5
): Promise<TagInfo[]> {
  const tagInfo = await getTagInfo(tag)

  if (!tagInfo) {
    return []
  }

  const relatedTagMap = new Map<string, number>()

  // 같은 포스트에 등장한 태그 수집
  for (const post of tagInfo.posts) {
    for (const postTag of post.tags) {
      const normalizedPostTag = normalizeTag(postTag)

      // 자기 자신 제외
      if (normalizedPostTag === normalizeTag(tag)) {
        continue
      }

      relatedTagMap.set(
        normalizedPostTag,
        (relatedTagMap.get(normalizedPostTag) || 0) + 1
      )
    }
  }

  // 모든 태그 정보 가져오기
  const allTags = await getAllTags()

  // 관련도 높은 태그 정렬
  const relatedTags = Array.from(relatedTagMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tagName]) => allTags.find((t) => t.name === tagName))
    .filter((t): t is TagInfo => t !== undefined)

  return relatedTags
}

/**
 * 태그 검색
 */
export async function searchTags(query: string): Promise<TagInfo[]> {
  if (!query || query.trim() === '') {
    return []
  }

  const allTags = await getAllTags()
  const lowerQuery = query.toLowerCase().trim()

  return allTags.filter((tag) => tag.name.toLowerCase().includes(lowerQuery))
}

/**
 * 태그별 포스트 수 가져오기
 */
export async function getTagCount(tag: string): Promise<number> {
  const tagInfo = await getTagInfo(tag)
  return tagInfo?.count || 0
}

/**
 * 최근 사용된 태그 가져오기
 */
export async function getRecentTags(limit: number = 5): Promise<TagInfo[]> {
  const allPosts = await getAllPosts()
  const recentTagSet = new Set<string>()

  // 최근 포스트의 태그 수집 (중복 제거)
  for (const post of allPosts) {
    for (const tag of post.tags) {
      recentTagSet.add(normalizeTag(tag))

      if (recentTagSet.size >= limit) {
        break
      }
    }

    if (recentTagSet.size >= limit) {
      break
    }
  }

  // 전체 태그 정보에서 필터링
  const allTags = await getAllTags()
  return allTags.filter((tag) => recentTagSet.has(tag.name))
}
