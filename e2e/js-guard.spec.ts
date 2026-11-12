import { test, expect, type Page } from '@playwright/test'

const WAIT_MS = 3500 // 안전 장치(lib/js-guard.ts)의 3초보다 길게

// 요소에서 body까지 올라가며 opacity 곱과 clip-path를 본다(숨김은 바깥 래퍼가 쥔다 — e2e-clip-래퍼-공허)
async function hiddenInMain(page: Page) {
  return page.evaluate(() => {
    const out: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>('main *')) {
      if (!el.textContent?.trim() || el.closest('.sr-only')) continue
      let opacity = 1
      let clipped = false
      for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n)
        opacity *= parseFloat(cs.opacity)
        if (cs.clipPath !== 'none') clipped = true
      }
      if (opacity < 1 || clipped) out.push(`${el.tagName.toLowerCase()}.${el.className}`)
    }
    return out
  })
}

const blockBundles = (page: Page) => page.route(/\/_next\/static\/.*\.js(\?.*)?$/, (route) => route.abort())

test.describe('js guard — bundles blocked', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const path of ['/', '/services/', '/services/web-app-fix/']) {
    test(`${path}: after the wait the js class is gone and nothing in main stays hidden`, async ({ page }) => {
      await blockBundles(page)
      await page.goto(path)
      await page.waitForTimeout(WAIT_MS)
      await expect(page.locator('html')).not.toHaveClass(/\bjs\b/)
      expect(await hiddenInMain(page)).toEqual([])
    })
  }

  test('all ready tabs are visible on a narrow screen', async ({ page }) => {
    await blockBundles(page)
    await page.goto('/')
    await page.waitForTimeout(WAIT_MS)
    for (const name of ['서비스', '블로그', '문의']) {
      await expect(page.locator('#site-nav-tabs').getByRole('link', { name, exact: true })).toBeVisible()
    }
  })
})

test.describe('js guard — bundles served', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the js class survives the wait and scroll reveal still works', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(WAIT_MS)
    await expect(page.locator('html')).toHaveClass(/\bjs\b/)
    const below = page.locator('.rise-in:not(.is-in), .reveal:not(.is-in)')
    expect(await below.count()).toBeGreaterThan(0) // 아직 안 본 구역은 숨어 있다
    await page.mouse.wheel(0, 4000)
    await expect(page.locator('.rise-in.is-in, .reveal.is-in').first()).toBeVisible()
    await expect(page.locator('html')).toHaveClass(/\bjs\b/)
  })
})
