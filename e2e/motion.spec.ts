import { test, expect } from '@playwright/test'

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('words only fade and the canvas stands still', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('.hero-word').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('fade')
    await page.waitForTimeout(800)
    const a = await page.locator('canvas').first().screenshot()
    await page.waitForTimeout(1000)
    const b = await page.locator('canvas').first().screenshot()
    expect(a.equals(b)).toBe(true)
  })
})

test('without reduced motion the canvas moves', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(800)
  const a = await page.locator('canvas').first().screenshot()
  await page.waitForTimeout(1000)
  expect(a.equals(await page.locator('canvas').first().screenshot())).toBe(false)
})

test('words rise one after another when scripts run', async ({ page }) => {
  await page.goto('/')
  const words = page.locator('.hero-word')
  expect(await words.first().evaluate((el) => getComputedStyle(el).animationName)).toBe('rise')
  expect(await words.nth(3).evaluate((el) => getComputedStyle(el).animationDelay)).toBe('0.24s')
})

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false })
  test('the sentence is visible and does not animate', async ({ page }) => {
    await page.goto('/')
    const w = page.locator('.hero-word').first()
    await expect(w).toBeVisible()
    expect(await w.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
    expect(await w.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    await expect(page.getByText('AI와 함께 답을 찾아가며, 그 과정을 기록으로 남깁니다.')).toBeVisible()
    await expect(page.locator('.dot-pause')).toBeHidden()
  })
})
