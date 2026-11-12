/**
 * 첫 화면 문장의 낱말 등장 지연. 뒤로 갈수록 간격이 준다(시안 GAPS).
 * 낱말 k번째(줄을 넘어 이어 센다)는 WORD_DELAYS[min(k, 6)]ms.
 */
export const WORD_DELAYS = [0, 90, 170, 240, 300, 350, 390] as const

export function toWordLines(lines: string[] | string[][]): { text: string; delay: number }[][] {
  let k = 0
  return lines.map((line) => {
    const words = typeof line === 'string' ? line.split(/\s+/).filter(Boolean) : line
    return words.map((text) => ({ text, delay: WORD_DELAYS[Math.min(k++, WORD_DELAYS.length - 1)] }))
  })
}
