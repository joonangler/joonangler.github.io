import { type Metadata } from 'next'
import Link from 'next/link'

/**
 * Next가 404에 noindex를 스스로 넣는다. 루트 메타의 `index, follow`가 남으면 robots 태그가 둘이 되므로
 * `robots: null`로 지운다(같은 키는 뒤의 것이 덮는다).
 */
export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: null,
}

/**
 * 404 — 사이트 틀(내비·바닥) 안의 한국어 화면. 나갈 길은 「홈으로」 하나.
 */
export default function NotFound() {
  return (
    <section className="not-found">
      <div className="site-wrap">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="not-found__lead">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
        <Link href="/" className="btn btn-primary">
          홈으로
        </Link>
      </div>
    </section>
  )
}
