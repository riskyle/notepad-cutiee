'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsScreen() {
  // --- TOGGLE STATES ---
  const [spellCheck, setSpellCheck] = useState(true);
  const [titleFromFirstLine, setTitleFromFirstLine] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#EFECE1] flex justify-center font-sans text-[#1A1A1A]">
      <main className="w-full max-w-md h-full overflow-y-auto relative px-5 pt-12 pb-8 hide-scrollbar">

        {/* --- HEADER --- */}
        <header className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-[#E4DFD2] flex items-center justify-center text-[#1A1A1A] transition-transform active:scale-95 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-fraunces text-3xl font-black tracking-tight">
            Settings
          </h1>
        </header>

        {/* --- USER PROFILE CARD --- */}
        <section className="bg-white rounded-[1.25rem] p-4 flex items-center gap-4 shadow-sm mb-8">
          <div className="w-12 h-12 rounded-full bg-[#A9C2A2] flex items-center justify-center font-bold text-lg text-[#1A1A1A] shrink-0">
            MK
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base leading-snug">Mira Kavanagh</h2>
            <p className="text-sm text-[#8C877D] truncate">mira.kavanagh@gmail.com</p>
          </div>
          <div className="bg-[#E5F0E1] text-[#557B46] px-3 py-1 rounded-full text-xs font-bold shrink-0">
            Synced
          </div>
        </section>

        {/* --- NEW NOTE DEFAULTS --- */}
        <section className="mb-6">
          <h3 className="text-[11px] font-bold tracking-wider text-[#8C877D] uppercase mb-3 ml-1">
            New Note Defaults
          </h3>
          <div className="bg-white rounded-[1.25rem] shadow-sm flex flex-col overflow-hidden">

            {/* Appearance Row */}
            <div className="flex items-center justify-between p-4">
              <span className="text-[15px] font-medium text-[#1A1A1A]">Appearance</span>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FDFBF7] border border-[#D5D0C4]" />
                <span className="text-[#CC6B36] font-bold text-[15px]">Cream</span>
              </div>
            </div>

            <div className="h-px bg-black/5 mx-4" /> {/* Divider */}

            {/* Page Style Row */}
            <div className="flex items-center justify-between p-4">
              <span className="text-[15px] font-medium text-[#1A1A1A]">Page style</span>
              <span className="text-[#CC6B36] font-bold text-[15px]">Blank</span>
            </div>

            <div className="h-px bg-black/5 mx-4" /> {/* Divider */}

            {/* Font Row */}
            <div className="flex items-center justify-between p-4">
              <span className="text-[15px] font-medium text-[#1A1A1A]">Font</span>
              <span className="text-[#CC6B36] font-bold text-[15px]">Modern</span>
            </div>
          </div>
          <p className="text-xs text-[#8C877D] mt-3 ml-1">
            "+ New" skips the wizard and opens a page with these settings.
          </p>
        </section>

        {/* --- EDITOR SETTINGS --- */}
        <section className="mb-8">
          <h3 className="text-[11px] font-bold tracking-wider text-[#8C877D] uppercase mb-3 ml-1">
            Editor
          </h3>
          <div className="bg-white rounded-[1.25rem] shadow-sm flex flex-col overflow-hidden">

            {/* Spell check Toggle */}
            <div className="flex items-center justify-between p-4">
              <span className="text-[15px] font-medium text-[#1A1A1A]">Spell check</span>
              <button
                onClick={() => setSpellCheck(!spellCheck)}
                className={`w-[46px] h-[28px] rounded-full p-1 transition-colors duration-300 ease-in-out ${spellCheck ? 'bg-[#79936C]' : 'bg-[#D5D0C4]'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${spellCheck ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="h-px bg-black/5 mx-4" /> {/* Divider */}

            {/* Title Toggle */}
            <div className="flex items-center justify-between p-4">
              <span className="text-[15px] font-medium text-[#1A1A1A]">Title from first line</span>
              <button
                onClick={() => setTitleFromFirstLine(!titleFromFirstLine)}
                className={`w-[46px] h-[28px] rounded-full p-1 transition-colors duration-300 ease-in-out ${titleFromFirstLine ? 'bg-[#79936C]' : 'bg-[#D5D0C4]'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${titleFromFirstLine ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="h-px bg-black/5 mx-4" /> {/* Divider */}

            {/* Reduce motion Toggle */}
            <div className="flex items-center justify-between p-4">
              <span className="text-[15px] font-medium text-[#1A1A1A]">Reduce motion</span>
              <button
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`w-[46px] h-[28px] rounded-full p-1 transition-colors duration-300 ease-in-out ${reduceMotion ? 'bg-[#79936C]' : 'bg-[#D5D0C4]'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${reduceMotion ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </section>

        {/* --- FOOTER ACTIONS --- */}
        <button className="w-full bg-transparent border border-[#D5D0C4] rounded-full py-4 text-base font-bold text-[#CC6B36] active:scale-95 transition-transform mb-4">
          Sign out
        </button>

        <p className="text-center text-xs text-[#8C877D]">
          Notepad 1.0 · 14 notes on this device
        </p>

      </main>
    </div>
  );
}
