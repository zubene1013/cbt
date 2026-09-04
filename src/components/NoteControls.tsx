import { useEffect, useState } from 'react';
import { clearAll, clearQuestion, countPages, hasStrokes, subscribe } from '../lib/notesStore';

/**
 * 필기 지우기 아이콘 버튼 — 필터 바 오른쪽 아래에 붙는다.
 * 왼쪽: 현재 문제 필기만 지우기 / 오른쪽: 모든 문제 필기 지우기
 */
export default function NoteControls({ questionId }: { questionId: string }) {
  const [, force] = useState(0);

  useEffect(() => subscribe(() => force(n => n + 1)), []);

  const hasThis = hasStrokes(questionId);
  const pages = countPages();

  // 필기가 하나도 없으면 자리를 차지하지 않는다
  if (!hasThis && pages === 0) return null;

  return (
    <div className="flex justify-end items-center gap-2 px-4 py-1.5 bg-white border-b">
      {/* 현재 문제 필기 지우기 (지우개) */}
      <button
        onClick={() => clearQuestion(questionId)}
        disabled={!hasThis}
        aria-label="이 문제 필기 지우기"
        title="이 문제 필기 지우기"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 disabled:opacity-25 active:bg-gray-100"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 20H8.5L3.5 15a1.5 1.5 0 0 1 0-2.1l8-8a1.5 1.5 0 0 1 2.1 0l6 6a1.5 1.5 0 0 1 0 2.1L13 20" />
          <path d="M9 9.5 16.5 17" />
        </svg>
      </button>

      {/* 전체 필기 지우기 (휴지통 + 개수) */}
      <button
        onClick={() => {
          if (confirm(`필기가 있는 ${pages}문제의 필기를 모두 지울까요?`)) clearAll();
        }}
        disabled={pages === 0}
        aria-label="전체 필기 지우기"
        title="전체 필기 지우기"
        className="h-9 px-2.5 flex items-center gap-1 rounded-lg border border-rose-300 text-rose-600 disabled:opacity-25 active:bg-rose-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
        </svg>
        <span className="text-[11px] font-bold">{pages}</span>
      </button>
    </div>
  );
}
