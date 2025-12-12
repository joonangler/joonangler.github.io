/**
 * 애플리케이션 전역 상수 정의
 */

/**
 * 프로덕션 환경에서 필수 환경변수 검증
 */
function validateProductionEnv(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (process.env.NODE_ENV === 'production') {
    if (!siteUrl || siteUrl === 'https://example.com') {
      throw new Error(
        'NEXT_PUBLIC_SITE_URL must be set in production environment. ' +
        'Please set it in your .env.production or deployment configuration.'
      )
    }
  }

  return siteUrl || 'http://localhost:3000'
}

/**
 * 사이트 기본 설정
 * - 환경변수에서 가져오며, 없을 경우 기본값 사용
 * - 프로덕션 환경에서는 필수 환경변수 검증
 */
export const SITE_CONFIG = {
  url: validateProductionEnv(),
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'My Blog',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A Next.js blog',
  locale: 'ko_KR',
  author: {
    name: process.env.NEXT_PUBLIC_AUTHOR_NAME || 'Blog Author',
    email: process.env.NEXT_PUBLIC_AUTHOR_EMAIL || 'author@example.com',
    image: process.env.NEXT_PUBLIC_AUTHOR_IMAGE || '/favicon.svg'
  },
  social: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@yourusername',
    github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/yourusername',
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const

/**
 * 헤더의 높이 (픽셀)
 * - 스크롤 네비게이션 시 오프셋 계산에 사용
 * - IntersectionObserver의 rootMargin 계산에 사용
 */
export const HEADER_HEIGHT = 80 as const

/**
 * 스크롤 스파이 IntersectionObserver의 rootMargin
 * - 헤더 높이만큼 상단/하단 마진 설정
 * - 뷰포트의 실제 콘텐츠 영역 기준으로 감지
 */
export const SCROLL_SPY_ROOT_MARGIN = `-${HEADER_HEIGHT}px 0px -${HEADER_HEIGHT}px 0px` as const

/**
 * 스크롤 스파이 IntersectionObserver의 threshold
 * - 0: 요소가 조금이라도 보이면 즉시 활성화 (빠른 반응)
 */
export const SCROLL_SPY_THRESHOLD = 0 as const
