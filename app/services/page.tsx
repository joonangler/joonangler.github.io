import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import { SERVICES_PAGE } from '@/content/site'
import { getAllServices } from '@/lib/services'
import { PageBand } from '@/components/site/PageBand'
import { ServiceCard } from '@/components/site/Card'
import { Reveal } from '@/components/site/Reveal'
import { ContactLine } from '@/components/site/ContactLine'

export function generateMetadata(): Metadata {
  return getPageMetadata({
    title: SERVICES_PAGE.title,
    description: SERVICES_PAGE.intro.text,
    path: '/services/',
  })
}

/**
 * 서비스 목록(설계 §6): 낮은 띠 → 서비스 카드(홈의 「맡는 일」과 같은 카드) → 일하는 방식 넷(번호 없음, 원칙이라서)
 * → 하지 않는 일 → 문의 한 줄. 자료에 있는 서비스만 카드로 그린다.
 */
export default function ServicesPage() {
  const services = getAllServices()
  return (
    <>
      <PageBand title={SERVICES_PAGE.title} lead={SERVICES_PAGE.intro.text} />
      <div className="home-sections">
        {services.length > 0 && (
          <section className="services-cards">
            <div className="site-wrap">
              <h2 className="sr-only">서비스 목록</h2>
              <div className="svc-grid">
                {/* 띠 바로 아래라 첫 화면 안이다 — 스크롤 등장을 걸지 않는다(하이드레이션 전에는 숨겨져 LCP가 늦어진다) */}
                {services.map((s) => (
                  <div key={s.slug} className="services-cards__item">
                    <ServiceCard service={s} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="home-block">
          <div className="site-wrap">
            <Reveal kind="title" as="h2">
              일하는 방식
            </Reveal>
            <ul role="list" className="principles">
              {SERVICES_PAGE.principles.map((p, i) => (
                <Reveal key={p.title} kind="rise" index={i + 1} as="li">
                  <h3>{p.title}</h3>
                  <p>{p.body.text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="home-block">
          <div className="site-wrap">
            <Reveal kind="title" as="h2">
              하지 않는 일
            </Reveal>
            <ul role="list" className="not-done">
              {SERVICES_PAGE.notDone.map((t, i) => (
                <Reveal key={t} kind="rise" index={i + 1} as="li">
                  {t}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <ContactLine text={SERVICES_PAGE.contactLine.text} />
      </div>
    </>
  )
}
