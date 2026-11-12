/**
 * 점 무리의 시간표(계획 부록 B). 시안의 step()을 불변 상태 + advance로 옮겼다.
 * 기다림(문장이 자리 잡는 700ms) → 처음 모임 → 머묾·옮겨 감 ×7 → 흩어짐 → 떠돎 → 다시 모임.
 */

export const PHASE_MS = { wait: 700, gather: 2400, hold: 4200, morph: 2000, scatter: 1500, drift: 1100 } as const

/** 처음 모임 0.5, 옮겨 감 0.35, 흩어짐 0.15 — 점마다 출발이 늦어지는 몫 */
const SPREAD = { gather: 0.5, morph: 0.35, scatter: 0.15 } as const

export function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** 점 하나의 진행. `F`는 옮겨 감 전체의 진행(0..1), `delay`는 점의 늦음(0..1). */
export function pointProgress(F: number, delay: number, spread: number): number {
  return easeInOutCubic(clamp01((F - delay * spread) / (1 - spread)))
}

/** 한 바퀴의 길이(기다림 제외) */
export function cycleMs(shapeCount: number): number {
  return PHASE_MS.gather + PHASE_MS.hold * shapeCount + PHASE_MS.morph * (shapeCount - 1) + PHASE_MS.scatter + PHASE_MS.drift
}

export type Phase = 'wait' | 'move' | 'hold' | 'drift'

export interface Timeline {
  phase: Phase
  /** 지금(또는 가는 중인) 모양. -1은 흩어짐·아직 없음 */
  shape: number
  elapsed: number
  duration: number
  /** 모션 줄이기 — 더 나아가지 않는다 */
  still: boolean
  shapeCount: number
}

export interface Go {
  /** -1은 흩어짐 */
  target: number
  ms: number
  spread: number
}

export function createTimeline(opts: { shapeCount: number; reduced: boolean }): Timeline {
  const { shapeCount, reduced } = opts
  if (reduced) return { phase: 'hold', shape: 0, elapsed: 0, duration: PHASE_MS.hold, still: true, shapeCount }
  return { phase: 'wait', shape: -1, elapsed: 0, duration: PHASE_MS.wait, still: false, shapeCount }
}

function go(t: Timeline, target: number, ms: number): { timeline: Timeline; go: Go } {
  const spread = target < 0 ? SPREAD.scatter : t.shape < 0 ? SPREAD.gather : SPREAD.morph
  return {
    timeline: { ...t, phase: 'move', shape: target, elapsed: 0, duration: ms },
    go: { target, ms, spread },
  }
}

export function advance(t: Timeline, dt: number): { timeline: Timeline; go?: Go } {
  if (t.still) return { timeline: t }
  const n: Timeline = { ...t, elapsed: t.elapsed + dt }
  if (n.elapsed < n.duration) return { timeline: n }
  switch (n.phase) {
    case 'wait':
    case 'drift':
      return go(n, 0, PHASE_MS.gather)
    case 'move':
      return n.shape < 0
        ? { timeline: { ...n, phase: 'drift', elapsed: 0, duration: PHASE_MS.drift } }
        : { timeline: { ...n, phase: 'hold', elapsed: 0, duration: PHASE_MS.hold } }
    case 'hold':
      return n.shape + 1 < n.shapeCount ? go(n, n.shape + 1, PHASE_MS.morph) : go(n, -1, PHASE_MS.scatter)
  }
}

/** 보는 도중 모션 줄이기 — 모양 하나에 멈춘 정지 상태로 */
export function freeze(t: Timeline, shape: number): Timeline {
  return { ...t, phase: 'hold', shape, elapsed: 0, duration: PHASE_MS.hold, still: true }
}

/**
 * 보는 도중 모션 줄이기를 켰을 때 멈출 모양: 지금 모양(가는 중이면 가던 모양), 흩어진 때는 첫 모양.
 * 그림이 한 번 더 바뀌지 않게(허브 2026-11-13, 시안 `still(Math.max(si, 0))`과 같다).
 */
export function stillShape(t: Timeline): number {
  return Math.max(t.shape, 0)
}

/** 움직임 진행(0..1). 머묾·떠돎·기다림은 1(도착한 상태). */
export function moveProgress(t: Timeline): number {
  return t.phase === 'move' ? Math.min(1, t.elapsed / t.duration) : 1
}
