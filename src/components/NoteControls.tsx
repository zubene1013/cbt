import { useEffect, useState } from 'react';
import { clearAll, clearQuestion, countPages, hasStrokes, subscribe } from '../lib/notesStore';

/** 필기 지우기 버튼 — 현재 문제만 지우기 / 전체 문제 지우기 */
export default function NoteControls({ questionId }: { questionId: string }) {
  const [, force] = useState(0);

  // 필기 상태가 바뀌면 버튼 활성화 여부를 갱신한다
  useEffect(() => subscribe(() => force(n => n + 1)), []);

  const hasThis = hasStrokes(questionId);
  const pages = countPages();

  if (!hasThis && pages === 0) return null;

  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={() => clearQuestion(questionId)}
        disabled={!hasThis}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-600 disabled:opacity-30"
      >
        이 문제 필기 지우기
      </button>
      <button
        onClick={() => {
          if (confirm(`필기가 있는 ${pages}문제의 필기를 모두 지울까요?`)) clearAll();
        }}
        disabled={pages === 0}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-300 text-rose-600 disabled:opacity-30"
      >
        전체 지우기 ({pages})
      </button>
    </div>
  );
}
