'use client';

import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function DashboardScreen() {
  // --- USER STATE ---
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // --- FETCH DATA ON LOAD ---
    useEffect(() => {
      const fetchUserAndNotes = async () => {
        // 1. Fetch User Identity
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setIsLoadingUser(false);

        if (user) {
          // 2. Fetch Notes specific to this user, ordered by newest first
          const { data, error } = await supabase
            .from('notes')
            .select('id, title, updated_at, format, is_pinned, is_favorite') // Added the new columns here!
            .order('is_pinned', { ascending: false }) // Pinned items float to the top
            .order('updated_at', { ascending: false }); // Then sort by most recently edited

          if (!error && data) {
            setNotes(data);
          }
          setIsLoadingNotes(false);
        }
      };

      fetchUserAndNotes();
    }, []);

  // --- FETCH USER ON LOAD ---
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  // Helper to extract initials
  const getInitials = (name?: string, email?: string) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'NA';
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = showFavoritesOnly ? note.is_favorite : true;
    return matchesSearch && matchesFavorite;
  });

  // 2. Split into Pinned and Normal notes
  const pinnedNotes = displayNotes.filter((note) => note.is_pinned);
  const normalNotes = displayNotes.filter((note) => !note.is_pinned);

  const avatarUrl = user?.user_metadata?.avatar_url;
  return (
    <div className="h-[100dvh] overflow-hidden bg-[#EFECE1] flex justify-center font-sans text-[#1A1A1A]">
      <main className="w-full max-w-md h-full overflow-y-auto relative pb-32">
        {/* --- STICKY HEADER & SEARCH --- */}
        <div className="sticky top-0 z-40 bg-[#EFECE1] px-5 pt-12 pb-6">
          <header className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#8C877D] uppercase mb-1">
                {todayFormatted}
              </p>
              <h1 className="font-fraunces text-[2.5rem] leading-none font-black tracking-tight">
                Your desk
              </h1>
            </div>
            {/* DYNAMIC PROFILE ICON */}
            <Link
              href="/settings"
              className="w-10 h-10 rounded-full bg-[#A9C2A2] flex items-center justify-center font-bold text-[#1A1A1A] transition-transform active:scale-95 overflow-hidden shrink-0 border border-black/5"
            >
              {isLoading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm">
                  {getInitials(user?.user_metadata?.full_name, user?.email)}
                </span>
              )}
            </Link>
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

          {/* Pinned Section (Only show if there are pinned notes) */}
          {pinnedNotes.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-bold tracking-wider text-[#8C877D] uppercase mb-3 mt-2.5">
                Pinned
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {pinnedNotes.map((note) => (
                  <Link
                    href={`/editor?id=${note.id}`}
                    key={note.id}
                    className="min-w-[160px] snap-start flex flex-col gap-2 transition-transform active:scale-95"
                  >
                    {/* Dynamic Card Cover based on format */}
                    <div className={`h-28 rounded-2xl p-3 shadow-sm relative overflow-hidden ${note.format === 'notepad' ? 'bg-[#DDC8A2]' : 'bg-white'}`}>
                      {note.format === 'notepad' ? (
                        <>
                          <div className="h-1.5 w-20 bg-black/20 rounded-full" />
                          <div className="absolute bottom-4 left-0 right-0 h-px bg-black/10" />
                        </>
                      ) : (
                        <>
                          <div className="h-1.5 w-16 bg-gray-300 rounded-full mb-2" />
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] mt-4" />
                        </>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm line-clamp-1">{note.title || 'Untitled'}</h3>
                      <p className="text-xs text-[#8C877D] mt-0.5 capitalize">
                        {note.format} · {new Date(note.updated_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* All Notes Section */}
            <section className="mb-8">
              <div className="flex justify-between items-end mb-3 mt-1.5">
                <h2 className="text-xs font-bold tracking-wider text-[#8C877D] uppercase">
                  {showFavoritesOnly ? 'Favourites' : 'All Notes'}
                </h2>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    showFavoritesOnly
                      ? 'bg-[#CC6B36] text-white shadow-sm'
                      : 'bg-[#E4DFD2] text-[#8C877D]'
                  }`}
                >
                  Favourites
                </button>
              </div>

              <div className="pt-2">
                <div className="flex flex-col gap-3">
                  {isLoadingNotes ? (
                    // Loading Skeletons
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm h-24 animate-pulse flex flex-col justify-between border border-black/5">
                          <div className="h-5 bg-gray-200 rounded w-1/2" />
                          <div className="h-3 bg-gray-100 rounded w-1/4" />
                        </div>
                      ))}
                    </>
                  ) : normalNotes.length > 0 ? (
                    // Render Real Normal Notes
                    normalNotes.map((note) => (
                      <Link
                        href={`/editor?id=${note.id}`}
                        key={note.id}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 flex flex-col justify-between min-h-[96px] transition-transform active:scale-95 relative"
                      >
                        {/* Favorite Indicator (We don't need the pin here since pinned notes are up top!) */}
                        {note.is_favorite && (
                          <div className="absolute top-4 right-4">
                            <svg className="w-4 h-4 text-[#CC6B36]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </div>
                        )}

                        <h3 className="font-bold text-base leading-snug mb-2 line-clamp-1 pr-8">
                          {note.title || 'Untitled'}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-[#8C877D] font-medium mt-auto">
                          <span>
                            {new Date(note.updated_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                          <span className="capitalize bg-[#EFECE1] px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                            {note.format}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    // Empty State
                    <div className="text-center py-12">
                      <Link href="/editor">
                        <div className="w-16 h-16 bg-[#E4DFD2] rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#8C877D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </Link>
                      <h3 className="font-bold text-[#1A1A1A] mb-1">
                        {showFavoritesOnly ? 'No favourites yet' : 'No notes found'}
                      </h3>
                      <p className="text-sm text-[#8C877D]">
                        {searchQuery ? "Try searching for something else." : "Tap the + button to start writing."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

          {/* Start from a Template Section */}
          {/* TODO: this will be implemented soon */}
          {/*<section>
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
          </section>*/}

        </div>

        {/* Floating Action Bar (Sticky at bottom) */}
        <div className="fixed bottom-8 w-full max-w-md px-5 left-1/2 -translate-x-1/2 z-50 flex justify-between gap-2.5 pointer-events-none">

          <button className="flex-1 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-full py-3.5 px-4 flex items-center justify-center border border-black/5 pointer-events-auto active:scale-95 transition-transform min-w-0">
            <span className="font-fraunces font-black text-[15px] tracking-wide text-[#1A1A1A] truncate">
              {/* Disabled for now */}
              {/*<Link href="/templates"> */}
              <Link href="#">
                Browse templates
              </Link>
            </span>
          </button>

          <button className="bg-[#CC6B36] shadow-[0_8px_30px_rgba(204,107,54,0.3)] rounded-full py-3.5 px-6 flex items-center justify-center gap-1.5 transition-transform active:scale-95 pointer-events-auto shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-bold text-white text-[15px]">
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
