import type { Question } from '../types';

interface Props {
  question: Question;
  index: number;
  total: number;
  selected: number | number[] | undefined;
  onSelect: (idx: number) => void;
  showAnswer?: boolean;
}

/**
 * 문제 카드.
 *
 * 필기와의 관계가 레이아웃을 결정한다.
 * - 문제 본문과 보기 카드에는 `data-nodraw`를 붙여 필기가 통과하도록 한다.
 *   그래야 애플펜슬로 보기를 눌러 답을 고를 수 있다.
 * - A/B/C/D 배지는 카드 바깥 왼쪽 여백에 두어, 그 자리에 빗금 등 필기를 할 수 있게 한다.
 */
export default function QuestionCard({ question, index, total, selected, onSelect, showAnswer = false }: Props) {
  const isMultiple = question.type === 'multiple';
  const selectedArr = selected === undefined ? [] : Array.isArray(selected) ? selected : [selected];
  const correctArr = Array.isArray(question.answer) ? question.answer : [question.answer];

  function choiceClass(i: number): string {
    const base = 'flex-1 text-left px-4 py-3 rounded-xl border-2 text-sm leading-snug transition-colors ';
    if (!showAnswer) {
      return base + (selectedArr.includes(i)
        ? 'border-blue-500 bg-blue-50 text-blue-900'
        : 'border-gray-200 bg-white text-gray-800 active:bg-gray-100');
    }
    if (correctArr.includes(i)) return base + 'border-green-500 bg-green-50 text-green-900';
    if (selectedArr.includes(i)) return base + 'border-red-400 bg-red-50 text-red-900';
    return base + 'border-gray-200 bg-white text-gray-400';
  }

  /** 카드 밖 배지 — 선택·정답 상태에 따라 색이 바뀐다 */
  function badgeClass(i: number): string {
    const base = 'w-8 h-8 shrink-0 mt-2 rounded-full flex items-center justify-center text-sm font-bold transition-colors ';
    if (!showAnswer) {
      return base + (selectedArr.includes(i)
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-400 border border-gray-200');
    }
    if (correctArr.includes(i)) return base + 'bg-green-600 text-white';
    if (selectedArr.includes(i)) return base + 'bg-red-500 text-white';
    return base + 'bg-white text-gray-300 border border-gray-200';
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-gray-400 font-medium" data-nodraw>
        문항 {index + 1} / {total}
        {isMultiple && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">복수정답</span>}
      </div>

      <p className="text-base font-medium text-gray-900 leading-relaxed" data-nodraw>
        {question.question}
      </p>

      <div className="flex flex-col gap-2">
        {question.choices.map((c, i) => (
          // 배지는 카드 밖(필기 가능), 보기 카드는 data-nodraw(필기 불가·선택 가능)
          <div key={i} className="flex items-start gap-2">
            <span className={badgeClass(i)}>{String.fromCharCode(65 + i)}</span>
            <button
              data-nodraw
              className={choiceClass(i)}
              onClick={() => !showAnswer && onSelect(i)}
            >
              {c}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
