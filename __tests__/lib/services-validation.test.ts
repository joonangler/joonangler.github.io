import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllServices } from '@/lib/services'

// 자료 하나를 임시 폴더에 써서 읽어 본다. YAML은 JSON을 그대로 받으므로 프런트매터는 JSON으로 쓴다.
let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'svc-validation-'))
  vi.stubEnv('SERVICES_DIR', dir)
})
afterEach(() => {
  vi.unstubAllEnvs()
  fs.rmSync(dir, { recursive: true, force: true })
})

const base = () => ({
  title: '제목',
  summary: '요약',
  headline: ['한 줄'],
  sub: '보조',
  order: 1,
  prices: [{ name: '하나', scope: '범위', days: 1, won: 1000 }],
  steps: [{ title: '단계', body: '내용' }],
  prepare: ['준비'],
  after: ['납품 뒤'],
  faq: [{ q: '질문', a: '답' }],
  contactLine: '알려 주세요',
})

function load(patch: (d: ReturnType<typeof base>) => void) {
  const data = base()
  patch(data)
  fs.writeFileSync(path.join(dir, 'bad.mdx'), `---\n${JSON.stringify(data)}\n---\n`)
  return () => getAllServices()
}

describe('service data validation', () => {
  it('accepts the well-formed base (the cases below fail for their own reason, not for the base)', () => {
    expect(load(() => {})()).toHaveLength(1)
  })

  const bad: [string, (d: ReturnType<typeof base>) => void, RegExp][] = [
    ['price name is a number', (d) => ((d.prices[0] as { name: unknown }).name = 5), /prices\[0\]\.name/],
    ['price name is missing', (d) => delete (d.prices[0] as { name?: string }).name, /prices\[0\]\.name/],
    ['price scope is a number', (d) => ((d.prices[0] as { scope: unknown }).scope = 5), /prices\[0\]\.scope/],
    ['price scope is empty', (d) => (d.prices[0].scope = '  '), /prices\[0\]\.scope/],
    ['step title is a number', (d) => ((d.steps[0] as { title: unknown }).title = 5), /steps\[0\]\.title/],
    ['step body is missing', (d) => delete (d.steps[0] as { body?: string }).body, /steps\[0\]\.body/],
    ['step is a bare string', (d) => ((d.steps as unknown[])[0] = '단계'), /steps\[0\]/],
    ['faq question is a number', (d) => ((d.faq[0] as { q: unknown }).q = 5), /faq\[0\]\.q/],
    ['faq answer is missing', (d) => delete (d.faq[0] as { a?: string }).a, /faq\[0\]\.a/],
    ['prepare holds a number', (d) => ((d.prepare as unknown[])[0] = 5), /prepare\[0\]/],
    ['after holds a number', (d) => ((d.after as unknown[])[0] = 5), /after\[0\]/],
    ['headline holds a number', (d) => ((d.headline as unknown[])[0] = 5), /headline\[0\]/],
  ]

  it.each(bad)('stops with the file name when %s', (_name, patch, key) => {
    const run = load(patch)
    expect(run).toThrow(/bad\.mdx/)
    expect(run).toThrow(key)
  })
})
