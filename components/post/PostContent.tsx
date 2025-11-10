import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdx/MDXComponents'

interface PostContentProps {
  content: string
}

/**
 * Post content component for rendering MDX
 * Applies prose styles and custom MDX components
 *
 * @example
 * <PostContent content={post.content} />
 */
export async function PostContent({ content }: PostContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote source={content} components={mdxComponents} />
    </article>
  )
}
