'use client';

import { useMemo, useState } from 'react';
import { appendAudit } from '../utils/operations';

type ProfileForm = {
  fullName: string;
  email: string;
  contactNumber: string;
  photoUrl: string;
};

const STORAGE_KEY = 'admin_profile_v1';

const defaultProfile: ProfileForm = {
  fullName: 'Nuwan Perera',
  email: 'admin@mentora.lk',
  contactNumber: '+94771234567',
  photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
};

function loadProfile(): ProfileForm {
  if (typeof window === 'undefined') return defaultProfile;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...(JSON.parse(raw) as Partial<ProfileForm>) };
  } catch {
    return defaultProfile;
  }
}

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AdminProfilePage() {
  const [form, setForm] = useState<ProfileForm>(() => loadProfile());
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [statusText, setStatusText] = useState('');

  const initials = useMemo(() => {
    const parts = form.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'A';
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
  }, [form.fullName]);

  const validate = (values: ProfileForm) => {
    const nextErrors: Partial<Record<keyof ProfileForm, string>> = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = 'Name is required.';
    } else if (!/^[a-zA-Z ]{3,60}$/.test(values.fullName.trim())) {
      nextErrors.fullName = 'Use 3-60 letters and spaces only.';
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!values.contactNumber.trim()) {
      nextErrors.contactNumber = 'Contact number is required.';
    } else if (!/^\+?[0-9]{9,15}$/.test(values.contactNumber.trim())) {
      nextErrors.contactNumber = 'Use 9-15 digits, optional + at start.';
    }

    if (values.photoUrl.trim() && !isValidImageUrl(values.photoUrl.trim())) {
      nextErrors.photoUrl = 'Enter a valid image URL (http/https).';
    }

    return nextErrors;
  };

  const onSave = () => {
    const validation = validate(form);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setStatusText('Please fix the highlighted fields.');
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    appendAudit('PROFILE_UPDATE', `Updated profile details for ${form.fullName}`);
    setStatusText('Profile updated successfully.');
  };

  const onReset = () => {
    setForm(defaultProfile);
    setErrors({});
    setStatusText('Profile values restored to default.');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Profile</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>View and update admin account details.</p>
      </div>

      {statusText && (
        <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>
          {statusText}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
            {form.photoUrl ? (
              <img
                src={form.photoUrl}
                alt="Admin profile"
                style={{ width: 110, height: 110, borderRadius: 999, objectFit: 'cover', border: '3px solid #d1fae5' }}
              />
            ) : (
              <div style={{ width: 110, height: 110, borderRadius: 999, background: '#ecfdf5', border: '3px solid #d1fae5', color: '#047857', fontWeight: 800, fontSize: 30, display: 'grid', placeItems: 'center' }}>
                {initials}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', color: '#111827', fontWeight: 800 }}>{form.fullName || 'Admin User'}</div>
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 4 }}>{form.email || 'No email'}</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)', display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Name</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Full name"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.fullName ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.fullName && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.fullName}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.email ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.email && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.email}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Contact Number</label>
            <input
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              placeholder="+94770000000"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.contactNumber ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.contactNumber && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.contactNumber}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Photo URL</label>
            <input
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
              placeholder="https://example.com/photo.jpg"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.photoUrl ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.photoUrl && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.photoUrl}</div>}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={onReset} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>Reset</button>
            <button onClick={onSave} style={{ border: '1px solid #10B981', background: '#10B981', color: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
