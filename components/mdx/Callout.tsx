import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CalloutProps {
  children: ReactNode
  type?: 'info' | 'warning' | 'error' | 'success'
  title?: string
}

/**
 * Callout 컴포넌트
 * - 정보, 경고, 에러, 성공 메시지 표시
 * - 아이콘 및 색상 테마
 */
export function Callout({ children, type = 'info', title }: CalloutProps) {
  const config = {
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      titleColor: 'text-blue-900 dark:text-blue-100',
      textColor: 'text-blue-800 dark:text-blue-200',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      titleColor: 'text-yellow-900 dark:text-yellow-100',
      textColor: 'text-yellow-800 dark:text-yellow-200',
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      titleColor: 'text-red-900 dark:text-red-100',
      textColor: 'text-red-800 dark:text-red-200',
    },
    success: {
      icon: '✅',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      titleColor: 'text-green-900 dark:text-green-100',
      textColor: 'text-green-800 dark:text-green-200',
    },
  }

  const { icon, bgColor, borderColor, titleColor, textColor } = config[type]

  return (
    <div
      className={cn(
        'my-6 rounded-lg border-l-4 p-4',
        bgColor,
        borderColor
      )}
      role="alert"
    >
      <div className="flex gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0 text-xl" aria-hidden="true">
          {icon}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1">
          {title && (
            <p className={cn('mb-2 font-semibold', titleColor)}>{title}</p>
          )}
          <div className={cn('text-sm leading-relaxed', textColor)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
