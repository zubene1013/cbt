import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Domain } from '../types';
import { pickQuestions } from '../lib/pickQuestions';
import QuestionCard from '../components/QuestionCard';
import Explanation from '../components/Explanation';
import allQuestions from '../data/questions.json';

type DomainFilter = Domain | 'all';

const FILTERS: { value: DomainFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'secure', label: '보안' },
  { value: 'resilient', label: '복원력' },
  { value: 'performance', label: '고성능' },
  { value: 'cost', label: '비용' },
];

export default function Practice() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<DomainFilter>('all');
  const [qList, setQList] = useState(() => pickQuestions(allQuestions as any, 'all'));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | number[] | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const q = qList[idx];

  function applyFilter(f: DomainFilter) {
    setFilter(f);
    setQList(pickQuestions(allQuestions as any, f));
    setIdx(0);
    setSelected(undefined);
    setSubmitted(false);
  }

  function handleSelect(i: number) {
    if (submitted) return;
    if (q.type === 'multiple') {
      const arr = Array.isArray(selected) ? [...selected] : [];
      const pos = arr.indexOf(i);
      if (pos >= 0) arr.splice(pos, 1); else arr.push(i);
      setSelected(arr);
    } else {
      setSelected(i);
      setSubmitted(true);
      const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
      if (ans.includes(i)) setCorrect(c => c + 1);
      setTotal(t => t + 1);
    }
  }

  function submitMultiple() {
    if (!submitted) {
      setSubmitted(true);
      setTotal(t => t + 1);
      const correctArr = Array.isArray(q.answer) ? q.answer : [q.answer];
      const selArr = Array.isArray(selected) ? selected : [];
      const ok = correctArr.length === selArr.length && [...correctArr].sort().every((v, i) => v === [...selArr].sort()[i]);
      if (ok) setCorrect(c => c + 1);
    }
  }

  function next() {
    if (idx < qList.length - 1) {
      setIdx(i => i + 1);
      setSelected(undefined);
      setSubmitted(false);
    }
  }

  if (!q) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">해당 도메인 문제가 없습니다.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-[#1e3a5f] px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-white text-sm">← 홈</button>
        <span className="text-white font-bold">연습 모드</span>
        <span className="text-blue-200 text-sm">{correct}/{total}</span>
      </div>

      {/* 도메인 필터 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => applyFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors
              ${filter === f.value ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 문제 */}
      <div className="flex-1 px-4 py-5 flex flex-col gap-4 max-w-2xl mx-auto w-full">
        <QuestionCard
          question={q}
          index={idx}
          total={qList.length}
          selected={selected}
          onSelect={handleSelect}
          showAnswer={submitted}
        />

        {q.type === 'multiple' && !submitted && (
          <button
            onClick={submitMultiple}
            disabled={!Array.isArray(selected) || selected.length === 0}
            className="bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-40"
          >
            제출
          </button>
        )}

        {submitted && (
          <>
            <Explanation question={q} selected={selected} />
            <button
              onClick={next}
              className="bg-[#1e3a5f] text-white py-3 rounded-xl font-bold"
            >
              {idx < qList.length - 1 ? '다음 문제 →' : '처음으로 돌아가기'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
