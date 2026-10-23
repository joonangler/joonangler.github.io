import { test, expect } from '@playwright/test'

test.describe('Dark Mode', () => {
  test('should have theme toggle button', async ({ page }) => {
    await page.goto('/')

    // 테마 토글 버튼 확인
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="테마"], [data-testid="theme-toggle"]')
    await expect(themeToggle.first()).toBeVisible()
  })

  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/')

    const html = page.locator('html')

    // 초기 테마 확인
    const initialClass = await html.getAttribute('class')
    const initialTheme = initialClass?.includes('dark') ? 'dark' : 'light'

    // 테마 토글 버튼 클릭
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="테마"], [data-testid="theme-toggle"]').first()
    await themeToggle.click()

    // 테마 변경 확인
    await page.waitForTimeout(300) // 테마 전환 애니메이션 대기

    const newClass = await html.getAttribute('class')
    const newTheme = newClass?.includes('dark') ? 'dark' : 'light'

    expect(newTheme).not.toBe(initialTheme)
  })

  test('should persist theme after reload', async ({ page }) => {
    await page.goto('/')

    const html = page.locator('html')

    // 다크모드로 전환
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="테마"], [data-testid="theme-toggle"]').first()
    await themeToggle.click()

    await page.waitForTimeout(300)

    // 다크모드 확인
    let htmlClass = await html.getAttribute('class')
    const isDarkBefore = htmlClass?.includes('dark')

    // 페이지 새로고침
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 테마가 유지되는지 확인
    htmlClass = await html.getAttribute('class')
    const isDarkAfter = htmlClass?.includes('dark')

    expect(isDarkAfter).toBe(isDarkBefore)
  })

  test('should apply theme to all elements', async ({ page }) => {
    await page.goto('/')

    const html = page.locator('html')

    // 라이트 모드 스타일 확인
    const bgColor = await page.evaluate(() => {
      const body = document.body
      return window.getComputedStyle(body).backgroundColor
    })

    // 다크모드로 전환
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="테마"], [data-testid="theme-toggle"]').first()
    await themeToggle.click()

    await page.waitForTimeout(300)

    // 다크모드 스타일 확인
    const newBgColor = await page.evaluate(() => {
      const body = document.body
      return window.getComputedStyle(body).backgroundColor
    })

    // 배경색이 변경되었는지 확인
    expect(newBgColor).not.toBe(bgColor)
  })
})
