import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeBlockHeader } from '@/components/mdx/CodeBlockHeader'

describe('CodeBlockHeader', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('names the copy button in Korean, with and without a language', () => {
    const { rerender } = render(<CodeBlockHeader code="x" language="ts" />)
    expect(screen.getByRole('button', { name: 'ts 코드 복사' }).getAttribute('title')).toBe('코드 복사')
    expect(screen.getByText('복사')).toBeTruthy()
    rerender(<CodeBlockHeader code="x" />)
    expect(screen.getByRole('button', { name: '코드 복사' })).toBeTruthy()
  })

  it('says it copied, then resets', async () => {
    vi.useFakeTimers()
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    render(<CodeBlockHeader code="x" language="ts" />)
    await act(async () => { screen.getByRole('button', { name: 'ts 코드 복사' }).click() })
    expect(screen.getByText('복사했습니다')).toBeTruthy()
    await act(async () => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText('복사')).toBeTruthy()
  })

  // Review Focus 3 — 클립보드가 거절하면 조용히 실패하지 않는다
  it('says it could not copy when the clipboard refuses, then resets', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) } })
    render(<CodeBlockHeader code="x" language="ts" />)
    await act(async () => { screen.getByRole('button', { name: 'ts 코드 복사' }).click() })
    expect(screen.getByText('복사하지 못했습니다')).toBeTruthy()
    await act(async () => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText('복사')).toBeTruthy()
  })
})
