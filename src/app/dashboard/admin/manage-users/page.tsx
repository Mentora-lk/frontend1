'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTutors } from '@/services/adminApi';
import { ADMIN_STORAGE_KEYS, appendAudit, downloadFile, loadStoredState, saveStoredState } from '../utils/operations';
import Spinner from '@/components/ui/Spinner';

type BackendTutor = {
  id: number;
  full_name: string;
  email: string;
  subject: string;
  city: string;
  created_at: string;
  university: string | null;
  degree_title: string | null;
  graduation_year: number | null;
  experience: string | null;
  credentials: string | null;
  description: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  medium: string | null;
  level: string | null;
  grade_range: string | null;
  class_type: string | null;
  fee: string | null;
};

type Tutor = BackendTutor & {
  status: 'Pending' | 'Verified' | 'Rejected';
  rejectionReason?: string;
};

// Persisted per-tutor review state. Kept as an object (not just a status
// string) so the specific rejection reason travels with the status.
type StoredReview = { status: Tutor['status']; reason?: string };

type SortOrder = 'newest' | 'oldest';

// Internal-only rejection reasons. Never sent to the tutor — kept purely
// in the admin audit trail / drawer so decisions stay fast and consistent.
const REJECTION_REASONS = [
  'Incomplete or missing qualification details',
  'Unable to verify university / degree',
  'Subject expertise does not match application',
  'Duplicate application already on file',
  'Suspicious or inconsistent information',
  'Other (add note below)',
];

// A small fixed palette, cycled deterministically by subject name so each
// subject always gets the same distinct color across the whole page.
const SUBJECT_COLOR_PALETTE = [
  { bg: '#ecfeff', color: '#0f766e', border: '#99f6e4' }, // teal
  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }, // blue
  { bg: '#fdf4ff', color: '#a21caf', border: '#f0abfc' }, // purple
  { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' }, // orange
  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }, // green
  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }, // red
  { bg: '#fefce8', color: '#a16207', border: '#fde68a' }, // amber
  { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' }, // indigo
];

function subjectColor(subject?: string | null) {
  if (!subject) return SUBJECT_COLOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  return SUBJECT_COLOR_PALETTE[hash % SUBJECT_COLOR_PALETTE.length];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === 'Verified'
      ? { bg: 'rgba(34,197,94,0.10)', color: '#22c55e', border: 'rgba(34,197,94,0.20)' }
      : status === 'Pending'
      ? { bg: 'rgba(245,158,11,0.10)', color: '#f59e0b', border: 'rgba(245,158,11,0.20)' }
      : { bg: 'rgba(239,68,68,0.10)', color: '#ef4444', border: 'rgba(239,68,68,0.20)' };

  return (
    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
      {status}
    </span>
  );
}

// Small caption shown under a "Rejected" badge — the specific internal
// reason, kept out of the Status filter so that stays simple (All /
// Pending / Verified / Rejected) instead of one filter option per reason.
function RejectionCaption({ reason }: { reason?: string }) {
  if (!reason) return null;
  return (
    <div style={{ marginTop: 4, fontSize: 11, color: '#9f1239', maxWidth: 220, lineHeight: 1.4 }}>
      {reason}
    </div>
  );
}

function StatCard({ title, value, accent, loading }: { title: string; value: string; accent: string; loading: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center' }}>
        {loading ? <Spinner size={22} /> : value}
      </div>
    </div>
  );
}

// Small labeled field used throughout the details drawer, kept at a normal
// readable size rather than very small captions.
function DetailField({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, color: '#111827', fontWeight: 600, marginTop: 3, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {value || <span style={{ color: '#9ca3af', fontWeight: 500 }}>Not specified</span>}
      </div>
    </div>
  );
}

// Builds a compact pagination range: first, last, current ±1 sibling, and 'dots' for gaps.
function getPaginationRange(current: number, total: number, siblingCount = 1): (number | 'dots')[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= total) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < total - 1;

  const firstPageIndex = 1;
  const lastPageIndex = total;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'dots', lastPageIndex];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
    return [firstPageIndex, 'dots', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [firstPageIndex, 'dots', ...middleRange, 'dots', lastPageIndex];
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [statusText, setStatusText] = useState('');
  const [copied, setCopied] = useState(false);

  // Rejection flow state — used both from the table row and the drawer.
  const [rejectTarget, setRejectTarget] = useState<Tutor | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    async function fetchTutors() {
      try {
        const data: BackendTutor[] = await getTutors();
        const reviewMap = loadStoredState<Record<number, StoredReview>>(ADMIN_STORAGE_KEYS.tutorQueue, {});
        const merged: Tutor[] = data.map((t) => {
          const review = reviewMap[t.id];
          return {
            ...t,
            status: review?.status || 'Pending',
            rejectionReason: review?.status === 'Rejected' ? review.reason : undefined,
          };
        });
        setTutors(merged);
      } catch (err: any) {
        console.error('Failed to fetch tutors:', err);
        setError('Could not load tutors. Make sure your backend is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchTutors();
  }, []);

  const filteredTutors = useMemo(() => {
    const filtered = tutors.filter((tutor) => {
      const matchesSearch =
        tutor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || tutor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort by application date using the created_at value already returned
    // by the backend — no extra column or endpoint needed.
    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return sorted;
  }, [tutors, searchQuery, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredTutors.length / pageSize));
  const visibleTutors = filteredTutors.slice((page - 1) * pageSize, page * pageSize);
  const paginationRange = useMemo(() => getPaginationRange(page, totalPages), [page, totalPages]);

  const persistReview = (tutorId: number, review: StoredReview, auditDetail: string) => {
    const reviewMap = loadStoredState<Record<number, StoredReview>>(ADMIN_STORAGE_KEYS.tutorQueue, {});
    reviewMap[tutorId] = review;
    saveStoredState(ADMIN_STORAGE_KEYS.tutorQueue, reviewMap);
    setTutors((prev) => prev.map((t) => (
      t.id === tutorId
        ? { ...t, status: review.status, rejectionReason: review.status === 'Rejected' ? review.reason : undefined }
        : t
    )));
    appendAudit('TUTOR_REVIEW', auditDetail);
  };

  // Export builds a report from whatever is currently filtered/sorted —
  // search + status + newest/oldest — same behavior and numbering as the
  // Students page export.
  const exportReport = () => {
    if (filteredTutors.length === 0) return;
    const header = ['Tutor', 'Email', 'Subjects', 'City', 'Status', 'Rejection Reason'];
    const rows = filteredTutors.map((t) => [t.full_name, t.email, t.subject, t.city, t.status, t.rejectionReason || '']);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadFile('tutors-report.csv', csv, 'text/csv;charset=utf-8;');
    appendAudit('TUTOR_QUEUE_EXPORT', `Exported ${filteredTutors.length} tutor record(s)`);
    setStatusText(`Exported ${filteredTutors.length} tutor${filteredTutors.length === 1 ? '' : 's'}.`);
  };

  const openDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setCopied(false);
  };

  const closeDetails = () => {
    setSelectedTutor(null);
  };

  // Approve — quick, no reason needed. Works from row or drawer.
  const approveTutor = (tutor: Tutor) => {
    persistReview(tutor.id, { status: 'Verified' }, `${tutor.full_name} approved`);
    setStatusText(`${tutor.full_name} approved.`);
    if (selectedTutor?.id === tutor.id) closeDetails();
  };

  // Reject — opens a structured reason picker instead of a free-text-only note.
  const startReject = (tutor: Tutor) => {
    setRejectTarget(tutor);
    setRejectReason('');
    setRejectNote('');
    setRejectError('');
  };

  const cancelReject = () => {
    setRejectTarget(null);
    setRejectReason('');
    setRejectNote('');
    setRejectError('');
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    if (!rejectReason) {
      setRejectError('Select a reason for this rejection.');
      return;
    }
    if (rejectReason === 'Other (add note below)' && !rejectNote.trim()) {
      setRejectError('Add a short note describing the reason.');
      return;
    }
    const finalReason = rejectReason === 'Other (add note below)' ? rejectNote.trim() : rejectReason;
    const auditDetail = `${rejectTarget.full_name} rejected — ${finalReason}`;
    persistReview(rejectTarget.id, { status: 'Rejected', reason: finalReason }, auditDetail);
    setStatusText(`${rejectTarget.full_name} rejected internally. No message was sent to the applicant.`);
    if (selectedTutor?.id === rejectTarget.id) closeDetails();
    cancelReject();
  };

  const copyEmail = async () => {
    if (!selectedTutor) return;
    try {
      await navigator.clipboard.writeText(selectedTutor.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available — ignore silently.
    }
  };

  const pendingCount = tutors.filter((t) => t.status === 'Pending').length;
  const verifiedCount = tutors.filter((t) => t.status === 'Verified').length;

  return (
    <div
      style={{
        display: 'grid',
        gap: 20,
        background: 'linear-gradient(160deg, #f0fdfa 0%, #eef6ff 55%, #f6f4ff 100%)',
        borderRadius: 24,
        padding: 20,
        margin: -20,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Tutor Verification</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Tutor review queue.</p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {statusText && (
        <div style={{ background: '#ecfeff', border: '1px solid #99f6e4', color: '#0f766e', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>
          {statusText}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Pending Review" value={pendingCount.toString()} accent="#f59e0b" loading={loading} />
        <StatCard title="Verified" value={verifiedCount.toString()} accent="#22c55e" loading={loading} />
        <StatCard title="Total Tutors" value={tutors.length.toString()} accent="#27c3ff" loading={loading} />
      </div>

      <div style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)', border: '1px solid #d7f2ea', borderRadius: 16, padding: 16, boxShadow: '0 8px 20px rgba(15,118,110,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 0.7fr', gap: 10 }}>
          <input
            type="text"
            placeholder="Search by tutor name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          />
          {/* Status filter stays to lifecycle states only — specific rejection
              reasons are shown per-row instead of becoming filter options. */}
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
          {/* Sort by application date — uses the created_at value already
              returned by the API, no new field or button elsewhere needed. */}
          <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value as SortOrder); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        {/* Header row matches the Students page: title left, Export Report
            button right, same teal styling and live count. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '18px 18px 0' }}>
          <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Tutor Directory</h3>
          <button
            onClick={exportReport}
            disabled={filteredTutors.length === 0}
            style={{
              borderRadius: 10,
              border: '1px solid ' + (filteredTutors.length === 0 ? '#e5e7eb' : '#0f766e'),
              background: filteredTutors.length === 0 ? '#f3f4f6' : '#0f766e',
              color: filteredTutors.length === 0 ? '#9ca3af' : '#fff',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: 13,
              cursor: filteredTutors.length === 0 ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Export Report {filteredTutors.length > 0 ? `(${filteredTutors.length})` : ''}
          </button>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>Tutor Profile</th>
                <th style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>Subjects</th>
                <th style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>City</th>
                <th style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>Status</th>
                {/* Centered over the button group below it, rather than right-aligned */}
                <th style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e', textAlign: 'center', width: 300 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center' }}><Spinner size={26} /></td></tr>
              ) : visibleTutors.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No tutors found</td></tr>
              ) : visibleTutors.map((tutor) => {
                const sc = subjectColor(tutor.subject);
                return (
                <tr
                  key={tutor.id}
                  style={{ borderTop: '1px solid #ecf4ef', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fdfb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 999, background: 'linear-gradient(135deg, #ecfeff 0%, #d7f2ea 100%)', color: '#0f766e', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{tutor.full_name?.charAt(0) || 'T'}</div>
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700 }}>{tutor.full_name}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{tutor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{tutor.subject}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#374151' }}>📍 {tutor.city}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={tutor.status} />
                    <RejectionCaption reason={tutor.rejectionReason} />
                  </td>
                  <td style={{ padding: '14px 16px', width: 300 }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'nowrap' }}>
                      <button
                        onClick={() => approveTutor(tutor)}
                        style={{ border: '1px solid #0f766e', background: '#0f766e', color: '#fff', fontWeight: 700, cursor: 'pointer', borderRadius: 8, padding: '7px 14px', fontSize: 13, whiteSpace: 'nowrap' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => startReject(tutor)}
                        style={{ border: '1px solid #fca5a5', background: '#fff1f2', color: '#be123c', fontWeight: 700, cursor: 'pointer', borderRadius: 8, padding: '7px 14px', fontSize: 13, whiteSpace: 'nowrap' }}
                      >
                        Reject
                      </button>
                      <button onClick={() => openDetails(tutor)} style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', fontWeight: 700, cursor: 'pointer', borderRadius: 8, padding: '7px 14px', fontSize: 13, whiteSpace: 'nowrap' }}>
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredTutors.length > 0 && (
          <div style={{ padding: 16, borderTop: '1px solid #ecf4ef', background: '#fafdfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280', fontSize: 13, flexWrap: 'wrap', gap: 10 }}>
            <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredTutors.length)} of {filteredTutors.length} tutors</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>

              {paginationRange.map((item, idx) =>
                item === 'dots' ? (
                  <span key={`dots-${idx}`} style={{ padding: '4px 6px', color: '#6b7280', fontSize: 13, userSelect: 'none' }}>
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    style={{
                      border: item === page ? '1px solid #0f766e' : '1px solid #99f6e4',
                      background: item === page ? '#0f766e' : '#fff',
                      borderRadius: 8,
                      padding: '4px 10px',
                      color: item === page ? '#fff' : '#0f766e',
                      cursor: 'pointer',
                      minWidth: 32,
                    }}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Details drawer ─────────────────────────────────────────────── */}
      {selectedTutor && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,22,0.5)', zIndex: 40 }} onClick={closeDetails} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 520, height: '100vh', zIndex: 50, background: 'linear-gradient(180deg, #fbfdfc 0%, #f4faf8 100%)', borderLeft: '1px solid #e5e7eb', overflowY: 'auto', boxShadow: '-12px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '18px 22px', borderBottom: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', position: 'sticky', top: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 700, marginBottom: 4 }}>TUTOR VERIFICATION &nbsp;/&nbsp; #{selectedTutor.id}</div>
                  <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 21 }}>Applicant Review</h3>
                </div>
                <button onClick={closeDetails} aria-label="Close" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, fontSize: 17, lineHeight: 1 }}>×</button>
              </div>
            </div>

            <div style={{ padding: 22, display: 'grid', gap: 18, flex: 1 }}>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #ecfeff 0%, #d7f2ea 100%)', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#0f766e', fontSize: 21, flexShrink: 0 }}>
                  {selectedTutor.full_name?.charAt(0) || 'T'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#111827', fontSize: 18, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedTutor.full_name}</div>
                  <div style={{ marginTop: 6 }}>
                    <StatusBadge status={selectedTutor.status} />
                    <RejectionCaption reason={selectedTutor.rejectionReason} />
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Contact Information</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <DetailField label="Email address" value={selectedTutor.email} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={copyEmail} title="Copy email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                      {copied ? '✓' : '⧉'}
                    </button>
                    <a href={`mailto:${selectedTutor.email}`} title="Send email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 32, height: 32, display: 'grid', placeItems: 'center', fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                      ✉
                    </a>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 12 }}>
                  <DetailField label="Phone" value={selectedTutor.phone} />
                  <DetailField label="Location" value={`📍 ${selectedTutor.city || 'Not specified'}`} />
                  <DetailField label="Address" value={selectedTutor.address} fullWidth />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Personal Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="Gender" value={selectedTutor.gender} />
                  <DetailField label="Date of Birth" value={selectedTutor.dob ? formatDate(selectedTutor.dob) : null} />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Application Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="Subject(s)" value={selectedTutor.subject} />
                  <DetailField label="Tutor ID" value={`#${String(selectedTutor.id).padStart(5, '0')}`} />
                  <DetailField label="Applied on" value={formatDate(selectedTutor.created_at)} fullWidth />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Teaching Preferences</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="Medium" value={selectedTutor.medium} />
                  <DetailField label="Level" value={selectedTutor.level} />
                  <DetailField label="Grade Range" value={selectedTutor.grade_range} />
                  <DetailField label="Class Type" value={selectedTutor.class_type} />
                  <DetailField label="Fee" value={selectedTutor.fee} fullWidth />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Qualifications</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="University" value={selectedTutor.university} />
                  <DetailField label="Degree" value={selectedTutor.degree_title} />
                  <DetailField label="Graduation Year" value={selectedTutor.graduation_year} />
                  <DetailField label="Experience" value={selectedTutor.experience} fullWidth />
                  <DetailField label="Credentials" value={selectedTutor.credentials} fullWidth />
                  <DetailField label="Additional Notes" value={selectedTutor.description} fullWidth />
                </div>
              </div>
            </div>

            <div style={{ padding: 22, borderTop: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #f8faf9 0%, #f0fdfa 100%)', position: 'sticky', bottom: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => startReject(selectedTutor)} style={{ border: '1px solid #fca5a5', background: '#fff1f2', color: '#be123c', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Reject</button>
                <button onClick={() => approveTutor(selectedTutor)} style={{ border: '1px solid #0f766e', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Approve</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Rejection reason modal ─────────────────────────────────────── */}
      {rejectTarget && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,22,0.55)', zIndex: 60 }} onClick={cancelReject} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: 440, zIndex: 70, background: '#fff', borderRadius: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', padding: 24 }}>
            <div style={{ fontSize: 12, color: '#be123c', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Reject Applicant</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#111827', fontFamily: "'Fraunces', serif" }}>{rejectTarget.full_name}</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#6b7280' }}>
              This is recorded for internal review only — the applicant will not be notified of the specific reason.
            </p>

            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    border: rejectReason === reason ? '1.5px solid #be123c' : '1px solid #e5e7eb',
                    background: rejectReason === reason ? '#fff1f2' : '#fff',
                    borderRadius: 10, cursor: 'pointer', fontSize: 14, color: '#111827',
                  }}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReason === reason}
                    onChange={() => { setRejectReason(reason); setRejectError(''); }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {rejectReason === 'Other (add note below)' && (
              <textarea
                value={rejectNote}
                onChange={(e) => { setRejectNote(e.target.value); setRejectError(''); }}
                placeholder="Briefly describe the reason..."
                rows={3}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 10, padding: 12, resize: 'vertical', background: '#fff', color: '#111827', fontSize: 14, marginBottom: 14 }}
              />
            )}

            {rejectError && <div style={{ color: '#be123c', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{rejectError}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={cancelReject} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '11px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={confirmReject} style={{ border: '1px solid #be123c', background: '#be123c', color: '#fff', borderRadius: 10, padding: '11px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Confirm Rejection</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
