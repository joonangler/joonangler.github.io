import Link from 'next/link'
import { Reveal } from '@/components/site/Reveal'
import { ServiceCard } from '@/components/site/Card'
import type { Service } from '@/lib/services'

/** 「맡는 일」 — 자료에 있는 서비스만 카드로 그린다. 자리만 잡은 카드는 없다. */
export function HomeServices({ services }: { services: Service[] }) {
  if (services.length === 0) return null
  return (
    <section className="home-block">
      <div className="site-wrap home-grid">
        <Reveal kind="title" as="h2">
          맡는 일
        </Reveal>
        <div className="home-body svc-grid">
          {services.map((s, i) => (
            <Reveal key={s.slug} kind="rise" index={i + 1}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
        <Reveal kind="rise">
          <Link href="/services/" className="home-more">
            서비스 전체 보기
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
