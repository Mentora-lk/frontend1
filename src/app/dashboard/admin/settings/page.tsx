'use client';

import { useState } from 'react';
import { ADMIN_STORAGE_KEYS, appendAudit, downloadFile, loadStoredState, saveStoredState } from '../utils/operations';

const defaultSettings = {
  // Account & Security
  twoFactorAuth: false,
  twoFactorSecret: '',

  // Notifications
  emailNotifications: true,
  smsNotifications: false,
  sessionReminderEmails: true,

  // Platform behavior
  maintenanceMode: false,
  tutorVerificationRequired: true,
  studentSelfRegistration: true,

  // Students management (mirrors the Students page)
  studentsPerPage: '10',

  // Sessions management (mirrors the Sessions page)
  defaultSessionDuration: '60',

  // Advertisements (mirrors the Ads page)
  autoApprovalAds: false,
  maxAdsPerTutor: '3',

  // Localization
  currency: 'LKR',
  timezone: 'Asia/Colombo',
};

type Settings = typeof defaultSettings;

function generateSecret(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 999, border: 'none', padding: 3, cursor: 'pointer',
        background: checked ? '#0f766e' : '#e5e7eb', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: checked ? 'translateX(18px)' : 'translateX(0)', transition: 'transform 0.2s ease',
      }} />
    </button>
  );
}

function SettingRow({ title, description, checked, onChange, divider = true, children }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void; divider?: boolean; children?: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: divider ? '1px solid #f1f5f4' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 0' }}>
        <div>
          <div style={{ color: '#111827', fontWeight: 600, fontSize: 14.5 }}>{title}</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{description}</div>
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {checked && children && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  );
}

function SelectRow({ title, description, value, options, onChange, divider = true }: {
  title: string; description: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; divider?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: divider ? '1px solid #f1f5f4' : 'none' }}>
      <div>
        <div style={{ color: '#111827', fontWeight: 600, fontSize: 14.5 }}>{title}</div>
        <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{description}</div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', minWidth: 130 }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SectionCard({ icon, accent, title, subtitle, children, span }: {
  icon: string; accent: string; title: string; subtitle: string; children: React.ReactNode; span?: boolean;
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)', overflow: 'hidden', gridColumn: span ? '1 / -1' : undefined }}>
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f4', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, flexShrink: 0 }}>{icon}</div>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontWeight: 700, fontFamily: "'Fraunces', serif", fontSize: 16 }}>{title}</h3>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12.5 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: '4px 22px 6px' }}>{children}</div>
    </div>
  );
}

// ── Two-Factor Authentication setup wizard ──────────────────────────────────

function TwoFactorSetup({ enabled, secret, onEnabled, onDisabled }: {
  enabled: boolean;
  secret: string;
  onEnabled: (secret: string) => void;
  onDisabled: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draftSecret, setDraftSecret] = useState('');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [copied, setCopied] = useState(false);

  const startSetup = () => {
    const s = generateSecret();
    setDraftSecret(s);
    setStep(1);
    setCode('');
    setCodeError('');
  };

  const otpauthUrl = `otpauth://totp/Mentora.lk:admin?secret=${draftSecret}&issuer=Mentora.lk`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUrl)}`;

  const verifyAndEnable = () => {
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code shown in your authenticator app.');
      return;
    }
    onEnabled(draftSecret);
    setStep(1);
    setCode('');
    setCodeError('');
  };

  if (enabled) {
    return (
      <div style={{ background: '#ecfeff', border: '1px solid #99f6e4', borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700 }}>✓ Two-factor authentication is active</div>
          <button
            onClick={onDisabled}
            style={{ border: '1px solid #fca5a5', background: '#fff', color: '#be123c', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Turn off
          </button>
        </div>
      </div>
    );
  }

  if (!draftSecret) {
    return (
      <button
        onClick={startSetup}
        style={{ border: '1px solid #d1d5db', background: '#fff', color: '#111827', borderRadius: 10, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
      >
        Set up two-factor authentication
      </button>
    );
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, background: '#fafbfb' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: step >= n ? '#0f766e' : '#e5e7eb',
          }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14, marginBottom: 8 }}>Step 1 — Install an authenticator app</div>
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Install one of these on your phone if you haven't already:
          </p>
          <ul style={{ color: '#374151', fontSize: 13, lineHeight: 1.9, margin: '8px 0 0', paddingLeft: 20 }}>
            <li>Google Authenticator</li>
            <li>Microsoft Authenticator</li>
            <li>Authy</li>
            <li>1Password</li>
          </ul>
          <button
            onClick={() => setStep(2)}
            style={{ marginTop: 14, border: 'none', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            I have an app — Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14, marginBottom: 8 }}>Step 2 — Scan the QR code</div>
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>
            Open your authenticator app and scan this code, or enter the setup key manually.
          </p>
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={qrUrl} alt="Two-factor authentication QR code" width={150} height={150} style={{ borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>Can't scan? Enter this key manually:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', fontSize: 13, letterSpacing: 1, color: '#111827' }}>
                  {draftSecret}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(draftSecret); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  style={{ border: '1px solid #d1d5db', background: '#fff', color: '#111827', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(1)} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Back</button>
            <button onClick={() => setStep(3)} style={{ border: 'none', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14, marginBottom: 8 }}>Step 3 — Verify the code</div>
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
            Enter the 6-digit code currently shown in your authenticator app.
          </p>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeError(''); }}
            placeholder="000000"
            inputMode="numeric"
            style={{ width: 140, padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${codeError ? '#fca5a5' : '#d1d5db'}`, fontSize: 18, letterSpacing: 4, textAlign: 'center', fontWeight: 700, color: '#111827' }}
          />
          {codeError && <div style={{ color: '#dc2626', fontSize: 12.5, marginTop: 6 }}>{codeError}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(2)} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Back</button>
            <button onClick={verifyAndEnable} style={{ border: 'none', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Verify & enable</button>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 11.5, marginTop: 14, lineHeight: 1.5 }}>
            Note: production deployments should verify this code against the secret on the backend (e.g. with the <code>otplib</code> or <code>speakeasy</code> package) before enabling 2FA, rather than trusting the client alone.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(() => loadStoredState(ADMIN_STORAGE_KEYS.settings, { ...defaultSettings }));
  const [statusText, setStatusText] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);
  let statusTimer: any;

  const persist = (next: Settings, label: string, message?: string) => {
    setSettings(next);
    saveStoredState(ADMIN_STORAGE_KEYS.settings, next);
    appendAudit('SETTINGS_UPDATE', label);
    setStatusText(message ?? label);
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => setStatusText(''), 2500);
  };

  const toggle = (key: keyof Settings, label: string) => (value: boolean) =>
    persist({ ...settings, [key]: value }, `${label} set to ${value ? 'on' : 'off'}`, `${label} ${value ? 'enabled' : 'disabled'}.`);

  const select = (key: keyof Settings, label: string) => (value: string) =>
    persist({ ...settings, [key]: value }, `${label} set to ${value}`, `${label} updated.`);

  const enable2FA = (secret: string) =>
    persist({ ...settings, twoFactorAuth: true, twoFactorSecret: secret }, 'Two-factor authentication enabled', 'Two-factor authentication enabled.');

  const disable2FA = () =>
    persist({ ...settings, twoFactorAuth: false, twoFactorSecret: '' }, 'Two-factor authentication disabled', 'Two-factor authentication disabled.');

  const exportSettings = () => {
    downloadFile('admin-settings.json', JSON.stringify(settings, null, 2), 'application/json');
    setStatusText('Settings exported.');
    appendAudit('SETTINGS_EXPORT', 'Admin settings exported');
  };

  const clearCache = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEYS.settings);
    setStatusText('Cached settings cleared.');
    appendAudit('SETTINGS_CACHE_CLEAR', 'Admin settings cache cleared');
  };

  const resetSettings = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      setTimeout(() => setConfirmingReset(false), 3000);
      return;
    }
    setSettings(defaultSettings);
    saveStoredState(ADMIN_STORAGE_KEYS.settings, defaultSettings);
    setStatusText('Settings reset to default.');
    appendAudit('SETTINGS_RESET', 'Admin settings reset to default');
    setConfirmingReset(false);
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Settings</h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Manage security, notifications, and how the platform behaves.</p>
        </div>
        <div style={{ minHeight: 20 }}>
          {statusText && (
            <div style={{ background: '#ecfeff', border: '1px solid #99f6e4', color: '#0f766e', borderRadius: 999, padding: '6px 14px', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
              ✓ {statusText}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, alignItems: 'start' }}>

        <SectionCard icon="🔐" accent="#0f766e" title="Account & Security" subtitle="Protect your admin account">
          <div style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: settings.twoFactorAuth || true ? 12 : 0 }}>
              <div>
                <div style={{ color: '#111827', fontWeight: 600, fontSize: 14.5 }}>Two-Factor Authentication</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>Require a verification code at sign in</div>
              </div>
            </div>
            <TwoFactorSetup
              enabled={settings.twoFactorAuth}
              secret={settings.twoFactorSecret}
              onEnabled={enable2FA}
              onDisabled={disable2FA}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 0' }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 600, fontSize: 14.5 }}>Password</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>Last changed — not tracked yet</div>
            </div>
            <button style={{ border: '1px solid #d1d5db', background: '#fff', color: '#111827', borderRadius: 10, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Change password
            </button>
          </div>
        </SectionCard>

        <SectionCard icon="🔔" accent="#1d4ed8" title="Notifications & Alerts" subtitle="Choose how you're kept in the loop">
          <SettingRow title="Email Notifications" description="Receive admin alerts via email" checked={settings.emailNotifications} onChange={toggle('emailNotifications', 'Email notifications')} />
          <SettingRow title="SMS Notifications" description="Receive urgent alerts via SMS" checked={settings.smsNotifications} onChange={toggle('smsNotifications', 'SMS notifications')} />
          <SettingRow title="Session Reminder Emails" description="Notify students before an upcoming session" checked={settings.sessionReminderEmails} onChange={toggle('sessionReminderEmails', 'Session reminder emails')} divider={false} />
        </SectionCard>

        <SectionCard icon="⚙" accent="#7c3aed" title="Platform Behavior" subtitle="Controls that affect every user">
          <SettingRow title="Maintenance Mode" description="Show a maintenance notice to all users" checked={settings.maintenanceMode} onChange={toggle('maintenanceMode', 'Maintenance mode')} />
          <SettingRow title="Tutor Verification Required" description="Tutors must be verified before posting a class" checked={settings.tutorVerificationRequired} onChange={toggle('tutorVerificationRequired', 'Tutor verification requirement')} />
          <SettingRow title="Student Self-Registration" description="Allow students to create their own accounts" checked={settings.studentSelfRegistration} onChange={toggle('studentSelfRegistration', 'Student self-registration')} divider={false} />
        </SectionCard>

        <SectionCard icon="🧑‍🎓" accent="#0891b2" title="Students" subtitle="Defaults for the Students directory">
          <SelectRow
            title="Rows per page"
            description="Number of students shown per page in the directory"
            value={settings.studentsPerPage}
            onChange={select('studentsPerPage', 'Students per page')}
            options={[{ value: '6', label: '6' }, { value: '10', label: '10' }, { value: '20', label: '20' }, { value: '50', label: '50' }]}
            divider={false}
          />
        </SectionCard>

        <SectionCard icon="📅" accent="#d97706" title="Sessions" subtitle="Defaults for newly scheduled sessions">
          <SelectRow
            title="Default session duration"
            description="Used when a duration isn't specified manually"
            value={settings.defaultSessionDuration}
            onChange={select('defaultSessionDuration', 'Default session duration')}
            options={[{ value: '30', label: '30 minutes' }, { value: '45', label: '45 minutes' }, { value: '60', label: '60 minutes' }, { value: '90', label: '90 minutes' }]}
            divider={false}
          />
        </SectionCard>

        <SectionCard icon="📣" accent="#be185d" title="Advertisements" subtitle="Controls for tutor advertisements">
          <SettingRow title="Auto-Approve Advertisements" description="New ads go live immediately without manual review" checked={settings.autoApprovalAds} onChange={toggle('autoApprovalAds', 'Auto-approve advertisements')} />
          <SelectRow
            title="Max active ads per tutor"
            description="Limit how many ads a single tutor can run at once"
            value={settings.maxAdsPerTutor}
            onChange={select('maxAdsPerTutor', 'Max ads per tutor')}
            options={[{ value: '1', label: '1' }, { value: '3', label: '3' }, { value: '5', label: '5' }, { value: '10', label: '10' }]}
            divider={false}
          />
        </SectionCard>

        <SectionCard icon="🌍" accent="#059669" title="Localization" subtitle="Currency and timezone used across the platform">
          <SelectRow
            title="Currency"
            description="Used for pricing on ads and payments"
            value={settings.currency}
            onChange={select('currency', 'Currency')}
            options={[{ value: 'LKR', label: 'LKR — Sri Lankan Rupee' }, { value: 'USD', label: 'USD — US Dollar' }]}
          />
          <SelectRow
            title="Timezone"
            description="Used for scheduling sessions and reports"
            value={settings.timezone}
            onChange={select('timezone', 'Timezone')}
            options={[{ value: 'Asia/Colombo', label: 'Asia/Colombo' }, { value: 'UTC', label: 'UTC' }]}
            divider={false}
          />
        </SectionCard>

        <SectionCard icon="🗄" accent="#374151" title="Data" subtitle="Export or clear locally stored settings">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '10px 0 14px' }}>
            <button onClick={exportSettings} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#111827', borderRadius: 10, padding: '10px 16px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>↓ Export settings</button>
            <button onClick={clearCache} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#111827', borderRadius: 10, padding: '10px 16px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>↺ Clear cache</button>
          </div>
        </SectionCard>

        {/* Danger zone — spans full width */}
        <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 18, overflow: 'hidden', gridColumn: '1 / -1' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#dc2626', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, flexShrink: 0 }}>⚠</div>
            <div>
              <h3 style={{ margin: 0, color: '#991b1b', fontWeight: 700, fontFamily: "'Fraunces', serif", fontSize: 16 }}>Danger Zone</h3>
              <p style={{ margin: '2px 0 0', color: '#b45309', fontSize: 12.5 }}>Irreversible actions — proceed with care</p>
            </div>
          </div>
          <div style={{ padding: '16px 22px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 600, fontSize: 14.5 }}>Reset all settings</div>
              <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>Restore every setting on this page to its default value</div>
            </div>
            <button
              onClick={resetSettings}
              style={{ border: 'none', background: confirmingReset ? '#991b1b' : '#fef2f2', color: confirmingReset ? '#fff' : '#991b1b', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {confirmingReset ? 'Click again to confirm' : '🗑 Reset to default'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
