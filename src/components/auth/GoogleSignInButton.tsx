'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/authService';
import { GraduationCapIcon, ChalkboardIcon, SparkleIcon } from './icons';

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
  const [loadingRole, setLoadingRole] = useState<'student' | 'tutor' | null>(null);
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);

  const completeAuth = async (credential: string, role?: 'student' | 'tutor') => {
    setIsLoading(true);
    if (role) setLoadingRole(role);
    try {
      const response = await authService.loginWithGoogle(credential, role);

      if (!response || !response.user || !response.token) {
        throw new Error('Invalid response from server. Please try again.');
      }

      const user = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        fullName: response.user.fullName,
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
      setLoadingRole(null);
    }
  };

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError('Google sign-in failed. Please try again.');
      return;
    }
    completeAuth(credentialResponse.credential);
  };

  if (pendingCredential) {
    return (
      <div className="role-picker">
        <div className="role-picker-badge">
          <SparkleIcon size={13} />
          <span>New here</span>
        </div>
        <p className="role-picker-title">Create your Mentora account as:</p>

        <div className="role-picker-grid">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => completeAuth(pendingCredential, 'student')}
            className="role-card role-card--student"
          >
            <span className="role-card-icon">
              {loadingRole === 'student' ? <span className="role-card-spinner" /> : <GraduationCapIcon />}
            </span>
            <span className="role-card-label">Student</span>
            <span className="role-card-sub">Learn from expert tutors</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => completeAuth(pendingCredential, 'tutor')}
            className="role-card role-card--tutor"
          >
            <span className="role-card-icon">
              {loadingRole === 'tutor' ? <span className="role-card-spinner" /> : <ChalkboardIcon />}
            </span>
            <span className="role-card-label">Tutor</span>
            <span className="role-card-sub">Teach &amp; grow your classes</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPendingCredential(null)}
          disabled={isLoading}
          className="role-picker-cancel"
        >
          Cancel
        </button>

        <style jsx>{`
          .role-picker {
            padding: 20px;
            border-radius: 18px;
            background: linear-gradient(180deg, #f0fdf9 0%, #ffffff 100%);
            border: 1px solid #d1fae5;
            text-align: center;
            animation: role-picker-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes role-picker-in {
            from {
              opacity: 0;
              transform: translateY(-6px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .role-picker-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 999px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            margin-bottom: 10px;
          }
          .role-picker-title {
            margin: 0 0 16px;
            font-size: 14px;
            color: #374151;
            font-weight: 500;
          }
          .role-picker-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .role-card {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 18px 12px;
            border-radius: 14px;
            border: 1.5px solid #e5e7eb;
            background: #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
            overflow: hidden;
          }
          .role-card::before {
            content: '';
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity 0.25s ease;
            z-index: 0;
          }
          .role-card--student::before {
            background: linear-gradient(160deg, rgba(16, 185, 129, 0.1), transparent 70%);
          }
          .role-card--tutor::before {
            background: linear-gradient(160deg, rgba(5, 150, 105, 0.12), transparent 70%);
          }
          .role-card:hover:not(:disabled) {
            transform: translateY(-4px);
            border-color: #10b981;
            box-shadow: 0 12px 24px rgba(16, 185, 129, 0.18);
          }
          .role-card:hover:not(:disabled)::before {
            opacity: 1;
          }
          .role-card:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }
          .role-card-icon {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #059669;
          }
          .role-card-spinner {
            width: 18px;
            height: 18px;
            border: 2.5px solid rgba(5, 150, 105, 0.25);
            border-top-color: #059669;
            border-radius: 50%;
            animation: role-card-spin 0.7s linear infinite;
          }
          @keyframes role-card-spin {
            to {
              transform: rotate(360deg);
            }
          }
          .role-card-label {
            position: relative;
            z-index: 1;
            font-size: 15px;
            font-weight: 700;
            color: #111827;
          }
          .role-card-sub {
            position: relative;
            z-index: 1;
            font-size: 11.5px;
            color: #6b7280;
            line-height: 1.3;
          }
          .role-picker-cancel {
            margin-top: 14px;
            font-size: 12.5px;
            color: #9ca3af;
            background: none;
            border: none;
            cursor: pointer;
            text-decoration: underline;
            padding: 4px;
          }
          .role-picker-cancel:hover:not(:disabled) {
            color: #6b7280;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="gsi-shell">
      <div className="gsi-inner">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError('Google sign-in failed. Please try again.')}
          text="signin_with"
          shape="pill"
          size="large"
          width="300"
        />
      </div>

      <style jsx>{`
        .gsi-shell {
          position: relative;
          display: inline-flex;
          padding: 2.5px;
          border-radius: 999px;
          background: linear-gradient(115deg, #10b981, #34d399, #059669, #10b981);
          background-size: 300% 300%;
          animation: gsi-gradient-shift 6s ease infinite;
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.22);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
          overflow: hidden;
          margin: 0 auto;
        }
        .gsi-shell:hover {
          transform: translateY(-3px) scale(1.015);
          box-shadow: 0 14px 32px rgba(16, 185, 129, 0.32);
        }
        .gsi-shell::after {
          content: '';
          position: absolute;
          top: 0;
          left: -60%;
          width: 35%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.65), transparent);
          transform: skewX(-20deg);
          transition: left 0.75s ease;
          pointer-events: none;
          z-index: 2;
        }
        .gsi-shell:hover::after {
          left: 130%;
        }
        .gsi-inner {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 999px;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @keyframes gsi-gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
