'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/authService';
import { GraduationCapIcon, ChalkboardIcon } from './icons';

interface GoogleSignUpButtonProps {
  role: 'student' | 'tutor';
  onError: (message: string) => void;
}

/**
 * "Sign up with Google" button for the student/tutor signup pages.
 *
 * Unlike GoogleSignInButton (login page), the role is already known here
 * — it's implied by which signup page the user is on — so there's no
 * inline role picker. We always pass `role` straight through:
 *   - If no account exists yet for that Google email, the backend creates
 *     one with this role and a minimal profile (see googleAuthService.js).
 *   - If an account already exists, the backend just logs them in with
 *     their real stored role (role param is ignored), same as the plain
 *     login button — so clicking this on the wrong page for a returning
 *     user still works correctly rather than erroring.
 *
 * Reproduces the same localStorage/cookie persistence pattern used
 * everywhere else in the app (login page, email/password signup forms)
 * so middleware.ts and every service reading localStorage/cookies keep
 * working unmodified.
 */
export function GoogleSignUpButton({ role, onError }: GoogleSignUpButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError('Google sign-up failed. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.loginWithGoogle(credentialResponse.credential, role);

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
      onError(err instanceof Error ? err.message : 'Google sign-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = role === 'tutor' ? ChalkboardIcon : GraduationCapIcon;

  return (
    <div className="gsu-shell">
      <span className="gsu-role-badge">
        <RoleIcon size={13} />
        {role === 'tutor' ? 'As a tutor' : 'As a student'}
      </span>

      <div className="gsu-inner">
        {isLoading ? (
          <div className="gsu-loading">
            <span className="gsu-spinner" />
            <span>Creating your account…</span>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => onError('Google sign-up failed. Please try again.')}
            text="signup_with"
            shape="pill"
            size="large"
            width="300"
          />
        )}
      </div>

      <style jsx>{`
        .gsu-shell {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .gsu-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          color: #059669;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .gsu-inner {
          position: relative;
          display: inline-flex;
          padding: 2.5px;
          border-radius: 999px;
          background: linear-gradient(115deg, #10b981, #34d399, #059669, #10b981);
          background-size: 300% 300%;
          animation: gsu-gradient-shift 6s ease infinite;
          box-shadow: 0 6px 18px rgba(16, 185, 129, 0.22);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
          overflow: hidden;
        }
        .gsu-inner:hover {
          transform: translateY(-3px) scale(1.015);
          box-shadow: 0 14px 32px rgba(16, 185, 129, 0.32);
        }
        .gsu-inner::after {
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
        .gsu-inner:hover::after {
          left: 130%;
        }
        @keyframes gsu-gradient-shift {
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
        .gsu-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 26px;
          background: #ffffff;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          color: #059669;
          min-width: 220px;
          justify-content: center;
        }
        .gsu-spinner {
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(5, 150, 105, 0.25);
          border-top-color: #059669;
          border-radius: 50%;
          animation: gsu-spin 0.7s linear infinite;
        }
        @keyframes gsu-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
