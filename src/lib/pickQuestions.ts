import type { Question, Domain } from '../types';

/** 회차당 문항 수 — 실제 SAA-C03 시험과 동일하게 65문항 */
export const ROUND_SIZE = 65;

export type RoundFilter = number | 'all';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 전체 문제 수 기준으로 만들 수 있는 회차 개수 (마지막 회차는 65문항보다 적을 수 있음) */
export function getRoundCount(allQuestions: Question[]): number {
  return Math.ceil(allQuestions.length / ROUND_SIZE);
}

/** n회차(1부터 시작)에 해당하는 문제 묶음 — 항상 같은 문제, 같은 순서 */
export function getRoundQuestions(allQuestions: Question[], round: number): Question[] {
  const start = (round - 1) * ROUND_SIZE;
  return allQuestions.slice(start, start + ROUND_SIZE);
}

/**
 * 연습 모드에 보여줄 문제 목록을 만든다.
 * - round가 'all'이면 기존처럼 도메인으로 거르고 무작위로 섞는다.
 * - round가 숫자면 해당 회차 문제를 고정된 순서 그대로 유지한다(섞지 않음).
 */
export function pickQuestions(
  allQuestions: Question[],
  domain: Domain | 'all',
  round: RoundFilter = 'all',
): Question[] {
  const byDomain = (list: Question[]) =>
    domain === 'all' ? list : list.filter(q => q.domain === domain);

  if (round === 'all') {
    return shuffle(byDomain(allQuestions));
  }

  return byDomain(getRoundQuestions(allQuestions, round));
}
