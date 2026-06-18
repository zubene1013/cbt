import type { Question, AnswerRecord, ExamAttempt, Domain } from '../types';
import { PASS_SCORE } from '../types';

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);
}

export function isCorrect(question: Question, selected: number | number[]): boolean {
  if (question.type === 'multiple') {
    const ans = Array.isArray(question.answer) ? question.answer : [question.answer];
    const sel = Array.isArray(selected) ? selected : [selected];
    return arraysEqual(ans, sel);
  }
  return question.answer === selected;
}

export function calcScore(
  questions: Question[],
  answers: Record<string, number | number[]>,
  durationSec: number
): ExamAttempt {
  const records: AnswerRecord[] = [];
  const domainCorrect: Record<Domain, number> = { secure: 0, resilient: 0, performance: 0, cost: 0 };
  const domainTotal: Record<Domain, number> = { secure: 0, resilient: 0, performance: 0, cost: 0 };

  for (const q of questions) {
    const selected = answers[q.id] ?? [];
    const correct = isCorrect(q, selected);
    records.push({ questionId: q.id, selected, correct });
    domainTotal[q.domain]++;
    if (correct) domainCorrect[q.domain]++;
  }

  const correctCount = records.filter(r => r.correct).length;
  const score = Math.round((correctCount / questions.length) * 1000);
  const byDomain = Object.fromEntries(
    (['secure', 'resilient', 'performance', 'cost'] as Domain[]).map(d => [
      d,
      domainTotal[d] > 0 ? domainCorrect[d] / domainTotal[d] : 0,
    ])
  ) as Record<Domain, number>;

  const now = new Date();
  return {
    attemptId: now.toISOString(),
    date: now.toISOString().slice(0, 10),
    score,
    passed: score >= PASS_SCORE,
    durationSec,
    totalQuestions: questions.length,
    correctCount,
    byDomain,
    answers: records,
  };
}
