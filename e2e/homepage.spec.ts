import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Blog/)

    // 헤더 확인
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // 메인 콘텐츠 확인
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('should display recent posts', async ({ page }) => {
    await page.goto('/')

    // 포스트 목록이 표시되는지 확인
    const posts = page.locator('article, [data-testid="post-card"]')
    await expect(posts.first()).toBeVisible()

    // 포스트 개수 확인 (최소 1개 이상)
    const count = await posts.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/')

    // 네비게이션 링크 확인
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // Posts 링크
    const postsLink = page.getByRole('link', { name: /posts?/i })
    await expect(postsLink).toBeVisible()
  })

  test('should have footer', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })
})
