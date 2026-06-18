import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildExam } from '../lib/examBuilder';
import { calcScore } from '../lib/scoring';
import { saveAttempt } from '../store/history';
import { EXAM_MINUTES } from '../types';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import QuestionNav from '../components/QuestionNav';
import allQuestions from '../data/questions.json';

export default function Exam() {
  const navigate = useNavigate();
  const [questions] = useState(() => buildExam(allQuestions as any));
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [showNav, setShowNav] = useState(false);
  const startTime = useRef(Date.now());

  const q = questions[idx];
  const answered = new Set(
    questions.map((_, i) => i).filter(i => answers[questions[i].id] !== undefined &&
      (!Array.isArray(answers[questions[i].id]) || (answers[questions[i].id] as number[]).length > 0))
  );

  function handleSelect(i: number) {
    const qid = q.id;
    if (q.type === 'multiple') {
      const arr = Array.isArray(answers[qid]) ? [...(answers[qid] as number[])] : [];
      const pos = arr.indexOf(i);
      if (pos >= 0) arr.splice(pos, 1); else arr.push(i);
      setAnswers(a => ({ ...a, [qid]: arr }));
    } else {
      setAnswers(a => ({ ...a, [qid]: i }));
    }
  }

  function submit() {
    const durationSec = Math.round((Date.now() - startTime.current) / 1000);
    const attempt = calcScore(questions, answers, durationSec);
    saveAttempt(attempt);
    navigate('/result', { state: { attempt, questions } });
  }

  function handleExpire() {
    submit();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-[#1e3a5f] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => { if (confirm('시험을 종료하고 홈으로 돌아갈까요?')) navigate('/'); }}
          className="text-white text-sm"
        >
          ← 홈
        </button>
        <Timer totalSeconds={EXAM_MINUTES * 60} onExpire={handleExpire} />
        <span className="text-blue-200 text-sm">
          {answered.size}/{questions.length} 답변
        </span>
        <button onClick={() => setShowNav(v => !v)} className="text-white text-sm">
          {showNav ? '닫기' : '목록'}
        </button>
      </div>

      {showNav && (
        <div className="bg-white border-b px-4 py-3">
          <QuestionNav
            total={questions.length}
            current={idx}
            answered={answered}
            onJump={i => { setIdx(i); setShowNav(false); }}
          />
        </div>
      )}

      {/* 문제 */}
      <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
        <QuestionCard
          question={q}
          index={idx}
          total={questions.length}
          selected={answers[q.id]}
          onSelect={handleSelect}
          showAnswer={false}
        />
      </div>

      {/* 하단 네비 */}
      <div className="bg-white border-t px-4 py-3 flex gap-3 sticky bottom-0">
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold disabled:opacity-30"
        >
          ← 이전
        </button>
        {idx < questions.length - 1 ? (
          <button
            onClick={() => setIdx(i => i + 1)}
            className="flex-1 py-3 rounded-xl bg-[#1e3a5f] text-white font-bold"
          >
            다음 →
          </button>
        ) : (
          <button
            onClick={submit}
            className="flex-1 py-3 rounded-xl bg-[#f0a500] text-white font-bold"
          >
            제출하기
          </button>
        )}
      </div>
    </div>
  );
}
