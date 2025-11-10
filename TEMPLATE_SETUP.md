# 템플릿 설정 가이드

> Next.js Blog Template 사용자를 위한 상세 설정 가이드

## 📋 목차

1. [리포지토리 생성](#1-리포지토리-생성)
2. [환경변수 설정](#2-환경변수-설정)
3. [배포 타입 선택](#3-배포-타입-선택)
4. [사이트 커스터마이징](#4-사이트-커스터마이징)
5. [첫 포스트 작성](#5-첫-포스트-작성)
6. [선택적 기능 설정](#6-선택적-기능-설정)
7. [배포하기](#7-배포하기)
8. [트러블슈팅](#8-트러블슈팅)

---

## 1. 리포지토리 생성

### 방법 A: GitHub UI 사용 (권장)

1. 템플릿 리포지토리 페이지로 이동: https://github.com/joonangler/blog
2. 우측 상단 **"Use this template"** 버튼 클릭
3. **"Create a new repository"** 선택
4. Repository name 입력:
   - **User/Org Page**: `username.github.io` (예: `joonangler.github.io`)
   - **Project Page**: 원하는 이름 (예: `my-blog`, `tech-blog`)
5. Public으로 설정 (GitHub Pages는 Public 필요)
6. **"Create repository"** 클릭

### 방법 B: GitHub CLI 사용

```bash
# User/Organization Page로 생성
gh repo create username.github.io --template joonangler/blog --public --clone

# Project Page로 생성
gh repo create my-blog --template joonangler/blog --public --clone
```

### 로컬로 클론

```bash
git clone https://github.com/username/your-repo.git
cd your-repo
```

---

## 2. 환경변수 설정

### 2.1 로컬 개발용 환경변수

```bash
# .env.example을 .env.local로 복사
cp .env.example .env.local
```

**`.env.local` 편집:**

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Your Blog Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your blog description here

# Author Information
NEXT_PUBLIC_AUTHOR_NAME=Your Name
NEXT_PUBLIC_AUTHOR_EMAIL=your.email@example.com

# Social Links
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername

# Optional: Google Analytics (로컬에서는 불필요)
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Giscus (로컬에서는 불필요)
# NEXT_PUBLIC_GISCUS_REPO=yourusername/your-repo
# ...
```

### 2.2 프로덕션 배포용 환경변수

**`.env.production` 편집:**

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://username.github.io  # 실제 배포 URL
NEXT_PUBLIC_SITE_NAME=Your Blog Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your blog description
NEXT_PUBLIC_AUTHOR_NAME=Your Name
NEXT_PUBLIC_AUTHOR_EMAIL=your.email@example.com
NEXT_PUBLIC_GITHUB_URL=https://github.com/yourusername
```

**중요**: `.env.production`은 Git에 커밋됩니다. 민감한 정보(API 키 등)는 GitHub Secrets를 사용하세요.

---

## 3. 배포 타입 선택

GitHub Pages는 두 가지 배포 방식을 지원합니다.

### 옵션 A: User/Organization Page (권장)

**장점**: 루트 도메인으로 배포 (`https://username.github.io`)

**설정:**

1. **리포지토리 이름**: 정확히 `username.github.io`
2. **`next.config.ts` 확인** (변경 불필요):
   ```typescript
   basePath: process.env.NODE_ENV === 'production' ? '' : '',
   ```
3. **`.env.production` 설정**:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://username.github.io
   ```

### 옵션 B: Project Page

**특징**: 서브 경로로 배포 (`https://username.github.io/blog`)

**설정:**

1. **리포지토리 이름**: 자유 (예: `blog`, `my-blog`)
2. **`next.config.ts` 수정**:
   ```typescript
   basePath: process.env.NODE_ENV === 'production' ? '/blog' : '',
   ```
3. **`.env.production` 설정**:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://username.github.io/blog
   ```
4. **`.github/workflows/deploy.yml` 수정**:
   ```yaml
   - name: Create .env.production
     run: |
       echo "NEXT_PUBLIC_SITE_URL=https://username.github.io/blog" >> .env.production
       # ... 기타 환경변수
   ```

---

## 4. 사이트 커스터마이징

### 4.1 사이트 메타데이터

**`app/layout.tsx` 편집:**

```typescript
export const metadata: Metadata = {
  title: {
    default: 'Your Blog Name',
    template: '%s | Your Blog Name',
  },
  description: 'Your blog description',
  // ... 기타 메타데이터
}
```

### 4.2 테마 색상 변경

**`app/globals.css` 편집:**

```css
:root {
  --primary: 220 90% 56%;        /* 메인 색상 (파란색) */
  --secondary: 280 60% 50%;      /* 보조 색상 (보라색) */
  --accent: 340 82% 47%;         /* 강조 색상 (빨간색) */
  /* ... 기타 색상 변수 */
}

.dark {
  --primary: 220 80% 60%;        /* 다크모드 메인 색상 */
  /* ... */
}
```

**색상 도구**: [HSL Color Picker](https://hslpicker.com/)

### 4.3 폰트 변경

**`app/layout.tsx` 편집:**

```typescript
import { Inter, Noto_Sans_KR } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  weight: ['400', '500', '700'],
})

// className에 추가
<html className={`${inter.variable} ${notoSansKR.variable}`}>
```

**Google Fonts**: https://fonts.google.com/

### 4.4 로고/파비콘 교체

```bash
# 파비콘 교체 (32x32 PNG)
public/favicon.ico

# Open Graph 이미지 (1200x630 PNG/JPG)
public/og-image.png

# Apple Touch Icon (180x180 PNG)
public/apple-touch-icon.png
```

**도구**: [Favicon Generator](https://realfavicongenerator.net/)

---

## 5. 첫 포스트 작성

### 5.1 포스트 파일 생성

```bash
# 연도별 폴더 생성
mkdir -p content/posts/2025

# MDX 파일 생성
touch content/posts/2025/my-first-post.mdx
```

### 5.2 Frontmatter 작성

**`content/posts/2025/my-first-post.mdx`:**

```markdown
---
title: "내 첫 블로그 포스트"
description: "Next.js 블로그 템플릿으로 작성한 첫 포스트입니다."
date: "2025-01-28"
tags: ["nextjs", "blog", "typescript"]
series: "블로그 시작하기"
seriesOrder: 1
coverImage: "/images/posts/2025/my-first-post.jpg"
draft: false
---

# 제목

여기에 내용을 작성하세요...

## 소제목

- 리스트 아이템 1
- 리스트 아이템 2

```typescript
console.log('Hello, World!')
```
```

### 5.3 이미지 추가 (선택)

```bash
# 이미지 폴더 생성
mkdir -p public/images/posts/2025

# 이미지 파일 복사
cp your-image.jpg public/images/posts/2025/
```

**MDX에서 이미지 사용:**

```markdown
![이미지 설명](/images/posts/2025/your-image.jpg)
```

### 5.4 샘플 포스트 제거 (선택)

템플릿에 포함된 샘플 포스트를 제거하려면:

```bash
rm -rf content/posts/2025/getting-started.mdx
rm -rf content/posts/2025/mdx-features.mdx
rm -rf content/posts/2025/typescript-tips.mdx
```

---

## 6. 선택적 기능 설정

### 6.1 Google Analytics 4 설정

1. **GA4 계정 생성**: https://analytics.google.com
2. **측정 ID 확인**: 관리 → 데이터 스트림 → 측정 ID (G-XXXXXXXXXX)
3. **`.env.production`에 추가**:
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
4. **GitHub Secrets에 추가** (권장):
   - 리포지토리 Settings → Secrets and variables → Actions
   - New repository secret: `GA_ID` = `G-XXXXXXXXXX`
5. **`.github/workflows/deploy.yml` 수정**:
   ```yaml
   - name: Create .env.production
     run: |
       echo "NEXT_PUBLIC_GA_ID=${{ secrets.GA_ID }}" >> .env.production
   ```

### 6.2 Giscus 댓글 시스템 설정

1. **Giscus 앱 설치**: https://github.com/apps/giscus
2. **리포지토리 선택**: 댓글을 저장할 리포지토리 (보통 블로그 리포지토리)
3. **Giscus 설정 페이지**: https://giscus.app/
   - Repository: `username/repo`
   - Discussions Category: "General" 또는 원하는 카테고리
   - 설정값 복사 (repo, repoId, category, categoryId)
4. **`.env.production`에 추가**:
   ```bash
   NEXT_PUBLIC_GISCUS_REPO=username/repo
   NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxx
   NEXT_PUBLIC_GISCUS_CATEGORY=General
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxx
   ```
5. **또는 GitHub Secrets 사용** (권장)

**Giscus 비활성화** (댓글 불필요 시):
- `components/Comments.tsx` 컴포넌트를 사용하지 않음
- `app/posts/[slug]/page.tsx`에서 `<Comments />` 제거

### 6.3 RSS 피드 커스터마이징

**`scripts/generate-rss.mjs` 편집:**

```javascript
const feed = new Feed({
  title: 'Your Blog Name',
  description: 'Your blog description',
  id: siteUrl,
  link: siteUrl,
  language: 'ko',
  image: `${siteUrl}/og-image.png`,
  favicon: `${siteUrl}/favicon.ico`,
  copyright: `All rights reserved ${new Date().getFullYear()}, Your Name`,
  author: {
    name: 'Your Name',
    email: 'your.email@example.com',
    link: 'https://github.com/yourusername',
  },
})
```

---

## 7. 배포하기

### 7.1 GitHub에 푸시

```bash
# 변경사항 스테이징
git add .

# 커밋
git commit -m "feat: 초기 설정 완료"

# 푸시
git push origin main
```

### 7.2 GitHub Pages 설정

1. **리포지토리 Settings** → **Pages** 이동
2. **Source**: "GitHub Actions" 선택
3. **Actions 탭**에서 배포 진행 상황 확인
   - 녹색 체크: 배포 성공 ✅
   - 빨간 X: 배포 실패 ❌ (로그 확인)
4. **배포 완료 후 URL 접속**:
   - User Page: `https://username.github.io`
   - Project Page: `https://username.github.io/blog`

### 7.3 배포 확인 체크리스트

- [ ] 홈페이지 로드 확인
- [ ] 포스트 목록 표시 확인
- [ ] 포스트 상세 페이지 접근 확인
- [ ] 검색 기능 작동 확인
- [ ] 다크모드 전환 확인
- [ ] 이미지 로드 확인
- [ ] RSS 피드 접근 (`/rss.xml`)
- [ ] Sitemap 접근 (`/sitemap.xml`)
- [ ] 모바일 반응형 확인

---

## 8. 트러블슈팅

### 8.1 빌드 에러: "Module not found"

**원인**: 의존성 설치 누락

**해결**:
```bash
npm install
npm run build
```

### 8.2 배포 후 404 에러 (모든 페이지)

**원인**: GitHub Pages Source 설정 오류

**해결**:
1. Settings → Pages
2. Source를 "GitHub Actions"로 변경
3. 재배포

### 8.3 이미지가 로드되지 않음

**원인 A**: basePath 설정 오류

**해결**:
- User Page: `basePath: ''`
- Project Page: `basePath: '/blog'`

**원인 B**: 이미지 경로 오류

**해결**:
```markdown
<!-- ✅ 올바른 경로 -->
![Image](/images/posts/2025/image.jpg)

<!-- ❌ 잘못된 경로 -->
![Image](images/posts/2025/image.jpg)
![Image](../public/images/posts/2025/image.jpg)
```

### 8.4 스타일이 적용되지 않음

**원인**: Tailwind CSS 빌드 오류

**해결**:
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

### 8.5 환경변수가 반영되지 않음

**원인**: `NEXT_PUBLIC_` 접두사 누락

**해결**:
- 클라이언트에서 사용할 환경변수는 반드시 `NEXT_PUBLIC_` 접두사 필요
- 서버 전용 환경변수는 접두사 불필요

```bash
# ✅ 클라이언트에서 접근 가능
NEXT_PUBLIC_SITE_URL=https://example.com

# ❌ 클라이언트에서 undefined
SITE_URL=https://example.com
```

### 8.6 GitHub Actions 배포 실패

**원인**: Node.js 버전 불일치

**해결**:
`.github/workflows/deploy.yml` 확인:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # 20.x 이상 필요
```

**원인**: npm ci 실패

**해결**:
```bash
# package-lock.json 재생성
rm package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update package-lock.json"
git push
```

### 8.7 검색이 작동하지 않음

**원인**: 포스트가 없거나 draft 상태

**해결**:
- `content/posts/`에 최소 1개의 포스트 존재 확인
- Frontmatter에서 `draft: false` 또는 `draft` 필드 제거

### 8.8 Giscus 댓글이 표시되지 않음

**원인 A**: Giscus 앱 미설치

**해결**: https://github.com/apps/giscus 에서 앱 설치

**원인 B**: 환경변수 설정 오류

**해결**:
- `.env.production`에 올바른 Giscus 설정 확인
- GitHub Discussions 활성화 확인 (Settings → General → Features → Discussions)

---

## 🚀 다음 단계

1. **커스텀 도메인 연결** (선택): [GitHub Pages Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
2. **SEO 최적화**: [Google Search Console](https://search.google.com/search-console) 등록
3. **성능 모니터링**: [PageSpeed Insights](https://pagespeed.web.dev/)로 성능 측정
4. **정기적인 포스트 작성**: 콘텐츠가 블로그의 핵심입니다!

---

## 📚 추가 문서

- **[README.md](./README.md)** - 프로젝트 개요
- **[CLAUDE.md](./CLAUDE.md)** - 개발 가이드라인 및 컨벤션
- **[TEST_README.md](./TEST_README.md)** - 테스트 문서

---

## 💬 도움이 필요하신가요?

- **Issues**: [GitHub Issues](https://github.com/joonangler/blog/issues)
- **Discussions**: [GitHub Discussions](https://github.com/joonangler/blog/discussions)

---

**Happy Blogging! 🎉**
