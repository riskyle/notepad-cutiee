import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notepad", // The text in the browser tab
  description: "A shelf of notebooks in your pocket.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        {children}
        {/* Tactile Mobile-Friendly Toaster */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#FDFBF7',
              color: '#1A1A1A',
              border: '1px solid #E4DFD2',
              borderRadius: '1.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              fontFamily: 'sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
          }}
        />
      </body>
    </html>
  );
}
