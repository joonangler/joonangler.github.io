import { PostCard } from './PostCard'
import { EmptyState } from '../ui/EmptyState'
import type { Post } from '@/types/post'

interface PostListProps {
  posts: Post[]
  emptyMessage?: string
}

/**
 * Post list component for displaying posts in a grid
 *
 * @example
 * <PostList posts={posts} />
 */
export function PostList({
  posts,
  emptyMessage = 'No posts found.',
}: PostListProps) {
  if (posts.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
