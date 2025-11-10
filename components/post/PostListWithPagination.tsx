'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { type Post } from '@/types/post'
import { PostList } from './PostList'
import { Pagination } from '../ui/Pagination'

interface PostListWithPaginationProps {
  /** All posts to paginate through */
  allPosts: Post[]
  /** Number of posts per page (default: 12) */
  postsPerPage?: number
}

/**
 * 페이지네이션이 포함된 포스트 목록 컴포넌트 (클라이언트 사이드)
 *
 * @example
 * <PostListWithPagination allPosts={posts} postsPerPage={12} />
 */
export function PostListWithPagination({
  allPosts,
  postsPerPage = 12,
}: PostListWithPaginationProps) {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)

  // URL에서 페이지 번호 가져오기
  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1
    setCurrentPage(page)
  }, [searchParams])

  // 페이지네이션 계산
  const totalPosts = allPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const paginatedPosts = allPosts.slice(startIndex, endIndex)

  return (
    <>
      {/* 포스트 목록 */}
      <PostList posts={paginatedPosts} emptyMessage="No posts found." />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/posts"
          />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of {totalPosts}
          </p>
        </div>
      )}
    </>
  )
}
