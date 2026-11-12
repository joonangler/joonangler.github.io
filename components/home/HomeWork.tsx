import Link from 'next/link'
import { Reveal } from '@/components/site/Reveal'
import { WorkCard } from '@/components/site/Card'
import { isNavReady } from '@/lib/site'
import type { Work } from '@/lib/work'

/**
 * 「직접 만들어 운영하는 것」. 작업이 하나면 한 칸 전체.
 * 작업 탭이 아직 준비되지 않았으면 카드는 링크가 아니고 「작업 전체 보기」도 없다(묶음 2가 켠다).
 * 자료에 없는 카드는 그리지 않는다.
 */
export function HomeWork({ works }: { works: Work[] }) {
  if (works.length === 0) return null
  const ready = isNavReady('work')
  const single = works.length === 1
  return (
    <section className="home-block">
      <div className="site-wrap home-grid">
        <Reveal kind="title" as="h2">
          직접 만들어 운영하는 것
        </Reveal>
        <div className={single ? 'home-body works works--single' : 'home-body works'}>
          {works.map((w, i) => (
            <Reveal key={w.slug} kind="rise" index={i + 1}>
              <WorkCard work={w} href={ready ? `/work/${w.slug}/` : undefined} wide={single} />
            </Reveal>
          ))}
        </div>
        {ready && (
          <Reveal kind="rise">
            <Link href="/work/" className="home-more">
              작업 전체 보기
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  )
}
