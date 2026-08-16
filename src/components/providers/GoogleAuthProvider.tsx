'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

/**
 * Wraps the app with Google's OAuth context so any descendant can render
 * a <GoogleLogin> button. This must be a client component because the
 * root layout (src/app/layout.tsx) is a server component.
 */
export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // Fail loudly in dev if the env var is missing, but don't break the
    // rest of the app for users who aren't using Google Sign-In yet.
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — Google Sign-In will not work.');
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
