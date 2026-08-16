'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useState } from 'react';
import { authService } from '@/services/authService';

interface GoogleSignupButtonProps {
  role: 'student' | 'tutor';
  onVerified: (result: { email: string; name: string | null; googleSignupToken: string }) => void;
  onAlreadyExists: () => void;
  onError: (message: string) => void;
}

// Must match the exact message thrown by GoogleAccountExistsError in
// backend/src/services/googleAuthService.js — apiCall only preserves the
// error message text (see src/lib/api.ts), not a status code, so matching
// on message is the same convention GoogleSignInButton.tsx already uses
// for its own "no account yet" case.
const ALREADY_EXISTS_MESSAGE = 'An account already exists for this email. Please log in instead.';

/**
 * "Sign up with Google" button for the student/tutor detail forms.
 *
 * Unlike GoogleSignInButton (login page), this does NOT create an account
 * or log anyone in — it only verifies the Google identity and hands the
 * parent form a short-lived googleSignupToken. The account is created when
 * the parent form is submitted (see registerStudent/registerTutor's
 * googleSignupToken handling on the backend), after the user has filled in
 * the rest of their details.
 */
export function GoogleSignupButton({ role, onVerified, onAlreadyExists, onError }: GoogleSignupButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError('Google sign-up failed. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyGoogleForSignup(credentialResponse.credential, role);
      onVerified({ email: result.email, name: result.name, googleSignupToken: result.googleSignupToken });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google verification failed. Please try again.';
      if (message === ALREADY_EXISTS_MESSAGE) {
        onAlreadyExists();
      } else {
        onError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // <GoogleLogin> requires a <GoogleOAuthProvider> ancestor, which
  // GoogleAuthProvider only renders when this env var is set. Without this
  // guard, rendering <GoogleLogin> here throws "Google OAuth components
  // must be used within GoogleOAuthProvider" — crashing prerender/build.
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', opacity: isLoading ? 0.6 : 1 }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError('Google sign-up failed. Please try again.')}
        text="signup_with"
        width="320"
      />
    </div>
  );
}
