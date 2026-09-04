/**
 * 문제별 필기(획) 보관소.
 *
 * 앱이 떠 있는 동안만 메모리에 유지한다 — 페이지를 이동해도 필기가 남아 있고,
 * 앱을 완전히 종료(새로고침)하면 자연스럽게 사라진다. localStorage를 쓰지 않는 이유는
 * "앱을 종료했을 때는 지워져도 된다"는 요구사항에 맞고, 획 좌표가 쌓여 저장소가
 * 커지는 문제도 피할 수 있기 때문이다.
 */

export interface Point {
  x: number;
  y: number;
}

/** 획 하나 = 펜을 대고 뗄 때까지의 좌표 목록. 좌표는 캔버스 너비 대비 0~1 비율로 저장 */
export type Stroke = Point[];

const store = new Map<string, Stroke[]>();

/** 필기가 바뀌면 화면을 다시 그리도록 알리는 구독자 목록 */
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getStrokes(questionId: string): Stroke[] {
  return store.get(questionId) ?? [];
}

export function addStroke(questionId: string, stroke: Stroke): void {
  if (stroke.length < 2) return;
  const list = store.get(questionId) ?? [];
  store.set(questionId, [...list, stroke]);
  notify();
}

/** 현재 문제의 필기만 지운다 */
export function clearQuestion(questionId: string): void {
  store.delete(questionId);
  notify();
}

/** 모든 문제의 필기를 지운다 */
export function clearAll(): void {
  store.clear();
  notify();
}

/** 필기가 하나라도 있는 문제 수 — 버튼 활성화 판단에 쓴다 */
export function countPages(): number {
  return store.size;
}

export function hasStrokes(questionId: string): boolean {
  return (store.get(questionId)?.length ?? 0) > 0;
}
