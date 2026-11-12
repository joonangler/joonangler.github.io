'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

interface RevealProps {
  /** title: 아래에서 위로 한 번 열리는 가림(clip-path). rise: 살짝 떠오르며 나타남 */
  kind: 'title' | 'rise'
  /** rise의 차례. 지연은 index × 55ms + 120ms(CSS의 --i) */
  index?: number
  as?: ElementType
  children: ReactNode
}

/**
 * 화면에 들어오면 한 번 `is-in`을 단다(다시 숨기지 않는다).
 * 숨김 상태는 CSS가 `html.js` 아래에서만 걸어서, 스크립트가 꺼지면 처음부터 보인다.
 * 관찰자가 없는 브라우저는 곧바로 보인다.
 */
export function Reveal({ kind, index, as: Tag = 'div', children }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -90px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const style = kind === 'rise' && index !== undefined ? ({ '--i': index } as React.CSSProperties) : undefined
  return (
    <Tag ref={ref} className={kind === 'title' ? 'reveal' : 'rise-in'} style={style}>
      {children}
    </Tag>
  )
}
