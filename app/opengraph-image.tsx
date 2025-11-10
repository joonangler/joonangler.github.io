import { ImageResponse } from 'next/og'

// Route segment config for static export
export const dynamic = 'force-static'
export const runtime = 'nodejs'

// Image metadata
export const alt = 'Blog'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom right, #0070f3, #00dfd8)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>My Blog</div>
        <div style={{ fontSize: 48, marginTop: 40, opacity: 0.8 }}>
          Personal Tech Blog
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
