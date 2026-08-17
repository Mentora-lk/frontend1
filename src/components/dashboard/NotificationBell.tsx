'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { usePalette } from '@/hooks/usePalette';
import { formatRelativeTime } from '@/utils/date';

const TYPE_ICON: Record<string, string> = {
  enrollment_request: '📩',
  enrollment_status: '✅',
  community_join_request: '👥',
};

export default function NotificationBell({ role }: { role: 'student' | 'tutor' }) {
  const { notifications, unreadNotifCount, unreadMessageCount, unreadMessagesBySender, markAsRead, markAllAsRead } =
    useNotifications();
  const palette = usePalette();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const totalBadge = unreadNotifCount + (unreadMessageCount > 0 ? 1 : 0);
  const messagesHref = `/dashboard/${role}/messages`;

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <div onClick={() => setOpen((v) => !v)} style={{ position: 'relative', cursor: 'pointer' }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: palette.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={palette.textSecondary} strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        {totalBadge > 0 && (
          <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, padding: '0 3px', borderRadius: 8, background: '#EF4444', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {totalBadge > 9 ? '9+' : totalBadge}
          </span>
        )}
      </div>

      {open && (
        <div style={{ position: 'absolute', top: 48, right: 0, width: 340, maxHeight: 420, background: palette.surface, borderRadius: 16, boxShadow: '0 12px 36px rgba(0,0,0,0.22)', border: `1px solid ${palette.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 300 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: palette.textPrimary }}>Notifications</h4>
            {unreadNotifCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#10B981', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {unreadMessagesBySender.map((s) => (
              <Link key={s.senderId} href={messagesHref} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, background: palette.activeBg, borderBottom: `1px solid ${palette.border}` }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>
                    {s.count} new message{s.count === 1 ? '' : 's'} from {s.senderName}
                  </p>
                </div>
              </Link>
            ))}

            {notifications.length === 0 && unreadMessagesBySender.length === 0 && (
              <p style={{ padding: 24, textAlign: 'center', fontSize: 13, color: palette.textMuted }}>No notifications yet.</p>
            )}

            {notifications.map((n) => (
              <div key={n.id} onClick={() => markAsRead(n.id)}
                style={{ padding: '12px 16px', display: 'flex', gap: 10, cursor: 'pointer', background: n.is_read ? palette.surface : palette.surfaceAlt, borderBottom: `1px solid ${palette.border}`, transition: 'background 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = palette.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.is_read ? palette.surface : palette.surfaceAlt; }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{TYPE_ICON[n.type] || '🔔'}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary }}>{n.title}</p>
                  <p style={{ fontSize: 12, color: palette.textSecondary, marginTop: 2, lineHeight: 1.4 }}>{n.body}</p>
                  <p style={{ fontSize: 10, color: palette.textMuted, marginTop: 4 }}>{formatRelativeTime(n.created_at)}</p>
                </div>
                {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0, marginTop: 5 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
