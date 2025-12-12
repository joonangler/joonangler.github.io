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

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#0070f3',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
          fontWeight: 'bold',
        }}
      >
        B
      </div>
    ),
    {
      ...size,
    }
  )
}
