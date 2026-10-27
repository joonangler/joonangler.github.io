import path from 'path'

// 초안은 개발 모드 또는 INCLUDE_DRAFTS=1에서만 읽는다(spec §5-1)
export function draftsEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.INCLUDE_DRAFTS === '1'
  )
}

export function getDraftsPath(): string {
  return process.env.DRAFTS_DIR || path.join(process.cwd(), 'content', 'drafts')
}
