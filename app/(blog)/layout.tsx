import { BlogSectionNav } from '@/components/blog/BlogSectionNav'
import { HEADER_HEIGHT } from '@/lib/constants'

/** 블로그 묶음 경로 — 떠 있는 내비 밑에 화면이 깔리지 않게 여백을 두고 구역 머리를 단다. */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: HEADER_HEIGHT }}>
      <BlogSectionNav />
      {children}
    </div>
  )
}
