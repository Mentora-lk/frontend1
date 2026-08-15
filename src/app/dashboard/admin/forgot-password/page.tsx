'use client';

import { useState } from 'react';
import { forgotPassword } from '@/services/adminApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError('');
  setMessage('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError('Please enter a valid email address.');
    return;
  }
  setLoading(true);
    try {
      const result = await forgotPassword(email);
      setMessage(result.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Forgot Password</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
          Enter your admin email and we&apos;ll send you a reset link.
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
            type="email"
            placeholder="admin@mentora.lk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 20 }}>
          <a href="/dashboard/admin/auth" style={{ color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>
            Back to Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
