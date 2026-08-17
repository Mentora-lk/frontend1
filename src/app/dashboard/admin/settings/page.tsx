'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ADMIN_STORAGE_KEYS, appendAudit, loadStoredState, saveStoredState } from '../utils/operations';
import { useAppearance } from '../appearance-context';

// NOTE: `xlsx` (SheetJS) is required for the Excel export below.
// If it isn't already a dependency, install it with: npm install xlsx

const defaultSettings = {
  twoFactorAuth: false,
  twoFactorSecret: '',
  sessionTimeoutMinutes: '30',
  emailNotifications: true,
  smsNotifications: false,
  sessionReminderEmails: true,
  weeklySummaryEmail: true,
  maintenanceMode: false,
  tutorVerificationRequired: true,
  studentSelfRegistration: true,
  defaultSessionDuration: '60',
  maxAdsPerTutor: '3',
  currency: 'LKR',
  timezone: 'Asia/Colombo',
};

type Settings = typeof defaultSettings;
type NavId = 'security' | 'appearance' | 'notifications' | 'platform' | 'sessions' | 'ads' | 'localization' | 'data' | 'danger';

const ROW_PADDING = '18px 0';
const CARD_PADDING = '22px';

// Page-specific layout + interactive states. Colors come from the shared AppearanceProvider.
const SETTINGS_LAYOUT_STYLES = `
  .settings-shell { display: flex; gap: 28px; align-items: flex-start; }
  .settings-nav { width: 230px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; position: sticky; top: 24px; }
  .settings-content { flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 24px; animation: settings-fade-in 0.15s ease; }
  @keyframes settings-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .nav-item { transition: background 0.15s ease, color 0.15s ease; }
  .nav-item:hover:not([data-active='true']) { background: var(--divider) !important; color: var(--text-primary) !important; }

  .btn { transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease, opacity 0.15s ease; }
  .btn:hover:not(:disabled) { filter: brightness(1.06); }
  .btn:active:not(:disabled) { transform: scale(0.98); }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn:focus-visible, .select-field:focus-visible, .toggle-btn:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 2px;
  }

  .settings-row { transition: background 0.15s ease; border-radius: 10px; }
  .settings-row:hover { background: var(--divider); }

  .select-field { transition: border-color 0.15s ease; cursor: pointer; }
  .select-field:hover { border-color: var(--accent) !important; }

  .toggle-btn { transition: background 0.2s ease; }
  .toggle-btn .knob { transition: transform 0.2s ease; }

  @media (max-width: 760px) {
    .settings-shell { flex-direction: column; }
    .settings-nav { width: 100%; flex-direction: row; overflow-x: auto; position: static; }
  }
`;

const NAV_ITEMS: { id: NavId; icon: string; label: string; danger?: boolean }[] = [
  { id: 'security', icon: '🔐', label: 'Account & Security' },
  { id: 'appearance', icon: '🎨', label: 'Appearance' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'platform', icon: '⚙️', label: 'Platform Behavior' },
  { id: 'sessions', icon: '📅', label: 'Sessions' },
  { id: 'ads', icon: '📣', label: 'Advertisements' },
  { id: 'localization', icon: '🌍', label: 'Localization' },
  { id: 'data', icon: '🗄️', label: 'Data' },
  { id: 'danger', icon: '⚠️', label: 'Danger Zone', danger: true },
];

function generateSecret(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Turns a camelCase settings key into a readable label for the exported spreadsheet.
function formatSettingLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="toggle-btn"
      style={{
        width: 44, height: 26, borderRadius: 999, border: 'none', padding: 3, cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--input-border)', flexShrink: 0,
      }}
    >
      <div className="knob" style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transform: checked ? 'translateX(18px)' : 'translateX(0)',
      }} />
    </button>
  );
}

function RowLabel({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14.5, lineHeight: 1.4 }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3, lineHeight: 1.4 }}>{description}</div>
    </div>
  );
}

function SettingRow({ title, description, checked, onChange, divider = true, children }: {
  title: string; description: string; checked: boolean; onChange: (v: boolean) => void; divider?: boolean; children?: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: divider ? '1px solid var(--divider)' : 'none' }}>
      <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: `${ROW_PADDING.split(' ')[0]} 10px`, margin: '0 -10px', flexWrap: 'wrap' }}>
        <RowLabel title={title} description={description} />
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {checked && children && <div style={{ paddingBottom: 20 }}>{children}</div>}
    </div>
  );
}

function SelectRow({ title, description, value, options, onChange, divider = true }: {
  title: string; description: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; divider?: boolean;
}) {
  return (
    <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: `${ROW_PADDING.split(' ')[0]} 10px`, margin: '0 -10px', borderBottom: divider ? '1px solid var(--divider)' : 'none', flexWrap: 'wrap' }}>
      <RowLabel title={title} description={description} />
      <select
        className="select-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 600, minWidth: 150, flexShrink: 0 }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// Common session-length presets, plus a "Custom" option that reveals a free-entry
// minutes field — so admins aren't locked into one of a few fixed durations.
const SESSION_DURATION_PRESETS = [
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
  { value: '90', label: '90 minutes' },
  { value: '120', label: '2 hours' },
];

function SessionDurationRow({ value, onChange, divider = true }: {
  value: string; onChange: (v: string) => void; divider?: boolean;
}) {
  const isCustom = !SESSION_DURATION_PRESETS.some((o) => o.value === value);
  const [customDraft, setCustomDraft] = useState(isCustom ? value : '');

  const handleSelectChange = (v: string) => {
    if (v === 'custom') {
      setCustomDraft('');
      // Wait for the admin to type a value before persisting anything.
      return;
    }
    onChange(v);
  };

  const handleCustomChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 3);
    setCustomDraft(digits);
    if (digits) onChange(digits);
  };

  return (
    <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: `${ROW_PADDING.split(' ')[0]} 10px`, margin: '0 -10px', borderBottom: divider ? '1px solid var(--divider)' : 'none', flexWrap: 'wrap' }}>
      <RowLabel title="Default session duration" description="Used when a duration isn't specified manually" />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <select
          className="select-field"
          value={isCustom ? 'custom' : value}
          onChange={(e) => handleSelectChange(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 10, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 600, minWidth: 130 }}
        >
          {SESSION_DURATION_PRESETS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          <option value="custom">Custom…</option>
        </select>
        {isCustom && (
          <input
            value={customDraft}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Minutes"
            inputMode="numeric"
            style={{ width: 90, padding: '9px 10px', borderRadius: 10, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: 13.5, fontWeight: 600 }}
          />
        )}
      </div>
    </div>
  );
}
function SectionCard({ icon, accent, title, subtitle, children }: {
  icon: string; accent: string; title: string; subtitle: string; children: React.ReactNode;
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
      <div style={{ padding: `0 ${CARD_PADDING}` }}>{children}</div>
    </div>
  );
}

function NavItem({ icon, label, active, danger, onClick }: {
  icon: string; label: string; active: boolean; danger?: boolean; onClick: () => void;
}) {
  return (
    <button
      className="nav-item"
      data-active={active}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
        padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        background: active ? (danger ? 'var(--danger-bg-soft)' : 'var(--sidebar-active-bg)') : 'transparent',
        color: active ? (danger ? 'var(--danger)' : 'var(--accent)') : 'var(--text-muted)',
        fontWeight: active ? 700 : 600, fontSize: 13.5, flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>{label}
    </button>
  );
}

function ThemeToggle({ value, onChange }: {
  value: 'light' | 'dark' | 'system'; onChange: (v: 'light' | 'dark' | 'system') => void;
}) {
  const options: { key: 'light' | 'dark' | 'system'; icon: string; label: string }[] = [
    { key: 'light', icon: '☀️', label: 'Light' },
    { key: 'dark', icon: '🌙', label: 'Dark' },
    { key: 'system', icon: '🖥️', label: 'System' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 12, padding: 4 }}>
      {options.map((o) => (
        <button
          key={o.key}
          className="btn"
          onClick={() => onChange(o.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
            padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 700,
            background: value === o.key ? 'var(--accent)' : 'transparent',
            color: value === o.key ? '#fff' : 'var(--text-muted)',
          }}
        >
          <span>{o.icon}</span>{o.label}
        </button>
      ))}
    </div>
  );
}

function ThemeQuickToggle({ resolvedTheme, onToggle }: { resolvedTheme: 'light' | 'dark'; onToggle: () => void }) {
  return (
    <button
      className="btn"
      onClick={onToggle}
      title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 40, height: 40, borderRadius: 12, border: '1px solid var(--card-border)', background: 'var(--card-bg)',
        display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 17, flexShrink: 0,
      }}
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

function TwoFactorSetup({ enabled, onEnabled, onDisabled }: {
  enabled: boolean; onEnabled: (secret: string) => void; onDisabled: () => void;
}) {
  const [draftSecret, setDraftSecret] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [copied, setCopied] = useState(false);

  const startSetup = () => {
    setDraftSecret(generateSecret());
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
    setDraftSecret('');
    setStep(1);
    setCode('');
    setCodeError('');
  };

  if (enabled) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
        <div style={{ color: 'var(--success)', fontSize: 13, fontWeight: 700 }}>✓ Two-factor authentication is active</div>
        <button className="btn" onClick={onDisabled} style={{ border: '1px solid var(--danger-border)', background: 'var(--card-bg)', color: 'var(--danger-title)', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          Turn off
        </button>
      </div>
    );
  }

  if (!draftSecret) {
    return (
      <button className="btn" onClick={startSetup} style={{ border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
        Set up two-factor authentication
      </button>
    );
  }

  return (
    <div style={{ border: '1px solid var(--card-border)', borderRadius: 14, padding: 20, background: 'var(--input-bg)' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= n ? 'var(--accent)' : 'var(--input-border)' }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, marginBottom: 10 }}>Step 1 — Install an authenticator app</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>Install one of these on your phone if you haven't already:</p>
          <ul style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 2, margin: '10px 0 0', paddingLeft: 20 }}>
            <li>Google Authenticator</li>
            <li>Microsoft Authenticator</li>
            <li>Authy</li>
            <li>1Password</li>
          </ul>
          <button className="btn" onClick={() => setStep(2)} style={{ marginTop: 18, border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            I have an app — Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, marginBottom: 10 }}>Step 2 — Scan the QR code</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>Open your authenticator app and scan this code, or enter the setup key manually.</p>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={qrUrl} alt="Two-factor authentication QR code" width={150} height={150} style={{ borderRadius: 10, border: '1px solid var(--card-border)', background: '#fff', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>Can't scan? Enter this key manually:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <code style={{ background: 'var(--card-bg)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, letterSpacing: 1, color: 'var(--text-primary)' }}>{draftSecret}</code>
                <button className="btn" onClick={() => { navigator.clipboard.writeText(draftSecret); setCopied(true); setTimeout(() => setCopied(false), 1500); }} style={{ border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 8, padding: '9px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn" onClick={() => setStep(1)} style={{ border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Back</button>
            <button className="btn" onClick={() => setStep(3)} style={{ border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14, marginBottom: 10 }}>Step 3 — Verify the code</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 14px' }}>Enter the 6-digit code currently shown in your authenticator app.</p>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeError(''); }}
            placeholder="000000"
            inputMode="numeric"
            style={{ width: 150, padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${codeError ? 'var(--danger)' : 'var(--input-border)'}`, fontSize: 18, letterSpacing: 4, textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--card-bg)' }}
          />
          {codeError && <div style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 8 }}>{codeError}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn" onClick={() => setStep(2)} style={{ border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Back</button>
            <button className="btn" onClick={verifyAndEnable} style={{ border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Verify & enable</button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 11.5, marginTop: 18, lineHeight: 1.6 }}>
            Note: production deployments should verify this code against the secret on the backend (e.g. with the <code>otplib</code> or <code>speakeasy</code> package) before enabling 2FA, rather than trusting the client alone.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { theme, resolvedTheme, setTheme } = useAppearance();
  const [settings, setSettings] = useState<Settings>(() => loadStoredState(ADMIN_STORAGE_KEYS.settings, { ...defaultSettings }));
  const [statusText, setStatusText] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [activeSection, setActiveSection] = useState<NavId>('security');
  let statusTimer: ReturnType<typeof setTimeout>;

  const persist = (next: Settings, auditLabel: string, toast: string) => {
    setSettings(next);
    saveStoredState(ADMIN_STORAGE_KEYS.settings, next);
    appendAudit('SETTINGS_UPDATE', auditLabel);
    setStatusText(toast);
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

  const toggleThemeQuick = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    appendAudit('SETTINGS_UPDATE', `Theme set to ${next}`);
    setStatusText(`Switched to ${next} mode.`);
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => setStatusText(''), 2500);
  };

  // Exports the current settings as a real .xlsx workbook (SheetJS), not JSON.
  const exportSettings = () => {
    const rows = Object.entries(settings)
      .filter(([key]) => key !== 'twoFactorSecret') // never export the 2FA secret
      .map(([key, value]) => ({ Setting: formatSettingLabel(key), Value: String(value) }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 32 }, { wch: 24 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Settings');
    XLSX.writeFile(workbook, 'admin-settings.xlsx');

    setStatusText('Settings exported.');
    appendAudit('SETTINGS_EXPORT', 'Admin settings exported to Excel');
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
    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
      <style>{SETTINGS_LAYOUT_STYLES}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Settings</h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>Manage security, notifications, and how the platform behaves.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ minHeight: 28, display: 'flex', alignItems: 'center' }}>
            {statusText && (
              <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                ✓ {statusText}
              </div>
            )}
          </div>
          <ThemeQuickToggle resolvedTheme={resolvedTheme} onToggle={toggleThemeQuick} />
        </div>
      </div>

      <div className="settings-shell">
        <nav className="settings-nav">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              danger={item.danger}
              active={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            />
          ))}
        </nav>

        <div className="settings-content" key={activeSection}>

          {activeSection === 'security' && (
            <SectionCard icon="🔐" accent="#0f766e" title="Account & Security" subtitle="Protect admin access to the platform.">
              <div style={{ padding: ROW_PADDING, borderBottom: '1px solid var(--divider)' }}>
                <div style={{ marginBottom: 14 }}>
                  <RowLabel title="Two-Factor Authentication" description="Require a verification code at sign in" />
                </div>
                <TwoFactorSetup enabled={settings.twoFactorAuth} onEnabled={enable2FA} onDisabled={disable2FA} />
              </div>
              <SelectRow
                title="Auto sign-out"
                description="Sign out automatically after a period of inactivity"
                value={settings.sessionTimeoutMinutes}
                onChange={select('sessionTimeoutMinutes', 'Auto sign-out')}
                options={[
                  { value: '15', label: '15 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '1 hour' },
                  { value: 'never', label: 'Never' },
                ]}
                divider={false}
              />
            </SectionCard>
          )}

          {activeSection === 'appearance' && (
            <SectionCard icon="🎨" accent="#9333ea" title="Appearance" subtitle="Choose how the admin panel looks on this device.">
              <div className="settings-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: `${ROW_PADDING.split(' ')[0]} 10px`, margin: '0 -10px' }}>
                <RowLabel title="Theme" description="Light, dark, or match your system setting" />
                <ThemeToggle value={theme} onChange={setTheme} />
              </div>
            </SectionCard>
          )}

          {activeSection === 'notifications' && (
            <SectionCard icon="🔔" accent="#1d4ed8" title="Notifications" subtitle="Choose which alerts you want to receive.">
              <SettingRow
                title="Email Notifications"
                description="Sent to the email address on your admin login"
                checked={settings.emailNotifications}
                onChange={toggle('emailNotifications', 'Email notifications')}
              />
              <SettingRow
                title="SMS Notifications"
                description="Sent to the phone number saved on your profile"
                checked={settings.smsNotifications}
                onChange={toggle('smsNotifications', 'SMS notifications')}
              />
              <SettingRow title="Session Reminder Emails" description="Notify students before an upcoming session" checked={settings.sessionReminderEmails} onChange={toggle('sessionReminderEmails', 'Session reminder emails')} />
              <SettingRow
                title="Weekly Summary Email"
                description="A weekly digest of platform activity, emailed to your login address"
                checked={settings.weeklySummaryEmail}
                onChange={toggle('weeklySummaryEmail', 'Weekly summary email')}
                divider={false}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '4px 0 18px', lineHeight: 1.6 }}>
                To change the email or phone number these are sent to, update them in your admin profile.
              </p>
            </SectionCard>
          )}

          {activeSection === 'platform' && (
            <SectionCard icon="⚙️" accent="#7c3aed" title="Platform Behavior" subtitle="Site-wide switches that affect every user.">
              <SettingRow title="Maintenance Mode" description="Show a maintenance notice to all users" checked={settings.maintenanceMode} onChange={toggle('maintenanceMode', 'Maintenance mode')} />
              <SettingRow title="Tutor Verification Required" description="Tutors must be verified before posting a class" checked={settings.tutorVerificationRequired} onChange={toggle('tutorVerificationRequired', 'Tutor verification requirement')} />
              <SettingRow title="Student Self-Registration" description="Allow students to create their own accounts" checked={settings.studentSelfRegistration} onChange={toggle('studentSelfRegistration', 'Student self-registration')} divider={false} />
            </SectionCard>
          )}

          {activeSection === 'sessions' && (
            <SectionCard icon="📅" accent="#d97706" title="Sessions" subtitle="Defaults applied when scheduling sessions.">
              <SessionDurationRow
                value={settings.defaultSessionDuration}
                onChange={select('defaultSessionDuration', 'Default session duration')}
                divider={false}
              />
            </SectionCard>
          )}

          {activeSection === 'ads' && (
            <SectionCard icon="📣" accent="#be185d" title="Advertisements" subtitle="Moderation rules for tutor ads.">
              <div style={{ padding: ROW_PADDING, borderBottom: '1px solid var(--divider)' }}>
                <RowLabel
                  title="Manual Review Required"
                  description="Every new advertisement is queued for manual admin approval before it goes live. Approving an ad is a trust-and-safety decision, so this can't be automated."
                />
              </div>
              <SelectRow
                title="Max active ads per tutor"
                description="Limit how many ads a single tutor can run at once"
                value={settings.maxAdsPerTutor}
                onChange={select('maxAdsPerTutor', 'Max ads per tutor')}
                options={[{ value: '1', label: '1' }, { value: '3', label: '3' }, { value: '5', label: '5' }, { value: '10', label: '10' }]}
                divider={false}
              />
            </SectionCard>
          )}

          {activeSection === 'localization' && (
            <SectionCard icon="🌍" accent="#059669" title="Localization" subtitle="Currency and timezone used across the platform.">
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
          )}

          {activeSection === 'data' && (
            <SectionCard icon="🗄️" accent="#374151" title="Data" subtitle="Export or clear locally cached settings.">
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '18px 0 22px' }}>
                <button className="btn" onClick={exportSettings} style={{ border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>↓ Export settings (.xlsx)</button>
                <button className="btn" onClick={clearCache} style={{ border: '1px solid var(--input-border)', background: 'var(--card-bg)', color: 'var(--text-primary)', borderRadius: 10, padding: '10px 18px', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>↺ Clear cache</button>
              </div>
            </SectionCard>
          )}

          {activeSection === 'danger' && (
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--danger-border)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: CARD_PADDING, borderBottom: '1px solid var(--danger-border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--danger)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, flexShrink: 0 }}>⚠</div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--danger-title)', fontWeight: 700, fontFamily: "'Fraunces', serif", fontSize: 16 }}>Danger Zone</h3>
                  <p style={{ margin: '3px 0 0', color: 'var(--danger-sub)', fontSize: 12.5 }}>Irreversible actions — proceed with care.</p>
                </div>
              </div>
              <div style={{ padding: `20px ${CARD_PADDING} 22px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <RowLabel title="Reset all settings" description="Restore every setting on this page to its default value" />
                <button
                  className="btn"
                  onClick={resetSettings}
                  style={{ border: 'none', background: confirmingReset ? '#991b1b' : 'var(--danger-bg-soft)', color: confirmingReset ? '#fff' : 'var(--danger-title)', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {confirmingReset ? 'Click again to confirm' : '🗑 Reset to default'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
