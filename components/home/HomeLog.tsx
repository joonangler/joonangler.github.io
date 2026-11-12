import Link from 'next/link'
import { Reveal } from '@/components/site/Reveal'
import { formatDotDate } from '@/lib/utils'
import type { Post } from '@/types/post'

/** 「기록」 — 최근 글 셋. 게시된 글이 없으면 구역 자체를 그리지 않는다(자리만 잡은 줄을 내지 않는다). */
export function HomeLog({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null
  return (
    <section className="home-block">
      <div className="site-wrap home-grid">
        <Reveal kind="title" as="h2">
          기록
        </Reveal>
        <ul role="list" className="home-body log-list">
          {posts.slice(0, 3).map((post, i) => (
            <Reveal key={post.slug} kind="rise" index={i + 1} as="li">
              <Link href={`/posts/${post.slug}/`} className="log-row">
                <time dateTime={post.date}>{formatDotDate(post.date)}</time>
                <span className="log-title">{post.title}</span>
                {post.series && <span className="log-series">{post.series}</span>}
              </Link>
            </Reveal>
          ))}
        </ul>
        <Reveal kind="rise">
          <Link href="/posts/" className="home-more">
            글 전체 보기
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
