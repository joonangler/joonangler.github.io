/**
 * 점 배치와 섞기(계획 부록 B). 난수는 `Rng`로 받는다 — `Math.random`을 부르지 않는다.
 */
import type { ShapePoint } from './shapes'
import { pointProgress } from './motion'

export type Rng = () => number

const TAU = Math.PI * 2

/** 모인 모양은 포인터의 5분의 1만큼 밀린다(설계값. 시안은 0.22) */
export const FORM_POINTER_FACTOR = 0.2

export function backgroundCount(w: number, h: number): number {
  return Math.round(Math.min(340, (w * h) / 4600))
}

/** 포인터 반대쪽으로 최대 22px */
export function pointerOffset(pointer: number, size: number): number {
  return (pointer / size - 0.5) * -44
}

export interface BackgroundPoint {
  x: number
  y: number
  /** 깊이 0.2..1 */
  z: number
  /** 깜박임 위상 */
  ph: number
  vx: number
  vy: number
}

export interface FormPoint extends BackgroundPoint {
  /** 목표 자리·밝기·반지름 */
  tx: number
  ty: number
  ta: number
  tr: number
  /** 이번 모양에 자리가 있는가 */
  has: boolean
  /** 출발 늦음 0..1 */
  delay: number
  /** 출발 — 옮겨 가기 시작할 때 그려져 있던 자리 */
  sx: number
  sy: number
  sr: number
  sa: number
  /** 지금 그려진 자리 */
  cx: number
  cy: number
  cr: number
  ca: number
}

export function createBackgroundPoints(n: number, w: number, h: number, rng: Rng): BackgroundPoint[] {
  return Array.from({ length: n }, () => ({
    x: rng() * w,
    y: rng() * h,
    z: 0.2 + rng() * 0.8,
    ph: rng() * TAU,
    vx: (rng() - 0.5) * 0.014,
    vy: (rng() - 0.5) * 0.014,
  }))
}

export function createFormPoints(n: number, w: number, h: number, rng: Rng): FormPoint[] {
  return Array.from({ length: n }, () => {
    const x = w * (0.28 + rng() * 0.72),
      y = rng() * h
    return {
      x,
      y,
      z: 0.2 + rng() * 0.8,
      ph: rng() * TAU,
      vx: (rng() - 0.5) * 0.02,
      vy: (rng() - 0.5) * 0.02,
      tx: 0,
      ty: 0,
      ta: 0,
      tr: 1,
      has: false,
      delay: 0,
      sx: x,
      sy: y,
      sr: 1,
      sa: 0,
      cx: x,
      cy: y,
      cr: 1,
      ca: 0,
    }
  })
}

/** 모양의 i번째 자리를 i번째 점에. 그리는 순서대로, 조금씩 흩뜨려서 늦춘다. 남는 점은 바탕으로. */
export function assignTargets(points: FormPoint[], shape: ShapePoint[], rng: Rng): void {
  const n = shape.length
  points.forEach((p, i) => {
    p.has = i < n
    if (!p.has) {
      p.delay = rng()
      return
    }
    const q = shape[i]
    p.tx = q.x
    p.ty = q.y
    p.ta = q.a
    p.tr = q.r
    p.delay = (0.62 * i) / n + 0.38 * rng()
  })
}

/** 지금 그려진 자리에서 출발한다 — 가던 중이어도 끊고 새로 간다(튀지 않는다) */
export function restartFrom(points: FormPoint[]): void {
  for (const p of points) {
    p.sx = p.cx
    p.sy = p.cy
    p.sr = p.cr
    p.sa = p.ca
  }
}

/** 폭이 바뀌면 점을 새로 깐다. 높이만 바뀌면(휴대폰 주소창) 목표 자리만 다시 잰다. */
export function resizeAction(prev: { w: number; h: number }, next: { w: number; h: number }): 'rebuild' | 'retarget' | 'none' {
  if (prev.w !== next.w) return 'rebuild'
  if (prev.h !== next.h) return 'retarget'
  return 'none'
}

/** 흐름: 화면 밖 20px를 넘으면 반대편으로 */
export function drift(p: BackgroundPoint, dt: number, w: number, h: number): void {
  p.x += p.vx * dt * p.z
  p.y += p.vy * dt * p.z
  if (p.x < -20) p.x = w + 20
  else if (p.x > w + 20) p.x = -20
  if (p.y < -20) p.y = h + 20
  else if (p.y > h + 20) p.y = -20
}

/** 바탕 점의 밝기(깊이·깜박임) */
export function twinkle(p: BackgroundPoint, t: number): number {
  return (0.2 + 0.8 * p.z) * (0.72 + 0.28 * Math.sin(t * 9 + p.ph))
}

/**
 * 모이는 점 하나의 이번 프레임 자리(cx·cy·cr·ca)를 정한다.
 * `F`는 옮겨 감의 진행(머묾이면 1), `ox·oy`는 포인터 밀림, `t`는 느린 시간.
 */
export function placeFormPoint(p: FormPoint, F: number, spread: number, ox: number, oy: number, t: number): void {
  let gx = p.x + ox * p.z,
    gy = p.y + oy * p.z,
    gr = 0.5 + p.z,
    ga = twinkle(p, t) * 0.55
  if (p.has) {
    gx = p.tx + ox * FORM_POINTER_FACTOR + Math.sin(t * 14 + p.ph) * 0.6
    gy = p.ty + oy * FORM_POINTER_FACTOR + Math.cos(t * 11 + p.ph) * 0.6
    gr = p.tr
    ga = p.ta
  }
  const e = F >= 1 ? 1 : pointProgress(F, p.delay, spread)
  p.cx = p.sx + (gx - p.sx) * e
  p.cy = p.sy + (gy - p.sy) * e
  p.cr = p.sr + (gr - p.sr) * e
  p.ca = p.sa + (ga - p.sa) * e
}
