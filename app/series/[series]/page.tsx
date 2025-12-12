import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSeries, getSeriesInfo } from '@/lib/series'
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
    series: item.slug,
  }))
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { series } = await params
  const decodedSeries = decodeURIComponent(series)

  // 시리즈 정보 가져오기
  const seriesInfo = await getSeriesInfo(decodedSeries)
  const seriesName = seriesInfo?.name || decodedSeries

  return getPageMetadata({
    title: `${seriesName} 시리즈`,
    description: `${seriesName} 시리즈의 모든 포스트`,
    path: `/series/${series}`,
  })
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { series } = await params
  const decodedSeries = decodeURIComponent(series)

  // 시리즈 정보 가져오기 (실제 제목 포함)
  const seriesInfo = await getSeriesInfo(decodedSeries)

  if (!seriesInfo || seriesInfo.posts.length === 0) {
    notFound()
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          {seriesInfo.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          총 {seriesInfo.count}개의 포스트
        </p>
      </div>

      <PostList
        posts={seriesInfo.posts}
        emptyMessage={`"${seriesInfo.name}" 시리즈에 포스트가 없습니다.`}
      />
    </Container>
  )
}
