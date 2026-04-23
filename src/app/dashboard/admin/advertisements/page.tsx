'use client';

import { useMemo, useState } from 'react';
import { pendingAds } from '../../../../data/adminData';
import { ADMIN_STORAGE_KEYS, appendAudit, downloadFile, loadStoredState, saveStoredState } from '../utils/operations';

function MetricCard({ title, value, detail, accent = '#0f766e' }: { title: string; value: string; detail?: string; accent?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
        <div style={{ width: 32, height: 24, borderRadius: 8, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>▣</div>
      </div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800 }}>{value}</div>
      {detail && <div style={{ color: '#10B981', fontSize: 12, marginTop: 6 }}>{detail}</div>}
    </div>
  );
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState(() =>
    loadStoredState(
      ADMIN_STORAGE_KEYS.adQueue,
      pendingAds.map((ad) => ({
        ...ad,
        status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
      })),
    ),
  );

  const counters = useMemo(() => {
    const pending = ads.filter((ad) => ad.status === 'Pending').length;
    const approved = ads.filter((ad) => ad.status === 'Approved').length;
    const rejected = ads.filter((ad) => ad.status === 'Rejected').length;
    return { pending, approved, rejected };
  }, [ads]);

  const updateStatus = (id: number, status: 'Approved' | 'Rejected') => {
    setAds((prev) => {
      const next = prev.map((ad) => (ad.id === id ? { ...ad, status } : ad));
      saveStoredState(ADMIN_STORAGE_KEYS.adQueue, next);
      const target = next.find((ad) => ad.id === id);
      if (target) {
        appendAudit('AD_REVIEW', `${target.title} marked as ${status}`);
      }
      return next;
    });
  };

  const exportReport = () => {
    const header = ['Ad ID', 'Tutor', 'Title', 'Price', 'Status'];
    const rows = ads.map((ad) => [String(ad.id), ad.tutor, ad.title, ad.price, ad.status]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    downloadFile('advertisements-report.csv', csv, 'text/csv;charset=utf-8;');
    appendAudit('AD_EXPORT', 'Advertisements report downloaded');
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>Ad Management & Approvals</h2>
        <p style={{ margin: '6px 0 0', color: '#6B7280' }}>{counters.pending} pending requests</p>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, color: '#10B981', fontWeight: 700, flexWrap: 'wrap' }}>
          <span>Pending Approvals</span>
          <span style={{ background: '#ECFDF5', borderRadius: 999, padding: '2px 8px', border: '1px solid rgba(16,185,129,0.16)' }}>{counters.pending}</span>
          <span style={{ color: '#6B7280' }}>Approved: {counters.approved}</span>
          <span style={{ color: '#6B7280' }}>Rejected: {counters.rejected}</span>
        </div>
        <button onClick={exportReport} style={{ border: '1px solid #D1D5DB', background: 'white', color: '#111827', borderRadius: 12, padding: '10px 14px', fontWeight: 600, cursor: 'pointer' }}>Export Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {ads.map((ad) => (
          <div key={ad.id} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: 18, minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <div>
              <div style={{ display: 'inline-block', background: '#ECFDF5', color: '#059669', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(16,185,129,0.12)' }}>Paid {ad.price}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: ad.status === 'Approved' ? '#dcfce7' : ad.status === 'Rejected' ? '#fee2e2' : '#fef3c7', color: ad.status === 'Approved' ? '#166534' : ad.status === 'Rejected' ? '#991b1b' : '#92400e' }}>
                  {ad.status}
                </span>
              </div>
              <div style={{ marginTop: 88, color: '#6B7280', fontSize: 13 }}>{ad.tutor}</div>
              <div style={{ color: '#111827', fontSize: 20, fontWeight: 800, marginTop: 6 }}>{ad.title}</div>
              <div style={{ color: '#6B7280', lineHeight: 1.45, marginTop: 10 }}>{ad.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => updateStatus(ad.id, 'Approved')} style={{ flex: 1, border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', borderRadius: 10, padding: '10px 12px', fontWeight: 700, cursor: 'pointer' }}>Approve Ad</button>
              <button onClick={() => updateStatus(ad.id, 'Rejected')} style={{ flex: 1, border: '1px solid #D1D5DB', background: '#F9FAFB', color: '#374151', borderRadius: 10, padding: '10px 12px', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: 18, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
        <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif" }}>Ad Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
          <MetricCard title="Total Impressions" value="48.2k" detail="+12%" accent="#0f766e" />
          <MetricCard title="Total Clicks" value="2,410" detail="+8%" accent="#1d4ed8" />
          <MetricCard title="Average CTR" value="5.0%" detail="-0.4%" accent="#7c3aed" />
          <MetricCard title="Revenue (Ad Fees)" value="Rs. 24k" detail="+15%" accent="#10B981" />
        </div>
        <div style={{ marginTop: 18, color: '#6B7280' }}>Monthly performance chart placeholder based on the attached UI.</div>
        <div style={{ height: 160, borderRadius: 16, background: 'linear-gradient(180deg, rgba(16,185,129,0.08), rgba(255,255,255,0.4))', marginTop: 14, border: '1px dashed rgba(16,185,129,0.18)' }} />
      </div>
    </div>
  );
}
