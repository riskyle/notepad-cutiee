'use client';

import { useState, useRef, useEffect, useLayoutEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

type Point = { x: number; y: number };
type Stroke = {
  tool: 'pen' | 'marker' | 'eraser';
  color: string;
  points: Point[];
};

type PageData = {
  title: string;
  content: string;
  strokes: Stroke[];
};

// Initialize Supabase outside to prevent recreation
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// We wrap the main editor in a component to handle the useSearchParams safely
function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');

  // --- DB & AUTH STATE ---
  const [noteId, setNoteId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // --- DRAWING & MENU STATE ---
  const [activeTool, setActiveTool] = useState<'type' | 'pen' | 'marker' | 'eraser'>('type');
  const [activeColor, setActiveColor] = useState<string>('#1A1A1A');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [format, setFormat] = useState<'notepad' | 'notebook'>('notepad');
  const [appearance, setAppearance] = useState('cream');
  const [pageStyle, setPageStyle] = useState('blank');
  const [activeFont, setActiveFont] = useState<'modern' | 'handwritten' | 'journal' | 'mono'>('modern');

  // --- REFS ---
  const currentStroke = useRef<Stroke | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // --- PAGINATION & DATA STATE ---
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [notebookPages, setNotebookPages] = useState<PageData[]>([
    { title: '', content: '', strokes: [] }
  ]);
  const [saveStatus, setSaveStatus] = useState('Saved · all changes');

  const colors = [
    { id: 'black', hex: '#1A1A1A' },
    { id: 'orange', hex: '#C46D3B' },
    { id: 'green', hex: '#79936C' },
    { id: 'blue', hex: '#4A7694' },
  ];

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const fetchSessionAndData = async () => {
      // Get the logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      // If opening an existing note from the dashboard
      if (urlId) {
        setNoteId(urlId);
        const { data, error } = await supabase
          .from('notes')
          .select('pages, format, title')
          .eq('id', urlId)
          .single();

        if (data && !error) {
          if (data.pages) setNotebookPages(data.pages);
          if (data.format) setFormat(data.format);
        }
      }
    };

    fetchSessionAndData();
  }, [urlId]);


  // --- 2. ACTUAL AUTO-SAVE ---
  useEffect(() => {
    if (!userId || saveStatus !== 'Saving...') return;

    const saveTimeout = setTimeout(async () => {
      // Fallback to 'Untitled' if the first page has no title
      const currentTitle = notebookPages[0]?.title || 'Untitled';

      const payload = {
        user_id: userId,
        title: currentTitle,
        format: format,
        pages: notebookPages,
        updated_at: new Date().toISOString(),
      };

      if (noteId) {
        // UPDATE EXISTING NOTE
        const { error } = await supabase
          .from('notes')
          .update(payload)
          .eq('id', noteId);

        if (!error) setSaveStatus('Saved · all changes');
        else setSaveStatus('Error saving');

      } else {
        // CREATE NEW NOTE
        const { data, error } = await supabase
          .from('notes')
          .insert(payload)
          .select()
          .single();

        if (data && !error) {
          setNoteId(data.id);
          setSaveStatus('Saved · all changes');
          // Silently update the URL so future edits update this note instead of duplicating
          window.history.replaceState(null, '', `/editor?id=${data.id}`);
        } else {
          setSaveStatus('Error saving');
        }
      }
    }, 1500);

    return () => clearTimeout(saveTimeout);
  }, [notebookPages, format, saveStatus, noteId, userId]);


  // --- HELPERS ---
  const getFontClass = () => {
    switch (activeFont) {
      case 'mono': return 'font-mono text-sm';
      case 'journal': return 'font-serif text-lg';
      case 'handwritten': return 'font-sans italic text-lg';
      case 'modern': default: return 'font-sans text-base';
    }
  };

  const getPagePattern = () => {
    switch (pageStyle) {
      case 'lined': return 'bg-[linear-gradient(transparent_27px,#E4DFD2_28px)] [background-size:100%_28px]';
      case 'dotted': return 'bg-[radial-gradient(#C3BEB2_1.5px,transparent_1.5px)] [background-size:20px_20px]';
      case 'grid': return 'bg-[linear-gradient(#E4DFD2_1px,transparent_1px),linear-gradient(90deg,#E4DFD2_1px,transparent_1px)] [background-size:24px_24px]';
      case 'graph': return 'bg-[linear-gradient(#E4DFD2_1px,transparent_1px),linear-gradient(90deg,#E4DFD2_1px,transparent_1px)] [background-size:12px_12px]';
      case 'checklist': return 'bg-[linear-gradient(transparent_27px,#E4DFD2_28px),linear-gradient(90deg,transparent_39px,#E8BBD0_40px,transparent_41px)] [background-size:100%_28px,100%_100%]';
      case 'blank': default: return '';
    }
  };

  const getAppearanceBg = () => {
    switch (appearance) {
      case 'clean': return 'bg-[#EFECE1]';
      case 'dark': return 'bg-[#1A1A1A]';
      case 'white': return 'bg-white';
      case 'pink': return 'bg-[#F5DFE6]';
      case 'lavender': return 'bg-[#E4DEFA]';
      case 'cream': default: return 'bg-[#FDFBF7]';
    }
  };

  const cycleFont = () => {
    const fonts: Array<'modern' | 'handwritten' | 'journal' | 'mono'> = ['modern', 'handwritten', 'journal', 'mono'];
    const nextIndex = (fonts.indexOf(activeFont) + 1) % fonts.length;
    setActiveFont(fonts[nextIndex]);
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, [format]);

  // --- PAGINATION & TEXT LOGIC ---
  const goToNextPage = () => setCurrentPageIndex((prev) => Math.min(notebookPages.length - 1, prev + 1));
  const goToPrevPage = () => setCurrentPageIndex((prev) => Math.max(0, prev - 1));

  const addNewPage = () => {
    setNotebookPages((prev) => [...prev, { title: '', content: '', strokes: [] }]);
    setCurrentPageIndex(notebookPages.length);
    setSaveStatus('Saving...');

    toast.success('New page added', {
      description: `Switched to page ${notebookPages.length + 1}`,
      duration: 2000,
    });
  };

  const updateText = (field: 'title' | 'content', value: string) => {
    setSaveStatus('Saving...'); // Triggers auto-save!
    setNotebookPages((prev) => {
      const newPages = [...prev];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], [field]: value };
      return newPages;
    });
  };

  useEffect(() => {
    const currentStrokes = notebookPages[currentPageIndex]?.strokes || [];
    redrawCanvas(currentStrokes);
  }, [notebookPages, currentPageIndex]);

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
      setSaveStatus('Saving...'); // Triggers auto-save!
      const finishedStroke = {
        ...currentStroke.current,
        points: [...currentStroke.current.points]
      };

      setNotebookPages((prevPages) => {
        const newPages = [...prevPages];
        const currentPage = newPages[currentPageIndex];
        newPages[currentPageIndex] = {
          ...currentPage,
          strokes: [...currentPage.strokes, finishedStroke]
        };
        return newPages;
      });

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
    setSaveStatus('Saving...'); // Triggers auto-save!
    setNotebookPages((prevPages) => {
      const newPages = [...prevPages];
      const currentPage = newPages[currentPageIndex];

      if (currentPage && currentPage.strokes.length > 0) {
        newPages[currentPageIndex] = {
          ...currentPage,
          strokes: currentPage.strokes.slice(0, -1)
        };
      }
      return newPages;
    });
  };

  const handleFormatChange = (newFormat: 'notepad' | 'notebook') => {
    setFormat(newFormat);
    setSaveStatus('Saving...'); // Format changes should save too
  };

  const activePage = notebookPages[currentPageIndex] || { title: '', content: '', strokes: [] };

  return (
    <div className="min-h-screen bg-[#EFECE1] flex justify-center font-sans text-[#1A1A1A]">
      <main className="w-full max-w-md relative flex flex-col h-screen overflow-hidden">

        {/* Header Section */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0">
          <Link href="/" className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="text-center">
            <h1 className="font-bold text-sm text-[#1A1A1A]">
              {activePage?.title || 'Blank note'}
            </h1>
            <p className={`text-xs mt-0.5 transition-colors ${saveStatus === 'Saving...' ? 'text-[#CC6B36] font-medium' : 'text-[#8C877D]'}`}>
              {saveStatus}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></button>
            <button className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg></button>
          </div>
        </header>

        {/* Note Canvas Container */}
        <div className={`flex-1 px-5 overflow-y-auto hide-scrollbar relative ${format === 'notebook' ? 'pb-[180px]' : 'pb-[130px]'}`}>
          <div className="relative min-h-full">

            {format === 'notebook' && (
              <>
                <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-[1.25rem] border border-black/5 shadow-sm transition-colors duration-300 z-0 ${getAppearanceBg()}`} />
                <div className={`absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[1.25rem] border border-black/5 shadow-sm transition-colors duration-300 z-0 ${getAppearanceBg()}`} />
              </>
            )}

            <div
              ref={containerRef}
              className={`absolute inset-0 rounded-[1.25rem] shadow-sm p-6 flex flex-col transition-colors duration-300 z-10 ${getAppearanceBg()} ${getPagePattern()}`}
            >
              <input
                type="text"
                placeholder="Untitled"
                value={activePage.title}
                onChange={(e) => updateText('title', e.target.value)}
                className={`font-fraunces text-4xl font-black placeholder:text-[#7A868C] bg-transparent outline-none w-full mb-4 tracking-tight relative z-10 transition-colors duration-300 ${appearance === 'dark' ? 'text-[#FDFBF7]' : 'text-[#7A868C]'}`}
                style={{ pointerEvents: activeTool === 'type' ? 'auto' : 'none' }}
              />
              <textarea
                placeholder="Start writing..."
                value={activePage.content}
                onChange={(e) => updateText('content', e.target.value)}
                className={`w-full flex-1 bg-transparent outline-none resize-none font-medium leading-relaxed placeholder:text-[#A39E93] relative z-10 transition-colors duration-300 ${getFontClass()} ${appearance === 'dark' ? 'text-[#EFECE1]' : 'text-[#8A857D]'}`}
                style={{ pointerEvents: activeTool === 'type' ? 'auto' : 'none' }}
              />
              <canvas
                ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={stopDrawing}
                onPointerOut={stopDrawing}
                className="absolute inset-0 rounded-[1.25rem] touch-none z-20 w-full h-full"
                style={{ pointerEvents: activeTool === 'type' ? 'none' : 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Floating Toolbars */}
        {!isSettingsOpen && (
          <div className="absolute bottom-6 w-full max-w-md px-5 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-30">

            {/* PAGINATION ROW */}
            {format === 'notebook' && (
              <div className="flex items-center justify-between px-2 mb-1 w-full animate-fade-in">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPageIndex === 0}
                    className="w-8 h-8 rounded-full bg-[#E6E1D3] flex items-center justify-center text-[#1A1A1A] transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-sm font-medium text-[#5C5852]">
                    Page {currentPageIndex + 1} of {notebookPages.length}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPageIndex === notebookPages.length - 1}
                    className="w-8 h-8 rounded-full bg-[#E6E1D3] flex items-center justify-center text-[#1A1A1A] transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <button
                  onClick={addNewPage}
                  className="flex items-center gap-1 text-[#CC6B36] font-bold text-sm transition-transform active:scale-95 hover:text-[#BA5F2D]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  New page
                </button>
              </div>
            )}

            {/* Drawing Tools */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center w-full">
              <div className="flex items-center bg-[#E6E1D3] rounded-full p-1 shrink-0 shadow-sm">
                {(['type', 'pen', 'marker', 'eraser'] as const).map((tool) => (
                  <button key={tool} onClick={() => setActiveTool(tool)} className={`text-xs font-bold px-4 py-2 rounded-full capitalize transition-colors ${activeTool === tool ? 'bg-[#1A1A1A] text-white' : 'text-[#8C877D]'}`}>{tool}</button>
                ))}
              </div>
              <div className={`flex items-center gap-1.5 bg-[#E6E1D3] rounded-full p-1.5 shrink-0 shadow-sm transition-opacity ${activeTool === 'type' || activeTool === 'eraser' ? 'opacity-50 pointer-events-none' : ''}`}>
                {colors.map((c) => (
                  <button key={c.id} onClick={() => setActiveColor(c.hex)} className={`w-6 h-6 rounded-full transition-all ${activeColor === c.hex ? 'border-2 border-white ring-1 ring-black/20 scale-110' : ''}`} style={{ backgroundColor: c.hex }} />
                ))}
              </div>
              <div className="flex items-center bg-[#E6E1D3] rounded-full p-1 shrink-0 shadow-sm">
                <button onClick={handleUndo} disabled={activePage.strokes.length === 0} className="text-[#8C877D] text-xs font-bold px-4 py-2 rounded-full disabled:opacity-40">Undo</button>
              </div>
            </div>

            {/* Formatting Tools */}
            <div className="flex gap-2 w-full">
              <button onClick={() => setIsSettingsOpen(true)} className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
                <span className={`w-3.5 h-3.5 rounded-full border border-[#D5D0C4] ${getAppearanceBg()}`} />
                <span className="font-bold text-[#1A1A1A] text-sm capitalize">{appearance}</span>
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="flex-1 bg-white rounded-full py-3.5 flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity" onClick={() => setIsSettingsOpen(false)} />

            <div className="bg-[#FDFBF7] w-full rounded-t-[2rem] pt-3 pb-8 px-6 relative z-10 animate-slide-up shadow-2xl">
              <div className="w-12 h-1.5 bg-[#E4DFD2] rounded-full mx-auto mb-6" />

              {/* Format Toggle */}
              <div className="mb-6">
                <h3 className="text-[10px] font-bold tracking-wider text-[#8C877D] uppercase mb-3">Format</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleFormatChange('notepad')} className={`flex-1 p-3 rounded-2xl text-left border transition-colors ${format === 'notepad' ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-[#E4DFD2] text-[#1A1A1A]'}`}>
                    <div className="font-bold text-sm mb-0.5">Notepad</div>
                    <div className={`text-xs ${format === 'notepad' ? 'text-gray-400' : 'text-[#8C877D]'}`}>One long page</div>
                  </button>
                  <button onClick={() => handleFormatChange('notebook')} className={`flex-1 p-3 rounded-2xl text-left border transition-colors ${format === 'notebook' ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-transparent border-[#E4DFD2] text-[#1A1A1A]'}`}>
                    <div className="font-bold text-sm mb-0.5">Notebook</div>
                    <div className={`text-xs ${format === 'notebook' ? 'text-notebook' : 'text-[#8C877D]'}`}>Flip through sheets</div>
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

              <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-[#E6E1D3] text-[#1A1A1A] font-bold text-base py-4 rounded-full active:scale-95 transition-transform mt-8">
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Ensure the page safely handles useSearchParams with Suspense
export default function EditorScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EFECE1]" />}>
      <EditorContent />
    </Suspense>
  );
}
