import { compileMDX } from 'next-mdx-remote/rsc'
import { cache } from 'react'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeKatex from 'rehype-katex'
import { type Element } from 'hast'
import type { PluggableList } from 'unified'
import { type Post, type PostFrontmatter } from '@/types/post'
import { extractHeadings, buildTOCTree } from './toc'
import { SITE_CONFIG } from '@/lib/constants'

// 포스트 디렉토리 경로
const POSTS_PATH = path.join(process.cwd(), 'content', 'posts')

/**
 * Shiki 코드 하이라이팅 설정
 */
const rehypePrettyCodeOptions = {
  theme: {
    dark: 'github-dark-dimmed',
    light: 'github-light',
  },
  keepBackground: false,
  onVisitLine(node: Element) {
    // 빈 줄 높이 유지
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }]
    }
    // 라인 번호를 위한 data-line 속성 추가
    if (!node.properties) {
      node.properties = {}
    }
    node.properties.dataLine = ''
  },
  onVisitHighlightedLine(node: Element) {
    // 하이라이트 라인 클래스 추가
    if (!node.properties) {
      node.properties = {}
    }
    const className = node.properties.className
    if (Array.isArray(className)) {
      className.push('highlighted')
    } else {
      node.properties.className = ['highlighted']
    }
  },
  onVisitHighlightedWord(node: Element) {
    // 하이라이트 단어 클래스 추가
    if (!node.properties) {
      node.properties = {}
    }
    node.properties.className = ['word-highlighted']
  },
}

/**
 * MDX 컴파일 옵션
 * MDXRemote에 전달할 options 객체
 */
export const mdxOptions = {
  parseFrontmatter: false, // gray-matter로 별도 처리
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      [rehypePrettyCode, rehypePrettyCodeOptions],
      rehypeKatex
    ] as PluggableList,
  },
}

/**
 * 슬러그로부터 파일 경로 생성 (파일명으로 재귀 검색)
 */
function getPostFilePath(slug: string): string | null {
  const files = getPostFiles()
  const found = files.find((file) => path.basename(file, '.mdx') === slug)
  return found || null
}

/**
 * 모든 포스트 파일 경로 가져오기 (재귀적으로)
 */
function getPostFiles(dir: string = POSTS_PATH): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // 재귀적으로 서브디렉토리 탐색
      files.push(...getPostFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * 파일 경로로부터 슬러그 생성 (파일명만 추출)
 */
function getSlugFromFilePath(filePath: string): string {
  // content/posts/2024/example-post.mdx -> example-post
  return path.basename(filePath, '.mdx')
}

/**
 * 슬러그로 포스트 가져오기
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const filePath = getPostFilePath(slug)

    if (!filePath || !fs.existsSync(filePath)) {
      return null
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    // Frontmatter 검증
    if (!data.title || !data.date) {
      console.warn(`Invalid frontmatter in ${slug}: missing title or date`)
      return null
    }

    // MDX 유효성 검증 (컴파일 테스트)
    try {
      await compileMDX({
        source: content,
        options: mdxOptions,
      })
    } catch (mdxError) {
      console.error(`MDX compilation error in ${slug}:`, mdxError)
      // MDX 파싱 실패 시 null 반환 (렌더링 불가능한 포스트)
      return null
    }

    // 읽기 시간 계산
    const readingTimeResult = readingTime(content)

    // TOC 생성
    const headings = extractHeadings(content)
    const toc = buildTOCTree(headings)

    // 포스트 객체 생성
    const post: Post = {
      slug,
      title: data.title,
      description: data.description || '',
      date: data.date,
      modifiedDate: data.modifiedDate,
      tags: data.tags || [],
      content: content, // 원본 MDX 문자열 저장 (PostContent에서 MDXRemote로 렌더링)
      readingTime: {
        text: readingTimeResult.text,
        minutes: Math.ceil(readingTimeResult.minutes),
        time: readingTimeResult.time,
        words: readingTimeResult.words,
      },
      series: data.series,
      seriesOrder: data.seriesOrder,
      coverImage: data.coverImage,
      author: data.author || SITE_CONFIG.author.name,
      draft: data.draft || false,
      toc,
    }

    return post
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

/**
 * 모든 포스트 가져오기 (내부 함수)
 * @internal
 */
async function _getAllPosts(includeDrafts: boolean = false): Promise<Post[]> {
  const files = getPostFiles()

  // 병렬 처리로 성능 개선
  const postPromises = files.map(async (file) => {
    const slug = getSlugFromFilePath(file)
    return getPostBySlug(slug)
  })

  const allPosts = await Promise.all(postPromises)

  // null 필터링 및 드래프트 제외
  const posts = allPosts.filter((post): post is Post => {
    if (!post) return false
    if (!includeDrafts && post.draft) return false
    return true
  })

  // 날짜 기준 내림차순 정렬
  posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return posts
}

/**
 * 모든 포스트 가져오기 (캐시됨)
 * React의 cache()를 사용하여 같은 렌더링 내에서 중복 호출 방지
 */
export const getAllPosts = cache(_getAllPosts)

/**
 * generateStaticParams를 위한 포스트 경로 가져오기
 */
export function getPostPaths(): Array<{ slug: string[] }> {
  const files = getPostFiles()

  // 중복 파일명 감지
  const slugs = files.map((file) => path.basename(file, '.mdx'))
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index)
  if (duplicates.length > 0) {
    console.warn(`[Warning] Duplicate post filenames detected: ${[...new Set(duplicates)].join(', ')}`)
  }

  return files.map((file) => ({
    slug: [path.basename(file, '.mdx')],
  }))
}

/**
 * 최근 포스트 가져오기
 */
export async function getRecentPosts(limit: number = 5): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts.slice(0, limit)
}

/**
 * Frontmatter만 추출 (빠른 메타데이터 조회)
 */
export function getPostFrontmatter(slug: string): PostFrontmatter | null {
  try {
    const filePath = getPostFilePath(slug)

    if (!filePath || !fs.existsSync(filePath)) {
      return null
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    if (!data.title || !data.date) {
      return null
    }

    const readingTimeResult = readingTime(content)

    return {
      title: data.title,
      description: data.description || '',
      date: data.date,
      modifiedDate: data.modifiedDate,
      tags: data.tags || [],
      series: data.series,
      seriesOrder: data.seriesOrder,
      coverImage: data.coverImage,
      author: data.author,
      draft: data.draft || false,
      readingTime: {
        text: readingTimeResult.text,
        minutes: Math.ceil(readingTimeResult.minutes),
        time: readingTimeResult.time,
        words: readingTimeResult.words,
      },
    }
  } catch (error) {
    console.error(`Error reading frontmatter for ${slug}:`, error)
    return null
  }
}

/**
 * 포스트 존재 여부 확인
 */
export function postExists(slug: string): boolean {
  const filePath = getPostFilePath(slug)
  return filePath !== null && fs.existsSync(filePath)
}
