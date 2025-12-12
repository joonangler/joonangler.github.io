/**
 * JSON-LD 스크립트 태그 렌더링 컴포넌트
 *
 * @note This is a Server Component (no 'use client' directive needed)
 */

interface JsonLdProps {
  data: Record<string, unknown>
}

/**
 * JSON-LD 스키마를 스크립트 태그로 렌더링
 * - Google과 같은 검색엔진이 페이지 구조를 이해하는데 도움
 * - Rich Results (리치 결과) 표시 가능
 *
 * @note Server Component - renders on server only
 * @security JSON.stringify with XSS protection via script tag escaping
 */
export function JsonLd({ data }: JsonLdProps) {
  // Escape script closing tags to prevent XSS
  const jsonString = JSON.stringify(data).replace(/<\//g, '<\\/')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  )
}
