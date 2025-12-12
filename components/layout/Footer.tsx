import Link from 'next/link'
import { Container } from './Container'
import { SITE_CONFIG } from '@/lib/constants'

/**
 * Site footer with copyright, links, and social media
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <Container>
        {/* <div className="flex flex-col gap-6 py-12 md:flex-row md:justify-between"> */}
          {/* About Section */}
          {/* <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-foreground">My Blog</h3>
            <p className="text-sm text-muted-foreground">
              A Next.js blog built with App Router and MDX
            </p>
          </div> */}

          {/* Navigation Links */}
          {/* <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                Navigation
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/posts"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Posts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tags"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Tags
                  </Link>
                </li>
                <li>
                  <Link
                    href="/series"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Series
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                Resources
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <a
                    href="/rss.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    RSS Feed
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div> */}
        {/* </div> */}

        {/* Copyright */}
        <div className="border-t border-border py-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
