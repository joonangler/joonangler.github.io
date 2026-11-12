import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

// SITE_CONFIG는 모듈이 읽힐 때 환경값을 굳히므로, 값을 바꾼 뒤 모듈을 새로 읽는다
async function load() {
  vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'Joonangler')
  vi.stubEnv('NEXT_PUBLIC_BLOG_NAME', 'Joonangler.log')
  vi.resetModules()
  return import('@/lib/json-ld')
}

describe('json-ld names', () => {
  it('WebSite is the site name', async () => {
    const { generateWebSiteSchema } = await load()
    expect(generateWebSiteSchema().name).toBe('Joonangler')
  })
  it('Blog is the blog name, not the site name', async () => {
    const { generateBlogSchema } = await load()
    expect(generateBlogSchema().name).toBe('Joonangler.log')
  })
})

describe('json-ld never carries the contact address', () => {
  const ADDRESS = 'private-test@address.invalid'

  it('no schema holds the address even when it is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', ADDRESS)
    const j = await load()
    const post = {
      title: 't',
      description: 'd',
      date: '2026-01-01',
      tags: ['a'],
      series: undefined,
      coverImage: undefined,
      modifiedDate: undefined,
      author: undefined,
    } as unknown as Parameters<typeof j.generateBlogPostingSchema>[0]
    const all = JSON.stringify([
      j.generateWebSiteSchema(),
      j.generateBlogSchema(),
      j.generatePersonSchema(),
      j.generateBlogPostingSchema(post, 's'),
    ])
    expect(all).not.toContain(ADDRESS)
    expect(all).not.toContain('"email"')
  })
})
