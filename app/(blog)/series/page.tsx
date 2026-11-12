import { type Metadata } from 'next'
import { getAllSeries, isSeriesCompleted } from '@/lib/series'
import { Container } from '@/components/layout/Container'
import { EmptyState } from '@/components/ui/EmptyState'
import { SeriesCard } from '@/components/series/SeriesCard'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourblog.com'

export const metadata: Metadata = {
  title: 'Series',
  description: 'Browse post series',
  alternates: {
    canonical: `${siteUrl}/series`,
  },
  openGraph: {
    title: 'Series',
    description: 'Browse post series',
    url: `${siteUrl}/series`,
  },
}

export default async function SeriesPage() {
  const allSeries = await getAllSeries()

  if (allSeries.length === 0) {
    return (
      <Container className="py-12">
        <EmptyState message="No series found." />
      </Container>
    )
  }

  // 진행중/완결 시리즈 분리
  const ongoingSeries = allSeries.filter((s) => !isSeriesCompleted(s))
  const completedSeries = allSeries.filter((s) => isSeriesCompleted(s))

  return (
    <Container className="py-12">
      {/* 헤더 */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Series</h1>
        <p className="text-lg text-muted-foreground">
          Explore {allSeries.length} post {allSeries.length === 1 ? 'series' : 'series'}
        </p>
      </div>

      <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allSeries.map((series) => (
              <SeriesCard key={series.slug} series={series} />
            ))}
          </div>
        </section>

      {/* 진행중인 시리즈 */}
      {/* {ongoingSeries.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-foreground">
            Ongoing Series ({ongoingSeries.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ongoingSeries.map((series) => (
              <SeriesCard key={series.slug} series={series} />
            ))}
          </div>
        </section>
      )} */}

      {/* 완결된 시리즈 */}
      {/* {completedSeries.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-semibold text-foreground">
            Completed Series ({completedSeries.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedSeries.map((series) => (
              <SeriesCard key={series.slug} series={series} />
            ))}
          </div>
        </section>
      )} */}
    </Container>
  )
}
