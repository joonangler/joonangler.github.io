'use client'

import { Fragment, useRef, type CSSProperties } from 'react'
import { HOME_HERO } from '@/content/site'
import { toWordLines } from '@/lib/words'
import { DotField } from '@/components/dots/DotField'

/**
 * 홈 첫 화면: 왼쪽에 세 줄 문장, 오른쪽 자리(slot)에 점이 모인다.
 * 낱말 숨김(등장 애니메이션)은 CSS가 html.js 아래에서만 건다 — 스크립트가 꺼져도 문장이 보인다.
 */
export function HomeHero() {
  const slotRef = useRef<HTMLDivElement>(null)
  const lines = toWordLines(HOME_HERO.lines)

  return (
    <section className="hero">
      <DotField mode="shapes" mask="home" slotRef={slotRef} />
      <div className="hero-inner site-wrap">
        <div className="hero-copy">
          <h1>
            {lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <span className="hero-line">
                  {line.map((w, j) => (
                    <Fragment key={j}>
                      {j > 0 && ' '}
                      <span className="hero-word" style={{ '--d': String(w.delay) } as CSSProperties}>
                        {w.text}
                      </span>
                    </Fragment>
                  ))}
                </span>
              </Fragment>
            ))}
          </h1>
          <p className="hero-sub">{HOME_HERO.sub}</p>
        </div>
        <div className="hero-right">
          <div ref={slotRef} className="hero-slot" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
