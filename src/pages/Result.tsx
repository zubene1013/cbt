import { useLocation, useNavigate } from 'react-router-dom';
import type { ExamAttempt, Question } from '../types';
import { PASS_SCORE } from '../types';
import DomainBar from '../components/DomainBar';
import QuestionCard from '../components/QuestionCard';
import Explanation from '../components/Explanation';

interface LocationState {
  attempt: ExamAttempt;
  questions: Question[];
}

export default function Result() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();

  if (!state) { navigate('/'); return null; }

  const { attempt, questions } = state;
  const wrongAnswers = attempt.answers.filter(a => !a.correct);
  const wrongQuestions = wrongAnswers.map(a => ({
    q: questions.find(q => q.id === a.questionId)!,
    selected: a.selected,
  })).filter(x => x.q);

  const m = Math.floor(attempt.durationSec / 60);
  const s = attempt.durationSec % 60;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className={`px-4 py-8 text-center ${attempt.passed ? 'bg-green-600' : 'bg-red-600'}`}>
        <div className="text-5xl mb-2">{attempt.passed ? '🎉' : '📝'}</div>
        <div className="text-white text-4xl font-bold">{attempt.score}</div>
        <div className="text-white/80 text-sm">/ 1000점</div>
        <div className={`mt-2 inline-block px-4 py-1 rounded-full font-bold text-sm ${attempt.passed ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-100'}`}>
          {attempt.passed ? '합격' : `불합격 (합격선 ${PASS_SCORE}점)`}
        </div>
        <div className="text-white/70 text-xs mt-2">
          {attempt.correctCount}/{attempt.totalQuestions}개 정답 · {m}분 {s}초
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto flex flex-col gap-6">
        {/* 도메인별 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">도메인별 정답률</h2>
          <DomainBar byDomain={attempt.byDomain} />
        </div>

        {/* 오답 목록 */}
        {wrongQuestions.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">오답 ({wrongQuestions.length}개)</h2>
            <div className="flex flex-col gap-6">
              {wrongQuestions.map(({ q, selected }) => (
                <div key={q.id} className="border-b pb-5 last:border-0 last:pb-0">
                  <QuestionCard
                    question={q}
                    index={0}
                    total={1}
                    selected={selected}
                    onSelect={() => {}}
                    showAnswer
                  />
                  <div className="mt-3">
                    <Explanation question={q} selected={selected} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-xl bg-[#1e3a5f] text-white font-bold">
            홈으로
          </button>
          <button onClick={() => navigate('/stats')} className="flex-1 py-3 rounded-xl border-2 border-[#1e3a5f] text-[#1e3a5f] font-bold">
            통계 보기
          </button>
        </div>
      </div>
    </div>
  );
}
