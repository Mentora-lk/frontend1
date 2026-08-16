'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  adminLogout,
  type AdminProfile,
} from '@/services/adminApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProfileForm = {
  fullName: string;
  contactNumber: string;
  photoUrl: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB raw upload ceiling before we even try to read it
const AVATAR_OUTPUT_SIZE = 320; // px, square
const CARD_PADDING = '22px';

const PROFILE_LAYOUT_STYLES = `
  .profile-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }
  @media (max-width: 860px) { .profile-grid { grid-template-columns: 1fr; } }

  .btn { transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease, opacity 0.15s ease; }
  .btn:hover:not(:disabled) { filter: brightness(1.06); }
  .btn:active:not(:disabled) { transform: scale(0.98); }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn:focus-visible, .field:focus-visible, .field:focus { outline: 2px solid var(--accent); outline-offset: 2px; }

  .field { transition: border-color 0.15s ease, background 0.15s ease; }
  .field:hover { border-color: var(--accent); }

  .avatar-drop { transition: border-color 0.15s ease, background 0.15s ease; }
  .avatar-drop[data-dragging='true'] { border-color: var(--accent) !important; background: var(--sidebar-active-bg) !important; }

  .avatar-wrap { position: relative; width: 132px; height: 132px; margin: 0 auto; }
  .avatar-edit-btn { position: absolute; bottom: 2px; right: 2px; width: 34px; height: 34px; border-radius: 50%;
    background: var(--accent); border: 3px solid var(--card-bg); display: grid; place-items: center; cursor: pointer;
    color: #fff; font-size: 14px; }
  .avatar-edit-btn:hover { filter: brightness(1.08); }

  @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fade-in 0.15s ease; }

  .spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; display: inline-block; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .skeleton { background: linear-gradient(90deg, var(--divider) 25%, var(--input-border) 37%, var(--divider) 63%);
    background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; border-radius: 8px; }
  @keyframes skeleton-loading { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
`;

function formatDateUTC(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'var(--input-border)' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Very weak', color: 'var(--danger)' },
    { label: 'Weak', color: 'var(--danger)' },
    { label: 'Fair', color: '#d97706' },
    { label: 'Good', color: '#0f766e' },
    { label: 'Strong', color: '#0f766e' },
    { label: 'Very strong', color: '#059669' },
  ];
  const level = levels[Math.min(score, levels.length - 1)];
  return { score, label: level.label, color: level.color };
}

// Resize + compress an uploaded image client-side before it ever hits the
// network — keeps the request small and avoids storing multi-MB blobs in the DB.
function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const size = AVATAR_OUTPUT_SIZE;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Could not process the image.')); return; }
        const srcSize = Math.min(img.width, img.height);
        const sx = (img.width - srcSize) / 2;
        const sy = (img.height - srcSize) / 2;
        ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function SectionCard({ icon, accent, title, subtitle, children }: {
  icon: string; accent: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 18, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ padding: CARD_PADDING, borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, flexShrink: 0 }}>{icon}</div>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 700, fontFamily: "'Fraunces', serif", fontSize: 16 }}>{title}</h3>
          {subtitle && <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: 12.5 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding: CARD_PADDING }}>{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-primary)', fontWeight: 700, fontSize: 13 }}>{label}</label>
      {children}
      {error && <div style={{ marginTop: 6, color: 'var(--danger)', fontSize: 12 }}>{error}</div>}
    </div>
  );
}

function Toast({ tone, text }: { tone: 'ok' | 'error'; text: string }) {
  return (
    <div
      className="fade-in"
      style={{
        background: tone === 'ok' ? 'var(--success-bg)' : 'var(--danger-bg-soft)',
        border: `1px solid ${tone === 'ok' ? 'var(--success-border)' : 'var(--danger-border)'}`,
        color: tone === 'ok' ? 'var(--success)' : 'var(--danger-title)',
        borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 600,
      }}
    >
      {tone === 'ok' ? '✓ ' : '⚠ '}{text}
    </div>
  );
}

function AvatarUploader({
  photoUrl, initials, onChange, onError,
}: {
  photoUrl: string;
  initials: string;
  onChange: (dataUrl: string) => void;
  onError: (msg: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { onError('Please choose an image file (JPG, PNG, or WEBP).'); return; }
    if (file.size > MAX_PHOTO_BYTES) { onError('That image is larger than 8MB — please choose a smaller file.'); return; }

    setProcessing(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setImgFailed(false);
      onChange(dataUrl);
    } catch (err: any) {
      onError(err?.message || 'Could not process that image.');
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      className="avatar-drop"
      data-dragging={dragging}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      style={{ border: '2px dashed var(--input-border)', borderRadius: 16, padding: '20px 14px', textAlign: 'center' }}
    >
      <div className="avatar-wrap">
        {photoUrl && !imgFailed ? (
          <img
            src={photoUrl}
            alt="Admin profile"
            onError={() => setImgFailed(true)}
            style={{ width: 132, height: 132, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)', display: 'block' }}
          />
        ) : (
          <div style={{ width: 132, height: 132, borderRadius: '50%', background: 'var(--sidebar-active-bg)', border: '3px solid var(--accent)', color: 'var(--accent)', fontWeight: 800, fontSize: 34, display: 'grid', placeItems: 'center' }}>
            {initials}
          </div>
        )}

        <button
          type="button"
          className="avatar-edit-btn"
          onClick={() => inputRef.current?.click()}
          title="Change photo"
          aria-label="Change profile photo"
          disabled={processing}
        >
          {processing ? <span className="spinner" /> : '✎'}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => handleFiles(e.target.files)} style={{ display: 'none' }} />

      <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.5 }}>
        Drag a photo here, or{' '}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent)', fontWeight: 700, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
        >
          browse files
        </button>
        <br />JPG, PNG, or WEBP · up to 8MB
      </div>

      {photoUrl && (
        <button
          type="button"
          className="btn"
          onClick={() => { onChange(''); setImgFailed(false); }}
          style={{ marginTop: 10, border: '1px solid var(--danger-border)', background: 'var(--card-bg)', color: 'var(--danger-title)', borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
        >
          Remove photo
        </button>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="profile-grid">
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 18, padding: 22 }}>
          <div className="skeleton" style={{ width: 132, height: 132, borderRadius: '50%', margin: '0 auto' }} />
          <div className="skeleton" style={{ height: 14, width: '60%', margin: '18px auto 0' }} />
          <div className="skeleton" style={{ height: 12, width: '80%', margin: '8px auto 0' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 18, padding: 22, display: 'grid', gap: 14 }}>
          <div className="skeleton" style={{ height: 44 }} />
          <div className="skeleton" style={{ height: 44 }} />
          <div className="skeleton" style={{ height: 44 }} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>({ fullName: '', contactNumber: '', photoUrl: '' });
  const [savedForm, setSavedForm] = useState<ProfileForm>({ fullName: '', contactNumber: '', photoUrl: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [toast, setToast] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = (tone: 'ok' | 'error', text: string) => {
    setToast({ tone, text });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getAdminProfile();
      setProfile(data);
      const next: ProfileForm = {
        fullName: data.full_name || '',
        contactNumber: data.contact_number || '',
        photoUrl: data.photo_url || '',
      };
      setForm(next);
      setSavedForm(next);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        adminLogout();
        router.push('/auth/login');
        return;
      }
      setLoadError(err?.response?.data?.message || 'Could not load your profile. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Instant fill from what login already cached, so the page isn't blank
    // while the network request for the full record is in flight.
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('adminUser');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setForm((f) => ({ ...f, fullName: parsed.fullName || f.fullName }));
        } catch {
          // ignore malformed cache
        }
      }
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = useMemo(() => {
    const parts = form.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'A';
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
  }, [form.fullName]);

  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm]);

  const validate = (values: ProfileForm) => {
    const next: Partial<Record<keyof ProfileForm, string>> = {};
    if (!values.fullName.trim()) next.fullName = 'Name is required.';
    else if (values.fullName.trim().length < 3) next.fullName = 'Name is too short.';

    if (values.contactNumber.trim() && !/^\+?[0-9]{9,15}$/.test(values.contactNumber.trim())) {
      next.contactNumber = 'Use 9-15 digits, optional + at start.';
    }
    return next;
  };

  const onSave = async () => {
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      showToast('error', 'Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateAdminProfile({
        fullName: form.fullName.trim(),
        contactNumber: form.contactNumber.trim() || undefined,
        photoUrl: form.photoUrl || undefined,
      });
      setProfile(updated);
      const next: ProfileForm = {
        fullName: updated.full_name || '',
        contactNumber: updated.contact_number || '',
        photoUrl: updated.photo_url || '',
      };
      setForm(next);
      setSavedForm(next);

      // Keep the cached login name in sync so the sidebar/header stay correct too.
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('adminUser');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            localStorage.setItem('adminUser', JSON.stringify({ ...parsed, fullName: updated.full_name }));
          } catch {
            // ignore malformed cache
          }
        }
      }

      showToast('ok', 'Profile updated successfully.');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        adminLogout();
        router.push('/auth/login');
        return;
      }
      showToast('error', err?.response?.data?.message || 'Could not save your changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => {
    setForm(savedForm);
    setErrors({});
    showToast('ok', 'Unsaved changes were discarded.');
  };

  const strength = passwordStrength(passwordForm.newPassword);

  const onChangePassword = async () => {
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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setChangingPassword(true);
    try {
      await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStatus('Password updated successfully.');
    } catch (err: any) {
      if (err?.response?.status === 401 && err?.response?.data?.message === 'Current password is incorrect') {
        setPasswordError('Current password is incorrect.');
      } else if (err?.response?.status === 401) {
        adminLogout();
        router.push('/auth/login');
        return;
      } else {
        setPasswordError(err?.response?.data?.message || 'Could not update your password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const inputStyle = (hasError?: string): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1px solid ${hasError ? 'var(--danger)' : 'var(--input-border)'}`,
    background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 14,
  });

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <style>{PROFILE_LAYOUT_STYLES}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Profile</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>View and update your admin account details.</p>
        </div>
        {toast && <Toast tone={toast.tone} text={toast.text} />}
      </div>

      {loadError && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, background: 'var(--danger-bg-soft)', border: '1px solid var(--danger-border)', borderRadius: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--danger-title)', fontSize: 13 }}>⚠ {loadError}</span>
          <button className="btn" onClick={fetchProfile} style={{ border: '1px solid var(--danger-border)', background: 'var(--card-bg)', color: 'var(--danger-title)', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="profile-grid">
          {/* Left column */}
          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard icon="🙂" accent="#0f766e" title="Photo">
              <AvatarUploader
                photoUrl={form.photoUrl}
                initials={initials}
                onChange={(dataUrl) => setForm({ ...form, photoUrl: dataUrl })}
                onError={(msg) => showToast('error', msg)}
              />

              <div style={{ marginTop: 18, textAlign: 'center' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 15 }}>{form.fullName || 'Admin User'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12.5, marginTop: 2 }}>{profile?.email || '—'}</div>
              </div>

              <div style={{ marginTop: 16, borderTop: '1px solid var(--divider)', paddingTop: 14, color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.8 }}>
                <div><strong style={{ color: 'var(--text-primary)' }}>Role:</strong> Admin</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Admin code:</strong> {profile?.admin_code || '—'}</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Account created:</strong> {profile ? formatDateUTC(profile.created_at) : '—'}</div>
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard icon="🧾" accent="#7c3aed" title="Personal details" subtitle="This information is visible to other admins.">
              <div style={{ display: 'grid', gap: 16 }}>
                <Field label="Name" error={errors.fullName}>
                  <input
                    className="field"
                    value={form.fullName}
                    onChange={(e) => { setForm({ ...form, fullName: e.target.value }); if (errors.fullName) setErrors({ ...errors, fullName: undefined }); }}
                    placeholder="Full name"
                    style={inputStyle(errors.fullName)}
                  />
                </Field>

                <Field label="Email">
                  <input
                    className="field"
                    value={profile?.email || ''}
                    disabled
                    style={{ ...inputStyle(), background: 'var(--divider)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                  <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 11.5 }}>Email can't be changed here — contact a super admin if this needs to update.</div>
                </Field>

                <Field label="Contact number" error={errors.contactNumber}>
                  <input
                    className="field"
                    value={form.contactNumber}
                    onChange={(e) => { setForm({ ...form, contactNumber: e.target.value }); if (errors.contactNumber) setErrors({ ...errors, contactNumber: undefined }); }}
                    placeholder="+94770000000"
                    style={inputStyle(errors.contactNumber)}
                  />
                </Field>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4, flexWrap: 'wrap' }}>
                  <button className="btn" onClick={onDiscard} disabled={!isDirty || saving} style={{ border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>
                    Discard
                  </button>
                  <button
                    className="btn"
                    disabled={!isDirty || saving}
                    onClick={onSave}
                    style={{ border: 'none', background: (isDirty && !saving) ? 'var(--accent)' : 'var(--input-border)', color: '#fff', borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: (isDirty && !saving) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {saving && <span className="spinner" />}
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon="🔑" accent="#0f766e" title="Change password" subtitle="Choose a strong password you don't use elsewhere.">
              <div style={{ display: 'grid', gap: 14 }}>
                <Field label="Current password">
                  <input
                    className="field"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={inputStyle()}
                  />
                </Field>

                <Field label="New password">
                  <input
                    className="field"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={inputStyle()}
                  />
                  {passwordForm.newPassword && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--input-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${(strength.score / 5) * 100}%`, height: '100%', background: strength.color, transition: 'width 0.2s ease' }} />
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: strength.color, whiteSpace: 'nowrap' }}>{strength.label}</span>
                    </div>
                  )}
                </Field>

                <Field label="Confirm new password">
                  <input
                    className="field"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={inputStyle()}
                  />
                </Field>

                {passwordError && <div style={{ color: 'var(--danger)', fontSize: 12.5 }}>{passwordError}</div>}
                {passwordStatus && <div style={{ color: 'var(--success)', fontSize: 12.5, fontWeight: 600 }}>✓ {passwordStatus}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn"
                    onClick={onChangePassword}
                    disabled={changingPassword}
                    style={{ border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: changingPassword ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    {changingPassword && <span className="spinner" />}
                    {changingPassword ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
