'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header  from '@/components/Header';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-200 font-sans">
        <div className="flex h-screen overflow-hidden selection:bg-cyan-500/30">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
