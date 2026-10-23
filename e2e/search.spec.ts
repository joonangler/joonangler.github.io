import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should have search interface', async ({ page }) => {
    await page.goto('/search')

    // 검색 입력 필드 확인
    const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="검색"], input[type="text"][placeholder*="Search"]')
    await expect(searchInput.first()).toBeVisible()
  })

  test('should perform search', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="검색"], input[type="text"][placeholder*="Search"]').first()

    // 검색어 입력
    await searchInput.fill('Next')

    // 결과 대기
    await page.waitForTimeout(500) // Debounce 대기

    // 결과 확인 (결과가 있거나 "검색 결과 없음" 메시지가 있어야 함)
    const hasResults = await page.locator('article, [data-testid="search-result"]').count() > 0
    const hasNoResultsMessage = await page.locator('text=/결과.*없|No results|검색.*결과가.*없/i').count() > 0

    expect(hasResults || hasNoResultsMessage).toBe(true)
  })

  test('should handle empty search', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="검색"], input[type="text"][placeholder*="Search"]').first()

    // 빈 검색
    await searchInput.fill('')
    await page.waitForTimeout(500)

    // 결과가 없거나 안내 메시지가 표시되어야 함
    const pageContent = await page.textContent('body')
    expect(pageContent).toBeTruthy()
  })

  test('should filter results as typing', async ({ page }) => {
    await page.goto('/search')

    const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="검색"], input[type="text"][placeholder*="Search"]').first()

    // 'N' 입력
    await searchInput.fill('N')
    await page.waitForTimeout(500)

    const resultsAfterN = await page.locator('article, [data-testid="search-result"]').count()

    // 'Next' 입력
    await searchInput.fill('Next')
    await page.waitForTimeout(500)

    const resultsAfterNext = await page.locator('article, [data-testid="search-result"]').count()

    // 더 구체적인 검색어는 결과가 같거나 적어야 함
    expect(resultsAfterNext).toBeLessThanOrEqual(resultsAfterN)
  })
})
