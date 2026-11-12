import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/constants'
import { HomeHero } from '@/components/home/HomeHero'

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    path: '/',
  })
}

/** 홈. 첫 묶음 1b는 첫 화면만 — 아래 구역(작업·기록·맡는 일)은 1c(Task 11)가 더한다. */
export default function Home() {
  return <HomeHero />
}
