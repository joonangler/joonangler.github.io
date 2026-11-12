'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { buildShapes, type ShapePoint } from '@/lib/dots/shapes'
import { PHASE_MS, advance, createTimeline, freeze, moveProgress, stillShape, type Timeline } from '@/lib/dots/motion'
import {
  assignTargets,
  backgroundCount,
  createBackgroundPoints,
  createFormPoints,
  drift,
  placeFormPoint,
  pointerOffset,
  resizeAction,
  restartFrom,
  twinkle,
  type BackgroundPoint,
  updateTargets,
  type FormPoint,
} from '@/lib/dots/field'
import { PauseButton } from './PauseButton'

interface DotFieldProps {
  mode: 'shapes' | 'plain'
  mask: 'home' | 'service' | 'band'
  /** mode 'shapes'에서 점이 모이는 자리 */
  slotRef?: RefObject<HTMLElement | null>
}

const rng = Math.random

/**
 * 부모를 채우는 점 무리 캔버스. 계산은 `lib/dots`, 여기는 캔버스·rAF·관찰자만 쥔다.
 * 프레임 상태는 effect 안의 지역 값(렌더와 무관)에, 멈춤 단추만 React 상태에 둔다.
 * 돌리는 조건: 보임 && !멈춤 && !모션줄이기 && 탭이 보임.
 */
export function DotField({ mode, mask, slotRef }: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const syncRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    pausedRef.current = paused
    syncRef.current?.()
  }, [paused])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // jsdom·오래된 브라우저: 그리지 않는다

    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    let W = 0,
      H = 0,
      raf = 0,
      last = 0,
      t = 0,
      visible = false
    let bg: BackgroundPoint[] = []
    let fp: FormPoint[] = []
    let shapes: ShapePoint[][] = []
    let timeline: Timeline = createTimeline({ shapeCount: 0, reduced: true })
    let spread = 0.5
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }

    const target = (idx: number) => assignTargets(fp, idx < 0 ? [] : shapes[idx], rng)

    function measureShapes() {
      if (mode !== 'shapes' || !slotRef?.current) {
        shapes = []
        return
      }
      const sr = slotRef.current.getBoundingClientRect(),
        hr = host!.getBoundingClientRect()
      shapes = buildShapes({ x: sr.left - hr.left, y: sr.top - hr.top, w: sr.width, h: sr.height })
    }

    function layout(keep: FormPoint[] | null) {
      bg = createBackgroundPoints(backgroundCount(W, H), W, H, rng)
      measureShapes()
      const n = shapes.length ? Math.max(...shapes.map((s) => s.length)) : 0
      fp = createFormPoints(n, W, H, rng)
      if (keep) {
        // 폭이 바뀌어 새로 깔 때도 그려져 있던 자리에서 출발한다(Review Focus 4)
        fp.forEach((p, i) => {
          const k = keep[i]
          if (!k) return
          p.x = k.x
          p.y = k.y
          p.cx = k.cx
          p.cy = k.cy
          p.cr = k.cr
          p.ca = k.ca
        })
        restartFrom(fp)
      }
    }

    function start() {
      timeline = createTimeline({ shapeCount: shapes.length, reduced: reduce.matches || shapes.length === 0 })
      if (shapes.length === 0) return
      if (timeline.still) target(timeline.shape)
    }

    function draw(dt: number) {
      ctx!.clearRect(0, 0, W, H)
      const ox = pointerOffset(ptr.x, W),
        oy = pointerOffset(ptr.y, H)
      for (const p of bg) {
        drift(p, dt, W, H)
        dot(p.x + ox * p.z, p.y + oy * p.z, 0.5 + 1.25 * p.z, twinkle(p, t) * 0.95)
      }
      const F = moveProgress(timeline)
      for (const p of fp) {
        drift(p, dt, W, H)
        placeFormPoint(p, F, spread, ox, oy, t)
        dot(p.cx, p.cy, p.cr, p.ca)
      }
    }
    function dot(x: number, y: number, r: number, al: number) {
      ctx!.fillStyle = `rgba(255,255,255,${al})`
      ctx!.beginPath()
      ctx!.arc(x, y, r, 0, 6.283)
      ctx!.fill()
    }

    function step(dt: number) {
      if (!fp.length) return
      const r = advance(timeline, dt)
      timeline = r.timeline
      if (r.go) {
        restartFrom(fp)
        spread = r.go.spread
        target(r.go.target)
      }
    }

    function frame(now: number) {
      const dt = Math.min(now - last, 50)
      last = now
      t += dt * 0.00018
      const k = 1 - Math.pow(0.001, dt / 900)
      ptr.x += (ptr.tx - ptr.x) * k
      ptr.y += (ptr.ty - ptr.y) * k
      step(dt)
      draw(dt)
      raf = requestAnimationFrame(frame)
    }

    function sync() {
      const should = visible && !pausedRef.current && !reduce.matches && document.visibilityState === 'visible'
      cancelAnimationFrame(raf)
      raf = 0
      if (reduce.matches && fp.length && !timeline.still) {
        // 보는 도중 모션 줄이기: 지금(가던) 모양이 모인 정지 화면 한 장으로
        const shape = stillShape(timeline)
        timeline = freeze(timeline, shape)
        restartFrom(fp)
        target(shape)
      } else if (!reduce.matches && timeline.still && fp.length) {
        timeline = { ...timeline, still: false }
      }
      if (should) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else {
        draw(0)
      }
    }

    function resize(first: boolean) {
      const r = host!.getBoundingClientRect()
      const next = { w: Math.round(r.width), h: Math.round(r.height) }
      const action = first ? 'rebuild' : resizeAction({ w: W, h: H }, next)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = next.w
      H = next.h
      canvas!.width = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (action === 'rebuild') {
        if (first) {
          ptr.x = ptr.tx = W * 0.72
          ptr.y = ptr.ty = H * 0.45
          layout(null)
          start()
        } else {
          const keep = fp
          layout(keep)
          timeline = { ...timeline, shapeCount: shapes.length }
          if (timeline.shape >= 0 && shapes.length) {
            target(Math.min(timeline.shape, shapes.length - 1))
            if (!timeline.still) timeline = { ...timeline, phase: 'move', elapsed: 0, duration: PHASE_MS.morph }
          }
          spread = 0.35
        }
      } else if (action === 'retarget') {
        // 높이만 바뀜(휴대폰 주소창): 점은 그대로, 목표 자리만 다시 잰다
        measureShapes()
        if (timeline.shape >= 0 && shapes.length) updateTargets(fp, shapes[timeline.shape])
      }
      draw(0)
    }

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const r = host.getBoundingClientRect()
      ptr.tx = e.clientX - r.left
      ptr.ty = e.clientY - r.top
    }
    const onResize = () => {
      resize(false)
      sync()
    }
    const observer = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      sync()
    })

    resize(true)
    syncRef.current = sync
    observer.observe(host)
    host.addEventListener('pointermove', onPointer)
    document.addEventListener('visibilitychange', sync)
    reduce.addEventListener('change', sync)
    window.addEventListener('resize', onResize)
    sync()

    return () => {
      cancelAnimationFrame(raf)
      syncRef.current = null
      observer.disconnect()
      host.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', sync)
      reduce.removeEventListener('change', sync)
      window.removeEventListener('resize', onResize)
    }
  }, [mode, slotRef])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className={`dot-canvas dot-mask-${mask}`} />
      <PauseButton paused={paused} onToggle={() => setPaused((p) => !p)} />
    </>
  )
}
