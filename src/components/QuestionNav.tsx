interface Props {
  total: number;
  current: number;
  answered: Set<number>;
  onJump: (idx: number) => void;
}

export default function QuestionNav({ total, current, answered, onJump }: Props) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className={`h-8 w-full rounded text-xs font-bold transition-colors
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
