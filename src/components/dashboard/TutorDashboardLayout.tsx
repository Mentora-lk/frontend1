'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TutorSidebar from './TutorSidebar';
import NotificationBell from './NotificationBell';
import ClientOnly from '@/components/ClientOnly';
import { tutorService } from '@/services/tutorService';
import { useTheme } from '@/hooks/useTheme';
// SocketProvider/NotificationsProvider live at the route layout level
// (src/app/dashboard/tutor/layout.tsx) — a true ancestor of this
// component's own callers (page.tsx files), unlike this component itself,
// which pages render as a child.

export default function TutorDashboardLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [profile, setProfile] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await tutorService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile in layout", err);
      }
    };
    fetchProfile();

    // Real pending-request count, shared by the sidebar "Requests" badge and the
    // notification bell below — replaces the hardcoded fake counts that used to
    // be shown here regardless of actual data.
    const fetchPendingCount = async () => {
      try {
        const requests = await tutorService.getRequests();
        setPendingCount((requests || []).filter((r: any) => r.status === 'pending').length);
      } catch (err) {
        console.error("Failed to fetch pending request count", err);
      }
    };
    fetchPendingCount();
  }, []);

  const displayName = profile?.name || 'Tutor';
  const displayInitial = displayName.charAt(0).toUpperCase();
  return (
    // See src/components/ClientOnly.tsx — a browser extension mutates every
    // element in this layout before hydration, tripping a hydration-mismatch
    // warning that suppressHydrationWarning can't cover (it doesn't cascade
    // to descendants). Rendering nothing until mounted sidesteps hydration
    // comparison for this subtree entirely.
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
            <NotificationBell role="tutor" />
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{displayInitial}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#F3F4F6' : '#111827', lineHeight: 1.2 }}>{displayName}</p>
                <p style={{ fontSize: 11, color: isDark ? '#8B968F' : '#9CA3AF' }}>Tutor</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 5% 48px' }}>
        <div className="dash-layout" style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <TutorSidebar profile={profile} pendingCount={pendingCount} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Page header */}
            <div className="fade-up" style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: '#10B981', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Tutor Portal</p>
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
