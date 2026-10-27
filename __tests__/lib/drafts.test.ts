import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { draftsEnabled, getDraftsPath } from '@/lib/drafts'

afterEach(() => vi.unstubAllEnvs())

describe('draftsEnabled', () => {
  it('is false under NODE_ENV=test with no flag', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '')
    expect(draftsEnabled()).toBe(false)
  })
  it('is true when INCLUDE_DRAFTS=1', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    expect(draftsEnabled()).toBe(true)
  })
  it('is true when NODE_ENV=development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(draftsEnabled()).toBe(true)
  })
  it('is false when NODE_ENV=production even with INCLUDE_DRAFTS=0', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('INCLUDE_DRAFTS', '0')
    expect(draftsEnabled()).toBe(false)
  })
})

describe('getDraftsPath', () => {
  it('uses DRAFTS_DIR when set', () => {
    vi.stubEnv('DRAFTS_DIR', '/tmp/x')
    expect(getDraftsPath()).toBe('/tmp/x')
  })
  it('defaults to content/drafts under cwd', () => {
    vi.stubEnv('DRAFTS_DIR', '')
    expect(getDraftsPath()).toBe(path.join(process.cwd(), 'content', 'drafts'))
  })
})
