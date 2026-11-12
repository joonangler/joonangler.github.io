/**
 * 점이 모이는 모양 일곱. 좌표는 승인된 시안(home-v4)의 값을 그대로 옮겼다(계획 부록 A).
 * 다듬기는 실기기 확인 뒤 — 여기서 식을 바꾸지 않는다.
 * 시안의 전역 `STEP`은 `buildShapes`가 상자 폭으로 정해 펜(`Pen`)에 담아 넘긴다.
 */

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface ShapePoint {
  x: number
  y: number
  /** 밝기 */
  a: number
  /** 반지름 */
  r: number
}

export type ShapeId = 'web' | 'app' | 'term' | 'git' | 'post' | 'video' | 'toon'

/** 차례(사용자): 만드는 것, 일하는 법, 알리는 것 */
export const SHAPE_ORDER: readonly ShapeId[] = ['web', 'app', 'term', 'git', 'post', 'video', 'toon']

const TAU = Math.PI * 2

export function stepFor(boxWidth: number): number {
  return Math.max(5.5, Math.min(7.5, boxWidth / 78))
}

type O = ShapePoint[]

/** 점 간격 하나에 묶인 그리기 도구 — 시안의 P·seg·ell·arc·ring·curve·rrect */
function createPen(STEP: number) {
  function P(o: O, x: number, y: number, a = 0.9, r = 1.05) {
    o.push({ x, y, a, r })
  }
  function seg(o: O, x1: number, y1: number, x2: number, y2: number, a: number, end = true) {
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / STEP))
    for (let i = 0; i < n + (end ? 1 : 0); i++) P(o, x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n, a)
  }
  function ell(o: O, cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, a: number) {
    const n = Math.max(3, Math.round((Math.abs(a1 - a0) * (rx + ry)) / 2 / STEP))
    for (let i = 0; i < n; i++) {
      const th = a0 + ((a1 - a0) * i) / n
      P(o, cx + Math.cos(th) * rx, cy + Math.sin(th) * ry, a)
    }
  }
  const arc = (o: O, cx: number, cy: number, r: number, a0: number, a1: number, a: number) => ell(o, cx, cy, r, r, a0, a1, a)
  const ring = (o: O, cx: number, cy: number, r: number, a: number) => ell(o, cx, cy, r, r, 0, TAU, a)
  /** 3차 베지어를 STEP 간격으로 (90분할) */
  function curve(o: O, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, a: number) {
    let px = x0,
      py = y0,
      acc = 0
    P(o, x0, y0, a)
    for (let i = 1; i <= 90; i++) {
      const s = i / 90,
        m = 1 - s
      const X = m * m * m * x0 + 3 * m * m * s * x1 + 3 * m * s * s * x2 + s * s * s * x3
      const Y = m * m * m * y0 + 3 * m * m * s * y1 + 3 * m * s * s * y2 + s * s * s * y3
      acc += Math.hypot(X - px, Y - py)
      px = X
      py = Y
      if (acc >= STEP) {
        P(o, X, Y, a)
        acc = 0
      }
    }
  }
  function rrect(o: O, x: number, y: number, w: number, h: number, r: number, a: number) {
    const q = Math.PI / 2
    seg(o, x + r, y, x + w - r, y, a, false)
    arc(o, x + w - r, y + r, r, -q, 0, a)
    seg(o, x + w, y + r, x + w, y + h - r, a, false)
    arc(o, x + w - r, y + h - r, r, 0, q, a)
    seg(o, x + w - r, y + h, x + r, y + h, a, false)
    arc(o, x + r, y + h - r, r, q, 2 * q, a)
    seg(o, x, y + h - r, x, y + r, a, false)
    arc(o, x + r, y + r, r, 2 * q, 3 * q, a)
  }
  return { STEP, P, seg, ell, arc, ring, curve, rrect }
}

type Pen = ReturnType<typeof createPen>

/** 웹 화면과 터미널이 함께 쓰는 창 */
function win(pen: Pen, o: O, b: Box) {
  const { STEP, P, seg, rrect } = pen
  const w = Math.min(b.w, b.h * 1.42),
    h = w / 1.42,
    x = b.x + (b.w - w) / 2,
    y = b.y + (b.h - h) / 2,
    u = w / 100,
    bar = 8.5 * u
  rrect(o, x, y, w, h, 3.2 * u, 0.95)
  seg(o, x + STEP, y + bar, x + w - STEP, y + bar, 0.6)
  for (let i = 0; i < 3; i++) P(o, x + 4.5 * u + i * 3.2 * u, y + bar / 2, 0.95, 1.9)
  return { x, y, w, h, u, bar }
}

/** 웹 화면: 창, 옆 메뉴, 제목, 카드 셋 */
function shapeWeb(pen: Pen, b: Box): O {
  const { STEP, seg, rrect } = pen
  const o: O = [],
    { x, y, w, h, u, bar } = win(pen, o, b)
  seg(o, x + 30 * u, y + bar / 2, x + 70 * u, y + bar / 2, 0.4)
  const sbx = x + 25 * u
  seg(o, sbx, y + bar + STEP, sbx, y + h - STEP, 0.5)
  for (let i = 0; i < 5; i++)
    seg(o, x + 4.5 * u, y + bar + 8 * u + i * 6 * u, x + (i % 2 ? 16 : 19.5) * u, y + bar + 8 * u + i * 6 * u, i === 0 ? 0.95 : 0.42)
  const mx = sbx + 6 * u,
    mw = w - 25 * u - 12 * u
  seg(o, mx, y + bar + 9 * u, mx + mw * 0.46, y + bar + 9 * u, 0.95)
  seg(o, mx, y + bar + 14 * u, mx + mw * 0.7, y + bar + 14 * u, 0.4)
  const cy = y + bar + 21 * u,
    cg = 3.5 * u,
    cw = (mw - cg * 2) / 3,
    ch = 20 * u
  for (let i = 0; i < 3; i++) rrect(o, mx + i * (cw + cg), cy, cw, ch, 2 * u, 0.72)
  seg(o, mx, cy + ch + 7 * u, mx + mw, cy + ch + 7 * u, 0.4)
  seg(o, mx, cy + ch + 12 * u, mx + mw * 0.62, cy + ch + 12 * u, 0.4)
  return o
}

/** 앱 화면: 휴대폰, 제목, 카드, 목록 세 줄, 아래 탭 */
function shapeApp(pen: Pen, b: Box): O {
  const { STEP, P, seg, ring, rrect } = pen
  const o: O = [],
    h = Math.min(b.h, b.w * 1.5),
    w = h / 2.02
  const x = b.x + (b.w - w) / 2,
    y = b.y + (b.h - h) / 2,
    u = w / 100
  rrect(o, x, y, w, h, 14 * u, 0.95)
  seg(o, x + 38 * u, y + 8 * u, x + 62 * u, y + 8 * u, 0.9)
  seg(o, x + 10 * u, y + 27 * u, x + 52 * u, y + 27 * u, 0.95)
  seg(o, x + 10 * u, y + 35 * u, x + 74 * u, y + 35 * u, 0.4)
  rrect(o, x + 10 * u, y + 45 * u, 80 * u, 52 * u, 6 * u, 0.72)
  for (let i = 0; i < 3; i++) {
    const ry = y + 113 * u + i * 18 * u
    ring(o, x + 15 * u, ry, 5 * u, 0.7)
    seg(o, x + 27 * u, ry - 2.6 * u, x + 72 * u, ry - 2.6 * u, 0.85)
    seg(o, x + 27 * u, ry + 3.6 * u, x + 56 * u, ry + 3.6 * u, 0.4)
  }
  seg(o, x + STEP, y + 177 * u, x + w - STEP, y + 177 * u, 0.5)
  for (let i = 0; i < 4; i++) P(o, x + 20 * u + i * 20 * u, y + 189.5 * u, i === 0 ? 0.95 : 0.5, 2.2)
  return o
}

/** 터미널: 창, 명령 줄 셋과 결과 줄, 깜박이는 자리 */
function shapeTerm(pen: Pen, b: Box): O {
  const { seg } = pen
  const o: O = [],
    { x, y, u, bar } = win(pen, o, b),
    L = x + 7 * u,
    r0 = y + bar + 10 * u
  const prompt = (yy: number) => {
    seg(o, L, yy - 2.4 * u, L + 3 * u, yy, 0.95, false)
    seg(o, L + 3 * u, yy, L, yy + 2.4 * u, 0.95)
  }
  prompt(r0)
  seg(o, L + 8 * u, r0, L + 44 * u, r0, 0.95)
  seg(o, L + 8 * u, r0 + 7 * u, L + 74 * u, r0 + 7 * u, 0.4)
  seg(o, L + 8 * u, r0 + 13 * u, L + 58 * u, r0 + 13 * u, 0.4)
  seg(o, L + 8 * u, r0 + 19 * u, L + 67 * u, r0 + 19 * u, 0.4)
  prompt(r0 + 28 * u)
  seg(o, L + 8 * u, r0 + 28 * u, L + 31 * u, r0 + 28 * u, 0.95)
  seg(o, L + 8 * u, r0 + 35 * u, L + 52 * u, r0 + 35 * u, 0.4)
  prompt(r0 + 44 * u)
  for (let i = 0; i < 4; i++) seg(o, L + 8 * u, r0 + 41.6 * u + i * 1.6 * u, L + 11.5 * u, r0 + 41.6 * u + i * 1.6 * u, 0.95)
  return o
}

/** 깃 그래프: 본줄에서 갈라졌다 합쳐지는 가지 하나, 아직 열려 있는 가지 하나 */
function shapeGit(pen: Pen, b: Box): O {
  const { P, seg, ring, curve } = pen
  const o: O = [],
    w = Math.min(b.w, b.h * 1.6),
    u = w / 100,
    x = b.x + (b.w - w) / 2,
    my = b.y + b.h / 2 + 1 * u
  const up = my - 22 * u,
    dn = my + 20 * u
  seg(o, x + 2 * u, my, x + 98 * u, my, 0.7)
  curve(o, x + 22 * u, my, x + 30 * u, my, x + 30 * u, up, x + 38 * u, up, 0.7)
  seg(o, x + 38 * u, up, x + 62 * u, up, 0.7)
  curve(o, x + 62 * u, up, x + 70 * u, up, x + 70 * u, my, x + 78 * u, my, 0.7)
  curve(o, x + 46 * u, my, x + 53 * u, my, x + 53 * u, dn, x + 60 * u, dn, 0.5)
  seg(o, x + 60 * u, dn, x + 92 * u, dn, 0.5)
  for (const v of [8, 22, 46, 78, 94]) {
    ring(o, x + v * u, my, 2.8 * u, 0.95)
    P(o, x + v * u, my, 0.95, 2.4)
  }
  for (const v of [42, 58]) {
    ring(o, x + v * u, up, 2.8 * u, 0.9)
    P(o, x + v * u, up, 0.9, 2.4)
  }
  for (const v of [68, 86]) ring(o, x + v * u, dn, 2.8 * u, 0.7)
  return o
}

/** 글: 모서리가 접힌 종이, 제목 두 줄, 글쓴이, 본문, 그림 한 칸 */
function shapePost(pen: Pen, b: Box): O {
  const { STEP, seg, arc, ring, rrect } = pen
  const o: O = [],
    h = Math.min(b.h, b.w * 1.25),
    w = h * 0.76,
    x = b.x + (b.w - w) / 2,
    y = b.y + (b.h - h) / 2,
    u = w / 100
  const c = 14 * u,
    r = 4 * u,
    q = Math.PI / 2,
    hh = h / u
  seg(o, x + r, y, x + w - c, y, 0.95, false)
  seg(o, x + w - c, y, x + w, y + c, 0.95, false)
  seg(o, x + w, y + c, x + w, y + h - r, 0.95, false)
  arc(o, x + w - r, y + h - r, r, 0, q, 0.95)
  seg(o, x + w - r, y + h, x + r, y + h, 0.95, false)
  arc(o, x + r, y + h - r, r, q, 2 * q, 0.95)
  seg(o, x, y + h - r, x, y + r, 0.95, false)
  arc(o, x + r, y + r, r, 2 * q, 3 * q, 0.95)
  seg(o, x + w - c, y + STEP, x + w - c, y + c, 0.55, false)
  seg(o, x + w - c, y + c, x + w - STEP, y + c, 0.55)
  seg(o, x + 12 * u, y + 22 * u, x + 68 * u, y + 22 * u, 0.95)
  seg(o, x + 12 * u, y + 30 * u, x + 50 * u, y + 30 * u, 0.95)
  ring(o, x + 14.6 * u, y + 41 * u, 2.6 * u, 0.6)
  seg(o, x + 21 * u, y + 41 * u, x + 44 * u, y + 41 * u, 0.4)
  for (let i = 0; i < 4; i++) seg(o, x + 12 * u, y + (52 + i * 7) * u, x + (i === 3 ? 60 : 88) * u, y + (52 + i * 7) * u, 0.4)
  rrect(o, x + 12 * u, y + 82 * u, 76 * u, hh * u - 82 * u - 24 * u, 3 * u, 0.72)
  seg(o, x + 12 * u, y + (hh - 15) * u, x + 88 * u, y + (hh - 15) * u, 0.4)
  seg(o, x + 12 * u, y + (hh - 8) * u, x + 66 * u, y + (hh - 8) * u, 0.4)
  return o
}

/** 영상: 화면과 재생 표시, 진행 줄, 아래에 채널과 제목 */
function shapeVideo(pen: Pen, b: Box): O {
  const { P, seg, ring, rrect } = pen
  const o: O = [],
    w = Math.min(b.w, b.h * 1.2),
    u = w / 100,
    ph = (w * 9) / 16,
    tot = ph + 20 * u
  const x = b.x + (b.w - w) / 2,
    y = b.y + (b.h - tot) / 2,
    cx = x + w / 2,
    cy = y + ph / 2 - 2 * u
  rrect(o, x, y, w, ph, 3.5 * u, 0.95)
  ring(o, cx, cy, 10 * u, 0.8)
  seg(o, cx - 3.4 * u, cy - 5.2 * u, cx + 5.6 * u, cy, 0.95, false)
  seg(o, cx + 5.6 * u, cy, cx - 3.4 * u, cy + 5.2 * u, 0.95, false)
  seg(o, cx - 3.4 * u, cy + 5.2 * u, cx - 3.4 * u, cy - 5.2 * u, 0.95, false)
  const py = y + ph - 7 * u
  seg(o, x + 5 * u, py, x + 37 * u, py, 0.95)
  P(o, x + 38.5 * u, py, 1, 2.8)
  seg(o, x + 41 * u, py, x + 95 * u, py, 0.35)
  const by = y + ph + 11 * u
  ring(o, x + 6 * u, by + 2 * u, 5 * u, 0.7)
  seg(o, x + 15 * u, by - 1 * u, x + 74 * u, by - 1 * u, 0.9)
  seg(o, x + 15 * u, by + 6 * u, x + 48 * u, by + 6 * u, 0.4)
  return o
}

/** 인스타툰: 네모 틀 안의 칸 셋, 인물과 말풍선, 아래에 넘김 점 */
function shapeToon(pen: Pen, b: Box): O {
  const { STEP, P, seg, ell, ring, rrect } = pen
  const o: O = [],
    s = Math.min(b.w, b.h * 0.9),
    u = s / 100,
    x = b.x + (b.w - s) / 2,
    y = b.y + (b.h - s - 9 * u) / 2
  rrect(o, x, y, s, s, 4 * u, 0.95)
  seg(o, x + STEP, y + 54 * u, x + s - STEP, y + 54 * u, 0.6)
  seg(o, x + 46 * u, y + STEP, x + 46 * u, y + 54 * u - STEP, 0.6)
  ring(o, x + 23 * u, y + 25 * u, 8 * u, 0.9)
  P(o, x + 20 * u, y + 24 * u, 0.95, 1.7)
  P(o, x + 26 * u, y + 24 * u, 0.95, 1.7)
  ell(o, x + 23 * u, y + 54 * u, 15 * u, 17 * u, Math.PI + 0.12, TAU - 0.12, 0.9)
  ell(o, x + 73 * u, y + 24 * u, 20 * u, 12.5 * u, 0, TAU, 0.9)
  seg(o, x + 61 * u, y + 35 * u, x + 55 * u, y + 46 * u, 0.9, false)
  seg(o, x + 55 * u, y + 46 * u, x + 68 * u, y + 36.5 * u, 0.9, false)
  seg(o, x + 61 * u, y + 21 * u, x + 85 * u, y + 21 * u, 0.5)
  seg(o, x + 64 * u, y + 27.5 * u, x + 81 * u, y + 27.5 * u, 0.5)
  ring(o, x + 22 * u, y + 76 * u, 7 * u, 0.9)
  ring(o, x + 78 * u, y + 76 * u, 7 * u, 0.9)
  ell(o, x + 22 * u, y + 100 * u, 13 * u, 14 * u, Math.PI + 0.25, TAU - 0.25, 0.9)
  ell(o, x + 78 * u, y + 100 * u, 13 * u, 14 * u, Math.PI + 0.25, TAU - 0.25, 0.9)
  for (let k = 0; k < 8; k++) {
    const th = (k * TAU) / 8 + 0.2
    seg(
      o,
      x + 50 * u + Math.cos(th) * 4.5 * u,
      y + 76 * u + Math.sin(th) * 4.5 * u,
      x + 50 * u + Math.cos(th) * 10 * u,
      y + 76 * u + Math.sin(th) * 10 * u,
      0.7
    )
  }
  for (let i = 0; i < 5; i++) P(o, x + s / 2 + (i - 2) * 4.6 * u, y + s + 6.5 * u, i === 1 ? 1 : 0.45, 2.2)
  return o
}

const BUILDERS: Record<ShapeId, (pen: Pen, b: Box) => O> = {
  web: shapeWeb,
  app: shapeApp,
  term: shapeTerm,
  git: shapeGit,
  post: shapePost,
  video: shapeVideo,
  toon: shapeToon,
}

/** 상자 하나에 모양 일곱을 `SHAPE_ORDER` 차례로 */
export function buildShapes(box: Box): ShapePoint[][] {
  const pen = createPen(stepFor(box.w))
  return SHAPE_ORDER.map((id) => BUILDERS[id](pen, box))
}
