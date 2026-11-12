'use client'

import { useRef, useState } from 'react'

/**
 * 메일 주소를 글자로 보여 주고 mailto 링크와 복사 단추를 둔다.
 * 메일 앱이 설정되지 않은 사람은 링크를 눌러도 아무 일이 없어서 글자와 복사가 필요하다.
 * 클립보드를 쓸 수 없거나 거절되면 조용히 실패하지 않고 주소 글자를 선택해 안내한다.
 */
export function EmailCopy({ email }: { email: string }) {
  const textRef = useRef<HTMLAnchorElement>(null)
  const [status, setStatus] = useState('')

  function selectText() {
    const el = textRef.current
    const sel = window.getSelection()
    if (!el || !sel) return
    const range = document.createRange()
    range.selectNodeContents(el)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard')
      await navigator.clipboard.writeText(email)
      setStatus('복사했습니다')
    } catch {
      selectText()
      setStatus('주소를 선택했습니다. 복사해 주세요')
    }
  }

  return (
    <div className="email-copy">
      <a ref={textRef} href={`mailto:${email}`} className="email-copy__address">
        {email}
      </a>
      <button type="button" className="btn btn-quiet" onClick={copy}>
        복사
      </button>
      <span role="status" aria-live="polite" className="email-copy__status">
        {status}
      </span>
    </div>
  )
}
