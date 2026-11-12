import { describe, expect, it } from 'vitest'
import { SHAPE_ORDER, buildShapes, stepFor } from '@/lib/dots/shapes'

describe('dot shapes', () => {
  it('keeps the approved order', () => {
    expect(SHAPE_ORDER).toEqual(['web', 'app', 'term', 'git', 'post', 'video', 'toon'])
  })
  it('spaces points by box width within 5.5..7.5', () => {
    expect([400, 546, 780].map(stepFor)).toEqual([5.5, 7, 7.5])
  })
  it('builds one point list per shape', () => {
    expect(buildShapes({ x: 0, y: 0, w: 560, h: 482 })).toHaveLength(SHAPE_ORDER.length)
  })
  it('every shape stays inside its box', () => {
    const box = { x: 100, y: 50, w: 560, h: 482 }
    for (const s of buildShapes(box)) {
      expect(s.length).toBeGreaterThan(50)
      for (const p of s) {
        expect(p.x).toBeGreaterThanOrEqual(box.x - 1)
        expect(p.x).toBeLessThanOrEqual(box.x + box.w + 1)
        expect(p.y).toBeGreaterThanOrEqual(box.y - 1)
        expect(p.y).toBeLessThanOrEqual(box.y + box.h + 1)
      }
    }
  })
  it('stays inside a narrow-screen box too', () => {
    const box = { x: 20, y: 100, w: 350, h: 262 }
    for (const s of buildShapes(box)) {
      for (const p of s) {
        expect(p.x).toBeGreaterThanOrEqual(box.x - 1)
        expect(p.x).toBeLessThanOrEqual(box.x + box.w + 1)
        expect(p.y).toBeGreaterThanOrEqual(box.y - 1)
        expect(p.y).toBeLessThanOrEqual(box.y + box.h + 1)
      }
    }
  })
  it('matches the mockup point count for a known box', () => {
    // 시안(home-v4.html)의 함수를 Node에서 같은 상자로 돌려 얻은 값 — 부록 A를 그대로 옮겼는지
    const wide = buildShapes({ x: 0, y: 0, w: 560, h: 482 })
    expect(wide.map((s) => s.length)).toEqual([794, 469, 601, 316, 631, 480, 633])
    expect(wide[3][17]).toEqual({ x: 133.05599999999998, y: 246.6, a: 0.7, r: 1.05 })
    const narrow = buildShapes({ x: 20, y: 100, w: 350, h: 262 })
    expect(narrow.map((s) => s.length)).toEqual([658, 340, 491, 255, 456, 353, 448])
    expect(narrow[3][17]).toEqual({ x: 120.63934426229508, y: 234.5, a: 0.7, r: 1.05 })
  })
})
