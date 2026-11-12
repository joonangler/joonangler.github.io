import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/**
 * 작업 자료. 항목 하나가 `content/work/<slug>.mdx` 하나다(슬러그는 파일 이름).
 * 테스트는 `WORK_DIR`로 fixtures를 가리킨다 — 부를 때마다 읽어 `vi.stubEnv`가 먹는다.
 */

export type WorkKind = 'own' | 'client'

export interface Work {
  slug: string
  title: string
  summary: string
  kind: WorkKind
  order: number
  cover: string
  coverAlt: string
  url?: string
  body: string
}

function workDir(): string {
  return process.env.WORK_DIR ?? path.join(process.cwd(), 'content', 'work')
}

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const v = data[key]
  if (typeof v !== 'string' || v.trim() === '') throw new Error(`${file}: '${key}' 값이 없습니다`)
  return v
}

export function getAllWork(): Work[] {
  const dir = workDir()
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'))
      const kind = data.kind
      if (kind !== 'own' && kind !== 'client') throw new Error(`${file}: 'kind'는 own 또는 client입니다`)
      if (typeof data.order !== 'number') throw new Error(`${file}: 'order'는 숫자입니다`)
      const work: Work = {
        slug: file.replace(/\.mdx$/, ''),
        title: requireString(data, 'title', file),
        summary: requireString(data, 'summary', file),
        kind,
        order: data.order,
        cover: requireString(data, 'cover', file),
        coverAlt: requireString(data, 'coverAlt', file),
        body: content,
      }
      if (typeof data.url === 'string' && data.url) work.url = data.url
      return work
    })
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
}

export function workKindLabel(kind: WorkKind): '직접 운영' | '의뢰 작업' {
  return kind === 'own' ? '직접 운영' : '의뢰 작업'
}
