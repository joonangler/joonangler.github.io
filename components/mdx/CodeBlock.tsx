import { cn } from '@/lib/utils'
import { CodeBlockHeader } from './CodeBlockHeader'
import { createHash } from 'crypto'
import type { ReactNode } from 'react'

interface CodeBlockProps {
  children: ReactNode
  className?: string
  title?: string
  showLineNumbers?: boolean
}

/**
 * ReactNode를 문자열로 변환
 */
function getStringFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  if (Array.isArray(children)) {
    return children.map(getStringFromChildren).join('')
  }
  if (
    children &&
    typeof children === 'object' &&
    'props' in children &&
    children.props &&
    typeof children.props === 'object' &&
    'children' in children.props
  ) {
    return getStringFromChildren(children.props.children as ReactNode)
  }
  return String(children ?? '')
}

/**
 * 코드 블록 컴포넌트 (서버 컴포넌트)
 * - Shiki 하이라이팅 지원 (서버에서 렌더링)
 * - 복사 버튼 (클라이언트 컴포넌트로 분리)
 * - 언어 표시
 * - 제목 표시
 */
export function CodeBlock({
  children,
  className = '',
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  // 언어 추출 (예: language-typescript -> typescript)
  const language = className?.replace(/language-/, '') || 'text'

  // children을 문자열로 변환
  const codeString = getStringFromChildren(children)

  // 코드 내용 기반으로 고유 ID 생성 (메모리 누수 방지)
  const hash = createHash('md5').update(codeString).digest('hex').slice(0, 8)
  const codeId = `code-block-${hash}`
  const ariaLabel = title
    ? `${language} code snippet: ${title}`
    : `${language} code snippet`

  return (
    <div
      className="relative my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
      role="region"
      aria-label={ariaLabel}
    >
      {/* 헤더 (클라이언트 컴포넌트) */}
      <CodeBlockHeader code={codeString} language={language} title={title} />

      {/* 코드 영역 (서버 렌더링) */}
      <div className="overflow-x-auto">
        <pre
          id={codeId}
          className={cn(
            'p-4 text-sm leading-relaxed',
            className
          )}
          {...(showLineNumbers && { 'data-line-numbers': true })}
          aria-label={`${language} code block${showLineNumbers ? ' with line numbers' : ''}`}
          tabIndex={0}
        >
          <code className={className} data-language={language}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  )
}
