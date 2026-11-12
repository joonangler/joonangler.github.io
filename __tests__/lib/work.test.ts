import { describe, expect, it } from 'vitest'
import { getAllWork, workKindLabel } from '@/lib/work'

describe('work', () => {
  it('reads fixture work in order with kind labels', () => {
    const w = getAllWork()
    expect(w.map((x) => x.slug)).toEqual(['one', 'two'])
    expect(workKindLabel(w[0].kind)).toBe('직접 운영')
    expect(workKindLabel(w[1].kind)).toBe('의뢰 작업')
  })
  it('keeps optional url and body', () => {
    const [one, two] = getAllWork()
    expect(one.url).toBe('https://example.com')
    expect(two.url).toBeUndefined()
    expect(two.body.trim()).toBe('본문입니다.')
  })
})
