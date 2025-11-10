'use client'

import { useEffect } from 'react'
import { Container } from '@/components/layout/Container'

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러를 로깅 서비스에 전송할 수 있습니다
    console.error('Posts page error:', error)
  }, [error])

  return (
    <Container className="py-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          포스트를 불러오는 중 오류가 발생했습니다
        </h2>
        <p className="text-muted-foreground mb-6">
          일시적인 문제일 수 있습니다. 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          다시 시도
        </button>
      </div>
    </Container>
  )
}
