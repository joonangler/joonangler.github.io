import { afterEach, describe, expect, it, vi } from 'vitest'
import { getChannels } from '@/lib/channels'

afterEach(() => vi.unstubAllEnvs())

describe('channels', () => {
  it('drops channels without a url', () => {
    vi.stubEnv('NEXT_PUBLIC_GITHUB_URL', 'https://github.com/joonangler')
    vi.stubEnv('NEXT_PUBLIC_THREADS_URL', '')
    expect(getChannels().map((c) => c.name)).toEqual(['GitHub'])
  })
})
