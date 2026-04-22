'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, GraduationCap, CreditCard,
  Megaphone, Settings, Briefcase, LogOut, X
} from 'lucide-react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    label: 'Management',
    items: [
      { icon: GraduationCap, label: 'Tutors',    href: '/tutors' },
      { icon: Users,         label: 'Students',  href: '/students' },
      { icon: Briefcase,     label: 'Sessions',  href: '/sessions' },
    ],
  },
  {
    label: 'Business',
    items: [
      { icon: CreditCard, label: 'Payments',       href: '/payments' },
      { icon: Megaphone,  label: 'Advertisements', href: '/advertisements' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings' },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-cyan-500/20">
              <GraduationCap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Mentora</h1>
              <span className="text-xs text-slate-400 font-medium">Admin Portal</span>
            </div>
            <button onClick={onClose} className="ml-auto lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {group.label}
                </p>
                {group.items.map(({ icon: Icon, label, href }) => {
                  const active = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        active
                          ? 'bg-cyan-900/20 text-cyan-400 border-r-2 border-cyan-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={20} className={active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'} />
                      <span className="font-medium text-sm">{label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User footer */}
          <div className="p-4 border-t border-slate-800/50">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                KP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">Kasun Perera</p>
                <p className="text-xs text-slate-500 truncate">Ops Manager</p>
              </div>
              <LogOut size={18} className="text-slate-500 hover:text-slate-300" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
