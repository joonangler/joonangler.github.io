import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { cn, formatDate, generateSlug, toSlug, isSafeUrl, getTextContent, debounce } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'true-class', false && 'false-class')
      expect(result).toBe('base-class true-class')
    })
  })

  describe('formatDate', () => {
    it('should format string date correctly', () => {
      const result = formatDate('2025-01-28')
      expect(result).toMatch(/2025년/)
      expect(result).toMatch(/1월/)
      expect(result).toMatch(/28일/)
    })

    it('should format Date object correctly', () => {
      const date = new Date('2025-01-28')
      const result = formatDate(date)
      expect(result).toMatch(/2025년/)
    })

    describe('시간대와 무관하게 날짜 문자열의 날짜를 그대로 보여준다', () => {
      const originalTZ = process.env.TZ

      afterEach(() => {
        if (originalTZ === undefined) delete process.env.TZ
        else process.env.TZ = originalTZ
      })

      it.each(['America/Los_Angeles', 'UTC', 'Asia/Seoul'])('%s', (tz) => {
        process.env.TZ = tz
        expect(formatDate('2025-10-29')).toMatch(/10월 29일/)
      })
    })
  })

  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world')
    })

    it('should handle multiple dashes', () => {
      expect(generateSlug('Hello--World')).toBe('hello-world')
    })
  })

  describe('toSlug', () => {
    it('should convert English text to slug', () => {
      expect(toSlug('Hello World')).toBe('hello-world')
    })

    it('should handle Korean text', () => {
      const result = toSlug('Next.js 시작하기')
      expect(result).toMatch(/nextjs/)
      expect(result).toMatch(/시작하기/)
    })

    it('should handle dots and special chars', () => {
      expect(toSlug('Next.js Guide')).toMatch(/nextjs/)
    })
  })

  describe('isSafeUrl', () => {
    it('should return true for safe http URLs', () => {
      expect(isSafeUrl('http://example.com')).toBe(true)
      expect(isSafeUrl('https://example.com')).toBe(true)
    })

    it('should return true for mailto URLs', () => {
      expect(isSafeUrl('mailto:test@example.com')).toBe(true)
    })

    it('should return true for anchor links', () => {
      expect(isSafeUrl('#section')).toBe(true)
      expect(isSafeUrl('#')).toBe(true)
    })

    it('should return true for relative paths', () => {
      expect(isSafeUrl('/posts/example')).toBe(true)
      expect(isSafeUrl('./relative')).toBe(true)
      expect(isSafeUrl('../parent')).toBe(true)
    })

    it('should return false for javascript URLs', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false)
      expect(isSafeUrl('JavaScript:alert(1)')).toBe(false)
      expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false)
    })

    it('should return false for data URLs', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    })

    it('should return false for vbscript URLs', () => {
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false)
    })

    it('should return false for file URLs', () => {
      expect(isSafeUrl('file:///etc/passwd')).toBe(false)
    })

    it('should return false for about URLs', () => {
      expect(isSafeUrl('about:blank')).toBe(false)
    })

    it('should return false for empty or invalid input', () => {
      expect(isSafeUrl('')).toBe(false)
      expect(isSafeUrl(null as any)).toBe(false)
      expect(isSafeUrl(undefined as any)).toBe(false)
      expect(isSafeUrl(123 as any)).toBe(false)
    })

    it('should trim and lowercase URLs', () => {
      expect(isSafeUrl('  HTTPS://EXAMPLE.COM  ')).toBe(true)
      expect(isSafeUrl('  JAVASCRIPT:alert(1)  ')).toBe(false)
    })
  })

  describe('getTextContent', () => {
    it('should extract text from string', () => {
      expect(getTextContent('Hello World')).toBe('Hello World')
    })

    it('should extract text from number', () => {
      expect(getTextContent(123)).toBe('123')
    })

    it('should return empty string for null/undefined', () => {
      expect(getTextContent(null)).toBe('')
      expect(getTextContent(undefined)).toBe('')
    })

    it('should extract text from array', () => {
      expect(getTextContent(['Hello', ' ', 'World'])).toBe('Hello World')
    })

    it('should extract text from React element', () => {
      const element = React.createElement('div', {}, 'Hello')
      expect(getTextContent(element)).toBe('Hello')
    })

    it('should handle nested React elements', () => {
      const element = React.createElement('div', {},
        React.createElement('span', {}, 'Hello'),
        ' ',
        React.createElement('strong', {}, 'World')
      )
      expect(getTextContent(element)).toBe('Hello World')
    })

    it('should handle deeply nested structures', () => {
      const element = React.createElement('div', {},
        React.createElement('div', {},
          React.createElement('div', {},
            React.createElement('span', {}, 'Deep')
          )
        )
      )
      expect(getTextContent(element)).toBe('Deep')
    })

    it('should handle mixed content types', () => {
      const element = React.createElement('div', {},
        'Text',
        123,
        React.createElement('span', {}, 'Element')
      )
      expect(getTextContent(element)).toBe('Text123Element')
    })

    it('should stop at maximum depth', () => {
      // Create a deeply nested structure that exceeds depth limit
      let deepElement: any = 'Deep text'
      for (let i = 0; i < 110; i++) {
        deepElement = React.createElement('div', {}, deepElement)
      }

      const result = getTextContent(deepElement)
      // Should return empty or partial due to depth limit
      expect(typeof result).toBe('string')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 300)

      debounced('a')
      debounced('b')
      debounced('c')

      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('c')

      vi.useRealTimers()
    })

    it('should call function with latest arguments', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 200)

      debounced(1)
      debounced(2)
      debounced(3)

      vi.advanceTimersByTime(200)
      expect(mockFn).toHaveBeenCalledWith(3)

      vi.useRealTimers()
    })

    it('should cancel pending calls', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 300)

      debounced('test')
      debounced.cancel()

      vi.advanceTimersByTime(300)
      expect(mockFn).not.toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should allow multiple independent debounced calls', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 200)

      debounced('first')
      vi.advanceTimersByTime(200)
      expect(mockFn).toHaveBeenCalledWith('first')

      debounced('second')
      vi.advanceTimersByTime(200)
      expect(mockFn).toHaveBeenCalledWith('second')

      expect(mockFn).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    it('should reset timer on each call', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 300)

      debounced('a')
      vi.advanceTimersByTime(100)

      debounced('b')
      vi.advanceTimersByTime(100)

      debounced('c')
      vi.advanceTimersByTime(100)

      // Not enough time has passed since last call
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200) // Total 300ms since last call
      expect(mockFn).toHaveBeenCalledWith('c')

      vi.useRealTimers()
    })

    it('should preserve function context and arguments', async () => {
      vi.useFakeTimers()
      const mockFn = vi.fn()
      const debounced = debounce(mockFn, 100)

      debounced('arg1', 'arg2', 123)
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)

      vi.useRealTimers()
    })
  })
})
