'use client';

import { useEffect, useMemo, useState } from 'react';
import { appendAudit } from '../utils/operations';

type ProfileForm = {
  fullName: string;
  email: string;
  contactNumber: string;
  photoUrl: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const STORAGE_KEY = 'admin_profile_v1';
const PROFILE_META_KEY = 'admin_profile_meta_v1';

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

function loadLastUpdated(): string {
  if (typeof window === 'undefined') return 'Not updated yet';

  const raw = localStorage.getItem(PROFILE_META_KEY);
  if (!raw) return 'Not updated yet';

  try {
    const parsed = JSON.parse(raw) as { updatedAt?: string };
    if (!parsed.updatedAt) return 'Not updated yet';
    return formatDateTimeUTC(new Date(parsed.updatedAt));
  } catch {
    return 'Not updated yet';
  }
}

function formatDateTimeUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss} UTC`;
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
  const [form, setForm] = useState<ProfileForm>(defaultProfile);
  const [savedForm, setSavedForm] = useState<ProfileForm>(defaultProfile);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [statusText, setStatusText] = useState('');
  const [statusTone, setStatusTone] = useState<'ok' | 'error'>('ok');
  const [imgError, setImgError] = useState(false);
  const [lastUpdatedText, setLastUpdatedText] = useState('Not updated yet');
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');

  const [sessionInfo, setSessionInfo] = useState({
    sessionStart: '--',
    lastLogin: '--',
    device: 'Chrome on macOS',
    ipMask: '192.168.1.xxx',
  });

  useEffect(() => {
    const stored = loadProfile();
    setForm(stored);
    setSavedForm(stored);
    setLastUpdatedText(loadLastUpdated());

    const now = new Date();
    const sessionStart = new Date(now.getTime() - 35 * 60 * 1000);
    const lastLogin = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    setSessionInfo({
      sessionStart: formatDateTimeUTC(sessionStart),
      lastLogin: formatDateTimeUTC(lastLogin),
      device: 'Chrome on macOS',
      ipMask: '192.168.1.xxx',
    });
  }, []);

  const initials = useMemo(() => {
    const parts = form.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'A';
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
  }, [form.fullName]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm]);

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
      setStatusTone('error');
      setStatusText('Please fix the highlighted fields.');
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    localStorage.setItem(PROFILE_META_KEY, JSON.stringify({ updatedAt: new Date().toISOString() }));
    appendAudit('PROFILE_UPDATE', `Updated profile details for ${form.fullName}`);

    setSavedForm(form);
    setLastUpdatedText(formatDateTimeUTC(new Date()));
    setStatusTone('ok');
    setStatusText('Profile updated successfully.');
  };

  const onDiscard = () => {
    setForm(savedForm);
    setErrors({});
    setStatusTone('ok');
    setImgError(false);
    setStatusText('Unsaved changes were discarded.');
  };

  const onResetToDefault = () => {
    setForm(defaultProfile);
    setSavedForm(defaultProfile);
    setErrors({});
    setStatusTone('ok');
    setImgError(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfile));
    localStorage.setItem(PROFILE_META_KEY, JSON.stringify({ updatedAt: new Date().toISOString() }));
    setLastUpdatedText(formatDateTimeUTC(new Date()));
    appendAudit('PROFILE_RESET', 'Profile reset to default values');
    setStatusText('Profile restored to default values.');
  };

  const onChangePassword = () => {
    setPasswordError('');
    setPasswordStatus('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (!/[A-Z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('Include at least 1 uppercase letter and 1 number.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordStatus('Password updated successfully.');
    appendAudit('PASSWORD_UPDATE', 'Admin password changed');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Profile</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>View and update admin account details.</p>
      </div>

      {statusText && (
        <div style={{ background: statusTone === 'ok' ? '#ecfeff' : '#fef2f2', border: `1px solid ${statusTone === 'ok' ? '#99f6e4' : '#fecaca'}`, color: statusTone === 'ok' ? '#0f766e' : '#991b1b', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>
          {statusText}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
            {form.photoUrl && !imgError ? (
                <img
                src={form.photoUrl}
                alt="Admin profile"
                onError={() => setImgError(true)}
                  style={{ width: 110, height: 110, borderRadius: 999, objectFit: 'cover', border: '3px solid #99f6e4' }}
              />
            ) : (
              <div style={{ width: 110, height: 110, borderRadius: 999, background: '#ecfeff', border: '3px solid #99f6e4', color: '#0f766e', fontWeight: 800, fontSize: 30, display: 'grid', placeItems: 'center' }}>
                {initials}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', color: '#111827', fontWeight: 800 }}>{form.fullName || 'Admin User'}</div>
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, marginTop: 4 }}>{form.email || 'No email'}</div>
          <div style={{ marginTop: 16, borderTop: '1px solid #ecf4ef', paddingTop: 14, color: '#6b7280', fontSize: 12, lineHeight: 1.6 }}>
            <div><strong style={{ color: '#374151' }}>Role:</strong> Admin</div>
            <div><strong style={{ color: '#374151' }}>Contact:</strong> {form.contactNumber || '-'}</div>
            <div><strong style={{ color: '#374151' }}>Last Updated:</strong> {lastUpdatedText}</div>
          </div>

          <div style={{ marginTop: 14, borderTop: '1px solid #ecf4ef', paddingTop: 14 }}>
            <h4 style={{ margin: '0 0 8px', color: '#111827', fontSize: 13, fontWeight: 800 }}>Session Info</h4>
            <div style={{ display: 'grid', gap: 6, color: '#6b7280', fontSize: 12 }}>
              <div><strong style={{ color: '#374151' }}>Last Login:</strong> {sessionInfo.lastLogin}</div>
              <div><strong style={{ color: '#374151' }}>Session Started:</strong> {sessionInfo.sessionStart}</div>
              <div><strong style={{ color: '#374151' }}>Device:</strong> {sessionInfo.device}</div>
              <div><strong style={{ color: '#374151' }}>IP:</strong> {sessionInfo.ipMask}</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, boxShadow: '0 8px 20px rgba(0,0,0,0.04)', display: 'grid', gap: 14 }}>
          <div style={{ marginBottom: 2 }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: 18, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>Edit Profile Details</h3>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Update personal and contact information.</p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Name</label>
            <input
              value={form.fullName}
              onChange={(e) => {
                setForm({ ...form, fullName: e.target.value });
                if (errors.fullName) setErrors({ ...errors, fullName: undefined });
              }}
              placeholder="Full name"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.fullName ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.fullName && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.fullName}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Email</label>
            <input
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="Email address"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.email ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.email && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.email}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Contact Number</label>
            <input
              value={form.contactNumber}
              onChange={(e) => {
                setForm({ ...form, contactNumber: e.target.value });
                if (errors.contactNumber) setErrors({ ...errors, contactNumber: undefined });
              }}
              placeholder="+94770000000"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.contactNumber ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.contactNumber && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.contactNumber}</div>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#374151', fontWeight: 700, fontSize: 13 }}>Photo URL</label>
            <input
              value={form.photoUrl}
              onChange={(e) => {
                setForm({ ...form, photoUrl: e.target.value });
                setImgError(false);
                if (errors.photoUrl) setErrors({ ...errors, photoUrl: undefined });
              }}
              placeholder="https://example.com/photo.jpg"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.photoUrl ? '1px solid #ef4444' : '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            />
            {errors.photoUrl && <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>{errors.photoUrl}</div>}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={onDiscard} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>Discard</button>
            <button onClick={onResetToDefault} style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#be123c', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>Default</button>
            <button disabled={!isDirty} onClick={onSave} style={{ border: '1px solid #0f766e', background: isDirty ? '#0f766e' : '#9ca3af', color: '#fff', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: isDirty ? 'pointer' : 'not-allowed' }}>Save Changes</button>
          </div>

          <div style={{ marginTop: 8, borderTop: '1px solid #ecf4ef', paddingTop: 16, display: 'grid', gap: 10 }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>Security</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8 }}>
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 13 }}
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 13 }}
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 13 }}
              />
              <button onClick={onChangePassword} style={{ border: '1px solid #0f766e', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '0 12px', fontWeight: 700, cursor: 'pointer' }}>Update</button>
            </div>
            {passwordError && <div style={{ color: '#b91c1c', fontSize: 12 }}>{passwordError}</div>}
            {passwordStatus && <div style={{ color: '#0f766e', fontSize: 12, fontWeight: 600 }}>{passwordStatus}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
