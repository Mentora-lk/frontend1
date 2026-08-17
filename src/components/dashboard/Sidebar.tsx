'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser, getInitial, getDisplayName } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/hooks/useNotifications';

const NAV_ITEMS = [
  {
    label: 'My Classes', href: '/dashboard/student',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  },
  {
    label: 'Schedule', href: '/dashboard/student/schedule',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: 'Recommendations',
    href:  '/dashboard/student/recommendations',
    badge: 'AI',
    icon:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
           </svg>,
  },
  { label: 'Community', href: '/dashboard/student/community',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: 'Messages', href: '/dashboard/student/messages',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    label: 'Profile', href: '/dashboard/student/profile',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    label: 'Settings', href: '/dashboard/student/settings',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const { unreadMessageCount } = useNotifications();
  const displayName = getDisplayName(user);
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{
      width: 240, flexShrink: 0, background: isDark ? '#161D1A' : 'white', borderRadius: 20,
      padding: '24px 0', boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 4px 24px rgba(0,0,0,0.08)',
      border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.12)', position: 'sticky',
      top: 84, height: 'fit-content', overflow: 'hidden', transition: 'background 0.25s ease',
    }}>
      {/* Student profile */}
      <div style={{ padding: '0 20px 20px', borderBottom: isDark ? '1px solid #232E28' : '1px solid #F3F4F6', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg,#10B981,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0,
          }}>{getInitial(user)}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#F3F4F6' : '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
            <p style={{ fontSize: 11, color: isDark ? '#8B968F' : '#9CA3AF' }}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ padding: '8px 12px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const activeBg = isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5';
          const hoverBg = isDark ? '#1B2420' : '#F9FAFB';
          const numericBadge = item.label === 'Messages' ? unreadMessageCount : 0;
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 12px', borderRadius: 12, marginBottom: 2,
                  cursor: 'pointer', position: 'relative',
                  background: isActive ? activeBg : 'transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = hoverBg; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <span style={{ color: isActive ? '#10B981' : (isDark ? '#8B968F' : '#9CA3AF'), display: 'flex' }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 400, color: isActive ? '#059669' : (isDark ? '#B7C0BA' : '#6B7280') }}>
                    {item.label}
                  </span>
                </div>
                {numericBadge > 0 && (
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#EF4444',
                    color: 'white', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{numericBadge}</span>
                )}
                {isActive && <div style={{ width: 3, height: 20, background: '#10B981', borderRadius: 99, position: 'absolute', right: 0 }} />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Browse CTA */}
      <div style={{ padding: '16px 20px', margin: '8px 12px 0', background: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5', borderRadius: 14, border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #A7F3D0' }}>
        <p style={{ fontSize: 12, color: isDark ? '#6EE7B7' : '#065F46', marginBottom: 10, lineHeight: 1.5 }}>Find more classes to expand your skills</p>
        <Link href="/classes/search">
          <button style={{ width: '100%', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            Browse Classes
          </button>
        </Link>
      </div>
    </div>
  );
}