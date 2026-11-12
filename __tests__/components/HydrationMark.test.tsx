import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { HydrationMark } from '@/components/site/HydrationMark'

describe('HydrationMark', () => {
  it('raises the mark the guard script looks for once mounted', () => {
    delete (window as unknown as { __hydrated?: boolean }).__hydrated
    render(<HydrationMark />)
    expect((window as unknown as { __hydrated?: boolean }).__hydrated).toBe(true)
  })
})
