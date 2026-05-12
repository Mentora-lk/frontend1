'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, adminSignup } from '@/services/adminApi';

export default function AdminAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab]       = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    fullName: '', email: '', adminCode: '', password: '', confirmPassword: '',
  });

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const result = await adminLogin(loginForm.email, loginForm.password);
      document.cookie = 'user_role=admin; path=/; max-age=604800; SameSite=Lax';
      localStorage.setItem('adminToken', result.token);
      window.location.href = '/dashboard/admin';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (!signupForm.fullName || !signupForm.email || !signupForm.adminCode || !signupForm.password || !signupForm.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // Uses adminApi.ts → POST /api/auth/register  ✅ (fixed from /auth/signup)
      await adminSignup(signupForm.fullName, signupForm.email, signupForm.password, signupForm.adminCode);
document.cookie = 'user_role=admin; path=/; max-age=604800';
router.push('/dashboard/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F8FAF9; }
        input:focus { outline: none; }
        .auth-input {
          width: 100%; border: 1.5px solid #E5E7EB; border-radius: 12px;
          padding: 12px 16px 12px 44px; font-size: 14px; color: #111827;
          font-family: 'DM Sans', sans-serif; background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus { border-color: #10B981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .auth-input::placeholder { color: #9CA3AF; }
        .btn-green {
          width: 100%; background: linear-gradient(135deg,#10B981,#059669);
          color: white; border: none; border-radius: 12px;
          padding: 13px; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          box-shadow: 0 4px 18px rgba(16,185,129,0.35);
          transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-green:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,185,129,0.45); }
        .btn-green:disabled { opacity: 0.65; cursor: not-allowed; }
        .tab-btn {
          flex: 1; padding: 14px; font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          border: none; background: transparent; border-bottom: 2px solid transparent;
          color: #9CA3AF; transition: all 0.22s;
        }
        .tab-btn.active { color: #10B981; border-bottom-color: #10B981; }
        .field-wrap { position: relative; }
        .field-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
        .eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 0; display: flex; align-items: center; }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F8FAF9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 14px', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: '#111827', marginBottom: 4 }}>
              Mentora<span style={{ color: '#10B981' }}>.lk</span>
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Admin Portal</p>
          </div>

          <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6' }}>
              <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setError(''); }}>Sign In</button>
              <button className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => { setActiveTab('signup'); setError(''); }}>Create Account</button>
            </div>

            <div style={{ padding: '32px 32px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 24 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Admin Access Only</span>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize: 13, color: '#EF4444' }}>{error}</span>
                </div>
              )}

              {activeTab === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Email Address</label>
                    <div className="field-wrap">
                      <span className="field-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                      <input type="email" placeholder="admin@mentora.lk" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Password</label>
                    <div className="field-wrap">
                      <span className="field-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                      <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="auth-input" style={{ paddingRight: 44 }} />
                      <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-green" disabled={loading}>
                    {loading ? <><span className="spinner" />Signing in...</> : 'Sign In'}
                  </button>
                </form>
              )}

              {activeTab === 'signup' && (
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Full Name</label>
                    <div className="field-wrap">
                      <span className="field-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                      <input type="text" placeholder="Kasun Perera" value={signupForm.fullName} onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })} className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Email Address</label>
                    <div className="field-wrap">
                      <span className="field-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                      <input type="email" placeholder="admin@mentora.lk" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                      Admin Access Code <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>(provided by system owner)</span>
                    </label>
                    <div className="field-wrap">
                      <span className="field-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                      <input type="text" placeholder="MENTORA-ADMIN" value={signupForm.adminCode} onChange={(e) => setSignupForm({ ...signupForm, adminCode: e.target.value })} className="auth-input" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Password</label>
                    <div className="field-wrap">
                      <span className="field-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                      <input type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="auth-input" style={{ paddingRight: 44 }} />
                      <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Confirm Password</label>
                    <div className="field-wrap">
                      <span className="field-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                      <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} className="auth-input" style={{ paddingRight: 44 }} />
                      <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-green" disabled={loading} style={{ marginTop: 4 }}>
                    {loading ? <><span className="spinner" />Creating account...</> : 'Create Admin Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 20 }}>
            © 2026 Mentora.lk · Restricted to authorized administrators only
          </p>
        </div>
      </div>
    </>
  );
}
