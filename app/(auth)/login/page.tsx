'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Fraunces } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Initialize Supabase
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['900']
});

export default function LoginScreen() {
  const [clickedDisabled, setClickedDisabled] = useState<boolean>(false)
  const signInWithGoogle = async () => {
    setClickedDisabled(true);

    toast.loading('Redirecting to Google...', {
        id: 'google-login', // Using an ID prevents duplicate toasts if they click twice
    });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // This tells Google to send the user to our new route!
          redirectTo: `${location.origin}/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setClickedDisabled(true);
      toast.error('Authentication failed', {
        id: 'google-login',
        description: error.message || 'Could not connect to Google. Please try again.',
      });
    } finally {
      setClickedDisabled(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#EFECE1] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/*
        The container is constrained to max-w-sm (small) to mimic the mobile width.
        On desktop, it centers beautifully like a sleek login card.
      */}
      <div className="w-full max-w-sm flex flex-col items-start relative z-10 mt-12 md:mt-0">

        {/* CSS-based Notebook Icon */}
        <div className="w-28 h-32 bg-white rounded-3xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] relative overflow-hidden mb-8 transform -rotate-1">
          {/* Vertical margin line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-orange-300/50" />

          <div className="flex flex-col h-full pt-6 pb-4 pl-8 pr-4 gap-y-3">
            {/* Thick brown header line */}
            <div className="h-2.5 w-14 bg-[#CD6C38] rounded-full mb-1" />

            {/* Thin notebook lines */}
            <div className="h-px w-full bg-gray-100" />
            <div className="h-px w-full bg-gray-100" />
            <div className="h-px w-full bg-gray-100" />
            <div className="h-px w-full bg-gray-100" />
          </div>
        </div>

        {/* Headline */}
        <h1 className={`text-[2.75rem] leading-[1.05] text-[#1A1A1A] mb-4 ${fraunces.className}`}>
          A shelf of<br />notebooks<br />in your pocket.
        </h1>

        {/* Subtext */}
        <p className="text-[1.05rem] leading-relaxed text-[#5C5852] mb-10 pr-4 font-medium">
          Pick the paper, pick the lines, then write. Every note can look like its own thing.
        </p>

        {/* Google Button */}
        <button
          onClick={signInWithGoogle}
          disabled={clickedDisabled}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#CC6B36] hover:bg-[#BA5F2D] transition-colors rounded-[2rem] shadow-sm mb-6"
        >
          {/* Custom White Google G Vector */}
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-1">
              <svg className="w-full h-full text-[#CC6B36]" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-wide">
            Continue with Google
          </span>
        </button>

        {/* Footer Text */}
        <p className="w-full text-center text-sm text-[#8C877D] font-medium">
          Your notes stay yours — private by default.
        </p>
      </div>
    </main>
  );
}
