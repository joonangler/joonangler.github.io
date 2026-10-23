import { test, expect } from '@playwright/test'

test.describe('Post Reading', () => {
  test('should navigate to post detail page', async ({ page }) => {
    await page.goto('/')

    // 첫 번째 포스트 클릭
    const firstPost = page.locator('article, [data-testid="post-card"]').first()
    const postTitle = await firstPost.locator('h2, h3, [data-testid="post-title"]').first().textContent()

    await firstPost.click()

    // 포스트 상세 페이지로 이동 확인
    await page.waitForLoadState('networkidle')

    // 포스트 제목이 표시되는지 확인
    const detailTitle = page.locator('h1')
    await expect(detailTitle).toBeVisible()
  })

  test('should display post content', async ({ page }) => {
    await page.goto('/posts')

    // 포스트 클릭
    const posts = page.locator('article, [data-testid="post-card"]')
    await posts.first().click()

    await page.waitForLoadState('networkidle')

    // 콘텐츠 확인
    const content = page.locator('article, main')
    await expect(content).toBeVisible()

    // 본문 텍스트가 있는지 확인
    const bodyText = await content.textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText!.length).toBeGreaterThan(100)
  })

  test('should display post metadata', async ({ page }) => {
    await page.goto('/posts')

    const posts = page.locator('article, [data-testid="post-card"]')
    await posts.first().click()

    await page.waitForLoadState('networkidle')

    // 날짜 표시 확인 (여러 형식 가능)
    const datePattern = /\d{4}[년\-\/\.]\s*\d{1,2}/
    const pageContent = await page.textContent('body')
    expect(pageContent).toMatch(datePattern)
  })

  test('should handle back navigation', async ({ page }) => {
    await page.goto('/')

    const posts = page.locator('article, [data-testid="post-card"]')
    await posts.first().click()

    await page.waitForLoadState('networkidle')

    // 뒤로 가기
    await page.goBack()

    // 홈페이지로 돌아왔는지 확인
    await expect(posts.first()).toBeVisible()
  })
})
