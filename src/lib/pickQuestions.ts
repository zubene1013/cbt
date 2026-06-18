import type { Question, Domain } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickQuestions(allQuestions: Question[], domain: Domain | 'all'): Question[] {
  const filtered = domain === 'all'
    ? allQuestions
    : allQuestions.filter(q => q.domain === domain);
  return shuffle(filtered);
}
