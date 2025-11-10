import { cn } from '@/lib/utils'
import { CodeBlockHeader } from './CodeBlockHeader'
import { createHash } from 'crypto'

interface CodeBlockProps {
  children: string
  className?: string
  title?: string
  showLineNumbers?: boolean
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

  // 코드 내용 기반으로 고유 ID 생성 (메모리 누수 방지)
  const hash = createHash('md5').update(children).digest('hex').slice(0, 8)
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
      <CodeBlockHeader code={children} language={language} title={title} />

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
