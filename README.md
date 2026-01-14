# Next.js Blog

## ✨ 주요 특징

### 📝 콘텐츠 관리
- **MDX 지원**: Markdown + React 컴포넌트
- **시리즈/태그 분류**: 자동 그룹핑 및 네비게이션
- **목차(TOC)**: 자동 생성 및 스티키 내비게이션
- **읽기 시간**: 자동 계산

### 🎨 사용자 경험
- **다크모드**: 시스템 설정 자동 연동 (next-themes)
- **검색**: 클라이언트 사이드 전체 검색 (가중치 스코어링)
- **반응형**: 모바일 퍼스트 디자인
- **댓글**: Giscus 통합

### 🔧 개발자 경험
- **TypeScript**: 100% 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 스타일링
- **ESLint + Prettier**: 코드 품질 자동화
- **Testing**: Vitest + Playwright E2E
- **CI/CD**: GitHub Actions 자동 배포

### 🚀 성능 & SEO
- **SSG**: 정적 사이트 생성 (빠른 로딩)
- **Shiki**: 서버사이드 구문 강조
- **SEO**: Metadata API, Sitemap, RSS/Atom/JSON Feed
- **Analytics**: Google Analytics 4 지원
- **Lighthouse**: 95+ 점수 목표

---

## 🎯 빠른 시작

### 1. 로컬 환경 설정

```bash
# 클론 (이미 했으면 스킵)
git clone https://github.com/username/your-repo.git
cd your-repo

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 개인 정보 입력

# 개발 서버 실행
npm run dev
```

개발 서버: http://localhost:3000

### 2. 사이트 정보 수정

**`.env.local` 및 `.env.production` 편집:**
```bash
NEXT_PUBLIC_SITE_URL=https://username.github.io
NEXT_PUBLIC_SITE_NAME=Your Blog Name
NEXT_PUBLIC_AUTHOR_NAME=Your Name
NEXT_PUBLIC_GITHUB_URL=https://github.com/username
# ... 기타 설정
```

**`next.config.ts` 수정 (basePath):**
```typescript
// User Page (username.github.io) - 변경 불필요
basePath: ''

// Project Page (username.github.io/blog)
basePath: process.env.NODE_ENV === 'production' ? '/blog' : ''
```

### 3. 첫 포스트 작성

```bash
# content/posts/your-post.mdx 생성
```

```markdown
---
title: "첫 포스트 제목"
description: "포스트 설명"
date: "2025-01-28"
tags: ["nextjs", "blog"]
---

# 제목

내용...
```

### 4. GitHub Pages 배포

```bash
# GitHub에 푸시
git add .
git commit -m "feat: 초기 설정 완료"
git push origin main
```

**GitHub 설정:**
```
1. 리포지토리 Settings → Pages
2. Source: "GitHub Actions" 선택
3. 배포 완료 대기 (Actions 탭에서 진행상황 확인)
4. 배포 URL 접속
```

---

## 📂 프로젝트 구조

```
blog/
├── app/                    # Next.js App Router
│   ├── posts/             # 포스트 목록/상세
│   ├── tags/              # 태그 페이지
│   ├── series/            # 시리즈 페이지
│   └── search/            # 검색 페이지
├── components/            # React 컴포넌트
│   ├── layout/           # 레이아웃 (Header, Footer)
│   ├── post/             # 포스트 관련
│   ├── mdx/              # MDX 커스텀 컴포넌트
│   └── ui/               # 재사용 UI 컴포넌트
├── lib/                   # 유틸리티 함수
│   ├── mdx.ts            # MDX 처리
│   ├── posts.ts          # 포스트 CRUD
│   ├── search.ts         # 검색 알고리즘
│   ├── tags.ts           # 태그 관리
│   └── series.ts         # 시리즈 관리
├── content/
│   └── posts/            # MDX 포스트 파일
└── public/               # 정적 파일
```

---

## 🛠️ 주요 명령어

### 개발
```bash
npm run dev           # 개발 서버 (http://localhost:3000)
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버 (빌드 후)
npm run lint          # ESLint 실행
npm run type-check    # TypeScript 타입 체크
npm run format        # Prettier 포맷팅
```

### 테스팅
```bash
npm run test          # Vitest (watch 모드)
npm run test:run      # Vitest (1회 실행)
npm run test:ui       # Vitest UI 모드
npm run test:coverage # 커버리지 리포트
npm run test:e2e      # Playwright E2E 테스트
npm run test:e2e:ui   # Playwright UI 모드
```

### 성능 분석
```bash
npm run analyze       # 번들 분석
npm run lighthouse    # Lighthouse CI 실행
```

---

## 📝 콘텐츠 작성

### Frontmatter 필드

```yaml
---
title: "포스트 제목"                    # 필수
description: "SEO용 설명 (150자 이내)"  # 필수
date: "2025-01-28"                      # 필수 (YYYY-MM-DD)
tags: ["nextjs", "typescript"]          # 필수 (배열)
series: "시리즈 이름"                   # 선택
seriesOrder: 1                          # 선택 (시리즈 순서)
coverImage: "/images/posts/cover.jpg"   # 선택
draft: false                            # 선택 (기본 false)
---
```

### 코드 블록

````markdown
```typescript title="example.ts" {3-5}
function example() {
  const highlighted = true  // 이 줄들이
  const alsoHighlighted = true  // 강조됩니다
  const andThisOne = true
  return highlighted
}
```
````

### Callout 컴포넌트

```markdown
<Callout type="info">
정보성 내용
</Callout>

<Callout type="warning">
경고 내용
</Callout>

<Callout type="error">
에러 내용
</Callout>
```

---

## 🔧 커스터마이징

### 1. 테마 색상 변경

`app/globals.css` 편집:
```css
:root {
  --primary: 220 90% 56%;
  --secondary: 280 60% 50%;
  /* ... 기타 색상 */
}
```

### 2. 폰트 변경

`app/layout.tsx` 편집:
```typescript
import { YourFont } from 'next/font/google'

const font = YourFont({ subsets: ['latin'] })
```

### 3. 댓글 시스템 설정

`.env.production`에 Giscus 정보 추가:
```bash
NEXT_PUBLIC_GISCUS_REPO=username/repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxx
```

[Giscus 설정 페이지](https://giscus.app/)에서 값을 얻을 수 있습니다.

### 4. Google Analytics 추가

`.env.production`:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
