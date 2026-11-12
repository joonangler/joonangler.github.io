import { test, expect } from '@playwright/test'

test.describe('dark only', () => {
  test.use({ colorScheme: 'light' })

  test('html is dark even when the device prefers light', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('html').getAttribute('class')).toContain('dark')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('dark')
  })

  test('there is no theme toggle', async ({ page }) => {
    await page.goto('/posts/')
    // 토글은 마운트 뒤에야 그려진다 — 기다리지 않으면 0으로 공허하게 통과한다
    await page.waitForLoadState('networkidle')
    await expect(page.locator('button[aria-label*="theme" i]')).toHaveCount(0)
  })
})
