import type { Question, Domain } from '../types';
import { DOMAIN_WEIGHTS, EXAM_QUESTIONS } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildExam(allQuestions: Question[]): Question[] {
  const byDomain = (domain: Domain) => allQuestions.filter(q => q.domain === domain);
  const domains: Domain[] = ['secure', 'resilient', 'performance', 'cost'];

  const counts: Record<Domain, number> = {
    secure: Math.round(EXAM_QUESTIONS * DOMAIN_WEIGHTS.secure),
    resilient: Math.round(EXAM_QUESTIONS * DOMAIN_WEIGHTS.resilient),
    performance: Math.round(EXAM_QUESTIONS * DOMAIN_WEIGHTS.performance),
    cost: EXAM_QUESTIONS - Math.round(EXAM_QUESTIONS * DOMAIN_WEIGHTS.secure)
      - Math.round(EXAM_QUESTIONS * DOMAIN_WEIGHTS.resilient)
      - Math.round(EXAM_QUESTIONS * DOMAIN_WEIGHTS.performance),
  };

  const picked: Question[] = [];
  for (const domain of domains) {
    const pool = shuffle(byDomain(domain));
    picked.push(...pool.slice(0, Math.min(counts[domain], pool.length)));
  }

  // 부족하면 남은 문제로 채움
  const needed = EXAM_QUESTIONS - picked.length;
  if (needed > 0) {
    const usedIds = new Set(picked.map(q => q.id));
    const rest = shuffle(allQuestions.filter(q => !usedIds.has(q.id)));
    picked.push(...rest.slice(0, needed));
  }

  return shuffle(picked);
}
