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
