import type { Question } from '../types';

interface Props {
  question: Question;
  index: number;
  total: number;
  selected: number | number[] | undefined;
  onSelect: (idx: number) => void;
  showAnswer?: boolean;
}

export default function QuestionCard({ question, index, total, selected, onSelect, showAnswer = false }: Props) {
  const isMultiple = question.type === 'multiple';
  const selectedArr = selected === undefined ? [] : Array.isArray(selected) ? selected : [selected];
  const correctArr = Array.isArray(question.answer) ? question.answer : [question.answer];

  function choiceClass(i: number): string {
    const base = 'w-full text-left px-4 py-3 rounded-xl border-2 text-sm leading-snug transition-colors ';
    if (!showAnswer) {
      return base + (selectedArr.includes(i)
        ? 'border-blue-500 bg-blue-50 text-blue-900'
        : 'border-gray-200 bg-white text-gray-800 active:bg-gray-100');
    }
    if (correctArr.includes(i)) return base + 'border-green-500 bg-green-50 text-green-900';
    if (selectedArr.includes(i)) return base + 'border-red-400 bg-red-50 text-red-900';
    return base + 'border-gray-200 bg-white text-gray-400';
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-gray-400 font-medium">
        문항 {index + 1} / {total}
        {isMultiple && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">복수정답</span>}
      </div>
      <p className="text-base font-medium text-gray-900 leading-relaxed">{question.question}</p>
      <div className="flex flex-col gap-2">
        {question.choices.map((c, i) => (
          <button key={i} className={choiceClass(i)} onClick={() => !showAnswer && onSelect(i)}>
            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{c}
          </button>
        ))}
      </div>
    </div>
  );
}
