import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('shows the hero sentence and its sub line', async ({ page }) => {
    await page.goto('/')
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    expect((await h1.textContent())!.replace(/\s+/g, ' ').trim()).toBe('만들고, 내놓고, 수익까지 도전합니다')
    await expect(page.getByText('AI와 함께 답을 찾아가며, 그 과정을 기록으로 남깁니다.')).toBeVisible()
  })

  test('has the site nav, a decorative canvas and a pause button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation').first()).toBeVisible()
    expect(await page.locator('canvas').first().getAttribute('aria-hidden')).toBe('true')
    const pause = page.getByRole('button', { name: '배경 멈춤' })
    await expect(pause).toBeVisible()
    await pause.click()
    await expect(page.getByRole('button', { name: '배경 재생' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('the hero is not hidden under the floating nav', async ({ page }) => {
    await page.goto('/')
    const navBox = await page.locator('.site-nav').boundingBox()
    const h1Box = await page.getByRole('heading', { level: 1 }).boundingBox()
    expect(h1Box!.y).toBeGreaterThan(navBox!.y + navBox!.height)
  })

  test('is branded Joonangler and offers the three ready tabs', async ({ page }) => {
    await page.goto('/')
    // 문서 제목은 NEXT_PUBLIC_SITE_NAME(.env.production)에서 오는데 개발 서버는 이 파일을 읽지 않는다 — 운영 빌드의 out/index.html로 따로 본다
    await expect(page.locator('.site-nav__name')).toHaveText('Joonangler')
    const tabs = page.locator('#site-nav-tabs').getByRole('link')
    await expect(tabs).toHaveCount(3)
  })

  test('should have footer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
  })
})
