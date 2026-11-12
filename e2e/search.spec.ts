import { test, expect, type Page } from '@playwright/test'

const input = (page: Page) => page.getByPlaceholder('검색어를 입력하세요...')

// 하이드레이션 전에 채우면 입력 칸에는 글자가 있어도 검색 상태는 비어 있다 — 켜진 뒤에 연다
async function openSearch(page: Page) {
  await page.goto('/search/')
  await page.waitForLoadState('networkidle')
}

test.describe('Search Functionality', () => {
  test('should have search interface', async ({ page }) => {
    await page.goto('/search')
    await expect(input(page)).toBeVisible()
  })

  test('finds a post by its title', async ({ page }) => {
    await openSearch(page)
    await input(page).fill('모든 요소')
    await expect(page.getByRole('heading', { name: /모든 요소를 담은 글/ })).toBeVisible()
  })

  test('says so when nothing matches', async ({ page }) => {
    await openSearch(page)
    await input(page).fill('없는낱말')
    await expect(page.getByText('"없는낱말"에 대한 검색 결과가 없습니다')).toBeVisible()
  })

  test('a longer query narrows the results', async ({ page }) => {
    // 구역 머리의 「글」 링크(/posts/)는 세지 않는다
    const results = page.locator('main a[href^="/posts/"]:not([href="/posts/"])')
    // 결과 줄(「N개의 검색 결과 - "검색어"」)이 그 검색어로 바뀐 뒤에 센다 — 대기 중 뼈대 화면의 0을 세지 않게
    const summary = page.getByText('개의 검색 결과')
    await openSearch(page)
    await input(page).fill('글')
    await expect(summary).toContainText('- "글"')
    const broad = await results.count()
    expect(broad).toBeGreaterThan(1)
    await input(page).fill('채움 글 01')
    await expect(summary).toContainText('- "채움 글 01"')
    const narrow = await results.count()
    expect(narrow).toBeGreaterThan(0)
    expect(narrow).toBeLessThan(broad)
  })

  test('should handle empty search', async ({ page }) => {
    await page.goto('/search')
    await input(page).fill('')
    await page.waitForTimeout(500)
    const pageContent = await page.textContent('body')
    expect(pageContent).toBeTruthy()
  })
})
