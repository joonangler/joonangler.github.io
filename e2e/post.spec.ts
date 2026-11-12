import { test, expect } from '@playwright/test'

test.describe('Post Reading', () => {
  test('should navigate to post detail page', async ({ page }) => {
    await page.goto('/posts/')

    // 첫 글 카드의 제목을 읽고 그 카드 링크를 누른다
    const firstCard = page.locator('main a[href^="/posts/"]:has(article)').first()
    const postTitle = (await firstCard.getByRole('heading', { level: 2 }).textContent())!.trim()
    expect(postTitle.length).toBeGreaterThan(0)

    await firstCard.click()
    await page.waitForLoadState('networkidle')

    // 글 화면의 첫 h1이 그 제목이다(본문 안에도 h1이 있을 수 있다)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 }).first()).toHaveText(postTitle)
  })

  test('should display post content', async ({ page }) => {
    await page.goto('/posts')

    // 포스트 클릭
    const posts = page.locator('article, [data-testid="post-card"]')
    await posts.first().click()

    await page.waitForLoadState('networkidle')

    // 콘텐츠 확인 (글 화면의 article 안에 PostContent의 article이 또 있어 main으로 잡는다)
    const content = page.getByRole('main')
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
    await page.goto('/posts/')

    const posts = page.locator('article, [data-testid="post-card"]')
    await posts.first().click()

    await page.waitForLoadState('networkidle')

    // 뒤로 가기
    await page.goBack()

    // 글 목록으로 돌아왔는지 확인
    await expect(page).toHaveURL(/\/posts\/$/)
    await expect(posts.first()).toBeVisible()
  })
})
