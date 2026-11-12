/**
 * 숨김 안전 장치. 머리의 인라인 스크립트가 `js` 클래스를 세워 숨김 스타일(스크롤 등장·내비 접힘)을 켜고,
 * 화면 코드가 섰다는 표시(`window.__hydrated`, HydrationMark가 세운다)가 일정 시간 안에 안 서면 클래스를 뗀다.
 * 표시가 선 뒤에는 타이머가 아무 일도 하지 않는다.
 */
export const JS_GUARD_MS = 3000

export const JS_GUARD_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!window.__hydrated)d.classList.remove('js')},${JS_GUARD_MS})})()`
