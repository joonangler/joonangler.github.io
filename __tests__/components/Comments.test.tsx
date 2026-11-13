import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const seen: Array<Record<string, unknown>> = []

vi.mock('@giscus/react', () => ({
  default: (props: Record<string, unknown>) => {
    seen.push(props)
    return null
  },
}))

import { Comments } from '@/components/Comments'

describe('Comments', () => {
  beforeEach(() => {
    seen.length = 0
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('uses the transparent dark theme so the iframe melts into the black page', () => {
    vi.stubEnv('NEXT_PUBLIC_GISCUS_REPO', 'owner/repo')
    vi.stubEnv('NEXT_PUBLIC_GISCUS_REPO_ID', 'R_1')
    vi.stubEnv('NEXT_PUBLIC_GISCUS_CATEGORY', 'General')
    vi.stubEnv('NEXT_PUBLIC_GISCUS_CATEGORY_ID', 'DIC_1')
    render(<Comments />)
    expect(seen).toHaveLength(1)
    expect(seen[0].theme).toBe('transparent_dark')
  })

  it('renders nothing when the environment values are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_GISCUS_REPO', '')
    vi.stubEnv('NEXT_PUBLIC_GISCUS_REPO_ID', '')
    vi.stubEnv('NEXT_PUBLIC_GISCUS_CATEGORY', '')
    vi.stubEnv('NEXT_PUBLIC_GISCUS_CATEGORY_ID', '')
    const { container } = render(<Comments />)
    expect(container.innerHTML).toBe('')
    expect(seen).toHaveLength(0)
  })
})
