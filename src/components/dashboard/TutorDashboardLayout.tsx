'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TutorSidebar from './TutorSidebar';
import ClientOnly from '@/components/ClientOnly';
import { tutorService } from '@/services/tutorService';
import { useTheme } from '@/hooks/useTheme';

export default function TutorDashboardLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Clicking the dropdown arrow next to the avatar reveals a "Log Out"
  // option; clicking it clears the session (same pattern as the student
  // settings page) and sends the tutor to the landing page.
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'user_role=; path=/; max-age=0';
    router.push('/landing');
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
            {/* Notification bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: isDark ? '#1F2A25' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#9CA9A2' : '#6B7280'} strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              {pendingCount > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#EF4444', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>
              )}
            </div>
            {/* Avatar + dropdown arrow — click to reveal Log Out */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setMenuOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{displayInitial}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#F3F4F6' : '#111827', lineHeight: 1.2 }}>{displayName}</p>
                  <p style={{ fontSize: 11, color: isDark ? '#8B968F' : '#9CA3AF' }}>Tutor</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#9CA9A2' : '#6B7280'} strokeWidth="2.5"
                  style={{ transition: 'transform 0.2s ease', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 160,
                  background: isDark ? '#161D1A' : 'white', borderRadius: 14, padding: 8,
                  boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.45)' : '0 8px 28px rgba(0,0,0,0.12)',
                  border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.12)', zIndex: 200,
                }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', borderRadius: 9,
                      background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      color: '#EF4444', fontFamily: "'DM Sans',sans-serif", transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? '#241616' : '#FEF2F2'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
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
