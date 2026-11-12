import { afterEach, describe, expect, it, vi } from 'vitest'
import { getContactEmail } from '@/lib/constants'

afterEach(() => vi.unstubAllEnvs())

describe('getContactEmail', () => {
  it('throws in production without an address', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', '')
    expect(() => getContactEmail()).toThrow(/NEXT_PUBLIC_AUTHOR_EMAIL/)
  })
  it('returns the address when it is set', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', 'someone@example.com')
    expect(getContactEmail()).toBe('someone@example.com')
  })
  it('is empty outside production when unset — dev and tests do not need an address', () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', '')
    expect(getContactEmail()).toBe('')
  })
  it('example.com appears only on the address line — the release check greps for it, so no comment may carry the word', async () => {
    const fs = await import('fs')
    const lines = fs.readFileSync('.env.production', 'utf8').split('\n').filter((l) => l.includes('example.com'))
    expect(lines).toEqual(['NEXT_PUBLIC_AUTHOR_EMAIL=someone@example.com'])
  })
  it('the committed production env holds the placeholder address, never a real one', async () => {
    const fs = await import('fs')
    const env = fs.readFileSync('.env.production', 'utf8')
    expect(env).toMatch(/^NEXT_PUBLIC_AUTHOR_EMAIL=someone@example\.com$/m)
  })
})
