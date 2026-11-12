import { test, expect } from '@playwright/test'

// 인쇄할 때는 스크롤 등장으로 숨긴 구역이 모두 보여야 한다. 숨김은 바깥 래퍼가 쥐므로 조상 곱으로 잰다.
for (const path of ['/', '/services/', '/services/web-app-fix/']) {
  test(`${path}: nothing in main is hidden when printing`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('html')).toHaveClass(/\bjs\b/)
    // 첫 화면의 페이드인(끝나는 애니메이션)이 끝난 뒤에 잰다 — 인쇄와 무관한 중간값을 숨김으로 읽지 않게
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished),
      ),
    )
    await page.emulateMedia({ media: 'print' })
    const hidden = await page.evaluate(() => {
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
    expect(hidden).toEqual([])
  })
}
