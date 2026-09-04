import { useEffect, useRef, useState, type ReactNode } from 'react';
import { addStroke, getStrokes, subscribe, type Point } from '../lib/notesStore';

/**
 * 문제 영역 위에 겹쳐지는 필기 레이어.
 *
 * - 애플펜슬(pointerType === 'pen')로 대면 버튼을 누를 필요 없이 바로 그려진다.
 * - 손가락·마우스는 그리지 않고 통과시켜서 보기 선택과 스크롤이 평소처럼 동작한다.
 * - 펜으로 그은 뒤 따라오는 click 이벤트는 캡처 단계에서 삼켜서,
 *   보기 위에 필기해도 답이 선택되지 않게 한다.
 *
 * children을 감싸는 div 전체가 필기 영역이므로, 문제 카드뿐 아니라
 * 그 주변 여백까지 넓게 필기할 수 있다.
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
  /** 펜으로 그리는 중이었으면 뒤따르는 click을 막기 위한 표식 */
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

  function toPoint(e: React.PointerEvent): Point {
    const rect = wrapRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== 'pen') return; // 손가락·마우스는 그대로 통과
    penGuardRef.current = true;
    e.preventDefault();
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
    addStroke(questionId, drawingRef.current);
    drawingRef.current = null;
    redraw();
    // click이 오지 않는 경우를 대비한 안전장치
    window.setTimeout(() => { penGuardRef.current = false; }, 400);
  }

  /** 펜으로 그린 직후 발생하는 click을 삼켜서 보기가 선택되지 않게 한다 */
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
      onPointerLeave={onPointerUp}
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
