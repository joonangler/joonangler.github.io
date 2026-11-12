import { describe, expect, it } from 'vitest'
import { collectBlogRoutes } from '../../scripts/route-snapshot.mjs'

const base = { htmlFiles: [], sitemapXml: '<urlset></urlset>', feedXml: '<rss><channel></channel></rss>' }

describe('collectBlogRoutes', () => {
  it('keeps blog html routes only', () => {
    const r = collectBlogRoutes({ ...base, htmlFiles: ['out/index.html', 'out/posts/a/index.html', 'out/services/index.html', 'out/tags/x/index.html'] })
    expect(r).toEqual(['html /posts/a/', 'html /tags/x/'])
  })
  it('reads sitemap loc and drops lastmod and origin', () => {
    const xml = '<urlset><url><loc>https://joonangler.github.io/posts/a/</loc><lastmod>2026-11-13T00:00:00Z</lastmod></url><url><loc>https://joonangler.github.io/</loc></url></urlset>'
    expect(collectBlogRoutes({ ...base, sitemapXml: xml })).toEqual(['sitemap /posts/a/'])
  })
  it('reads rss item links', () => {
    const xml = '<rss><channel><item><link>https://joonangler.github.io/posts/b/</link></item></channel></rss>'
    expect(collectBlogRoutes({ ...base, feedXml: xml })).toEqual(['rss /posts/b/'])
  })
})
