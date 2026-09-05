import { useEffect, useState } from 'react';
import { clearAll, clearQuestion, countPages, hasStrokes, subscribe } from '../lib/notesStore';

/**
 * 오른쪽 상단 도구 줄.
 * 왼쪽부터: (선택) 문항 이동, 현재 문제 필기 지우기, 전체 필기 지우기
 */
export default function NoteControls({
  questionId,
  onToggleNav,
  navOpen,
}: {
  questionId: string;
  onToggleNav?: () => void;
  navOpen?: boolean;
}) {
  const [, force] = useState(0);

  useEffect(() => subscribe(() => force(n => n + 1)), []);

  const hasThis = hasStrokes(questionId);
  const pages = countPages();

  return (
    <div className="flex justify-end items-center gap-2 px-4 py-1.5 bg-white border-b">
      {/* 문항 이동 그리드 열기 */}
      {onToggleNav && (
        <button
          onClick={onToggleNav}
          aria-label="문항 이동"
          title="문항 이동"
          className={`w-9 h-9 flex items-center justify-center rounded-lg border active:opacity-70
            ${navOpen ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'border-gray-300 text-gray-600'}`}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      )}

      {/* 현재 문제 필기 지우기 */}
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

      {/* 전체 필기 지우기 */}
      <button
        onClick={() => {
          if (confirm('모든 문제의 필기를 지울까요?')) clearAll();
        }}
        disabled={pages === 0}
        aria-label="전체 필기 지우기"
        title="전체 필기 지우기"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-rose-300 text-rose-600 disabled:opacity-25 active:bg-rose-50"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
        </svg>
      </button>
    </div>
  );
}
