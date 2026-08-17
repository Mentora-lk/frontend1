'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { notificationService, AppNotification } from '@/services/notification';
import { messageService, UnreadBySender } from '@/services/messageService';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface NotificationsState {
  notifications: AppNotification[];
  unreadNotifCount: number;
  unreadMessageCount: number;
  unreadMessagesBySender: UnreadBySender[];
  loading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  /** Optimistically clears a sender's unread messages the instant the reader opens that thread — see useMessaging's selectContact(). */
  clearUnreadFromSender: (senderId: number) => void;
}

const NotificationsContext = createContext<NotificationsState | null>(null);

/**
 * Mounted once per dashboard route layout (alongside SocketProvider — see
 * src/app/dashboard/{student,tutor}/layout.tsx), so the bell, the Messages
 * sidebar badge, etc. all read the same fetched-once state instead of each
 * independently hitting the API and registering duplicate socket listeners.
 *
 * Chat messages are deliberately NOT persisted as notification rows (would
 * flood the notifications table with one row per message) — instead
 * unreadMessagesBySender is a live per-sender breakdown derived from the
 * messages table's existing is_read state (GET /api/messages/unread-count)
 * and kept fresh via the same 'new_message'/'messages_read' socket events
 * useMessaging listens for on the Messages page.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const socket = useSocket();
  const user = useCurrentUser();
  const myId = user ? Number(user.id) : null;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMessagesBySender, setUnreadMessagesBySender] = useState<UnreadBySender[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived, not separate state — keeping a second counter in sync by hand
  // (increment here, decrement there) is exactly how it drifts out of sync;
  // the per-sender list is the only unread-messages source of truth.
  const unreadMessageCount = useMemo(
    () => unreadMessagesBySender.reduce((sum, s) => sum + s.count, 0),
    [unreadMessagesBySender]
  );

  const load = useCallback(() => {
    Promise.all([
      notificationService.getNotifications(),
      notificationService.getUnreadCount(),
      messageService.getUnreadCount(),
    ])
      .then(([list, notifCount, msgSummary]) => {
        setNotifications(list);
        setUnreadNotifCount(notifCount);
        setUnreadMessagesBySender(msgSummary.bySender);
      })
      .catch((err) => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refetches the per-sender unread-messages breakdown. Used for a new
  // incoming message rather than tracking deltas locally, since the sender's
  // name/count can't be derived from the bare { sender_id } on the socket
  // payload alone.
  const refreshUnreadMessages = useCallback(() => {
    messageService
      .getUnreadCount()
      .then((summary) => setUnreadMessagesBySender(summary.bySender))
      .catch(() => {});
  }, []);

  // Instantly drops a sender from the unread breakdown — called by
  // useMessaging's selectContact() the moment the reader opens that thread,
  // so the bell/sidebar badge clears immediately instead of waiting on a
  // socket round-trip.
  const clearUnreadFromSender = useCallback((senderId: number) => {
    setUnreadMessagesBySender((prev) => prev.filter((s) => s.senderId !== senderId));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (n: AppNotification) => {
      setNotifications((prev) => [n, ...prev].slice(0, 20));
      setUnreadNotifCount((c) => c + 1);
    };

    const handleNewMessage = (msg: { sender_id: number }) => {
      if (msg.sender_id !== myId) refreshUnreadMessages();
    };

    // Echoed back to the reader's own other tabs/devices after they read a
    // thread elsewhere (see messageController.getMessages) — a coarse resync
    // rather than trying to track exactly which ids got marked read here too,
    // since useMessaging already does the precise per-message bookkeeping for
    // the page itself.
    const handleMessagesRead = () => refreshUnreadMessages();

    socket.on('new_notification', handleNewNotification);
    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, myId, refreshUnreadMessages]);

  const markAsRead = useCallback(
    (id: number) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadNotifCount((c) => Math.max(0, c - 1));
      notificationService.markAsRead(id).catch(() => load());
    },
    [load]
  );

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadNotifCount(0);
    notificationService.markAllAsRead().catch(() => load());
  }, [load]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadNotifCount,
        unreadMessageCount,
        unreadMessagesBySender,
        loading,
        markAsRead,
        markAllAsRead,
        clearUnreadFromSender,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsState {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}
