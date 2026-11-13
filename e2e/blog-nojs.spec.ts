import { test, expect } from '@playwright/test'

test.use({ javaScriptEnabled: false })

// 정적 HTML의 Suspense 대기 자리는 운영 빌드에서만 나온다 — 개발 서버는 /search/를 서버에서 다 그려서
// 스크립트를 꺼도 검색 화면이 보인다. 운영 빌드(글은 e2e fixtures)를 3000번에 띄우고 E2E_STATIC=1로 돌린다:
//   POSTS_DIR=$PWD/e2e/fixtures/posts DRAFTS_DIR=$PWD/e2e/fixtures/drafts npm run build:production
//   python3 -m http.server 3000 -d out &   E2E_STATIC=1 npx playwright test e2e/blog-nojs.spec.ts --project=chromium

test('the post list shows its first page without scripts', async ({ page }) => {
  await page.goto('/posts/')
  await expect(page.getByRole('heading', { name: '모든 요소를 담은 글' })).toBeVisible()
  await expect(page.getByText('Loading posts...')).toHaveCount(0)
})

test('search says it needs scripts and offers tags and series', async ({ page }) => {
  test.skip(!process.env.E2E_STATIC, '운영 빌드(E2E_STATIC=1)에서만 의미가 있다')
  await page.goto('/search/')
  // <noscript> 안의 안내다. Playwright의 스크립트 끄기는 Chromium 기본 스타일의 noscript{display:none}을 못 걷어
  // 「보인다」는 잴 수 없다(실제로 스크립트를 끈 브라우저는 보인다) — DOM에 있는지와 링크 주소를 본다.
  await expect(page.locator('noscript p', { hasText: '검색은 자바스크립트를 켜야 쓸 수 있습니다' })).toBeAttached()
  await expect(page.getByText('로딩 중...')).toBeHidden()
  // 구역 내비에도 같은 이름의 링크가 있다 — 안내 문장 바로 아래 줄로 좁힌다
  const help = page.locator('noscript p', { hasText: '검색은 자바스크립트' }).locator('xpath=following-sibling::p[1]')
  await expect(help.locator('a', { hasText: '태그' })).toHaveAttribute('href', '/tags/')
  await expect(help.locator('a', { hasText: '시리즈' })).toHaveAttribute('href', '/series/')
})
