'use client';

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-page text-body transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
