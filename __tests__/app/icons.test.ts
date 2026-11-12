// @vitest-environment node
import { describe, expect, it } from 'vitest'
import Icon, { size as iconSize } from '@/app/icon'
import OgImage, { size as ogSize } from '@/app/opengraph-image'

/** PNG의 IHDR 청크(바이트 16~23)에서 가로세로를 읽는다 */
async function pngSize(res: Response) {
  const buf = Buffer.from(await res.arrayBuffer())
  expect(buf.subarray(1, 4).toString()).toBe('PNG')
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

describe('generated images', () => {
  it('the icon is a 32×32 png', async () => {
    expect(iconSize).toEqual({ width: 32, height: 32 })
    expect(await pngSize(Icon())).toEqual({ w: 32, h: 32 })
  })
  it('the og image is a 1200×630 png', async () => {
    expect(ogSize).toEqual({ width: 1200, height: 630 })
    expect(await pngSize(await OgImage())).toEqual({ w: 1200, h: 630 })
  })
})
