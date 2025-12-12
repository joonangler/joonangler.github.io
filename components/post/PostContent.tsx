import { MDXRemote } from 'next-mdx-remote/rsc'
import { mdxComponents } from '@/components/mdx/MDXComponents'
import { mdxOptions } from '@/lib/mdx'

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
    <article className="prose prose-neutral dark:prose-invert max-w-none mt-20">
      <MDXRemote source={content} components={mdxComponents} options={mdxOptions} />
    </article>
  )
}
