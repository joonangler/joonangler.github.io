import { type ReactNode } from 'react'

interface CalloutProps {
  children: ReactNode
  type?: 'info' | 'warning' | 'error' | 'success'
  title?: string
}

/**
 * Callout 컴포넌트
 * - 정보, 경고, 에러, 성공 메시지 표시
 * - 강조색이 없다: 네 종류 모두 면 + 선이고, 종류는 아이콘과 제목이 가른다
 */
export function Callout({ children, type = 'info', title }: CalloutProps) {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  }

  const icon = icons[type]

  return (
    <div
      className="my-6 rounded-lg border-l-4 border-border bg-card p-4"
      role="alert"
    >
      <div className="flex gap-3">
        {/* 아이콘 */}
        <div className="shrink-0 text-xl" aria-hidden="true">
          {icon}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1">
          {title && (
            <p className="mb-2 font-semibold text-foreground">{title}</p>
          )}
          <div className="text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
