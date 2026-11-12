# 홈페이지 넷째 묶음 — 블로그 구역 맞춤 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그 화면(글 목록·글·시리즈·태그·검색·빈 상태)을 설계 §12의 색·서체·모양으로 갈아 끼우고, 남은 영어 문구를 한국어로 옮기고, 블로그 e2e를 새 화면에 맞춘다. 짜임과 컴포넌트 구조는 그대로 둔다(설계 §8 「어디까지 바꾸나」).

**Architecture:** 옛 색 변수(`--background` 계열 19개)는 지우고, Tailwind 테마의 같은 이름(`--color-background` 등)이 새 토큰(`--bg`·`--ink`·`--ink-2`·`--surface`·`--line`)을 직접 가리키게 한다. 그러면 옛 이름 클래스 139곳은 손대지 않고 새 값을 받는다. 색 이름을 직접 쓴 클래스 371곳은 역할 표(§1-2)대로 옛 이름 클래스로 바꾸고, 시험 하나(`no-named-colors`)가 다시 들어오지 못하게 막는다. 코드 강조는 어두운 테마 한 벌만 남긴다. e2e는 실제 글이 아니라 `e2e/fixtures/posts`를 읽는다.

**Tech Stack:** Next.js 16 App Router 정적 export · React 19 · TypeScript · Tailwind 4 · next-mdx-remote · rehype-pretty-code(Shiki) · rehype-katex · @giscus/react · vitest(jsdom) · Playwright(로컬, chromium).

**Spec:** `docs/superpowers/specs/2026-11-13-homepage-design.md`(추린 판). 이 묶음의 요건은 §8, 색·서체·접근성은 §12, 검증은 §15. 첫 묶음 계획 `docs/superpowers/plans/2026-11-13-homepage-1-skeleton-home-services.md`의 「Global Constraints」와 「맡긴 것의 선택」(토큰 이름, `hover-fine`, 시험을 나누는 기준, 모으는 브랜치와 그 CI)을 그대로 이어받는다.

---

## 0. 조사에서 나온 사실 (release/homepage 머리 b9cc2b5, 2026-11-13)

「지금 무엇이다」는 정적 빌드에서 잰 계산 스타일과 빌드 결과다. 실제 글이 0편이라, `__tests__/fixtures/posts`에 코드·수식·표·인용·구분선·링크·알림 상자를 담은 조사용 글 한 편을 더한 사본으로 빌드했다(사본은 저장소 밖, 커밋하지 않음). 화면 폭 1440px, Chromium.

| 볼 것 | 적용된 값 (실측) |
|---|---|
| 바탕 | **사이트 전체가 `#0a0a0a`다.** `body`의 `bg-background` = `hsl(0 0% 4%)`. 홈·서비스 화면도 같다(`--bg #000`은 카드 판 같은 몇 곳에만 칠해져 있다). `globals.css`의 `body { color: var(--foreground); background: var(--background) }`는 HSL 채널 값이 그대로 들어가 무효 선언이다 |
| 옛 색 변수 | 19개(`globals.css` `:root`·`.dark`). 이름 클래스로 **139곳**, 24파일(`text-muted-foreground` 41 · `text-foreground` 32 · `border-border` 7 · `bg-background` 7 · …). 어두운 쪽 값: 글자 `#ededed`, 보조 글자 `#94a3b8`(푸른 회색), 면·선 `#1d283a`(푸른 남색), 강조 `#3c83f6`(파랑) |
| 색 이름 클래스 | **371곳**, 17파일(gray 264 · blue 57 · yellow 19 · green 15 · red 12 · purple 2 · orange 2). 그중 `dark:` 붙은 것 186. 흰색·검정 직접 17곳. 많은 곳: `SeriesNav.tsx` 73(어디서도 그리지 않는 파일), `SeriesNavBottom` 56, `SeriesNavTop` 43, `Pagination` 37, `Callout` 32, `globals.css` 27, `MDXComponents` 26, `TagCloud` 25 |
| 기본 선 색 | 색을 안 준 `border`가 `#e5e7eb`(밝은 회색)다 — `@layer base`의 `border-color: var(--color-gray-200)` |
| 본문 링크 | `rgb(96 165 250)`(파랑), 밑줄 없음(`MDXLink`의 `text-blue-600 … dark:text-blue-400 hover:underline`이 `.prose a`를 덮는다) |
| 코드 강조 | `rehype-pretty-code` 테마 `{ dark: 'github-dark-dimmed', light: 'github-light' }`, `keepBackground: false`. 글자색은 `--shiki-dark` 변수(`.dark pre code span`). 코드 블록 바탕은 투명(본문 바탕 위), 머리는 `#111827`, 테두리 `#1f2937`. 테마의 글자색 11가지는 `#000`·`#0f0f0f`(면) 위에서 모두 4.5:1 이상(가장 낮은 `#768390` 4.95:1). 예외 하나 `#2d333b`(`markup.ignored`)는 자기 바탕 `#6cb6ff`를 가진 토큰이라 바탕 없이 그려지면 1.5:1이다 |
| 강조 줄 | `.highlighted` 노랑(`yellow-900/30` 바탕, `yellow-400` 왼쪽 막대) |
| 수식 | KaTeX는 글자색을 물려받는다(`#ededed`). **블록 수식이 넘치면 쪽 전체가 가로로 밀린다** — 긴 수식 하나로 320px에서 `scrollWidth`가 677px 넘쳤다(`.katex-display`에 `overflow` 없음). 1440px은 0 |
| 표·인용·구분선 | 표 선 `#374151`, 머리 바탕 `#1f2937`. 인용 글자 `#d1d5db`, 왼쪽 막대 4px `#374151`, `italic`(Pretendard에 기울임꼴이 없어 브라우저가 비스듬히 기울인다). 구분선 `#374151` |
| 알림 상자 | 네 종류가 파랑·노랑·빨강·초록 바탕과 막대 |
| 댓글 | `theme="dark"`, 바깥 테두리 `gray-200 / dark:gray-800`. 환경값이 없어 지금은 그리지 않는다 |
| 대비가 4.5:1에 못 미치는 글자 | 시리즈 내비의 「Part」 `#6b7280` on `#111827` = 3.67:1, 태그 구름의 가벼운 태그 `#6b7280` on `#121212` = 3.88:1 |
| 영어 문구 | 화면 글자·접근성 이름·`title`에 **58줄**(§1-6의 표. 같은 문구가 한 파일에 여럿이면 한 줄). 지금 운영 빌드(글 0편)에서 보이는 것만 해도 `/posts/`의 「All Posts · 0 posts published · Loading posts...」, `/series/`의 「No series found.」, `/tags/`의 「No tags found.」 |
| 목차 기준 | `HEADER_HEIGHT = 88`(내비 위 16 + 높이 52 + 여유 20). 떠 있는 내비의 아래 끝은 68px. 목차를 누르면 제목이 88px에 선다(맞다). 스크립트 없이 `#앵커`로 들어오면 `h2`~`h6`은 80px(`scroll-mt-20`)에 서지만 **`h1`은 `scroll-mt`가 없어 0~16px, 내비 밑에 가린다**. 데스크톱 목차 `sticky top-24`(96px)는 내비와 겹치지 않는다 |
| 404 메타 | `out/404.html`에 `robots`가 둘: Next가 넣는 `noindex`와 루트 메타의 `index, follow`. 글 0편 빌드의 `/posts/__placeholder__/`도 같다 |
| 스크립트 끈 상태 | **`/posts/`가 글 목록을 내지 않는다** — `PostListWithPagination`이 `useSearchParams`를 써서 정적 HTML에는 Suspense 대기 문구 「Loading posts...」만 있다(조사용 빌드, 글 8편). `/search/`는 「로딩 중...」에 머문다 |
| 블로그 e2e 여섯 건 | §1-8의 표. 여섯 모두 시험이 옛 화면을 기대하는 것이고 화면의 결함은 아니다. 또 e2e 개발 서버가 `content/drafts`(로컬 초안)를 읽어 결과가 기기마다 다르다 |
| 쓰이지 않는 것 | `prose-neutral`·`dark:prose-invert`는 typography 플러그인이 없어 아무 일도 하지 않는다. `SeriesNav.tsx`는 어디서도 그리지 않는다. `Button`은 쓰는 곳이 없다 |
| 화면 폭 | 조사용 글을 뺀 블로그 화면 아홉은 320~1440px에서 가로로 넘치지 않는다 |
| 강제 어두운 화면 | `<meta name="color-scheme">`·`theme-color`가 없다(`<html>`의 `color-scheme: dark` CSS만 있다) |

---

## 1. 맡긴 것의 선택

### 1-1. 옛 색 변수 → 새 토큰

`@theme`의 `--color-<이름>: hsl(var(--<이름>))` 19줄을 아래 값으로 바꾸고, `:root`·`.dark`의 옛 변수 정의 두 덩어리와 `body`의 무효 선언을 지운다. 새 토큰은 `rgb(… / α)`라 HSL 채널로 둘 수 없어서, 테마 쪽이 새 토큰을 직접 가리키게 한다. Tailwind 4의 `/90` 같은 불투명도 덧붙임은 `color-mix()`로 풀려 어떤 색 값과도 맞는다.

| 옛 변수 | 어두운 쪽 지금 값 | 새 값 | 까닭 |
|---|---|---|---|
| `background` | `#0a0a0a` | `var(--bg)` | 사이트 바탕 `#000`. 이것 하나로 사이트 전체의 `#0a0a0a`가 걷힌다 |
| `foreground` | `#ededed` | `var(--ink)` | 글자 흰색 |
| `card` | `#121212` | `var(--surface)` | 카드는 면(흰색 6%) |
| `card-foreground` | `#ededed` | `var(--ink)` | |
| `popover` | `#121212` | `var(--surface)` | 쓰는 곳 0. 이름은 남겨 둔다 |
| `popover-foreground` | `#ededed` | `var(--ink)` | 쓰는 곳 0 |
| `primary` | `#3c83f6` | `var(--ink)` | 강조색이 없다. 주 단추·현재 쪽·주 배지는 흰 면(설계 §8) |
| `primary-foreground` | `#fafafa` | `var(--bg)` | 흰 면 위 검은 글자 |
| `secondary` | `#1d283a` | `var(--surface)` | 태그 배지 = 면 |
| `secondary-foreground` | `#f8fafc` | `var(--ink)` | |
| `muted` | `#1d283a` | `var(--surface)` | 옅은 판 |
| `muted-foreground` | `#94a3b8` | `var(--ink-2)` | 보조 글자 흰색 64%. 푸른 기를 걷는다 |
| `accent` | `#1d283a` | `var(--surface)` | 올림 바탕 |
| `accent-foreground` | `#f8fafc` | `var(--ink)` | |
| `destructive` | `#811d1d` | `var(--ink)` | 쓰는 곳 0. 빨강을 남기지 않는다 |
| `destructive-foreground` | `#fafafa` | `var(--bg)` | 쓰는 곳 0 |
| `border` | `#1d283a` | `var(--line)` | 선 흰색 12% |
| `input` | `#1d283a` | `var(--line)` | 입력 칸 테두리 = 선 |
| `ring` | `#3c83f6` | `var(--ink)` | 초점 고리 흰색. 사이트 틀의 초점(`outline: 2px solid var(--ink)`)과 같다 |

더하는 것 둘: `@theme`에 `--color-ink-3: var(--ink-3)`(셋째 글자 클래스 `text-ink-3`이 필요하다. 옛 변수에는 셋째 단계가 없다), `@layer base`의 기본 선 색을 `var(--color-gray-200)` → `var(--line)`.

### 1-2. 색 이름을 직접 쓴 클래스를 정리하는 방법

`<html class="dark">`가 고정이라 `dark:` 쪽이 실제로 보이는 값이다. 한 요소의 `X-gray-N dark:X-gray-M` 짝을 **역할에 맞는 옛 이름 클래스 하나**로 바꾸고 `dark:` 색 변형은 남기지 않는다. 역할은 지금 보이는 쪽(`dark:`) 값으로 가른다.

| 지금 (보이는 쪽) | 역할 | 바꿀 클래스 |
|---|---|---|
| `text-gray-900`·`800` / `dark:text-gray-100`·`200` | 제목·본문 글자 | `text-foreground` |
| `text-gray-600`·`700` / `dark:text-gray-300`·`400` | 보조 글자 | `text-muted-foreground` |
| `text-gray-400`·`500` / `dark:text-gray-500` | 셋째 글자(번호·아이콘·꺾쇠) | `text-ink-3` |
| `bg-gray-50` / `dark:bg-gray-900`, `bg-white` / `dark:bg-gray-950` | 판 | 바깥 판 `bg-card`, 판 안의 머리는 바탕 없이 `border-b border-border` |
| `bg-gray-100`·`200` / `dark:bg-gray-800` | 옅은 면(표 머리, 인라인 코드, 진행 막대 트랙) | `bg-muted` |
| `border-gray-200`·`300` / `dark:border-gray-700`·`800`, `divide-gray-*` | 선 | `border-border`, `divide-border` |
| `hover:bg-white dark:hover:bg-gray-950`, `hover:bg-gray-100 dark:hover:bg-gray-800` | 올림 바탕 | `hover:bg-muted` |
| `text-blue-*`, `hover:text-blue-*` | 링크·현재 표시 | `text-foreground`(링크는 §1-3의 밑줄) |
| `bg-blue-500 text-white dark:bg-blue-600` | 현재 쪽 번호 | `bg-primary text-primary-foreground`(흰 면·검은 글자) |
| `text-green-*`·`text-red-*`(복사 상태) | 상태 | `text-foreground`. 상태는 아이콘(✓·✕)과 문구가 말한다 |
| `yellow`(강조 줄)·`orange`(강조 낱말) | 코드 강조 줄 | §1-4 |
| 알림 상자 네 색 | 알림 | §1-5 |

- **`components/post/SeriesNav.tsx`는 지운다.** 어디서도 그리지 않고(쓰는 곳은 `SeriesNavTop`·`SeriesNavBottom`의 설명 주석뿐) 371곳 가운데 73곳이 여기 있다. 남기면 아래 시험이 이 파일 때문에 서지 않는다.
- **`@theme`의 v3 색 목록(gray·red·orange·yellow·green·blue·purple, 77줄)은 지운다.** 쓰는 곳이 0이 되면 남길 까닭이 없다. 다시 들어오는 것은 시험이 막는다.
- **막는 시험** `__tests__/styles/no-named-colors.test.ts` — `app/**/*.{ts,tsx,css}`와 `components/**/*.{ts,tsx}`에서 `(bg|text|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|decoration|shadow)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}`과 `(bg|text|border)-(white|black)\b`를 찾아 빈 목록이어야 한다. Task 3~5가 차례로 대상을 넓힌다(아래 `NOT_YET`).
- 단추와 배지(설계 §8): `Badge`의 `secondary`(태그) = 면 + 흰 글자, `default` = 흰 면 + 검은 글자. `Button`·쪽 번호의 현재 칸도 같다. `ui/Card`는 테두리 대신 고리: `border border-border shadow-xs` → `shadow-[var(--ring-shadow)]`, 올림 `hover:shadow-md hover:border-foreground/20` → `hover:shadow-[var(--ring-shadow-hover)]`. 둥글기는 사이트 카드와 같은 `rounded-3xl`(24px). 쪽 번호 칸은 `rounded-full`.
- `ring-offset-2`가 있는 7곳(`CodeBlockHeader`, `Button`, `SearchBar`, `PostHeader`, `TableOfContents`)에 `ring-offset-background`를 더한다. Tailwind 기본 고리 사이 색이 흰색이라, 고리가 흰색이 되면 흰 띠 두 겹이 붙어 보인다.
- 올림 변형은 첫 묶음의 선택대로 블로그 컴포넌트의 `hover:`를 그대로 둔다. 다만 이번에 고치는 클래스 줄의 `transition-all`(5곳)은 바뀌는 속성(`transition-colors`·`transition-shadow`)으로 좁힌다.

### 1-3. 본문 링크와 본문 요소

| 요소 | 고른 것 | 까닭 |
|---|---|---|
| 본문 링크(`MDXLink`) | `text-foreground underline decoration-ink-3 decoration-1 underline-offset-4`, 올림 `hover:decoration-foreground`. 바깥 링크 아이콘과 「(새 탭에서 열림)」은 그대로 | 글자색이 본문과 같으므로 밑줄이 유일한 구분이다(WCAG 1.4.1). 사이트의 「전체 보기」는 밑줄이 선 색(12%)이지만 본문 속 링크는 더 진한 셋째 글자(50%)로 한다 |
| `.prose a` 규칙 | 파랑 `@apply` 줄을 지운다 | `MDXLink`가 한 곳에서 정한다 |
| 인라인 코드 | `bg-muted text-foreground` + `shadow-[inset_0_0_0_1px_var(--line)]` | 면 6%만으로는 검정 위에서 흐리다. 선 색 고리로 테두리를 그린다(새 값을 만들지 않는다) |
| 표 | 선 `border-border`, 머리 `bg-muted`, 머리 글자 `text-foreground`, 칸 글자 `text-foreground`. 감싼 `overflow-x-auto`는 그대로 | 선과 면 두 토큰으로 충분하다 |
| 인용 | 왼쪽 막대 `border-l-2 border-ink-3`, 글자 `text-muted-foreground`, **`italic`을 뺀다** | Pretendard에 기울임꼴이 없어 한글이 비스듬히 기울어 읽기 나쁘다. 막대는 선(12%)이면 거의 안 보여 셋째 글자 색 |
| 구분선 | `border-border` | 선 |
| 수식 | 글자색은 물려받는 그대로(`--ink`). `.katex-display { overflow-x: auto; overflow-y: hidden; padding-block: 2px }` | 넘치는 블록 수식이 쪽 전체를 밀지 않고 제 칸에서 가로로 밀리게 한다. 위아래 여백은 위첨자가 잘리지 않을 만큼만 |
| 제목 앵커 | `h1`~`h6` 모두 `scroll-mt-[88px]`(`HEADER_HEIGHT`) | 스크립트 없이 `#앵커`로 들어올 때 `h1`이 내비 밑에 가린다. 목차의 계산(88)과 앵커 이동(지금 80)을 한 값으로 맞춘다 |

### 1-4. 코드 강조

| 무엇 | 고른 것 | 까닭 |
|---|---|---|
| 밝은 쪽을 걷는 방법 | `rehypePrettyCodeOptions.theme`을 문자열 `'github-dark-dimmed'` 하나로. `globals.css`의 `pre code span { color: var(--shiki-light) }`와 `.dark pre code span { color: var(--shiki-dark) }`를 지운다 | 테마가 하나면 Shiki가 글자색을 `style="color:…"`로 바로 단다. 두 벌 변수와 그것을 고르는 규칙이 필요 없다 |
| 검정 바탕에서 쓸 테마 | **지금의 `github-dark-dimmed`를 그대로** | 글자색 11가지가 면 위에서 모두 4.5:1 이상이다(가장 낮은 4.95:1). 의존성을 바꾸지 않는다(테마는 `shiki` 안에 이미 있다). 같은 계열의 `github-dark`는 3.98:1, `min-dark`는 2.04:1인 색이 있다 |
| 코드 블록의 바탕과 고리 | 감싸개 `rounded-2xl bg-card shadow-[var(--ring-shadow)]`(테두리 없음), 머리는 바탕 없이 `border-b border-border`, 언어 이름 `text-ink-3`. `keepBackground: false`는 그대로(테마의 `#22272e` 바탕을 쓰지 않는다) | 사이트 카드와 같은 면 + 고리. 판 안쪽 둥글기는 카드 판과 같은 16px |
| 강조 줄·낱말 | `.highlighted` → `bg-muted` + `border-l-2 border-ink-3`, `.word-highlighted` → `bg-muted rounded-sm` + 선 색 고리 | 강조 줄은 「여기를 보라」는 표시라 색이 없어도 된다. 남기는 강조색은 문법 색뿐(설계 §8) |
| 줄 번호·스크롤바 | 줄 번호 `var(--ink-3)`, 스크롤바 막대 `var(--line)`·길 투명(`pre`와 `.toc-scrollbar` 둘 다) | 셋째 글자·선 |
| 자기 바탕을 가진 토큰 | `#2d333b` on `#6cb6ff`(`markup.ignored`)는 바탕이 버려지므로 대비 시험에서 따로 센다(아래 Task 5). 이 토큰은 diff·마크다운의 드문 범위라 고치지 않는다 | 바탕을 살리려면 `--shiki-dark-bg`를 따로 다뤄야 해 짜임이 커진다 |

### 1-5. 알림 상자(`Callout`)

네 종류 모두 `bg-card border-l-4 border-border`, 제목 `text-foreground`, 글 `text-muted-foreground`. 종류는 지금 있는 아이콘(ℹ️ ⚠️ ❌ ✅)과 제목이 구분한다. 까닭: 강조색이 없다(설계 §12-1). 상자 안 글자 대비가 면 위에서 8:1 남짓이다.

### 1-6. 영어 문구를 옮긴 표

블로그 화면에서 그려지는 것만 적었다. 「후보」는 뜻이 갈리는 곳이다(구현은 「옮긴 문구」를 쓰고, 다른 후보를 고르면 이 표를 고친다). 낱말은 블로그 둘째 줄 내비가 쓰는 「글」로 맞춘다.

| # | 파일 | 지금 | 옮긴 문구 | 후보 |
|---|---|---|---|---|
| 1 | `app/(blog)/posts/page.tsx` 메타(제목 둘) | All Posts | 글 | 모든 글 |
| 2 | 같은 파일 메타(설명 둘) | Browse all blog posts | 블로그의 모든 글 | |
| 3 | 같은 파일 `<h1>` | All Posts | 글 | 모든 글 |
| 4 | 같은 파일 | {n} post(s) published | 글 {n}편 | |
| 5 | 같은 파일 Suspense 대기 | Loading posts... | (지운다 — Task 8이 대기 자리에 첫 쪽 목록을 그린다) | |
| 6 | `components/post/PostListWithPagination.tsx` | No posts found. | 아직 올린 글이 없습니다 | 아직 글이 없습니다 |
| 7 | 같은 파일 | Showing {a}-{b} of {n} | 글 {n}편 중 {a}–{b} | |
| 8 | `components/post/PostList.tsx` 기본값 | No posts found. | 아직 올린 글이 없습니다 | |
| 9 | `app/(blog)/series/page.tsx` 메타(제목 둘)·`<h1>` | Series | 시리즈 | |
| 10 | 같은 파일 메타(설명 둘) | Browse post series | 글 시리즈 모음 | |
| 11 | 같은 파일 | Explore {n} post series | 시리즈 {n}개 | |
| 12 | 같은 파일 빈 상태 | No series found. | 아직 시리즈가 없습니다 | |
| 13 | `app/(blog)/tags/page.tsx` 메타(제목 둘)·`<h1>` | Tags | 태그 | |
| 14 | 같은 파일 메타(설명 둘) | Browse posts by tags | 태그로 글 찾기 | |
| 15 | 같은 파일 | Explore {n} tag(s) across all posts | 태그 {n}개 | |
| 16 | 같은 파일 `<h2>` | All Tags | 모든 태그 | 전체 태그 |
| 17 | 같은 파일 빈 상태 | No tags found. | 아직 태그가 없습니다 | |
| 18 | `components/ui/TagCloud.tsx` 빈 상태 | No tags yet | 아직 태그가 없습니다 | |
| 19 | 같은 파일 `title` | {n} post(s) | 글 {n}편 | |
| 20 | `lib/mdx.ts` `readingTime.text`(글 카드·글 머리) | {n} min read | 읽는 데 {n}분 | {n}분 |
| 21 | `components/post/PostHeader.tsx` | by {author} | 글쓴이 {author} | {author} |
| 22 | `components/series/SeriesCard.tsx` | {n} part(s) | {n}편 | |
| 23 | 같은 파일 | {m} min read | 읽는 데 {m}분 | {m}분 |
| 24 | 같은 파일 | Started | 시작 | 첫 글 |
| 25 | 같은 파일 | Updated | 최근 | 마지막 글, 갱신 |
| 26 | `components/post/SeriesNavTop.tsx` | Series | 시리즈 | |
| 27 | 같은 파일 | Part {i} / {n} | {i} / {n}편 | {n}편 중 {i}번째 |
| 28 | `SeriesNavTop`·`SeriesNavBottom` | View all posts in this series | 이 시리즈의 글 모두 보기 | |
| 29 | `SeriesNavTop`·`SeriesNavBottom` | Current post | 읽는 중 | 지금 글 |
| 30 | `components/post/SeriesNavBottom.tsx` | Previous | 이전 글 | |
| 31 | 같은 파일 | Next | 다음 글 | |
| 32 | 같은 파일 | Part {n} | {n}편 | |
| 33 | 같은 파일 | First post | 첫 글입니다 | |
| 34 | 같은 파일 | Last post | 마지막 글입니다 | |
| 35 | `components/post/TableOfContents.tsx`(둘) | On This Page | 목차 | |
| 36 | 같은 파일 `summary`의 `aria-label` | Toggle table of contents | (지운다 — 보이는 글자 「목차」가 이름이 된다) | 목차 펼치기 |
| 37 | 같은 파일 `<nav>`의 `aria-label`(둘) | Table of contents | 목차 | |
| 38 | `components/ui/Pagination.tsx` `aria-label` | Pagination | 페이지 이동 | 쪽 이동 |
| 39 | 같은 파일 | Previous page | 이전 페이지 | 이전 쪽 |
| 40 | 같은 파일 | Next page | 다음 페이지 | 다음 쪽 |
| 41 | 같은 파일 | Current page {n} | {n}페이지, 현재 페이지 | |
| 42 | 같은 파일 | Go to page {n} | {n}페이지로 이동 | |
| 43 | `components/ui/SearchBar.tsx` 기본 `placeholder` | Search... | 검색 | |
| 44 | 같은 파일 `aria-label` | Search | 검색어 | |
| 45 | 같은 파일 화면 읽기 프로그램용 설명 | Press Cmd+K to focus search, Escape to clear | ⌘K 또는 Ctrl+K로 검색창에 갑니다. Esc로 검색어를 지웁니다 | |
| 46 | 같은 파일 `aria-label` | Clear search | 검색어 지우기 | |
| 47 | `components/search/SearchInterface.tsx` 키 표시 | ESC | Esc | |
| 48 | `components/mdx/CodeBlockHeader.tsx` | Copy | 복사 | |
| 49 | 같은 파일 | Copied! | 복사했습니다 | |
| 50 | 같은 파일 | Failed | 복사하지 못했습니다 | |
| 51 | 같은 파일 `title` | Copy code to clipboard | 코드 복사 | |
| 52 | 같은 파일 `aria-label` | Copy {lang} to clipboard | {lang} 코드 복사 | |
| 53 | `components/mdx/MDXComponents.tsx` `aria-label`(둘) | {lang} code snippet | {lang} 코드 | |
| 54 | `components/mdx/CodeBlock.tsx` `aria-label` | {lang} code block[ with line numbers] | {lang} 코드[, 줄 번호 있음] | |
| 55 | `components/mdx/Link.tsx` | (unsafe link removed) | (안전하지 않은 주소라 링크를 뺐습니다) | |
| 56 | `app/(blog)/posts/[...slug]/page.tsx` 이동 경로 JSON-LD | Home · Posts | 홈 · 글 | |
| 57 | `app/layout.tsx` 피드 `<link title>`(셋) | RSS Feed · Atom Feed · JSON Feed | RSS 피드 · Atom 피드 · JSON 피드 | |
| 58 | `components/post/RelatedPosts.tsx`(지금은 주석으로 꺼 둠) | Related Posts | 관련 글 | |

**그대로 두는 것과 까닭**

- `Joonangler`, `Joonangler.log`, `GitHub` — 고유 이름이다.
- 코드 블록의 언어 이름(`ts`, `bash`, `typescript`…) — 기술 용어이고 코드의 일부다.
- 키 이름 `⌘K`, `Ctrl+K` — 키보드에 찍힌 글자다(`ESC`만 키 표기 관례대로 `Esc`).
- 피드 형식 이름 `RSS`·`Atom`·`JSON` — 형식 이름이다.
- 글의 제목·설명·태그·본문 — 내용이다(지금 fixtures는 영어지만 게시 글이 아니다).
- `lib/seo.ts`의 `keywords`(Next.js·React…) — 화면에 나오지 않는 메타이고 사이트 전체의 값이다.
- 개발자 콘솔 문구(`console.warn` 등) — 방문자에게 보이지 않는다.
- 이미 한국어인 「포스트」(예: 「"x" 태그가 달린 포스트가 없습니다.」)를 「글」로 맞추는 것은 이 묶음에서 하지 않는다(영어 문구가 아니다).

### 1-7. 서비스 MDX 본문 — 블로그 본문과 **같이 둔다**

서비스 페이지는 이미 `mdxComponents`와 `.prose`를 쓴다. 이 묶음이 `.prose`와 `MDXLink`를 새 체계로 바꾸면 서비스 본문도 같은 링크 밑줄·같은 글자색을 받는다. 까닭: 둘 다 사이트 안의 긴 글이고, 따로 두면 링크 모양이 두 벌이 된다. 지금 서비스 본문은 비어 있어서(`content/services/web-app-fix.mdx` 본문 0자) 보이는 차이는 없다. `prose-neutral dark:prose-invert`는 아무 일도 하지 않는 클래스라 두 곳(`PostContent`, 서비스 페이지)에서 지운다.

### 1-8. 블로그 e2e 여섯 건과 search 시험

개발 서버가 `content/posts`(없음)와 `content/drafts`(로컬 초안)를 읽어서 글 화면 시험의 결과가 그 기기의 초안에 달려 있다. Playwright `webServer.env`에 `POSTS_DIR=e2e/fixtures/posts`, `DRAFTS_DIR=e2e/fixtures/drafts`(빈 폴더)를 준다. 단위 시험 fixtures(`__tests__/fixtures/posts`)는 건드리지 않는다 — 글 수를 세는 단위 시험과 `check:routes` 기준본이 그것을 읽는다.

| 시험 | 기대하는 것 | 실패 이유 (chromium 실측) | 가름 | 고침 |
|---|---|---|---|---|
| post · should navigate to post detail page | `/`의 첫 `article`을 누르면 글 | 홈에 `article`이 없다(「기록」은 `li`). 30초 시간 초과 | 시험이 옛 화면(글 목록 홈)을 기대 | `/posts/`에서 시작, 첫 글 카드 링크를 눌러 `<h1>`이 글 제목 |
| post · should display post content | `article, main`이 보이고 글자 100자 넘음 | strict mode 위반: `main` + `article` 둘(글 화면의 `article` 안에 `PostContent`의 `article`) | 시험 결함(여러 개를 잡는 위치자). 이 브랜치 전부터 같다 | `page.getByRole('main')` |
| post · should handle back navigation | `/` → 글 → 뒤로 | 홈에 `article` 없음 | 시험 낡음 | `/posts/`에서 시작 |
| responsive · tablet (768px) | `/`의 `article` 수 > 0 | 0 | 시험 낡음 | `/posts/`의 글 카드 수 > 0 |
| responsive · desktop (1024px) | `header`가 보인다 | `<header>` 안이 떠 있는 내비(`position: fixed`)뿐이라 상자 크기가 0 → hidden | 시험 낡음. 내비는 보인다(화면 결함 아님) | `getByRole('navigation', { name: '사이트' })`가 보인다 |
| responsive · touch interactions | `/`의 `article`을 탭 | 홈에 `article` 없음 | 시험 낡음 | `/posts/`의 첫 글 카드를 탭 |
| search 4건 | — | 지금 통과하지만 공허하다: 「perform search」는 결과가 있어도 없어도 통과, 「filter as typing」은 0 ≤ 0도 통과 | 시험 결함 | fixtures 글로 「모든 요소」 검색 → 그 글 카드, 「없는낱말」 → 「"없는낱말"에 대한 검색 결과가 없습니다」, 한 글자 → 두 글자 좁힘에서 결과 수가 실제로 준다 |

### 1-9. 404 메타 중복

`app/not-found.tsx`에 `export const metadata: Metadata = { title: '페이지를 찾을 수 없습니다', robots: null }`. 까닭: Next는 404에 `noindex`를 스스로 넣는다(Next 16 문서 `not-found.md` 「Metadata」). 메타는 얕게 합쳐져 같은 키는 뒤의 것이 덮으므로, `robots: null`이 루트의 `index, follow`를 지운다(`resolveRobotsValue(null)`은 태그를 내지 않는다). 루트 메타의 `robots`를 지우는 길은 다른 모든 쪽의 `googleBot` 값까지 바뀌어 고르지 않았다. `/posts/__placeholder__/`도 `notFound()`로 같은 404 틀을 그리므로 함께 고쳐진다 — 둘 다 빌드 결과로 확인한다.

### 1-10. 댓글 테마

`theme="transparent_dark"`(giscus가 주는 테마). 까닭: 바탕이 투명이라 iframe이 사이트의 `#000` 위에 그대로 녹는다. `dark`는 iframe이 자기 바탕(GitHub 어두운 화면의 남색 계열)을 칠해 검정 위에서 판이 하나 떠 보인다(댓글을 켜는 날 실제 화면으로 확인). giscus 안의 강조색(파란 단추)은 남는다 — 맞추려면 사용자 정의 테마 CSS를 주소로 줘야 하고, 댓글을 켤 때 정한다. 켜는 일과 저장소 밖 설정은 이 묶음이 아니다. 바깥 테두리는 `border-border`.

### 1-11. 구현을 브리프 몇 개로

**브리프 둘.** 같은 파일(`SeriesNavTop`·`SeriesNavBottom`·`CodeBlockHeader`·`Pagination`·`globals.css`)을 두 쪽이 고치므로 차례로 돈다.

| 브리프 | 작업 | 의존 |
|---|---|---|
| **4a 색** | Task 1~5 (e2e 기반, 옛 변수, 색 이름 클래스와 대비, 본문 요소, 코드 블록) | 첫 묶음(release/homepage에 있음) |
| **4b 글자·메타·검증** | Task 6~9 (댓글 테마, 영어 문구, 404 메타와 스크립트 끈 상태, 묶음 검증) | 4a |

---

## Global Constraints

- 첫 묶음 계획의 「Global Constraints」를 모두 따른다. 아래는 이 묶음에서 자주 걸리는 것을 옮긴 것이다.
- 게이트는 **Node 24**: `npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production`.
- 브랜치: `release/homepage`에서 딴 `feat/homepage-4a-…`·`feat/homepage-4b-…` → `release/homepage`로 PR → CI `test` 초록. **`main`으로 PR을 열지 않는다. `main`·`release/homepage` 직접 푸시 금지.** 병합·배포·Actions 수동 dispatch는 하지 않는다(`release/homepage`에서 `deploy.yml`을 돌리면 그 브랜치가 공개된다).
- 색 토큰(설계 §12-1): `--bg #000`, `--ink #fff`, `--ink-2 rgb(255 255 255 / 0.64)`, `--ink-3 rgb(255 255 255 / 0.5)`, `--line rgb(255 255 255 / 0.12)`, `--surface rgb(255 255 255 / 0.06)`, `--ring-shadow 0 0 0 1px rgb(255 255 255 / 0.09)`, `--ring-shadow-hover 0 0 0 1px rgb(255 255 255 / 0.2)`, `--img-outline rgb(255 255 255 / 0.1)`. **강조색 없음. 남기는 색은 코드 강조의 문법 색뿐**(설계 §8).
- 블로그 화면의 짜임과 컴포넌트 구조는 그대로(설계 §8). 바꾸는 것은 색·서체·모양 클래스와 글자다. `SeriesNav.tsx` 삭제는 그려지지 않는 파일이라 짜임을 바꾸지 않는다.
- 글자 대비 4.5:1 이상(설계 §12-5). 계산은 WCAG 상대 휘도, 반투명 색은 실제 바탕 위에 합성한 값으로.
- 의존성을 더하거나 바꾸지 않는다. 코드 강조 테마는 `shiki`에 든 `github-dark-dimmed`.
- 새로 쓰거나 고치는 CSS에 `transition: all` 금지. 숨김 상태는 `html.js` 아래에서만.
- e2e는 로컬에서 `--project=chromium`. CI는 e2e를 돌리지 않는다. Playwright는 `reuseExistingServer`라 3000번에 다른 서버가 떠 있으면 `webServer.env`가 먹지 않는다 — 돌리기 전에 `lsof -iTCP:3000 -sTCP:LISTEN`이 비어 있어야 한다.
- 색을 바꾸는 작업의 시험은 **변이로 실패를 보인 뒤 복원**한다. 변이는 파일을 `cp f "$TMPDIR/x.bak"`로 떠 두고 걸고, `cp "$TMPDIR/x.bak" f`로 되돌린 뒤 `grep`으로 원래 줄을 확인한다(새 파일은 `git checkout`으로 못 되돌린다).
- 커밋 `<type>(<scope>): <subject>`, 도구 푸터 없음.

## Review Focus

1. **글이 0편인 지금 그대로 공개될 때** — `/posts/`·`/series/`·`/tags/`의 빈 화면이 한국어 한 줄이고 영어가 하나도 없다. → Task 7 Step 5와 Task 8 Step 4(글 0편 운영 빌드 grep).
2. **아주 긴 코드 줄·블록 수식·넓은 표가 320px에 올 때** — 그 상자만 가로로 밀리고 쪽 전체는 밀리지 않는다. → Task 4의 폭 시험(`kitchen-sink`).
3. **클립보드가 거절할 때** — 복사 단추가 「복사하지 못했습니다」로 바뀌고 2초 뒤 「복사」로 돌아온다. 조용히 실패하지 않는다. → Task 7의 `CodeBlockHeader` 시험.
4. **키보드로 다닐 때 검정 위의 초점** — 목차 링크·태그·쪽 번호에서 초점 고리가 흰색으로 보이고, 고리 사이 띠가 검정이다(흰 띠 두 겹이 아니다). → Task 3의 초점 e2e.
5. **스크립트가 꺼진 기기의 글 목록** — `/posts/`가 첫 쪽 글 카드를 보여 준다(지금은 「Loading posts...」만). `?page=2`는 스크립트 없이 첫 쪽을 보여 준다(알려 둔 한계). → Task 8의 no-JS e2e.

---

### Task 1: e2e 기반 — 시험용 글과 블로그 e2e 여섯 건·검색 시험

**Files:**
- Create: `e2e/fixtures/posts/2025/kitchen-sink.mdx`, `e2e/fixtures/posts/2025/e2e-series-{1,2,3}.mdx`, `e2e/fixtures/posts/2025/filler-{01..10}.mdx`, `e2e/fixtures/drafts/.gitkeep`, `e2e/helpers/blog-pages.ts`
- Modify: `playwright.config.ts`(`webServer.env`), `e2e/post.spec.ts`, `e2e/responsive.spec.ts`, `e2e/search.spec.ts`

**Interfaces:**
- Produces: e2e 글 14편(첫 쪽 12 + 둘째 쪽 2). 제목·설명·태그는 **모두 한국어**(Task 7의 영어 검사가 내용과 화면 문구를 가르지 않아도 되게).
  - `kitchen-sink` — 제목 「모든 요소를 담은 글」, 태그 `[시험, 요소]`. `h1`~`h3` 제목, 안쪽 링크(`/posts/filler-01/`)와 바깥 링크, 인라인 코드, 코드 블록 셋(`ts title="hello.ts" showLineNumbers {2}`에 강조 줄과 한 줄 120자 넘는 주석, `bash`, `diff`), 인라인 수식, 320px를 넘는 블록 수식, 3열 표, 인용, 구분선, `Callout` 네 종류, 순서 목록.
  - `e2e-series-1..3` — `series: "시험 시리즈"`, `seriesSlug: "e2e-series"`, `seriesOrder` 1·2·3, 태그 `[시험]`.
  - `filler-01..10` — 제목 「채움 글 01」…, 태그 `[채움]`, 본문 한 문단.
- Produces: `export const BLOG_PAGES: string[]` = `['/posts/', '/posts/kitchen-sink/', '/posts/e2e-series-2/', '/series/', '/series/e2e-series/', '/tags/', `/tags/${encodeURIComponent('시험')}/`, '/search/']` — Task 3·4·7·9가 쓴다.
- Produces: `webServer.env` = 지금 값 + `POSTS_DIR: path.resolve('e2e/fixtures/posts')`, `DRAFTS_DIR: path.resolve('e2e/fixtures/drafts')`.

- [ ] **Step 1: 실패하는 시험으로 고친다** — §1-8 표의 「고침」대로 `post.spec.ts` 3건, `responsive.spec.ts` 3건을 고치고, `search.spec.ts`를 셋으로 바꾼다:

```ts
const input = (page) => page.getByPlaceholder('검색어를 입력하세요...')
test('finds a post by its title', async ({ page }) => {
  await page.goto('/search/')
  await input(page).fill('모든 요소')
  await expect(page.getByRole('heading', { name: /모든 요소를 담은 글/ })).toBeVisible()
})
test('says so when nothing matches', async ({ page }) => {
  await page.goto('/search/')
  await input(page).fill('없는낱말')
  await expect(page.getByText('"없는낱말"에 대한 검색 결과가 없습니다')).toBeVisible()
})
test('a longer query narrows the results', async ({ page }) => {
  // 구역 머리의 「글」 링크(/posts/)는 세지 않는다
  const results = page.locator('main a[href^="/posts/"]:not([href="/posts/"])')
  await page.goto('/search/')
  await input(page).fill('글')
  await expect.poll(() => results.count()).toBeGreaterThan(1)
  const broad = await results.count()
  await input(page).fill('채움 글 01')
  await expect.poll(() => results.count()).toBeLessThan(broad)
  expect(await results.count()).toBeGreaterThan(0)
})
```

- [ ] **Step 2: 실패 확인** — fixtures와 `webServer.env`를 더하기 **전에** `npx playwright test e2e/post.spec.ts e2e/responsive.spec.ts e2e/search.spec.ts --project=chromium` → 고친 시험도 FAIL(로컬 초안에는 「모든 요소를 담은 글」이 없다). 실패 이유가 「그 글이 없다」인지 본다.
- [ ] **Step 3: fixtures 글 14편과 빈 초안 폴더, `webServer.env`, `BLOG_PAGES`를 더한다.**
- [ ] **Step 4: 통과 확인** — 같은 명령 → 전부 PASS. 그다음 `npx playwright test --project=chromium` 전체 → 첫 묶음의 시험(홈·폭·내비 등)이 fixtures 글로 바뀐 블로그 탭에서도 PASS. 깨지면 그 시험이 로컬 초안에 기대던 것인지 본다.
- [ ] **Step 5: 공허하지 않음** — `e2e/fixtures/posts/2025/kitchen-sink.mdx`를 떠 두고 제목을 「모든 요소」가 없는 글자로 바꿔 「finds a post」가 FAIL하는지 본 뒤 되돌린다(`grep -c '모든 요소를 담은 글' e2e/fixtures/posts/2025/kitchen-sink.mdx` → `1`).
- [ ] **Step 6: Commit** — `test(e2e): 블로그 시험이 fixtures 글을 읽고 새 화면을 기대하게 한다`

### Task 2: 옛 색 변수를 새 토큰으로

**Files:**
- Modify: `app/globals.css`(`@theme`의 `--color-*` 19줄, `@layer base`의 기본 선 색, 옛 `:root`·`.dark` 변수 덩어리 삭제, `body` 규칙)
- Create: `e2e/blog-colors.spec.ts`

**Interfaces:**
- Consumes: Task 1의 `BLOG_PAGES`, fixtures 글.
- Produces: §1-1 표의 값. Tailwind 색 `ink-3`(`text-ink-3`, `border-ink-3`, `decoration-ink-3`). `body { color: var(--ink); background: var(--bg) }`(무효 선언을 고친다. `body`의 `bg-background` 클래스는 그대로 두면 같은 값이다).

- [ ] **Step 1: 실패하는 e2e**

```ts
// e2e/blog-colors.spec.ts — 계산 스타일로 본다
const css = (page, sel, prop) => page.locator(sel).first().evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop)
test('blog sits on pure black with white text', async ({ page }) => {
  for (const path of ['/', '/posts/', '/posts/kitchen-sink/']) {
    await page.goto(path)
    expect(await css(page, 'body', 'background-color')).toBe('rgb(0, 0, 0)')
  }
  await page.goto('/posts/kitchen-sink/')
  expect(await css(page, 'main h1', 'color')).toBe('rgb(255, 255, 255)')
  expect(await css(page, 'main header time', 'color')).toBe('rgba(255, 255, 255, 0.64)')
})
test('tag badges are white on a 6% surface', async ({ page }) => {
  await page.goto('/posts/kitchen-sink/')
  const badge = 'main header a[href^="/tags/"] span'
  expect(await css(page, badge, 'background-color')).toBe('rgba(255, 255, 255, 0.06)')
  expect(await css(page, badge, 'color')).toBe('rgb(255, 255, 255)')
})
test('lines are 12% white, not light gray', async ({ page }) => {
  await page.goto('/search/')
  expect(await css(page, 'main input', 'border-top-color')).toBe('rgba(255, 255, 255, 0.12)')
  // 색을 주지 않은 border의 기본값(@layer base)
  const plain = await page.evaluate(() => { const d = document.createElement('div'); d.className = 'border'; document.body.append(d); return getComputedStyle(d).borderTopColor })
  expect(plain).toBe('rgba(255, 255, 255, 0.12)')
})
```

- [ ] **Step 2: 실패 확인** — `npx playwright test e2e/blog-colors.spec.ts --project=chromium` → FAIL: 바탕 `rgb(10, 10, 10)`, 날짜 `rgb(148, 163, 184)`, 배지 `rgb(29, 40, 58)`.
- [ ] **Step 3: 구현** — §1-1.
- [ ] **Step 4: 통과 확인** — 같은 명령 → PASS. `grep -nE "^\s+--(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring):" app/globals.css` → 없음. `npm run test:run && npm run type-check` rc 0.
- [ ] **Step 5: 변이** — `app/globals.css`를 떠 두고 `--color-background`를 `#0a0a0a`로 바꿔 「pure black」 FAIL, 되돌린 뒤 `grep -c -- '--color-background: var(--bg)' app/globals.css` → `1`.
- [ ] **Step 6: Commit** — `feat(blog): 옛 색 변수가 사이트 토큰을 가리키게 하고 바탕을 #000으로 맞춘다`

### Task 3: 색 이름 클래스 정리와 글자 대비, 초점

**Files:**
- Delete: `components/post/SeriesNav.tsx`
- Modify: `app/globals.css`(v3 색 목록 삭제, `pre`·`.toc-scrollbar` 스크롤바, `.prose blockquote`·`.prose code` 규칙), `components/post/{SeriesNavTop,SeriesNavBottom,RelatedPosts,PostCard,TableOfContents,PostHeader}.tsx`, `components/ui/{Pagination,TagCloud,Badge,Card,Button,SearchBar}.tsx`, `components/series/SeriesCard.tsx`, `components/search/{Highlight,SearchResultCard}.tsx`, `components/Comments.tsx`(선 색만 — 테마는 Task 6)
- Create: `__tests__/styles/no-named-colors.test.ts`, `e2e/helpers/contrast.ts`, `e2e/blog-contrast.spec.ts`

**Interfaces:**
- Consumes: Task 2의 토큰과 `text-ink-3`.
- Produces: `__tests__/styles/no-named-colors.test.ts`의 `export const NOT_YET = ['components/mdx/']` — Task 4가 `components/mdx/Link.tsx`·`MDXComponents.tsx`·`Callout.tsx`·`Image.tsx`를, Task 5가 나머지를 풀고, Task 5 끝에서 `[]`이다.
- Produces: `export async function lowContrast(page: Page, min = 4.5): Promise<Array<{ el: string; text: string; ratio: number }>>` — 보이는 글자 노드의 부모마다 글자색을 조상 바탕을 합성한 바탕 위에 합성해 대비를 잰다. 색 문자열은 1×1 캔버스에 칠해 읽는다(계산 스타일이 `oklab()`·`color-mix()`로 나오기 때문). `.sr-only`·`[aria-hidden="true"]`·`canvas` 안은 뺀다.

- [ ] **Step 1: 실패하는 시험 셋**

```ts
// __tests__/styles/no-named-colors.test.ts
const NAMED = /\b(bg|text|border|ring|from|to|via|fill|stroke|outline|divide|placeholder|decoration|shadow)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\b(bg|text|border)-(white|black)\b/
it('no file draws with Tailwind palette colors', () => {
  const hits = files(['app', 'components'], /\.(tsx?|css)$/)
    .filter((f) => !NOT_YET.some((p) => f.startsWith(p)))
    .flatMap((f) => lines(f).filter((l) => NAMED.test(l.text)).map((l) => `${f}:${l.no}`))
  expect(hits).toEqual([])
})
// e2e/blog-contrast.spec.ts
for (const path of BLOG_PAGES) test(`${path} text is 4.5:1 or better`, async ({ page }) => {
  await page.goto(path); await page.waitForLoadState('networkidle')
  expect(await lowContrast(page)).toEqual([])
})
// 초점 (Review Focus 4) — 같은 파일
test('focus ring on a TOC link is white with a black gap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/posts/kitchen-sink/')
  // 스크립트 초점은 마지막 입력이 마우스가 아니면 :focus-visible에 걸린다. 걸리지 않으면 Tab으로 닿게 한다.
  await page.locator('aside nav a').first().focus()
  const shadow = await page.locator('aside nav a').first().evaluate((el) => getComputedStyle(el).boxShadow)
  expect(shadow).toContain('rgb(255, 255, 255)')
  expect(shadow).not.toMatch(/rgb\(60, 131, 246\)|rgb\(59, 130, 246\)/)
  expect(shadow).toMatch(/rgb\(0, 0, 0\) 0px 0px 0px 2px/)
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/styles/no-named-colors.test.ts` → FAIL(목록에 `SeriesNavBottom.tsx`·`Pagination.tsx`… 300줄 남짓). `npx playwright test e2e/blog-contrast.spec.ts --project=chromium` → 시리즈 글의 「Part」 3.67, `/tags/`의 가벼운 태그 3.88로 FAIL, 초점 시험은 파란 고리로 FAIL.
- [ ] **Step 3: 구현** — §1-2의 역할 표대로 파일마다 바꾼다. `SeriesNav.tsx`를 지우고, 남은 파일의 주석 예시(`<SeriesNav …/>`)는 `SeriesNavTop`으로 고친다. 태그 구름의 무게 다섯 단계는 크기·굵기가 그대로 말하므로 색은 무게 4·5 `text-foreground`, 1~3 `text-muted-foreground`. 마지막에 v3 색 목록을 지운다.
- [ ] **Step 4: 통과 확인** — vitest PASS, e2e 둘 PASS. `bash -c 'grep -rnoE "dark:(text|bg|border)-" app components | grep -v components/mdx/ | wc -l'` → `0`. `npm run test:run && npm run type-check && npm run lint` rc 0.
- [ ] **Step 5: 변이** — `app/globals.css`를 떠 두고 `--ink-3`을 `rgb(255 255 255 / 0.4)`(검정 위 4.18:1)로 바꿔 `blog-contrast` FAIL, 되돌린 뒤 `grep -c -- '--ink-3: rgb(255 255 255 / 0.5)' app/globals.css` → `1`. `components/ui/Pagination.tsx`를 떠 두고 `text-blue-500`을 한 곳 넣어 `no-named-colors` FAIL, 되돌린다.
- [ ] **Step 6: Commit** — `feat(blog): 색 이름 클래스를 토큰 클래스로 바꾸고 다시 들어오지 못하게 막는다`

### Task 4: 본문 — 링크 밑줄, 인라인 코드, 표·인용·구분선·수식, 알림 상자, 제목 앵커

**Files:**
- Modify: `components/mdx/Link.tsx`, `components/mdx/MDXComponents.tsx`(제목 `scroll-mt`, 인라인 코드, 인용, 표, 구분선), `components/mdx/Callout.tsx`, `components/mdx/Image.tsx`, `components/post/PostContent.tsx`·`app/services/[slug]/page.tsx`(`prose-neutral dark:prose-invert` 삭제), `app/globals.css`(`.prose a` 파랑 줄 삭제, `.prose blockquote`, `.katex-display`), `e2e/widths.spec.ts`(블로그 경로), `__tests__/styles/no-named-colors.test.ts`(`NOT_YET` 좁힘)
- Create: `e2e/blog-body.spec.ts`, `__tests__/components/MDXLink.test.tsx`

**Interfaces:**
- Consumes: Task 1 `kitchen-sink`, Task 3 `NOT_YET`.
- Produces: §1-3·§1-5의 값. `NOT_YET = ['components/mdx/CodeBlock.tsx', 'components/mdx/CodeBlockHeader.tsx']`.

- [ ] **Step 1: 실패하는 시험**

```ts
// e2e/blog-body.spec.ts (kitchen-sink)
test('body links are white and underlined', async ({ page }) => {
  await page.goto('/posts/kitchen-sink/')
  for (const sel of ['.prose a[href="/posts/filler-01/"]', '.prose a[target="_blank"]']) {
    const s = await page.locator(sel).first().evaluate((el) => { const c = getComputedStyle(el); return [c.color, c.textDecorationLine, c.textDecorationColor] })
    expect(s).toEqual(['rgb(255, 255, 255)', 'underline', 'rgba(255, 255, 255, 0.5)'])
  }
})
test('table, quote, rule and callouts use line and surface only', async ({ page }) => {
  await page.goto('/posts/kitchen-sink/')
  expect(await css(page, '.prose th', 'border-top-color')).toBe('rgba(255, 255, 255, 0.12)')
  expect(await css(page, '.prose thead', 'background-color')).toBe('rgba(255, 255, 255, 0.06)')
  expect(await css(page, '.prose blockquote', 'font-style')).toBe('normal')
  expect(await css(page, '.prose hr', 'border-top-color')).toBe('rgba(255, 255, 255, 0.12)')
  const callouts = await page.locator('[role="alert"]').evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor))
  expect(new Set(callouts)).toEqual(new Set(['rgba(255, 255, 255, 0.06)']))
})
test.describe('without javascript', () => {
  test.use({ javaScriptEnabled: false })
  test('an h1 reached by #anchor sits below the floating nav', async ({ page }) => {
    await page.goto('/posts/kitchen-sink/')
    const id = await page.locator('.prose h1').first().getAttribute('id')
    await page.goto('/posts/kitchen-sink/#' + encodeURIComponent(id!))
    const navBottom = await page.locator('.site-nav').evaluate((el) => el.getBoundingClientRect().bottom)
    expect((await page.locator('.prose h1').first().boundingBox())!.y).toBeGreaterThanOrEqual(navBottom)
  })
})
// __tests__/components/MDXLink.test.tsx
it('draws internal and external links with an underline and no palette color', () => {
  render(<><MDXLink href="/posts/a/">안</MDXLink><MDXLink href="https://example.org">밖</MDXLink></>)
  for (const a of screen.getAllByRole('link')) {
    expect(a.className).toMatch(/\bunderline\b/)
    expect(a.className).not.toMatch(/text-blue/)
  }
})
```

`e2e/widths.spec.ts`의 `paths`에 `BLOG_PAGES`를 더한다(`/posts/kitchen-sink/`에서 블록 수식이 넘친다).

- [ ] **Step 2: 실패 확인** — `npx playwright test e2e/blog-body.spec.ts e2e/widths.spec.ts --project=chromium` → 링크 `rgb(96, 165, 250)`·`none`, 인용 `italic`, 알림 상자 네 색, `h1` 앵커 y 0~16, 320·390·768·1024px의 `/posts/kitchen-sink/`에서 `scrollWidth` 초과로 FAIL. `npx vitest run __tests__/components/MDXLink.test.tsx` → FAIL.
- [ ] **Step 3: 구현** — §1-3·§1-5.
- [ ] **Step 4: 통과 확인** — 같은 명령들 → PASS. `npx vitest run __tests__/styles/no-named-colors.test.ts` → PASS(좁힌 `NOT_YET`으로).
- [ ] **Step 5: 변이** — `app/globals.css`를 떠 두고 `.katex-display`의 `overflow-x: auto`를 지워 폭 시험 FAIL, 되돌린다. `components/mdx/Link.tsx`를 떠 두고 `underline`을 `hover:underline`으로 되돌려 MDXLink 시험과 「white and underlined」 FAIL, 되돌린 뒤 `grep -c 'decoration-ink-3' components/mdx/Link.tsx` → `1`.
- [ ] **Step 6: Commit** — `feat(blog): 본문 링크를 밑줄로, 표·인용·수식·알림 상자를 선과 면으로 그린다`

### Task 5: 코드 블록 — 어두운 테마 한 벌, 면과 고리, 강조 줄

**Files:**
- Modify: `lib/mdx.ts`(`rehypePrettyCodeOptions.theme`), `app/globals.css`(Shiki 변수 규칙 둘 삭제, `.highlighted`, `.word-highlighted`, 줄 번호, 스크롤바), `components/mdx/MDXComponents.tsx`(코드 감싸개 둘), `components/mdx/CodeBlock.tsx`, `components/mdx/CodeBlockHeader.tsx`(색만 — 글자는 Task 7), `__tests__/styles/no-named-colors.test.ts`(`NOT_YET = []`)
- Create: `__tests__/lib/code-theme.test.ts`

**Interfaces:**
- Consumes: Task 1 `kitchen-sink`의 코드 블록 셋.
- Produces: `mdxOptions.mdxOptions.rehypePlugins[0][1].theme === 'github-dark-dimmed'`.

- [ ] **Step 1: 실패하는 시험**

```ts
// __tests__/lib/code-theme.test.ts
import { bundledThemes } from 'shiki'
import { mdxOptions } from '@/lib/mdx'
const SURFACE_ON_BLACK = '#0f0f0f' // rgb(255 255 255 / 0.06) over #000
it('uses one dark theme', () => {
  const [, opts] = mdxOptions.mdxOptions.rehypePlugins[0] as [unknown, { theme: unknown }]
  expect(opts.theme).toBe('github-dark-dimmed')
})
it('every token color without its own background is 4.5:1 on the code surface', async () => {
  const [, opts] = mdxOptions.mdxOptions.rehypePlugins[0] as [unknown, { theme: string }]
  const theme = (await bundledThemes[opts.theme as keyof typeof bundledThemes]()).default
  const fgs = theme.tokenColors!.filter((t) => t.settings.foreground && !t.settings.background).map((t) => t.settings.foreground!.slice(0, 7))
  const low = [...new Set(fgs)].filter((c) => contrast(c, SURFACE_ON_BLACK) < 4.5)
  expect(low).toEqual([])
})
```

`e2e/blog-body.spec.ts`에 더한다: 코드 감싸개(`[role="region"]`)의 `background-color`가 `rgba(255, 255, 255, 0.06)`이고 `box-shadow`에 `rgba(255, 255, 255, 0.09)`가 있다. `.highlighted`의 `border-left-color`가 `rgba(255, 255, 255, 0.5)`다. 코드 글자 하나(`pre code span[style]`)의 `style` 속성에 `color:`가 있고 `--shiki-light`가 없다.

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/code-theme.test.ts` → 첫 시험 FAIL(테마가 객체). `npx vitest run __tests__/styles/no-named-colors.test.ts` → `NOT_YET = []`로 바꾼 뒤 `CodeBlockHeader.tsx`·`CodeBlock.tsx` 줄로 FAIL. e2e → 투명 바탕·노란 막대·`--shiki-light`로 FAIL.
- [ ] **Step 3: 구현** — §1-4.
- [ ] **Step 4: 통과 확인** — vitest 둘·e2e PASS. `POSTS_DIR=e2e/fixtures/posts npm run build:production` 뒤 `bash -c 'cat out/_next/static/chunks/*.css | grep -c "shiki-light"'` → `0`, `grep -c 'color:#' out/posts/kitchen-sink/index.html` → `0`보다 크다. 그다음 `npm run build:production`(글 0편)으로 `out/`를 되돌려 둔다.
- [ ] **Step 5: 변이** — `lib/mdx.ts`를 떠 두고 테마를 `'min-dark'`로 바꿔 대비 시험 FAIL(`#800080` 등), 되돌린 뒤 `grep -c "theme: 'github-dark-dimmed'" lib/mdx.ts` → `1`.
- [ ] **Step 6: 4a 마감** — Task 9의 Step 1~3(대비·폭·글 주소)과 게이트를 이 브랜치에서 한 번 돌리고 PR 본문에 적는다.
- [ ] **Step 7: Commit** — `feat(code): 코드 강조를 어두운 테마 한 벌로, 코드 블록을 면과 고리로 그린다`

### Task 6: 댓글 테마

**Files:**
- Modify: `components/Comments.tsx`
- Create: `__tests__/components/Comments.test.tsx`

**Interfaces:**
- Produces: `<Giscus theme="transparent_dark" …>`. 나머지 속성은 그대로.

- [ ] **Step 1: 실패하는 시험** — `vi.mock('@giscus/react', () => ({ default: (p) => { seen.push(p); return null } }))`, 네 환경값을 `vi.stubEnv`로 채우고 렌더 → `expect(seen[0].theme).toBe('transparent_dark')`. 환경값이 없으면 아무것도 그리지 않는다(`container.innerHTML === ''`)도 함께 고정한다.
- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/components/Comments.test.tsx` → `'dark'`로 FAIL.
- [ ] **Step 3: 구현** — §1-10.
- [ ] **Step 4: 통과 확인** — PASS.
- [ ] **Step 5: 변이** — 파일을 떠 두고 `theme="dark"`로 되돌려 FAIL, 복원 뒤 `grep -c 'transparent_dark' components/Comments.tsx` → `1`.
- [ ] **Step 6: Commit** — `feat(comments): 댓글을 투명 어두운 테마로 검정 바탕에 맞춘다`

### Task 7: 영어 문구를 한국어로

**Files:**
- Modify: §1-6 표의 파일들, `__tests__/lib/mdx.test.ts:108`(`/\d+ min read/` → `/^읽는 데 \d+분$/`)
- Create: `e2e/blog-copy.spec.ts`, `__tests__/components/CodeBlockHeader.test.tsx`, `__tests__/components/SeriesNav.test.tsx`(Top·Bottom), `__tests__/components/Pagination.test.tsx`, `__tests__/components/TableOfContents.test.tsx`

**Interfaces:**
- Consumes: Task 1 `BLOG_PAGES`(fixtures 내용이 한국어).
- Produces: `readingTime.text` = `` `읽는 데 ${Math.max(1, Math.ceil(minutes))}분` ``(`lib/mdx.ts`, `reading-time`의 영어 `text`를 쓰지 않는다).

- [ ] **Step 1: 실패하는 시험**

```ts
// e2e/blog-copy.spec.ts — 고유 이름·형식 이름·키 이름·코드 언어 이름만 남는다(§1-6 「그대로 두는 것」)
const ALLOWED = /^(Joonangler(\.log)?|GitHub|RSS|Atom|JSON|Ctrl\+K|K|Esc|ts|bash|diff|typescript)$/
for (const path of BLOG_PAGES) test(`${path} has no English UI copy`, async ({ page }) => {
  await page.goto(path); await page.waitForLoadState('networkidle')
  const words = await page.evaluate(() => {
    const latin = (s: string | null) => s?.match(/[A-Za-z][A-Za-z.+]*/g) ?? []
    const out: string[] = []
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (w.nextNode()) {
      const t = w.currentNode as Text
      if (!t.parentElement!.closest('pre, code, .katex, script, style')) out.push(...latin(t.textContent))
    }
    for (const el of document.querySelectorAll('[aria-label],[title],[placeholder],img[alt]'))
      for (const a of ['aria-label', 'title', 'placeholder', 'alt']) out.push(...latin(el.getAttribute(a)))
    return out
  })
  expect(words.filter((w) => !ALLOWED.test(w))).toEqual([])
})
// __tests__/components/CodeBlockHeader.test.tsx (Review Focus 3)
it('says it could not copy when the clipboard refuses, then resets', async () => {
  vi.useFakeTimers()
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) } })
  render(<CodeBlockHeader code="x" language="ts" />)
  await act(async () => { screen.getByRole('button', { name: 'ts 코드 복사' }).click() })
  expect(screen.getByText('복사하지 못했습니다')).toBeTruthy()
  await act(async () => { vi.advanceTimersByTime(2000) })
  expect(screen.getByText('복사')).toBeTruthy()
})
```

나머지 컴포넌트 시험은 §1-6 표의 「옮긴 문구」를 `getByText`·`getByRole(name)`으로 단정한다(예: `SeriesNavBottom`의 첫 글에서 「첫 글입니다」, `Pagination` `currentPage=2`에서 `getByRole('link', { name: '이전 페이지' })`과 `getByRole('link', { name: '2페이지, 현재 페이지' })`, `TableOfContents` `variant="collapsible"`의 `summary` 이름 「목차」).

- [ ] **Step 2: 실패 확인** — `npx playwright test e2e/blog-copy.spec.ts --project=chromium` → `All`·`Posts`·`min`·`read`·`Copy`·`On`·`This`·`Page`·`Series`·`Part`… 로 FAIL. 새 vitest 시험들 FAIL.
- [ ] **Step 3: 구현** — §1-6 표대로. 글자만 바꾸고 태그·클래스·짜임은 그대로.
- [ ] **Step 4: 통과 확인** — e2e·vitest PASS. `npm run test:run` 전체 rc 0(`mdx.test.ts:108` 고침 포함).
- [ ] **Step 5: 글 0편 운영 빌드 (Review Focus 1)** — `npm run build:production` 뒤 `bash -c 'grep -lE "No series found|No tags found|All Posts|posts published" out/posts/index.html out/series/index.html out/tags/index.html'` → 없음. `grep -c '아직 시리즈가 없습니다' out/series/index.html`·`grep -c '아직 태그가 없습니다' out/tags/index.html` → 각각 `1` 이상. `/posts/`의 빈 문구는 정적 HTML에서 Suspense 대기 자리가 그리므로 Task 8 Step 4에서 본다.
- [ ] **Step 6: Commit** — `fix(copy): 블로그 화면의 영어 문구를 한국어로 옮긴다`

### Task 8: 404 메타와 스크립트 끈 상태

**Files:**
- Modify: `app/not-found.tsx`(메타), `app/(blog)/posts/page.tsx`(Suspense 대기 자리), `app/(blog)/search/page.tsx`(`SearchFallback`)
- Modify: `__tests__/components/NotFound.test.tsx`
- Create: `e2e/blog-nojs.spec.ts`

**Interfaces:**
- Produces: `app/not-found.tsx`의 `export const metadata: Metadata = { title: '페이지를 찾을 수 없습니다', robots: null }`.
- Produces: `/posts/`의 Suspense `fallback` = `<PostList posts={allPosts.slice(0, 12)} emptyMessage="아직 올린 글이 없습니다" />`(하이드레이션 뒤 첫 쪽과 같은 마크업 — 화면이 바뀌지 않는다).
- Produces: `SearchFallback` — 「로딩 중...」은 `.js` 아래에서만 보이고(`hidden [.js_&]:block`), `<noscript>` 안에 「검색은 자바스크립트를 켜야 쓸 수 있습니다. 태그나 시리즈로 글을 찾아 보세요.」와 `/tags/`·`/series/` 링크.

- [ ] **Step 1: 실패하는 시험**

```ts
// __tests__/components/NotFound.test.tsx 에 더한다
import { metadata } from '@/app/not-found'
it('clears the inherited robots so only the injected noindex remains', () => {
  expect(metadata.robots).toBeNull()
})
// e2e/blog-nojs.spec.ts
test.use({ javaScriptEnabled: false })
test('the post list shows its first page without scripts', async ({ page }) => {
  await page.goto('/posts/')
  await expect(page.getByRole('heading', { name: '모든 요소를 담은 글' })).toBeVisible()
  await expect(page.getByText('Loading posts...')).toHaveCount(0)
})
test('search says it needs scripts and offers tags and series', async ({ page }) => {
  await page.goto('/search/')
  await expect(page.getByText('검색은 자바스크립트를 켜야 쓸 수 있습니다', { exact: false })).toBeVisible()
  await expect(page.getByText('로딩 중...')).toBeHidden()
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/components/NotFound.test.tsx` → FAIL(`metadata` 없음). `npx playwright test e2e/blog-nojs.spec.ts --project=chromium` → FAIL. `npm run build:production` 뒤 `grep -c '<meta name="robots"' out/404.html` → `2`.
- [ ] **Step 3: 구현** — §1-9와 위 Interfaces.
- [ ] **Step 4: 통과 확인** — 시험 PASS. `npm run build:production`(글 0편) 뒤:
  - `grep -o '<meta name="robots" content="[^"]*"' out/404.html` → `content="noindex"` 한 줄.
  - `grep -o '<meta name="robots" content="[^"]*"' out/posts/__placeholder__/index.html` → `content="noindex"` 한 줄.
  - `grep -o '<meta name="robots" content="[^"]*"' out/posts/index.html` → `content="index, follow"` 한 줄(다른 쪽은 그대로).
  - (Review Focus 1) `grep -c '아직 올린 글이 없습니다' out/posts/index.html` → `1` 이상, `grep -c 'Loading posts' out/posts/index.html` → `0`.
  - `robots: null`이 루트 값을 지우지 못하면(태그가 여전히 둘) 멈추고 질문한다 — 대안은 루트 메타에서 `robots`를 빼는 것인데 다른 모든 쪽의 메타가 바뀐다.
- [ ] **Step 5: 변이** — `app/not-found.tsx`를 떠 두고 `robots: null` 줄을 지워 빌드 grep이 `2`, 되돌린다. `/posts/` 대기 자리를 옛 문구로 되돌려 no-JS 시험 FAIL, 되돌린다.
- [ ] **Step 6: Commit** — `fix(blog): 404의 robots 중복을 걷고 스크립트 없이도 글 목록과 검색 안내가 보이게 한다`

### Task 9: 넷째 묶음 검증 (설계 §15)

**Files:** 없음(결과는 PR 본문에).

**실패 시험:** 이 작업은 새 시험을 쓰지 않는다. §15 넷의 시험은 앞 작업에서 실패를 먼저 봤다 — 대비 Task 3·5, 화면 폭 Task 4, 자바스크립트 끔 Task 8. 글 주소(`check:routes`)는 첫 묶음의 기준본이고, 아래 Step 1에서 공허하지 않음을 다시 본다.

- [ ] **Step 1: 글 주소** — `npm run check:routes` → diff 없음, rc 0. 이 묶음은 경로를 바꾸지 않지만 `lib/mdx.ts`·글 화면을 고치므로 RSS·사이트맵까지 다시 본다. 그다음 `__tests__/fixtures/blog-routes.txt`를 떠 두고 한 줄을 지워 rc 1과 diff 한 줄을 본 뒤 되돌린다(`git diff --stat __tests__/fixtures/blog-routes.txt` → 빈 출력).
- [ ] **Step 2: 글자 대비(본문·보조 글자·코드 강조색)** — `npx playwright test e2e/blog-contrast.spec.ts --project=chromium` PASS, `npx vitest run __tests__/lib/code-theme.test.ts` PASS. 대비가 가장 낮은 글자 셋(요소·값)을 `lowContrast(page, 99)`로 뽑아 PR에 적는다.
- [ ] **Step 3: 화면 폭 다섯** — `npx playwright test e2e/widths.spec.ts --project=chromium` → 320·390·768·1024·1440px × (`/`, 서비스 셋, `/contact/`, `BLOG_PAGES`) 전부 PASS.
- [ ] **Step 4: 자바스크립트를 끈 상태** — `npx playwright test e2e/no-js.spec.ts e2e/blog-nojs.spec.ts --project=chromium` PASS. 운영 빌드를 `python3 -m http.server 4173 -d out`으로 띄워 개발자 도구에서 스크립트를 끄고 `/posts/`·`/posts/kitchen-sink/`(fixtures 빌드)·`/search/`를 눈으로 본다. 화면 캡처를 PR에 붙인다.
- [ ] **Step 5: e2e 전체** — `npx playwright test --project=chromium` → 전부 PASS(블로그 여섯 건 포함). 깨진 것이 있으면 목록을 PR에 적는다.
- [ ] **Step 6: Lighthouse 접근성** — 위 정적 서버(fixtures 빌드)로 `/posts/`와 `/posts/kitchen-sink/`, 모바일·데스크톱. 접근성 점수와 지적 항목을 PR에 적는다.
- [ ] **Step 7: 다듬기 검토** — `make-interfaces-feel-better` full 모드로 글 목록·글·시리즈·태그·검색을 보고 고친 것과 남긴 것을 PR에 적는다.
- [ ] **Step 8: 게이트** — Node 24로 `npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production` → rc 0. 그다음 `/gate`.

---

## 실기기로 볼 축 (구현 때)

e2e의 계산 스타일은 기기의 실제 그리기를 대신하지 못한다. 4a·4b의 완료 전에 실제 휴대폰에서 본다.

1. **휴대폰 브라우저의 강제 어두운 화면** — Android Chrome의 웹 콘텐츠 자동 어두운 테마, 삼성 인터넷의 어두운 모드, iOS Safari에서 블로그 글을 열어 색이 한 번 더 바뀌는지(검정 바탕이 회색으로, 흰 글자가 옅게, 코드 강조색이 뒤집히는지). 바뀌면 후보는 `viewport`의 `colorScheme: 'dark'`(`<meta name="color-scheme" content="dark">` — 지금 없다, 실측)다. 정하기 전에 질문한다(사이트 전체의 메타다).
2. **좁은 화면의 코드 블록과 수식** — 320~390px에서 긴 코드 줄과 블록 수식을 손가락으로 가로로 밀 수 있는지, 밀 때 쪽 전체가 따라 밀리지 않는지, 세로 스크롤과 다투지 않는지(iOS Safari·Android Chrome).
3. **넓은 표** — 같은 조건에서 표가 제 칸에서 밀리는지.
4. **목차 펼침과 쪽 번호** — 좁은 화면에서 「목차」 줄과 쪽 번호(36px 칸)를 누르는 자리가 44px 이상인지. 모자라면 다음 묶음 몫으로 적는다(이 묶음은 모양을 키우지 않는다).

## 공개 전 확인 목록에 더할 것

- `npx vitest run __tests__/styles/no-named-colors.test.ts` PASS(색 이름 클래스 0).
- 글 0편 운영 빌드에서 `/posts/`·`/series/`·`/tags/`에 영어 빈 문구가 없다(Task 7 Step 5의 grep).
- `out/404.html`의 `robots` 메타가 `noindex` 하나다(Task 8 Step 4의 grep).
- 실기기 축 1(강제 어두운 화면)의 결과와, 메타를 더했는지.
- 댓글을 켤 때: `transparent_dark`로 iframe 바탕이 검정 위에 녹는지 보고, giscus 안의 파란 단추를 사용자 정의 테마로 맞출지 그때 정한다.

## 범위 밖으로 둔 것 (조사에서 나옴)

- 알림 상자의 `role="alert"` — 정적인 상자인데 화면 읽기 프로그램이 쪽을 열자마자 읽는다. `role="note"`가 맞아 보인다. 이 묶음의 일(색·글자)이 아니라 남긴다.
- 글 화면의 `article` 안에 `PostContent`의 `article`이 또 있다(겹친 `article`). 짜임이라 그대로 둔다.
- 이미 한국어인 「포스트」를 「글」로 맞추는 것.
- 블로그 컴포넌트의 `hover:`를 `hover-fine:`으로 바꾸는 것(첫 묶음의 선택대로 그대로 둔다).
- 탭 사이 전환 — 이 묶음 뒤에 정한다(첫 묶음 계획).
