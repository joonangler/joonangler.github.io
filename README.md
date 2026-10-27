# Joonangler.log

https://joonangler.github.io — Next.js 정적 export로 만들어 GitHub Pages에 배포하는 개인 블로그.

## 기능

- **MDX 글**: Markdown + React 컴포넌트(`Callout` 등), GFM, 수식(KaTeX)
- **코드 블록**: 서버사이드 구문 강조(rehype-pretty-code/Shiki), 복사 버튼
- **글 탐색**: 태그·시리즈 페이지, 시리즈 이전/다음 이동, 관련 글, 목차(TOC), 읽기 시간
- **검색**: 클라이언트 사이드 전체 검색(제목·태그·설명 가중치)
- **다크모드**: 시스템 설정 연동, 토글(next-themes)
- **SEO·피드**: Metadata API, JSON-LD, sitemap, RSS·Atom·JSON Feed

## 개발 명령

```bash
npm ci                    # 의존성 설치
npm run dev               # 개발 서버 (http://localhost:3000)
npm run lint              # ESLint
npm run type-check        # TypeScript 타입 체크
npm run test:run          # Vitest 단위 테스트 (1회 실행)
npm run build:production  # 정적 빌드(out/) + sitemap·RSS
```

E2E(`npm run test:e2e`, Playwright)는 로컬 전용이다. 개발 서버를 직접 띄워 테스트하며 CI에서는 돌리지 않는다.

## 글 쓰기

`content/posts/**/*.mdx`에 파일을 추가한다. 하위 폴더는 자유롭게 나눌 수 있고, 슬러그는 폴더와 무관하게 **파일명**이다.

```markdown
---
title: "글 제목"
description: "요약 (150자 이내)"
date: "YYYY-MM-DD"
tags: ["nextjs", "blog"]
---

본문...
```

- 필수: `title`, `description`(150자 이내), `date`(`"YYYY-MM-DD"` — 따옴표로 문자열), `tags`(배열)
- 선택: `series`, `seriesOrder`(숫자), `seriesSlug`(영문 소문자·숫자·하이픈, 같은 시리즈 글은 같은 값), `coverImage`, `draft`(기본 false)

## 초안 미리보기

1. 초안 정본은 볼트 `~/Documents/obsidian/jh.vault/projects/blog/drafts/`다. 저장소에는 심링크만 둔다(`/content/drafts`는 `.gitignore` — 심링크라 끝 슬래시를 붙이지 않는다).
   ```bash
   mkdir -p content && ln -s "$HOME/Documents/obsidian/jh.vault/projects/blog/drafts" content/drafts
   ```
2. 초안 파일은 `draft: true`를 달고, `npm run dev`에서만 보인다. 운영 빌드는 `content/drafts/`를 읽지 않고 `draft: true` 글은 주소·sitemap·RSS에서도 뺀다. `INCLUDE_DRAFTS=1`은 개발 모드 밖에서 초안을 강제로 포함하는 명시 플래그다 — CI·배포 환경에 두지 않는다.
3. `content/posts/`와 `content/drafts/`에 같은 파일명이 있으면 개발 서버가 오류를 낸다. 게시할 때는 파일을 **옮긴다**(사본 금지).
4. `seriesSlug`(선택, 영문 소문자·숫자·하이픈): 시리즈 주소 `/series/<seriesSlug>/`. 같은 시리즈 글은 같은 값을 쓴다. 없으면 시리즈 이름에서 만든다.

## 배포

1. main에서 브랜치를 만들어 PR을 연다. main 직접 푸시는 하지 않는다.
2. PR의 필수 체크 `test`(lint · type-check · 단위 테스트 · 프로덕션 빌드)가 초록이어야 병합한다.
3. main에 병합되면 GitHub Actions(`deploy.yml`)가 빌드해 GitHub Pages로 배포한다.

> 저장소 Settings → Pages의 Source는 반드시 **GitHub Actions**여야 한다. 브랜치 빌드로 바뀌면 Jekyll이 이 README를 홈으로 내보낸다.

병합 전 로컬 확인:

```bash
npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production
```

## 선택 기능 (현재 꺼짐)

Giscus 댓글과 Google Analytics 4는 코드에 들어 있지만 꺼져 있다. `.env.production`의 주석 처리된 `NEXT_PUBLIC_GISCUS_*`, `NEXT_PUBLIC_GA_ID` 줄을 풀고 값을 채우면 켜진다. 값이 없으면 댓글 영역과 GA 스크립트가 렌더링되지 않는다.

## 폴더 구조

```
app/          Next.js App Router (posts, tags, series, search)
components/   React 컴포넌트 (layout, post, mdx, search, ui)
lib/          글 로딩(mdx.ts), 검색, 태그·시리즈, SEO·JSON-LD
content/posts/  MDX 글 (글을 추가할 때 만든다)
scripts/      RSS·Atom·JSON Feed 생성
public/       정적 파일
__tests__/    단위 테스트와 픽스처
e2e/          Playwright 테스트
```
