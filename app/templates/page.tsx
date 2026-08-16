'use client'

import { useState } from 'react';
import Link from 'next/link';

export default function TemplatesScreen() {
  // --- STATE FOR CATEGORY SELECTION ---
  const [activeCategory, setActiveCategory] = useState('All');

  // List of available categories
  const categories = ['All', 'Planners', 'Productivity', 'Journaling'];

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#EFECE1] flex justify-center font-sans text-[#1A1A1A]">
        <main className="w-full max-w-md h-full overflow-y-auto relative">

        {/* --- STICKY HEADER & CHOICES --- */}
        <div className="sticky top-0 z-40 bg-[#EFECE1] px-5 pt-12 pb-4">

          {/* Top Row: Back Button & Title */}
          <header className="flex items-center gap-4 mb-6">
            <Link href="/" className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A] transition-transform active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="font-fraunces text-3xl font-black tracking-tight">
                Templates
              </h1>
              <p className="text-xs font-medium text-[#8C877D]">
                Step 1 of 3 · Pick a starting page
              </p>
            </div>
        </header>

        {/* Bottom Row: Dynamic Category Choices */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeCategory === category
                  ? 'bg-[#1A1A1A] text-white border border-[#1A1A1A]'
                  : 'bg-white text-[#5C5852] border border-[#D5D0C4]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

          {/* Smooth fade effect to blend the scrollable content into the sticky header */}
          <div className="absolute left-0 right-0 -bottom-4 h-4 bg-gradient-to-b from-[#EFECE1] to-transparent pointer-events-none" />
        </div>

        {/* Grid Container */}
        <div className="px-5 pt-4 pb-12">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">

            {/* 1. Blank Note */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-white rounded-[1.25rem] p-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="h-1.5 w-16 bg-gray-300 rounded-full mb-1.5" />
                <div className="h-1 w-24 bg-gray-200 rounded-full" />
              </div>
              <h3 className="font-bold text-sm">Blank note</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">Just a page</p>
            </button>

            {/* 2. Daily Planner */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-[#F1E8D7] rounded-[1.25rem] p-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="h-1.5 w-16 bg-black/20 rounded-full mb-1.5" />
                <div className="h-1 w-24 bg-black/10 rounded-full" />
                <div className="absolute bottom-4 left-0 right-0 h-px bg-black/10" />
              </div>
              <h3 className="font-bold text-sm">Daily Planner</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">Hour by hour</p>
            </button>

            {/* 3. Weekly Planner (Grid) */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-white rounded-[1.25rem] pt-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="px-4 mb-3 relative z-10">
                  <div className="h-1.5 w-16 bg-gray-300 rounded-full mb-1.5" />
                  <div className="h-1 w-24 bg-gray-200 rounded-full" />
                </div>
                {/* CSS Grid Pattern */}
                <div className="absolute inset-0 top-12 border-t border-gray-200 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] [background-size:18px_18px]" />
              </div>
              <h3 className="font-bold text-sm">Weekly Planner</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">Seven columns</p>
            </button>

            {/* 4. To-Do List (Lines) */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-white rounded-[1.25rem] pt-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="px-4 mb-3 relative z-10">
                  <div className="h-1.5 w-16 bg-gray-300 rounded-full mb-1.5" />
                  <div className="h-1 w-24 bg-gray-200 rounded-full" />
                </div>
                {/* CSS Horizontal Lines Pattern */}
                <div className="absolute inset-0 top-12 border-t border-gray-200 bg-[linear-gradient(transparent_23px,#e5e7eb_24px)] [background-size:100%_24px]" />
              </div>
              <h3 className="font-bold text-sm">To-Do List</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">Tick things off</p>
            </button>

            {/* 5. Meeting Notes */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-white rounded-[1.25rem] p-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="h-1.5 w-16 bg-gray-300 rounded-full mb-1.5" />
                <div className="h-1 w-24 bg-gray-200 rounded-full" />
                <div className="absolute top-[45%] left-0 right-0 h-px bg-gray-200" />
                <div className="absolute bottom-6 left-0 right-0 h-px bg-gray-200" />
              </div>
              <h3 className="font-bold text-sm">Meeting Notes</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">Who, what, next</p>
            </button>

            {/* 6. Journal */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-[#F5DFE6] rounded-[1.25rem] p-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="h-1.5 w-16 bg-black/20 rounded-full mb-1.5" />
                <div className="h-1 w-24 bg-black/10 rounded-full" />
              </div>
              <h3 className="font-bold text-sm">Journal</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">A page a day</p>
            </button>

            {/* 7. Gratitude */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-[#E4DEFA] rounded-[1.25rem] p-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="h-1.5 w-16 bg-black/20 rounded-full mb-1.5" />
                <div className="h-1 w-24 bg-black/10 rounded-full" />
                <div className="absolute bottom-6 left-0 right-0 h-px bg-black/10" />
              </div>
              <h3 className="font-bold text-sm">Gratitude</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">Three good things</p>
            </button>

            {/* 8. Mood Journal (Dots) */}
            <button className="flex flex-col text-left group">
              <div className="w-full aspect-[4/3] bg-[#DBEFE3] rounded-[1.25rem] pt-4 shadow-sm mb-2 relative overflow-hidden group-active:scale-95 transition-transform">
                <div className="px-4 mb-3 relative z-10">
                  <div className="h-1.5 w-16 bg-black/20 rounded-full mb-1.5" />
                  <div className="h-1 w-24 bg-black/10 rounded-full" />
                </div>
                {/* CSS Dotted Pattern */}
                <div className="absolute inset-0 top-12 bg-[radial-gradient(rgba(0,0,0,0.15)_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
              </div>
              <h3 className="font-bold text-sm">Mood Journal</h3>
              <p className="text-xs text-[#8C877D] mt-0.5">Track the week</p>
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}
