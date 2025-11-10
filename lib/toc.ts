import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { type TOCItem } from '@/types'

// 포스트 디렉토리 경로
const POSTS_PATH = path.join(process.cwd(), 'content', 'posts')

/**
 * 텍스트를 ID로 변환 (앵커 링크용)
 */
export function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣-]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 중복 하이픈 제거
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
}

/**
 * 마크다운 콘텐츠에서 헤딩 추출
 */
export function extractHeadings(content: string): TOCItem[] {
  const headings: TOCItem[] = []
  // 함수 내부에서 새로운 RegExp 인스턴스 생성 (전역 플래그 lastIndex 이슈 방지)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length // # 개수
    const text = match[2].trim()
    const id = generateHeadingId(text)

    headings.push({
      id,
      text,
      level,
    })
  }

  return headings
}

/**
 * 평면 헤딩 배열을 계층 구조로 변환
 */
export function buildTOCTree(headings: TOCItem[]): TOCItem[] {
  if (headings.length === 0) {
    return []
  }

  const root: TOCItem[] = []
  const stack: TOCItem[] = []

  for (const heading of headings) {
    const newItem: TOCItem = {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      children: [],
    }

    // 스택에서 현재 레벨보다 깊은 항목 제거
    while (stack.length > 0 && stack[stack.length - 1].level >= newItem.level) {
      stack.pop()
    }

    // 부모가 있으면 자식으로 추가, 없으면 루트에 추가
    if (stack.length > 0) {
      const parent = stack[stack.length - 1]
      parent.children = parent.children || []
      parent.children.push(newItem)
    } else {
      root.push(newItem)
    }

    stack.push(newItem)
  }

  return root
}

/**
 * 슬러그로부터 목차 생성
 */
export function getTOCFromSlug(slug: string): TOCItem[] {
  try {
    const filePath = path.join(POSTS_PATH, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return []
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(fileContent)

    const headings = extractHeadings(content)
    return buildTOCTree(headings)
  } catch (error) {
    console.error(`Error generating TOC for ${slug}:`, error)
    return []
  }
}

/**
 * 평면 목차 생성 (계층 구조 없이)
 */
export function getFlatTOC(slug: string): TOCItem[] {
  try {
    const filePath = path.join(POSTS_PATH, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return []
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { content } = matter(fileContent)

    return extractHeadings(content)
  } catch (error) {
    console.error(`Error generating flat TOC for ${slug}:`, error)
    return []
  }
}

/**
 * 목차에서 특정 레벨만 필터링
 */
export function filterTOCByLevel(
  toc: TOCItem[],
  minLevel: number = 2,
  maxLevel: number = 3
): TOCItem[] {
  return toc.filter((item) => item.level >= minLevel && item.level <= maxLevel)
}

/**
 * 목차 항목 수 계산 (재귀적으로)
 */
export function countTOCItems(toc: TOCItem[]): number {
  let count = 0

  for (const item of toc) {
    count++

    if (item.children && item.children.length > 0) {
      count += countTOCItems(item.children)
    }
  }

  return count
}

/**
 * 목차를 평면 배열로 변환 (DFS)
 */
export function flattenTOC(toc: TOCItem[]): TOCItem[] {
  const flattened: TOCItem[] = []

  function traverse(items: TOCItem[]) {
    for (const item of items) {
      flattened.push({
        id: item.id,
        text: item.text,
        level: item.level,
      })

      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(toc)
  return flattened
}

/**
 * 목차가 비어있는지 확인
 */
export function isTOCEmpty(toc: TOCItem[]): boolean {
  return toc.length === 0
}

/**
 * 목차 항목의 최대 깊이 계산
 */
export function getTOCMaxDepth(toc: TOCItem[]): number {
  let maxDepth = 0

  function traverse(items: TOCItem[], depth: number) {
    for (const item of items) {
      maxDepth = Math.max(maxDepth, depth)

      if (item.children && item.children.length > 0) {
        traverse(item.children, depth + 1)
      }
    }
  }

  traverse(toc, 1)
  return maxDepth
}

/**
 * 목차를 마크다운 형식으로 변환
 */
export function tocToMarkdown(toc: TOCItem[]): string {
  const lines: string[] = []

  function traverse(items: TOCItem[], indent: number = 0) {
    for (const item of items) {
      const prefix = '  '.repeat(indent)
      const link = `[${item.text}](#${item.id})`
      lines.push(`${prefix}- ${link}`)

      if (item.children && item.children.length > 0) {
        traverse(item.children, indent + 1)
      }
    }
  }

  traverse(toc)
  return lines.join('\n')
}
