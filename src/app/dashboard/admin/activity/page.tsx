'use client';

import { useMemo, useState } from 'react';
import { ADMIN_STORAGE_KEYS, getAuditTrail, downloadFile, saveStoredState } from '../utils/operations';

export default function AdminActivityPage() {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState(getAuditTrail());

  const filtered = useMemo(() => {
    if (!query.trim()) return logs;
    const q = query.toLowerCase();
    return logs.filter((item) => item.action.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q) || item.actor.toLowerCase().includes(q));
  }, [logs, query]);

  const clearLogs = () => {
    saveStoredState(ADMIN_STORAGE_KEYS.audit, []);
    setLogs([]);
  };

  const exportLogs = () => {
    const header = ['Time', 'Actor', 'Action', 'Detail'];
    const rows = logs.map((item) => [new Date(item.createdAt).toLocaleString(), item.actor, item.action, item.detail]);
    const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    downloadFile('admin-activity-log.csv', csv, 'text/csv;charset=utf-8;');
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Activity Log</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Operational audit trail for admin actions.</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10 }}>
          <input
            type="text"
            placeholder="Search logs by action, detail or actor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          />
          <button onClick={exportLogs} style={{ border: '1px solid #bbf7d0', background: '#ecfdf5', color: '#047857', borderRadius: 12, padding: '0 14px', fontWeight: 700, cursor: 'pointer' }}>Export</button>
          <button onClick={clearLogs} style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', borderRadius: 12, padding: '0 14px', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ background: '#f0fdf4', textAlign: 'left' }}>
                {['Time', 'Actor', 'Action', 'Detail'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 20, color: '#6b7280' }}>No activity found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                    <td style={{ padding: '14px 16px', color: '#374151' }}>{new Date(item.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '14px 16px', color: '#111827', fontWeight: 700 }}>{item.actor}</td>
                    <td style={{ padding: '14px 16px', color: '#047857', fontWeight: 700 }}>{item.action}</td>
                    <td style={{ padding: '14px 16px', color: '#374151' }}>{item.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
