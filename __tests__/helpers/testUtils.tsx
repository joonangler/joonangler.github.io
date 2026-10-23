import { afterAll, beforeAll, vi } from 'vitest'
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * 커스텀 render 함수
 * 필요한 Provider를 자동으로 래핑
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { ...options })
}

// re-export everything
export * from '@testing-library/react'
export { customRender as render }

/**
 * 비동기 대기 헬퍼
 */
export const waitFor = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock 파일 시스템 헬퍼
 */
export function createMockFileSystem(files: Record<string, string>) {
  return {
    readFile: (path: string) => {
      if (path in files) {
        return Promise.resolve(files[path])
      }
      return Promise.reject(new Error(`File not found: ${path}`))
    },
    exists: (path: string) => Promise.resolve(path in files),
  }
}

/**
 * Console 에러/경고 억제 헬퍼
 */
export function suppressConsole() {
  const originalError = console.error
  const originalWarn = console.warn

  beforeAll(() => {
    console.error = vi.fn()
    console.warn = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
    console.warn = originalWarn
  })
}

/**
 * Date.now() 모킹 헬퍼
 */
export function mockDateNow(timestamp: number) {
  const original = Date.now
  Date.now = vi.fn(() => timestamp)
  return () => {
    Date.now = original
  }
}

/**
 * localStorage 모킹 헬퍼
 */
export function createMockLocalStorage() {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}
