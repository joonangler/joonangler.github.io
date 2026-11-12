import { afterEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { render, screen } from '@testing-library/react'
import { PriceList } from '@/components/services/PriceList'
import { StepList } from '@/components/services/StepList'
import { ServiceHero } from '@/components/services/ServiceHero'
import { ServiceSections } from '@/components/services/ServiceSections'
import { generateStaticParams, generateMetadata } from '@/app/services/[slug]/page'
import { getServiceBySlug } from '@/lib/services'
import { getAllWork } from '@/lib/work'

const alpha = getServiceBySlug('alpha')!
const beta = getServiceBySlug('beta')!
const works = getAllWork().filter((w) => alpha.related.includes(w.slug))
const href = (el: HTMLElement) => el.getAttribute('href')!

afterEach(() => vi.unstubAllEnvs())

describe('PriceList', () => {
  it('lists prices as rows with days and won', () => {
    render(<PriceList prices={alpha.prices} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(3)
    expect(rows[0].textContent).toContain('2일')
    expect(rows[0].textContent).toContain('59,000원')
    expect(document.querySelector('ul')!.id).toBe('prices')
  })
  it('writes the lead before and the note after the rows', () => {
    render(<PriceList prices={alpha.prices} lead="가격 앞말" note="가격 덧말" />)
    expect(screen.getByText('가격 앞말')).toBeTruthy()
    expect(screen.getByText('가격 덧말')).toBeTruthy()
  })
})

describe('StepList', () => {
  it('numbers the steps', () => {
    render(<StepList steps={alpha.steps} />)
    expect(screen.getByRole('list').tagName).toBe('OL')
  })
})

describe('ServiceHero', () => {
  it('hero buttons go to contact and prices', () => {
    render(<ServiceHero service={alpha} />)
    expect(href(screen.getByRole('link', { name: '문의하기' })).replace(/\/$/, '')).toBe('/contact')
    expect(href(screen.getByRole('link', { name: '가격 보기' }))).toBe('#prices')
  })
  it('writes the headline as the h1 and the sub line', () => {
    render(<ServiceHero service={alpha} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent!.replace(/\s+/g, ' ').trim()).toBe('첫 줄, 둘째 줄')
    expect(screen.getByText('보조 문장입니다.')).toBeTruthy()
  })
  it('the canvas draws no shapes (plain)', () => {
    render(<ServiceHero service={alpha} />)
    expect(document.querySelector('canvas')!.className).toContain('dot-mask-service')
  })
})

describe('ServiceSections', () => {
  const names = ['이런 일을 합니다', '가격', '진행 순서', '준비해 주실 것', '납품 뒤', '자주 묻는 질문', '관련 작업']
  const has = (n: string) => screen.queryByRole('heading', { level: 2, name: n }) !== null

  it('draws every section a full service has, in order', () => {
    render(<ServiceSections service={alpha} body={<p>본문</p>} works={works} />)
    const order = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(order).toEqual([...names, alpha.contactLine])
  })

  it('skips empty sections', () => {
    render(<ServiceSections service={beta} body={null} works={[]} />)
    expect(has('자주 묻는 질문')).toBe(false)
    expect(has('납품 뒤')).toBe(false)
    expect(has('진행 순서')).toBe(false)
    expect(has('준비해 주실 것')).toBe(false)
    expect(has('관련 작업')).toBe(false)
    expect(has('이런 일을 합니다')).toBe(false)
    expect(has('가격')).toBe(true)
    expect(screen.getByRole('heading', { level: 2, name: beta.contactLine })).toBeTruthy()
  })

  it('related work cards are not links until the work tab is ready', () => {
    render(<ServiceSections service={alpha} body={null} works={works} />)
    expect(screen.getByText(works[0].title)).toBeTruthy()
    expect(screen.queryAllByRole('link').filter((a) => href(a).startsWith('/work'))).toHaveLength(0)
  })
})

describe('related work label', () => {
  it('own work cards on a service page say 직접 운영', () => {
    render(<ServiceSections service={alpha} body={null} works={works} />)
    expect(works[0].kind).toBe('own')
    expect(screen.getByText('직접 운영')).toBeTruthy()
  })
  it('a client work is never labelled 직접 운영', () => {
    const client = getAllWork().filter((w) => w.kind === 'client')
    expect(client.length).toBeGreaterThan(0)
    render(<ServiceSections service={alpha} body={null} works={client} />)
    expect(screen.queryByText('직접 운영')).toBeNull()
  })
})

describe('page', () => {
  it('builds a page per fixture service', async () => {
    expect(await generateStaticParams()).toEqual([{ slug: 'alpha' }, { slug: 'beta' }])
  })
  it('stops the build when there is no service at all', async () => {
    vi.stubEnv('SERVICES_DIR', fs.mkdtempSync(path.join(os.tmpdir(), 'no-services-')))
    await expect(generateStaticParams()).rejects.toThrow('content/services에 서비스가 하나도 없다')
  })
  it('takes title and description from the service', async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'alpha' }) })
    expect(meta.title).toBe('알파 서비스')
    expect(meta.description).toBe('모든 목록을 가진 픽스처')
  })
})
