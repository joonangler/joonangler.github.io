import { Metadata } from 'next'
import { getPageMetadata } from '@/lib/seo'
import { SITE_CONFIG } from '@/lib/constants'
import { getAllPosts } from '@/lib/posts'
import { getAllServices } from '@/lib/services'
import { getAllWork } from '@/lib/work'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeWork } from '@/components/home/HomeWork'
import { HomeLog } from '@/components/home/HomeLog'
import { HomeServices } from '@/components/home/HomeServices'

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    path: '/',
  })
}

/** 홈. 첫 화면 뒤에 작업 · 기록 · 맡는 일. 자료가 없는 구역은 각 컴포넌트가 그리지 않는다. */
export default async function Home() {
  const [posts, works, services] = [await getAllPosts(), getAllWork(), getAllServices()]
  return (
    <>
      <HomeHero />
      <div className="home-sections">
        <HomeWork works={works} />
        <HomeLog posts={posts} />
        <HomeServices services={services} />
      </div>
    </>
  )
}
