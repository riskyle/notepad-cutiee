'use client';

import Link from 'next/link';

export default function DashboardScreen() {
  return (
    <div className="h-[100dvh] overflow-hidden bg-[#EFECE1] flex justify-center font-sans text-[#1A1A1A]">
      <main className="w-full max-w-md h-full overflow-y-auto relative pb-32">
        {/* --- STICKY HEADER & SEARCH --- */}
        <div className="sticky top-0 z-40 bg-[#EFECE1] px-5 pt-12 pb-6">
          <header className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#8C877D] uppercase mb-1">
                Thursday, 8 Aug
              </p>
              <h1 className="font-fraunces text-[2.5rem] leading-none font-black tracking-tight">
                Your desk
              </h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#A9C2A2] flex items-center justify-center font-bold text-sm text-[#1A1A1A] shadow-sm">
              MK
            </div>
          </header>

          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search your notes"
              className="w-full bg-white rounded-full py-3.5 pl-12 pr-4 text-base font-medium outline-none shadow-sm placeholder:text-[#A39E93] text-[#1A1A1A]"
            />
          </div>

          {/* Optional: Adds a subtle gradient fade below the search bar to blend into the scroll */}
          <div className="absolute left-0 right-0 -bottom-4 h-4 bg-gradient-to-b from-[#EFECE1] to-transparent pointer-events-none" />
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="px-5">

          {/* Pinned Section */}
          <section className="mb-8">
            <h2 className="text-xs font-bold tracking-wider text-[#8C877D] uppercase mb-3 mt-2.5">
              Pinned
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {/* Pinned Card 1 */}
              <div className="min-w-[160px] snap-start flex flex-col gap-2">
                <div className="h-28 bg-white rounded-2xl p-3 shadow-sm relative overflow-hidden">
                  <div className="h-1.5 w-16 bg-gray-300 rounded-full mb-2" />
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] mt-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Thesis — chapter 3</h3>
                  <p className="text-xs text-[#8C877D] mt-0.5">3 pages · Study Notes · just now</p>
                </div>
              </div>

              {/* Pinned Card 2 */}
              <div className="min-w-[160px] snap-start flex flex-col gap-2">
                <div className="h-28 bg-[#DDC8A2] rounded-2xl p-3 shadow-sm relative">
                  <div className="h-1.5 w-20 bg-black/20 rounded-full" />
                  <div className="absolute bottom-4 left-0 right-0 h-px bg-black/10" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Groceries</h3>
                  <p className="text-xs text-[#8C877D] mt-0.5">Shopping List · just now</p>
                </div>
              </div>
            </div>
          </section>

          {/* All Notes Section */}
          <section className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-xs font-bold tracking-wider text-[#8C877D] uppercase">
                All Notes
              </h2>
              <button className="text-xs font-bold bg-[#E4DFD2] text-[#8C877D] px-3 py-1 rounded-full">
                Favourites
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* List Item 1 */}
              <div className="bg-white rounded-[1.25rem] p-3 flex gap-4 shadow-sm items-center">
                <div className="w-14 h-14 shrink-0 bg-[#F4ECD8] rounded-xl" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-0.5">Untitled</h3>
                  <p className="text-sm text-[#8C877D] truncate mb-1">
                    kokpokko asfasfasfasfas fa sfasfasfafas af asf
                  </p>
                  <p className="text-xs text-[#A39E93]">Blank note · just now</p>
                </div>
              </div>

              {/* List Item 2 */}
              <div className="bg-white rounded-[1.25rem] p-3 flex gap-4 shadow-sm items-center">
                <div className="w-14 h-14 shrink-0 bg-[#F4ECD8] rounded-xl relative">
                  <div className="absolute bottom-3 left-0 right-0 h-px bg-black/10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-0.5">Untitled</h3>
                  <p className="text-sm text-[#8C877D] truncate mb-1">Test line from verifier</p>
                  <p className="text-xs text-[#A39E93]">2 pages · Daily Planner · just now</p>
                </div>
              </div>

              {/* List Item 3 */}
              <div className="bg-white rounded-[1.25rem] p-3 flex gap-4 shadow-sm items-center">
                <div className="w-14 h-14 shrink-0 bg-[#F4ECD8] rounded-xl relative">
                   <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:10px_10px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base mb-0.5">Untitled</h3>
                  <p className="text-sm text-[#8C877D] truncate mb-1">rarfawfafw</p>
                  <p className="text-xs text-[#A39E93]">2 pages · Blank note · just now</p>
                </div>
              </div>
            </div>
          </section>

          {/* Start from a Template Section */}
          <section>
            <h2 className="text-xs font-bold tracking-wider text-[#8C877D] uppercase mb-3">
              Start from a template
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
              <button className="shrink-0 flex items-center gap-2 border border-[#D5D0C4] rounded-full px-4 py-2 bg-transparent text-sm font-bold text-[#5C5852]">
                <span className="w-3 h-3 rounded-full border-2 border-[#DDC8A2]" /> Daily Planner
              </button>
              <button className="shrink-0 flex items-center gap-2 border border-[#D5D0C4] rounded-full px-4 py-2 bg-transparent text-sm font-bold text-[#5C5852]">
                <span className="w-3 h-3 rounded-full border-2 border-[#B4C6E4]" /> To-Do List
              </button>
              <button className="shrink-0 flex items-center gap-2 border border-[#D5D0C4] rounded-full px-4 py-2 bg-transparent text-sm font-bold text-[#5C5852]">
                <span className="w-3 h-3 rounded-full border-2 border-[#E8BBD0]" /> Journal
              </button>
            </div>
          </section>

        </div>

        {/* Floating Action Bar (Sticky at bottom) */}
        <div className="fixed bottom-8 w-full max-w-md px-5 left-1/2 -translate-x-1/2 z-50 flex justify-between gap-3 pointer-events-none">
          <button className="flex-1 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-full py-4 px-6 flex items-center justify-center border border-black/5 pointer-events-auto">
            <span className="font-fraunces font-black text-lg tracking-wide text-[#1A1A1A]">
              <Link href="/templates">
                Browse templates
              </Link>
            </span>
          </button>

          <button className="bg-[#CC6B36] shadow-[0_8px_30px_rgba(204,107,54,0.3)] rounded-full py-4 px-8 flex items-center justify-center gap-1.5 transition-transform active:scale-95 pointer-events-auto">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-bold text-white text-lg">
              <Link href="/editor">
                New
              </Link>
            </span>
          </button>
        </div>

      </main>
    </div>
  );
}
