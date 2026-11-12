/** 블로그 화면 여덟 — 색·대비·폭·글자 시험이 같은 목록을 돈다(e2e/fixtures/posts의 글 기준) */
export const BLOG_PAGES: string[] = [
  '/posts/',
  '/posts/kitchen-sink/',
  '/posts/e2e-series-2/',
  '/series/',
  '/series/e2e-series/',
  '/tags/',
  `/tags/${encodeURIComponent('시험')}/`,
  '/search/',
]
