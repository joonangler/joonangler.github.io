import { test, expect } from '@playwright/test'

// 낮은 띠(서비스 목록·문의, 뒤 묶음의 작업·소개)의 멈춤 단추가 제목·한 문장 글자를 덮지 않는다.
// 글줄의 실제 자리는 Range로 잰다(문단 상자는 글보다 넓다).
for (const width of [320, 390, 768, 1024]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 700 } })
    for (const path of ['/services/', '/contact/']) {
      test(`${path}: the pause button does not cover the band text`, async ({ page }) => {
        await page.goto(path)
        await expect(page.getByRole('button', { name: '배경 멈춤' })).toBeVisible()
        const overlaps = await page.evaluate(() => {
          const btn = document.querySelector('.dot-pause')!.getBoundingClientRect()
          const hit: string[] = []
          for (const el of document.querySelectorAll('.page-band h1, .page-band p')) {
            const range = document.createRange()
            range.selectNodeContents(el)
            for (const r of range.getClientRects()) {
              if (r.width > 0 && r.left < btn.right && r.right > btn.left && r.top < btn.bottom && r.bottom > btn.top) hit.push(el.tagName)
            }
          }
          return hit
        })
        expect(overlaps).toEqual([])
      })
    }
  })
}
