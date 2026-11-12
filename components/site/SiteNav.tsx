'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SITE_TITLE, getActiveNavId, getNavItems } from '@/lib/site'

/**
 * 떠 있는 내비. 860px 아래에서는 「메뉴」 단추로 탭을 펼친다.
 * 탭을 접는 CSS는 html.js 아래에서만 걸려, 자바스크립트가 꺼지면 탭이 펼쳐진 채 남는다.
 */
export function SiteNav() {
  const pathname = usePathname() ?? ''
  const [open, setOpen] = useState(false)
  const activeId = getActiveNavId(pathname)

  return (
    <nav className="site-nav" aria-label="사이트">
      <Link href="/" className="site-nav__name">
        {SITE_TITLE}
      </Link>
      <button
        type="button"
        className="site-nav__menu"
        aria-expanded={open}
        aria-controls="site-nav-tabs"
        onClick={() => setOpen((v) => !v)}
      >
        메뉴
      </button>
      <div id="site-nav-tabs" className="site-nav__tabs" data-open={open}>
        {getNavItems().map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="site-nav__tab"
            aria-current={item.id === activeId ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
