'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title, subtitle }: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('unread_notifications') || '0', 10);
    setNotifCount(count);
  }, []);

  const handleClearNotifications = () => {
    localStorage.setItem('unread_notifications', '0');
    setNotifCount(0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F8FAF9; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #10B981; border-radius: 99px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bellRing { 0%,100% { transform: rotate(0); } 20% { transform: rotate(-15deg); } 40% { transform: rotate(15deg); } 60% { transform: rotate(-10deg); } 80% { transform: rotate(10deg); } }
        .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
        .bell-ring { animation: bellRing 0.6s ease; }
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
            <div
              onClick={handleClearNotifications}
              style={{ position: 'relative', cursor: 'pointer' }}
              title={notifCount > 0 ? `${notifCount} new notification${notifCount > 1 ? 's' : ''}` : 'Notifications'}
            >
              <div
                className={notifCount > 0 ? 'bell-ring' : ''}
                style={{ width: 38, height: 38, borderRadius: 11, background: notifCount > 0 ? '#ECFDF5' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={notifCount > 0 ? '#10B981' : '#6B7280'} strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              {notifCount > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, padding: '0 4px', borderRadius: '99px', background: '#EF4444', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </div>
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>D</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>D.M.S.N. Dissanayake</p>
                <p style={{ fontSize: 11, color: '#9CA3AF' }}>Student</p>
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
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: '#111827', lineHeight: 1.15 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: 14, color: '#6B7280', marginTop: 6 }}>{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}