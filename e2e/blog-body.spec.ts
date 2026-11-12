import { test, expect, type Page } from '@playwright/test'

// kitchen-sink 글의 본문 요소를 계산 스타일로 본다
const css = (page: Page, sel: string, prop: string) =>
  page.locator(sel).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop)

test('body links are white and underlined', async ({ page }) => {
  await page.goto('/posts/kitchen-sink/')
  for (const sel of ['.prose a[href="/posts/filler-01/"]', '.prose a[target="_blank"]']) {
    const s = await page
      .locator(sel)
      .first()
      .evaluate((el) => {
        const c = getComputedStyle(el)
        return [c.color, c.textDecorationLine, c.textDecorationColor]
      })
    expect(s, sel).toEqual(['rgb(255, 255, 255)', 'underline', 'rgba(255, 255, 255, 0.5)'])
  }
})

test('table, quote, rule and callouts use line and surface only', async ({ page }) => {
  await page.goto('/posts/kitchen-sink/')
  expect(await css(page, '.prose th', 'border-top-color')).toBe('rgba(255, 255, 255, 0.12)')
  expect(await css(page, '.prose thead', 'background-color')).toBe('rgba(255, 255, 255, 0.06)')
  expect(await css(page, '.prose blockquote', 'font-style')).toBe('normal')
  expect(await css(page, '.prose hr', 'border-top-color')).toBe('rgba(255, 255, 255, 0.12)')
  // 글 안의 알림 상자만 센다 — Next 개발 서버의 쪽 이동 알림(role="alert")은 뺀다
  const callouts = await page.locator('.prose [role="alert"]').evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor))
  expect(callouts).toHaveLength(4)
  expect(new Set(callouts)).toEqual(new Set(['rgba(255, 255, 255, 0.06)']))
})

test('code blocks are one dark theme on a surface with a ring', async ({ page }) => {
  await page.goto('/posts/kitchen-sink/')
  const block = '[role="region"]'
  expect(await css(page, block, 'background-color')).toBe('rgba(255, 255, 255, 0.06)')
  expect(await css(page, block, 'box-shadow')).toContain('rgba(255, 255, 255, 0.09)')
  expect(await css(page, '.highlighted', 'border-left-color')).toBe('rgba(255, 255, 255, 0.5)')
  // 테마가 하나면 Shiki가 글자색을 바로 단다 — 두 벌 변수(--shiki-light)가 없다
  const style = await page.locator('pre code span[style]').first().getAttribute('style')
  expect(style).toContain('color:')
  expect(style).not.toContain('--shiki-light')
})

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false })
  test('an h1 reached by #anchor sits below the floating nav', async ({ page }) => {
    await page.goto('/posts/kitchen-sink/')
    const id = await page.locator('.prose h1').first().getAttribute('id')
    await page.goto('/posts/kitchen-sink/#' + encodeURIComponent(id!))
    const navBottom = await page.locator('.site-nav').evaluate((el) => el.getBoundingClientRect().bottom)
    expect((await page.locator('.prose h1').first().boundingBox())!.y).toBeGreaterThanOrEqual(navBottom)
  })
})
