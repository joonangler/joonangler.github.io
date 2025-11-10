export type {
  Post,
  PostFrontmatter,
  ReadingTime,
  SeriesInfo,
  TagInfo,
} from './post'

export interface TOCItem {
  id: string
  text: string
  level: number
  children?: TOCItem[]
}

export interface NavItem {
  name: string
  href: string
  external?: boolean
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  author: {
    name: string
    email?: string
    url?: string
  }
  social?: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}
