import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcScore } from '../lib/scoring';
import { saveAttempt } from '../store/history';
import type { Domain } from '../types';
import { pickQuestions, getRoundCount, type RoundFilter } from '../lib/pickQuestions';
import QuestionCard from '../components/QuestionCard';
import Explanation from '../components/Explanation';
import DrawingCanvas from '../components/DrawingCanvas';
import NoteControls from '../components/NoteControls';
import QuestionNav from '../components/QuestionNav';
import { QUESTIONS as allQuestions } from '../lib/questionBank';

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
  // 문항 이동 그리드 표시 여부
  const [showNav, setShowNav] = useState(false);
  const [qList, setQList] = useState(() => pickQuestions(allQuestions as any, 'all', 'all'));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | number[] | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  // 회차를 끝냈을 때 결과 화면에 넘기기 위해 문제별 선택을 모아둔다
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const startedAt = useRef(Date.now());

  const q = qList[idx];

  // 이미 답을 제출한 문항 번호 — 문항 이동 그리드에서 푼 문제 표시에 쓴다
  const answeredIdx = new Set(
    qList.map((qq, i) => (answers[qq.id] !== undefined ? i : -1)).filter(i => i >= 0)
  );

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
    setAnswers({});
    startedAt.current = Date.now();
  }

  /** 회차를 다 풀면 시험 모드와 같은 형식으로 채점해 결과 화면으로 보낸다 */
  function finish() {
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    const attempt = {
      ...calcScore(qList, answers, durationSec),
      mode: 'practice' as const,
      label: `${currentRoundLabel} · ${currentDomainLabel}`,
    };
    saveAttempt(attempt);
    navigate('/result', { state: { attempt, questions: qList } });
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
      setAnswers(a => ({ ...a, [q.id]: i }));
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
      setAnswers(a => ({ ...a, [q.id]: selArr }));
      const ok = correctArr.length === selArr.length && [...correctArr].sort().every((v, i) => v === [...selArr].sort()[i]);
      if (ok) setCorrect(c => c + 1);
    }
  }

  /** 특정 문항으로 이동 — 이미 푼 문제면 선택·해설 상태를 복원한다 */
  function goTo(i: number) {
    if (i < 0 || i >= qList.length) return;
    const target = qList[i];
    const prev = answers[target.id];
    setIdx(i);
    setSelected(prev);
    setSubmitted(prev !== undefined);
  }

  function next() {
    // 마지막 문제에서는 첫 문제로 되돌아간다(버튼 라벨과 동작을 맞춤)
    goTo(idx < qList.length - 1 ? idx + 1 : 0);
  }

  if (!q) return (
    <div className="h-full flex items-center justify-center">
      <p className="text-gray-500">선택한 조건에 해당하는 문제가 없습니다.</p>
    </div>
  );

  return (
    // 화면 전체를 뷰포트 높이에 고정 — 페이지가 스크롤되지 않아야 필기가 안정적이다
    <div className="h-[100dvh] overflow-hidden bg-gray-50 flex flex-col">
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

      <NoteControls
        questionId={q.id}
        navOpen={showNav}
        onToggleNav={() => setShowNav(v => !v)}
        onPrev={() => goTo(idx - 1)}
        onNext={() => goTo(idx + 1)}
        canPrev={idx > 0}
        canNext={idx < qList.length - 1}
      />

      {/* 문항 이동 그리드 — 푼 문제는 파란색, 안 푼 문제는 회색 */}
      {showNav && (
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex justify-between text-[11px] text-gray-500 mb-2">
            <span>푼 문제 {answeredIdx.size} / {qList.length}</span>
            <span className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <i className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" />푼 문제
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="w-2.5 h-2.5 rounded-sm bg-gray-100 inline-block" />안 푼 문제
              </span>
            </span>
          </div>
          <QuestionNav
            total={qList.length}
            current={idx}
            answered={answeredIdx}
            onJump={i => { goTo(i); setShowNav(false); }}
          />
        </div>
      )}

      {/* 문제 — 카드 주변 여백까지 전부 필기 영역 */}
      <DrawingCanvas questionId={q.id} className="flex-1 min-h-0 overflow-hidden">
        <div className="px-4 py-4 flex flex-col gap-3 max-w-2xl mx-auto w-full h-full">
          <QuestionCard
            question={q}
            index={idx}
            total={qList.length}
            selected={selected}
            onSelect={handleSelect}
            showAnswer={submitted}
          />
          {submitted && <Explanation question={q} selected={selected} />}
        </div>
      </DrawingCanvas>

      {/* 조작 버튼 — 필기 영역 밖이라 애플펜슬로도 정상 동작 */}
      <div className="px-4 py-3 flex flex-col gap-2 max-w-2xl mx-auto w-full bg-gray-50 border-t">
        {q.type === 'multiple' && !submitted && (
          <button
            onClick={submitMultiple}
            disabled={!Array.isArray(selected) || selected.length === 0}
            className="bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-40"
          >
            제출
          </button>
        )}

        {submitted && idx < qList.length - 1 && (
          <button
            onClick={next}
            className="bg-[#1e3a5f] text-white py-3 rounded-xl font-bold"
          >
            다음 문제 →
          </button>
        )}

        {/* 다 풀었으면 어느 문항에 있든 결과를 볼 수 있다 */}
        {answeredIdx.size === qList.length && (
          <button
            onClick={finish}
            className="bg-amber-500 text-white py-3 rounded-xl font-bold"
          >
            결과 보기 ({correct}/{total} 정답)
          </button>
        )}
      </div>
    </div>
  );
}
