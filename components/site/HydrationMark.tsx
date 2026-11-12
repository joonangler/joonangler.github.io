'use client'

import { useEffect } from 'react'

/** 화면 코드가 섰다는 표시를 세운다. 머리의 안전 장치(lib/js-guard.ts)가 이 표시를 본다. */
export function HydrationMark() {
  useEffect(() => {
    ;(window as unknown as { __hydrated?: boolean }).__hydrated = true
  }, [])
  return null
}
