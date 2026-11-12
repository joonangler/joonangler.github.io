# 홈페이지 첫 묶음 — 공통 뼈대·홈·서비스·문의 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 설계 §14 순서의 첫째 — 색·서체·내비·바닥·점 무리 배경의 공통 뼈대, 홈, 서비스 목록과 서비스별 페이지의 틀, 문의를 만들고, 공개 전까지 `main`과 떨어진 모으는 브랜치에 쌓는다.

**Architecture:** 화면 문구와 내용은 한 곳에 모은다 — 홈 문장과 사이트 공통 문안은 `content/site.ts`, 서비스와 작업은 항목 하나가 MDX 파일 하나(`content/services/`, `content/work/`)이고 `lib/services.ts`·`lib/work.ts`가 글 로더처럼 읽는다. 점 무리는 계산(모양 좌표·시간표·점 배치)을 `lib/dots/`의 순수 함수로 떼고, 캔버스·rAF·관찰자만 클라이언트 컴포넌트 `components/dots/DotField.tsx` 하나가 쥔다. 블로그 화면의 짜임은 두고, 사이트 틀(내비·바닥·토큰·서체)만 바꾼다.

**Tech Stack:** Next.js 16 App Router 정적 export · React 19 · TypeScript · Tailwind 4 · gray-matter · next-mdx-remote · vitest(jsdom) · Playwright(로컬).

**Spec:** `docs/superpowers/specs/2026-11-13-homepage-design.md` (승인된 설계의 저장소용 추린 판). 절 표기 「설계 §5-2」는 이 문서의 절이다. 시안의 값은 이 계획의 부록 A~C에 옮겼다.

---

## 0. 전체를 어떻게 나누나 (제안)

**계획 4개, 브리프 6개.** 계획은 설계 §14의 묶음마다 하나다. 첫 묶음은 작업이 16개라 브리프 셋으로 나눈다.

| 묶음 | 계획 | 브리프 | 의존 |
|---|---|---|---|
| 1 공통 뼈대·홈·서비스·문의 | 이 문서 | **1a** Task 1~6 (브랜치·CI, 글 주소 기준본, 토큰·어두운 화면, 서체, 내비·바닥, 블로그 묶음 경로) | — |
| | | **1b** Task 7~10 (내용 자료, 점 무리 계산, DotField, 홈 첫 화면) | 1a |
| | | **1c** Task 11~16 (홈 아래 구역, 서비스 목록·서비스별, 문의, 이름·아이콘, 검증) | 1b |
| 2 작업 목록과 사례 페이지 | 다음 계획 | 1개 | 1의 `lib/work.ts`(Task 7), `WorkCard`(Task 11), `PageBand`(Task 12), 내비 준비 표시(Task 5). 「이 홈페이지」 사례 캡처는 1·2를 합친 모으는 브랜치 빌드에서 뜬다 |
| 3 소개 | 다음 계획 | 1개 | 1의 `lib/channels.ts`(Task 5), `PageBand`(Task 12). 소개 문안이 확정돼 있어야 한다 |
| 4 블로그 구역 맞춤 | 다음 계획 | 1개 | 1의 토큰(Task 3)·서체(Task 4)·블로그 묶음 경로와 구역 머리(Task 6). 2·3과는 독립 |

- 1b의 Task 7(내용 자료)은 1b의 나머지와 독립이라 1c 앞쪽으로 옮겨도 된다. 1b와 1c가 함께 고치는 파일은 `app/page.tsx` 하나다(1b는 첫 화면만, 1c가 아래 구역을 더한다).
- 2·3·4는 1이 모으는 브랜치에 합쳐진 뒤 서로 독립으로 돌 수 있다.
- **공개**는 모으는 브랜치를 `main`으로 합치는 PR 하나다. 설계 §14는 넷이 다 되지 않아도 된다고 하지만, **공개의 최소는 1과 4다**(확정, 2026-11-13) — 1이 서체와 색과 헤더를 사이트 전체에서 바꾸므로, 4 없이 공개하면 블로그 화면이 옛 색 변수(파란 강조색)를 새 검정 위에 그린 채 나간다.

### 범위 조정 (확정, 허브 2026-11-13)

설계 §14는 처음에 「어두운 화면 정리」와 「둘째 줄 내비」를 넷째 묶음에 두었다. 아래 둘을 첫 묶음으로 당기기로 **확정했다**(허브, 2026-11-13. 공개 결과는 바꾸지 않고 묶음 사이의 순서만 바꾼다). 추린 판 §14도 같은 내용으로 고쳤다. 당기지 않으면 첫 묶음이 서지 않거나, 첫 묶음만으로 블로그 구역을 쓸 수 없게 되기 때문이다.

1. **어두운 화면 고정의 장치(Task 3)를 첫 묶음으로.** 새 내비에는 단추가 없어서(설계 §4) 테마 전환 단추가 첫 묶음에서 사라진다. 그때 `next-themes`가 남아 있으면 밝은 화면을 쓰는 기기는 밝은 블로그를 보고, 새 사이트 화면은 검정이라 둘이 갈린다. 그래서 `<html class="dark">` 고정과 `next-themes` 걷어내기는 첫 묶음에서 한다. 넷째 묶음에는 블로그 색 변수 값, 코드 색, 수식, 댓글 색, 영어 문구가 남는다.
2. **블로그 구역 머리(Task 6)를 첫 묶음으로.** 첫 묶음이 지금 헤더(글·태그·시리즈·검색)를 사이트 내비로 바꾸면, 블로그 안에서 태그·시리즈·검색으로 가는 길이 사라진다. 떠 있는 내비 밑에 블로그 화면이 깔리지 않게 하는 여백도 같은 자리(블로그 묶음 경로의 layout)에 둬야 한다. 그래서 경로 묶음과 「Joonangler.log」·둘째 줄을 첫 묶음에서 한다.

경로 묶음은 주소를 바꾸지 않아야 하고, Task 6 Step 4의 `npm run check:routes`(Task 2의 글 주소 기준본 대조)가 그것을 잡는다.

---

## 1. 맡긴 것의 선택 (설계 §16)

| 맡긴 것 | 고른 것 | 까닭 |
|---|---|---|
| 컴포넌트 나눔·파일·폴더 | 사이트 공통은 `components/site/`, 점 무리는 `components/dots/`, 홈은 `components/home/`, 서비스는 `components/services/`, 문의는 `components/contact/`, 블로그 구역 머리는 `components/blog/`. 계산은 `lib/dots/` | 이 저장소는 이미 화면 구역별(`layout`, `post`, `series`…)로 나눈다. 계산을 `lib/`로 떼면 캔버스 없는 jsdom에서 시험할 수 있다 |
| 서비스·작업 자료의 형식과 읽는 법 | `content/services/<slug>.mdx`, `content/work/<slug>.mdx`. frontmatter에 구조 값, 본문 MDX는 서비스의 「이런 일을 합니다」와 작업 사례의 글. `SERVICES_DIR`·`WORK_DIR` 환경값이 있으면 그쪽을 읽는다(vitest가 fixtures를 가리킨다) | 글과 같은 형식이라 `gray-matter`와 MDX 렌더러를 다시 쓴다. 테스트가 실제 내용을 읽지 않는 규칙(`POSTS_DIR`)을 그대로 따른다 |
| 서체를 싣는 방법 | Pretendard **1.3.9**의 가변 조각 판 92조각(2,957,724B)과 그 CSS를 `public/fonts/pretendard/`에 그대로 싣고, 루트 layout에서 `<link rel="stylesheet">`로 부른다. 라이선스 파일 동봉 | npm 패키지 `pretendard`는 풀면 97,653,151B(파일 1,826개)라 쓰는 3MB를 위해 CI 설치가 무거워진다. CSS의 `url(./woff2-dynamic-subset/…)` 상대 경로가 그대로 통해 고칠 것이 없다. 남의 서버에 기대지 않는다(설계 §12-2) |
| 어두운 화면만 남기는 방법 | `next-themes`를 **걷어낸다.** `<html lang="ko" class="dark">`를 정적으로 달고 `color-scheme: dark`. `ThemeProvider`·`ThemeToggle`·의존성을 지우고 댓글 테마는 `dark` 고정 | 고정할 바에는 런타임 라이브러리가 필요 없다. 정적 클래스는 자바스크립트가 꺼져도 맞다. 블로그의 `dark:` 변형(`&:is(.dark *)`)이 그대로 산다 |
| 캔버스 코드를 옮기는 구조 | 모양 좌표(`lib/dots/shapes.ts`), 시간표(`lib/dots/motion.ts`), 점 배치와 섞기(`lib/dots/field.ts`)는 순수 함수, 난수는 주입. `DotField` 컴포넌트 하나가 `mode: 'shapes' \| 'plain'`으로 홈·서비스별·낮은 띠를 모두 그린다. 프레임 상태는 ref에 두고 React state에 두지 않는다 | 시안 스크립트를 state로 옮기면 프레임마다 다시 그린다. 계산을 떼야 시간표와 「지금 자리에서 출발」을 단위 시험으로 잡을 수 있다 |
| 모양 좌표 다듬기 | 첫 묶음은 부록 A를 **그대로 옮긴다.** 다듬기는 실기기 확인(§실기기) 뒤 | 좌표는 승인된 시안의 값이다. 다듬을 근거가 실기기에서 나온다 |
| 공개 전까지 `main`과 떼어 두기 | 모으는 브랜치 **`release/homepage`**. 묶음 PR은 그 브랜치로 연다. `main`에 올라간 글은 `main → release/homepage` PR로 가져온다. 공개는 `release/homepage → main` PR 하나(병합 커밋으로, 되돌릴 때 `git revert -m 1`) | 빌드 때 켜고 끄는 값은 서체·색·헤더처럼 사이트 전체에 걸린 것까지 두 벌을 둬야 해서 비싸다 |
| 그 브랜치의 CI | `test.yml`의 `pull_request.branches`에 `release/homepage`를 더한다(Task 1). 공개 PR로 `main`에 들어가도 해가 없는 변경이다 | `pull_request` 이벤트는 병합 결과의 워크플로 파일을 쓰므로, 이 변경을 담은 첫 PR부터 게이트가 돈다 |
| 올림 효과의 기기 조건 | Tailwind 변형 **`hover-fine:`** 을 새로 둔다: `@media (hover: hover) and (pointer: fine) { &:hover }`. 새 컴포넌트는 `hover-fine:`만 쓴다. 지금의 `hover:` 재정의는 손대지 않는다 | `hover:`를 고치면 블로그 컴포넌트 전체의 동작이 바뀐다(설계 §8: 짜임은 그대로) |
| 사이트 이름과 블로그 이름 | `NEXT_PUBLIC_SITE_NAME=Joonangler`, 새 값 **`NEXT_PUBLIC_BLOG_NAME=Joonangler.log`**. `SITE_CONFIG.blogName`이 읽고, RSS 스크립트와 Blog 스키마와 블로그 구역 머리가 쓴다 | RSS 스크립트는 `lib/constants.ts`를 읽지 않고 환경값을 직접 읽는다. 두 쪽이 같은 값을 보려면 환경값이어야 한다 |
| 탭 사이 전환 | **첫 묶음에는 넣지 않는다.** 넷째 묶음 뒤에 `modern-web-guidance`로 지금의 권장 방식을 확인하고 정한다 | 없어도 되는 것이고(설계 §12-4), 첫 묶음의 화면이 다 서기 전에는 전환의 득실을 볼 수 없다 |
| 페이지 메타데이터·JSON-LD·404 | 새 페이지마다 `getPageMetadata({ title, description, path })`. JSON-LD는 지금의 WebSite(루트)와 Blog를 두고 서비스 스키마는 넣지 않는다. 404는 사이트 틀의 한국어 화면 | 서비스 스키마는 가격이 확정된 뒤에야 맞는 값을 실을 수 있다 |
| 아이콘과 OG 이미지 | `app/icon.tsx`는 검정 바탕 흰 「J」, `app/opengraph-image.tsx`는 검정 바탕 흰 「Joonangler」. `ImageResponse` 기본 글꼴 | 로고가 없다(설계 §16). 라틴 글자만이라 서체 파일을 싣지 않아도 된다 |
| 테스트 범위 | 계산·자료 로더·컴포넌트 상태는 vitest(게이트에 든다). 자바스크립트 끔·모션 줄이기·기기 조건·화면 폭은 Playwright e2e(로컬, `--project=chromium`). 지금의 `e2e/homepage.spec.ts`·`e2e/darkmode.spec.ts`는 새 화면에 맞게 고친다 | CI는 e2e를 돌리지 않는다(저장소 `CLAUDE.md`). 화면 조건은 실제 브라우저에서만 잴 수 있다 |
| 묶음을 브리프 몇 개로 | §0의 표 | — |

---

## Global Constraints

- 게이트(저장소 `CLAUDE.md`)는 **Node 24**로 돈다: `npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production`. 로컬 기본이 다른 판이면 Node 24를 PATH 앞에 둔다.
- 브랜치: 묶음 작업은 `release/homepage`에서 딴 `feat/homepage-1a-…` 같은 브랜치 → `release/homepage`로 PR → CI `test` 초록. **`main`으로 PR을 열지 않는다. `main` 직접 푸시 금지.** 병합·배포·Actions 수동 dispatch는 하지 않는다. `deploy.yml`은 `workflow_dispatch`가 있어 **`release/homepage`에서 수동 실행하면 그 브랜치가 공개된다** — 그 브랜치에서 dispatch하지 않는다.
- 지금 저장소의 사실(2026-11-13 확인): 경로 `/`, `/posts/`, `/posts/<slug>/`, `/series/`, `/series/<series>/`, `/tags/`, `/tags/<tag>/`, `/search/`, `trailingSlash: true` · 헤더 `components/layout/Header.tsx`(Home·Posts·Tags·Series·Search, `ThemeToggle`) · `app/providers.tsx`의 `next-themes`(`attribute="class" defaultTheme="system" enableSystem`) · `app/globals.css`의 `@custom-variant dark (&:is(.dark *))`와 `@custom-variant hover (&:hover)` · `HEADER_HEIGHT = 80`(`lib/constants.ts`, `TableOfContents`와 `use-scroll-spy`가 쓴다) · `app/layout.tsx`의 `next/font/google` Inter(선언만, 쓰이지 않음) · `body`의 `font-family: var(--font-geist-sans)`(정의 없는 변수) · `.env.production`은 커밋되고 `NEXT_PUBLIC_SITE_NAME=Joonangler.log`, `NEXT_PUBLIC_AUTHOR_EMAIL`은 없다 · `scripts/generate-rss.mjs`는 `content/posts`를 고정으로 읽는다 · 사이트맵은 `next-sitemap`, `lastmod`는 빌드 시각 · 게시된 글 0편(`content/`에는 gitignore된 `drafts` 심링크뿐) · 글이 0편일 때 동적 경로는 `__placeholder__` 하나를 내보낸다 · 테스트에 jest-dom 타입이 없어 `toHaveAttribute` 대신 `getAttribute`를 쓴다.
- 색 토큰(설계 §12-1): `--bg #000`, `--ink #fff`, `--ink-2 rgb(255 255 255 / 0.64)`, `--ink-3 rgb(255 255 255 / 0.5)`, `--line rgb(255 255 255 / 0.12)`, `--surface rgb(255 255 255 / 0.06)`, `--ring-shadow 0 0 0 1px rgb(255 255 255 / 0.09)`, `--ring-shadow-hover 0 0 0 1px rgb(255 255 255 / 0.2)`, `--img-outline rgb(255 255 255 / 0.1)`. 강조색 없음.
- 곡선: `--ease-out cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out cubic-bezier(0.77, 0, 0.175, 1)`. 쪽 여백 `--pad clamp(20px, 5vw, 64px)`, 본문 폭 `--max 1320px`.
- 움직이는 속성은 `transform`, `opacity`, `clip-path`만. `transition: all` 금지. 숨김 상태는 `html.js` 아래에서만 건다. 올림 효과는 `hover-fine:`(또는 같은 미디어 조건)에서만.
- 탭 이름은 한글: 서비스 · 작업 · 블로그 · 소개 · 문의. 주소: `/services/`, `/work/`, `/posts/`, `/about/`, `/contact/`. 첫 묶음에서 준비된 탭은 서비스·블로그·문의다(작업은 묶음 2, 소개는 묶음 3에서 켠다).
- 화면 문구에 아직 하지 않는 일을 하는 것처럼 적지 않는다. 납품 실적처럼 읽히는 문장을 쓰지 않는다. 결제 기능과 결제 수단 안내는 두지 않는다. 실명·사진 없음.
- 확정 전 문안과 서비스 내용에는 `provisional: true`를 단다(MDX frontmatter와 `content/site.ts`의 문안 객체 모두). 공개 전 확인은 `grep -rn "provisional: true" content/`가 아무것도 내지 않는 것이다.
- 메일 주소는 `.env.production`의 `NEXT_PUBLIC_AUTHOR_EMAIL`에만 둔다. 계획·브리프·테스트에는 적지 않는다(테스트는 `someone@example.com`).
- `NEXT_PUBLIC_*`는 클라이언트 코드에서 `process.env.NEXT_PUBLIC_X`로 **직접** 써야 빌드에 박힌다. 환경 객체를 넘기는 함수로 감싸지 않는다.
- 의존성은 `next-themes`를 빼는 것 말고 더하지 않는다. 모션 라이브러리 금지.
- 커밋 `<type>(<scope>): <subject>`, 도구 푸터 없음.

## Review Focus

1. **자바스크립트를 끈 좁은 화면** — 「메뉴」 단추가 아무 일도 하지 않으므로, 탭이 접힌 채면 사이트를 돌아다닐 수 없다. 탭은 `html.js`일 때만 접힌다. → Task 5의 e2e 「no-js 390px에서 탭이 다 보인다」.
2. **보는 도중 「모션 줄이기」를 켬** — 다음 프레임부터 멈추고 **지금 모양**(옮겨 가는 중이면 가던 모양, 흩어진 때는 첫 모양)이 모인 정지 화면 한 장으로 바뀐다. 첫 모양으로 돌아가지 않는다(그림이 한 번 더 바뀌지 않게, 허브 2026-11-13). 처음부터 켜진 기기는 첫 모양이 모인 한 장이다. → Task 9 「reduced motion turned on mid-session」, Task 8 `stillShape`.
3. **클립보드를 쓸 수 없는 브라우저**(`navigator.clipboard` 없음, 또는 `writeText`가 거절) — 복사 단추가 조용히 실패하면 안 된다. 주소 글자를 선택하고 「주소를 선택했습니다. 복사해 주세요」를 알린다. → Task 14 두 시험.
4. **옮겨 가는 중에 화면 회전·창 크기 변경** — 폭이 바뀌면 점을 새로 깔되, 높이만 바뀌면(휴대폰 주소창) 점은 그대로 두고 목표 자리만 다시 잰다. 어느 쪽이든 지금 그려진 자리에서 출발해 튀지 않는다. → Task 8 `resizeAction`·`restartFrom` 시험.
5. **서비스 자료의 잘못된 값** — 가격이 숫자가 아니거나, `related`에 없는 작업 이름이 있으면 빌드가 파일 이름과 함께 멈춘다. 조용히 빈 카드가 나가지 않는다. → Task 7 「rejects」 시험 셋.

---

### Task 1: 모으는 브랜치와 그 CI

**Files:**
- Modify: `.github/workflows/test.yml` (`on.pull_request.branches`)

**Interfaces:**
- Produces: 원격 브랜치 `release/homepage`. 이 계획의 모든 PR이 이리로 간다.

- [ ] **Step 0: 모으는 브랜치를 만든다** — 1a 현장이 최신 `main`에서 따서 푸시한다: `git fetch origin && git push origin origin/main:refs/heads/release/homepage`(확정, 허브 2026-11-13).
- [ ] **Step 1: 실패를 본다** — 아무 변경 없는 시험 PR을 `release/homepage`로 열면 `test` 검사가 나타나지 않는다. `gh pr checks <n>` → `no checks reported`. 시험 PR은 닫는다.
- [ ] **Step 2: `pull_request.branches`를 `[main, release/homepage]`로 바꾼다.** `push.branches`는 `[main]` 그대로(모으는 브랜치 푸시마다 두 번 돌 까닭이 없다).
- [ ] **Step 3: 통과를 본다** — 이 변경의 PR(`feat/homepage-1a-ci` → `release/homepage`)에서 `gh pr checks <n> --watch` → `test pass`.
- [ ] **Step 4: Commit** — `ci(test): release/homepage로 가는 PR에도 게이트를 돌린다`

### Task 2: 글 주소 기준본

설계 §15 「글 주소가 그대로인지」를 첫 변경 전에 고정한다. 실제 글은 0편이라 fixtures 글로 빌드한다(실측 2026-11-13: fixtures로 `build:production` rc 0, 글 7·시리즈 2·태그 4 경로가 생긴다).

**Files:**
- Create: `scripts/route-snapshot.mjs`, `__tests__/scripts/route-snapshot.test.ts`, `__tests__/fixtures/blog-routes.txt`
- Modify: `scripts/generate-rss.mjs:116` (글 폴더), `package.json` (`check:routes`)

**Interfaces:**
- Produces: `export function collectBlogRoutes({ htmlFiles, sitemapXml, feedXml }: { htmlFiles: string[]; sitemapXml: string; feedXml: string }): string[]` — 줄마다 `html /posts/a/`, `sitemap /posts/a/`, `rss /posts/a/` 꼴, 정렬·중복 제거. 블로그 접두어 `/posts/`, `/series/`, `/tags/`, `/search/`만 남긴다. 사이트맵은 `<loc>`만 읽는다(`lastmod`는 빌드 시각이라 버린다). 사이트 주소(`NEXT_PUBLIC_SITE_URL`)는 떼고 경로만.
- Produces: CLI `node scripts/route-snapshot.mjs <outDir>` — 위 줄을 표준 출력에.
- Produces: `npm run check:routes` = `POSTS_DIR=__tests__/fixtures/posts npm run build:production && node scripts/route-snapshot.mjs out | diff __tests__/fixtures/blog-routes.txt -`

- [ ] **Step 1: 실패하는 테스트**

```ts
import { describe, expect, it } from 'vitest'
import { collectBlogRoutes } from '../../scripts/route-snapshot.mjs'

const base = { htmlFiles: [], sitemapXml: '<urlset></urlset>', feedXml: '<rss><channel></channel></rss>' }

describe('collectBlogRoutes', () => {
  it('keeps blog html routes only', () => {
    const r = collectBlogRoutes({ ...base, htmlFiles: ['out/index.html', 'out/posts/a/index.html', 'out/services/index.html', 'out/tags/x/index.html'] })
    expect(r).toEqual(['html /posts/a/', 'html /tags/x/'])
  })
  it('reads sitemap loc and drops lastmod and origin', () => {
    const xml = '<urlset><url><loc>https://joonangler.github.io/posts/a/</loc><lastmod>2026-11-13T00:00:00Z</lastmod></url><url><loc>https://joonangler.github.io/</loc></url></urlset>'
    expect(collectBlogRoutes({ ...base, sitemapXml: xml })).toEqual(['sitemap /posts/a/'])
  })
  it('reads rss item links', () => {
    const xml = '<rss><channel><item><link>https://joonangler.github.io/posts/b/</link></item></channel></rss>'
    expect(collectBlogRoutes({ ...base, feedXml: xml })).toEqual(['rss /posts/b/'])
  })
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/scripts/route-snapshot.test.ts` → 모듈을 찾지 못해 FAIL.
- [ ] **Step 3: `scripts/route-snapshot.mjs`를 쓴다.** 순수 함수를 내보내고, `import.meta.url`이 실행 파일일 때만 CLI로 돈다(`out/**/index.html`을 걷고 `out/sitemap.xml`·`out/rss.xml`을 읽는다). XML은 정규식으로 `<loc>`·`<link>`만 뽑는다(의존성을 더하지 않는다).
- [ ] **Step 4: 통과 확인** — 같은 명령 → PASS 3.
- [ ] **Step 5: RSS가 `POSTS_DIR`을 따르게** — `generate-rss.mjs:116`의 글 폴더를 `process.env.POSTS_DIR ? path.resolve(process.env.POSTS_DIR) : path.join(__dirname, '..', 'content', 'posts')`로. 실패를 먼저 본다: 바꾸기 전 fixtures 빌드 뒤 `grep -c '<item>' out/rss.xml` → `0`. 바꾼 뒤 → `0`보다 크다.
- [ ] **Step 6: 기준본을 만든다** — `POSTS_DIR=__tests__/fixtures/posts npm run build:production && node scripts/route-snapshot.mjs out > __tests__/fixtures/blog-routes.txt`. 파일에 `html /posts/test-post/`, `sitemap /series/sample-series/`, `rss /posts/test-post/` 같은 줄이 있는지 `grep -c` 셋으로 본다.
- [ ] **Step 7: `check:routes`를 `package.json`에 더하고 돌린다** → `diff` 출력 없음, rc 0. 그다음 일부러 기준본의 한 줄을 지우고 돌려 rc 1과 diff 한 줄을 본 뒤 되돌린다(공허 통과가 아님을 보인다).
- [ ] **Step 8: Commit** — `test(routes): 블로그 경로·사이트맵·RSS 기준본과 check:routes`

### Task 3: 토큰과 어두운 화면 고정, `js` 표시, `hover-fine`

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`, `components/Comments.tsx`, `components/layout/Header.tsx`(`ThemeToggle` 사용 제거만 — 헤더 자체는 Task 5에서 바뀐다), `package.json`·`package-lock.json`(`next-themes` 제거)
- Delete: `app/providers.tsx`, `components/ui/ThemeToggle.tsx`
- Rewrite: `e2e/darkmode.spec.ts`
- Create: `e2e/conditions.spec.ts`

**Interfaces:**
- Produces: `:root`의 색·곡선·여백 토큰(Global Constraints의 값). `<html lang="ko" class="dark" suppressHydrationWarning>` — `suppressHydrationWarning`은 남긴다(아래 `js` 스크립트가 하이드레이션 전에 클래스를 더한다).
- Produces: `<head>`의 인라인 스크립트 `document.documentElement.classList.add('js')` — 숨김 상태를 거는 모든 CSS는 `.js` 아래에 둔다.
- Produces: Tailwind 변형 `hover-fine` —

```css
@custom-variant hover-fine {
  @media (hover: hover) and (pointer: fine) {
    &:hover { @slot; }
  }
}
```

- [ ] **Step 1: 실패하는 e2e**

```ts
// e2e/darkmode.spec.ts
import { test, expect } from '@playwright/test'
test.describe('dark only', () => {
  test.use({ colorScheme: 'light' })
  test('html is dark even when the device prefers light', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('html').getAttribute('class')).toContain('dark')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('dark')
  })
  test('there is no theme toggle', async ({ page }) => {
    await page.goto('/posts/')
    await expect(page.locator('button[aria-label*="theme" i]')).toHaveCount(0)
  })
})
// e2e/conditions.spec.ts
test('html gets the js class when scripts run', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('html').getAttribute('class')).toContain('js')
})
test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false })
  test('html has no js class', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('html').getAttribute('class') ?? '').not.toContain('js')
  })
})
```

- [ ] **Step 2: 실패 확인** — `npx playwright install chromium`(처음 한 번), `npx playwright test e2e/darkmode.spec.ts e2e/conditions.spec.ts --project=chromium` → 밝은 기기에서 `dark` 없음, 토글 있음, `js` 없음으로 FAIL.
- [ ] **Step 3: 구현** — 토큰, `color-scheme: dark`, 정적 `dark` 클래스, `js` 스크립트, `hover-fine` 변형. `Providers`를 걷어내고 `npm uninstall next-themes`. `Comments.tsx`는 `useTheme` 대신 `theme="dark"`. 블로그의 색 변수(`--background` 계열) 값은 넷째 묶음 몫이라 건드리지 않는다.
- [ ] **Step 4: 통과 확인** — 같은 명령 → PASS. `npm run test:run`·`npm run type-check` rc 0. `grep -rn "next-themes" app components package.json` → 없음.
- [ ] **Step 5: 변형이 빌드에 실리는지** — `npm run build:production` 뒤 `grep -l "pointer:fine" out/_next/static/css/*.css` — 아직 쓰는 곳이 없으면 Tailwind가 내지 않으므로, 이 확인은 Task 11에서 다시 한다(여기서는 빌드 rc 0만).
- [ ] **Step 6: Commit** — `feat(theme): 어두운 화면 고정, next-themes 제거, js 표시와 hover-fine 변형`

### Task 4: 서체 — Pretendard 조각 판을 저장소에

**Files:**
- Create: `public/fonts/pretendard/pretendardvariable-dynamic-subset.css`, `public/fonts/pretendard/woff2-dynamic-subset/PretendardVariable.subset.{0..91}.woff2`, `public/fonts/pretendard/LICENSE.txt`, `__tests__/lib/fonts.test.ts`
- Modify: `app/layout.tsx`(Inter 제거, `<link>` 추가), `app/globals.css`(`--font-sans`, `body`의 `font-family`)

**Interfaces:**
- Produces: `--font-sans: 'Pretendard Variable', Pretendard, system-ui, -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;` 그리고 `body { font-family: var(--font-sans); word-break: keep-all; -webkit-font-smoothing: antialiased; }`.

- [ ] **Step 1: 실패하는 테스트**

```ts
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const dir = path.join(process.cwd(), 'public/fonts/pretendard')
describe('vendored Pretendard', () => {
  it('ships the dynamic subset css with every file it points to', () => {
    const css = fs.readFileSync(path.join(dir, 'pretendardvariable-dynamic-subset.css'), 'utf8')
    const urls = [...css.matchAll(/url\(\.\/([^)]+)\)/g)].map((m) => m[1])
    expect(urls).toHaveLength(92)
    for (const u of urls) expect(fs.existsSync(path.join(dir, u))).toBe(true)
    expect(css).toContain("font-family: 'Pretendard Variable'")
  })
  it('is linked from the root layout and Inter is gone', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8')
    expect(src).toContain('/fonts/pretendard/pretendardvariable-dynamic-subset.css')
    expect(src).not.toContain('next/font/google')
  })
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/fonts.test.ts` → 파일 없음으로 FAIL.
- [ ] **Step 3: 싣는다** — 저장소 밖 임시 폴더에서 `npm pack pretendard@1.3.9`를 풀고 `package/dist/web/variable/pretendardvariable-dynamic-subset.css`와 `package/dist/web/variable/woff2-dynamic-subset/`를 `public/fonts/pretendard/`로, 라이선스 파일을 `LICENSE.txt`로 복사한다. CSS는 고치지 않는다. layout에 `<link rel="stylesheet" href="/fonts/pretendard/pretendardvariable-dynamic-subset.css" />`.
- [ ] **Step 4: 통과 확인** — 같은 명령 → PASS 2. `du -sk public/fonts/pretendard` → 약 2,950KB.
- [ ] **Step 5: 빌드 확인** — `npm run build:production` 뒤 `grep -c "pretendardvariable-dynamic-subset.css" out/index.html` → `1`, `grep -c "__Inter\|fonts.gstatic" out/index.html` → `0`.
- [ ] **Step 6: Commit** — `feat(font): Pretendard 가변 조각 판을 저장소에 싣고 Inter를 지운다`

### Task 5: 사이트 내비·바닥·채널

**Files:**
- Create: `lib/site.ts`, `lib/channels.ts`, `components/site/SiteNav.tsx`, `components/site/SiteFooter.tsx`, `__tests__/lib/site.test.ts`, `__tests__/lib/channels.test.ts`, `__tests__/components/SiteNav.test.tsx`, `e2e/no-js.spec.ts`
- Modify: `app/layout.tsx`(헤더·바닥 교체, 건너뛰기 링크 「본문으로 건너뛰기」), `lib/constants.ts`(`HEADER_HEIGHT = 88`)
- Delete: `components/layout/Header.tsx`, `components/layout/Footer.tsx`

**Interfaces:**
- Produces (`lib/site.ts`):
  - `type NavId = 'services' | 'work' | 'blog' | 'about' | 'contact'`
  - `interface NavItem { id: NavId; label: string; href: string; ready: boolean }`
  - `const NAV_ITEMS: readonly NavItem[]` — 차례 서비스 `/services/` · 작업 `/work/` · 블로그 `/posts/` · 소개 `/about/` · 문의 `/contact/`. 첫 묶음의 `ready`: services·blog·contact `true`, work·about `false`.
  - `function getNavItems(): NavItem[]` — `ready`만.
  - `function isNavReady(id: NavId): boolean`
  - `function getActiveNavId(pathname: string): NavId | null` — 블로그는 `/posts`, `/series`, `/tags`, `/search`로 시작하는 경로 전부. 접두어는 경로 조각 단위로 본다(`/services-old/`는 아님).
- Produces (`lib/channels.ts`): `interface Channel { id: 'github' | 'threads' | 'youtube' | 'instagram'; name: string; href: string }`, `function getChannels(): Channel[]` — GitHub(`process.env.NEXT_PUBLIC_GITHUB_URL`), 스레드(`process.env.NEXT_PUBLIC_THREADS_URL`). 값이 없는 채널은 뺀다. 스레드 주소는 쓸 계정이 정해질 때까지 비워 두므로, 첫 묶음에서 보이는 채널은 GitHub 하나다(`.env.production`에 스레드 줄을 넣지 않는다). 유튜브·인스타는 값이 생기면 한 줄씩 더한다.
- Produces: `HEADER_HEIGHT = 88` (떠 있는 내비 위 16 + 높이 52 + 여유 20).

화면 값은 부록 C의 「내비」·「바닥」이다. 860px 아래에서 「메뉴」 단추(`aria-expanded`, `aria-controls`)로 펼치고, 펼친 탭은 높이 48px. **탭을 접는 CSS는 `html.js` 아래에서만** 건다. 탭을 누르면 닫힌다.

- [ ] **Step 1: 실패하는 테스트**

```ts
// __tests__/lib/site.test.ts
import { getActiveNavId, getNavItems } from '@/lib/site'
it('lists ready tabs in order', () => {
  expect(getNavItems().map((i) => i.label)).toEqual(['서비스', '블로그', '문의'])
})
it.each([
  ['/posts/', 'blog'], ['/posts/hello/', 'blog'], ['/tags/x/', 'blog'], ['/series/s/', 'blog'], ['/search/', 'blog'],
  ['/services/', 'services'], ['/services/web-app-fix/', 'services'], ['/contact/', 'contact'],
  ['/', null], ['/services-old/', null],
])('active tab of %s is %s', (p, id) => expect(getActiveNavId(p)).toBe(id))

// __tests__/lib/channels.test.ts
it('drops channels without a url', () => {
  vi.stubEnv('NEXT_PUBLIC_GITHUB_URL', 'https://github.com/joonangler')
  vi.stubEnv('NEXT_PUBLIC_THREADS_URL', '')
  expect(getChannels().map((c) => c.name)).toEqual(['GitHub'])
})

// __tests__/components/SiteNav.test.tsx
vi.mock('next/navigation', () => ({ usePathname: () => '/posts/hello/' }))
it('marks the blog tab current on a post', () => {
  render(<SiteNav />)
  expect(screen.getByRole('link', { name: '블로그' }).getAttribute('aria-current')).toBe('page')
  expect(screen.getByRole('link', { name: '서비스' }).getAttribute('aria-current')).toBeNull()
  expect(screen.getByRole('link', { name: 'Joonangler' }).getAttribute('href')).toBe('/')
})
it('toggles the menu', async () => {
  render(<SiteNav />)
  const btn = screen.getByRole('button', { name: '메뉴' })
  expect(btn.getAttribute('aria-expanded')).toBe('false')
  fireEvent.click(btn) // user-event는 의존성에 없다
  expect(btn.getAttribute('aria-expanded')).toBe('true')
})
```

```ts
// e2e/no-js.spec.ts
test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  test('every ready tab is reachable on a narrow screen', async ({ page }) => {
    await page.goto('/')
    for (const name of ['서비스', '블로그', '문의']) await expect(page.getByRole('link', { name, exact: true }).first()).toBeVisible()
  })
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/site.test.ts __tests__/lib/channels.test.ts __tests__/components/SiteNav.test.tsx` → 모듈 없음 FAIL. `npx playwright test e2e/no-js.spec.ts --project=chromium` → 탭 없음 FAIL.
- [ ] **Step 3: 구현** — `SiteNav`는 클라이언트 컴포넌트(`usePathname`). `SiteFooter`는 서버 컴포넌트: 왼쪽 「Joonangler」와 `© <연도> Joonangler`, 오른쪽 준비된 탭과 `getChannels()`. 올림 효과는 `hover-fine:`만.
- [ ] **Step 4: 통과 확인** — 위 두 명령 PASS. `npm run test:run` rc 0.
- [ ] **Step 5: Commit** — `feat(site): 떠 있는 내비와 한 줄 바닥, 채널 목록`

### Task 6: 블로그 묶음 경로와 구역 머리 (§0 범위 조정 2)

**Files:**
- Move: `app/posts`, `app/series`, `app/tags`, `app/search` → `app/(blog)/…` (주소는 그대로 — 괄호 폴더는 경로에 들지 않는다)
- Create: `app/(blog)/layout.tsx`, `components/blog/BlogSectionNav.tsx`, `__tests__/components/BlogSectionNav.test.tsx`
- Modify: `lib/constants.ts`(`SITE_CONFIG.blogName`), `.env.production`(`NEXT_PUBLIC_BLOG_NAME=Joonangler.log`)

**Interfaces:**
- Produces: `SITE_CONFIG.blogName: string` — `process.env.NEXT_PUBLIC_BLOG_NAME || 'Joonangler.log'`.
- Produces: `app/(blog)/layout.tsx` — 위 여백 `HEADER_HEIGHT`px, 그 아래 `BlogSectionNav`, 그 아래 `children`. 움직이는 배경 없음.
- Produces: `BlogSectionNav` — 이름 `SITE_CONFIG.blogName`(→ `/posts/`), 둘째 줄 글 `/posts/` · 시리즈 `/series/` · 태그 `/tags/` · 검색 `/search/`, 지금 칸은 `aria-current="page"`. 글 화면(`/posts/<slug>/`)에서는 「글」이 현재다.

- [ ] **Step 1: 실패하는 테스트** — `usePathname`을 `'/series/sample-series/'`로 두고 「시리즈」만 `aria-current="page"`, `'/posts/hello/'`에서 「글」만 현재, 이름 링크의 글자가 `Joonangler.log`.
- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/components/BlogSectionNav.test.tsx` → FAIL.
- [ ] **Step 3: 구현과 폴더 옮기기** — `git mv`로 옮긴다. 옮긴 파일 안의 상대 경로 import가 있으면 고친다(`@/` 별칭이면 그대로).
- [ ] **Step 4: 통과 확인** — 시험 PASS. **`npm run check:routes` → diff 없음, rc 0**(경로 묶음이 주소를 바꾸지 않았음을 Task 2의 기준본이 보인다).
- [ ] **Step 5: Commit** — `feat(blog): 블로그 묶음 경로와 Joonangler.log 구역 머리`

### Task 7: 내용 자료 — 서비스·작업·사이트 문안

**Files:**
- Create: `lib/services.ts`, `lib/work.ts`, `content/site.ts`, `content/services/web-app-fix.mdx`, `content/work/ondobeach.mdx`, `public/work/ondobeach/home.jpg`, `__tests__/lib/services.test.ts`, `__tests__/lib/work.test.ts`, `__tests__/fixtures/services/{alpha.mdx,beta.mdx}`, `__tests__/fixtures/services-invalid/{bad-price,unknown-related,missing-title}/*.mdx`, `__tests__/fixtures/work/{one.mdx,two.mdx}`
- Modify: `vitest.config.ts`(`env.SERVICES_DIR`, `env.WORK_DIR` → fixtures)

**Interfaces:**
- Produces (`lib/work.ts`):
  - `type WorkKind = 'own' | 'client'`
  - `interface Work { slug: string; title: string; summary: string; kind: WorkKind; order: number; cover: string; coverAlt: string; url?: string; body: string }`
  - `function getAllWork(): Work[]` — `order` 오름차순, 같으면 `slug`. 폴더는 `process.env.WORK_DIR ?? content/work`. 슬러그는 파일 이름.
  - `function workKindLabel(kind: WorkKind): '직접 운영' | '의뢰 작업'`
- Produces (`lib/services.ts`):
  - `interface ServicePrice { name: string; scope: string; days: number; won: number }`
  - `interface Service { slug: string; title: string; summary: string; headline: string[]; sub: string; order: number; prices: ServicePrice[]; pricesLead?: string; pricesNote?: string; steps: { title: string; body: string }[]; prepare: string[]; after: string[]; faq: { q: string; a: string }[]; related: string[]; contactLine: string; provisional: boolean; body: string }`
  - `function getAllServices(): Service[]` — 정렬은 작업과 같다. 폴더는 `process.env.SERVICES_DIR ?? content/services`.
  - `function getServiceBySlug(slug: string): Service | null`
  - `function fromPrice(service: Service): number` — `prices`의 가장 작은 `won`.
  - `function formatWon(won: number): string` — `59000` → `'59,000원'`.
  - 검증: `title`·`summary`·`headline`(빈 배열 아님)·`contactLine`이 없거나, `prices`가 비었거나, `won`·`days`가 양의 정수가 아니거나, `related`의 이름이 `getAllWork()`에 없으면 `Error`를 던지고 메시지에 파일 이름을 넣는다. `steps`·`prepare`·`after`·`faq`·`related`는 없으면 빈 배열.
- Produces (`content/site.ts`): `interface Copy { text: string; provisional?: true }` 그리고
  - `HOME_HERO: { lines: string[][]; sub: string }` — 부록 B의 값. 홈 문장을 바꿀 때 고치는 곳은 이 하나다.
  - `SERVICES_PAGE: { title: '서비스'; intro: Copy; principles: { title: string; body: Copy }[]; notDone: string[]; contactLine: Copy }`
  - `CONTACT_PAGE: { title: '문의'; lead: '하려는 일을 알려 주세요'; hints: string[]; consult: string }`

**첫 묶음의 실제 내용**(전부 `provisional: true`):
- `content/services/web-app-fix.mdx`: title 「막힌 웹·앱 수리와 배포」, summary 「AI 도구로 만들다 멈춘 앱과 사이트의 오류를 고치고 배포합니다」, headline `['만들다 막힌 웹·앱,', '고치고 배포까지 마무리합니다']`, sub 「AI 도구로 만들다 멈춘 앱과 사이트가 대상입니다. 범위와 금액은 결제 전에 글로 정합니다.」, pricesLead 「진단은 비용을 받지 않습니다. 무엇을 며칠에 얼마에 고칠 수 있는지 먼저 알려 드립니다.」, prices `오류 1건 / 오류 1건 진단·수정, 변경 내역 문서 / 2 / 59000` · `오류 3건과 배포 / 오류 3건 수정, 배포 1회, 확인 방법 문서 / 3 / 180000` · `완성·배포·인계 / 오류 10건, 화면 15개 이내 마무리, 배포, 인계 문서 / 7 / 440000`, pricesNote 「페이지나 기능을 더하는 일은 범위를 보고 따로 정합니다.」, steps 넷(부록 B), prepare `['증상 화면', '오류 메시지', '소스', '쓴 도구', '배포할 곳']`, after·faq 비움, related `['ondobeach']`, contactLine 「어디서 막혔는지 알려 주세요」. **본문(이런 일을 합니다)은 문안이 확정되지 않아 비운다.**
- `content/work/ondobeach.mdx`: title 「온도비치」, summary 「해수욕장과 해양 관측소의 수온을 지도 한 장에 모은 서비스」, kind `own`, order 1, cover `/work/ondobeach/home.jpg`, coverAlt 「온도비치 첫 화면」, url `https://ondobeach.com`. 본문 비움(묶음 2).
- `public/work/ondobeach/home.jpg`: 1440×900 PNG 원본(브리프가 넘긴다)을 `sips -s format jpeg -s formatOptions 82 <원본> --out public/work/ondobeach/home.jpg`로. `stat -f%z` ≤ 340000(처음 256000, 품질 82에서 329,111B라 올림 — 허브 2026-11-13: 글자·지도 선이 든 캡처라 품질과 폭을 지킨다).
- `SERVICES_PAGE`: intro 「맡는 일과 가격, 일하는 방식입니다.」(자리 문안), principles 넷 — 결제 전에 진단 / 범위와 금액은 글로 / 복사본에서 작업 / 문서와 권한 반납, 본문은 부록 B의 진행 순서 문장을 자리 문안으로, notDone `['소스를 받을 수 없는 서비스의 수정', '허락 없는 접근']`, contactLine 「하려는 일이 있으면 문의로 알려 주세요」(자리 문안).
- `CONTACT_PAGE`: hints `['증상 화면', '오류 메시지', '소스', '쓴 도구', '배포할 곳']`, consult 「먼저 상담으로 할 일과 금액을 정합니다. 진행과 결제 방법은 상담에서 안내합니다.」

- [ ] **Step 1: 실패하는 테스트**

```ts
// __tests__/lib/services.test.ts
it('reads fixture services in order', () => {
  expect(getAllServices().map((s) => s.slug)).toEqual(['alpha', 'beta'])
})
it('computes the starting price', () => {
  expect(formatWon(fromPrice(getServiceBySlug('alpha')!))).toBe('59,000원')
})
it('defaults optional lists to empty', () => {
  expect(getServiceBySlug('beta')!.faq).toEqual([])
})
it.each(['bad-price', 'unknown-related', 'missing-title'])('rejects %s with the file name', (dir) => {
  vi.stubEnv('SERVICES_DIR', path.join(__dirname, '../fixtures/services-invalid', dir))
  expect(() => getAllServices()).toThrow(/\.mdx/)
})
// __tests__/lib/work.test.ts
it('reads fixture work in order with kind labels', () => {
  const w = getAllWork()
  expect(w.map((x) => x.slug)).toEqual(['one', 'two'])
  expect(workKindLabel(w[0].kind)).toBe('직접 운영')
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/services.test.ts __tests__/lib/work.test.ts` → FAIL.
- [ ] **Step 3: 구현** — 동기 `fs`와 `gray-matter`. fixtures `alpha`는 가격 셋(59000이 가장 작다)과 모든 목록, `beta`는 필수 값만. 무효 fixtures는 폴더마다 파일 하나.
- [ ] **Step 4: 통과 확인** — PASS. `grep -rn "provisional: true" content/` → 서비스 1, 사이트 문안 몇 줄(공개 전에 0이 되어야 하는 목록).
- [ ] **Step 5: Commit** — `feat(content): 서비스·작업 자료와 사이트 문안을 한 곳에`

### Task 8: 점 무리 계산 (`lib/dots/`)

**Files:**
- Create: `lib/dots/shapes.ts`, `lib/dots/motion.ts`, `lib/dots/field.ts`, `__tests__/lib/dots/{shapes,motion,field}.test.ts`

**Interfaces:**
- Produces (`shapes.ts`): `interface Box { x: number; y: number; w: number; h: number }`, `interface ShapePoint { x: number; y: number; a: number; r: number }`, `type ShapeId = 'web' | 'app' | 'term' | 'git' | 'post' | 'video' | 'toon'`, `const SHAPE_ORDER: readonly ShapeId[]`, `function stepFor(boxWidth: number): number` (`clamp(boxWidth / 78, 5.5, 7.5)`), `function buildShapes(box: Box): ShapePoint[][]` — 부록 A의 일곱 함수를 차례대로.
- Produces (`motion.ts`): `const PHASE_MS = { wait: 700, gather: 2400, hold: 4200, morph: 2000, scatter: 1500, drift: 1100 } as const`, `function easeInOutCubic(p: number): number`, `function cycleMs(shapeCount: number): number`, `type Phase = 'wait' | 'move' | 'hold' | 'drift'`, `interface Timeline { phase: Phase; shape: number; elapsed: number; duration: number; still: boolean; shapeCount: number }`, `function createTimeline(opts: { shapeCount: number; reduced: boolean }): Timeline`, `function advance(t: Timeline, dt: number): { timeline: Timeline; go?: { target: number; ms: number; spread: number } }` — `target -1`은 흩어짐. `spread`는 처음 모임 0.5, 옮겨 감 0.35, 흩어짐 0.15.
- Produces (`field.ts`): `type Rng = () => number`, `function backgroundCount(w: number, h: number): number` (`Math.round(Math.min(340, w * h / 4600))`), `interface FormPoint { …부록 B의 필드 }`, `function createFormPoints(n: number, w: number, h: number, rng: Rng): FormPoint[]`, `function assignTargets(points: FormPoint[], shape: ShapePoint[], rng: Rng): void` (자리 있는 점의 `delay = 0.62 * i / n + 0.38 * rng()`), `function restartFrom(points: FormPoint[]): void` (출발점 = 지금 그려진 자리), `function pointerOffset(pointer: number, size: number): number` (`(pointer / size - 0.5) * -44`), `const FORM_POINTER_FACTOR = 0.2`, `function resizeAction(prev: { w: number; h: number }, next: { w: number; h: number }): 'rebuild' | 'retarget' | 'none'`.

부록 B의 「모인 모양은 포인터의 5분의 1」은 설계가 맞다 — 시안은 0.22를 썼지만 `FORM_POINTER_FACTOR = 0.2`.

- [ ] **Step 1: 실패하는 테스트**

```ts
// motion
expect(PHASE_MS).toEqual({ wait: 700, gather: 2400, hold: 4200, morph: 2000, scatter: 1500, drift: 1100 })
expect(cycleMs(7)).toBe(46400) // 처음 모임 + 머묾 7 + 옮겨 감 6 + 흩어짐 + 떠돎
expect([0, 0.25, 0.5, 1].map(easeInOutCubic)).toEqual([0, 0.0625, 0.5, 1])
it('walks the whole cycle', () => {
  let t = createTimeline({ shapeCount: 7, reduced: false })
  const gos: string[] = []
  for (let i = 0; i < 2000; i++) { const r = advance(t, 50); t = r.timeline; if (r.go) gos.push(`${r.go.target}:${r.go.ms}:${r.go.spread}`) ; if (gos.length === 9) break }
  expect(gos).toEqual(['0:2400:0.5', '1:2000:0.35', '2:2000:0.35', '3:2000:0.35', '4:2000:0.35', '5:2000:0.35', '6:2000:0.35', '-1:1500:0.15', '0:2400:0.5'])
})
it('reduced motion holds the first shape forever', () => {
  const t = createTimeline({ shapeCount: 7, reduced: true })
  expect(t).toMatchObject({ phase: 'hold', shape: 0, still: true })
  expect(advance(t, 1e6).go).toBeUndefined()
})
// shapes
expect(SHAPE_ORDER).toEqual(['web', 'app', 'term', 'git', 'post', 'video', 'toon'])
expect([400, 546, 780].map(stepFor)).toEqual([5.5, 7, 7.5])
it('every shape stays inside its box', () => {
  const box = { x: 100, y: 50, w: 560, h: 482 }
  for (const s of buildShapes(box)) {
    expect(s.length).toBeGreaterThan(50)
    for (const p of s) { expect(p.x).toBeGreaterThanOrEqual(box.x - 1); expect(p.x).toBeLessThanOrEqual(box.x + box.w + 1); expect(p.y).toBeGreaterThanOrEqual(box.y - 1); expect(p.y).toBeLessThanOrEqual(box.y + box.h + 1) }
  }
})
// field
expect([backgroundCount(1440, 900), backgroundCount(3000, 2000)]).toEqual([282, 340])
expect([pointerOffset(0, 1000), pointerOffset(1000, 1000)]).toEqual([22, -22])
it('points beyond the shape go back to the background', () => { /* 점 10개, 모양 4점 → has: 앞 4 true, 뒤 6 false */ })
it('restarts from where points are drawn now', () => { /* p.cx = 10, p.cy = 20 → restartFrom 뒤 p.sx === 10, p.sy === 20 */ })
expect(resizeAction({ w: 390, h: 700 }, { w: 390, h: 760 })).toBe('retarget')
expect(resizeAction({ w: 390, h: 700 }, { w: 844, h: 390 })).toBe('rebuild')
expect(resizeAction({ w: 390, h: 700 }, { w: 390, h: 700 })).toBe('none')
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/dots` → FAIL.
- [ ] **Step 3: 구현** — 부록 A를 TypeScript로 옮긴다(`STEP`은 모듈 변수가 아니라 `buildShapes` 안에서 `stepFor(box.w)`로 정해 함수들에 넘긴다). `Math.random`을 부르지 않는다 — 난수는 `Rng`로 받는다.
- [ ] **Step 4: 통과 확인** — PASS. 시간표 시험의 기대값 중 하나(예: `'1:2000:0.35'`)를 `0.5`로 바꿔 FAIL을 본 뒤 되돌린다.
- [ ] **Step 5: Commit** — `feat(dots): 모양 일곱·시간표·점 배치를 순수 함수로`

### Task 9: `DotField` 컴포넌트

**Files:**
- Create: `components/dots/DotField.tsx`, `components/dots/PauseButton.tsx`, `__tests__/components/DotField.test.tsx`
- Modify: `app/globals.css`(캔버스 가림 `mask-image` 셋 — 부록 C)

**Interfaces:**
- Consumes: Task 8 전부.
- Produces: `DotField(props: { mode: 'shapes' | 'plain'; mask: 'home' | 'service' | 'band'; slotRef?: React.RefObject<HTMLElement | null> })` — 부모를 채우는 `<canvas aria-hidden="true">`와 오른쪽 아래 `PauseButton`. `mode: 'shapes'`이면 `slotRef` 자리에 모양을 모은다.
- Produces: `PauseButton({ paused, onToggle })` — `aria-pressed`, 글자 「배경 멈춤」/「배경 재생」, 높이 40px(좁은 화면 44px).

돌리는 조건은 `보임 && !멈춤 && !모션줄이기 && document.visibilityState === 'visible'`(부록 B). 모션 줄이기가 처음부터 켜져 있으면 정지 화면 한 장(홈은 첫 모양이 모인 모습)만 그린다. 보는 도중에 켜면 지금 모양(가던 모양)에서 멈춘다(Review Focus 2). 포인터는 `pointerType === 'touch'`이면 무시. `devicePixelRatio`는 2까지. 크기 변경은 `resizeAction`을 따른다. 프레임 상태는 `useRef`에.

- [ ] **Step 1: 실패하는 테스트** — `HTMLCanvasElement.prototype.getContext`를 가짜 문맥(`clearRect`, `beginPath`, `arc`, `fill`, `setTransform`, `fillStyle`)으로, `IntersectionObserver`·`matchMedia`·`requestAnimationFrame`·`cancelAnimationFrame`을 `vi.fn`으로 바꾼다.

```ts
it('starts the loop when visible', () => { renderField(); io.trigger(true); expect(raf).toHaveBeenCalled() })
it('stops when it leaves the viewport', () => { renderField(); io.trigger(true); io.trigger(false); expect(caf).toHaveBeenCalled(); expect(raf).toHaveBeenCalledTimes(1) })
it('stops when the tab is hidden', () => { /* visibilityState 'hidden' + visibilitychange → caf, 다시 raf 안 함 */ })
it('pause button stops the loop and flips its label', async () => {
  renderField(); io.trigger(true)
  fireEvent.click(screen.getByRole('button', { name: '배경 멈춤' }))
  expect(screen.getByRole('button', { name: '배경 재생' }).getAttribute('aria-pressed')).toBe('true')
  expect(caf).toHaveBeenCalled()
})
it('reduced motion draws one still frame and never asks for a frame', () => { mm.reduce = true; renderField(); io.trigger(true); expect(raf).not.toHaveBeenCalled(); expect(ctx.arc).toHaveBeenCalled() })
it('reduced motion turned on mid-session stops the loop', () => { renderField(); io.trigger(true); mm.setReduce(true); expect(caf).toHaveBeenCalled() })
it('canvas is decorative', () => { renderField(); expect(document.querySelector('canvas')!.getAttribute('aria-hidden')).toBe('true') })
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/components/DotField.test.tsx` → FAIL.
- [ ] **Step 3: 구현** — `useEffect` 하나가 관찰자·리스너·rAF를 걸고 정리한다. `getContext`가 `null`이면(jsdom, 오래된 브라우저) 아무것도 그리지 않고 오류를 내지 않는다.
- [ ] **Step 4: 통과 확인** — PASS. 「reduced motion draws one still frame」에서 `raf` 기대를 `toHaveBeenCalled()`로 뒤집어 FAIL을 본 뒤 되돌린다.
- [ ] **Step 5: Commit** — `feat(dots): DotField — 보일 때만 돌고, 멈춤과 모션 줄이기를 따른다`

### Task 10: 홈 첫 화면

**Files:**
- Create: `lib/words.ts`, `components/home/HomeHero.tsx`, `__tests__/components/HomeHero.test.tsx`, `e2e/motion.spec.ts`
- Modify: `app/page.tsx`(지금 내용을 걷고 첫 화면만), `app/globals.css`(첫 화면 배치와 등장 — 부록 C), `e2e/homepage.spec.ts`(새 화면 기준으로 다시 씀)

**Interfaces:**
- Consumes: `HOME_HERO`(Task 7), `DotField`(Task 9).
- Produces (`lib/words.ts`): `const WORD_DELAYS = [0, 90, 170, 240, 300, 350, 390] as const`, `function toWordLines(lines: string[] | string[][]): { text: string; delay: number }[][]` — 문자열 줄은 공백으로 낱말을 나눈다. k번째 낱말의 지연은 `WORD_DELAYS[min(k, 6)]`. Task 13의 서비스 첫 화면도 이것을 쓴다.
- Produces: `HomeHero()` — 클라이언트 컴포넌트. `<h1>`의 낱말마다 `<span class="hero-word" style="--d:<ms>">`. 오른쪽 `slot`(장식, `aria-hidden`)을 `DotField mode="shapes" mask="home"`에 넘긴다.

- [ ] **Step 1: 실패하는 테스트**

```ts
it('renders the hero sentence in three lines with shrinking delays', () => {
  render(<HomeHero />)
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.textContent!.replace(/\s+/g, ' ').trim()).toBe('만들고, 내놓고, 수익까지 도전합니다')
  expect(h1.textContent).not.toMatch(/\.\s*$/) // 끝에 마침표 없음
  const ds = [...h1.querySelectorAll<HTMLElement>('.hero-word')].map((w) => w.style.getPropertyValue('--d'))
  expect(ds).toEqual(['0', '90', '170', '240'])
  expect(screen.getByText('AI와 함께 답을 찾아가며, 그 과정을 기록으로 남깁니다.')).toBeTruthy()
})
```

```ts
// e2e/motion.spec.ts
test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('words only fade and the canvas stands still', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('.hero-word').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('fade')
    await page.waitForTimeout(800)
    const a = await page.locator('canvas').first().screenshot()
    await page.waitForTimeout(1000)
    const b = await page.locator('canvas').first().screenshot()
    expect(a.equals(b)).toBe(true)
  })
})
test('without reduced motion the canvas moves', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(800)
  const a = await page.locator('canvas').first().screenshot()
  await page.waitForTimeout(1000)
  expect(a.equals(await page.locator('canvas').first().screenshot())).toBe(false)
})
```

- [ ] **Step 2: 실패 확인** — vitest와 `npx playwright test e2e/motion.spec.ts --project=chromium` → FAIL.
- [ ] **Step 3: 구현** — 배치·글자·등장 값은 부록 C. 모션 줄이기면 낱말과 보조 문장은 `fade 300ms`, 지연 0.
- [ ] **Step 4: 통과 확인** — 두 명령 PASS. 둘째 e2e(움직인다)가 첫째(멈춘다)와 반대로 갈리는 것이 이 시험이 공허하지 않다는 증거다.
- [ ] **Step 5: Commit** — `feat(home): 세 줄 문장과 점이 모이는 첫 화면`

### Task 11: 홈 아래 구역과 카드, 스크롤 등장

**Files:**
- Create: `components/site/Reveal.tsx`, `components/site/Card.tsx`, `components/home/HomeWork.tsx`, `components/home/HomeLog.tsx`, `components/home/HomeServices.tsx`, `__tests__/components/{HomeLog,Card,HomeWork}.test.tsx`, `e2e/hover.spec.ts`
- Modify: `app/page.tsx`(아래 구역 셋), `lib/utils.ts`(`formatDotDate`), `__tests__/lib/utils.test.ts`, `e2e/no-js.spec.ts`(시험 더함)

**Interfaces:**
- Consumes: `getAllWork`, `getAllServices`, `fromPrice`, `formatWon`(Task 7), `isNavReady`(Task 5), `getAllPosts`(기존).
- Produces: `formatDotDate(date: string): string` — `'2026-11-03'` → `'2026.11.03'`(UTC).
- Produces: `Reveal({ kind: 'title' | 'rise'; index?: number; as?: keyof JSX.IntrinsicElements; children })` — 화면에 들어오면 한 번 `is-in`을 단다(`rootMargin: '0px 0px -90px 0px'`). 숨김은 `.js` 아래에서만.
- Produces: `WorkCard({ work: Work; href?: string; wide?: boolean })`, `ServiceCard({ service: Service })` — `href`가 없으면 링크가 아닌 `div`(올림 효과 없음). 서비스 카드는 `/services/<slug>/`로 가고 판에 「59,000원부터」와 이름.
- `HomeWork({ works }: { works: Work[] })` — 작업이 하나면 `wide`. 「작업 전체 보기」와 카드 링크는 `isNavReady('work')`일 때만(첫 묶음에서는 없다). 작업이 0개면 `null`.
- `HomeLog({ posts }: { posts: Post[] })` — `Post`는 `lib/posts.ts`의 기존 타입. 0편이면 `null`. 셋까지. 줄마다 날짜·제목·시리즈, `/posts/<slug>/`. 「글 전체 보기」 → `/posts/`.
- `HomeServices({ services }: { services: Service[] })` — 「서비스 전체 보기」 → `/services/`. 자리만 잡은 카드는 그리지 않는다. 0개면 `null`.
- `app/page.tsx`는 `getAllWork()`·`getAllPosts()`·`getAllServices()`를 읽어 세 구역에 넘긴다.
- 구역 이름: 「직접 만들어 운영하는 것」, 「기록」, 「맡는 일」.

- [ ] **Step 1: 실패하는 테스트**

```ts
expect(formatDotDate('2026-11-03')).toBe('2026.11.03')
it('draws nothing without posts', () => { const { container } = render(<HomeLog posts={[]} />); expect(container.innerHTML).toBe('') })
it('shows three latest posts', () => {
  render(<HomeLog posts={fourPosts} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
  expect(screen.getAllByRole('link')[0].getAttribute('href')).toBe('/posts/p1/')
})
it('a work card without href is not a link', () => { render(<WorkCard work={w} />); expect(screen.queryByRole('link')).toBeNull() })
it('service card shows the starting price', () => { render(<ServiceCard service={s} />); expect(screen.getByText('59,000원부터')).toBeTruthy(); expect(screen.getByRole('link').getAttribute('href')).toBe('/services/alpha/') })
it('hides the work list link until the work tab is ready', () => { render(<HomeWork works={[w]} />); expect(screen.queryByText('작업 전체 보기')).toBeNull() })
```

```ts
// e2e/no-js.spec.ts에 더함 — 스크립트가 없어도 구역이 보인다
test('sections are visible without javascript', async ({ page }) => {
  await page.goto('/')
  const h2 = page.getByRole('heading', { name: '맡는 일' })
  expect(await h2.evaluate((el) => getComputedStyle(el).clipPath)).toBe('none')
  const card = page.getByRole('link', { name: /막힌 웹·앱/ })
  expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
})
// e2e/hover.spec.ts
test('a fine pointer raises the card ring', async ({ page }) => {
  await page.goto('/'); const card = page.getByRole('link', { name: /막힌 웹·앱/ })
  const before = await card.evaluate((el) => getComputedStyle(el).boxShadow)
  await card.hover(); await page.waitForTimeout(250)
  expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(before)
})
test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 393, height: 851 } })
  test('a coarse pointer gets no hover ring', async ({ page }) => {
    await page.goto('/'); const card = page.getByRole('link', { name: /막힌 웹·앱/ })
    expect(await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches)).toBe(false)
    const before = await card.evaluate((el) => getComputedStyle(el).boxShadow)
    await card.hover(); await page.waitForTimeout(250) // :hover는 걸리지만 미디어 조건이 막아야 한다
    expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(before)
  })
})
```

- [ ] **Step 2: 실패 확인** — vitest(모듈 없음)와 `npx playwright test e2e/no-js.spec.ts e2e/hover.spec.ts --project=chromium` → FAIL.
- [ ] **Step 3: 구현** — 카드·줄·구역 값은 부록 C. 올림은 `hover-fine:`. 작업 캡처는 `next/image`가 아니라 `<img loading="lazy" decoding="async" width height>`(정적 export에서 `unoptimized`라 이점이 없다).
- [ ] **Step 4: 통과 확인** — 두 명령 PASS. `npm run build:production` 뒤 `grep -l "pointer:fine" out/_next/static/css/*.css` → 파일 하나 이상(Task 3 Step 5의 미룬 확인). 터치 시험이 공허하지 않음을 보이려고, 서비스 카드의 `hover-fine:`을 잠깐 `hover:`로 바꿔 터치 시험이 FAIL하는 것을 본 뒤 되돌린다.
- [ ] **Step 5: Commit** — `feat(home): 작업·기록·맡는 일 구역과 카드, 한 번만 드러나는 스크롤 등장`

### Task 12: 서비스 목록과 낮은 띠

**Files:**
- Create: `components/site/PageBand.tsx`, `app/services/page.tsx`, `__tests__/components/ServicesPage.test.tsx`

**Interfaces:**
- Consumes: `DotField`(Task 9), `ServiceCard`·`Reveal`(Task 11), `SERVICES_PAGE`·`getAllServices`(Task 7).
- Produces: `PageBand({ title: string; lead: string })` — 높이 `max(40svh, 280px)`, `DotField mode="plain" mask="band"`, 제목은 `<h1>`. 묶음 2·3이 그대로 쓴다.
- 페이지 구성은 설계 §6의 1~5. 「일하는 방식」은 번호 없는 `<ul>`. 메타데이터 `getPageMetadata({ title: '서비스', description: SERVICES_PAGE.intro.text, path: '/services/' })`.

- [ ] **Step 1: 실패하는 테스트** — `render(await ServicesPage())` 또는 동기 컴포넌트면 그대로: `<h1>` 「서비스」, 카드 링크가 fixtures 차례로 `/services/alpha/`·`/services/beta/`, 「일하는 방식」 아래 `ul` 안에 원칙 넷(`ol`이 아님), 「하지 않는 일」 둘, `/contact/`로 가는 링크 하나.
- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/components/ServicesPage.test.tsx` → FAIL.
- [ ] **Step 3: 구현.**
- [ ] **Step 4: 통과 확인** — PASS. `npm run build:production` 뒤 `test -f out/services/index.html` rc 0.
- [ ] **Step 5: Commit** — `feat(services): 서비스 목록과 낮은 띠 머리`

### Task 13: 서비스별 페이지

**Files:**
- Create: `app/services/[slug]/page.tsx`, `components/services/ServiceHero.tsx`, `components/services/PriceList.tsx`, `components/services/StepList.tsx`, `__tests__/components/ServiceDetail.test.tsx`

**Interfaces:**
- Consumes: Task 7·9·11.
- Produces: `generateStaticParams()` — `getAllServices().map(({ slug }) => ({ slug }))`, `dynamicParams = false`. 서비스가 0개면 빌드 오류를 던진다(`'content/services에 서비스가 하나도 없다'`) — 글처럼 자리채움 경로를 두지 않는다. 서비스가 없는 사이트는 공개하지 않기 때문이다.
- `ServiceHero({ service })` — 화면 전체, `DotField mode="plain" mask="service"`, 왼쪽 아래 `headline`(`toWordLines(service.headline)`, Task 10)·`sub`, 단추 「문의하기」(`/contact/`)와 「가격 보기」(`#prices`).
- `PriceList({ prices, lead?, note? })` — `<ul id="prices">`, 줄마다 이름·범위·`<n>일`·`formatWon`. 숫자는 `tabular-nums`.
- `StepList({ steps })` — 번호 있는 `<ol>`.
- 구역 차례와 이름(설계 §6): 이런 일을 합니다(본문이 비면 구역 없음) · 가격 · 진행 순서 · 준비해 주실 것 · 납품 뒤 · 자주 묻는 질문 · 관련 작업 · 문의 한 줄(`contactLine` → `/contact/`). **목록이 빈 구역은 그리지 않는다.** 관련 작업은 `WorkCard`(링크는 `isNavReady('work')`일 때만). 본문 MDX는 기존 글 렌더러(`components/mdx/MDXComponents.tsx`)로.
- 메타데이터 `getPageMetadata({ title: service.title, description: service.summary, path: '/services/<slug>/' })`.

- [ ] **Step 1: 실패하는 테스트**

```ts
it('lists prices as rows with days and won', () => {
  render(<PriceList prices={alpha.prices} />)
  const rows = screen.getAllByRole('listitem')
  expect(rows).toHaveLength(3)
  expect(rows[0].textContent).toContain('2일'); expect(rows[0].textContent).toContain('59,000원')
})
it('numbers the steps', () => { render(<StepList steps={alpha.steps} />); expect(screen.getByRole('list').tagName).toBe('OL') })
it('hero buttons go to contact and prices', () => {
  render(<ServiceHero service={alpha} />)
  expect(screen.getByRole('link', { name: '문의하기' }).getAttribute('href')).toBe('/contact/')
  expect(screen.getByRole('link', { name: '가격 보기' }).getAttribute('href')).toBe('#prices')
})
it('skips empty sections', () => { /* beta(필수 값만)를 그리면 「자주 묻는 질문」·「납품 뒤」 heading이 없다 */ })
it('builds a page per fixture service', async () => { expect(await generateStaticParams()).toEqual([{ slug: 'alpha' }, { slug: 'beta' }]) })
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/components/ServiceDetail.test.tsx` → FAIL.
- [ ] **Step 3: 구현** — 값은 부록 C의 「가격 줄」·「진행 순서」·「서비스 첫 화면」.
- [ ] **Step 4: 통과 확인** — PASS. `npm run build:production` 뒤 `test -f out/services/web-app-fix/index.html` rc 0.
- [ ] **Step 5: Commit** — `feat(services): 서비스별 페이지 — 첫 화면, 가격 줄, 진행 순서`

### Task 14: 문의

**Files:**
- Create: `app/contact/page.tsx`, `components/contact/EmailCopy.tsx`, `__tests__/components/EmailCopy.test.tsx`, `__tests__/lib/contact-email.test.ts`
- Modify: `lib/constants.ts`(`getContactEmail`), `.env.production`(`NEXT_PUBLIC_AUTHOR_EMAIL` — 값은 구현 때 따로 받는다. 이 계획과 브리프에는 적지 않는다)

**Interfaces:**
- Produces: `getContactEmail(): string` — `process.env.NEXT_PUBLIC_AUTHOR_EMAIL`. 운영 빌드(`NODE_ENV === 'production'`)에서 비어 있으면 `Error('NEXT_PUBLIC_AUTHOR_EMAIL must be set')`.
- Produces: `EmailCopy({ email: string })` — 클라이언트. `<a href="mailto:…">주소</a>`와 단추 「복사」, 결과 알림은 `role="status"`(`aria-live="polite"`). `navigator.clipboard?.writeText`가 없거나 거절되면 주소 글자를 선택하고 「주소를 선택했습니다. 복사해 주세요」. 성공하면 「복사했습니다」.
- 페이지(설계 §10): `PageBand`(제목 「문의」, lead 「하려는 일을 알려 주세요」), `EmailCopy`, 「보낼 때 적으면 좋은 것」 목록(`CONTACT_PAGE.hints`), 상담 안내 한 줄(`CONTACT_PAGE.consult`), `getChannels()` 링크.

- [ ] **Step 1: 실패하는 테스트**

```ts
it('copies the address', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<EmailCopy email="someone@example.com" />)
  expect(screen.getByRole('link', { name: 'someone@example.com' }).getAttribute('href')).toBe('mailto:someone@example.com')
  fireEvent.click(screen.getByRole('button', { name: '복사' }))
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('복사했습니다'))
  expect(writeText).toHaveBeenCalledWith('someone@example.com')
})
it('selects the text when the clipboard is missing', async () => {
  Object.assign(navigator, { clipboard: undefined })
  render(<EmailCopy email="someone@example.com" />)
  fireEvent.click(screen.getByRole('button', { name: '복사' }))
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('주소를 선택했습니다. 복사해 주세요'))
  expect(window.getSelection()!.toString()).toBe('someone@example.com')
})
it('selects the text when writeText rejects', async () => { /* writeText: vi.fn().mockRejectedValue(new Error('denied')) → 같은 알림 */ })
// contact-email
it('throws in production without an address', () => { vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('NEXT_PUBLIC_AUTHOR_EMAIL', ''); expect(() => getContactEmail()).toThrow(/NEXT_PUBLIC_AUTHOR_EMAIL/) })
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/components/EmailCopy.test.tsx __tests__/lib/contact-email.test.ts` → FAIL.
- [ ] **Step 3: 구현.** `.env.production`에 값을 넣는다.
- [ ] **Step 4: 통과 확인** — PASS. `npm run build:production` rc 0, `grep -c "mailto:" out/contact/index.html` → `1` 이상.
- [ ] **Step 5: Commit** — `feat(contact): 메일 주소 글자와 복사, 상담 안내`

### Task 15: 이름·아이콘·OG·404·피드 이름

**Files:**
- Modify: `.env.production`(`NEXT_PUBLIC_SITE_NAME=Joonangler`), `app/icon.tsx`, `app/opengraph-image.tsx`, `app/not-found.tsx`, `lib/json-ld.ts`(Blog 스키마 `name`), `scripts/generate-rss.mjs`(피드 제목), `e2e/homepage.spec.ts`
- Create: `__tests__/lib/json-ld.test.ts`

**Interfaces:**
- Consumes: `SITE_CONFIG.blogName`(Task 6).
- Produces: WebSite 스키마 `name` = 사이트 이름(「Joonangler」), Blog 스키마 `name` = 블로그 이름(「Joonangler.log」). RSS·Atom·JSON 피드 제목 = `process.env.NEXT_PUBLIC_BLOG_NAME || 'Joonangler.log'`.
- 아이콘 32×32 검정 바탕 흰 「J」, OG 1200×630 검정 바탕 흰 「Joonangler」. 404는 사이트 틀의 한국어(지금 문구 「페이지를 찾을 수 없습니다」 유지, 단추는 「홈으로」 하나).

- [ ] **Step 1: 실패하는 테스트** — `vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'Joonangler'); vi.stubEnv('NEXT_PUBLIC_BLOG_NAME', 'Joonangler.log'); vi.resetModules()` 뒤 동적 import로 `generateWebSiteSchema().name === 'Joonangler'`, Blog 스키마 `name === 'Joonangler.log'`(지금은 둘 다 사이트 이름이라 FAIL). e2e `homepage.spec.ts`: 제목에 `Joonangler`, `<h1>` 보임, 내비 탭 셋, 바닥 보임.
- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/json-ld.test.ts` → FAIL.
- [ ] **Step 3: 구현.**
- [ ] **Step 4: 통과 확인** — PASS. fixtures 빌드(`POSTS_DIR=__tests__/fixtures/posts npm run build:production`) 뒤 `grep -o '<title>[^<]*</title>' out/rss.xml | head -1` → `<title>Joonangler.log</title>`. `npm run check:routes` → diff 없음.
- [ ] **Step 5: Commit** — `feat(meta): 사이트 이름 Joonangler, 블로그 이름 Joonangler.log, 아이콘·OG·404`

### Task 16: 첫 묶음 검증

설계 §15를 이 묶음의 화면에 돌린다. 결과는 PR 본문에 적는다.

**Files:**
- Create: `e2e/widths.spec.ts`

- [ ] **Step 1: 폭 시험(실패를 먼저)** — `e2e/widths.spec.ts`: 320·390·768·1024·1440px마다 `/`, `/services/`, `/services/web-app-fix/`, `/contact/`, `/posts/`에서 `document.documentElement.scrollWidth <= window.innerWidth`이고 `<h1>`이 보인다. 이 시험은 Task 10~14 뒤에 쓰므로, 공허하지 않음을 보이려고 임시로 홈 문장에 `white-space: nowrap`을 걸어 320px에서 FAIL을 본 뒤 되돌린다.
- [ ] **Step 2: e2e 전체** — `npx playwright test --project=chromium e2e/darkmode.spec.ts e2e/conditions.spec.ts e2e/no-js.spec.ts e2e/motion.spec.ts e2e/hover.spec.ts e2e/widths.spec.ts e2e/homepage.spec.ts` → 전부 PASS. (`post`·`search`·`responsive` spec은 넷째 묶음에서 맞춘다. 이 묶음에서 깨지면 깨진 목록을 PR에 적는다.)
- [ ] **Step 3: 글 주소** — `npm run check:routes` → diff 없음, rc 0.
- [ ] **Step 4: 모션 줄이기·자바스크립트 끔을 눈으로** — 운영 빌드(`npm run build:production`)를 `python3 -m http.server 4173 -d out`으로 띄우고 브라우저 개발자 도구에서 `prefers-reduced-motion: reduce`와 자바스크립트 끔을 각각 켜고 `/`·`/services/web-app-fix/`·`/contact/`를 본다. 화면 캡처를 PR에 붙인다.
- [ ] **Step 5: 움직임 녹화** — 홈 첫 화면 처음 4초를 녹화(또는 성능 기록)하고 볼 곳 둘을 본다: 문장이 자리 잡는 순간과 점이 모이기 시작하는 순간이 한 동작으로 읽히는지, 옮겨 갈 때 튀는 점이 없는지.
- [ ] **Step 6: Lighthouse** — 위 정적 서버로 `/`와 `/services/web-app-fix/`를 모바일·데스크톱 각각. 접근성 점수와 LCP·CLS·TBT를 PR에 적는다. 「좋음」(LCP ≤ 2.5s, CLS ≤ 0.1)을 넘으면 까닭을 적는다. LCP 요소가 `<h1>`인지 본다(캔버스가 아니어야 한다).
- [ ] **Step 7: 다듬기 검토** — `make-interfaces-feel-better` full 모드로 홈·서비스별·문의를 보고, 고친 것과 남긴 것을 PR에 적는다.
- [ ] **Step 8: 게이트** — Node 24로 `npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production` → rc 0. 그다음 `/gate`.
- [ ] **Step 9: 공개 전 목록 갱신** — `grep -rn "provisional: true" content/`의 결과를 PR 본문에 그대로 붙인다(공개 전 0이 되어야 하는 목록).

---

## 실기기로 볼 축 (구현 때)

이 묶음은 화면을 바꾸므로, 브리프 1b·1c의 완료 전에 실제 휴대폰에서 본다. e2e의 터치 흉내는 기기의 실제 반응을 대신하지 못한다.

1. **터치에서의 올림 효과** — 카드와 가격 줄을 눌렀을 때 고리가 진해진 채 남지 않는지(iOS Safari, Android Chrome). 누름(`scale(0.97)`)은 보여야 한다.
2. **휴대폰에서 캔버스의 움직임** — 첫 화면에서 끊김이 없는지, 기기가 뜨거워지거나 스크롤이 무거워지지 않는지, 화면을 아래로 내리면 멈추는지, 다른 앱에 갔다 오면 이어지는지.
3. **화면 회전과 주소창** — 세로↔가로 회전, 스크롤로 주소창이 접힐 때 점이 튀지 않는지(Review Focus 4).
4. **좁은 화면의 메뉴** — 펼친 탭의 높이 48px, 누르는 자리가 44px 이상인지.

---

## 이어지는 묶음 (제목과 의존만)

- **묶음 2 — 작업 목록과 사례 페이지** (`/work/`, `/work/<slug>/`, 「이 홈페이지」 사례 캡처, `isNavReady('work')` 켬). 의존: Task 5·7·11·12.
- **묶음 3 — 소개** (`/about/`, 채널마다 한 줄, `isNavReady('about')` 켬). 의존: Task 5·12. 소개 문안 확정.
- **묶음 4 — 블로그 구역 맞춤** (블로그 색 변수 값을 새 체계로, 본문 링크 밑줄, 단추·배지, 코드 색에서 밝은 쪽 걷기, 수식, 영어 문구, `post`·`search`·`responsive` e2e). 의존: Task 3·4·6. 탭 사이 전환은 이 묶음 뒤에 정한다.
- **공개** — `release/homepage → main` PR. 의존: 묶음 1과 4(공개의 최소, 확정). 확인: `grep -rn "provisional: true" content/`가 빈 것, `.env.production`의 이름·메일 값(스레드 주소는 계정이 정해졌을 때만), 설정 파일에 example.com이 남아 있지 않다(`grep -rn "example.com" .env.production`이 빈 것 — 메일은 공개 직전에 실제 주소로 바꾸고, 자리 주소를 단정하는 `__tests__/lib/contact-email.test.ts`의 두 시험도 함께 고친다), 게시된 글이 0편이면 그 사실을 확인했는지, `npm run check:routes` diff 없음.

---

## 부록 A. 모양 일곱의 좌표 (시안의 값)

`P(o, x, y, a = 0.9, r = 1.05)`는 점 하나를 더한다(`a` 밝기, `r` 반지름). `STEP`은 `stepFor(box.w)`. 모든 함수는 상자 `b = { x, y, w, h }`를 받아 점 배열을 낸다.

```js
function seg(o, x1, y1, x2, y2, a, end = true) {
  const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / STEP))
  for (let i = 0; i < n + (end ? 1 : 0); i++) P(o, x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, a)
}
function ell(o, cx, cy, rx, ry, a0, a1, a) {
  const n = Math.max(3, Math.round(Math.abs(a1 - a0) * (rx + ry) / 2 / STEP))
  for (let i = 0; i < n; i++) { const th = a0 + (a1 - a0) * i / n; P(o, cx + Math.cos(th) * rx, cy + Math.sin(th) * ry, a) }
}
const arc = (o, cx, cy, r, a0, a1, a) => ell(o, cx, cy, r, r, a0, a1, a)
const ring = (o, cx, cy, r, a) => ell(o, cx, cy, r, r, 0, TAU, a)
function curve(o, x0, y0, x1, y1, x2, y2, x3, y3, a) { // 3차 베지어를 STEP 간격으로 (90분할)
  let px = x0, py = y0, acc = 0; P(o, x0, y0, a)
  for (let i = 1; i <= 90; i++) {
    const s = i / 90, m = 1 - s
    const X = m*m*m*x0 + 3*m*m*s*x1 + 3*m*s*s*x2 + s*s*s*x3, Y = m*m*m*y0 + 3*m*m*s*y1 + 3*m*s*s*y2 + s*s*s*y3
    acc += Math.hypot(X - px, Y - py); px = X; py = Y
    if (acc >= STEP) { P(o, X, Y, a); acc = 0 }
  }
}
function rrect(o, x, y, w, h, r, a) {
  const q = Math.PI / 2
  seg(o, x + r, y, x + w - r, y, a, false); arc(o, x + w - r, y + r, r, -q, 0, a)
  seg(o, x + w, y + r, x + w, y + h - r, a, false); arc(o, x + w - r, y + h - r, r, 0, q, a)
  seg(o, x + w - r, y + h, x + r, y + h, a, false); arc(o, x + r, y + h - r, r, q, 2 * q, a)
  seg(o, x, y + h - r, x, y + r, a, false); arc(o, x + r, y + r, r, 2 * q, 3 * q, a)
}
function win(o, b) { // 웹 화면과 터미널이 함께 쓰는 창
  const w = Math.min(b.w, b.h * 1.42), h = w / 1.42, x = b.x + (b.w - w) / 2, y = b.y + (b.h - h) / 2, u = w / 100, bar = 8.5 * u
  rrect(o, x, y, w, h, 3.2 * u, 0.95)
  seg(o, x + STEP, y + bar, x + w - STEP, y + bar, 0.6)
  for (let i = 0; i < 3; i++) P(o, x + 4.5 * u + i * 3.2 * u, y + bar / 2, 0.95, 1.9)
  return { x, y, w, h, u, bar }
}
function shapeWeb(b) {
  const o = [], { x, y, w, h, u, bar } = win(o, b)
  seg(o, x + 30 * u, y + bar / 2, x + 70 * u, y + bar / 2, 0.4)
  const sbx = x + 25 * u
  seg(o, sbx, y + bar + STEP, sbx, y + h - STEP, 0.5)
  for (let i = 0; i < 5; i++) seg(o, x + 4.5 * u, y + bar + 8 * u + i * 6 * u, x + (i % 2 ? 16 : 19.5) * u, y + bar + 8 * u + i * 6 * u, i === 0 ? 0.95 : 0.42)
  const mx = sbx + 6 * u, mw = w - 25 * u - 12 * u
  seg(o, mx, y + bar + 9 * u, mx + mw * 0.46, y + bar + 9 * u, 0.95)
  seg(o, mx, y + bar + 14 * u, mx + mw * 0.7, y + bar + 14 * u, 0.4)
  const cy = y + bar + 21 * u, cg = 3.5 * u, cw = (mw - cg * 2) / 3, ch = 20 * u
  for (let i = 0; i < 3; i++) rrect(o, mx + i * (cw + cg), cy, cw, ch, 2 * u, 0.72)
  seg(o, mx, cy + ch + 7 * u, mx + mw, cy + ch + 7 * u, 0.4)
  seg(o, mx, cy + ch + 12 * u, mx + mw * 0.62, cy + ch + 12 * u, 0.4)
  return o
}
function shapeApp(b) {
  const o = [], h = Math.min(b.h, b.w * 1.5), w = h / 2.02
  const x = b.x + (b.w - w) / 2, y = b.y + (b.h - h) / 2, u = w / 100
  rrect(o, x, y, w, h, 14 * u, 0.95)
  seg(o, x + 38 * u, y + 8 * u, x + 62 * u, y + 8 * u, 0.9)
  seg(o, x + 10 * u, y + 27 * u, x + 52 * u, y + 27 * u, 0.95)
  seg(o, x + 10 * u, y + 35 * u, x + 74 * u, y + 35 * u, 0.4)
  rrect(o, x + 10 * u, y + 45 * u, 80 * u, 52 * u, 6 * u, 0.72)
  for (let i = 0; i < 3; i++) {
    const ry = y + 113 * u + i * 18 * u
    ring(o, x + 15 * u, ry, 5 * u, 0.7)
    seg(o, x + 27 * u, ry - 2.6 * u, x + 72 * u, ry - 2.6 * u, 0.85)
    seg(o, x + 27 * u, ry + 3.6 * u, x + 56 * u, ry + 3.6 * u, 0.4)
  }
  seg(o, x + STEP, y + 177 * u, x + w - STEP, y + 177 * u, 0.5)
  for (let i = 0; i < 4; i++) P(o, x + 20 * u + i * 20 * u, y + 189.5 * u, i === 0 ? 0.95 : 0.5, 2.2)
  return o
}
function shapeTerm(b) {
  const o = [], { x, y, u, bar } = win(o, b), L = x + 7 * u, r0 = y + bar + 10 * u
  const prompt = (yy) => { seg(o, L, yy - 2.4 * u, L + 3 * u, yy, 0.95, false); seg(o, L + 3 * u, yy, L, yy + 2.4 * u, 0.95) }
  prompt(r0); seg(o, L + 8 * u, r0, L + 44 * u, r0, 0.95)
  seg(o, L + 8 * u, r0 + 7 * u, L + 74 * u, r0 + 7 * u, 0.4)
  seg(o, L + 8 * u, r0 + 13 * u, L + 58 * u, r0 + 13 * u, 0.4)
  seg(o, L + 8 * u, r0 + 19 * u, L + 67 * u, r0 + 19 * u, 0.4)
  prompt(r0 + 28 * u); seg(o, L + 8 * u, r0 + 28 * u, L + 31 * u, r0 + 28 * u, 0.95)
  seg(o, L + 8 * u, r0 + 35 * u, L + 52 * u, r0 + 35 * u, 0.4)
  prompt(r0 + 44 * u)
  for (let i = 0; i < 4; i++) seg(o, L + 8 * u, r0 + 41.6 * u + i * 1.6 * u, L + 11.5 * u, r0 + 41.6 * u + i * 1.6 * u, 0.95)
  return o
}
function shapeGit(b) {
  const o = [], w = Math.min(b.w, b.h * 1.6), u = w / 100, x = b.x + (b.w - w) / 2, my = b.y + b.h / 2 + 1 * u
  const up = my - 22 * u, dn = my + 20 * u
  seg(o, x + 2 * u, my, x + 98 * u, my, 0.7)
  curve(o, x + 22 * u, my, x + 30 * u, my, x + 30 * u, up, x + 38 * u, up, 0.7)
  seg(o, x + 38 * u, up, x + 62 * u, up, 0.7)
  curve(o, x + 62 * u, up, x + 70 * u, up, x + 70 * u, my, x + 78 * u, my, 0.7)
  curve(o, x + 46 * u, my, x + 53 * u, my, x + 53 * u, dn, x + 60 * u, dn, 0.5)
  seg(o, x + 60 * u, dn, x + 92 * u, dn, 0.5)
  for (const v of [8, 22, 46, 78, 94]) { ring(o, x + v * u, my, 2.8 * u, 0.95); P(o, x + v * u, my, 0.95, 2.4) }
  for (const v of [42, 58]) { ring(o, x + v * u, up, 2.8 * u, 0.9); P(o, x + v * u, up, 0.9, 2.4) }
  for (const v of [68, 86]) ring(o, x + v * u, dn, 2.8 * u, 0.7)
  return o
}
function shapePost(b) {
  const o = [], h = Math.min(b.h, b.w * 1.25), w = h * 0.76, x = b.x + (b.w - w) / 2, y = b.y + (b.h - h) / 2, u = w / 100
  const c = 14 * u, r = 4 * u, q = Math.PI / 2, hh = h / u
  seg(o, x + r, y, x + w - c, y, 0.95, false); seg(o, x + w - c, y, x + w, y + c, 0.95, false)
  seg(o, x + w, y + c, x + w, y + h - r, 0.95, false); arc(o, x + w - r, y + h - r, r, 0, q, 0.95)
  seg(o, x + w - r, y + h, x + r, y + h, 0.95, false); arc(o, x + r, y + h - r, r, q, 2 * q, 0.95)
  seg(o, x, y + h - r, x, y + r, 0.95, false); arc(o, x + r, y + r, r, 2 * q, 3 * q, 0.95)
  seg(o, x + w - c, y + STEP, x + w - c, y + c, 0.55, false); seg(o, x + w - c, y + c, x + w - STEP, y + c, 0.55)
  seg(o, x + 12 * u, y + 22 * u, x + 68 * u, y + 22 * u, 0.95)
  seg(o, x + 12 * u, y + 30 * u, x + 50 * u, y + 30 * u, 0.95)
  ring(o, x + 14.6 * u, y + 41 * u, 2.6 * u, 0.6); seg(o, x + 21 * u, y + 41 * u, x + 44 * u, y + 41 * u, 0.4)
  for (let i = 0; i < 4; i++) seg(o, x + 12 * u, y + (52 + i * 7) * u, x + (i === 3 ? 60 : 88) * u, y + (52 + i * 7) * u, 0.4)
  rrect(o, x + 12 * u, y + 82 * u, 76 * u, hh * u - 82 * u - 24 * u, 3 * u, 0.72)
  seg(o, x + 12 * u, y + (hh - 15) * u, x + 88 * u, y + (hh - 15) * u, 0.4)
  seg(o, x + 12 * u, y + (hh - 8) * u, x + 66 * u, y + (hh - 8) * u, 0.4)
  return o
}
function shapeVideo(b) {
  const o = [], w = Math.min(b.w, b.h * 1.2), u = w / 100, ph = w * 9 / 16, tot = ph + 20 * u
  const x = b.x + (b.w - w) / 2, y = b.y + (b.h - tot) / 2, cx = x + w / 2, cy = y + ph / 2 - 2 * u
  rrect(o, x, y, w, ph, 3.5 * u, 0.95)
  ring(o, cx, cy, 10 * u, 0.8)
  seg(o, cx - 3.4 * u, cy - 5.2 * u, cx + 5.6 * u, cy, 0.95, false)
  seg(o, cx + 5.6 * u, cy, cx - 3.4 * u, cy + 5.2 * u, 0.95, false)
  seg(o, cx - 3.4 * u, cy + 5.2 * u, cx - 3.4 * u, cy - 5.2 * u, 0.95, false)
  const py = y + ph - 7 * u
  seg(o, x + 5 * u, py, x + 37 * u, py, 0.95); P(o, x + 38.5 * u, py, 1, 2.8); seg(o, x + 41 * u, py, x + 95 * u, py, 0.35)
  const by = y + ph + 11 * u
  ring(o, x + 6 * u, by + 2 * u, 5 * u, 0.7)
  seg(o, x + 15 * u, by - 1 * u, x + 74 * u, by - 1 * u, 0.9)
  seg(o, x + 15 * u, by + 6 * u, x + 48 * u, by + 6 * u, 0.4)
  return o
}
function shapeToon(b) {
  const o = [], s = Math.min(b.w, b.h * 0.9), u = s / 100, x = b.x + (b.w - s) / 2, y = b.y + (b.h - s - 9 * u) / 2
  rrect(o, x, y, s, s, 4 * u, 0.95)
  seg(o, x + STEP, y + 54 * u, x + s - STEP, y + 54 * u, 0.6)
  seg(o, x + 46 * u, y + STEP, x + 46 * u, y + 54 * u - STEP, 0.6)
  ring(o, x + 23 * u, y + 25 * u, 8 * u, 0.9)
  P(o, x + 20 * u, y + 24 * u, 0.95, 1.7); P(o, x + 26 * u, y + 24 * u, 0.95, 1.7)
  ell(o, x + 23 * u, y + 54 * u, 15 * u, 17 * u, Math.PI + 0.12, TAU - 0.12, 0.9)
  ell(o, x + 73 * u, y + 24 * u, 20 * u, 12.5 * u, 0, TAU, 0.9)
  seg(o, x + 61 * u, y + 35 * u, x + 55 * u, y + 46 * u, 0.9, false); seg(o, x + 55 * u, y + 46 * u, x + 68 * u, y + 36.5 * u, 0.9, false)
  seg(o, x + 61 * u, y + 21 * u, x + 85 * u, y + 21 * u, 0.5); seg(o, x + 64 * u, y + 27.5 * u, x + 81 * u, y + 27.5 * u, 0.5)
  ring(o, x + 22 * u, y + 76 * u, 7 * u, 0.9); ring(o, x + 78 * u, y + 76 * u, 7 * u, 0.9)
  ell(o, x + 22 * u, y + 100 * u, 13 * u, 14 * u, Math.PI + 0.25, TAU - 0.25, 0.9)
  ell(o, x + 78 * u, y + 100 * u, 13 * u, 14 * u, Math.PI + 0.25, TAU - 0.25, 0.9)
  for (let k = 0; k < 8; k++) { const th = k * TAU / 8 + 0.2; seg(o, x + 50 * u + Math.cos(th) * 4.5 * u, y + 76 * u + Math.sin(th) * 4.5 * u, x + 50 * u + Math.cos(th) * 10 * u, y + 76 * u + Math.sin(th) * 10 * u, 0.7) }
  for (let i = 0; i < 5; i++) P(o, x + s / 2 + (i - 2) * 4.6 * u, y + s + 6.5 * u, i === 1 ? 1 : 0.45, 2.2)
  return o
}
// 차례: web, app, term, git, post, video, toon
```

## 부록 B. 움직임과 문안의 값

**시간표와 섞기**
- `PHASE_MS`(Task 8). 기다림이 끝나면 `go(0, gather)`. 옮겨 감이 끝나면 목표가 `-1`이면 떠돎, 아니면 머묾. 머묾이 끝나면 다음 모양으로 `morph`, 일곱째 뒤에는 `go(-1, scatter)`. 떠돎이 끝나면 `go(0, gather)`.
- 점마다 진행 `e = easeInOutCubic(clamp((F - p.delay * spread) / (1 - spread)))`, `F = 경과 / 길이`. `easeInOutCubic(p) = p < 0.5 ? 4p³ : 1 - (-2p + 2)³ / 2`.
- 출발: `go`를 부를 때마다 `s* = c*`(지금 그려진 자리·반지름·밝기)로 두고 목표로 섞는다.

**점**
- 배경의 점: `backgroundCount(W, H)`개, `x = rng()·W`, `y = rng()·H`, 깊이 `z = 0.2 + 0.8·rng()`, 위상 `ph = rng()·2π`, 흐름 `vx, vy = (rng() - 0.5)·0.014`. 반지름 `0.5 + 1.25z`, 밝기 `(0.2 + 0.8z)·(0.72 + 0.28·sin(t·9 + ph))·0.95`.
- 모이는 점: 개수는 가장 큰 모양의 점 개수. 처음 자리 `x = W·(0.28 + 0.72·rng())`, `y = rng()·H`, 흐름 `(rng() - 0.5)·0.02`. 자리가 없을 때는 배경처럼 그리되 반지름 `0.5 + z`, 밝기 계수 `0.55`. 자리가 있으면 목표 `(tx + ox·0.2 + sin(t·14 + ph)·0.6, ty + oy·0.2 + cos(t·11 + ph)·0.6)`, 반지름·밝기는 모양 점의 `r`·`a`.
- 흐름은 `x += vx·dt·z`, 화면 밖 20px를 넘으면 반대편으로.
- 시간 `t += dt·0.00018`, `dt`는 50ms까지 자른다.
- 포인터: 밀림 `ox = pointerOffset(ptr.x, W)`, `oy = pointerOffset(ptr.y, H)`, 배경의 점은 `·z`만큼. 포인터를 따라가는 정도 `k = 1 - 0.001^(dt / 900)`. 처음 자리 `(0.72W, 0.45H)`.
- 캔버스: `devicePixelRatio`는 2까지, `setTransform(dpr, 0, 0, dpr, 0, 0)`.
- 모이는 자리: 오른쪽 칸의 `slot` 상자(첫 화면 기준 좌표). `aspect-ratio: 1 / 0.86; max-height: 62svh`, 860px 아래 `4 / 3; 38svh`.

**첫 화면 문안과 등장**
- `HOME_HERO.lines = [['만들고,'], ['내놓고,'], ['수익까지', '도전합니다']]`(끝에 마침표 없음), `sub = 'AI와 함께 답을 찾아가며, 그 과정을 기록으로 남깁니다.'`
- 셋째 줄은 넓은 화면에서 왼쪽 칸보다 길어 「수익까지」와 「도전합니다」 두 줄로 넘어간다. 시안에서 보고 고른 모양이라 그대로 둔다 — `white-space: nowrap`이나 글자 크기 줄이기로 막지 않는다.
- `WORD_DELAYS = [0, 90, 170, 240, 300, 350, 390]` — 낱말 k번째는 `WORD_DELAYS[min(k, 6)]`ms(서비스 첫 화면의 낱말 수가 더 많을 때를 위해 일곱까지).

**진행 순서(임시 서비스)와 「일하는 방식」의 자리 문안**
1. 결제 전에 진단합니다 — 증상 화면과 오류 메시지, 소스를 보고 범위와 금액을 먼저 알려 드립니다.
2. 복사본에서 작업합니다 — 운영 중인 데이터와 결제 기능은 승인 없이 손대지 않습니다.
3. 고친 내용을 문서로 드립니다 — 어디를 왜 바꿨는지, 다시 확인하는 방법을 적습니다.
4. 권한은 끝나면 돌려 드립니다 — 공유받은 키와 비밀번호는 작업 뒤 새로 발급하시기를 권합니다.

「일하는 방식」 넷의 제목은 설계 §6(결제 전에 진단 · 범위와 금액은 글로 · 복사본에서 작업 · 문서와 권한 반납), 본문은 위 문장을 자리 문안으로 쓴다(「범위와 금액은 글로」는 1의 문장을 나눠 쓴다). 전부 `provisional: true`.

## 부록 C. 화면 값 (시안의 CSS)

| 자리 | 값 |
|---|---|
| 본문 | `font-size: 17px; line-height: 1.6; word-break: keep-all`. 제목 `text-wrap: balance`, 문단 `text-wrap: pretty`. 초점 `outline: 2px solid var(--ink); outline-offset: 3px; border-radius: 6px` |
| 감싸개 | `max-width: var(--max); margin: 0 auto; padding: 0 var(--pad)` |
| 내비 | `position: fixed; top: 16px; left: 50%; translate: -50% 0; z-index: 20; display: flex; gap: 4px; padding: 6px; border-radius: 999px; background: color-mix(in srgb, var(--bg) 72%, transparent); backdrop-filter: blur(14px); box-shadow: var(--ring-shadow)`, 등장 `fade 500ms`. 이름 `font-weight: 650; letter-spacing: -0.02em; padding: 0 14px`. 탭 `height: 40px; padding: 0 14px; border-radius: 999px; font-size: 15px; color: var(--ink-2)`, 올림·현재는 `color: var(--ink)`(올림은 `background: var(--surface)` 더함), `transition: color 150ms, background-color 150ms` |
| 내비 860px 아래 | `left: 16px; right: 16px; translate: none; justify-content: space-between`. 「메뉴」 단추 보임. 탭 묶음 `position: absolute; top: calc(100% + 8px); left: 0; right: 0; flex-direction: column; gap: 2px; padding: 8px; border-radius: 22px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(14px); box-shadow: var(--ring-shadow)`, 탭 `height: 48px; font-size: 17px`. 접힘은 `.js` 아래에서만 |
| 단추 | `height: 48px; padding: 0 22px; border-radius: 999px; font-size: 16px; font-weight: 550; letter-spacing: -0.01em; transition: transform 160ms var(--ease-out), background-color 150ms, box-shadow 150ms`, 누름 `scale(0.97)`. 주 단추 `background: var(--ink); color: var(--bg)`, 올림 `color-mix(in srgb, var(--ink) 86%, var(--bg))`. 조용한 단추 `background: var(--surface); color: var(--ink); box-shadow: var(--ring-shadow)`, 올림 `var(--ring-shadow-hover)` |
| 홈 첫 화면 | `.hero { position: relative; min-height: 100svh; display: flex; overflow: clip }`. 안쪽 `display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 72px); align-items: center; padding-top: 112px; padding-bottom: clamp(48px, 8vh, 96px)`. 문장 크기 `clamp(40px, 6.2vw, 92px)`, `<h1> line-height: 1.08; letter-spacing: -0.045em; font-weight: 600`, 줄마다 `display: block`, 낱말 `display: inline-block`. 보조 문장 `clamp(17px, 1.5vw, 20px); line-height: 1.6; color: var(--ink-2); max-width: 27em; margin-top: 28px; letter-spacing: -0.01em` |
| 홈 첫 화면 860px 아래 | `grid-template-columns: 1fr; align-items: end; gap: 28px; padding-top: 88px; padding-bottom: 72px`, 오른쪽 칸 `order: -1` |
| 등장 | 낱말 `animation: rise 640ms var(--ease-out) both; animation-delay: calc(var(--d) * 1ms)`, `@keyframes rise { from { opacity: 0; transform: translateY(18px) } }`. 보조 문장 `rise-s 520ms var(--ease-out) 460ms both`(`translateY(8px)`). 캔버스 `fade 1600ms`, 멈춤 단추 `fade 600ms ease 700ms both`. 모션 줄이기: 낱말·보조 문장 `fade 300ms ease both; animation-delay: 0ms` |
| 캔버스 가림 `home` | `mask-image: radial-gradient(ellipse 62% 78% at 0% 52%, rgb(0 0 0 / 0.26) 0 34%, #000 88%)`, 860px 아래 `linear-gradient(to top, rgb(0 0 0 / 0.26) 34%, #000 62%)` |
| 캔버스 가림 `service`·`band` | `radial-gradient(ellipse 80% 86% at 0% 100%, rgb(0 0 0 / 0.26) 0 24%, #000 80%)`, 760px 아래 `linear-gradient(to top, rgb(0 0 0 / 0.26) 34%, #000 82%)` |
| 멈춤 단추 | `position: absolute; right: var(--pad); bottom: 24px; z-index: 2; height: 40px; padding: 0 14px 0 12px; gap: 8px; border-radius: 999px; background: var(--surface); color: var(--ink-2); font-size: 14px; box-shadow: var(--ring-shadow)`, 그림 14px(멈춤: 막대 둘, 재생: 세모) |
| 구역 | `section { padding: clamp(88px, 13vw, 168px) 0 0 }`, 제목 `clamp(28px, 3.4vw, 44px); letter-spacing: -0.035em; line-height: 1.15`. 머리 `margin-bottom: clamp(28px, 4vw, 48px); display: flex; align-items: end; justify-content: space-between; gap: 24px; flex-wrap: wrap`. 「전체 보기」 `color: var(--ink-2); font-size: 16px; text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 4px`. `main { padding-bottom: clamp(88px, 12vw, 150px) }` |
| 스크롤 등장 | `.js .reveal { clip-path: inset(0 0 100% 0); transition: clip-path 620ms var(--ease-in-out) }` → `.is-in { clip-path: inset(0 0 0 0) }`. `.js .rise-in { opacity: 0; transform: translateY(10px); transition: opacity 520ms var(--ease-out), transform 520ms var(--ease-out); transition-delay: calc(var(--i, 0) * 55ms + 120ms) }` → `.is-in { opacity: 1; transform: none }`. 모션 줄이기: `.reveal` 가림 없음, `.rise-in`은 `opacity 250ms`만 |
| 카드 | `display: block; padding: 8px; border-radius: 24px; background: var(--surface); box-shadow: var(--ring-shadow); transition: box-shadow 200ms`, 올림 `var(--ring-shadow-hover)`. 판 `aspect-ratio: 16 / 10; border-radius: 16px; outline: 1px solid var(--img-outline); outline-offset: -1px; overflow: hidden`. 설명 `padding: 18px 12px 12px`, 글 `color: var(--ink-2); font-size: 16px` |
| 작업 카드 | 묶음 `grid-template-columns: 1.5fr 1fr; gap: 20px`(하나면 한 칸 전체). 판 `background: #0d0d0d`, 캡처 `object-fit: cover; object-position: left top; transition: transform 500ms var(--ease-out)`, 올림 `scale(1.03)`. 이름 `21px; letter-spacing: -0.025em` |
| 서비스 카드 | 묶음 `repeat(3, minmax(0, 1fr)); gap: 20px`. 판 `background: var(--bg); padding: clamp(18px, 2vw, 24px); display: flex; flex-direction: column; justify-content: space-between`. 시작 가격 `color: var(--ink-2); font-size: 16px; tabular-nums`. 이름 `clamp(24px, 2.3vw, 31px); letter-spacing: -0.035em; line-height: 1.18` |
| 기록 줄 | `ul { border-bottom: 1px solid var(--line) }`, 줄 `display: grid; grid-template-columns: 7.5em minmax(0, 1fr) auto; gap: 20px; align-items: baseline; padding: 22px 14px; margin: 0 -14px; border-top: 1px solid var(--line)`, 올림 `background: var(--surface)`(120ms). 날짜 `color: var(--ink-3); 15px; tabular-nums`, 제목 `20px; 600; -0.025em`, 시리즈 `color: var(--ink-2); 15px`. 860px 아래 `grid-template-columns: 1fr auto`, 제목은 둘째 줄 전체 |
| 가격 줄 | 줄 `grid-template-columns: minmax(9em, 1fr) minmax(0, 2.2fr) 5em 7.5em; gap: 20px; padding: 22px 14px; margin: 0 -14px; border-top: 1px solid var(--line)`. 이름 `600; 19px; -0.02em`, 범위·날 `color: var(--ink-2)`, 금액 `text-align: right; 19px; 600; tabular-nums`. 덧말 `color: var(--ink-2); margin-top: 18px; 16px`. 760px 아래 `grid-template-columns: 1fr auto`, 범위는 둘째 줄 전체, 날은 셋째 줄 |
| 진행 순서 | `ol { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 56px }`, 줄 `padding: 24px 0 26px; border-top: 1px solid var(--line); grid-template-columns: 2.2em 1fr`, 번호 `color: var(--ink-3); 600; tabular-nums`, 제목 `19px`, 글 `color: var(--ink-2); 16px; margin-top: 6px`. 760px 아래 한 칸 |
| 서비스 첫 화면 | 안쪽 `flex-direction: column; justify-content: flex-end; padding-bottom: clamp(72px, 12vh, 132px)`. 문장 `max-width: 15.5em; font-size: clamp(36px, 5.6vw, 80px)`, `<h1> line-height: 1.1; letter-spacing: -0.04em`. 보조 문장 `max-width: 30em; margin-top: 28px`. 단추 `display: flex; flex-wrap: wrap; gap: 10px; margin-top: 36px`(등장 `rise-xs 520ms 500ms`, 6px). 760px 아래 멈춤 단추 `bottom: 76px` |
| 문의 한 줄 | 제목 `clamp(32px, 4.6vw, 64px); letter-spacing: -0.04em; line-height: 1.1; max-width: 13em`, 아래 `margin-top: 36px; gap: 10px 22px`. 채널 `color: var(--ink-2); 16px`, 밑줄 `var(--line)`, 올림 `color: var(--ink)` |
| 바닥 | `border-top: 1px solid var(--line); padding: 32px 0 150px; color: var(--ink-2); font-size: 15px`, 한 줄 `display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 14px 32px`. 이름 `color: var(--ink); 600; margin-right: 12px`, 저작권 `color: var(--ink-3); 14px`, 링크 `gap: 6px 20px`, 올림 `color: var(--ink)` |
