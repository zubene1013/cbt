import type { ExamAttempt } from '../types';

const KEY = 'saa-cbt-history';

export function getHistory(): ExamAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: ExamAttempt): void {
  const history = getHistory();
  history.unshift(attempt);
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 100)));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
