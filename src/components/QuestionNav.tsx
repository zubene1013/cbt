interface Props {
  total: number;
  current: number;
  answered: Set<number>;
  onJump: (idx: number) => void;
}

/** 문항 번호 그리드 — 달력처럼 작은 칸으로 채워 넣는다 */
export default function QuestionNav({ total, current, answered, onJump }: Props) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(30px, 1fr))' }}
    >
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className={`h-7 w-full rounded text-[10px] font-bold transition-colors
            ${i === current ? 'bg-blue-600 text-white' :
              answered.has(i) ? 'bg-blue-200 text-blue-800' :
              'bg-gray-100 text-gray-500'}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
