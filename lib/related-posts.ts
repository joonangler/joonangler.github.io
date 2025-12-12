import { type Post } from '@/types/post'
import { getAllPosts } from './mdx'

/**
 * 관련 포스트 가져오기
 *
 * 현재 포스트와 같은 태그를 가진 다른 포스트를 찾습니다.
 * 관련도 점수는 공통 태그의 수로 계산됩니다.
 */
export async function getRelatedPosts(
  currentPost: Post,
  limit: number = 3
): Promise<Post[]> {
  const allPosts = await getAllPosts()

  // 현재 포스트 제외
  const otherPosts = allPosts.filter((post) => post.slug !== currentPost.slug)

  if (otherPosts.length === 0) {
    return []
  }

  // 각 포스트의 관련도 점수 계산
  const postsWithScore = otherPosts.map((post) => {
    let score = 0

    // 공통 태그 수
    const commonTags = post.tags.filter((tag) =>
      currentPost.tags.some((currentTag) =>
        currentTag.toLowerCase() === tag.toLowerCase()
      )
    )
    score += commonTags.length * 10

    // 같은 시리즈면 높은 점수
    if (post.series && currentPost.series &&
        post.series.toLowerCase() === currentPost.series.toLowerCase()) {
      score += 50
    }

    // 같은 작성자면 보너스
    if (post.author && currentPost.author &&
        post.author === currentPost.author) {
      score += 5
    }

    // 최근 포스트에 약간의 가산점
    const daysDiff = Math.abs(
      new Date(post.date).getTime() - new Date(currentPost.date).getTime()
    ) / (1000 * 60 * 60 * 24)

    if (daysDiff < 30) {
      score += 3
    } else if (daysDiff < 90) {
      score += 1
    }

    return {
      post,
      score,
    }
  })

  // 점수 기준 내림차순 정렬 후 상위 N개 반환
  const relatedPosts = postsWithScore
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post)

  return relatedPosts
}
