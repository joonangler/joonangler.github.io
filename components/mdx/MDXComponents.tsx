import { type MDXComponents } from 'mdx/types'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'
import { MDXImage } from './Image'
import { MDXLink } from './Link'
import { generateHeadingId } from '@/lib/toc'
import { getTextContent } from '@/lib/utils'

/**
 * rehype-pretty-code에서 제공하는 props 타입
 */
interface RehypePrettyCodeProps {
  'data-meta'?: string
  [key: string]: unknown
}

/**
 * code 엘리먼트의 props 타입
 */
interface CodeElementProps {
  className?: string
  children: string
  raw?: string
  [key: string]: unknown
}

// 정규식 상수화
const TITLE_REGEX = /title="([^"]+)"/
const SHOW_LINE_NUMBERS_REGEX = /showLineNumbers/

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
        className="mt-8 mb-4 scroll-mt-20 text-3xl font-bold tracking-tight border-b pb-2"
      >
        <a
          href={`#${id}`}
          className="group flex items-center no-underline hover:underline"
          aria-label={`Link to ${text}`}
        >
          {children}
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400">
            #
          </span>
        </a>
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
        <a
          href={`#${id}`}
          className="group flex items-center no-underline hover:underline"
          aria-label={`Link to ${text}`}
        >
          {children}
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400">
            #
          </span>
        </a>
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

  // 코드 블록
  pre: ({ children, ...props }) => {
    // children이 code 태그인 경우 CodeBlock 사용
    if (
      children &&
      typeof children === 'object' &&
      'props' in children &&
      children.props
    ) {
      const codeProps = children.props as CodeElementProps
      const { className, children: code, raw } = codeProps

      // 메타데이터 추출 (title, showLineNumbers 등)
      // rehype-pretty-code는 data-meta 또는 raw 속성에 메타 문자열을 포함
      const rawProps = props as RehypePrettyCodeProps
      const dataMeta = rawProps['data-meta'] ?? ''
      const rawString = raw ?? ''

      // 메타데이터를 한 번에 결합하여 검색 최적화
      const combinedMeta = `${dataMeta} ${rawString}`

      // title 추출: title="filename.ts"
      const titleMatch = combinedMeta.match(TITLE_REGEX)
      const title = titleMatch?.[1]

      // showLineNumbers 플래그 확인
      const showLineNumbers = SHOW_LINE_NUMBERS_REGEX.test(combinedMeta)

      return (
        <CodeBlock
          className={className}
          title={title}
          showLineNumbers={showLineNumbers}
        >
          {code}
        </CodeBlock>
      )
    }

    return <pre {...props}>{children}</pre>
  },

  // 인라인 코드
  code: ({ children, className }) => {
    // pre 태그 내부의 코드 블록은 별도 처리
    if (className) {
      return <code className={className}>{children}</code>
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

  // 커스텀 컴포넌트
  Callout,
  CodeBlock,
  Image: MDXImage,
}
