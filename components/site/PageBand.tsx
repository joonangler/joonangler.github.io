import { DotField } from '@/components/dots/DotField'

/**
 * 낮은 띠 머리 — 서비스 목록·문의(와 뒤 묶음의 작업·소개)가 쓴다.
 * 점 무리 배경(모양 없음) 위에 페이지 제목(h1)과 한 문장.
 */
export function PageBand({ title, lead }: { title: string; lead: string }) {
  return (
    <section className="page-band">
      <DotField mode="plain" mask="band" />
      <div className="page-band__inner site-wrap">
        <h1>{title}</h1>
        <p>{lead}</p>
      </div>
    </section>
  )
}
