import { test, expect } from '@playwright/test'

test('html gets the js class when scripts run', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('html').getAttribute('class')).toContain('js')
})

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false })

  test('html has no js class', async ({ page }) => {
    await page.goto('/')
    expect((await page.locator('html').getAttribute('class')) ?? '').not.toContain('js')
  })
})

// 올림 효과는 마우스처럼 올릴 수 있는 기기에서만 건다. 닿지 않는 tap({ trial })이 아니라 hover()로 :hover를 건 뒤 잰다.
const tabBackground = (page: import('@playwright/test').Page) =>
  page
    .locator('.site-nav__tab:not([aria-current])')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor)

test.describe('hover lift on a fine pointer', () => {
  test('the tab background rises on hover with a mouse', async ({ page }) => {
    await page.goto('/')
    const matches = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)
    expect(matches).toBe(true)
    const before = await tabBackground(page)
    await page.locator('.site-nav__tab:not([aria-current])').first().hover()
    await expect.poll(() => tabBackground(page)).not.toBe(before)
  })
})

test.describe('hover lift on touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 1000, height: 800 } })

  test('hover() does not raise the tab background on a touch device', async ({ page }) => {
    await page.goto('/')
    const matches = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)
    expect(matches).toBe(false)
    const before = await tabBackground(page)
    await page.locator('.site-nav__tab:not([aria-current])').first().hover()
    await page.waitForTimeout(400) // 색 전환 150ms를 지난 뒤
    expect(await tabBackground(page)).toBe(before)
  })
})
