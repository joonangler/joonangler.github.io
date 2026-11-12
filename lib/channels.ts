/**
 * 바닥과 문의에 보이는 채널. 주소가 없는 채널은 뺀다.
 * NEXT_PUBLIC_*는 빌드에 박히려면 process.env.NEXT_PUBLIC_X로 직접 읽어야 한다.
 */

export interface Channel {
  id: 'github' | 'threads' | 'youtube' | 'instagram'
  name: string
  href: string
}

export function getChannels(): Channel[] {
  const all: { id: Channel['id']; name: string; href: string | undefined }[] = [
    { id: 'github', name: 'GitHub', href: process.env.NEXT_PUBLIC_GITHUB_URL },
    { id: 'threads', name: '스레드', href: process.env.NEXT_PUBLIC_THREADS_URL },
  ]
  return all.filter((c): c is Channel => Boolean(c.href))
}
