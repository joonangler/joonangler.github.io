import { test, expect } from '@playwright/test'
import { BLOG_PAGES } from './helpers/blog-pages'

const widths = [320, 390, 768, 1024, 1440]
const paths = [...new Set(['/', '/services/', '/services/web-app-fix/', '/contact/', '/posts/', ...BLOG_PAGES])]

for (const width of widths) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } })
    for (const path of paths) {
      test(`${path} does not scroll sideways, clips nothing, and shows its h1`, async ({ page }) => {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
        const { scrollWidth, innerWidth, past } = await page.evaluate(() => {
          const w = window.innerWidth
          // 첫 화면 같은 구역은 overflow: clip이라 넘쳐도 scrollWidth가 안 커진다 — 글자가 잘리는 것까지 잡으려고 요소의 오른쪽 끝도 잰다.
          // 가로 스크롤 상자(코드·표·블록 수식) 안의 것은 제외한다.
          const past = [...document.querySelectorAll<HTMLElement>('body *')]
            .filter((el) => !el.closest('pre, table, .overflow-x-auto, .katex-display, canvas'))
            .filter((el) => {
              const r = el.getBoundingClientRect()
              return r.width > 0 && r.right > w + 1
            })
            .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
          return { scrollWidth: document.documentElement.scrollWidth, innerWidth: w, past }
        })
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth)
        expect(past).toEqual([])
      })
    }
  })
}
