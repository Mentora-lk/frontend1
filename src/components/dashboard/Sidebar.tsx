'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Calendar, Star, Users, MessageSquare, User, Settings } from 'lucide-react';
import { useCurrentUser, getInitial, getDisplayName } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';

const NAV_ITEMS = [
  {
    label: 'My Classes', href: '/dashboard/student',
    icon: <BookOpen size={16}/>,
  },
  {
    label: 'Schedule', href: '/dashboard/student/schedule',
    icon: <Calendar size={16}/>,
  },
  {
    label: 'Recommendations',
    href:  '/dashboard/student/recommendations',
    badge: 'AI',
    icon:  <Star size={16}/>,
  },
  { label: 'Community', href: '/dashboard/student/community',
    icon: <Users size={16}/>,
  },
  {
    // No badge: no real unread-count source exists yet — messaging isn't wired
    // to a working backend on this branch (see CLAUDE.md), so this used to show
    // a fake "2" regardless of reality.
    label: 'Messages', href: '/dashboard/student/messages',
    icon: <MessageSquare size={16}/>,
  },
  {
    label: 'Profile', href: '/dashboard/student/profile',
    icon: <User size={16}/>,
  },
  {
    label: 'Settings', href: '/dashboard/student/settings',
    icon: <Settings size={16}/>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
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
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}/>
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg,#10B981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 18, flexShrink: 0,
            }}>{getInitial(user)}</div>
          )}
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