import { test, expect } from '@playwright/test'

test('a fine pointer raises the card ring', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('link', { name: /막힌 웹·앱/ })
  await card.scrollIntoViewIfNeeded()
  const before = await card.evaluate((el) => getComputedStyle(el).boxShadow)
  await card.hover()
  await page.waitForTimeout(250)
  expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(before)
})

test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 393, height: 851 } })

  test('a coarse pointer gets no hover ring', async ({ page }) => {
    await page.goto('/')
    const card = page.getByRole('link', { name: /막힌 웹·앱/ })
    await card.scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false)
    const before = await card.evaluate((el) => getComputedStyle(el).boxShadow)
    await card.hover() // :hover는 걸리지만 미디어 조건이 막아야 한다
    await page.waitForTimeout(250)
    expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(before)
  })
})
