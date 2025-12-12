import type { NextConfig } from 'next'

// 번들 분석기 통합
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // GitHub Pages 정적 export 설정
  // 개발 모드에서는 동적 라우팅 허용, 프로덕션 빌드 시에만 정적 export
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  // GitHub Pages용 basePath (리포지토리 이름이 경로에 포함되는 경우)
  // 예: https://username.github.io/blog
  // 실제 배포 시 환경에 맞게 수정하세요
  basePath: process.env.NODE_ENV === 'production' ? '' : '',

  // 이미지 최적화 (GitHub Pages는 unoptimized 필요)
  images: {
    unoptimized: true,
  },

  // Trailing slash
  trailingSlash: true,

  // 페이지 확장자 설정 (MDX 지원)
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // TypeScript 설정
  typescript: {
    // 빌드 시 타입 에러가 있어도 계속 진행 (개발용, 배포 전 false로 변경)
    ignoreBuildErrors: false,
  },

  // 프로덕션 최적화
  reactStrictMode: true,

  // 번들 사이즈 최적화 (프로덕션에서 console.log 제거)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default withBundleAnalyzer(nextConfig)
