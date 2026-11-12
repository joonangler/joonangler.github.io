import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatWon, fromPrice, getAllServices, getServiceBySlug } from '@/lib/services'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('services', () => {
  it('reads fixture services in order', () => {
    expect(getAllServices().map((s) => s.slug)).toEqual(['alpha', 'beta'])
  })
  it('computes the starting price', () => {
    expect(formatWon(fromPrice(getServiceBySlug('alpha')!))).toBe('59,000원')
  })
  it('defaults optional lists to empty', () => {
    const beta = getServiceBySlug('beta')!
    expect(beta.faq).toEqual([])
    expect(beta.steps).toEqual([])
    expect(beta.prepare).toEqual([])
    expect(beta.after).toEqual([])
    expect(beta.related).toEqual([])
    expect(beta.provisional).toBe(false)
  })
  it('keeps the body and the provisional flag', () => {
    const alpha = getServiceBySlug('alpha')!
    expect(alpha.body.trim()).toBe('이런 일을 합니다.')
    expect(alpha.provisional).toBe(true)
    expect(alpha.headline).toEqual(['첫 줄,', '둘째 줄'])
  })
  it('returns null for an unknown slug', () => {
    expect(getServiceBySlug('nope')).toBeNull()
  })
  it.each(['bad-price', 'unknown-related', 'missing-title'])('rejects %s with the file name', (dir) => {
    vi.stubEnv('SERVICES_DIR', path.join(__dirname, '../fixtures/services-invalid', dir))
    expect(() => getAllServices()).toThrow(new RegExp(`${dir}\\.mdx`))
  })
})
