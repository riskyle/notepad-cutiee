'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Point = { x: number; y: number };
type Stroke = {
  tool: 'pen' | 'marker' | 'eraser';
  color: string;
  points: Point[];
};

export default function EditorScreen() {
  // --- DRAWING STATE ---
  const [activeTool, setActiveTool] = useState<'type' | 'pen' | 'marker' | 'eraser'>('type');
  const [activeColor, setActiveColor] = useState<string>('#1A1A1A');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // --- MENU & PREFERENCES STATE ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [format, setFormat] = useState('notepad');
  const [appearance, setAppearance] = useState('cream');
  const [pageStyle, setPageStyle] = useState('blank');
  const [activeFont, setActiveFont] = useState<'modern' | 'handwritten' | 'journal' | 'mono'>('modern');

  const colors = [
    { id: 'black', hex: '#1A1A1A' },
    { id: 'orange', hex: '#C46D3B' },
    { id: 'green', hex: '#79936C' },
    { id: 'blue', hex: '#4A7694' },
  ];

  // Helper to map state to Tailwind font classes
  const getFontClass = () => {
    switch (activeFont) {
      case 'mono': return 'font-mono text-sm'; // Mono usually looks better slightly smaller
      case 'journal': return 'font-serif text-lg';
      case 'handwritten': return 'font-sans italic text-lg'; // Placeholder: add a custom handwriting font later
      case 'modern':
      default: return 'font-sans text-base';
    }
  };

  // Add this below your state definitions
  const cycleFont = () => {
    const fonts: Array<'modern' | 'handwritten' | 'journal' | 'mono'> = ['modern', 'handwritten', 'journal', 'mono'];
    const currentIndex = fonts.indexOf(activeFont);
    const nextIndex = (currentIndex + 1) % fonts.length;
    setActiveFont(fonts[nextIndex]);
  };

  // --- CANVAS RESIZE LOGIC ---
  const strokesRef = useRef<Stroke[]>([]);
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas(strokesRef.current);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // --- DRAWING LOGIC ---
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'type') return;
    isDrawing.current = true;
    currentStroke.current = { tool: activeTool, color: activeColor, points: [{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }] };
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentStroke.current || activeTool === 'type') return;
    currentStroke.current.points.push({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const points = currentStroke.current.points;
      setupContext(ctx, activeTool, activeColor);
      ctx.beginPath();
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentStroke.current) {
      const finishedStroke = { ...currentStroke.current, points: [...currentStroke.current.points] };
      setStrokes((prev) => [...prev, finishedStroke]);
      currentStroke.current = null;
    }
  };

  const redrawCanvas = (currentStrokes: Stroke[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      ctx.lineWidth = tool === 'marker' ? 12 : 3;
      ctx.globalAlpha = tool === 'marker' ? 0.3 : 1.0;
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => {
      const remainingStrokes = prev.slice(0, -1);
      redrawCanvas(remainingStrokes);
      return remainingStrokes;
    });
  };

  // Helper to map page style state to Tailwind background pattern classes
  const getPagePattern = () => {
    switch (pageStyle) {
      case 'lined':
        // Horizontal lines
        return 'bg-[linear-gradient(transparent_27px,#E4DFD2_28px)] [background-size:100%_28px]';
      case 'dotted':
        // Dot matrix
        return 'bg-[radial-gradient(#C3BEB2_1.5px,transparent_1.5px)] [background-size:20px_20px]';
      case 'grid':
        // Standard squares
        return 'bg-[linear-gradient(#E4DFD2_1px,transparent_1px),linear-gradient(90deg,#E4DFD2_1px,transparent_1px)] [background-size:24px_24px]';
      case 'graph':
        // Smaller, tighter squares
        return 'bg-[linear-gradient(#E4DFD2_1px,transparent_1px),linear-gradient(90deg,#E4DFD2_1px,transparent_1px)] [background-size:12px_12px]';
      case 'checklist':
        // Horizontal lines with a vertical red margin line
        return 'bg-[linear-gradient(transparent_27px,#E4DFD2_28px),linear-gradient(90deg,transparent_39px,#E8BBD0_40px,transparent_41px)] [background-size:100%_28px,100%_100%]';
      case 'blank':
      default:
        return '';
    }
  };

  // Helper to map appearance state to Tailwind background colors
  const getAppearanceBg = () => {
    switch (appearance) {
      case 'clean': return 'bg-[#EFECE1]';
      case 'dark': return 'bg-[#1A1A1A]';
      case 'white': return 'bg-white';
      case 'pink': return 'bg-[#F5DFE6]';
      case 'lavender': return 'bg-[#E4DEFA]';
      case 'cream':
      default: return 'bg-[#FDFBF7]';
    }
  };

  return (
    <div className="min-h-screen bg-[#EFECE1] flex justify-center font-sans text-[#1A1A1A]">
      <main className="w-full max-w-md relative flex flex-col h-screen overflow-hidden">

        {/* Header Section */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="text-center">
            <h1 className="font-bold text-sm text-[#1A1A1A]">Blank note</h1>
            <p className="text-xs text-[#8C877D] mt-0.5">Saved · all changes</p>
          </div>
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
            // Removed the hardcoded background and added getAppearanceBg()
            className={`min-h-full rounded-[1.25rem] shadow-sm p-6 flex flex-col relative transition-colors duration-300 ${getAppearanceBg()} ${getPagePattern()}`}
          >
            {/* Title Input */}
            <input
              type="text"
              placeholder="Untitled"
              // Added dynamic text color for dark mode
              className={`font-fraunces text-4xl font-black placeholder:text-[#7A868C] bg-transparent outline-none w-full mb-4 tracking-tight relative z-10 transition-colors duration-300 ${appearance === 'dark' ? 'text-[#FDFBF7]' : 'text-[#7A868C]'}`}
              style={{ pointerEvents: activeTool === 'type' ? 'auto' : 'none' }}
            />

            {/* Body Textarea */}
            <textarea
              placeholder="Start writing..."
              // Added dynamic text color for dark mode
              className={`w-full flex-1 bg-transparent outline-none resize-none font-medium leading-relaxed placeholder:text-[#A39E93] relative z-10 transition-colors duration-300 ${getFontClass()} ${appearance === 'dark' ? 'text-[#EFECE1]' : 'text-[#8A857D]'}`}
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

        {/* Floating Toolbars (Hide if Settings Open) */}
        {!isSettingsOpen && (
          <div className="absolute bottom-6 w-full max-w-md px-5 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-30">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center w-full">
              {/* Tools Pill */}
              <div className="flex items-center bg-[#E6E1D3] rounded-full p-1 shrink-0 shadow-sm">
                {(['type', 'pen', 'marker', 'eraser'] as const).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`text-xs font-bold px-4 py-2 rounded-full capitalize transition-colors ${activeTool === tool ? 'bg-[#1A1A1A] text-white' : 'text-[#8C877D]'}`}
                  >{tool}</button>
                ))}
              </div>

              {/* Colors Pill */}
              <div className={`flex items-center gap-1.5 bg-[#E6E1D3] rounded-full p-1.5 shrink-0 shadow-sm transition-opacity ${activeTool === 'type' || activeTool === 'eraser' ? 'opacity-50 pointer-events-none' : ''}`}>
                {colors.map((c) => (
                  <button key={c.id} onClick={() => setActiveColor(c.hex)} className={`w-6 h-6 rounded-full transition-all ${activeColor === c.hex ? 'border-2 border-white ring-1 ring-black/20 scale-110' : ''}`} style={{ backgroundColor: c.hex }} />
                ))}
              </div>

              {/* Undo Pill */}
              <div className="flex items-center bg-[#E6E1D3] rounded-full p-1 shrink-0 shadow-sm">
                <button onClick={handleUndo} disabled={strokes.length === 0} className="text-[#8C877D] text-xs font-bold px-4 py-2 rounded-full disabled:opacity-40">Undo</button>
              </div>
            </div>

            {/* Triggers for Settings Menu */}
            <div className="flex gap-2 w-full">
              <button onClick={() => setIsSettingsOpen(true)} className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FDFBF7] border border-[#D5D0C4]" />
                <span className="font-bold text-[#1A1A1A] text-sm capitalize">{appearance}</span>
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm">
                <span className="font-bold text-[#1A1A1A] text-sm capitalize">{pageStyle}</span>
              </button>
              <button onClick={cycleFont} className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
                <span className="font-serif font-bold text-[#1A1A1A] text-[15px] leading-none">Aa</span>
                <span className="font-bold text-[#1A1A1A] text-sm capitalize">{activeFont}</span>
              </button>
            </div>
          </div>
        )}

        {/* --- SETTINGS BOTTOM SHEET --- */}
        {isSettingsOpen && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            {/* Dark Overlay (Click to close) */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
              onClick={() => setIsSettingsOpen(false)}
            />

            {/* Sheet Content */}
            <div className="bg-[#FDFBF7] w-full rounded-t-[2rem] pt-3 pb-8 px-6 relative z-10 animate-slide-up shadow-2xl">
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-[#E4DFD2] rounded-full mx-auto mb-6" />

              {/* FORMAT */}
              <div className="mb-6">
                <h3 className="text-[10px] font-bold tracking-wider text-[#8C877D] uppercase mb-3">Format</h3>
                <div className="flex gap-2">
                  <button onClick={() => setFormat('notepad')} className={`flex-1 p-3 rounded-2xl text-left border ${format === 'notepad' ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#E4DFD2] text-[#1A1A1A]'}`}>
                    <div className="font-bold text-sm mb-0.5">Notepad</div>
                    <div className={`text-xs ${format === 'notepad' ? 'text-gray-400' : 'text-[#8C877D]'}`}>One long page</div>
                  </button>
                  <button onClick={() => setFormat('notebook')} className={`flex-1 p-3 rounded-2xl text-left border ${format === 'notebook' ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-transparent border-[#E4DFD2] text-[#1A1A1A]'}`}>
                    <div className="font-bold text-sm mb-0.5">Notebook</div>
                    <div className={`text-xs ${format === 'notebook' ? 'text-gray-400' : 'text-[#8C877D]'}`}>Flip through sheets</div>
                  </button>
                </div>
              </div>

              {/* APPEARANCE */}
              <div className="mb-6">
                <h3 className="text-[10px] font-bold tracking-wider text-[#8C877D] uppercase mb-3">Appearance</h3>
                <div className="flex justify-between">
                  {[
                    { id: 'clean', color: 'bg-[#EFECE1]', border: 'border-[#D5D0C4]' },
                    { id: 'dark', color: 'bg-[#1A1A1A]', border: 'border-[#1A1A1A]' },
                    { id: 'white', color: 'bg-white', border: 'border-[#D5D0C4]' },
                    { id: 'cream', color: 'bg-[#FDFBF7]', border: 'border-[#D5D0C4]' },
                    { id: 'pink', color: 'bg-[#F5DFE6]', border: 'border-[#F5DFE6]' },
                    { id: 'lavender', color: 'bg-[#E4DEFA]', border: 'border-[#E4DEFA]' },
                  ].map((style) => (
                    <div key={style.id} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => setAppearance(style.id)}
                        className={`w-10 h-10 rounded-full border ${style.color} ${style.border} ${appearance === style.id ? 'ring-2 ring-offset-2 ring-offset-[#FDFBF7] ring-[#CC6B36]' : ''}`}
                      />
                      <span className="text-[10px] text-[#8C877D] capitalize">{style.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAGE STYLE */}
              <div className="mb-6">
                <h3 className="text-[10px] font-bold tracking-wider text-[#8C877D] uppercase mb-3">Page Style</h3>
                <div className="flex flex-wrap gap-2">
                  {(['blank', 'lined', 'dotted', 'grid', 'graph', 'checklist'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setPageStyle(style)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${pageStyle === style ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-transparent border-[#D5D0C4] text-[#5C5852]'}`}
                    >
                      <span className="capitalize">{style}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FONT */}
              <div className="mb-8">
                <h3 className="text-[10px] font-bold tracking-wider text-[#8C877D] uppercase mb-3">Font</h3>
                <div className="flex flex-wrap gap-2">
                  {(['modern', 'handwritten', 'journal', 'mono'] as const).map((fontType) => (
                    <button
                      key={fontType}
                      onClick={() => setActiveFont(fontType)}
                      className={`px-4 py-2 rounded-full text-sm border transition-colors
                        ${fontType === 'journal' ? 'font-serif' : ''}
                        ${fontType === 'mono' ? 'font-mono' : ''}
                        ${fontType === 'handwritten' ? 'italic' : ''}
                        ${activeFont === fontType ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white font-bold' : 'bg-transparent border-[#D5D0C4] text-[#5C5852]'}`}
                    >
                      <span className="capitalize">{fontType}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DONE BUTTON */}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-[#E6E1D3] text-[#1A1A1A] font-bold text-base py-4 rounded-full active:scale-95 transition-transform"
              >
                Done
              </button>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
