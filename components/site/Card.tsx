import Link from 'next/link'
import type { Service } from '@/lib/services'
import { fromPrice, formatWon } from '@/lib/services'
import type { Work } from '@/lib/work'

/** 작업 캡처 원본의 크기(1440×900). 가로세로 값을 달아 자리가 먼저 잡히게 한다. */
const COVER_W = 1440
const COVER_H = 900

/**
 * 작업 카드. label이 있으면 제목 위에 작은 표시를 단다(서비스별 페이지의 「직접 운영」). href가 없으면 링크가 아닌 div — 올림 효과도 없다.
 * 캡처는 정적 export에서 next/image의 이점이 없어 img에 lazy·async를 직접 단다.
 */
export function WorkCard({ work, href, wide, label }: { work: Work; href?: string; wide?: boolean; label?: string }) {
  const className = wide ? 'card work-card work-card--wide' : 'card work-card'
  const body = (
    <>
      <div className="card-panel">
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export, 지연 로딩과 크기를 직접 단다 */}
        <img src={work.cover} alt={work.coverAlt} width={COVER_W} height={COVER_H} loading="lazy" decoding="async" />
      </div>
      <div className="card-meta">
        {label && <span className="card-tag">{label}</span>}
        <h3>{work.title}</h3>
        <p>{work.summary}</p>
      </div>
    </>
  )
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

/** 서비스 카드. 서비스별 페이지로 가고, 판에 「…원부터」와 이름이 놓인다. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    // 화면 순서는 가격이 먼저지만 링크 이름은 서비스 이름으로 시작해야 한다 — aria-labelledby로 이름을 앞세운다
    <Link
      href={`/services/${service.slug}/`}
      className="card svc-card"
      aria-labelledby={`svc-${service.slug}-title svc-${service.slug}-from`}
    >
      <div className="card-panel">
        <span id={`svc-${service.slug}-from`} className="svc-from">
          {formatWon(fromPrice(service))}부터
        </span>
        <h3 id={`svc-${service.slug}-title`}>{service.title}</h3>
      </div>
      <div className="card-meta">
        <p>{service.summary}</p>
      </div>
    </Link>
  )
}
