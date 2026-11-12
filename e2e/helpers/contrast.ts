import type { Page } from '@playwright/test'

export interface LowContrast {
  el: string
  text: string
  ratio: number
}

/**
 * 보이는 글자의 대비를 잰다(WCAG 상대 휘도).
 * 글자색은 조상 바탕을 겹쳐 쌓은 실제 바탕 위에 합성한다. 색 문자열은 1×1 캔버스에 칠해 읽는다 —
 * 계산 스타일이 `oklab()`·`color-mix()`로 나와 정규식으로는 읽히지 않는다.
 * `.sr-only`·`[aria-hidden="true"]`·`canvas`·KaTeX의 숨은 MathML 안은 뺀다. 결과는 대비가 낮은 순.
 */
export async function lowContrast(page: Page, min = 4.5): Promise<LowContrast[]> {
  return page.evaluate((limit) => {
    const cv = document.createElement('canvas')
    cv.width = cv.height = 1
    const ctx = cv.getContext('2d', { willReadFrequently: true })!
    const paint = (css: string, alpha = 1) => {
      ctx.fillStyle = '#ff00ff'
      ctx.fillStyle = css
      if (ctx.fillStyle === '#ff00ff' && css.trim().toLowerCase() !== '#ff00ff') throw new Error(`색을 읽지 못함: ${css}`)
      ctx.globalAlpha = alpha
      ctx.fillRect(0, 0, 1, 1)
      ctx.globalAlpha = 1
    }
    const px = () => Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3)
    const lum = ([r, g, b]: number[]) => {
      const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const name = (el: Element) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`
    const skip = 'script, style, noscript, canvas, .sr-only, [aria-hidden="true"], .katex-mathml'
    const seen = new Set<Element>()
    const found: Array<{ el: string; text: string; ratio: number }> = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      const el = node.parentElement
      if (!el || !node.textContent!.trim() || seen.has(el) || el.closest(skip)) continue
      seen.add(el)
      if (el.getClientRects().length === 0 || getComputedStyle(el).visibility === 'hidden') continue
      // html부터 el까지 바탕을 쌓고, 누적 불투명도를 곱한다
      const chain: Element[] = []
      for (let n: Element | null = el; n; n = n.parentElement) chain.unshift(n)
      ctx.clearRect(0, 0, 1, 1)
      paint('#000')
      let opacity = 1
      for (const n of chain) {
        const s = getComputedStyle(n)
        opacity *= parseFloat(s.opacity)
        const bg = s.backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') paint(bg)
      }
      if (opacity === 0) continue
      const bg = px()
      paint(getComputedStyle(el).color, opacity)
      const fg = px()
      const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a)
      const ratio = (hi + 0.05) / (lo + 0.05)
      if (ratio < limit) found.push({ el: name(el), text: node.textContent!.trim().slice(0, 30), ratio: Math.round(ratio * 100) / 100 })
    }
    return found.sort((a, b) => a.ratio - b.ratio)
  }, min)
}
