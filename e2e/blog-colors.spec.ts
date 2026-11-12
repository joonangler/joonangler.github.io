import { test, expect, type Page } from '@playwright/test'

// 계산 스타일로 본다 — 새 토큰이 실제로 칠해지는지
const css = (page: Page, sel: string, prop: string) =>
  page.locator(sel).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop)

test('blog sits on pure black with white text', async ({ page }) => {
  for (const path of ['/', '/posts/', '/posts/kitchen-sink/']) {
    await page.goto(path)
    expect(await css(page, 'body', 'background-color'), path).toBe('rgb(0, 0, 0)')
  }
  await page.goto('/posts/kitchen-sink/')
  expect(await css(page, 'main h1', 'color')).toBe('rgb(255, 255, 255)')
  expect(await css(page, 'main header time', 'color')).toBe('rgba(255, 255, 255, 0.64)')
})

test('tag badges are white on a 6% surface', async ({ page }) => {
  await page.goto('/posts/kitchen-sink/')
  const badge = 'main header a[href^="/tags/"] span'
  expect(await css(page, badge, 'background-color')).toBe('rgba(255, 255, 255, 0.06)')
  expect(await css(page, badge, 'color')).toBe('rgb(255, 255, 255)')
})

test('lines are 12% white, not light gray', async ({ page }) => {
  await page.goto('/search/')
  await page.waitForLoadState('networkidle')
  // 검색 칸은 autoFocus라 가만 두면 초점 테두리를 잰다 — 쉴 때의 선 색을 재려고 초점을 떼고, 색 전환이 끝나길 기다린다
  await page.locator('main input').first().blur()
  await expect.poll(() => css(page, 'main input', 'border-top-color')).toBe('rgba(255, 255, 255, 0.12)')
  // 색을 주지 않은 border의 기본값(@layer base)
  const plain = await page.evaluate(() => {
    const d = document.createElement('div')
    d.className = 'border'
    document.body.append(d)
    return getComputedStyle(d).borderTopColor
  })
  expect(plain).toBe('rgba(255, 255, 255, 0.12)')
})
