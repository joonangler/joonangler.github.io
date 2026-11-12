import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { JS_GUARD_MS, JS_GUARD_SCRIPT } from '@/lib/js-guard'

// 머리의 인라인 스크립트를 그대로 실행해 본다(jsdom의 document·window를 쓴다)
function runGuard() {
  new Function(JS_GUARD_SCRIPT)()
}

beforeEach(() => {
  vi.useFakeTimers()
  document.documentElement.className = ''
  delete (window as unknown as { __hydrated?: boolean }).__hydrated
})
afterEach(() => vi.useRealTimers())

describe('js guard', () => {
  it('adds the js class at once', () => {
    runGuard()
    expect(document.documentElement.classList.contains('js')).toBe(true)
  })

  it('drops the js class when the screen code never stood after the wait', () => {
    runGuard()
    vi.advanceTimersByTime(JS_GUARD_MS)
    expect(document.documentElement.classList.contains('js')).toBe(false)
  })

  it('keeps the js class while still waiting', () => {
    runGuard()
    vi.advanceTimersByTime(JS_GUARD_MS - 1)
    expect(document.documentElement.classList.contains('js')).toBe(true)
  })

  it('does nothing once the mark is up — the timer is a no-op on the normal path', () => {
    runGuard()
    ;(window as unknown as { __hydrated?: boolean }).__hydrated = true
    vi.advanceTimersByTime(JS_GUARD_MS * 10)
    expect(document.documentElement.classList.contains('js')).toBe(true)
  })

  it('waits three seconds', () => {
    expect(JS_GUARD_MS).toBe(3000)
  })
})
