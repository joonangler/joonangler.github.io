import { describe, expect, it } from 'vitest'
import fs from 'fs'

// 피드 스크립트는 out/에 쓰므로 단위로 돌리지 않는다. 실제 산출물 검사는 운영 빌드 뒤 grep으로 한다(status).
describe('feed script', () => {
  it('does not read the contact address — feeds must not carry it', () => {
    const src = fs.readFileSync('scripts/generate-rss.mjs', 'utf8')
    expect(src).not.toMatch(/AUTHOR_EMAIL/)
  })
})
