import { describe, expect, it } from 'vitest'
import { WORD_DELAYS, toWordLines } from '@/lib/words'

describe('toWordLines', () => {
  it('numbers words across lines with shrinking gaps', () => {
    const r = toWordLines([['만들고,'], ['내놓고,'], ['수익까지', '도전합니다']])
    expect(r.map((l) => l.map((w) => w.text))).toEqual([['만들고,'], ['내놓고,'], ['수익까지', '도전합니다']])
    expect(r.flat().map((w) => w.delay)).toEqual([0, 90, 170, 240])
  })
  it('splits string lines on spaces and caps the delay at the seventh word', () => {
    const r = toWordLines(['가 나 다 라', '마 바 사 아 자'])
    expect(r[0].map((w) => w.text)).toEqual(['가', '나', '다', '라'])
    expect(r.flat().map((w) => w.delay)).toEqual([0, 90, 170, 240, 300, 350, 390, 390, 390])
    expect(WORD_DELAYS).toEqual([0, 90, 170, 240, 300, 350, 390])
  })
})
