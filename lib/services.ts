import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getAllWork } from '@/lib/work'

/**
 * 서비스 자료. 항목 하나가 `content/services/<slug>.mdx` 하나다.
 * 값이 틀리면 파일 이름과 함께 던져 빌드를 멈춘다 — 빈 카드가 조용히 나가지 않게(Review Focus 5).
 */

export interface ServicePrice {
  name: string
  scope: string
  days: number
  won: number
}

export interface Service {
  slug: string
  title: string
  summary: string
  headline: string[]
  sub: string
  order: number
  prices: ServicePrice[]
  pricesLead?: string
  pricesNote?: string
  steps: { title: string; body: string }[]
  prepare: string[]
  after: string[]
  faq: { q: string; a: string }[]
  related: string[]
  contactLine: string
  provisional: boolean
  body: string
}

function servicesDir(): string {
  return process.env.SERVICES_DIR ?? path.join(process.cwd(), 'content', 'services')
}

const isPositiveInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0

function parseService(file: string, raw: string, workSlugs: Set<string>): Service {
  const { data, content } = matter(raw)
  const fail = (msg: string): never => {
    throw new Error(`${file}: ${msg}`)
  }
  const str = (key: string): string => {
    const v = data[key]
    return typeof v === 'string' && v.trim() !== '' ? v : fail(`'${key}' 값이 없습니다`)
  }
  const optStr = (key: string): string | undefined => (typeof data[key] === 'string' ? data[key] : undefined)
  const list = <T>(key: string): T[] => {
    const v = data[key]
    if (v === undefined || v === null) return []
    return Array.isArray(v) ? (v as T[]) : fail(`'${key}'는 목록입니다`)
  }

  const headline = list<string>('headline')
  if (headline.length === 0) fail(`'headline' 값이 없습니다`)

  const prices = list<ServicePrice>('prices')
  if (prices.length === 0) fail(`'prices'가 비었습니다`)
  prices.forEach((p, i) => {
    if (!isPositiveInt(p?.won)) fail(`prices[${i}].won은 양의 정수입니다`)
    if (!isPositiveInt(p?.days)) fail(`prices[${i}].days는 양의 정수입니다`)
  })

  const related = list<string>('related')
  for (const r of related) if (!workSlugs.has(r)) fail(`related의 '${r}'는 작업에 없습니다`)

  if (typeof data.order !== 'number') fail(`'order'는 숫자입니다`)

  return {
    slug: file.replace(/\.mdx$/, ''),
    title: str('title'),
    summary: str('summary'),
    headline,
    sub: str('sub'),
    order: data.order,
    prices,
    pricesLead: optStr('pricesLead'),
    pricesNote: optStr('pricesNote'),
    steps: list('steps'),
    prepare: list('prepare'),
    after: list('after'),
    faq: list('faq'),
    related,
    contactLine: str('contactLine'),
    provisional: data.provisional === true,
    body: content,
  }
}

export function getAllServices(): Service[] {
  const dir = servicesDir()
  if (!fs.existsSync(dir)) return []
  const workSlugs = new Set(getAllWork().map((w) => w.slug))
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => parseService(file, fs.readFileSync(path.join(dir, file), 'utf8'), workSlugs))
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
}

export function getServiceBySlug(slug: string): Service | null {
  return getAllServices().find((s) => s.slug === slug) ?? null
}

/** 가장 작은 가격 — 카드의 「…원부터」. */
export function fromPrice(service: Service): number {
  return Math.min(...service.prices.map((p) => p.won))
}

export function formatWon(won: number): string {
  return `${won.toLocaleString('ko-KR')}원`
}
