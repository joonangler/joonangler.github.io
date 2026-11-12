import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeLog } from '@/components/home/HomeLog'
import { createMockPost } from '../helpers/mockData'

const fourPosts = [1, 2, 3, 4].map((n) =>
  createMockPost({ slug: `p${n}`, title: `글 ${n}`, date: `2026-11-0${n}`, series: n === 1 ? 'sample series' : undefined }),
)

// jsdom의 next/link는 trailingSlash 설정을 몰라 href 끝의 /를 뗀다 — 끝 슬래시는 빼고 견준다(BlogSectionNav 시험과 같은 방식). 운영 빌드의 슬래시는 빌드 산출물 grep으로 본다.
describe('HomeLog', () => {
  it('draws nothing without posts', () => {
    const { container } = render(<HomeLog posts={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('shows three latest posts', () => {
    render(<HomeLog posts={fourPosts} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getAllByRole('link')[0].getAttribute('href')!.replace(/\/$/, '')).toBe('/posts/p1')
  })

  it('writes date, title and series on each row and links to all posts', () => {
    render(<HomeLog posts={fourPosts} />)
    const first = screen.getAllByRole('listitem')[0]
    expect(first.textContent).toContain('2026.11.01')
    expect(first.textContent).toContain('글 1')
    expect(first.textContent).toContain('sample series')
    expect(screen.getByRole('link', { name: '글 전체 보기' }).getAttribute('href')!.replace(/\/$/, '')).toBe('/posts')
    expect(screen.getByRole('heading', { name: '기록' })).toBeTruthy()
  })
})
