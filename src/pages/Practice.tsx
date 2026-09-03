import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Domain } from '../types';
import { pickQuestions, getRoundCount, type RoundFilter } from '../lib/pickQuestions';
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

const ROUND_COUNT = getRoundCount(allQuestions as any);
const ROUND_FILTERS: { value: RoundFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...Array.from({ length: ROUND_COUNT }, (_, i) => ({
    value: (i + 1) as RoundFilter,
    label: `${i + 1}회차`,
  })),
];

export default function Practice() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<DomainFilter>('all');
  const [round, setRound] = useState<RoundFilter>('all');
  // 문제 풀 때는 필터를 숨겨 화면을 비운다 — 요약 바를 눌러 펼침
  const [showFilters, setShowFilters] = useState(false);
  const [qList, setQList] = useState(() => pickQuestions(allQuestions as any, 'all', 'all'));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | number[] | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const q = qList[idx];

  // 접힌 상태에서도 현재 범위를 알 수 있게 요약 라벨을 만든다
  const currentDomainLabel = FILTERS.find(f => f.value === filter)?.label ?? '전체';
  const currentRoundLabel = round === 'all'
    ? '전체 회차'
    : `${round}회차`;

  /** 도메인·회차 중 하나가 바뀌면 문제 목록과 점수를 새로 시작한다 */
  function rebuild(nextDomain: DomainFilter, nextRound: RoundFilter) {
    setFilter(nextDomain);
    setRound(nextRound);
    setQList(pickQuestions(allQuestions as any, nextDomain, nextRound));
    setIdx(0);
    setSelected(undefined);
    setSubmitted(false);
    setCorrect(0);
    setTotal(0);
  }

  function applyFilter(f: DomainFilter) {
    rebuild(f, round);
  }

  function applyRound(r: RoundFilter) {
    rebuild(filter, r);
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
    // 마지막 문제에서는 첫 문제로 되돌아간다(버튼 라벨과 동작을 맞춤)
    setIdx(i => (i < qList.length - 1 ? i + 1 : 0));
    setSelected(undefined);
    setSubmitted(false);
  }

  if (!q) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">선택한 조건에 해당하는 문제가 없습니다.</p>
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

      {/* 필터 요약 바 — 누르면 아래 필터가 펼쳐진다 */}
      <button
        onClick={() => setShowFilters(v => !v)}
        className="flex items-center justify-between px-4 py-2.5 bg-white border-b w-full"
      >
        <span className="flex items-center gap-1.5 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-[#1e3a5f] text-white font-semibold">
            {currentDomainLabel}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-semibold">
            {currentRoundLabel}
          </span>
        </span>
        <span className="text-[11px] text-gray-400 font-semibold">
          {showFilters ? '접기 ▲' : '범위 변경 ▼'}
        </span>
      </button>

      {showFilters && (
        <>
          {/* 도메인 필터 */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b items-center">
            <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap pr-1">종류</span>
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

          {/* 회차 선택 — 회차를 고르면 문제와 순서가 항상 동일하게 고정된다 */}
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto bg-white border-b items-center">
            <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap pr-1">회차</span>
            {ROUND_FILTERS.map(r => (
              <button
                key={String(r.value)}
                onClick={() => applyRound(r.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors
                  ${round === r.value ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}

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
