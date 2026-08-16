'use client';

import { useState, useEffect } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { usePalette } from '@/hooks/usePalette';

interface TutorProfile {
  name: string;
  email: string;
  phone: string;
  subject: string;
  location: string;
  experience: string;
  education: string;
  bio: string;
  fee: string;
}

interface TeachingStats {
  classesCount: number;
  activeClassesCount: number;
  totalStudents: number;
  pendingRequests: number;
}

const EMPTY_STATS: TeachingStats = { classesCount: 0, activeClassesCount: 0, totalStudents: 0, pendingRequests: 0 };

export default function TutorProfilePage() {
  const palette = usePalette();
  const [form, setForm] = useState<TutorProfile>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    location: '',
    experience: '',
    education: '',
    bio: '',
    fee: ''
  });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [stats, setStats] = useState<TeachingStats>(EMPTY_STATS);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/tutors/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        // Only merge the editable fields into the form — `verified`/`stats` are
        // derived, read-only data and don't belong in the PUT payload on save.
        setForm(prev => ({
          ...prev,
          name: data.name ?? prev.name,
          email: data.email ?? prev.email,
          phone: data.phone ?? prev.phone,
          subject: data.subject ?? prev.subject,
          location: data.location ?? prev.location,
          experience: data.experience ?? prev.experience,
          education: data.education ?? prev.education,
          bio: data.bio ?? prev.bio,
          fee: data.fee ?? prev.fee,
        }));
        setVerified(!!data.verified);
        setStats(data.stats || EMPTY_STATS);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const update = (key: keyof TutorProfile, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const save = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tutors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  if (loading) {
    return (
      <TutorDashboardLayout title="My Profile" subtitle="Manage your tutor profile and public listing.">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div style={{ color: '#10B981', fontWeight: 600 }}>Loading profile data...</div>
        </div>
      </TutorDashboardLayout>
    );
  }

  const inp = (key: keyof TutorProfile, placeholder: string) => (
    <input
      value={form[key] || ''}
      onChange={e => update(key, e.target.value)}
      placeholder={placeholder}
      disabled={!editing}
      style={{ 
        width: '100%', 
        padding: '11px 14px', 
        borderRadius: 11, 
        fontSize: 14, 
        fontFamily: "'DM Sans',sans-serif", 
        color: palette.textPrimary, 
        border: `1.5px solid ${editing ? palette.border : 'transparent'}`,
        background: editing ? palette.surface : palette.surfaceAlt,
        outline: 'none',
        transition: 'all 0.2s',
        cursor: editing ? 'text' : 'default'
      }}
      onFocus={e => {
        if (editing) {
          e.target.style.borderColor = '#10B981';
          e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)';
        }
      }}
      onBlur={e => {
        e.target.style.borderColor = editing ? palette.border : 'transparent';
        e.target.style.boxShadow = 'none';
      }}
    />
  );

  return (
    <TutorDashboardLayout title="My Profile" subtitle="Manage your tutor profile and public listing.">
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {saved && (
        <div style={{ 
          position: 'fixed', 
          top: 84, 
          right: 24, 
          zIndex: 999, 
          background: '#10B981', 
          color: 'white', 
          borderRadius: 12, 
          padding: '12px 20px', 
          fontSize: 14, 
          fontWeight: 600, 
          boxShadow: '0 8px 24px rgba(16,185,129,0.4)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          animation: 'slideDown 0.3s ease' 
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Profile saved successfully!
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left — Avatar card */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: palette.surface, borderRadius: 20, padding: '28px 20px', boxShadow: palette.shadow, border: `1px solid ${palette.border}`, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 34, fontFamily: "'Playfair Display',serif", margin: '0 auto', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
                {form.name ? form.name.charAt(0).toUpperCase() : 'K'}
              </div>
              {editing && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#111827', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              )}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: palette.textPrimary, marginBottom: 4 }}>{form.name}</h3>
            {verified && <p style={{ fontSize: 12, color: '#10B981', fontWeight: 600, marginBottom: 4 }}>Verified Tutor ✓</p>}
            <p style={{ fontSize: 11, color: palette.textMuted, marginBottom: 20 }}>{form.subject}</p>

            {[
              { l: 'Classes Posted', v: String(stats.classesCount) },
              { l: 'Total Students', v: String(stats.totalStudents) },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 0', borderTop: `1px solid ${palette.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: '#10B981' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}

            {/* Badges only appear when backed by real data — no more unconditional
                "5+ Years"/"Expert" claims shown for every tutor regardless of history. */}
            {(() => {
              const experienceYears = parseInt(form.experience || '', 10) || 0;
              const badges: string[] = [];
              if (verified) badges.push('✅ Verified');
              if (experienceYears >= 5) badges.push(`🏆 ${experienceYears}+ Years`);
              return badges.length > 0 ? (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${palette.border}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: palette.textMuted, marginBottom: 10 }}>Badges</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {badges.map(b => (
                      <span key={b} style={{ fontSize: 11, fontWeight: 600, background: '#ECFDF5', color: '#059669', borderRadius: 99, padding: '3px 10px', border: '1px solid #A7F3D0' }}>{b}</span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ flex: 1 }}>
          <div style={{ background: palette.surface, borderRadius: 20, padding: '28px 32px', boxShadow: palette.shadow, border: `1px solid ${palette.border}`, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: palette.textPrimary }}>Personal Information</h3>
              {!editing ? (
                <button 
                  onClick={() => setEditing(true)} 
                  style={{ background: 'none', border: `1.5px solid ${palette.border}`, borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: palette.textSecondary, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 7 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = palette.border; e.currentTarget.style.color = palette.textSecondary; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => setEditing(false)} 
                    style={{ background: 'none', border: `1.5px solid ${palette.border}`, borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: palette.textSecondary, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={save} 
                    style={{ background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 12px rgba(16,185,129,0.38)' }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { key: 'name', label: 'Full Name', ph: 'Your full name' },
                { key: 'email', label: 'Email Address', ph: 'your@email.com' },
                { key: 'phone', label: 'Phone Number', ph: '077 000 0000' },
                { key: 'subject', label: 'Main Subject', ph: 'e.g. Mathematics' },
                { key: 'location', label: 'Location', ph: 'City, Province' },
                { key: 'fee', label: 'Session Fee', ph: 'Rs. 0000 per session' },
                { key: 'education', label: 'Education', ph: 'Degree, University' },
                { key: 'experience', label: 'Experience', ph: 'X years of teaching' },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.textMuted }}>{f.label}</label>
                  {inp(f.key as keyof TutorProfile, f.ph)}
                </div>
              ))}
              <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.textMuted }}>Bio</label>
                <textarea 
                  value={form.bio || ''} 
                  onChange={e => update('bio', e.target.value)} 
                  disabled={!editing}
                  placeholder="Tell students about yourself..."
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 11, fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: palette.textPrimary, border: `1.5px solid ${editing ? palette.border : 'transparent'}`, background: editing ? palette.surface : palette.surfaceAlt, outline: 'none', resize: 'vertical', minHeight: 90, lineHeight: 1.6, transition: 'all 0.2s' }}
                  onFocus={e => { if (editing) { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)'; } }}
                  onBlur={e => { e.target.style.borderColor = editing ? palette.border : 'transparent'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div style={{ background: palette.surface, borderRadius: 20, padding: '24px 32px', boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: palette.textPrimary, marginBottom: 18 }}>Teaching Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { l: 'Active Classes', v: String(stats.activeClassesCount), icon: '🟢', color: '#10B981', bg: '#ECFDF5' },
                { l: 'Total Students', v: String(stats.totalStudents), icon: '🎓', color: '#8B5CF6', bg: '#F5F3FF' },
                { l: 'Pending Requests', v: String(stats.pendingRequests), icon: '⏳', color: '#F59E0B', bg: '#FFFBEB' },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 14, padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: s.color }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: palette.textSecondary, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TutorDashboardLayout>
  );
}