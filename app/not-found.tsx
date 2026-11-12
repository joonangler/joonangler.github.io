import Link from 'next/link'

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
