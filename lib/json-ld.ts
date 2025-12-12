/**
 * JSON-LD 구조화 데이터 생성 함수
 * https://schema.org/ 기반
 */

import { SITE_CONFIG } from './constants'
import { resolveImageUrl, getAbsoluteUrl } from './seo'
import type { Post } from '@/types/post'

/**
 * WebSite Schema
 * 웹사이트 전체 정보
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    inLanguage: 'ko-KR',
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      email: SITE_CONFIG.author.email,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * BlogPosting Schema
 * 블로그 포스트 정보
 */
export function generateBlogPostingSchema(post: Post, slug: string) {
  const postUrl = getAbsoluteUrl(`/posts/${slug}`)
  const imageUrl = resolveImageUrl(post.coverImage)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.modifiedDate || post.date,
    author: {
      '@type': 'Person',
      name: post.author || SITE_CONFIG.author.name,
      email: SITE_CONFIG.author.email,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: resolveImageUrl('/og-image.png'),
      },
    },
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags.join(', '),
    articleSection: post.series || 'Blog',
    inLanguage: 'ko-KR',
  }
}

/**
 * BreadcrumbList Schema
 * 브레드크럼 네비게이션 정보
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  }
}

/**
 * Person Schema
 * 작성자 정보
 */
export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_CONFIG.author.name,
    email: SITE_CONFIG.author.email,
    url: SITE_CONFIG.url,
    sameAs: [SITE_CONFIG.social.github, SITE_CONFIG.social.twitter],
  }
}

/**
 * Blog Schema
 * 블로그 전체 정보 (포스트 목록 페이지용)
 */
export function generateBlogSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: getAbsoluteUrl('/posts'),
    inLanguage: 'ko-KR',
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      email: SITE_CONFIG.author.email,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: resolveImageUrl('/og-image.png'),
      },
    },
  }
}
