import { test, expect } from '@playwright/test'

// 바닥에도 같은 이름의 링크가 있고, getByRole은 display:none인 요소를 건너뛴다 — 내비의 탭 묶음으로 범위를 좁혀야 의미가 있다.
const tabs = (page: import('@playwright/test').Page) => page.locator('#site-nav-tabs')

test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })

  test('every ready tab is reachable on a narrow screen', async ({ page }) => {
    await page.goto('/')
    for (const name of ['서비스', '블로그', '문의']) {
      await expect(tabs(page).getByRole('link', { name, exact: true })).toBeVisible()
    }
  })
})

test.describe('with javascript', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('tabs are folded until the menu button is pressed, and open tabs are at least 44px tall', async ({ page }) => {
    await page.goto('/')
    await expect(tabs(page)).toBeHidden()
    await page.getByRole('button', { name: '메뉴' }).click()
    const tab = tabs(page).getByRole('link', { name: '서비스', exact: true })
    await expect(tab).toBeVisible()
    expect((await tab.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('new screens without javascript', () => {
  test.use({ javaScriptEnabled: false })

  // 숨김은 카드 자신이 아니라 바깥 래퍼(.rise-in)·제목(.reveal)이 쥔다 — 조상까지 올라가며 실제로 보이는지 잰다.
  for (const path of ['/', '/services/', '/services/web-app-fix/', '/contact/']) {
    test(`${path}: nothing in main is hidden by the reveal styles`, async ({ page }) => {
      await page.goto(path)
      const hidden = await page.evaluate(() => {
        const out: string[] = []
        for (const el of document.querySelectorAll<HTMLElement>('main *')) {
          if (!el.textContent?.trim() || el.closest('.sr-only')) continue // sr-only는 일부러 화면에서만 숨긴다
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
      expect(hidden).toEqual([])
    })
  }
})
