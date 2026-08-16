'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// Define our types for the drawing system
type Point = { x: number; y: number };
type Stroke = {
  tool: 'pen' | 'marker' | 'eraser';
  color: string;
  points: Point[];
};

export default function EditorScreen() {
  // --- STATE ---
  const [activeTool, setActiveTool] = useState<'type' | 'pen' | 'marker' | 'eraser'>('type');
  const [activeColor, setActiveColor] = useState<string>('#1A1A1A'); // Default black

  // History for Undo functionality
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);

  // Canvas References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // --- COLORS ---
  const colors = [
    { id: 'black', hex: '#1A1A1A' },
    { id: 'orange', hex: '#C46D3B' },
    { id: 'green', hex: '#79936C' },
    { id: 'blue', hex: '#4A7694' },
  ];

  // --- STATE ALIGNMENT ---
  // 1. Keep a sneaky ref of the latest strokes so the window resize listener can always find them
  const strokesRef = useRef<Stroke[]>([]);
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  // 2. CANVAS SETUP & RESIZING (Only runs once on mount)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      // When resizing clears the canvas, quickly redraw using our sneaky ref
      redrawCanvas(strokesRef.current);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Set exact size on load

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // 3. CANVAS REDRAWING (Runs every time you finish a stroke or click undo)
  // useEffect(() => {
  //   redrawCanvas(strokes);
  // }, [strokes]);

  // --- DRAWING LOGIC ---
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'type') return;

    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;

    currentStroke.current = {
      tool: activeTool,
      color: activeColor,
      points: [{ x: offsetX, y: offsetY }]
    };
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current || activeTool === 'type') return;

    const { offsetX, offsetY } = e.nativeEvent;
    currentStroke.current.points.push({ x: offsetX, y: offsetY });

    // Quick render of the current line being drawn
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const points = currentStroke.current.points;
      const lastPoint = points[points.length - 2];
      const newPoint = points[points.length - 1];

      setupContext(ctx, activeTool, activeColor);
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(newPoint.x, newPoint.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentStroke.current) {
      // Make a safe copy of the stroke before saving it to React state
      const finishedStroke = {
        ...currentStroke.current,
        points: [...currentStroke.current.points]
      };

      setStrokes((prev) => [...prev, finishedStroke]);
      currentStroke.current = null;
    }
  };

  // --- REDRAW WHOLE CANVAS ---
  // Note: We now pass the strokes array directly into this function
  const redrawCanvas = (currentStrokes: Stroke[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all saved strokes
    currentStrokes.forEach((stroke) => {
      if (!stroke || !stroke.points || stroke.points.length === 0) return;

      setupContext(ctx, stroke.tool, stroke.color);

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      if (stroke.points.length === 1) {
        ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y);
      } else {
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
      }
      ctx.stroke();
    });
  };

  const setupContext = (ctx: CanvasRenderingContext2D, tool: string, color: string) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      if (tool === 'marker') {
        ctx.lineWidth = 12;
        ctx.globalAlpha = 0.3; // Make marker slightly transparent
      } else {
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1.0;
      }
    }
  };

  // --- UNDO ---
  const handleUndo = () => {
    setStrokes((prev) => {
      // Remove the last stroke from the array
      const remainingStrokes = prev.slice(0, -1);

      // Manually force the canvas to redraw with the remaining strokes
      redrawCanvas(remainingStrokes);

      return remainingStrokes;
    });
  };

  return (
    <div className="min-h-screen bg-[#EFECE1] flex justify-center font-sans text-[#1A1A1A]">
      <main className="w-full max-w-md relative flex flex-col h-screen overflow-hidden">

        {/* Header Section */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A] transition-transform active:scale-95">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="text-center">
            <h1 className="font-bold text-sm text-[#1A1A1A]">Blank note</h1>
            <p className="text-xs text-[#8C877D] mt-0.5">Saved · all changes</p>
          </div>
          {/* Action Icons */}
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A] transition-transform active:scale-95">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A] transition-transform active:scale-95">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Note Canvas Container */}
        <div className="flex-1 px-5 pb-[130px] overflow-y-auto hide-scrollbar relative">
          <div
            ref={containerRef}
            className="min-h-full bg-[#FDFBF7] rounded-[1.25rem] shadow-[0_4px_15px_rgba(0,0,0,0.03)] p-6 flex flex-col relative"
          >
            {/* Title Input */}
            <input
              type="text"
              placeholder="Untitled"
              className="font-fraunces text-4xl font-black text-[#7A868C] placeholder:text-[#7A868C] bg-transparent outline-none w-full mb-4 tracking-tight relative z-10"
              style={{ pointerEvents: activeTool === 'type' ? 'auto' : 'none' }}
            />

            {/* Body Textarea */}
            <textarea
              placeholder="Start writing..."
              className="w-full flex-1 bg-transparent outline-none resize-none text-[#8A857D] font-medium text-base leading-relaxed placeholder:text-[#A39E93] relative z-10"
              style={{ pointerEvents: activeTool === 'type' ? 'auto' : 'none' }}
            />

            {/* Drawing Canvas Overlay */}
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerOut={stopDrawing}
              className="absolute inset-0 rounded-[1.25rem] touch-none z-20"
              style={{ pointerEvents: activeTool === 'type' ? 'none' : 'auto' }}
            />
          </div>
        </div>

        {/* Floating Toolbars */}
        <div className="absolute bottom-6 w-full max-w-md px-5 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50">

          <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center w-full">

            {/* Tools Pill */}
            <div className="flex items-center bg-[#E6E1D3] rounded-full p-1 shrink-0 shadow-sm">
              <button
                onClick={() => setActiveTool('type')}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${activeTool === 'type' ? 'bg-[#1A1A1A] text-white' : 'text-[#8C877D] hover:text-[#1A1A1A]'}`}
              >Type</button>
              <button
                onClick={() => setActiveTool('pen')}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${activeTool === 'pen' ? 'bg-[#1A1A1A] text-white' : 'text-[#8C877D] hover:text-[#1A1A1A]'}`}
              >Pen</button>
              <button
                onClick={() => setActiveTool('marker')}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${activeTool === 'marker' ? 'bg-[#1A1A1A] text-white' : 'text-[#8C877D] hover:text-[#1A1A1A]'}`}
              >Marker</button>
              <button
                onClick={() => setActiveTool('eraser')}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${activeTool === 'eraser' ? 'bg-[#1A1A1A] text-white' : 'text-[#8C877D] hover:text-[#1A1A1A]'}`}
              >Eraser</button>
            </div>

            {/* Colors Pill (Disabled visually if Type or Eraser is selected) */}
            <div className={`flex items-center gap-1.5 bg-[#E6E1D3] rounded-full p-1.5 shrink-0 shadow-sm transition-opacity ${activeTool === 'type' || activeTool === 'eraser' ? 'opacity-50 pointer-events-none' : ''}`}>
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveColor(c.hex)}
                  className={`w-6 h-6 rounded-full transition-all ${activeColor === c.hex ? 'border-2 border-white ring-1 ring-black/20 scale-110' : ''}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>

            {/* Undo Pill */}
            <div className="flex items-center bg-[#E6E1D3] rounded-full p-1 shrink-0 shadow-sm">
              <button
                onClick={handleUndo}
                // disabled={strokes.length ?? 0 === 0}
                className="text-[#8C877D] text-xs font-bold px-4 py-2 rounded-full hover:text-[#1A1A1A] transition-colors disabled:opacity-40 disabled:hover:text-[#8C877D]"
              >Undo</button>
            </div>

          </div>

          {/* Bottom Toolbar Row (Background, Pattern, Font) */}
          <div className="flex gap-2 w-full">
            <button className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FDFBF7] border border-[#D5D0C4]" />
              <span className="font-bold text-[#1A1A1A] text-sm">Cream</span>
            </button>
            <button className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm">
              <span className="font-bold text-[#1A1A1A] text-sm">Blank</span>
            </button>
            <button className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm">
              <span className="font-serif font-bold text-[#1A1A1A] text-[15px] leading-none">Aa</span>
              <span className="font-bold text-[#1A1A1A] text-sm">Modern</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
