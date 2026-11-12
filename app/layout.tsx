import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import 'katex/dist/katex.min.css'
import './globals.css'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import { getBaseMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateWebSiteSchema } from '@/lib/json-ld'

export const metadata: Metadata = getBaseMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className="dark">
      <head>
        <link
          rel="stylesheet"
          href="/fonts/pretendard/pretendardvariable-dynamic-subset.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/rss.xml"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          title="Atom Feed"
          href="/atom.xml"
        />
        <link
          rel="alternate"
          type="application/feed+json"
          title="JSON Feed"
          href="/feed.json"
        />
        <JsonLd data={generateWebSiteSchema()} />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <a href="#main-content" className="skip-link">
          본문으로 건너뛰기
        </a>
        <header>
          <SiteNav />
        </header>
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
