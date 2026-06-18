export type Domain = 'secure' | 'resilient' | 'performance' | 'cost';

export interface Question {
  id: string;
  domain: Domain;
  question: string;
  choices: string[];
  answer: number | number[];
  explanation: string;
  type: 'single' | 'multiple';
}

export interface AnswerRecord {
  questionId: string;
  selected: number | number[];
  correct: boolean;
}

export interface ExamAttempt {
  attemptId: string;
  date: string;
  score: number;
  passed: boolean;
  durationSec: number;
  totalQuestions: number;
  correctCount: number;
  byDomain: Record<Domain, number>;
  answers: AnswerRecord[];
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  secure: '보안 아키텍처',
  resilient: '복원력 아키텍처',
  performance: '고성능 아키텍처',
  cost: '비용 최적화',
};

export const DOMAIN_WEIGHTS: Record<Domain, number> = {
  secure: 0.30,
  resilient: 0.26,
  performance: 0.24,
  cost: 0.20,
};

export const EXAM_QUESTIONS = 65;
export const EXAM_MINUTES = 130;
export const PASS_SCORE = 720;
