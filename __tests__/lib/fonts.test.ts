import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const dir = path.join(process.cwd(), 'public/fonts/pretendard')
describe('vendored Pretendard', () => {
  it('ships the dynamic subset css with every file it points to', () => {
    const css = fs.readFileSync(path.join(dir, 'pretendardvariable-dynamic-subset.css'), 'utf8')
    const urls = [...css.matchAll(/url\(\.\/([^)]+)\)/g)].map((m) => m[1])
    expect(urls).toHaveLength(92)
    for (const u of urls) expect(fs.existsSync(path.join(dir, u))).toBe(true)
    expect(css).toContain("font-family: 'Pretendard Variable'")
  })
  it('is linked from the root layout and Inter is gone', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')
    expect(src).toContain('/fonts/pretendard/pretendardvariable-dynamic-subset.css')
    expect(src).not.toContain('next/font/google')
  })
})
