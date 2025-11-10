'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'

/**
 * Giscus 댓글 컴포넌트
 * GitHub Discussions 기반 댓글 시스템
 */
export function Comments() {
  const { resolvedTheme } = useTheme()

  // 환경변수 확인
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  // 환경변수가 설정되지 않은 경우 댓글 섹션을 표시하지 않음
  if (!repo || !repoId || !category || !categoryId) {
    console.warn('Giscus environment variables are not configured')
    return null
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <Giscus
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        lang="ko"
        loading="lazy"
      />
    </div>
  )
}
