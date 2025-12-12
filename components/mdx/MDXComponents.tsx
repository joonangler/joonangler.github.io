import { type MDXComponents } from 'mdx/types'
import { type ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'
import { CodeBlockHeader } from './CodeBlockHeader'
import { Callout } from './Callout'
import { MDXImage } from './Image'
import { MDXLink } from './Link'
import { generateHeadingId } from '@/lib/toc'
import { getTextContent } from '@/lib/utils'

/**
 * ReactNode에서 텍스트만 추출
 */
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  if (typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const props = children.props as { children?: ReactNode }
    return extractTextFromChildren(props.children)
  }
  return ''
}

/**
 * MDX 커스텀 컴포넌트 매핑
 *
 * 이 객체는 MDX 문서에서 사용되는 HTML 태그를 커스텀 React 컴포넌트로 매핑합니다.
 */
export const mdxComponents: MDXComponents = {
  // 헤딩 (앵커 링크 포함)
  h1: ({ children }) => {
    const text = getTextContent(children)
    const id = text ? generateHeadingId(text) : undefined
    return (
      <h1 id={id} className="mt-8 mb-4 text-4xl font-bold tracking-tight">
        {children}
      </h1>
    )
  },
  h2: ({ children }) => {
    const text = getTextContent(children)
    const id = text ? generateHeadingId(text) : undefined
    return (
      <h2
        id={id}
        className="mt-8 mb-4 scroll-mt-20 text-3xl font-bold tracking-tight"
      >
        {children}
      </h2>
    )
  },
  h3: ({ children }) => {
    const text = getTextContent(children)
    const id = text ? generateHeadingId(text) : undefined
    return (
      <h3
        id={id}
        className="mt-6 mb-3 scroll-mt-20 text-2xl font-semibold tracking-tight"
      >
        {children}
      </h3>
    )
  },
  h4: ({ children }) => {
    const text = getTextContent(children)
    const id = text ? generateHeadingId(text) : undefined
    return (
      <h4
        id={id}
        className="mt-6 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight"
      >
        {children}
      </h4>
    )
  },
  h5: ({ children }) => {
    const text = getTextContent(children)
    const id = text ? generateHeadingId(text) : undefined
    return (
      <h5
        id={id}
        className="mt-4 mb-2 scroll-mt-20 text-lg font-semibold tracking-tight"
      >
        {children}
      </h5>
    )
  },
  h6: ({ children }) => {
    const text = getTextContent(children)
    const id = text ? generateHeadingId(text) : undefined
    return (
      <h6
        id={id}
        className="mt-4 mb-2 scroll-mt-20 text-base font-semibold tracking-tight"
      >
        {children}
      </h6>
    )
  },

  // 문단
  p: ({ children }) => (
    <p className="my-4 leading-7 [&:not(:first-child)]:mt-6">
      {children}
    </p>
  ),

  // 링크
  a: ({ href = '', ...props }) => <MDXLink href={href} {...props} />,

  // 이미지
  img: ({ src = '', alt = '', ...props }) => (
    <MDXImage src={src} alt={alt} {...props} />
  ),

  // 코드 블록 - rehype-pretty-code의 출력 + UI 래퍼
  pre: ({ children, ...props }) => {
    // props에서 rehype-pretty-code가 추가한 속성 추출
    const dataLanguage = (props as Record<string, unknown>)['data-language'] as string | undefined
    const language = dataLanguage || 'text'

    // code 태그의 children에서 실제 코드 텍스트 추출 및 data-line-numbers 확인
    let codeText = ''
    let hasLineNumbers = false
    if (children && typeof children === 'object' && 'props' in children) {
      const codeProps = children.props as Record<string, unknown>
      codeText = extractTextFromChildren(codeProps.children as ReactNode)
      hasLineNumbers = 'data-line-numbers' in codeProps
    }

    // rehype-pretty-code가 처리한 경우 (data-language 속성이 있음)
    if (dataLanguage) {
      return (
        <div
          className="relative my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
          role="region"
          aria-label={`${language} code snippet`}
        >
          {/* 헤더 (복사 버튼 포함) */}
          <CodeBlockHeader code={codeText} language={language} />

          {/* rehype-pretty-code가 생성한 pre/code 구조 유지 */}
          <div className="overflow-x-auto">
            <pre
              {...props}
              {...(hasLineNumbers ? { 'data-line-numbers': '' } : {})}
              className="p-4 text-sm leading-relaxed"
            >
              {children}
            </pre>
          </div>
        </div>
      )
    }

    // 일반 코드 블록 (rehype-pretty-code 미처리)
    return <pre {...props}>{children}</pre>
  },

  // 인라인 코드
  code: ({ children, className, ...props }) => {
    // 코드 블록 내부의 code는 children이 React element (rehype-pretty-code가 생성한 span들)
    // 인라인 코드는 children이 단순 문자열
    const isCodeBlock = typeof children !== 'string' && children !== null && typeof children !== 'number'

    // 코드 블록 또는 language 클래스가 있는 경우
    if (isCodeBlock || className) {
      return <code className={className} {...props}>{children}</code>
    }

    // 인라인 코드
    return (
      <code className="relative rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
        {children}
      </code>
    )
  },

  // 리스트
  ul: ({ children }) => (
    <ul className="my-6 ml-6 list-disc space-y-2 [&>li]:mt-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-6 ml-6 list-decimal space-y-2 [&>li]:mt-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-7">{children}</li>
  ),

  // 인용구
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-gray-300 pl-6 italic text-gray-700 dark:border-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  ),

  // 테이블
  table: ({ children }) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100 dark:bg-gray-800">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="border-t border-gray-300 dark:border-gray-700">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-semibold dark:border-gray-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">
      {children}
    </td>
  ),

  // 수평선
  hr: () => (
    <hr className="my-8 border-t border-gray-300 dark:border-gray-700" />
  ),

  // Figure (rehype-pretty-code의 title 지원)
  figure: ({ children, ...props }) => {
    // rehype-pretty-code가 생성한 figure인지 확인
    const isCodeFigure = 'data-rehype-pretty-code-figure' in props

    if (isCodeFigure) {
      // children을 배열로 변환
      const childArray = Array.isArray(children) ? children : [children]

      // figcaption에서 title 추출
      let title: string | undefined
      const figcaptionChild = childArray.find(
        (child) =>
          child &&
          typeof child === 'object' &&
          'type' in child &&
          child.type === 'figcaption'
      )

      if (figcaptionChild && typeof figcaptionChild === 'object' && 'props' in figcaptionChild) {
        title = getTextContent(figcaptionChild.props.children)
      }

      // pre 엘리먼트 찾기
      const preChild = childArray.find(
        (child) =>
          child &&
          typeof child === 'object' &&
          'type' in child &&
          child.type === 'pre'
      )

      if (preChild && typeof preChild === 'object' && 'props' in preChild) {
        const preProps = preChild.props as Record<string, unknown>
        const dataLanguage = preProps['data-language'] as string | undefined
        const language = dataLanguage || 'text'

        // code 엘리먼트에서 data-line-numbers 확인
        const codeChild = preProps.children
        let hasLineNumbers = false
        let codeText = ''

        if (codeChild && typeof codeChild === 'object' && 'props' in codeChild) {
          const codeProps = codeChild.props as Record<string, unknown>
          hasLineNumbers = 'data-line-numbers' in codeProps
          codeText = extractTextFromChildren(codeProps.children as ReactNode)
        }

        return (
          <div
            className="relative my-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
            role="region"
            aria-label={`${language} code snippet`}
          >
            {/* 헤더 (제목 또는 언어, 복사 버튼 포함) */}
            <CodeBlockHeader code={codeText} language={language} title={title} />

            {/* rehype-pretty-code가 생성한 pre/code 구조 유지 */}
            <div className="overflow-x-auto">
              <pre
                {...preProps}
                {...(hasLineNumbers ? { 'data-line-numbers': '' } : {})}
                className="p-4 text-sm leading-relaxed"
              >
                {preProps.children as ReactNode}
              </pre>
            </div>
          </div>
        )
      }
    }

    // 일반 figure (코드 블록이 아닌 경우)
    return <figure {...props}>{children}</figure>
  },

  // 커스텀 컴포넌트
  Callout,
  CodeBlock,
  Image: MDXImage,
}
