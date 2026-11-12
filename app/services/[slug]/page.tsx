import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPageMetadata } from '@/lib/seo'
import { getAllServices, getServiceBySlug } from '@/lib/services'
import { getAllWork } from '@/lib/work'
import { mdxComponents } from '@/components/mdx/MDXComponents'
import { mdxOptions } from '@/lib/mdx'
import { ServiceHero } from '@/components/services/ServiceHero'
import { ServiceSections } from '@/components/services/ServiceSections'

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

// generateStaticParams에서 반환되지 않은 경로는 404
export const dynamicParams = false

/** 서비스가 0개면 빌드를 멈춘다 — 글처럼 자리채움 경로를 두지 않는다. 서비스가 없는 사이트는 공개하지 않는다. */
export async function generateStaticParams() {
  const services = getAllServices()
  if (services.length === 0) throw new Error('content/services에 서비스가 하나도 없다')
  return services.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return { title: '서비스를 찾을 수 없습니다', robots: { index: false, follow: false } }
  return getPageMetadata({ title: service.title, description: service.summary, path: `/services/${slug}/` })
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  const works = getAllWork().filter((w) => service.related.includes(w.slug))
  const body = service.body.trim() ? (
    <article className="prose max-w-none">
      <MDXRemote source={service.body} components={mdxComponents} options={mdxOptions} />
    </article>
  ) : null

  return (
    <>
      <ServiceHero service={service} />
      <ServiceSections service={service} body={body} works={works} />
    </>
  )
}
