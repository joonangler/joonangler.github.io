import Link from 'next/link'
import { type TagInfo } from '@/types/post'
import { cn } from '@/lib/utils'

interface TagCloudProps {
  tags: Array<TagInfo & { weight: number }>
  className?: string
}

/**
 * 태그 클라우드 컴포넌트
 *
 * 가중치에 따라 다른 크기와 색상으로 태그를 표시합니다.
 * 가중치는 1-5 범위이며, 포스트 수에 비례합니다.
 *
 * @example
 * const tagCloud = await getTagCloud()
 * <TagCloud tags={tagCloud} />
 */
export function TagCloud({ tags, className }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>아직 태그가 없습니다</p>
      </div>
    )
  }

  // 가중치에 따른 스타일 결정
  const getTagStyle = (weight: number) => {
    /*
    | weight | 계산식                  | fontSize          |
    |--------|-----------------------|-------------------|
    | 1      | 0.75 + (1-1) × 0.3125 | 0.75rem (12px)    |
    | 2      | 0.75 + (2-1) × 0.3125 | 1.0625rem (~17px) |
    | 3      | 0.75 + (3-1) × 0.3125 | 1.375rem (22px)   |
    | 4      | 0.75 + (4-1) × 0.3125 | 1.6875rem (~27px) |
    | 5      | 0.75 + (5-1) × 0.3125 | 2rem (32px)       |
    
    0.3125 ?
    (최대크기 - 최소크기) / (최대weight - 최소weight)
    = (2 - 0.75) / (5 - 1)
    = 1.25 / 4
    = 0.3125

    계산식 ?
    선형 보간(Linear Interpolation) 공식:
    결과 = 최소값 + (입력 - 입력최소) × 증분계수

    폰트 크기 (1: 0.75rem ~ 5: 2rem)
    const fontSize = 0.75 + (weight - 1) * 0.3125
    */

    // 폰트 크기 (1: 1rem ~ 5: 3rem)
    const fontSize = 1 + (weight - 1) * 0.5

    // 색은 무게 4·5만 본문 글자색, 나머지는 보조 글자색 — 크기와 굵기가 무게를 그대로 말한다
    const colorClass =
      weight >= 3.5 ? 'text-foreground hover:text-foreground' : 'text-muted-foreground hover:text-foreground'

    // 폰트 굵기
    const fontWeight = weight >= 4 ? 'font-bold' : weight >= 3 ? 'font-semibold' : 'font-medium'

    return {
      fontSize: `${fontSize}rem`,
      colorClass,
      fontWeight,
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4', className)}>
      {tags.map((tag) => {
        const { fontSize, colorClass, fontWeight } = getTagStyle(tag.weight)

        return (
          <Link
            key={tag.slug}
            href={`/tags/${encodeURIComponent(tag.slug)}`}
            className={cn(
              'group relative inline-block rounded-sm transition-[color,scale] duration-200',
              'hover:scale-110',
              'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              colorClass,
              fontWeight
            )}
            style={{ fontSize }}
            title={`글 ${tag.count}편`}
          >
            {tag.name}

            {/* 툴팁 */}
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-primary px-2 py-1 text-xs font-normal text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
              글 {tag.count}편
            </span>
          </Link>
        )
      })}
    </div>
  )
}
