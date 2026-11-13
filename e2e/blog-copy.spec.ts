import { test, expect } from '@playwright/test'
import { BLOG_PAGES } from './helpers/blog-pages'

// 고유 이름·형식 이름·키 이름·코드 언어 이름만 남는다(계획 §1-6 「그대로 두는 것」). hello.ts는 시험용 글의 코드 블록 제목(글 내용)이다
const ALLOWED = /^(Joonangler(\.log)?|GitHub|RSS|Atom|JSON|Ctrl\+K|K|Esc|ts|bash|diff|typescript|hello\.ts)$/

for (const path of BLOG_PAGES) {
  test(`${path} has no English UI copy`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const words = await page.evaluate(() => {
      const latin = (s: string | null) => s?.match(/[A-Za-z][A-Za-z.+]*/g) ?? []
      const out: string[] = []
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      while (w.nextNode()) {
        const t = w.currentNode as Text
        if (!t.parentElement!.closest('pre, code, .katex, script, style')) out.push(...latin(t.textContent))
      }
      for (const el of document.querySelectorAll('[aria-label],[title],[placeholder],img[alt]'))
        for (const a of ['aria-label', 'title', 'placeholder', 'alt']) out.push(...latin(el.getAttribute(a)))
      return out
    })
    expect(words.filter((w) => !ALLOWED.test(w))).toEqual([])
  })
}
