'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, Menu, Download, FileText } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const placeholders: Record<string, string> = {
  '/payments':       'Search transactions, student names, or tutor IDs...',
  '/advertisements': 'Search ads or tutors...',
  '/tutors':         'Search by tutor name, email or NIC...',
};

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const placeholder = placeholders[pathname] ?? 'Search tutors, students, or transactions...';

  return (
    <header className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <button className="lg:hidden mr-4 text-slate-400 hover:text-white" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-slate-800 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {pathname === '/payments' && (
          <>
            <button className="hidden sm:flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700">
              <span>Export CSV</span>
            </button>
            <button className="hidden sm:flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700">
              <FileText size={18} /><span>Export PDF</span>
            </button>
            <div className="w-px h-6 bg-slate-700 mx-2" />
          </>
        )}
        {pathname === '/tutors' && (
          <>
            <button className="hidden sm:flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Download size={18} /><span>Export Report</span>
            </button>
            <div className="w-px h-6 bg-slate-700 mx-2" />
          </>
        )}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          {pathname === '/dashboard' && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900" />
          )}
        </button>
      </div>
    </header>
  );
}
