import type { Question } from '../types';
import rawQuestions from '../data/questions.json';

/**
 * 보기 순서를 문제 ID 기준으로 섞어서 정답 위치 편향을 없앤다.
 *
 * 원본 데이터는 정답이 B에 67% 몰려 있었다. 그대로 두면 "문제를 안 읽고 B를 찍는" 습관이
 * 생기므로 보기를 재배치한다. 단, 무작위로 섞으면 회차를 다시 열 때마다 순서가 달라져
 * "1회차는 항상 같은 문제"라는 원칙이 깨진다. 그래서 문제 ID를 시드로 쓰는 결정론적
 * 셔플을 사용한다 — 같은 문제는 언제 열어도 항상 같은 보기 순서를 갖는다.
 */

/** 문자열을 32비트 정수 시드로 변환 (FNV-1a) */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 시드 기반 의사난수 생성기 (mulberry32) */
function makeRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 보기 순서를 섞고 정답 인덱스를 새 위치로 다시 매핑한다 */
function shuffleChoices(q: Question): Question {
  const rng = makeRng(hashSeed(q.id));
  const order = q.choices.map((_, i) => i);

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  // order[newIndex] = oldIndex 이므로, 옛 인덱스를 새 인덱스로 뒤집어 찾는다
  const newIndexOf = new Map<number, number>();
  order.forEach((oldIdx, newIdx) => newIndexOf.set(oldIdx, newIdx));

  const remap = (a: number) => newIndexOf.get(a) ?? a;

  return {
    ...q,
    choices: order.map(oldIdx => q.choices[oldIdx]),
    answer: Array.isArray(q.answer)
      ? q.answer.map(remap).sort((x, y) => x - y)
      : remap(q.answer),
  };
}

/** 앱 전체가 사용하는 문제 목록 — 보기 순서가 정규화된 상태 */
export const QUESTIONS: Question[] = (rawQuestions as Question[]).map(shuffleChoices);
