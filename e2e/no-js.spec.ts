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
