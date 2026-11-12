import { bundledThemes } from 'shiki'
import { describe, it, expect } from 'vitest'
import { mdxOptions } from '@/lib/mdx'

// rgb(255 255 255 / 0.06)을 #000 위에 합성한 코드 블록 면
const SURFACE_ON_BLACK = '#0f0f0f'

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const prettyCodeOptions = () => {
  const [, opts] = mdxOptions.mdxOptions.rehypePlugins[0] as unknown as [unknown, { theme: unknown }]
  return opts
}

describe('코드 강조 테마', () => {
  it('uses one dark theme', () => {
    expect(prettyCodeOptions().theme).toBe('github-dark-dimmed')
  })

  it('every token color without its own background is 4.5:1 on the code surface', async () => {
    const name = prettyCodeOptions().theme as keyof typeof bundledThemes
    const theme = (await bundledThemes[name]()).default
    const fgs = (theme.tokenColors ?? [])
      .filter((t) => t.settings.foreground && !t.settings.background)
      .map((t) => t.settings.foreground!.slice(0, 7))
    // 범위가 없는 글자는 테마의 기본 글자색을 쓴다
    const base = theme.colors?.['editor.foreground']
    if (base) fgs.push(base.slice(0, 7))
    const low = [...new Set(fgs)].filter((c) => contrast(c, SURFACE_ON_BLACK) < 4.5)
    expect(low).toEqual([])
  })

  // 자기 바탕을 가진 토큰은 그 바탕이 버려지므로(HTML에 background-color가 나오지 않는다) 글자색만으로 잰다 — 못 미치는 것은 알려진 예외 하나뿐이다.
  // #2d333b(markup.ignored)는 바탕 #6cb6ff를 잃으면 코드 면 위에서 1.5:1이다. diff·마크다운의 드문 범위라 고치지 않는다(계획 §1-4).
  it('the only token with its own background that falls short is the known markup.ignored one', async () => {
    const name = prettyCodeOptions().theme as keyof typeof bundledThemes
    const theme = (await bundledThemes[name]()).default
    const withBg = (theme.tokenColors ?? [])
      .filter((t) => t.settings.foreground && t.settings.background)
      .map((t) => t.settings.foreground!.slice(0, 7).toLowerCase())
    const low = [...new Set(withBg)].filter((c) => contrast(c, SURFACE_ON_BLACK) < 4.5)
    expect(low).toEqual(['#2d333b'])
  })
})
