'use client';

import { SocketProvider } from '@/contexts/SocketContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

/**
 * A Next.js route layout is a true ancestor of every page.tsx under this
 * segment in the React tree (and persists across client-side navigation
 * between them), unlike TutorDashboardLayout — which is rendered BY its
 * page.tsx, making the page a parent of it, not a descendant. Any hook a
 * page calls at its own top level (e.g. useMessaging, which needs
 * useNotifications()) has no access to a provider that only exists further
 * down inside a component the page itself renders — it needs to come from
 * here instead. See TutorDashboardLayout.tsx for the corresponding per-page
 * nav/sidebar chrome (unaffected by this — it's already a genuine
 * descendant of whatever wraps it).
 */
export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <NotificationsProvider>{children}</NotificationsProvider>
    </SocketProvider>
  );
}
