import type { TOCItem } from './index'

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  modifiedDate?: string
  tags: string[]
  series?: string
  seriesOrder?: number
  coverImage?: string
  author?: string
  draft?: boolean
  content: string
  readingTime: ReadingTime
  toc: TOCItem[]
}

export interface ReadingTime {
  text: string
  minutes: number
  time: number
  words: number
}

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  modifiedDate?: string
  tags: string[]
  series?: string
  seriesOrder?: number
  coverImage?: string
  author?: string
  draft?: boolean
  readingTime?: ReadingTime
}

export interface TagInfo {
  name: string
  slug: string
  count: number
  posts: Post[]
}

export interface SeriesInfo {
  name: string
  slug: string
  count: number
  posts: Post[]
  totalReadingTime: number
  coverImage?: string
}

export interface SeriesNavigation {
  previous: Post | null
  next: Post | null
  current: Post
  series: SeriesInfo
}
