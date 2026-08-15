'use client';

import { useEffect, useState } from 'react';

export interface CurrentUser {
  id: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  fullName?: string | null;
}

/**
 * Reads the logged-in user from localStorage("user") — the same object
 * every login/signup flow (email/password, Google) persists there. Must
 * read inside useEffect (not during render) since localStorage doesn't
 * exist during server-side rendering; this keeps the server-rendered and
 * first client render identical and avoids a hydration mismatch.
 */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}

/** First letter for an avatar badge, preferring the real name over email. */
export function getInitial(user: CurrentUser | null): string {
  const source = user?.fullName || user?.email;
  return source ? source.charAt(0).toUpperCase() : '?';
}

/** Human-readable display name, falling back to email, then a placeholder. */
export function getDisplayName(user: CurrentUser | null): string {
  return user?.fullName || user?.email || 'Loading…';
}
