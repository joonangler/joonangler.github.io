import { ImageResponse } from 'next/og'

// Route segment config for static export
export const dynamic = 'force-static'
export const runtime = 'nodejs'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// 검정 바탕 흰 「J」 — 로고가 없어 라틴 글자만 쓴다(기본 글꼴로 그려져 서체 파일이 필요 없다)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        J
      </div>
    ),
    {
      ...size,
    }
  )
}
