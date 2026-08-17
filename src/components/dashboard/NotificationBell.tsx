'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { usePalette } from '@/hooks/usePalette';
import { formatRelativeTime } from '@/utils/date';
import type { AppNotification } from '@/services/notification';

const TYPE_ICON: Record<string, string> = {
  enrollment_request: '📩',
  enrollment_status: '✅',
  community_join_request: '👥',
  community_status: '✅',
};

/**
 * Where clicking a notification should land, based on who receives that
 * type and what it's about. Tutor-received "request" notifications go to
 * the matching tab on the Requests page; student-received "status"
 * notifications go straight to the thing that changed.
 */
function hrefForNotification(n: AppNotification): string | null {
  switch (n.type) {
    case 'enrollment_request':
      return '/dashboard/tutor/requests?tab=enrollment';
    case 'community_join_request':
      return '/dashboard/tutor/requests?tab=community';
    case 'enrollment_status':
      return '/dashboard/student/my-classes';
    case 'community_status':
      // A declined request never became a membership, so the per-community
      // detail page (which assumes the viewer is an approved member) 403s
      // when it fetches the feed — see tutorCommunityController.js's
      // 'Community request declined' title. Send declines to the community
      // list instead, where the declined community reappears in Discover.
      return n.related_community_id && !n.title.toLowerCase().includes('declined')
        ? `/dashboard/student/community/${n.related_community_id}`
        : '/dashboard/student/community';
    default:
      return null;
  }
}

export default function NotificationBell({ role }: { role: 'student' | 'tutor' }) {
  const { notifications, unreadNotifCount, unreadMessageCount, unreadMessagesBySender, markAsRead, markAllAsRead } =
    useNotifications();
  const palette = usePalette();
  const router = useRouter();
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

  const handleNotificationClick = (n: AppNotification) => {
    markAsRead(n.id);
    const href = hrefForNotification(n);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

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

            {/* Always the full recent list (read + unread mixed, oldest included), not
                just today's new ones — unread rows are visually highlighted (tinted
                background, left accent bar, bold title, dot); read ones sit at normal
                weight so the list stays a real history, not a disappearing inbox. */}
            {notifications.map((n) => (
              <div key={n.id} onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '12px 16px 12px 13px', display: 'flex', gap: 10, cursor: 'pointer',
                  background: n.is_read ? palette.surface : palette.activeBg,
                  borderLeft: n.is_read ? '3px solid transparent' : '3px solid #10B981',
                  borderBottom: `1px solid ${palette.border}`, transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = palette.hoverBg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.is_read ? palette.surface : palette.activeBg; }}>
                <span style={{ fontSize: 16, flexShrink: 0, opacity: n.is_read ? 0.6 : 1 }}>{TYPE_ICON[n.type] || '🔔'}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: n.is_read ? palette.textSecondary : palette.textPrimary }}>{n.title}</p>
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
