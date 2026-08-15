'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/services/adminApi';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword.length < 8) {
  setError('Password must be at least 8 characters.');
  return;
}
if (newPassword !== confirmPassword) {
  setError('Passwords do not match.');
  return;
}
    setLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      setMessage(result.message + ' Redirecting to login...');
      setTimeout(() => router.push('/dashboard/admin/auth'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Reset Password</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
          Enter your new password below.
        </p>

        {message && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
