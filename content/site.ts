/**
 * 사이트 화면 문안. 홈 문장과 페이지 공통 문안은 여기 한 곳에서 고친다.
 * 확정 전 문안에는 provisional 표시를 단다 — 공개 전 content/ 아래 그 표시의 grep 결과가 비어야 한다(계획 Global Constraints).
 */

export interface Copy {
  text: string
  provisional?: true
}

/** 홈 첫 화면. 줄마다 낱말 배열, 끝에 마침표 없음(설계 §5-1, 사용자 확정). */
export const HOME_HERO: { lines: string[][]; sub: string } = {
  lines: [['만들고,'], ['내놓고,'], ['수익까지', '도전합니다']],
  sub: 'AI와 함께 답을 찾아가며, 그 과정을 기록으로 남깁니다.',
}

export const SERVICES_PAGE: {
  title: '서비스'
  intro: Copy
  principles: { title: string; body: Copy }[]
  notDone: string[]
  contactLine: Copy
} = {
  title: '서비스',
  intro: { text: '맡는 일과 가격, 일하는 방식입니다.', provisional: true },
  principles: [
    {
      title: '결제 전에 진단',
      body: { text: '증상 화면과 오류 메시지, 소스를 먼저 봅니다.', provisional: true },
    },
    {
      title: '범위와 금액은 글로',
      body: { text: '범위와 금액을 먼저 글로 알려 드립니다.', provisional: true },
    },
    {
      title: '복사본에서 작업',
      body: { text: '운영 중인 데이터와 결제 기능은 승인 없이 손대지 않습니다.', provisional: true },
    },
    {
      title: '문서와 권한 반납',
      body: {
        text: '어디를 왜 바꿨는지 문서로 드리고, 공유받은 키와 비밀번호는 작업 뒤 새로 발급하시기를 권합니다.',
        provisional: true,
      },
    },
  ],
  notDone: ['소스를 받을 수 없는 서비스의 수정', '허락 없는 접근'],
  contactLine: { text: '하려는 일이 있으면 문의로 알려 주세요', provisional: true },
}

export const CONTACT_PAGE: {
  title: '문의'
  lead: '하려는 일을 알려 주세요'
  hints: string[]
  consult: string
} = {
  title: '문의',
  lead: '하려는 일을 알려 주세요',
  hints: ['증상 화면', '오류 메시지', '소스', '쓴 도구', '배포할 곳'],
  consult: '먼저 상담으로 할 일과 금액을 정합니다. 진행과 결제 방법은 상담에서 안내합니다.',
}
