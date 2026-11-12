import { test, expect, type Page } from '@playwright/test'

// 색을 걷으며 토큰이 같은 값이 된 곳에서 상태(초점·올림·꺼짐)가 여전히 보이는지 계산 스타일로 본다.
const ringShadow = (page: Page, sel: string) =>
  page.locator(sel).evaluate((el) => {
    ;(el as HTMLElement).focus()
    return getComputedStyle(el).boxShadow
  })

test('keyboard focus on page numbers and tag links is a white ring with a black gap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/posts/')
  await page.waitForLoadState('networkidle')
  const pageLink = 'nav[aria-label="페이지 이동"] a'
  expect(await page.locator(pageLink).count()).toBeGreaterThan(0)
  for (let i = 0; i < (await page.locator(pageLink).count()); i++) {
    const s = await ringShadow(page, `${pageLink} >> nth=${i}`)
    expect(s, `pagination link ${i}`).toContain('rgb(255, 255, 255)')
    expect(s, `pagination link ${i}`).toMatch(/rgb\(0, 0, 0\) 0px 0px 0px 2px/)
  }
  await page.goto('/tags/')
  await page.waitForLoadState('networkidle')
  // 구역 내비의 「태그」 링크(/tags/)는 사이트 틀의 초점 규칙을 쓰므로 뺀다
  const TAG = 'main a[href^="/tags/"]:not([href="/tags/"])'
  const tagLinks = page.locator(TAG)
  const n = await tagLinks.count()
  expect(n).toBeGreaterThan(1)
  for (let i = 0; i < n; i++) {
    const s = await ringShadow(page, `${TAG} >> nth=${i}`)
    expect(s, `tag link ${i}`).toContain('rgb(255, 255, 255)')
    expect(s, `tag link ${i}`).toMatch(/rgb\(0, 0, 0\) 0px 0px 0px 2px/)
  }
})

// 배경색을 검정 위에 합성한 밝기(0~255) — 계산 스타일이 color-mix()·oklab()으로 나와도 읽힌다
const faceOnBlack = (badge: ReturnType<Page['locator']>) =>
  badge.evaluate((el) => {
    const cv = document.createElement('canvas')
    cv.width = cv.height = 1
    const ctx = cv.getContext('2d', { willReadFrequently: true })!
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 1, 1)
    ctx.fillStyle = getComputedStyle(el).backgroundColor
    ctx.fillRect(0, 0, 1, 1)
    return ctx.getImageData(0, 0, 1, 1).data[0]
  })

test('a tag badge gets visibly brighter on hover', async ({ page }) => {
  await page.goto('/tags/')
  await page.waitForLoadState('networkidle')
  const badge = page.locator('main section:last-of-type a[href^="/tags/"]:not([href="/tags/"]) span').first()
  const rest = await faceOnBlack(badge)
  await badge.hover()
  // 6% 면(≈15)에서 올려 눈에 띄게 — 4.8%로 옅어지거나 1~2단계만 오르는 것은 보이지 않는다
  await expect.poll(() => faceOnBlack(badge)).toBeGreaterThanOrEqual(rest + 10)
})

test('tag cloud links ease their scale on hover instead of snapping', async ({ page }) => {
  await page.goto('/tags/')
  await page.waitForLoadState('networkidle')
  const prop = await page.locator('main a.group[href^="/tags/"]').first().evaluate((el) => getComputedStyle(el).transitionProperty)
  expect(prop).toContain('scale')
  expect(prop).not.toBe('all')
})

test('a disabled previous arrow looks different from an enabled next arrow', async ({ page }) => {
  await page.goto('/posts/')
  await page.waitForLoadState('networkidle')
  const nav = page.locator('nav[aria-label="페이지 이동"]')
  const disabled = nav.locator('div').first()
  const enabled = nav.locator('a[aria-label="다음 페이지"]')
  const face = (l: typeof disabled) => l.evaluate((el) => { const c = getComputedStyle(el); return `${c.backgroundColor}|${c.borderTopColor}` })
  expect(await face(disabled)).not.toBe(await face(enabled))
})
