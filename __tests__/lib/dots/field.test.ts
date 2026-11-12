import { describe, expect, it } from 'vitest'
import {
  FORM_POINTER_FACTOR,
  assignTargets,
  backgroundCount,
  createFormPoints,
  pointerOffset,
  resizeAction,
  restartFrom,
} from '@/lib/dots/field'

const seq = (...xs: number[]) => {
  let i = 0
  return () => xs[i++ % xs.length]
}

describe('dot field', () => {
  it('scales the background count with area, capped at 340', () => {
    expect([backgroundCount(1440, 900), backgroundCount(3000, 2000)]).toEqual([282, 340])
  })
  it('pushes away from the pointer by up to 22px', () => {
    expect([pointerOffset(0, 1000), pointerOffset(1000, 1000)]).toEqual([22, -22])
    expect(pointerOffset(500, 1000)).toBeCloseTo(0)
  })
  it('gathered shapes follow the pointer at a fifth', () => {
    expect(FORM_POINTER_FACTOR).toBe(0.2)
  })
  it('places form points on the right 72% of the field', () => {
    const pts = createFormPoints(3, 1000, 500, seq(0, 1, 0.5))
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(280)
      expect(p.x).toBeLessThanOrEqual(1000)
      expect(p.cx).toBe(p.x)
      expect(p.sx).toBe(p.x)
      expect(p.has).toBe(false)
    }
  })
  it('points beyond the shape go back to the background', () => {
    const pts = createFormPoints(10, 800, 600, seq(0.3))
    const shape = [0, 1, 2, 3].map((i) => ({ x: i, y: i, a: 0.9, r: 1.05 }))
    assignTargets(pts, shape, seq(0.5))
    expect(pts.map((p) => p.has)).toEqual([true, true, true, true, false, false, false, false, false, false])
    expect(pts[2]).toMatchObject({ tx: 2, ty: 2, ta: 0.9, tr: 1.05 })
  })
  it('delays points in drawing order with a little scatter', () => {
    const pts = createFormPoints(4, 800, 600, seq(0.3))
    const shape = [0, 1, 2, 3].map((i) => ({ x: i, y: i, a: 1, r: 1 }))
    assignTargets(pts, shape, seq(0))
    const want = [0, 0.155, 0.31, 0.465]
    want.forEach((d, i) => expect(pts[i].delay).toBeCloseTo(d, 10))
  })
  it('restarts from where points are drawn now', () => {
    const [p] = createFormPoints(1, 800, 600, seq(0.3))
    p.cx = 10
    p.cy = 20
    p.cr = 2
    p.ca = 0.4
    restartFrom([p])
    expect(p).toMatchObject({ sx: 10, sy: 20, sr: 2, sa: 0.4 })
  })
  it('rebuilds on width change, retargets on height-only change', () => {
    expect(resizeAction({ w: 390, h: 700 }, { w: 390, h: 760 })).toBe('retarget')
    expect(resizeAction({ w: 390, h: 700 }, { w: 844, h: 390 })).toBe('rebuild')
    expect(resizeAction({ w: 390, h: 700 }, { w: 390, h: 700 })).toBe('none')
    expect(resizeAction({ w: 0, h: 0 }, { w: 390, h: 700 })).toBe('rebuild')
  })
})
