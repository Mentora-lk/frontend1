'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import ClientOnly from '@/components/ClientOnly';
import { useCurrentUser, getInitial, getDisplayName } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';

export default function DashboardLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const user = useCurrentUser();
  const displayName = getDisplayName(user);
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    // See src/components/ClientOnly.tsx — same browser-extension hydration
    // issue as TutorDashboardLayout, same fix.
    <ClientOnly>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: ${isDark ? '#0F1512' : '#F8FAF9'}; transition: background 0.25s ease; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #10B981; border-radius: 99px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
        @media(max-width:900px) { .dash-layout { flex-direction:column !important; } }
      `}</style>

      {/* Top nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: isDark ? 'rgba(15,21,18,0.96)' : 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
        boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.35)' : '0 2px 20px rgba(0,0,0,0.07)', padding: '0 5%',
        transition: 'background 0.25s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/">
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: isDark ? '#F3F4F6' : '#111' }}>
              Mentora<span style={{ color: '#10B981' }}>.lk</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification bell — no unread badge: no real notification
                backend exists yet (src/services/notification.ts is a stub),
                so this used to show a fake "3" regardless of reality. */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: isDark ? '#1F2A25' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} color={isDark ? '#9CA9A2' : '#6B7280'}/>
              </div>
            </div>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}/>
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{getInitial(user)}</div>
              )}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#F3F4F6' : '#111827', lineHeight: 1.2 }}>{displayName}</p>
                <p style={{ fontSize: 11, color: isDark ? '#8B968F' : '#9CA3AF' }}>{roleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 5% 48px' }}>
        <div className="dash-layout" style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <Sidebar />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Page header */}
            <div className="fade-up" style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: '#10B981', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Student Portal</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: isDark ? '#F3F4F6' : '#111827', lineHeight: 1.15 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: 14, color: isDark ? '#9CA9A2' : '#6B7280', marginTop: 6 }}>{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}