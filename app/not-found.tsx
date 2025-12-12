import Link from 'next/link'
import { Container } from '@/components/layout/Container'

/**
 * 404 Not Found 페이지
 * 존재하지 않는 페이지에 접근했을 때 표시
 */
export default function NotFound() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        {/* 404 에러 코드 */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
            404
          </h1>
        </div>

        {/* 메시지 */}
        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        {/* 액션 버튼들 */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* 홈으로 돌아가기 */}
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mr-2 h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            홈으로 돌아가기
          </Link>

          {/* 검색 페이지로 이동 */}
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mr-2 h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            포스트 검색
          </Link>
        </div>

        {/* 추가 링크 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            또는 다음 페이지를 방문해보세요:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/posts"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              전체 글 목록
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link
              href="/tags"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              태그 목록
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link
              href="/series"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              시리즈 목록
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}
