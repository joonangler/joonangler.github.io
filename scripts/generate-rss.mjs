import { Feed } from 'feed'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.production file
const envPath = path.join(__dirname, '..', '.env.production')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('✅ Loaded environment variables from .env.production')
} else {
  console.warn('⚠️  .env.production file not found, using default values')
}

/**
 * RSS Feed 생성 스크립트
 * 빌드 후 실행되어 out/rss.xml 파일을 생성합니다.
 */

/**
 * 재귀적으로 모든 MDX 파일 찾기
 */
function getMDXFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      getMDXFiles(filePath, fileList)
    } else if (file.endsWith('.mdx')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * MDX 파일에서 포스트 데이터 추출
 */
function getPostFromFile(filePath, postsDir) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(fileContent)

  // frontmatter 검증
  if (!data.title || !data.date) {
    return null
  }

  // draft 제외
  if (data.draft) {
    return null
  }

  // slug 생성 (content/posts/2025/example.mdx -> example)
  const slug = path.basename(filePath, '.mdx')

  return {
    slug,
    title: data.title,
    description: data.description || '',
    date: data.date,
    tags: data.tags || [],
    coverImage: data.coverImage,
    author: data.author,
  }
}

async function generateRSSFeed() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'My Blog'
    const siteDescription =
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A Next.js blog'
    const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME || 'Anonymous'
    const authorEmail =
      process.env.NEXT_PUBLIC_AUTHOR_EMAIL || 'noreply@example.com'

    console.log('🔨 Generating RSS feed...')

    // Feed 객체 생성
    const feed = new Feed({
      title: siteName,
      description: siteDescription,
      id: siteUrl,
      link: siteUrl,
      language: 'ko',
      favicon: `${siteUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, ${authorName}`,
      updated: new Date(),
      generator: 'Feed for Node.js',
      feedLinks: {
        rss2: `${siteUrl}/rss.xml`,
        atom: `${siteUrl}/atom.xml`,
        json: `${siteUrl}/feed.json`,
      },
      author: {
        name: authorName,
        email: authorEmail,
        link: siteUrl,
      },
    })

    // 포스트 디렉토리에서 모든 MDX 파일 읽기
    const postsDir = path.join(__dirname, '..', 'content', 'posts')
    const mdxFiles = getMDXFiles(postsDir)

    // 각 파일에서 포스트 데이터 추출
    const posts = mdxFiles
      .map((file) => getPostFromFile(file, postsDir))
      .filter((post) => post !== null)
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    console.log(`📝 Found ${posts.length} posts`)

    // 각 포스트를 Feed에 추가
    posts.forEach((post) => {
      const postUrl = `${siteUrl}/posts/${post.slug}`

      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.description,
        content: post.description,
        author: [
          {
            name: post.author || authorName,
            email: authorEmail,
            link: siteUrl,
          },
        ],
        date: new Date(post.date),
        category: post.tags.map((tag) => ({ name: tag })),
        image: post.coverImage ? `${siteUrl}${post.coverImage}` : undefined,
      })
    })

    // out 디렉토리 확인 및 생성
    const outDir = path.join(__dirname, '..', 'out')
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true })
    }

    // RSS 2.0 XML 생성
    const rssXml = feed.rss2()
    fs.writeFileSync(path.join(outDir, 'rss.xml'), rssXml)
    console.log('✅ RSS feed generated: out/rss.xml')

    // Atom 1.0 XML 생성 (선택사항)
    const atomXml = feed.atom1()
    fs.writeFileSync(path.join(outDir, 'atom.xml'), atomXml)
    console.log('✅ Atom feed generated: out/atom.xml')

    // JSON Feed 생성 (선택사항)
    const jsonFeed = feed.json1()
    fs.writeFileSync(path.join(outDir, 'feed.json'), jsonFeed)
    console.log('✅ JSON feed generated: out/feed.json')

    console.log('🎉 All feeds generated successfully!')
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error)
    process.exit(1)
  }
}

generateRSSFeed()
