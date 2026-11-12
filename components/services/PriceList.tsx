import { Reveal } from '@/components/site/Reveal'
import { formatWon, type ServicePrice } from '@/lib/services'

/** 가격 줄 — 카드가 아니라 줄. 줄마다 이름 · 범위 · 걸리는 날 · 금액. */
export function PriceList({ prices, lead, note }: { prices: ServicePrice[]; lead?: string; note?: string }) {
  return (
    <>
      {lead && (
        <Reveal kind="rise" as="p">
          {lead}
        </Reveal>
      )}
      <ul role="list" id="prices" className="price-list">
        {prices.map((p, i) => (
          <Reveal key={p.name} kind="rise" index={i + 1} as="li">
            <span className="price-name">{p.name}</span>
            <span className="price-scope">{p.scope}</span>
            <span className="price-days">{p.days}일</span>
            <span className="price-won">{formatWon(p.won)}</span>
          </Reveal>
        ))}
      </ul>
      {note && (
        <Reveal kind="rise" index={prices.length + 1} as="p">
          {note}
        </Reveal>
      )}
    </>
  )
}
