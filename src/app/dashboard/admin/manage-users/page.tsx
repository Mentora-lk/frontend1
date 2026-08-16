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
};

type Tutor = BackendTutor & { status: 'Pending' | 'Verified' | 'Missing Docs' };

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
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [note, setNote] = useState('');
  const [statusText, setStatusText] = useState('');
  const [copied, setCopied] = useState(false);
  const [pendingAction, setPendingAction] = useState<'Verified' | 'Missing Docs' | null>(null);
  const [noteError, setNoteError] = useState('');

  useEffect(() => {
    async function fetchTutors() {
      try {
        const data: BackendTutor[] = await getTutors();
        const statusMap = loadStoredState<Record<number, Tutor['status']>>(ADMIN_STORAGE_KEYS.tutorQueue, {});
        const merged: Tutor[] = data.map((t) => ({
          ...t,
          status: statusMap[t.id] || 'Pending',
        }));
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

  const filteredTutors = useMemo(() => tutors.filter((tutor) => {
    const matchesSearch =
      tutor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || tutor.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [tutors, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTutors.length / pageSize));
  const visibleTutors = filteredTutors.slice((page - 1) * pageSize, page * pageSize);
  const paginationRange = useMemo(() => getPaginationRange(page, totalPages), [page, totalPages]);

  const persistStatus = (tutorId: number, status: Tutor['status']) => {
    const statusMap = loadStoredState<Record<number, Tutor['status']>>(ADMIN_STORAGE_KEYS.tutorQueue, {});
    statusMap[tutorId] = status;
    saveStoredState(ADMIN_STORAGE_KEYS.tutorQueue, statusMap);
    setTutors((prev) => prev.map((t) => (t.id === tutorId ? { ...t, status } : t)));
  };

  const exportQueue = () => {
    const header = ['Tutor', 'Email', 'Subjects', 'City', 'Status'];
    const rows = filteredTutors.map((t) => [t.full_name, t.email, t.subject, t.city, t.status]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadFile('tutor-review-queue.csv', csv, 'text/csv;charset=utf-8;');
    appendAudit('TUTOR_QUEUE_EXPORT', `Exported ${filteredTutors.length} tutor records`);
    setStatusText('Queue exported.');
  };

  const openDetails = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setNote('');
    setNoteError('');
    setPendingAction(null);
    setCopied(false);
  };

  const closeDetails = () => {
    setSelectedTutor(null);
    setNote('');
    setNoteError('');
    setPendingAction(null);
  };

  const requestAction = (action: 'Verified' | 'Missing Docs') => {
    if (action === 'Missing Docs' && !note.trim()) {
      setNoteError('A reason is required before rejecting a tutor.');
      return;
    }
    setNoteError('');
    setPendingAction(action);
  };

  const confirmAction = () => {
    if (!selectedTutor || !pendingAction) return;
    persistStatus(selectedTutor.id, pendingAction);
    appendAudit('TUTOR_REVIEW', `${selectedTutor.full_name} marked as ${pendingAction}${note ? ` (${note})` : ''}`);
    setStatusText(`${selectedTutor.full_name} updated to ${pendingAction}.`);
    closeDetails();
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr auto', gap: 10 }}>
          <input
            type="text"
            placeholder="Search by tutor name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Missing Docs">Missing Docs</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportQueue} style={{ borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#374151', padding: '0 14px', cursor: 'pointer' }}>Export</button>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', textAlign: 'left' }}>
                {['Tutor Profile', 'Subjects', 'City', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center' }}><Spinner size={26} /></td></tr>
              ) : visibleTutors.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No tutors found</td></tr>
              ) : visibleTutors.map((tutor) => (
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
                    <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#ecfeff', color: '#0f766e', border: '1px solid #99f6e4' }}>{tutor.subject}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#374151' }}>📍 {tutor.city}</td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={tutor.status} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={() => openDetails(tutor)} style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', fontWeight: 700, cursor: 'pointer', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>View Details</button>
                  </td>
                </tr>
              ))}
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

      {selectedTutor && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,22,0.5)', zIndex: 40 }} onClick={closeDetails} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 460, height: '100vh', zIndex: 50, background: 'linear-gradient(180deg, #fbfdfc 0%, #f4faf8 100%)', borderLeft: '1px solid #e5e7eb', overflowY: 'auto', boxShadow: '-12px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '18px 20px', borderBottom: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', position: 'sticky', top: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 700, marginBottom: 4 }}>TUTOR VERIFICATION &nbsp;/&nbsp; #{selectedTutor.id}</div>
                  <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 20 }}>Applicant Review</h3>
                </div>
                <button onClick={closeDetails} aria-label="Close" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            </div>

            <div style={{ padding: 20, display: 'grid', gap: 18, flex: 1 }}>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: 'linear-gradient(135deg, #ecfeff 0%, #d7f2ea 100%)', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#0f766e', fontSize: 20, flexShrink: 0 }}>
                  {selectedTutor.full_name?.charAt(0) || 'T'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#111827', fontSize: 17, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedTutor.full_name}</div>
                  <div style={{ marginTop: 6 }}><StatusBadge status={selectedTutor.status} /></div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Contact Information</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Email address</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>{selectedTutor.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={copyEmail} title="Copy email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 12, color: '#374151' }}>
                      {copied ? '✓' : '⧉'}
                    </button>
                    <a href={`mailto:${selectedTutor.email}`} title="Send email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 30, height: 30, display: 'grid', placeItems: 'center', fontSize: 12, color: '#374151', textDecoration: 'none' }}>
                      ✉
                    </a>
                  </div>
                </div>

                <div style={{ padding: '10px 0 0' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Location</div>
                  <div style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>📍 {selectedTutor.city || 'Not specified'}</div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Application Details</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Subject(s)</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginTop: 2 }}>{selectedTutor.subject || 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Tutor ID</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginTop: 2, fontFamily: 'monospace' }}>#{String(selectedTutor.id).padStart(5, '0')}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Applied on</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginTop: 2 }}>{formatDate(selectedTutor.created_at)}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Reviewer Notes</div>
                <textarea
                  value={note}
                  onChange={(e) => { setNote(e.target.value); if (noteError) setNoteError(''); }}
                  placeholder="Add context for this decision (required if rejecting)..."
                  rows={4}
                  style={{ width: '100%', border: noteError ? '1px solid #fca5a5' : '1px solid #d1d5db', borderRadius: 10, padding: 12, resize: 'vertical', background: '#fff', color: '#111827', fontSize: 13 }}
                />
                {noteError && <div style={{ color: '#be123c', fontSize: 12, marginTop: 6, fontWeight: 600 }}>{noteError}</div>}
              </div>
            </div>

            <div style={{ padding: 20, borderTop: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #f8faf9 0%, #f0fdfa 100%)', position: 'sticky', bottom: 0 }}>
              {!pendingAction ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => requestAction('Missing Docs')} style={{ border: '1px solid #fca5a5', background: '#fff1f2', color: '#be123c', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                  <button onClick={() => requestAction('Verified')} style={{ border: '1px solid #0f766e', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                </div>
              ) : (
                <div style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 13, color: '#92400e', fontWeight: 600, marginBottom: 10 }}>
                    Confirm: mark <strong>{selectedTutor.full_name}</strong> as <strong>{pendingAction}</strong>? This action is logged to the audit trail.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button onClick={() => setPendingAction(null)} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '10px 0', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={confirmAction} style={{ border: '1px solid #0f766e', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '10px 0', fontWeight: 700, cursor: 'pointer' }}>Confirm</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}