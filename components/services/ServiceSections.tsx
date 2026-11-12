import type { ReactNode } from 'react'
import { Reveal } from '@/components/site/Reveal'
import { WorkCard } from '@/components/site/Card'
import { ContactLine } from '@/components/site/ContactLine'
import { PriceList } from '@/components/services/PriceList'
import { StepList } from '@/components/services/StepList'
import { isNavReady } from '@/lib/site'
import type { Service } from '@/lib/services'
import type { Work } from '@/lib/work'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="home-block">
      <div className="site-wrap">
        <Reveal kind="title" as="h2">
          {title}
        </Reveal>
        <div className="service-block__body">{children}</div>
      </div>
    </section>
  )
}

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="plain-list">
      {items.map((t, i) => (
        <Reveal key={t} kind="rise" index={i + 1} as="li">
          {t}
        </Reveal>
      ))}
    </ul>
  )
}

/**
 * 서비스별 페이지의 첫 화면 아래 구역들(설계 §6 2~9). 목록이 빈 구역은 그리지 않는다.
 * body는 서버에서 렌더한 MDX 본문(없으면 「이런 일을 합니다」 구역이 없다). works는 related로 가려 낸 작업.
 */
export function ServiceSections({ service, body, works }: { service: Service; body: ReactNode; works: Work[] }) {
  const workReady = isNavReady('work')
  return (
    <div className="home-sections">
      {body && <Block title="이런 일을 합니다">{body}</Block>}
      <Block title="가격">
        <PriceList prices={service.prices} lead={service.pricesLead} note={service.pricesNote} />
      </Block>
      {service.steps.length > 0 && (
        <Block title="진행 순서">
          <StepList steps={service.steps} />
        </Block>
      )}
      {service.prepare.length > 0 && (
        <Block title="준비해 주실 것">
          <TextList items={service.prepare} />
        </Block>
      )}
      {service.after.length > 0 && (
        <Block title="납품 뒤">
          <TextList items={service.after} />
        </Block>
      )}
      {service.faq.length > 0 && (
        <Block title="자주 묻는 질문">
          <dl className="faq">
            {service.faq.map((f, i) => (
              <Reveal key={f.q} kind="rise" index={i + 1}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </Reveal>
            ))}
          </dl>
        </Block>
      )}
      {works.length > 0 && (
        <Block title="관련 작업">
          <div className={works.length === 1 ? 'works works--single' : 'works'}>
            {works.map((w, i) => (
              <Reveal key={w.slug} kind="rise" index={i + 1}>
                <WorkCard work={w} href={workReady ? `/work/${w.slug}/` : undefined} wide={works.length === 1} />
              </Reveal>
            ))}
          </div>
        </Block>
      )}
      <ContactLine text={service.contactLine} />
    </div>
  )
}
