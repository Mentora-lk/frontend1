'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TutorSidebar from './TutorSidebar';
import ClientOnly from '@/components/ClientOnly';
import { tutorService } from '@/services/tutorService';

export default function TutorDashboardLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [profile, setProfile] = useState<any>(null);

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
        body { font-family: 'DM Sans', sans-serif; background: #F8FAF9; }
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
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.07)', padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/">
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: '#111' }}>
              Mentora<span style={{ color: '#10B981' }}>.lk</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <span style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: '50%', background: '#EF4444', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</span>
            </div>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{displayInitial}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{displayName}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>Tutor</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 5% 48px' }}>
        <div className="dash-layout" style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <TutorSidebar profile={profile} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Page header */}
            <div className="fade-up" style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: '#10B981', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Tutor Portal</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: '#111827', lineHeight: 1.15 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: 14, color: '#6B7280', marginTop: 6 }}>{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
