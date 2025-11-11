/**
 * SEO 관련 유틸리티 함수 및 메타데이터 생성
 */

import { Metadata } from 'next'
import { SITE_CONFIG } from './constants'

/**
 * 기본 메타데이터 생성
 */
export function getBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_CONFIG.url),
    title: {
      default: SITE_CONFIG.name,
      template: `%s | ${SITE_CONFIG.name}`,
    },
    description: SITE_CONFIG.description,
    keywords: ['Next.js', 'React', 'TypeScript', 'Blog', 'MDX'],
    authors: [{ name: SITE_CONFIG.author.name }],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.author.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      creator: SITE_CONFIG.social.twitter,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: SITE_CONFIG.url,
      types: {
        'application/rss+xml': `${SITE_CONFIG.url}/rss.xml`,
        'application/atom+xml': `${SITE_CONFIG.url}/atom.xml`,
        'application/feed+json': `${SITE_CONFIG.url}/feed.json`,
      },
    },
  }
}

/**
 * 페이지별 메타데이터 생성
 */
interface PageMetadataOptions {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
}

export function getPageMetadata({
  title,
  description,
  path,
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
}: PageMetadataOptions): Metadata {
  const url = getAbsoluteUrl(path)
  const imageUrl = resolveImageUrl(image)

  // Article 타입일 경우 추가 메타데이터
  if (type === 'article') {
    return {
      title,
      description,
      openGraph: {
        type: 'article',
        locale: SITE_CONFIG.locale,
        url,
        siteName: SITE_CONFIG.name,
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        publishedTime,
        modifiedTime,
        authors: [SITE_CONFIG.author.name],
        tags,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: SITE_CONFIG.social.twitter,
        images: [imageUrl],
      },
      alternates: {
        canonical: url,
      },
    }
  }

  // Website 타입 (기본)
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: SITE_CONFIG.social.twitter,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  }
}

/**
 * 이미지 URL을 절대 URL로 변환
 * - 외부 URL은 그대로 반환
 * - 내부 경로는 SITE_CONFIG.url과 결합
 * - URL 정규화를 통해 중복 슬래시 방지
 *
 * @param imagePath - 이미지 경로 (선택적)
 * @param fallback - 기본 이미지 경로
 * @returns 절대 URL
 *
 * @example
 * resolveImageUrl('/og-image.png') // 'https://example.com/og-image.png'
 * resolveImageUrl('https://external.com/image.jpg') // 'https://external.com/image.jpg'
 * resolveImageUrl(undefined) // 'https://example.com/og-image.png'
 */
export function resolveImageUrl(
  imagePath?: string,
  fallback: string = '/og-image.png'
): string {
  const path = imagePath || fallback

  // 외부 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Normalize URLs to prevent double slashes
  const base = SITE_CONFIG.url.endsWith('/')
    ? SITE_CONFIG.url.slice(0, -1)
    : SITE_CONFIG.url
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${base}${cleanPath}`
}

/**
 * OG 이미지 URL 생성
 * - 커버 이미지가 있으면 사용, 없으면 기본 이미지
 *
 * @deprecated Use resolveImageUrl() instead
 */
export function getOgImageUrl(coverImage?: string): string {
  return resolveImageUrl(coverImage)
}

/**
 * 상대 경로를 절대 URL로 변환
 *
 * @param path - 상대 경로 (예: '/posts/my-post')
 * @returns 절대 URL (예: 'https://example.com/posts/my-post')
 *
 * @example
 * getAbsoluteUrl('/posts/test') // 'https://example.com/posts/test'
 */
export function getAbsoluteUrl(path: string): string {
  // Normalize URLs to prevent double slashes
  const base = SITE_CONFIG.url.endsWith('/')
    ? SITE_CONFIG.url.slice(0, -1)
    : SITE_CONFIG.url
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${base}${cleanPath}`
}

/**
 * 캐노니컬 URL 생성
 *
 * @param path - 페이지 경로
 * @returns 캐노니컬 URL
 */
export function getCanonicalUrl(path: string): string {
  return getAbsoluteUrl(path)
}
