import NextImage from 'next/image'
import { cn } from '@/lib/utils'

interface MDXImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  caption?: string
  className?: string
}

/**
 * MDX 이미지 컴포넌트
 * - next/image 최적화
 * - 캡션 지원
 * - 반응형 크기 조절
 *
 * @note GitHub Pages 배포 시 next.config.ts에서 images.unoptimized: true 설정 필요
 * @see next.config.ts - images.unoptimized 설정 확인
 */
export function MDXImage({
  src,
  alt,
  width = 1200,
  height = 675,
  caption,
  className,
}: MDXImageProps) {
  return (
    <figure className="my-8">
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800',
          className
        )}
      >
        <NextImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-auto w-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
