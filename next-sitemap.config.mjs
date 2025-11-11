import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.production file
const envPath = path.join(__dirname, '.env.production')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/api/*', '/404'],
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, path) => {
    // URL 디코딩: %2F 같은 인코딩된 문자를 정상 문자로 변환
    // 단, 한글 등 non-ASCII 문자는 인코딩 상태 유지 (SEO 권장사항)
    let cleanPath = path
    try {
      // %2F를 /로, %2C를 ,로 등 일반적인 URL 인코딩 해제
      cleanPath = decodeURIComponent(path)
      // 한글 등은 다시 인코딩 (검색엔진이 더 잘 이해함)
      cleanPath = cleanPath
        .split('/')
        .map(segment => {
          // ASCII가 아닌 문자가 포함된 경우만 인코딩
          return /[^\x00-\x7F]/.test(segment) ? encodeURIComponent(segment) : segment
        })
        .join('/')
    } catch (e) {
      // 디코딩 실패 시 원본 유지
      cleanPath = path
    }

    // 홈페이지는 최고 우선순위
    if (path === '/') {
      return {
        loc: cleanPath,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }

    // 포스트 상세 페이지
    if (path.includes('/posts/') && !path.endsWith('/posts') && !path.endsWith('/posts/')) {
      return {
        loc: cleanPath,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }

    // 포스트 목록 페이지
    if (path === '/posts' || path === '/posts/') {
      return {
        loc: cleanPath,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      }
    }

    // 태그, 시리즈 목록 페이지
    if (path === '/tags' || path === '/tags/' || path === '/series' || path === '/series/') {
      return {
        loc: cleanPath,
        changefreq: 'weekly',
        priority: 0.5,
        lastmod: new Date().toISOString(),
      }
    }

    // 태그, 시리즈 상세 페이지
    if (path.includes('/tags/') || path.includes('/series/')) {
      return {
        loc: cleanPath,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      }
    }

    // 기본값
    return {
      loc: cleanPath,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}

export default config
