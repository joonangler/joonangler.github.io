import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import 'katex/dist/katex.min.css'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getBaseMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateWebSiteSchema } from '@/lib/json-ld'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = getBaseMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={inter.variable}>
      <head>
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
        <Providers>
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
