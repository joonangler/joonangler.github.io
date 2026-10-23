# CLAUDE.md

Next.js 16 (App Router, 정적 export) + React 19 + TypeScript + Tailwind 4 + MDX(next-mdx-remote) 블로그. GitHub Pages 배포.

## 명령

- `npm run dev` — 개발 서버
- `npm run lint` · `npm run type-check`
- `npm run test:run` — vitest 단위 테스트 (`npm run test:e2e`는 Playwright, CI에서 돌리지 않음)
- `npm run build:production` — 정적 빌드(`out/`) + sitemap·RSS

## 글 작성 (`content/posts/**/*.mdx`)

슬러그는 하위 폴더와 무관하게 **파일명**이다. frontmatter:

- 필수: `title`, `description`(150자 이내), `date`(`"YYYY-MM-DD"` — 따옴표로 문자열), `tags`(배열)
- 선택: `series`, `seriesOrder`(숫자), `coverImage`, `draft`(기본 false)

## 테스트

단위 테스트는 실제 글이 아니라 `__tests__/fixtures/posts`를 읽는다 — vitest 설정이 `POSTS_DIR`을 그쪽으로 지정한다(`lib/mdx.ts`·`lib/toc.ts`가 이 변수를 우선, 없으면 `content/posts`). 실제 글을 추가·삭제해도 테스트가 깨지지 않아야 한다.

## 브랜치

GitHub Flow: main에서 브랜치 → PR → CI 초록 → 병합. main 직접 푸시 금지. main 푸시는 곧 배포다.

## 병합 게이트

병합 전 아래가 rc 0이어야 한다(CI `test` 잡이 같은 순서로 돈다):

```
npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production
```
