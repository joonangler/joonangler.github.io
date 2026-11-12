import Link from 'next/link'
import { SITE_TITLE, getNavItems } from '@/lib/site'
import { getChannels } from '@/lib/channels'

/** 한 줄 바닥: 왼쪽 이름과 저작권, 오른쪽 준비된 탭과 채널. */
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="site-wrap">
        <div className="site-footer__row">
          <p className="site-footer__id">
            <span className="site-footer__name">{SITE_TITLE}</span>
            <span className="site-footer__copy">© {year} {SITE_TITLE}</span>
          </p>
          <ul className="site-footer__links">
            {getNavItems().map((item) => (
              <li key={item.id}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            {getChannels().map((c) => (
              <li key={c.id}>
                <a href={c.href} target="_blank" rel="noopener noreferrer">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
