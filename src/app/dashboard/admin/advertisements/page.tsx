'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAds, updateAdStatus } from '@/services/adminApi';
import { pendingAds } from '@/data/adminData';
import Spinner from '@/components/ui/Spinner';

type Ad = {
  id: number;
  tutor: string;
  title: string;
  desc: string;
  price: string;
  status: string;
  created_at?: string;
  rejection_reason?: string;
  reviewed_at?: string;
};

const ACCENT = '#d97706';

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const created = new Date(iso).getTime();
  if (isNaN(created)) return null;
  const diffMs = Date.now() - created;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function fmtDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-LK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function placeholderImage(id: number) {
  return `https://picsum.photos/seed/ad-${id}/480/280`;
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const palette =
    s === 'approved'
      ? { bg: 'rgba(34,197,94,0.10)', color: '#22c55e', border: 'rgba(34,197,94,0.20)' }
      : s === 'rejected'
      ? { bg: 'rgba(239,68,68,0.10)', color: '#ef4444', border: 'rgba(239,68,68,0.20)' }
      : { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', border: 'rgba(245,158,11,0.20)' };
  return (
    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}`, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function MetricCard({ title, value, detail, accent = ACCENT }: { title: string; value: string; detail?: string; accent?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
        <div style={{ width: 32, height: 24, borderRadius: 8, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>▣</div>
      </div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800 }}>{value}</div>
      {detail && <div style={{ color: accent, fontSize: 12, marginTop: 6 }}>{detail}</div>}
    </div>
  );
}

function AdDrawer({ ad, onClose, onApprove, onReject }: { ad: Ad | null; onClose: () => void; onApprove: (ad: Ad) => void; onReject: (ad: Ad) => void }) {
  const open = ad !== null;
  const days = ad ? daysSince(ad.created_at) : null;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.32)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.2s ease', zIndex: 40 }} />
      <div
        role="dialog"
        aria-hidden={!open}
        style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 400, maxWidth: '92vw', background: '#fff', boxShadow: '-16px 0 40px rgba(0,0,0,0.12)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.24s ease', zIndex: 50, display: 'flex', flexDirection: 'column' }}
      >
        {ad && (
          <>
            <div style={{ position: 'relative' }}>
              <img src={placeholderImage(ad.id)} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <button onClick={onClose} aria-label="Close details" style={{ position: 'absolute', top: 14, right: 14, border: 'none', background: 'rgba(17,24,39,0.55)', color: '#fff', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 15 }}>✕</button>
            </div>

            <div style={{ padding: 22, overflowY: 'auto', flex: 1, display: 'grid', gap: 20 }}>
              <div>
                <StatusBadge status={ad.status} />
                <h3 style={{ margin: '10px 0 4px', color: '#111827', fontSize: 19, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>{ad.title}</h3>
                <div style={{ color: '#6b7280', fontSize: 13 }}>by {ad.tutor}</div>
              </div>

              <div style={{ background: '#f9fafb', border: '1px solid #f0f2f5', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Description</div>
                <div style={{ color: '#374151', fontSize: 13.5, lineHeight: 1.6 }}>{ad.desc || 'No description provided.'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f9fafb', border: '1px solid #f0f2f5', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>Price</div>
                  <div style={{ color: '#111827', fontWeight: 700, marginTop: 2 }}>Rs. {ad.price}</div>
                </div>
                <div style={{ background: '#f9fafb', border: '1px solid #f0f2f5', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ color: '#9ca3af', fontSize: 11 }}>Running for</div>
                  <div style={{ color: '#111827', fontWeight: 700, marginTop: 2 }}>{days !== null ? `${days} day${days === 1 ? '' : 's'}` : '—'}</div>
                </div>
              </div>

              <div style={{ background: '#f9fafb', border: '1px solid #f0f2f5', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ color: '#9ca3af', fontSize: 11 }}>Submitted</div>
                <div style={{ color: '#111827', fontWeight: 600, marginTop: 2, fontSize: 13 }}>{fmtDateTime(ad.created_at)}</div>
              </div>

              {ad.status.toLowerCase() === 'rejected' && ad.rejection_reason && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ color: '#991B1B', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Rejection Reason</div>
                  <div style={{ color: '#7f1d1d', fontSize: 13.5, lineHeight: 1.6 }}>{ad.rejection_reason}</div>
                </div>
              )}
            </div>

            <div style={{ padding: 18, borderTop: '1px solid #ecf4ef', display: 'flex', gap: 10 }}>
              <button
                onClick={() => onApprove(ad)}
                disabled={ad.status.toLowerCase() === 'approved'}
                style={{ flex: 1, border: 'none', background: ad.status.toLowerCase() === 'approved' ? '#9ca3af' : 'linear-gradient(135deg,#0f766e,#14b8a6)', color: '#fff', borderRadius: 10, padding: '11px 12px', fontWeight: 700, cursor: ad.status.toLowerCase() === 'approved' ? 'not-allowed' : 'pointer' }}
              >
                Approve
              </button>
              <button
                onClick={() => onReject(ad)}
                disabled={ad.status.toLowerCase() === 'rejected'}
                style={{ flex: 1, border: '1px solid #D1D5DB', background: '#F9FAFB', color: '#374151', borderRadius: 10, padding: '11px 12px', fontWeight: 700, cursor: ad.status.toLowerCase() === 'rejected' ? 'not-allowed' : 'pointer', opacity: ad.status.toLowerCase() === 'rejected' ? 0.5 : 1 }}
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ConfirmActionModal({
  ad, action, onCancel, onConfirm, submitting, errorMsg,
}: {
  ad: Ad | null;
  action: 'approved' | 'rejected' | null;
  onCancel: () => void;
  onConfirm: (reason: string, password: string) => void;
  submitting: boolean;
  errorMsg: string;
}) {
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const open = ad !== null && action !== null;

  useEffect(() => {
    if (open) { setReason(''); setPassword(''); }
  }, [open, ad?.id]);

  if (!open) return null;

  const isReject = action === 'rejected';
  const canSubmit = password.trim().length > 0 && (!isReject || reason.trim().length >= 10);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 20 }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: 440, maxWidth: '100%', padding: 26, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: 0, color: '#111827', fontSize: 18, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>
          {isReject ? 'Reject this advertisement?' : 'Approve this advertisement?'}
        </h3>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '6px 0 18px' }}>
          {ad?.title} — {ad?.tutor}
        </p>

        {isReject && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Reason for rejection *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why — this is shown to the tutor so they can fix and resubmit."
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 13.5, resize: 'vertical' }}
            />
            <div style={{ fontSize: 11.5, color: reason.trim().length > 0 && reason.trim().length < 10 ? '#dc2626' : '#9ca3af', marginTop: 4 }}>
              Minimum 10 characters — the tutor sees this exact text.
            </div>
          </div>
        )}

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Confirm your admin password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }}
          />
          <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 4 }}>
            Required to confirm approve/reject actions — these are logged to the audit trail.
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, marginTop: 4 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} disabled={submitting} style={{ flex: 1, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', borderRadius: 10, padding: '11px 12px', fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim(), password)}
            disabled={!canSubmit || submitting}
            style={{
              flex: 1, border: 'none',
              background: isReject ? '#dc2626' : 'linear-gradient(135deg,#0f766e,#14b8a6)',
              color: '#fff', borderRadius: 10, padding: '11px 12px', fontWeight: 700,
              cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
              opacity: !canSubmit || submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Confirming…' : isReject ? 'Confirm Rejection' : 'Confirm Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest-running'>('newest');

  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ ad: Ad; action: 'approved' | 'rejected' } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  useEffect(() => {
    async function fetchAds() {
      try {
        const data = await getAds();
        const normalised: Ad[] = data.map((ad: any) => ({
          id: ad.id,
          tutor: ad.tutor_name ?? ad.tutor ?? 'Unknown Tutor',
          title: ad.title ?? 'Untitled Ad',
          desc: ad.description ?? ad.desc ?? '',
          price: ad.price ?? '—',
          status: ad.status ?? 'Pending',
          created_at: ad.created_at,
          rejection_reason: ad.rejection_reason,
          reviewed_at: ad.reviewed_at,
        }));
        setAds(normalised);
      } catch (err: any) {
        console.error('Failed to fetch ads:', err);
        setError('Could not reach the server — showing cached data.');
        const fallback: Ad[] = pendingAds.map((ad: any) => ({
          id: ad.id, tutor: ad.tutor, title: ad.title, desc: ad.desc, price: ad.price, status: 'Pending',
        }));
        setAds(fallback);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  const counters = useMemo(() => ({
    pending: ads.filter((ad) => ad.status.toLowerCase() === 'pending').length,
    approved: ads.filter((ad) => ad.status.toLowerCase() === 'approved').length,
    rejected: ads.filter((ad) => ad.status.toLowerCase() === 'rejected').length,
  }), [ads]);

  const filteredAds = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = ads.filter((ad) => {
      const matchSearch = !q || ad.title.toLowerCase().includes(q) || ad.tutor.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || ad.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
    list = [...list].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (sortBy === 'newest') return bTime - aTime;
      if (sortBy === 'oldest') return aTime - bTime;
      return aTime - bTime;
    });
    return list;
  }, [ads, search, statusFilter, sortBy]);

  const openConfirm = (ad: Ad, action: 'approved' | 'rejected') => {
    setConfirmError('');
    setConfirmTarget({ ad, action });
  };

  const handleConfirm = async (reason: string, password: string) => {
    if (!confirmTarget) return;
    setSubmitting(true);
    setConfirmError('');
    try {
      // TODO: Replace with actual password verification from your API
      const verified = password.length > 0;
      if (!verified) {
        setConfirmError('Incorrect password. Please try again.');
        setSubmitting(false);
        return;
      }

      await updateAdStatus(confirmTarget.ad.id, confirmTarget.action);

      setAds((prev) =>
        prev.map((a) =>
          a.id === confirmTarget.ad.id
            ? { ...a, status: confirmTarget.action, rejection_reason: confirmTarget.action === 'rejected' ? reason : a.rejection_reason }
            : a,
        ),
      );
      setSelectedAd((prev) => (prev && prev.id === confirmTarget.ad.id ? { ...prev, status: confirmTarget.action, rejection_reason: confirmTarget.action === 'rejected' ? reason : prev.rejection_reason } : prev));
      setConfirmTarget(null);
    } catch (err) {
      console.error('Failed to update ad status:', err);
      setConfirmError('Something went wrong updating the ad. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'grid', gap: 22,
        background: 'linear-gradient(160deg, #fffbeb 0%, #fffdf6 100%)',
        borderRadius: 24, padding: 20, margin: -20,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Ad Management &amp; Approvals</h2>
        <p style={{ margin: '6px 0 0', color: '#6B7280' }}>{counters.pending} pending requests</p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <MetricCard title="Pending Approvals" value={String(counters.pending)} detail="Awaiting review" />
        <MetricCard title="Approved" value={String(counters.approved)} detail="Live on the platform" accent="#0f766e" />
        <MetricCard title="Rejected" value={String(counters.rejected)} detail="Needs tutor action" accent="#dc2626" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <input
          type="text"
          placeholder="Search by title or tutor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#111827' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#111827' }}>
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, color: '#111827' }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="longest-running">Longest running</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Spinner size={30} /></div>
      ) : filteredAds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>No advertisements match your filters.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18 }}>
          {filteredAds.map((ad) => {
            const days = daysSince(ad.created_at);
            return (
              <div
                key={ad.id}
                onClick={() => setSelectedAd(ad)}
                style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.05)', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(15,23,42,0.09)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.05)'; }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={placeholderImage(ad.id)} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10 }}><StatusBadge status={ad.status} /></div>
                  {ad.price && ad.price !== '—' && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(17,24,39,0.75)', color: '#fff', borderRadius: 8, padding: '3px 9px', fontSize: 11.5, fontWeight: 700 }}>
                      Rs. {ad.price}
                    </div>
                  )}
                </div>

                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ color: '#6B7280', fontSize: 12.5 }}>{ad.tutor}</div>
                  <div style={{ color: '#111827', fontSize: 16.5, fontWeight: 800, marginTop: 4, lineHeight: 1.3 }}>{ad.title}</div>
                  {ad.desc && <div style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.45, marginTop: 8, flex: 1 }}>{ad.desc.length > 90 ? `${ad.desc.slice(0, 90)}…` : ad.desc}</div>}

                  {days !== null && (
                    <div style={{ color: '#9ca3af', fontSize: 11.5, marginTop: 10 }}>Running for {days} day{days === 1 ? '' : 's'}</div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openConfirm(ad, 'approved')}
                      disabled={ad.status.toLowerCase() === 'approved'}
                      style={{ flex: 1, border: 'none', background: ad.status.toLowerCase() === 'approved' ? '#9ca3af' : 'linear-gradient(135deg,#0f766e,#14b8a6)', color: '#fff', borderRadius: 10, padding: '9px 10px', fontWeight: 700, fontSize: 13, cursor: ad.status.toLowerCase() === 'approved' ? 'not-allowed' : 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openConfirm(ad, 'rejected')}
                      disabled={ad.status.toLowerCase() === 'rejected'}
                      style={{ flex: 1, border: '1px solid #D1D5DB', background: '#F9FAFB', color: '#374151', borderRadius: 10, padding: '9px 10px', fontWeight: 700, fontSize: 13, cursor: ad.status.toLowerCase() === 'rejected' ? 'not-allowed' : 'pointer', opacity: ad.status.toLowerCase() === 'rejected' ? 0.5 : 1 }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
        <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif" }}>Ad Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 16 }}>
          <MetricCard title="Total Impressions" value="48.2k" detail="+12%" accent="#0f766e" />
          <MetricCard title="Total Clicks" value="2,410" detail="+8%" accent="#1d4ed8" />
          <MetricCard title="Average CTR" value="5.0%" detail="-0.4%" accent="#7c3aed" />
          <MetricCard title="Revenue (Ad Fees)" value="Rs. 24k" detail="+15%" accent={ACCENT} />
        </div>
      </div>

      <AdDrawer
        ad={selectedAd}
        onClose={() => setSelectedAd(null)}
        onApprove={(ad) => openConfirm(ad, 'approved')}
        onReject={(ad) => openConfirm(ad, 'rejected')}
      />

      <ConfirmActionModal
        ad={confirmTarget?.ad ?? null}
        action={confirmTarget?.action ?? null}
        onCancel={() => { if (!submitting) setConfirmTarget(null); }}
        onConfirm={handleConfirm}
        submitting={submitting}
        errorMsg={confirmError}
      />
    </div>
  );
}