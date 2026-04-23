'use client';

import { useState } from 'react';
import { ADMIN_STORAGE_KEYS, appendAudit, downloadFile, loadStoredState, saveStoredState } from '../utils/operations';

export default function AdminSettingsPage() {
  const defaultSettings = {
    emailNotifications: true,
    twoFactorAuth: false,
    maintenanceMode: false,
    autoApprovalAds: false,
    tutorVerificationRequired: true,
  };

  const [settings, setSettings] = useState(() => loadStoredState(ADMIN_STORAGE_KEYS.settings, { ...defaultSettings }));
  const [statusText, setStatusText] = useState('');

  const setAndPersist = (next: typeof defaultSettings) => {
    setSettings(next);
    saveStoredState(ADMIN_STORAGE_KEYS.settings, next);
  };

  const exportSettings = () => {
    const payload = JSON.stringify(settings, null, 2);
    downloadFile('admin-settings.json', payload, 'application/json');
    setStatusText('Settings exported.');
    appendAudit('SETTINGS_EXPORT', 'Admin settings exported');
  };

  const clearCache = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEYS.settings);
    setStatusText('Cached settings cleared.');
    appendAudit('SETTINGS_CACHE_CLEAR', 'Admin settings cache cleared');
  };

  const resetSettings = () => {
    setAndPersist(defaultSettings);
    setStatusText('Settings reset to default.');
    appendAudit('SETTINGS_RESET', 'Admin settings reset to default');
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Settings</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>System preferences.</p>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {statusText && (
          <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>
            {statusText}
          </div>
        )}

        {/* Notifications Section */}
        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 14px', color: '#111827', fontWeight: 700 }}>Notifications & Alerts</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid #ecf4ef' }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 600 }}>Email Notifications</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Receive admin alerts via email</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
                onChange={(e) => {
                  const next = { ...settings, emailNotifications: e.target.checked };
                  setAndPersist(next);
                  appendAudit('SETTINGS_UPDATE', `Email notifications set to ${e.target.checked ? 'on' : 'off'}`);
                }}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 600 }}>Two-Factor Authentication</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Enhanced security for admin account</div>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
                onChange={(e) => {
                  const next = { ...settings, twoFactorAuth: e.target.checked };
                  setAndPersist(next);
                  appendAudit('SETTINGS_UPDATE', `Two-factor auth set to ${e.target.checked ? 'on' : 'off'}`);
                }}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* System Settings Section */}
        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 14px', color: '#111827', fontWeight: 700 }}>System Settings</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid #ecf4ef' }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 600 }}>Maintenance Mode</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Show a maintenance notice to users.</div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
                onChange={(e) => {
                  const next = { ...settings, maintenanceMode: e.target.checked };
                  setAndPersist(next);
                  appendAudit('SETTINGS_UPDATE', `Maintenance mode set to ${e.target.checked ? 'on' : 'off'}`);
                }}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 600 }}>Tutor Verification Required</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>All tutors must be verified before posting</div>
            </div>
            <input
              type="checkbox"
              checked={settings.tutorVerificationRequired}
                onChange={(e) => {
                  const next = { ...settings, tutorVerificationRequired: e.target.checked };
                  setAndPersist(next);
                  appendAudit('SETTINGS_UPDATE', `Tutor verification requirement set to ${e.target.checked ? 'on' : 'off'}`);
                }}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Automation Section */}
        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 14px', color: '#111827', fontWeight: 700 }}>Automation</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#111827', fontWeight: 600 }}>Auto-Approve Advertisements</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Automatically approve new ads (use with caution)</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoApprovalAds}
                onChange={(e) => {
                  const next = { ...settings, autoApprovalAds: e.target.checked };
                  setAndPersist(next);
                  appendAudit('SETTINGS_UPDATE', `Auto-approve ads set to ${e.target.checked ? 'on' : 'off'}`);
                }}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <button onClick={exportSettings} style={{ border: '1px solid #dfeee8', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8faf9'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>↓ Export Settings</button>
          <button onClick={clearCache} style={{ border: '1px solid #dfeee8', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8faf9'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>↺ Clear Cache</button>
          <button onClick={resetSettings} style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', borderRadius: 12, padding: '12px 16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'} onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}>🗑 Reset to Default</button>
        </div>
      </div>
    </div>
  );
}
