import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// 첫 화면은 캔버스를 쓰므로 여기서는 자리만. 이 시험이 보는 것은 아래 구역이다.
vi.mock('@/components/home/HomeHero', () => ({ HomeHero: () => <h1>hero</h1> }))

afterEach(() => vi.unstubAllEnvs())

describe('home page sections', () => {
  it('has no 기록 section while no post is published', async () => {
    // lib/mdx가 글 폴더를 모듈이 읽힐 때 정하므로, 환경값을 바꾼 뒤 모듈을 새로 읽는다
    vi.stubEnv('POSTS_DIR', fs.mkdtempSync(path.join(os.tmpdir(), 'no-posts-')))
    vi.resetModules()
    const { default: EmptyHome } = await import('@/app/page')
    render(await EmptyHome())
    expect(screen.queryByRole('heading', { name: '기록' })).toBeNull()
    expect(screen.queryByText('글 전체 보기')).toBeNull()
  })

  it('draws 기록 once posts exist', async () => {
    render(await Home())
    expect(screen.getByRole('heading', { name: '기록' })).toBeTruthy()
  })

  it('draws only what the content has: work and service cards, no placeholders', async () => {
    render(await Home())
    // fixtures: 작업 둘, 서비스 둘 → 카드도 둘씩. 이 홈페이지·둘째 서비스 같은 자리 카드는 없다
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(names).toEqual(expect.arrayContaining(['첫째 작업', '알파 서비스']))
    expect(screen.queryByText('이 홈페이지')).toBeNull()
    expect(screen.queryByText('확정되면 채웁니다')).toBeNull()
  })
})
