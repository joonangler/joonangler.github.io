import { ImageResponse } from 'next/og'

// Route segment config for static export
export const dynamic = 'force-static'
export const runtime = 'nodejs'

// Image metadata
export const alt = 'Joonangler'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// 검정 바탕 흰 「Joonangler」 — 라틴 글자만이라 기본 글꼴로 충분하다
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: '#000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          letterSpacing: '-0.04em',
        }}
      >
        Joonangler
      </div>
    ),
    {
      ...size,
    }
  )
}
