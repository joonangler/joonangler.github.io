import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import { getContactEmail } from '@/lib/constants'
import { getChannels } from '@/lib/channels'
import { CONTACT_PAGE } from '@/content/site'
import { PageBand } from '@/components/site/PageBand'
import { Reveal } from '@/components/site/Reveal'
import { EmailCopy } from '@/components/contact/EmailCopy'

export function generateMetadata(): Metadata {
  return getPageMetadata({ title: CONTACT_PAGE.title, description: CONTACT_PAGE.lead, path: '/contact/' })
}

/**
 * 문의(설계 §10): 낮은 띠 → 메일 주소(글자·링크·복사) → 보낼 때 적으면 좋은 것 → 상담 안내 한 줄 → 채널.
 * 운영 빌드에서 주소가 없으면 getContactEmail이 멈춘다. 개발에서 비어 있으면 주소 칸을 그리지 않는다.
 */
export default function ContactPage() {
  const email = getContactEmail()
  const channels = getChannels()
  return (
    <>
      <PageBand title={CONTACT_PAGE.title} lead={CONTACT_PAGE.lead} />
      <div className="home-sections">
        <section className="contact-main">
          <div className="site-wrap">
            {/* 띠 바로 아래라 첫 화면 안이다 — 스크롤 등장을 걸지 않는다(하이드레이션 전에는 숨겨져 LCP가 늦어진다) */}
            {email && <EmailCopy email={email} />}
            <div className="contact-hints">
              <Reveal kind="title" as="h2">
                보낼 때 적으면 좋은 것
              </Reveal>
              <ul className="plain-list">
                {CONTACT_PAGE.hints.map((h, i) => (
                  <Reveal key={h} kind="rise" index={i + 1} as="li">
                    {h}
                  </Reveal>
                ))}
              </ul>
            </div>
            <Reveal kind="rise" index={1} as="p">
              <span className="contact-consult">{CONTACT_PAGE.consult}</span>
            </Reveal>
            {channels.length > 0 && (
              <ul className="contact-line__channels contact-main__channels">
                {channels.map((c) => (
                  <li key={c.id}>
                    <a href={c.href} target="_blank" rel="noopener noreferrer">
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
