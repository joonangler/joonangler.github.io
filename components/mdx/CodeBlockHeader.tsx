'use client'

// 1. React 및 Next.js
import { useState } from 'react'

// 2. 외부 라이브러리
import { Check, Copy, X } from 'lucide-react'

// 3. 내부 라이브러리
import { cn } from '@/lib/utils'

interface CodeBlockHeaderProps {
  code: string
  language?: string
  title?: string
}

type CopyState = 'idle' | 'copied' | 'error'

/**
 * 코드 블록 헤더 (클라이언트 컴포넌트)
 * - 복사 버튼 인터랙션만 담당
 * - 서버 컴포넌트와 분리하여 번들 크기 최적화
 */
export function CodeBlockHeader({ code, language, title }: CodeBlockHeaderProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle')

  /**
   * 클립보드에 코드 복사
   */
  const handleCopy = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available')
      }

      await navigator.clipboard.writeText(code)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  const getCopyIcon = () => {
    switch (copyState) {
      case 'copied':
        return <Check className="h-4 w-4" />
      case 'error':
        return <X className="h-4 w-4" />
      default:
        return <Copy className="h-4 w-4" />
    }
  }

  const getCopyText = () => {
    switch (copyState) {
      case 'copied':
        return '복사했습니다'
      case 'error':
        return '복사하지 못했습니다'
      default:
        return '복사'
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2">
      <div className="flex items-center gap-2">
        {title && (
          <span className="text-sm font-medium text-foreground">
            {title}
          </span>
        )}
        {!title && language && (
          <span className="text-xs font-mono text-ink-3">
            {language}
          </span>
        )}
      </div>

      {/* 복사 버튼 */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-medium',
          'transition-colors duration-200',
          'focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          {
            // idle 상태: 인터랙션 가능
            'hover:bg-foreground/10 active:scale-95 cursor-pointer':
              copyState === 'idle',
            // disabled 상태: 시각적으로 비활성화 표시
            'cursor-not-allowed opacity-75': copyState !== 'idle',
            // 상태별 색상
            'text-foreground': copyState === 'copied' || copyState === 'error',
            'text-muted-foreground': copyState === 'idle',
          }
        )}
        title={copyState === 'idle' ? '코드 복사' : undefined}
        aria-label={`${language ? `${language} ` : ''}코드 복사`}
        aria-live="polite"
        disabled={copyState !== 'idle'}
      >
        {getCopyIcon()}
        <span>{getCopyText()}</span>
      </button>
    </div>
  )
}
