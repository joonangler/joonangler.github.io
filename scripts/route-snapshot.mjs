// 블로그 주소(html·사이트맵·RSS)를 한 줄씩 뽑는다. 글 주소가 그대로인지 기준본과 대조하는 데 쓴다.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const BLOG_PATH = /^\/(posts|series|tags|search)(\/|$)/

function normalize(p) {
  return p.endsWith('/') ? p : `${p}/`
}

function toPath(url) {
  return normalize(url.replace(/^https?:\/\/[^/]+/, ''))
}

function matchAll(xml, tag) {
  return [...xml.matchAll(new RegExp(`<${tag}>\\s*([^<]*?)\\s*</${tag}>`, 'g'))].map((m) => m[1])
}

// htmlFiles의 첫 조각은 출력 폴더 이름(예: out)이다.
export function collectBlogRoutes({ htmlFiles, sitemapXml, feedXml }) {
  const lines = []
  for (const file of htmlFiles) {
    const m = file.replace(/\\/g, '/').match(/^[^/]+(\/.*)?\/index\.html$/)
    if (!m) continue
    const route = normalize(m[1] ?? '/')
    if (BLOG_PATH.test(route)) lines.push(`html ${route}`)
  }
  for (const loc of matchAll(sitemapXml, 'loc')) {
    const route = toPath(loc)
    if (BLOG_PATH.test(route)) lines.push(`sitemap ${route}`)
  }
  for (const link of matchAll(feedXml, 'link')) {
    const route = toPath(link)
    if (BLOG_PATH.test(route)) lines.push(`rss ${route}`)
  }
  return [...new Set(lines)].sort()
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name === 'index.html') out.push(full)
  }
  return out
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const outDir = path.resolve(process.argv[2] ?? 'out')
  const name = path.basename(outDir)
  const htmlFiles = walk(outDir).map((f) => path.join(name, path.relative(outDir, f)))
  const read = (f) => (fs.existsSync(path.join(outDir, f)) ? fs.readFileSync(path.join(outDir, f), 'utf8') : '')
  const lines = collectBlogRoutes({ htmlFiles, sitemapXml: read('sitemap.xml'), feedXml: read('rss.xml') })
  process.stdout.write(lines.join('\n') + '\n')
}
