import { useEffect, useRef, useState, type ReactNode } from 'react';
import { addStroke, getStrokes, subscribe, type Point } from '../lib/notesStore';

/**
 * 문제 영역 위에 겹쳐지는 필기 레이어.
 *
 * `data-nodraw` 속성이 붙은 요소(문제 본문, 보기 카드) 위에서는 필기가 동작하지 않고
 * 입력이 그대로 통과한다. 덕분에 애플펜슬로 보기를 눌러 답을 고를 수 있다.
 * 그 밖의 영역(ABCD 배지 여백, 카드 주변 빈 공간)에서는 펜을 대면 바로 그려진다.
 *
 * 손가락·마우스는 어디서든 그리지 않고 통과시켜 스크롤과 선택이 평소처럼 동작한다.
 */
export default function DrawingCanvas({
  questionId,
  children,
  className = '',
}: {
  questionId: string;
  children: ReactNode;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<Point[] | null>(null);
  /** 펜으로 획을 그은 직후의 click을 삼키기 위한 표식 */
  const penGuardRef = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const strokes = getStrokes(questionId);
    const live = drawingRef.current;
    const all = live ? [...strokes, live] : strokes;

    for (const stroke of all) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * size.w, stroke[0].y * size.h);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x * size.w, stroke[i].y * size.h);
      }
      ctx.stroke();
    }
  }

  useEffect(redraw, [size, questionId]);
  useEffect(() => subscribe(redraw));

  /** 이 지점이 필기 금지 영역(문제·보기)인지 */
  function isNoDraw(target: EventTarget | null): boolean {
    return !!(target as Element | null)?.closest?.('[data-nodraw]');
  }

  /**
   * 아이패드에서 펜으로 세로선을 그으면 Safari가 스크롤 제스처로 가로채 획이 끊긴다.
   * 펜(stylus)일 때만 기본 동작을 취소해 이를 막는다. 단 필기 금지 영역에서는
   * 취소하지 않아야 탭이 정상적으로 클릭으로 이어진다.
   */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const hasStylus = (e: TouchEvent) =>
      Array.from(e.touches).some(t => (t as Touch & { touchType?: string }).touchType === 'stylus');

    const block = (e: TouchEvent) => {
      if (isNoDraw(e.target)) return;
      if (drawingRef.current || hasStylus(e)) e.preventDefault();
    };

    el.addEventListener('touchstart', block, { passive: false });
    el.addEventListener('touchmove', block, { passive: false });
    return () => {
      el.removeEventListener('touchstart', block);
      el.removeEventListener('touchmove', block);
    };
  }, []);

  function toPoint(e: React.PointerEvent): Point {
    const rect = wrapRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== 'pen') return;   // 손가락·마우스는 통과
    if (isNoDraw(e.target)) return;        // 문제·보기 위에서는 선택이 되도록 통과
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 미지원 시 무시 */ }
    drawingRef.current = [toPoint(e)];
  }

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerType !== 'pen' || !drawingRef.current) return;
    e.preventDefault();
    drawingRef.current.push(toPoint(e));
    redraw();
  }

  function onPointerUp(e: React.PointerEvent) {
    if (e.pointerType !== 'pen' || !drawingRef.current) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* 이미 해제됨 */ }
    addStroke(questionId, drawingRef.current);
    drawingRef.current = null;
    penGuardRef.current = true;
    redraw();
    window.setTimeout(() => { penGuardRef.current = false; }, 400);
  }

  /** 펜으로 그린 직후 따라오는 click을 삼킨다 */
  function onClickCapture(e: React.MouseEvent) {
    if (!penGuardRef.current) return;
    penGuardRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      {children}
      <canvas
        ref={canvasRef}
        style={{ width: size.w, height: size.h }}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
