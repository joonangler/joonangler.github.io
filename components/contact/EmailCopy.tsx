'use client'

import { useRef, useState } from 'react'

/**
 * 메일 주소를 글자로 보여 주고 mailto 링크와 복사 단추를 둔다.
 * 메일 앱이 설정되지 않은 사람은 링크를 눌러도 아무 일이 없어서 글자와 복사가 필요하다.
 * 클립보드를 쓸 수 없거나 거절되면 조용히 실패하지 않고 주소 글자를 선택해 안내한다.
 */
export function EmailCopy({ email }: { email: string }) {
  const textRef = useRef<HTMLAnchorElement>(null)
  // 같은 문구가 다시 나와도 보조 기술이 다시 읽도록, 결과마다 새 노드를 꽂는다(key가 바뀌면 React가 노드를 새로 만든다)
  const [status, setStatus] = useState({ text: '', n: 0 })
  const announce = (text: string) => setStatus((s) => ({ text, n: s.n + 1 }))

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
      announce('복사했습니다')
    } catch {
      selectText()
      announce('주소를 선택했습니다. 복사해 주세요')
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
        <span key={status.n}>{status.text}</span>
      </span>
    </div>
  )
}
