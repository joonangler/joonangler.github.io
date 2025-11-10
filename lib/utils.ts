import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import React from 'react'

/**
 * Tailwind CSS 클래스 병합 유틸리티
 * clsx와 tailwind-merge를 조합하여 조건부 클래스와 충돌 해결
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜 포매팅
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 슬러그 생성
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

/**
 * 텍스트를 URL 친화적인 슬러그로 변환
 * 한글과 영문 모두 지원
 *
 * @param text 변환할 텍스트
 * @returns URL 슬러그
 *
 * @example
 * toSlug('Next.js 시작하기') // 'nextjs-시작하기'
 * toSlug('Hello World') // 'hello-world'
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
}

/**
 * 안전한 URL 스키마인지 검증
 * XSS 공격을 방지하기 위해 위험한 프로토콜 차단
 *
 * @param url 검증할 URL
 * @returns 안전한 URL이면 true
 *
 * @example
 * isSafeUrl('https://example.com') // true
 * isSafeUrl('javascript:alert(1)') // false
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmedUrl = url.trim().toLowerCase()

  // 위험한 프로토콜 차단
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ]

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return false
    }
  }

  // 안전한 프로토콜만 허용
  const safeProtocols = ['http://', 'https://', 'mailto:', '#', '/']

  // 프로토콜이 없는 상대 경로는 안전
  if (!trimmedUrl.includes(':')) {
    return true
  }

  return safeProtocols.some(protocol => trimmedUrl.startsWith(protocol))
}

/**
 * React 노드에서 텍스트 추출
 * - 문자열: 그대로 반환
 * - 배열: 재귀적으로 처리
 * - React 엘리먼트: children에서 추출
 * - 깊이 제한으로 스택 오버플로우 방지
 *
 * @param node React 노드
 * @param depth 현재 재귀 깊이 (내부용, 직접 전달하지 마세요)
 * @returns 추출된 텍스트
 *
 * @example
 * getTextContent('Hello') // 'Hello'
 * getTextContent(['Hello', ' ', 'World']) // 'Hello World'
 * getTextContent(<strong>Bold</strong>) // 'Bold'
 */
export function getTextContent(node: React.ReactNode, depth: number = 0): string {
  // 깊이 제한: 순환 참조나 과도한 중첩으로부터 보호
  if (depth > 100) {
    console.warn('[getTextContent] Maximum depth exceeded')
    return ''
  }

  if (!node) {
    return ''
  }

  if (typeof node === 'string') {
    return node
  }

  if (typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(n => getTextContent(n, depth + 1)).join('')
  }

  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return getTextContent(props.children, depth + 1)
  }

  return ''
}

/**
 * Debounce 함수 - 연속적인 호출을 지연시켜 마지막 호출만 실행
 * 검색 입력 등에서 과도한 함수 실행을 방지
 *
 * @param func 실행할 함수
 * @param wait 대기 시간 (밀리초)
 * @returns 디바운스된 함수 (cancel 메서드 포함)
 *
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching for:', query)
 * }, 300)
 *
 * // 300ms 내에 여러 번 호출해도 마지막만 실행됨
 * debouncedSearch('a')
 * debouncedSearch('ab')
 * debouncedSearch('abc') // 이것만 실행됨
 *
 * // 정리 (cleanup)
 * debouncedSearch.cancel()
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void
  cancel: () => void
} {
  let timeout: NodeJS.Timeout | null = null

  const debounced = function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced
}
