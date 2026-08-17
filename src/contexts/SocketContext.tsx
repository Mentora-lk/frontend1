'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { messagingSocket } from '@/services/messagingService';

const SocketContext = createContext<Socket | null>(null);

/**
 * Owns the single shared Socket.io connection (src/services/messagingService.ts)
 * for the lifetime of whatever tree it wraps — mounted once per dashboard
 * route layout (src/app/dashboard/{student,tutor}/layout.tsx), so both the
 * Messages page (useMessaging) and the notification bell (useNotifications)
 * share one connection instead of each independently connecting/disconnecting
 * the same singleton and stepping on each other's lifecycle. This must live
 * at the route layout level, not inside a component a page renders (like
 * DashboardLayout) — a page calling useSocket()/useNotifications() at its own
 * top level (e.g. useMessaging) is an ANCESTOR of whatever that component
 * renders, not a descendant, so a provider declared inside it is invisible
 * to the page's own hooks. A Next.js route layout is a true ancestor of
 * every page.tsx under it and persists across client-side navigation
 * between them.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  // connect() is synchronous (returns the io() socket object immediately;
  // the underlying network handshake happens async) and SSR-safe (returns
  // null on the server) — establishing it via a lazy useState initializer
  // rather than inside an effect avoids an extra render-then-setState pass.
  const [socket] = useState<Socket | null>(() => messagingSocket.connect());

  useEffect(() => {
    return () => {
      messagingSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

/** The shared socket, or null until SocketProvider has connected (or if used outside one). */
export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
