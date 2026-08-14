'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminSignup } from '@/services/adminApi';

export default function AdminSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    adminCode: '',
    password: '',
    confirmPassword: '',
  });

  function setAdminRoleCookie() {
    document.cookie = 'user_role=admin; path=/; max-age=604800; samesite=lax';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.adminCode || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.adminCode !== 'MENTORA-ADMIN') {
      setError('Invalid admin access code.');
      return;
    }

    setLoading(true);
    adminSignup(form.fullName, form.email, form.password, form.adminCode)
      .then(() => {
        setAdminRoleCookie();
        router.push('/dashboard/admin');
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,900&family=Outfit:wght@300;400;500;600;700&display=swap');
        .signup-shell {
          min-height: 100vh;
          background: #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Outfit', sans-serif;
        }
        .signup-wrap { width: 100%; max-width: 620px; }
        .signup-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.04);
          padding: 32px;
        }
        .auth-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          background: #fff;
          color: #111827;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .auth-input:focus {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.12);
        }
        .auth-input::placeholder { color: #9CA3AF; }
        .primary-btn {
          margin-top: 8px;
          padding: 14px 20px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .primary-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }
      `}</style>

      <div className="signup-shell">
        <div className="signup-wrap">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 800, color: '#111827' }}>
            Admin Signup
          </h1>
          <p style={{ color: '#6B7280', marginTop: 8 }}>Create an authorized admin account</p>
        </div>

        <div className="signup-card">
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 20, color: '#EF4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="auth-input" placeholder="Kasun Perera" />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Email Address</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="auth-input" type="email" placeholder="admin@mentora.lk" />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Admin Access Code</label>
            <input value={form.adminCode} onChange={(e) => setForm({ ...form, adminCode: e.target.value })} className="auth-input" placeholder="MENTORA-ADMIN" />

            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="auth-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#7b93a1' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="auth-input" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#7b93a1' }}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>

            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? 'Creating account...' : 'Create Admin Account'}
            </button>

            <button type="button" onClick={() => router.push('/dashboard/admin/auth')} style={{ background: 'none', border: 'none', color: '#0f766e', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
              Back to admin login
            </button>
          </form>
        </div>
        </div>
      </div>
    </>
  );
}