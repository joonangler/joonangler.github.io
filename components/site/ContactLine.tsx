import Link from 'next/link'
import { Reveal } from '@/components/site/Reveal'
import { getChannels } from '@/lib/channels'

/** 문의로 가는 한 줄 — 한 문장 제목, 「문의하기」 단추, 채널 링크. 서비스 목록과 서비스별 페이지가 쓴다. */
export function ContactLine({ text }: { text: string }) {
  const channels = getChannels()
  return (
    <section className="home-block contact-line">
      <div className="site-wrap">
        <Reveal kind="title" as="h2">
          {text}
        </Reveal>
        <Reveal kind="rise" index={1}>
          <div className="contact-line__row">
            <Link href="/contact/" className="btn btn-primary">
              문의하기
            </Link>
            {channels.length > 0 && (
              <ul role="list" className="contact-line__channels">
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
        </Reveal>
      </div>
    </section>
  )
}
