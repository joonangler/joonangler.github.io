# 초안 미리보기 로더·seriesSlug 구현 계획 (이슈 A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 개발 모드에서만 볼트 심링크 `content/drafts/`의 초안을 읽고, 운영 빌드에서는 초안이 목록·직접 주소·sitemap·RSS 어디에도 안 나오게 하며, frontmatter `seriesSlug`로 시리즈 주소를 영문으로 둔다.

**Architecture:** 초안 설정(켜짐 조건·초안 폴더)은 새 모듈 `lib/drafts.ts` 하나가 쥐고, `lib/mdx.ts`의 파일 탐색·목록·정적 경로가 그 모듈만 묻는다. `seriesSlug`는 frontmatter에서 읽어 검증하고, `lib/series.ts`가 시리즈 슬러그를 정할 때 그 값을 우선한다. 기존 공개 함수의 시그니처·기본 동작은 유지한다(픽스처 기반 테스트가 그대로 통과해야 한다).

**Tech Stack:** Next.js 16 App Router 정적 export · TypeScript · gray-matter · vitest(jsdom, `POSTS_DIR` 픽스처).

**Spec:** `docs/superpowers/specs/2026-10-27-blog-writing-flow-and-first-series-design.md` — §5-1(로더 규칙), §5-3-1(이슈 A 완료 조건), §6(주소 규칙), §8-1(허브 결정).

## Global Constraints

- 게이트는 **Node 24**로 돈다(로컬 기본은 26). 방법: 볼트 `projects/blog/memory/로컬-node24-게이트.md`(스크래치에 `npm i node@24` 후 PATH 앞). 게이트 명령(저장소 `CLAUDE.md`): `npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production`.
- GitHub Flow: main에서 브랜치 `feat/draft-preview-series-slug` → PR → CI `test` 초록. main 직접 푸시 금지. **병합·배포·Actions dispatch는 하지 않는다**(허브 몫).
- 초안이 보이는 조건은 **`process.env.NODE_ENV === 'development'` 또는 `process.env.INCLUDE_DRAFTS === '1'`뿐**이다(spec §5-1). 변수 이름 `INCLUDE_DRAFTS`·`DRAFTS_DIR`은 이 계획이 정한다.
- 운영 빌드(`NODE_ENV=production`)는 `content/drafts/`를 읽지 않고, `draft: true`는 목록·`getPostPaths`·`generateStaticParams`·sitemap·RSS 전부에서 빠진다(spec §5-1, §8-1 2).
- `seriesSlug` 형식은 `^[a-z0-9]+(-[a-z0-9]+)*$`. 같은 `series`의 글이 서로 다른 `seriesSlug`를 가지면 빌드 오류(spec §5-1).
- 기존 테스트는 고치지 않는다. 픽스처 디렉터리를 읽는 구조(`POSTS_DIR`)는 유지하고 테스트·픽스처를 **더한다**(spec §5-1). 커버리지는 게이트가 아니다 — CI는 `test:run`만 돌리고 main부터 branches 76.5%로 임계 80% 미달이다(출처: 볼트 `projects/blog/README.md` 관찰, 현장 007 실측 2026-10-24). 새 코드의 분기는 각 Task의 테스트가 덮되 임계 달성을 완료 조건으로 삼지 않는다.
- `getPostBySlug`는 시그니처·흐름을 바꾸지 않는다(spec §5-1). `lib/toc.ts`의 `POSTS_PATH`는 앱이 쓰지 않는 함수(`getTOCFromSlug`·`getFlatTOC`)만 쓰므로 손대지 않는다.
- 이미지 심링크·게시 절차 스크립트는 범위 밖(spec §5-1 이미지, §8). 의존성 변경 없음. `.obsidian/`(미추적)은 그대로.
- 커밋 메시지 `<type>(<scope>): <subject>`, 도구 푸터 없음.

## Review Focus

1. 심링크가 없거나 깨진 채 `npm run dev` — 오류 없이 초안만 빠져야 한다. → Task 2 테스트 「drafts 폴더가 없으면 빈 목록」.
2. `seriesSlug`에 대문자·공백 — 글이 조용히 다른 주소로 가면 안 된다. → Task 4 테스트 「형식 위반은 warn + null」.
3. `seriesSlug`가 다른 시리즈의 계산된 슬러그와 같음(예 `sample-series`) — 두 시리즈가 한 주소를 두고 겹친다. → Task 5 테스트 「슬러그 중복은 오류」.
4. `content/posts/`에 `draft: true` 글을 잘못 넣음 — 운영에서 직접 주소로도 404여야 한다. → Task 3 `getPostPaths` 테스트 + Task 7 실측.
5. `seriesSlug`만 있고 `series`가 없음 — 글이 사라지면 안 되고 시리즈에도 안 들어가야 한다. → Task 4 테스트 「series 없는 seriesSlug는 무시(warn)」.

---

### Task 1: 초안 설정 모듈

**Files:**
- Create: `lib/drafts.ts`
- Test: `__tests__/lib/drafts.test.ts`

**Interfaces:**
- Produces: `export function draftsEnabled(): boolean` — `process.env.NODE_ENV === 'development' || process.env.INCLUDE_DRAFTS === '1'`. 호출 시점에 env를 읽는다(모듈 상수 아님 — 테스트가 `vi.stubEnv`로 바꾼다).
- Produces: `export function getDraftsPath(): string` — `process.env.DRAFTS_DIR ?? path.join(process.cwd(), 'content', 'drafts')`. 역시 호출 시점에 읽는다.

- [ ] **Step 1: 실패하는 테스트**

```ts
import path from 'path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { draftsEnabled, getDraftsPath } from '@/lib/drafts'

afterEach(() => vi.unstubAllEnvs())

describe('draftsEnabled', () => {
  it('is false under NODE_ENV=test with no flag', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '')
    expect(draftsEnabled()).toBe(false)
  })
  it('is true when INCLUDE_DRAFTS=1', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    expect(draftsEnabled()).toBe(true)
  })
  it('is true when NODE_ENV=development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(draftsEnabled()).toBe(true)
  })
  it('is false when NODE_ENV=production even with INCLUDE_DRAFTS=0', () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('INCLUDE_DRAFTS', '0')
    expect(draftsEnabled()).toBe(false)
  })
})

describe('getDraftsPath', () => {
  it('uses DRAFTS_DIR when set', () => {
    vi.stubEnv('DRAFTS_DIR', '/tmp/x')
    expect(getDraftsPath()).toBe('/tmp/x')
  })
  it('defaults to content/drafts under cwd', () => {
    vi.stubEnv('DRAFTS_DIR', '')
    expect(getDraftsPath()).toBe(path.join(process.cwd(), 'content', 'drafts'))
  })
})
```
(빈 문자열 stub은 「설정 안 됨」으로 본다 — `??`가 아니라 빈 값도 기본으로 떨어지게 구현한다: `process.env.DRAFTS_DIR || 기본값`.)

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/drafts.test.ts` → FAIL (모듈 없음)
- [ ] **Step 3: `lib/drafts.ts` 구현** — 위 시그니처 둘. 파일 상단 주석 한 줄: 「초안은 개발 모드 또는 INCLUDE_DRAFTS=1에서만 읽는다(spec §5-1)」.
- [ ] **Step 4: 통과 확인** — 같은 명령 → PASS
- [ ] **Step 5: 커밋** — `feat(drafts): 초안 설정 모듈 draftsEnabled·getDraftsPath`

---

### Task 2: 파일 탐색이 초안 폴더를 읽고 슬러그 충돌을 잡는다

**Files:**
- Modify: `lib/mdx.ts:86-110` (`getPostFiles`)
- Modify: `vitest.config.ts:11-13` (env에 `DRAFTS_DIR` 추가)
- Modify: `.gitignore` (`/content/drafts/` 추가, 「next.js」 블록 아래)
- Create: `__tests__/fixtures/drafts/2026/draft-in-drafts.mdx` — `title: Draft In Drafts` · `description: Fixture draft living in the drafts directory` · `date: "2026-01-10"` · `tags: [drafts-fixture]` · `draft: true`
- Create: `__tests__/fixtures/drafts-collision/test-post.mdx` — posts 픽스처 `test-post`와 같은 파일명, `draft: true`
- Test: `__tests__/lib/mdx.test.ts` (describe `drafts directory` 추가)

**Interfaces:**
- Consumes: Task 1 `draftsEnabled()`, `getDraftsPath()`.
- Produces: `getPostFiles()`(비공개)가 `draftsEnabled()`일 때 `getDraftsPath()`도 재귀 탐색해 합친다. 두 폴더에 같은 basename이 있으면 `throw new Error('[drafts] slug collision: "<slug>" exists in both posts and drafts')`. 초안 폴더가 없으면 조용히 건너뛴다(기존 `existsSync` 분기 재사용). `getPostFilePath`·`postExists`·`getPostPaths`·`_getAllPosts`는 이 함수를 통해 자동으로 초안을 본다.

- [ ] **Step 1: 실패하는 테스트** (`__tests__/lib/mdx.test.ts`에 추가. 상단 import에 `vi`·`afterEach`와 `import path from 'path'`를 더하고 `afterEach(() => vi.unstubAllEnvs())`)

```ts
describe('drafts directory', () => {
  it('does not see drafts dir by default (NODE_ENV=test)', () => {
    expect(postExists('draft-in-drafts')).toBe(false)
  })
  it('sees drafts dir when INCLUDE_DRAFTS=1', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    expect(postExists('draft-in-drafts')).toBe(true)
  })
  it('is silent when the drafts dir does not exist', async () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1'); vi.stubEnv('DRAFTS_DIR', '/nonexistent/drafts')
    await expect(getAllPosts()).resolves.toBeInstanceOf(Array)
  })
  it('throws on posts/drafts slug collision', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    vi.stubEnv('DRAFTS_DIR', path.resolve(__dirname, '../fixtures/drafts-collision'))
    expect(() => getPostPaths()).toThrow(/slug collision: "test-post"/)
  })
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/mdx.test.ts -t 'drafts directory'` → 「sees drafts dir」·「throws」 FAIL
- [ ] **Step 3: 구현** — `getPostFiles(dir = POSTS_PATH)`는 그대로 두고, 호출부가 쓰는 새 비공개 함수 `getAllContentFiles(): string[]`를 만들어 `getPostFiles(POSTS_PATH)` + (`draftsEnabled()`이면 `getPostFiles(getDraftsPath())`)를 합치고 basename 충돌을 검사한다. `getPostFilePath`·`_getAllPosts`·`getPostPaths`의 `getPostFiles()` 호출을 `getAllContentFiles()`로 바꾼다. `vitest.config.ts` env에 `DRAFTS_DIR: path.resolve(__dirname, '__tests__/fixtures/drafts')`. `.gitignore`에 `/content/drafts/`.
- [ ] **Step 4: 통과 확인** — `npx vitest run __tests__/lib/mdx.test.ts` → 전부 PASS(기존 테스트 포함)
- [ ] **Step 5: 커밋** — `feat(drafts): 개발 모드에서 content/drafts 탐색, 슬러그 충돌은 오류`

---

### Task 3: 목록·정적 경로의 초안 규칙

**Files:**
- Modify: `lib/mdx.ts:193` (`_getAllPosts` 기본값), `lib/mdx.ts:228-241` (`getPostPaths`)
- Test: `__tests__/lib/mdx.test.ts`

**Interfaces:**
- Produces: `_getAllPosts(includeDrafts: boolean = draftsEnabled())` — 기본값만 바뀐다. 명시 인자(`getAllPosts(true)`)는 그대로 동작.
- Produces: `getPostPaths(): Array<{ slug: string[] }>` — 각 파일의 frontmatter를 gray-matter로 읽어 `data.draft === true`인 파일은 `draftsEnabled()`가 아니면 뺀다. 중복 파일명 경고는 그대로.
- 참고: `getAllPosts = cache(_getAllPosts)`는 vitest(React 서버 컨텍스트 없음)에서 캐시하지 않는다 — 기존 테스트가 `getAllPosts(true)`·`getAllPosts(false)`를 같은 파일에서 다른 결과로 단정하고 있다(mdx.test.ts 149~156행).

- [ ] **Step 1: 실패하는 테스트**

```ts
describe('draft visibility', () => {
  it('getPostPaths excludes draft files by default', () => {
    expect(getPostPaths()).not.toContainEqual({ slug: ['draft-post'] })
  })
  it('getAllPosts includes drafts from both dirs when INCLUDE_DRAFTS=1', async () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    const slugs = (await getAllPosts()).map((p) => p.slug)
    expect(slugs).toContain('draft-post')
    expect(slugs).toContain('draft-in-drafts')
  })
  it('getPostPaths includes drafts when INCLUDE_DRAFTS=1', () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    const paths = getPostPaths()
    expect(paths).toContainEqual({ slug: ['draft-post'] })
    expect(paths).toContainEqual({ slug: ['draft-in-drafts'] })
  })
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/mdx.test.ts -t 'draft visibility'` → 첫 번째·세 번째 FAIL
- [ ] **Step 3: 구현** — 위 Interfaces대로. `getPostPaths`의 frontmatter 읽기는 `matter(fs.readFileSync(file, 'utf-8')).data`만 쓴다(MDX 컴파일 안 함).
- [ ] **Step 4: 통과 확인** — `npx vitest run __tests__/lib/mdx.test.ts` → PASS. 기존 「should not include draft posts by default」(118·143행)가 그대로 통과하는지 눈으로 확인.
- [ ] **Step 5: 커밋** — `feat(drafts): 초안은 개발 모드에서만 목록·정적 경로에 포함`

---

### Task 4: frontmatter `seriesSlug` 읽기와 검증

**Files:**
- Modify: `types/post.ts:3-18` (`Post`), `types/post.ts:27-39` (`PostFrontmatter`) — 둘 다 `seriesSlug?: string` 추가(`seriesOrder` 다음 줄)
- Modify: `lib/mdx.ts:134-138` (검증), `lib/mdx.ts:174-175` (객체), `lib/mdx.ts:265-278` (`getPostFrontmatter`)
- Create: `__tests__/fixtures/posts/2025/slugged-series-1.mdx`, `slugged-series-2.mdx` — `series: "슬러그 픽스처 시리즈"` · `seriesSlug: "slugged-series"` · `seriesOrder: 1`/`2` · `tags: [slugged-fixture]` · `date: "2025-03-01"`/`"2025-03-02"` · 본문 한 문단(다른 픽스처와 겹치는 단어 없이)
- Create: `__tests__/fixtures/posts/2025/bad-series-slug.mdx` — `series: "Bad Slug Series"` · `seriesSlug: "Bad Slug"` (형식 위반)
- Create: `__tests__/fixtures/posts/2025/orphan-series-slug.mdx` — `seriesSlug: "orphan"`만 있고 `series` 없음
- Test: `__tests__/lib/mdx.test.ts`

**Interfaces:**
- Produces: `export const SERIES_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/` (`lib/mdx.ts`).
- Produces: `Post.seriesSlug` — frontmatter 값. `series`가 없으면 `undefined`(값이 있어도 `console.warn` 후 무시). 형식 위반이면 `console.warn` 후 `getPostBySlug`·`getPostFrontmatter`가 `null`(기존 title/date 누락과 같은 처리).

- [ ] **Step 1: 실패하는 테스트**

```ts
describe('seriesSlug', () => {
  it('reads seriesSlug from frontmatter', async () => {
    expect((await getPostBySlug('slugged-series-1'))?.seriesSlug).toBe('slugged-series')
    expect(getPostFrontmatter('slugged-series-1')?.seriesSlug).toBe('slugged-series')
  })
  it('is undefined when frontmatter has no seriesSlug', async () => {
    expect((await getPostBySlug('sample-series-1'))?.seriesSlug).toBeUndefined()
  })
  it('rejects a seriesSlug that is not lowercase-hyphen', async () => {
    expect(await getPostBySlug('bad-series-slug')).toBeNull()
    expect(getPostFrontmatter('bad-series-slug')).toBeNull()
  })
  it('keeps the post but drops seriesSlug when series is missing', async () => {
    const post = await getPostBySlug('orphan-series-slug')
    expect(post).not.toBeNull()
    expect(post?.seriesSlug).toBeUndefined()
  })
})
```

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/mdx.test.ts -t seriesSlug` → FAIL(타입 오류 또는 undefined)
- [ ] **Step 3: 구현** — 타입 2곳, `lib/mdx.ts`에 비공개 `readSeriesSlug(data, slug): string | null | undefined` 하나로 두 호출부(`getPostBySlug`·`getPostFrontmatter`)가 같은 규칙을 쓴다(`null`=형식 위반 → 호출부가 `null` 반환, `undefined`=없음/무시).
- [ ] **Step 4: 통과 확인** — `npx vitest run` 전체 → PASS. 픽스처 4편이 늘어 다른 파일(posts·tags·search·series)의 단정이 깨지면, 깨진 단정이 **픽스처 개수에 묶인 것**인지 확인하고 픽스처 독립적으로 고친다. 5파일 넘게 손대야 하면 멈추고 질문(브리프 경계).
- [ ] **Step 5: 커밋** — `feat(series): frontmatter seriesSlug 읽기·형식 검증`

---

### Task 5: 시리즈 슬러그가 `seriesSlug`를 우선한다

**Files:**
- Modify: `lib/series.ts:15-70` (`getAllSeries`)
- Modify: `components/post/SeriesNavTop.tsx:47` — `encodeURIComponent(series.name)` → `series.slug`
- Create: `__tests__/fixtures/series-conflict/mismatch/a.mdx`, `b.mdx` — 둘 다 `series: "불일치 시리즈"`, `seriesSlug`는 `"mismatch-a"`/`"mismatch-b"`, `draft: true`
- Create: `__tests__/fixtures/series-conflict/duplicate/c.mdx` — `series: "다른 이름"` · `seriesSlug: "sample-series"`(posts 픽스처 「Sample Series」의 계산 슬러그와 같음) · `draft: true`
- Test: `__tests__/lib/series.test.ts`, Create: `__tests__/components/SeriesNavTop.test.tsx`

**Interfaces:**
- Consumes: Task 4 `Post.seriesSlug`.
- Produces: `SeriesInfo.slug` — 그 시리즈 글들의 `seriesSlug`가 하나로 같으면 그 값, 없으면 `seriesToSlug(originalName)`. 같은 시리즈에 서로 다른 `seriesSlug` → `throw new Error('[series] "<name>" has conflicting seriesSlug: <a>, <b>')`. 서로 다른 시리즈가 같은 slug로 모이면 → `throw new Error('[series] duplicate series slug "<slug>": <name1>, <name2>')`.
- `getSeriesInfo(series)`는 바꾸지 않는다 — 입력이 `seriesSlug` 값이면 `seriesToSlug(입력) === 입력`이라 기존 `s.slug === seriesToSlug(series)` 비교로 맞는다(테스트로 잠근다). `app/series/[series]/page.tsx`는 `item.slug`를 쓰므로 변경 없음. `SeriesCard`는 이미 `series.slug`.

- [ ] **Step 1: 실패하는 테스트** (`series.test.ts`. 상단 import에 `vi`·`afterEach`와 `import path from 'path'`를 더하고 `afterEach(() => vi.unstubAllEnvs())`)

```ts
describe('seriesSlug', () => {
  it('uses seriesSlug for the series slug and keeps the Korean name', async () => {
    const s = await getSeriesInfo('slugged-series')
    expect(s?.name).toBe('슬러그 픽스처 시리즈')
    expect(s?.slug).toBe('slugged-series')
    expect(s?.posts.map((p) => p.slug)).toEqual(['slugged-series-1', 'slugged-series-2'])
  })
  it('finds the same series by display name', async () => {
    expect((await getSeriesInfo('슬러그 픽스처 시리즈'))?.slug).toBe('slugged-series')
  })
  it('falls back to seriesToSlug when no seriesSlug', async () => {
    expect((await getSeriesInfo('Sample Series'))?.slug).toBe('sample-series')
  })
  it('throws when one series has conflicting seriesSlug values', async () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    vi.stubEnv('DRAFTS_DIR', path.resolve(__dirname, '../fixtures/series-conflict/mismatch'))
    await expect(getAllSeries()).rejects.toThrow(/conflicting seriesSlug/)
  })
  it('throws when two series resolve to the same slug', async () => {
    vi.stubEnv('INCLUDE_DRAFTS', '1')
    vi.stubEnv('DRAFTS_DIR', path.resolve(__dirname, '../fixtures/series-conflict/duplicate'))
    await expect(getAllSeries()).rejects.toThrow(/duplicate series slug "sample-series"/)
  })
})
```

`SeriesNavTop.test.tsx`: `@testing-library/react`(setupTests.tsx 참고)로 `navigation = { current, previous: null, next: null, series: { name: '슬러그 픽스처 시리즈', slug: 'slugged-series', count: 1, posts: [current], totalReadingTime: 1 } }`를 렌더하고 `screen.getByRole('link', { name: '슬러그 픽스처 시리즈' })`의 `href`가 `/series/slugged-series`임을 단정. `current`는 `__tests__/helpers/mockData.ts`의 포스트 목을 쓴다(없으면 최소 `Post` 객체를 테스트 안에 만든다).

- [ ] **Step 2: 실패 확인** — `npx vitest run __tests__/lib/series.test.ts __tests__/components/SeriesNavTop.test.tsx` → 첫·둘째·넷째·다섯째와 컴포넌트 테스트 FAIL
- [ ] **Step 3: 구현** — `getAllSeries` 맵 값에 `slugs: Set<string>`를 모으고 SeriesInfo를 만들 때 위 규칙으로 `slug`를 정한다. 전체 배열을 만든 뒤 slug 중복 검사. `SeriesNavTop` 한 줄.
- [ ] **Step 4: 통과 확인** — `npx vitest run` → 전부 PASS
- [ ] **Step 5: 커밋** — `feat(series): seriesSlug로 시리즈 주소 결정, 불일치·중복은 빌드 오류`

---

### Task 6: 문서 — README·CLAUDE.md

**Files:**
- Modify: `README.md:27-44` (「글 쓰기」 절 뒤에 「초안 미리보기」 절 추가, frontmatter 선택 항목에 `seriesSlug`)
- Modify: `CLAUDE.md:12-21` (frontmatter 선택 항목에 `seriesSlug`, 「테스트」 절에 `DRAFTS_DIR` 한 줄)

- [ ] **Step 1: README 「초안 미리보기」 절** — 내용은 아래 넷뿐:
  1. 초안 정본은 볼트 `~/Documents/obsidian/jh.vault/projects/blog/drafts/`. 저장소에는 심링크만: `mkdir -p content && ln -s "$HOME/Documents/obsidian/jh.vault/projects/blog/drafts" content/drafts` (`/content/drafts/`는 `.gitignore`).
  2. 초안 파일은 `draft: true`를 달고, `npm run dev`에서만 보인다. 운영 빌드는 `content/drafts/`를 읽지 않고 `draft: true` 글은 주소·sitemap·RSS에서도 뺀다. `INCLUDE_DRAFTS=1`은 개발 모드 밖에서 초안을 강제로 포함하는 명시 플래그다 — CI·배포 환경에 두지 않는다.
  3. `content/posts/`와 `content/drafts/`에 같은 파일명이 있으면 개발 서버가 오류를 낸다. 게시할 때는 파일을 **옮긴다**(사본 금지).
  4. `seriesSlug`(선택, 영문 소문자·숫자·하이픈): 시리즈 주소 `/series/<seriesSlug>/`. 같은 시리즈 글은 같은 값. 없으면 시리즈 이름에서 만든다.
- [ ] **Step 2: CLAUDE.md** — 선택 항목 줄에 `seriesSlug`(형식·같은 시리즈 같은 값), 테스트 절에 「`DRAFTS_DIR`은 `__tests__/fixtures/drafts`」.
- [ ] **Step 3: 확인** — `npm run lint` rc 0(마크다운은 대상 아님이지만 저장소 전체 lint가 깨지지 않는지)
- [ ] **Step 4: 커밋** — `docs: 초안 미리보기 절차·seriesSlug 필드`

---

### Task 7: 실측 — 개발 서버에서 보이고, 운영 빌드에는 없다

**Files:** 임시 파일만(커밋하지 않음). 결과는 볼트 `projects/blog/status.md` 「만든/고친 것」에 명령·출력 한 줄씩.

전제: 볼트에 `projects/blog/drafts/`가 있다(허브가 기동 전에 만든다 — 출처: 이 계획). 심링크는 README 절차대로 **실제로** 만든다(이 심링크는 남겨 둔다 — gitignore 대상).

- [ ] **Step 1: 임시 초안 둘**
  - `content/drafts/tmp-draft-check.mdx` — `title: 임시 초안` · `description: 초안 미리보기 실측` · `date: "2026-10-27"` · `tags: [tmp]` · `series: "임시 시리즈"` · `seriesSlug: "tmp-series"` · `seriesOrder: 1` · `draft: true`
  - `content/posts/2026/tmp-draft-in-posts.mdx` — `draft: true`, 시리즈 없음(안전망 확인용)
- [ ] **Step 2: 개발 서버** — `npm run dev` 백그라운드(포트는 출력에서 읽는다). 그 뒤:
  - `curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/posts/tmp-draft-check/` → `200`, 본문에 `임시 초안` 포함
  - `.../series/tmp-series/` → `200`, 본문에 `임시 시리즈`
  - `.../posts/tmp-draft-in-posts/` → `200`
  - 서버 종료.
- [ ] **Step 3: 운영 빌드** — `INCLUDE_DRAFTS` 비운 채 `npm run build:production` rc 0. 그 뒤:
  - `test ! -e out/posts/tmp-draft-check && test ! -e out/posts/tmp-draft-in-posts && test ! -e out/series/tmp-series; echo rc=$?` → `rc=0`
  - `grep -c 'tmp-' out/sitemap.xml out/rss.xml` → 둘 다 `0`
- [ ] **Step 4: 정리** — 임시 파일 둘 삭제(`content/posts/2026`이 비면 디렉터리도), `git status --porcelain`에 임시 파일·`content/drafts` 없음(`.obsidian/` 미추적은 기존 항목).
- [ ] **Step 5: 기록** — status.md에 Step 2·3의 명령과 출력.

---

### Task 8: 게이트·PR

- [ ] **Step 1: Node 24 게이트** — `node -v`가 `v24`로 시작하는 셸에서 `npm ci && npm run lint && npm run type-check && npm run test:run && npm run build:production; echo GATE_RC=$?` → `GATE_RC=0`. 글 0건(`content/posts` 없음) 상태에서 빌드가 통과한 것이 곧 「글 0건 빌드」 확인이다.
- [ ] **Step 2: PR** — 브랜치 `feat/draft-preview-series-slug` push, PR 제목 `feat(drafts): 개발 모드 초안 미리보기·seriesSlug`, 본문에 변경 요약·Task 7 실측 결과·`Closes joonangler/jhq#<이슈 A 번호>`. CI `test` 초록까지 확인(`gh pr checks`).
- [ ] **Step 3: 보고** — status.md 보고 4항목, 볼트 `log.md` task 항목, 이슈 코멘트, 허브에 완료 메시지. 병합은 허브.
