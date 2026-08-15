'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/authService';

interface GoogleSignInButtonProps {
  onError: (message: string) => void;
}

// Must match the exact message thrown by GoogleAccountNotFoundError in
// backend/src/services/googleAuthService.js — used to detect "this is a
// brand-new Google account" vs. any other failure.
const NO_ACCOUNT_MESSAGE = 'No account found for this Google email. Please sign up first.';

/**
 * "Sign in with Google" button for the login page.
 *
 * Flow:
 *  1. User clicks the button and picks a Google account.
 *  2. We try to log in with that credential (no role).
 *  3. If the email already has a Mentora account, they're logged straight
 *     in — reproduces the exact localStorage/cookie persistence pattern
 *     used by the email/password login form so middleware.ts, lib/api.ts
 *     and every service reading localStorage("token")/("user") or the
 *     `user_role` cookie keep working unmodified.
 *  4. If the email has no account yet, we show an inline "Student / Tutor"
 *     choice and retry with that role, which creates the account.
 */
export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);

  const completeAuth = async (credential: string, role?: 'student' | 'tutor') => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithGoogle(credential, role);

      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from server. Please try again.');
      }

      const user = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));
      document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 30}`;

      if (user.role === 'tutor') router.push('/dashboard/tutor');
      else if (user.role === 'admin') router.push('/dashboard/admin');
      else router.push('/dashboard/student');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
      if (message === NO_ACCOUNT_MESSAGE) {
        setPendingCredential(credential);
      } else {
        onError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError('Google sign-in failed. Please try again.');
      return;
    }
    completeAuth(credentialResponse.credential);
  };

  // <GoogleLogin> requires a <GoogleOAuthProvider> ancestor, which
  // GoogleAuthProvider only renders when this env var is set. Without this
  // guard, rendering <GoogleLogin> here throws "Google OAuth components
  // must be used within GoogleOAuthProvider" — crashing prerender/build.
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  if (pendingCredential) {
    return (
      <div
        style={{
          padding: '16px 20px',
          border: '1px solid #d1fae5',
          background: '#f0fdf4',
          borderRadius: 10,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 14, color: '#374151', margin: '0 0 12px' }}>
          No Mentora account yet for that Google email. Create one as:
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => completeAuth(pendingCredential, 'student')}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              background: '#10b981',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Student
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => completeAuth(pendingCredential, 'tutor')}
            style={{
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid #10b981',
              borderRadius: 8,
              background: 'white',
              color: '#10b981',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Tutor
          </button>
        </div>
        <button
          type="button"
          onClick={() => setPendingCredential(null)}
          style={{
            marginTop: 10,
            fontSize: 12,
            color: '#9ca3af',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', opacity: isLoading ? 0.6 : 1 }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError('Google sign-in failed. Please try again.')}
        text="signin_with"
        width="320"
      />
    </div>
  );
}
