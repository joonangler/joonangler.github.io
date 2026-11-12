import { useRef } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DotField } from '@/components/dots/DotField'

/* jsdom에는 캔버스·관찰자·rAF가 없다 — 가짜로 바꾼다 */
let ctx: Record<string, ReturnType<typeof vi.fn> | string>
let raf: ReturnType<typeof vi.fn>
let caf: ReturnType<typeof vi.fn>
const io = {
  cb: null as null | ((entries: { isIntersecting: boolean }[]) => void),
  trigger(v: boolean) {
    act(() => io.cb?.([{ isIntersecting: v }]))
  },
}
const mm = {
  reduce: false,
  listeners: [] as ((e: { matches: boolean }) => void)[],
  setReduce(v: boolean) {
    mm.reduce = v
    act(() => mm.listeners.forEach((l) => l({ matches: v })))
  },
}

beforeEach(() => {
  ctx = { clearRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), setTransform: vi.fn(), fillStyle: '' }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ctx as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
  )
  raf = vi.fn(() => 1)
  caf = vi.fn()
  vi.stubGlobal('requestAnimationFrame', raf)
  vi.stubGlobal('cancelAnimationFrame', caf)
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(function (this: unknown, cb: (entries: { isIntersecting: boolean }[]) => void) {
      io.cb = cb
      return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }
    })
  )
  io.cb = null
  mm.reduce = false
  mm.listeners = []
  vi.stubGlobal(
    'matchMedia',
    vi.fn((q: string) => ({
      get matches() {
        return q.includes('reduce') ? mm.reduce : false
      },
      media: q,
      addEventListener: (_: string, l: (e: { matches: boolean }) => void) => mm.listeners.push(l),
      removeEventListener: (_: string, l: (e: { matches: boolean }) => void) => {
        mm.listeners = mm.listeners.filter((x) => x !== l)
      },
    }))
  )
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function Field() {
  const slot = useRef<HTMLDivElement>(null)
  return (
    <div>
      <div ref={slot} />
      <DotField mode="shapes" mask="home" slotRef={slot} />
    </div>
  )
}
const renderField = () => render(<Field />)

describe('DotField', () => {
  it('starts the loop when visible', () => {
    renderField()
    io.trigger(true)
    expect(raf).toHaveBeenCalled()
  })
  it('stops when it leaves the viewport', () => {
    renderField()
    io.trigger(true)
    io.trigger(false)
    expect(caf).toHaveBeenCalled()
    expect(raf).toHaveBeenCalledTimes(1)
  })
  it('stops when the tab is hidden', () => {
    renderField()
    io.trigger(true)
    caf.mockClear()
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(caf).toHaveBeenCalled()
    expect(raf).toHaveBeenCalledTimes(1)
  })
  it('pause button stops the loop and flips its label', () => {
    renderField()
    io.trigger(true)
    caf.mockClear()
    fireEvent.click(screen.getByRole('button', { name: '배경 멈춤' }))
    expect(screen.getByRole('button', { name: '배경 재생' }).getAttribute('aria-pressed')).toBe('true')
    expect(caf).toHaveBeenCalled()
    expect(raf).toHaveBeenCalledTimes(1)
  })
  it('reduced motion draws one still frame and never asks for a frame', () => {
    mm.reduce = true
    renderField()
    io.trigger(true)
    expect(raf).not.toHaveBeenCalled()
    expect(ctx.arc).toHaveBeenCalled()
  })
  it('reduced motion turned on mid-session stops the loop', () => {
    renderField()
    io.trigger(true)
    caf.mockClear()
    mm.setReduce(true)
    expect(caf).toHaveBeenCalled()
    expect(raf).toHaveBeenCalledTimes(1)
  })
  it('canvas is decorative', () => {
    renderField()
    expect(document.querySelector('canvas')!.getAttribute('aria-hidden')).toBe('true')
  })
  it('draws nothing and throws nothing without a 2d context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)
    expect(() => {
      renderField()
      io.trigger(true)
    }).not.toThrow()
    expect(raf).not.toHaveBeenCalled()
  })
  it('cleans up listeners on unmount', () => {
    const { unmount } = renderField()
    io.trigger(true)
    unmount()
    expect(mm.listeners).toHaveLength(0)
  })
})
