import { Reveal } from '@/components/site/Reveal'

/** 진행 순서 — 실제 순서라 번호가 붙는다(ol). 번호는 CSS 카운터. */
export function StepList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol role="list" className="step-list">
      {steps.map((s, i) => (
        <Reveal key={s.title} kind="rise" index={i + 1} as="li">
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </Reveal>
      ))}
    </ol>
  )
}
