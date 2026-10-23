import { test, expect, devices } from '@playwright/test'

test.describe('Responsive Design', () => {
  test('should be responsive on mobile (320px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 568 },
    })
    const page = await context.newPage()

    await page.goto('/')

    // 페이지가 로드되는지 확인
    await expect(page.locator('body')).toBeVisible()

    // 콘텐츠가 잘리지 않고 표시되는지 확인
    const body = page.locator('body')
    const bodyWidth = await body.evaluate((el) => el.scrollWidth)
    const viewportWidth = 320

    // 수평 스크롤이 없어야 함 (약간의 여유 허용)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20)

    await context.close()
  })

  test('should be responsive on tablet (768px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    })
    const page = await context.newPage()

    await page.goto('/')

    await expect(page.locator('body')).toBeVisible()

    // 포스트 그리드 레이아웃 확인
    const posts = page.locator('article, [data-testid="post-card"]')
    const count = await posts.count()
    expect(count).toBeGreaterThan(0)

    await context.close()
  })

  test('should be responsive on desktop (1024px)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    })
    const page = await context.newPage()

    await page.goto('/')

    await expect(page.locator('body')).toBeVisible()

    // 데스크톱 레이아웃 확인
    const header = page.locator('header')
    await expect(header).toBeVisible()

    await context.close()
  })

  test('should have working mobile menu', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    })
    const page = await context.newPage()

    await page.goto('/')

    // 모바일 메뉴 버튼 확인 (햄버거 메뉴)
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="메뉴"], [data-testid="mobile-menu-toggle"]')

    // 모바일 메뉴 버튼이 있거나, 메뉴가 항상 표시되어야 함
    const menuButtonExists = await menuButton.count() > 0
    const navVisible = await page.locator('nav').isVisible()

    expect(menuButtonExists || navVisible).toBe(true)

    // 메뉴 버튼이 있으면 클릭 테스트
    if (menuButtonExists) {
      await menuButton.first().click()

      // 메뉴가 열렸는지 확인
      await page.waitForTimeout(300) // 애니메이션 대기

      const nav = page.locator('nav')
      await expect(nav).toBeVisible()
    }

    await context.close()
  })

  test('should handle touch interactions on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5'],
    })
    const page = await context.newPage()

    await page.goto('/')

    // 포스트 카드 탭 테스트
    const firstPost = page.locator('article, [data-testid="post-card"]').first()
    await firstPost.tap()

    // 포스트 상세 페이지로 이동 확인
    await page.waitForLoadState('networkidle')

    // 콘텐츠 확인
    const content = page.locator('main, article')
    await expect(content).toBeVisible()

    await context.close()
  })

  test('should have readable font sizes on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone SE
    })
    const page = await context.newPage()

    await page.goto('/')

    // 본문 폰트 크기 확인 (최소 14px 이상 권장)
    const fontSize = await page.evaluate(() => {
      const body = document.body
      const style = window.getComputedStyle(body)
      return parseFloat(style.fontSize)
    })

    expect(fontSize).toBeGreaterThanOrEqual(14)

    await context.close()
  })
})
