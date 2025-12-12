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
  const [tempId, setTempId] = useState<string>('')  // Fallback 저장소

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
        const target = entry.target as HTMLElement

        if (entry.isIntersecting) {
          // 요소가 보이면 저장
          visibleElements.set(id, target.offsetTop)
        } else {
          // 요소가 안 보이면 제거
          visibleElements.delete(id)
        }
      })

      // 가장 상위에 보이는 요소를 활성화
      if (visibleElements.size > 0) {
        const mostVisible = Array.from(visibleElements.entries()).reduce(
          (min, [id, top]) => {
            return top < min.top ? { id, top } : min
          },
          { id: '', top: Number.MAX_SAFE_INTEGER }
        )

        setActiveId(mostVisible.id)
        setTempId('')  // 새로운 활성 헤딩이 있으면 Fallback 초기화
      } else {
        // 아무것도 안 보이면 Fallback 로직 실행
        setActiveId((prevActiveId) => {
          // 이전 활성 헤딩을 Fallback에 저장
          if (prevActiveId) {
            setTempId(prevActiveId)
          }
          return ''
        })
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

  // 활성 헤딩이 있으면 반환, 없으면 Fallback 반환
  return activeId || tempId
}
