import { describe, expect, it } from 'vitest'
import { PHASE_MS, advance, createTimeline, cycleMs, easeInOutCubic, freeze, pointProgress, stillShape } from '@/lib/dots/motion'

describe('dot motion timeline', () => {
  it('uses the mockup phase lengths', () => {
    expect(PHASE_MS).toEqual({ wait: 700, gather: 2400, hold: 4200, morph: 2000, scatter: 1500, drift: 1100 })
  })
  it('one cycle is gather + 7 holds + 6 morphs + scatter + drift', () => {
    expect(cycleMs(7)).toBe(46400)
  })
  it('eases in and out with a cubic', () => {
    expect([0, 0.25, 0.5, 1].map(easeInOutCubic)).toEqual([0, 0.0625, 0.5, 1])
  })
  it('walks the whole cycle', () => {
    let t = createTimeline({ shapeCount: 7, reduced: false })
    const gos: string[] = []
    for (let i = 0; i < 2000; i++) {
      const r = advance(t, 50)
      t = r.timeline
      if (r.go) gos.push(`${r.go.target}:${r.go.ms}:${r.go.spread}`)
      if (gos.length === 9) break
    }
    expect(gos).toEqual(['0:2400:0.5', '1:2000:0.35', '2:2000:0.35', '3:2000:0.35', '4:2000:0.35', '5:2000:0.35', '6:2000:0.35', '-1:1500:0.15', '0:2400:0.5'])
  })
  it('first gather starts when the sentence settles (700ms)', () => {
    let t = createTimeline({ shapeCount: 7, reduced: false })
    let r = advance(t, 650)
    expect(r.go).toBeUndefined()
    t = r.timeline
    r = advance(t, 50)
    expect(r.go).toEqual({ target: 0, ms: 2400, spread: 0.5 })
    expect(r.timeline).toMatchObject({ phase: 'move', shape: 0, elapsed: 0, duration: 2400 })
  })
  it('reduced motion holds the first shape forever', () => {
    const t = createTimeline({ shapeCount: 7, reduced: true })
    expect(t).toMatchObject({ phase: 'hold', shape: 0, still: true })
    expect(advance(t, 1e6).go).toBeUndefined()
  })
  it('freeze turns a running timeline into a still hold', () => {
    let t = createTimeline({ shapeCount: 7, reduced: false })
    t = advance(t, 700).timeline // moving to shape 0
    const f = freeze(t, 0)
    expect(f).toMatchObject({ phase: 'hold', shape: 0, still: true })
    expect(advance(f, 1e6).go).toBeUndefined()
  })
  it('reduced motion turned on mid-session stops at the current shape, not the first', () => {
    let t = createTimeline({ shapeCount: 7, reduced: false })
    expect(stillShape(t)).toBe(0) // 아직 모이기 전(기다림)은 첫 모양
    t = advance(t, 700).timeline // 0으로 가는 중
    t = advance(t, 2400).timeline // 0에 머묾
    t = advance(t, 4200).timeline // 1로 가는 중
    t = advance(t, 1000).timeline
    expect(t).toMatchObject({ phase: 'move', shape: 1 })
    expect(stillShape(t)).toBe(1) // 가던 모양이 모인 모습으로
    for (let i = 0; i < 6 * 2; i++) t = advance(t, 4200).timeline
    expect(t.shape).toBe(-1) // 흩어짐·떠돎
    expect(stillShape(t)).toBe(0)
  })
  it('a point waits for its delay share, then eases to 1', () => {
    expect(pointProgress(0, 0, 0.5)).toBe(0)
    expect(pointProgress(1, 1, 0.5)).toBe(1)
    expect(pointProgress(0.25, 0.5, 0.5)).toBe(0) // 늦게 떠나는 점은 아직 출발 전
    expect(pointProgress(0.5, 0, 0.5)).toBe(1) // 일찍 떠난 점은 이미 도착
  })
})
