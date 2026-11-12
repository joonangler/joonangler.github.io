import { test, expect } from '@playwright/test'
import { BLOG_PAGES } from './helpers/blog-pages'
import { lowContrast } from './helpers/contrast'

// 등장 애니메이션 중간의 옅은 상태를 재지 않도록 모션 줄이기로 연다
test.use({ reducedMotion: 'reduce' })

for (const path of BLOG_PAGES) {
  test(`${path} text is 4.5:1 or better`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    expect(await lowContrast(page)).toEqual([])
  })
}

// 초점 (Review Focus 4) — 검정 위에서 초점 고리는 흰색이고 고리 사이 띠는 검정이다
test('focus ring on a TOC link is white with a black gap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/posts/kitchen-sink/')
  await page.waitForLoadState('networkidle')
  // 스크립트 초점은 마지막 입력이 마우스가 아니면 :focus-visible에 걸린다. 걸리지 않으면 Tab으로 닿게 한다.
  const link = page.locator('aside nav a').first()
  await link.focus()
  const shadow = await link.evaluate((el) => getComputedStyle(el).boxShadow)
  expect(shadow).toContain('rgb(255, 255, 255)')
  expect(shadow).not.toMatch(/rgb\(60, 131, 246\)|rgb\(59, 130, 246\)/)
  expect(shadow).toMatch(/rgb\(0, 0, 0\) 0px 0px 0px 2px/)
})
