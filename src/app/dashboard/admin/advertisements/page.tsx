'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAds, updateAdStatus } from '@/services/adminApi';
import { pendingAds } from '@/data/adminData';
import Spinner from '@/components/ui/Spinner';

function MetricCard({ title, value, detail, accent = '#0f766e' }: { title: string; value: string; detail?: string; accent?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
        <div style={{ width: 32, height: 24, borderRadius: 8, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>▣</div>
      </div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800 }}>{value}</div>
      {detail && <div style={{ color: '#0f766e', fontSize: 12, marginTop: 6 }}>{detail}</div>}
    </div>
  );
}

export default function AdvertisementsPage() {
  const [ads, setAds]         = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Load ads from real backend on mount
  useEffect(() => {
    async function fetchAds() {
      try {
        const data = await getAds();
        // Backend returns: [{ id, tutor_id, tutor_name, title, status, created_at, ... }]
        // Normalise so the rest of the UI always has { id, tutor, title, status }
        const normalised = data.map((ad: any) => ({
          ...ad,
          tutor:  ad.tutor_name ?? ad.tutor ?? 'Unknown Tutor',
          title:  ad.title      ?? 'Untitled Ad',
          desc:   ad.description ?? ad.desc ?? '',
          price:  ad.price      ?? '—',
          status: (ad.status as string) ?? 'Pending',
        }));
        setAds(normalised);
      } catch (err: any) {
        console.error('Failed to fetch ads:', err);
        const fallback = pendingAds.map((ad: any) => ({
          ...ad,
          tutor: ad.tutor,
          title: ad.title,
          desc: ad.desc,
          price: ad.price,
          status: 'Pending',
        }));
        setAds(fallback);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  const counters = useMemo(() => ({
    pending:  ads.filter((ad) => ad.status === 'pending'  || ad.status === 'Pending').length,
    approved: ads.filter((ad) => ad.status === 'approved' || ad.status === 'Approved').length,
    rejected: ads.filter((ad) => ad.status === 'rejected' || ad.status === 'Rejected').length,
  }), [ads]);

  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateAdStatus(id, status);
      // Update local state so UI reflects change immediately
      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, status } : ad)),
      );
    } catch (err) {
      console.error('Failed to update ad status:', err);
      alert('Failed to update ad status. Please try again.');
    }
  };

  const getStatusColors = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'approved') return { bg: '#ecfeff', color: '#0f766e', border: '1px solid #99f6e4' };
    if (s === 'rejected') return { bg: '#fee2e2', color: '#991b1b', border: '1px solid transparent' };
    return { bg: '#fef3c7', color: '#92400e', border: '1px solid transparent' };
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>
          Ad Management &amp; Approvals
        </h2>
        <p style={{ margin: '6px 0 0', color: '#6B7280' }}>{counters.pending} pending requests</p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, color: '#0f766e', fontWeight: 700, flexWrap: 'wrap' }}>
          <span>Pending Approvals</span>
          <span style={{ background: '#ECFEFF', borderRadius: 999, padding: '2px 8px', border: '1px solid rgba(15,118,110,0.16)' }}>{counters.pending}</span>
          <span style={{ color: '#6B7280' }}>Approved: {counters.approved}</span>
          <span style={{ color: '#6B7280' }}>Rejected: {counters.rejected}</span>
        </div>
      </div>

      {/* Ad cards */}
      {loading ? (
       <div style={{ textAlign: 'center', padding: 48 }}><Spinner size={30} /></div>
        ) : ads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>No advertisements found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {ads.map((ad) => {
            const statusColors = getStatusColors(ad.status);
            return (
              <div key={ad.id} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: 18, minHeight: 250, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
                <div>
                  {ad.price && (
                    <div style={{ display: 'inline-block', background: '#ECFEFF', color: '#0f766e', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(15,118,110,0.12)' }}>
                      Paid {ad.price}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: statusColors.bg, color: statusColors.color, border: statusColors.border }}>
                      {ad.status}
                    </span>
                  </div>
                  <div style={{ marginTop: 16, color: '#6B7280', fontSize: 13 }}>{ad.tutor}</div>
                  <div style={{ color: '#111827', fontSize: 20, fontWeight: 800, marginTop: 6 }}>{ad.title}</div>
                  {ad.desc && <div style={{ color: '#6B7280', lineHeight: 1.45, marginTop: 10 }}>{ad.desc}</div>}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button
                    onClick={() => handleStatusUpdate(ad.id, 'approved')}
                    disabled={ad.status.toLowerCase() === 'approved'}
                    style={{ flex: 1, border: 'none', background: ad.status.toLowerCase() === 'approved' ? '#9ca3af' : 'linear-gradient(135deg,#0f766e,#14b8a6)', color: '#fff', borderRadius: 10, padding: '10px 12px', fontWeight: 700, cursor: ad.status.toLowerCase() === 'approved' ? 'not-allowed' : 'pointer' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(ad.id, 'rejected')}
                    disabled={ad.status.toLowerCase() === 'rejected'}
                    style={{ flex: 1, border: '1px solid #D1D5DB', background: '#F9FAFB', color: '#374151', borderRadius: 10, padding: '10px 12px', fontWeight: 700, cursor: ad.status.toLowerCase() === 'rejected' ? 'not-allowed' : 'pointer', opacity: ad.status.toLowerCase() === 'rejected' ? 0.5 : 1 }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Performance summary (static display cards — no backend data needed) */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
        <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif" }}>Ad Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
          <MetricCard title="Total Impressions" value="48.2k" detail="+12%" accent="#0f766e" />
          <MetricCard title="Total Clicks"      value="2,410" detail="+8%"  accent="#1d4ed8" />
          <MetricCard title="Average CTR"       value="5.0%"  detail="-0.4%" accent="#7c3aed" />
          <MetricCard title="Revenue (Ad Fees)" value="Rs. 24k" detail="+15%" accent="#0f766e" />
        </div>
      </div>
    </div>
  );
}
