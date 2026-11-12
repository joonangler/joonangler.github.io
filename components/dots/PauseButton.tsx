'use client'

interface PauseButtonProps {
  paused: boolean
  onToggle: () => void
}

/** 움직이는 배경을 멈추고 다시 트는 단추(오른쪽 아래). 자바스크립트가 없으면 CSS가 숨긴다. */
export function PauseButton({ paused, onToggle }: PauseButtonProps) {
  return (
    <button type="button" className="dot-pause" aria-pressed={paused} onClick={onToggle}>
      {paused ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 8 5.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      )}
      <span>{paused ? '배경 재생' : '배경 멈춤'}</span>
    </button>
  )
}
