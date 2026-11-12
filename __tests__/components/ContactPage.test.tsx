import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContactPage from '@/app/contact/page'
import { CONTACT_PAGE } from '@/content/site'

afterEach(() => vi.unstubAllEnvs())

describe('ContactPage', () => {
  it('shows the lead as a band, the address, the hints and the consult line', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', 'someone@example.com')
    render(<ContactPage />)
    expect(screen.getByRole('heading', { level: 1, name: '문의' })).toBeTruthy()
    expect(screen.getByText('하려는 일을 알려 주세요')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'someone@example.com' }).getAttribute('href')).toBe('mailto:someone@example.com')
    expect(screen.getByRole('heading', { name: '보낼 때 적으면 좋은 것' })).toBeTruthy()
    for (const h of CONTACT_PAGE.hints) expect(screen.getByText(h)).toBeTruthy()
    expect(screen.getByText(CONTACT_PAGE.consult)).toBeTruthy()
  })

  it('does not hide the address behind the scroll reveal — it is the LCP on a phone', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', 'someone@example.com')
    render(<ContactPage />)
    expect(screen.getByRole('link', { name: 'someone@example.com' }).closest('.rise-in')).toBeNull()
  })

  it('draws no address block when none is set (dev) — nothing is faked', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', '')
    render(<ContactPage />)
    expect(screen.queryByRole('link', { name: /@/ })).toBeNull()
    expect(screen.queryByRole('button', { name: '복사' })).toBeNull()
  })
})
