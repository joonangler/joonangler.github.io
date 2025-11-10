import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSeries, getPostsBySeries } from '@/lib/series'
import { Container } from '@/components/layout/Container'
import { PostList } from '@/components/post/PostList'
import { getPageMetadata } from '@/lib/seo'

interface SeriesPageProps {
  params: Promise<{
    series: string
  }>
}

export async function generateStaticParams() {
  const series = await getAllSeries()
  return series.map((item) => ({
    series: item.name,
  }))
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { series } = await params
  const decodedSeries = decodeURIComponent(series)

  return getPageMetadata({
    title: `${decodedSeries} 시리즈`,
    description: `${decodedSeries} 시리즈의 모든 포스트`,
    path: `/series/${series}`,
  })
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { series } = await params
  const decodedSeries = decodeURIComponent(series)
  const posts = await getPostsBySeries(decodedSeries)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          {decodedSeries}
        </h1>
        <p className="text-lg text-muted-foreground">
          총 {posts.length}개의 포스트
        </p>
      </div>

      <PostList
        posts={posts}
        emptyMessage={`"${decodedSeries}" 시리즈에 포스트가 없습니다.`}
      />
    </Container>
  )
}
