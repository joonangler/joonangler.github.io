import Link from 'next/link'
import { Fragment, type CSSProperties } from 'react'
import { DotField } from '@/components/dots/DotField'
import { toWordLines } from '@/lib/words'
import type { Service } from '@/lib/services'

/**
 * 서비스별 페이지의 첫 화면: 점 무리 배경(모양 없음), 왼쪽 아래에 한 문장과 보조 문장, 단추 둘.
 * 광고와 링크의 도착 주소라 단추를 둔다(설계 §6). 숨김 상태는 CSS가 html.js 아래에서만 건다.
 */
export function ServiceHero({ service }: { service: Service }) {
  const lines = toWordLines(service.headline)
  return (
    <section className="service-hero">
      <DotField mode="plain" mask="service" />
      <div className="service-hero__inner site-wrap">
        <div className="service-hero__copy">
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
          <p className="hero-sub">{service.sub}</p>
          <div className="hero-cta">
            <Link href="/contact/" className="btn btn-primary">
              문의하기
            </Link>
            <a href="#prices" className="btn btn-quiet">
              가격 보기
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
