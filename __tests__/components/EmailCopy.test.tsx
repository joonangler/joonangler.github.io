import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { EmailCopy } from '@/components/contact/EmailCopy'

const ADDRESS = 'someone@example.com'
afterEach(() => {
  Object.assign(navigator, { clipboard: undefined })
  window.getSelection()?.removeAllRanges()
})

describe('EmailCopy', () => {
  it('copies the address', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<EmailCopy email={ADDRESS} />)
    expect(screen.getByRole('link', { name: ADDRESS }).getAttribute('href')).toBe(`mailto:${ADDRESS}`)
    fireEvent.click(screen.getByRole('button', { name: '복사' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('복사했습니다'))
    expect(writeText).toHaveBeenCalledWith(ADDRESS)
  })

  it('selects the text when the clipboard is missing', async () => {
    Object.assign(navigator, { clipboard: undefined })
    render(<EmailCopy email={ADDRESS} />)
    fireEvent.click(screen.getByRole('button', { name: '복사' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('주소를 선택했습니다. 복사해 주세요'))
    expect(window.getSelection()!.toString()).toBe(ADDRESS)
  })

  it('selects the text when writeText rejects', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    render(<EmailCopy email={ADDRESS} />)
    fireEvent.click(screen.getByRole('button', { name: '복사' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('주소를 선택했습니다. 복사해 주세요'))
    expect(window.getSelection()!.toString()).toBe(ADDRESS)
  })

  it('has a polite live region that is empty until something happens', () => {
    render(<EmailCopy email={ADDRESS} />)
    const status = screen.getByRole('status')
    expect(status.getAttribute('aria-live')).toBe('polite')
    expect(status.textContent).toBe('')
  })

  it('announces again when the same message repeats — each result is a freshly inserted node', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    render(<EmailCopy email={ADDRESS} />)
    const press = () => fireEvent.click(screen.getByRole('button', { name: '복사' }))
    press()
    const first = await screen.findByText('복사했습니다')
    press()
    await waitFor(() => expect(screen.getByText('복사했습니다')).not.toBe(first))
    expect(screen.getAllByText('복사했습니다')).toHaveLength(1)
  })
})
