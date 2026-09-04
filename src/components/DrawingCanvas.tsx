import { useEffect, useRef, useState, type ReactNode } from 'react';
import { addStroke, getStrokes, subscribe, type Point } from '../lib/notesStore';

/**
 * 문제 위에 겹쳐지는 필기 레이어.
 *
 * 애플펜슬(pointerType === 'pen')로 화면에 대면 버튼을 누를 필요 없이 바로 그려진다.
 * 손가락·마우스는 그리지 않고 그대로 통과시켜서 보기 선택과 스크롤이 평소처럼 동작한다.
 * 캔버스 자체는 pointer-events: none 이고, 감지는 감싸는 div에서 하기 때문에 가능한 구조다.
 */
export default function DrawingCanvas({
  questionId,
  children,
}: {
  questionId: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef<Point[] | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // 캔버스를 감싸는 영역 크기에 맞춘다(회전·리사이즈 대응)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  /** 저장된 획을 캔버스에 다시 그린다 */
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
    if (e.pointerType !== 'pen') return; // 손가락·마우스는 통과시킨다
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
  }

  return (
    <div
      ref={wrapRef}
      className="relative touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
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
