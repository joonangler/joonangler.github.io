'use client'

import { useEffect, useState } from 'react'
import {
  SCROLL_SPY_ROOT_MARGIN,
  SCROLL_SPY_THRESHOLD,
} from '@/lib/constants'

/**
 * useScrollSpy Hook
 * Tracks which heading is currently visible in the viewport using IntersectionObserver
 *
 * @param ids - Array of heading IDs to track
 * @param rootMargin - IntersectionObserver rootMargin (default: SCROLL_SPY_ROOT_MARGIN)
 * @param threshold - IntersectionObserver threshold (default: SCROLL_SPY_THRESHOLD)
 * @returns activeId - Currently active heading ID
 *
 * @example
 * const activeId = useScrollSpy(['heading-1', 'heading-2', 'heading-3'])
 *
 * @example
 * // Custom options
 * const activeId = useScrollSpy(
 *   ['heading-1', 'heading-2'],
 *   '-100px 0px -100px 0px',
 *   0.7
 * )
 */
export function useScrollSpy(
  ids: string[],
  rootMargin: string = SCROLL_SPY_ROOT_MARGIN,
  threshold: number = SCROLL_SPY_THRESHOLD
): string {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // 헤딩 요소들 찾기
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) {
      return
    }

    // IntersectionObserver 옵션
    const observerOptions: IntersectionObserverInit = {
      rootMargin,
      threshold,
    }

    // 현재 보이는 요소들을 추적 (useEffect 내부에서 생성)
    const visibleElements = new Map<string, number>()

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id

        if (entry.isIntersecting) {
          // 요소가 보이면 저장 (IntersectionRatio로 정렬하기 위해)
          visibleElements.set(id, entry.intersectionRatio)
        } else {
          // 요소가 안 보이면 제거
          visibleElements.delete(id)
        }
      })

      // 가장 많이 보이는 요소를 활성화
      if (visibleElements.size > 0) {
        const mostVisible = Array.from(visibleElements.entries()).reduce(
          (max, [id, ratio]) => {
            return ratio > max.ratio ? { id, ratio } : max
          },
          { id: '', ratio: 0 }
        )

        setActiveId(mostVisible.id)
      } else {
        // 아무것도 안 보이면 초기화
        setActiveId('')
      }
    }, observerOptions)

    // 모든 헤딩 요소 관찰 시작
    elements.forEach((element) => {
      observer.observe(element)
    })

    // Cleanup: 관찰 중지 및 Map 정리
    return () => {
      elements.forEach((element) => {
        observer.unobserve(element)
      })
      observer.disconnect()
      visibleElements.clear()
    }
  }, [ids, rootMargin, threshold]) // 의존성 배열을 원시 값으로 명확화

  return activeId
}
