import type { Question } from '../types';

interface Props {
  question: Question;
  selected: number | number[] | undefined;
}

export default function Explanation({ question, selected }: Props) {
  const correctArr = Array.isArray(question.answer) ? question.answer : [question.answer];
  const selectedArr = selected === undefined ? [] : Array.isArray(selected) ? selected : [selected];
  const correct = correctArr.length === selectedArr.length &&
    [...correctArr].sort().every((v, i) => v === [...selectedArr].sort()[i]);

  return (
    <div className={`rounded-xl p-4 border-l-4 ${correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-400'}`}>
      <p className={`font-bold text-sm mb-1 ${correct ? 'text-green-700' : 'text-red-600'}`}>
        {correct ? '✓ 정답입니다!' : '✗ 오답입니다'}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        정답: {correctArr.map(i => `${String.fromCharCode(65 + i)}. ${question.choices[i]}`).join(', ')}
      </p>
      <p className="text-sm text-gray-700 leading-relaxed">{question.explanation}</p>
    </div>
  );
}
