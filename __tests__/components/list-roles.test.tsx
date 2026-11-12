import fs from 'fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import Home from '@/app/page'
import ServicesPage from '@/app/services/page'
import ContactPage from '@/app/contact/page'
import { SiteFooter } from '@/components/site/SiteFooter'
import { ServiceSections } from '@/components/services/ServiceSections'
import { getServiceBySlug } from '@/lib/services'
import { getAllWork } from '@/lib/work'

afterEach(() => vi.unstubAllEnvs())

// list-style: none을 단 목록은 Safari의 VoiceOver가 목록으로 읽지 않는다 — role="list"를 달아야 의미가 전해진다.
// CSS에서 list-style: none을 쓰는 클래스를 직접 뽑아, 그 클래스를 단 모든 요소가 role="list"인지 본다.
function listStyleNoneClasses(): string[] {
  const css = fs.readFileSync('app/globals.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const out = new Set<string>()
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*list-style:\s*none[^{}]*)\}/g)) {
    for (const sel of m[1].split(',')) {
      const cls = sel.trim().match(/^\.([\w-]+)$/)
      if (cls) out.add(cls[1])
    }
  }
  return [...out]
}

describe('lists whose bullets are removed keep their list role', () => {
  it('every element with a list-style:none class has role="list"', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', 'someone@example.com')
    vi.stubEnv('NEXT_PUBLIC_GITHUB_URL', 'https://github.com/example')
    const classes = listStyleNoneClasses()
    expect(classes.length).toBeGreaterThanOrEqual(7) // 자료가 바뀌어 0개가 되면 시험이 공허해진다
    const alpha = getServiceBySlug('alpha')!
    const works = getAllWork()
    const views = [
      render(await Home()),
      render(<ServicesPage />),
      render(<ContactPage />),
      render(<SiteFooter />),
      render(<ServiceSections service={alpha} body={null} works={works} />),
    ]
    const missing: string[] = []
    const seen = new Set<string>()
    for (const v of views) {
      for (const cls of classes) {
        for (const el of v.container.querySelectorAll(`.${cls}`)) {
          seen.add(cls)
          if (el.getAttribute('role') !== 'list') missing.push(`${el.tagName.toLowerCase()}.${cls}`)
        }
      }
    }
    expect([...seen].sort()).toEqual([...classes].sort())
    expect(missing).toEqual([])
  })
})
