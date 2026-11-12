import fs from 'fs'
import path from 'path'
import { describe, it, expect } from 'vitest'

/**
 * 색은 토큰 클래스(text-foreground·bg-card·border-border …)로만 쓴다.
 * Tailwind 팔레트 색 이름(gray·blue·yellow …)과 흰색·검정 직접 클래스는 다시 들어오지 못하게 막는다.
 * 넷째 묶음 작업 3~5가 차례로 대상을 넓힌다 — 아직 정리하지 않은 폴더·파일은 NOT_YET에 둔다.
 */
export const NOT_YET: string[] = []

const NAMED =
  /\b(bg|text|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|decoration|shadow)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\b(bg|text|border)-(white|black)\b/

const ROOT = path.resolve(__dirname, '../..')

function files(dirs: string[], ext: RegExp): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) walk(full)
      else if (ext.test(e.name)) out.push(path.relative(ROOT, full))
    }
  }
  for (const d of dirs) walk(path.join(ROOT, d))
  return out
}

function lines(file: string): Array<{ no: number; text: string }> {
  return fs
    .readFileSync(path.join(ROOT, file), 'utf8')
    .split('\n')
    .map((text, i) => ({ no: i + 1, text }))
}

describe('색 이름 클래스', () => {
  it('no file draws with Tailwind palette colors', () => {
    const hits = files(['app', 'components'], /\.(tsx?|css)$/)
      .filter((f) => !NOT_YET.some((p) => f.startsWith(p)))
      .flatMap((f) => lines(f).filter((l) => NAMED.test(l.text)).map((l) => `${f}:${l.no}`))
    expect(hits).toEqual([])
  })
})
