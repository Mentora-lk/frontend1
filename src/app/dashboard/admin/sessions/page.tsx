'use client';
import { useState, useMemo, useEffect } from 'react';
import { getSessions, updateSessionStatus } from '@/services/adminApi';
import Spinner from '@/components/ui/Spinner';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function StatCard({ title, value, detail, accent, loading }: { title: string; value: string; detail: string; accent: string; loading: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
        <span style={{ color: '#0f766e', fontSize: 12, fontWeight: 700 }}>Status</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center' }}>
        {loading ? <Spinner size={22} /> : value}
      </div>
      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const palette =
    s === 'approved' || s === 'active' ? { bg: '#ecfeff', color: '#0f766e', border: '#99f6e4' } :
    s === 'requested' || s === 'pending' ? { bg: '#fef3c7', color: '#b45309', border: '#fde68a' } :
    s === 'cancelled' || s === 'rejected' ? { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' } :
                          { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
      {status || 'Unknown'}
    </span>
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

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [modeFilter, setMode]   = useState('All Modes');
  const [statusFilter, setStatus] = useState('All Status');
  const [dayFilter, setDayFilter] = useState('All Days');
  const [toast, setToast]       = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    async function fetchSessions() {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (err: any) {
        console.error('Failed to fetch sessions:', err);
        setError('Could not load sessions. Make sure your backend is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const filtered = useMemo(() => sessions.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.student?.toLowerCase().includes(q) ||
      s.school?.toLowerCase().includes(q) ||
      s.grade?.toLowerCase().includes(q);
    const matchMode = modeFilter === 'All Modes' || s.mode === modeFilter;
    const matchStatus = statusFilter === 'All Status' || s.status === statusFilter;
    const matchDay = dayFilter === 'All Days' || s.selected_day === dayFilter;
    return matchSearch && matchMode && matchStatus && matchDay;
  }), [sessions, search, modeFilter, statusFilter, dayFilter]);

  const uniqueModes = Array.from(new Set(sessions.map((s) => s.mode).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(sessions.map((s) => s.status).filter(Boolean)));

  // Only show days that actually appear in the data, ordered Monday → Sunday rather than
  // whatever order they happen to show up in the backend response.
  const uniqueDays = useMemo(() => {
    const present = new Set(sessions.map((s) => s.selected_day).filter(Boolean));
    const ordered = DAY_ORDER.filter((d) => present.has(d));
    const extras = Array.from(present).filter((d) => !DAY_ORDER.includes(d));
    return [...ordered, ...extras];
  }, [sessions]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateSessionStatus(id, newStatus);
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)));
      showToast(`✅ Session updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update session status:', err);
      showToast('❌ Failed to update session. Please try again.');
    }
  };

  const handleExport = () => {
    const header = ['ID', 'Student', 'Mode', 'Day', 'Time', 'Status', 'Grade', 'School', 'Sessions Attended'];
    const rows = filtered.map((s) => [s.id, s.student, s.mode, s.selected_day, s.selected_time, s.status, s.grade, s.school, s.sessions_attended]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sessions.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Schedule exported!');
  };

  const confirmedCount = sessions.filter((s) => s.status === 'approved').length;
  const pendingCount = sessions.filter((s) => s.status === 'requested').length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleSessions = filtered.slice((page - 1) * pageSize, page * pageSize);
  const paginationRange = useMemo(() => getPaginationRange(page, totalPages), [page, totalPages]);

  const resetFilters = () => {
    setSearch(''); setMode('All Modes'); setStatus('All Status'); setDayFilter('All Days'); setPage(1);
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 22,
        background: 'linear-gradient(160deg, #f6f4ff 0%, #eef6ff 45%, #f0fdfa 100%)',
        borderRadius: 24,
        padding: 20,
        margin: -20,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Sessions</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Session schedule overview, from real enrollment data.</p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {toast && <div style={{ background: '#ecfeff', border: '1px solid #99f6e4', color: '#0f766e', borderRadius: 12, padding: '10px 16px', fontWeight: 600, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Sessions"  value={sessions.length.toString()} detail="All enrollments" accent="#0f766e" loading={loading} />
        <StatCard title="Confirmed"       value={confirmedCount.toString()}  detail="Ready to go"     accent="#0f766e" loading={loading} />
        <StatCard title="Pending"         value={pendingCount.toString()}    detail="Needs attention" accent="#1d4ed8" loading={loading} />
        <StatCard title="Showing"         value={filtered.length.toString()} detail="After filters"   accent="#7c3aed" loading={loading} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Session Queue</h3>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Live data from your backend</div>
          </div>
          <button onClick={handleExport} style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#111827', borderRadius: 12, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>📥 Export</button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f6f4ff 0%, #eef6ff 100%)', border: '1px solid #e5e0ff', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.65fr 0.65fr 0.65fr', gap: 10 }}>
            <input type="text" placeholder="Search by student, school or grade..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }} />
            <select value={dayFilter} onChange={e => { setDayFilter(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option value="All Days">Day: All</option>
              {uniqueDays.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={modeFilter} onChange={e => { setMode(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Modes</option>
              {uniqueModes.map((m) => <option key={m}>{m}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Status</option>
              {uniqueStatuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #f6f4ff 0%, #f0fdfa 100%)', textAlign: 'left' }}>
                {['Student', 'Grade', 'School', 'Day', 'Time', 'Mode', 'Status', 'Attended', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center' }}><Spinner size={26} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ color: '#111827', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No sessions match your filters</div>
                    <div style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>Try a different day, mode, or status — or clear your filters.</div>
                    <button onClick={resetFilters} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Reset Filters</button>
                  </td>
                </tr>
              ) : visibleSessions.map(session => (
                <tr
                  key={session.id}
                  style={{ borderTop: '1px solid #ecf4ef', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#faf9ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px', color: '#111827', fontWeight: 700 }}>{session.student}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.grade || '—'}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.school || '—'}</td>
                  <td style={{ padding: '14px' }}>
                    {session.selected_day ? (
                      <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#f6f4ff', color: '#7c3aed', border: '1px solid #e5d9ff', fontWeight: 600 }}>
                        {session.selected_day}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.selected_time || '—'}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.mode || '—'}</td>
                  <td style={{ padding: '14px' }}><StatusBadge status={session.status} /></td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.sessions_attended ?? 0}</td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'approved')}
                        disabled={session.status === 'approved'}
                        style={{ border: 'none', background: session.status === 'approved' ? '#e5e7eb' : '#0f766e', color: session.status === 'approved' ? '#9ca3af' : '#fff', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: session.status === 'approved' ? 'not-allowed' : 'pointer' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'cancelled')}
                        disabled={session.status === 'cancelled'}
                        style={{ border: '1px solid #fca5a5', background: '#fff', color: session.status === 'cancelled' ? '#9ca3af' : '#be123c', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: session.status === 'cancelled' ? 'not-allowed' : 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ padding: '16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280', fontSize: 13, flexWrap: 'wrap', gap: 10 }}>
            <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} sessions</span>
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
    </div>
  );
}