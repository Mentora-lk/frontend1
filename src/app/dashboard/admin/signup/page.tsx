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
          align-items: stretch;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
        }
        .signup-grid {
          width: 100%;
          max-width: 1100px;
          margin: auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
          min-height: 640px;
        }
        @media (max-width: 900px) {
          .signup-grid { grid-template-columns: 1fr; }
          .hero-panel { display: none; }
        }
        .hero-panel {
          background: linear-gradient(160deg, #0f766e 0%, #115e59 55%, #0b3d3a 100%);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 40px;
          overflow: hidden;
        }
        .hero-panel::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .hero-panel::after {
          content: '';
          position: absolute;
          bottom: -100px; left: -60px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .form-panel {
          background: #fff;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
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
        <div className="signup-grid">

          {/* Hero / illustration panel */}
          <div className="hero-panel">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 800, fontSize: 20, fontFamily: "'Fraunces', serif" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center' }}>M</div>
                Mentora.lk
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <svg viewBox="0 0 320 240" width="100%" height="auto" style={{ maxWidth: 320 }}>
                <rect x="30" y="40" width="200" height="130" rx="14" fill="rgba(255,255,255,0.10)" />
                <rect x="46" y="58" width="168" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
                <rect x="46" y="78" width="120" height="8" rx="4" fill="rgba(255,255,255,0.22)" />
                <rect x="46" y="94" width="140" height="8" rx="4" fill="rgba(255,255,255,0.22)" />
                <circle cx="60" cy="130" r="16" fill="rgba(255,255,255,0.5)" />
                <rect x="86" y="122" width="90" height="7" rx="3.5" fill="rgba(255,255,255,0.3)" />
                <rect x="86" y="136" width="60" height="7" rx="3.5" fill="rgba(255,255,255,0.2)" />
                <circle cx="250" cy="60" r="26" fill="#14b8a6" opacity="0.9" />
                <path d="M240 60 l7 7 14-14" stroke="#0b3d3a" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="220" y="140" width="70" height="50" rx="10" fill="rgba(255,255,255,0.12)" />
                <circle cx="255" cy="158" r="9" fill="rgba(255,255,255,0.5)" />
                <rect x="235" y="172" width="40" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
              </svg>

              <h2 style={{ color: '#fff', fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 800, marginTop: 24, lineHeight: 1.3 }}>
                Manage your platform with confidence
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
                Oversee tutors, students, sessions, and platform activity from one secure admin workspace.
              </p>
            </div>

            <div style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              © {new Date().getFullYear()} Mentora.lk — Admin Portal
            </div>
          </div>

          {/* Form panel */}
          <div className="form-panel">
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 800, color: '#111827' }}>
                Admin Signup
              </h1>
              <p style={{ color: '#6B7280', marginTop: 8 }}>Create an authorized admin account</p>
            </div>

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
