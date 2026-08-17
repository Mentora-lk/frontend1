'use client';
import { useState, useMemo, useEffect } from 'react';
import { getSessions } from '@/services/adminApi';
import Spinner from '@/components/ui/Spinner';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type SortOrder = 'newest' | 'oldest';

// Same logic as the Students page: Grade 11 and O/L represent the same
// level, so they're shown and filtered as a single "O/L" entry. Some grades
// also carry an intake-year suffix, e.g. "Grade 12 Year 1" / "Grade 12 Year
// 2" — those are the same grade, just a different intake, so the suffix is
// stripped and both fold into "Grade 12".
function normalizeGradeLabel(grade?: string | null): string | null {
  if (!grade) return grade ?? null;
  let g = grade.trim();
  g = g.replace(/\s*year\s*\d+\s*$/i, '').trim();
  const upper = g.toUpperCase();
  if (upper === 'GRADE 11' || upper === 'GRADE11') return 'O/L';
  return g;
}

// Same ranking as the Students page, so the Grade dropdown reads
// Grade 1 → Grade 13 → O/L → A/L instead of raw DB order.
function gradeSortValue(grade?: string | null): number {
  if (!grade) return 999;
  const g = grade.trim().toUpperCase();
  if (g === 'O/L') return 11.5;
  if (g === 'A/L') return 13.5;
  const numMatch = g.match(/\d+(\.\d+)?/);
  if (numMatch) return parseFloat(numMatch[0]);
  return 500;
}

// Sessions don't always carry a created_at field from the backend — fall
// back to the numeric id (higher id = created later) so Newest/Oldest still
// works even when the date isn't present.
function sessionTimestamp(s: any): number {
  if (s.created_at) {
    const t = new Date(s.created_at).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return typeof s.id === 'number' ? s.id : 0;
}

function StatCard({ title, value, detail, accent, loading }: { title: string; value: string; detail: string; accent: string; loading: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
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
                          { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
      {status || 'Unknown'}
    </span>
  );
}

// Same labeled field used in the Students / Tutors detail drawers, kept
// here so the Session details drawer matches them visually.
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

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [modeFilter, setMode]   = useState('All Modes');
  const [statusFilter, setStatus] = useState('All Status');
  const [dayFilter, setDayFilter] = useState('All Days');
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [toast, setToast]       = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

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

  const filtered = useMemo(() => {
    const result = sessions.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        s.student?.toLowerCase().includes(q) ||
        s.school?.toLowerCase().includes(q) ||
        s.grade?.toLowerCase().includes(q);
      const matchMode = modeFilter === 'All Modes' || s.mode === modeFilter;
      const matchStatus = statusFilter === 'All Status' || s.status === statusFilter;
      const matchDay = dayFilter === 'All Days' || s.selected_day === dayFilter;
      const matchGrade = gradeFilter === 'All Grades' || normalizeGradeLabel(s.grade) === gradeFilter;
      return matchSearch && matchMode && matchStatus && matchDay && matchGrade;
    });

    // Newest/oldest first — same sort pattern used on the Students and
    // Tutors pages.
    return [...result].sort((a, b) => {
      const timeA = sessionTimestamp(a);
      const timeB = sessionTimestamp(b);
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [sessions, search, modeFilter, statusFilter, dayFilter, gradeFilter, sortOrder]);

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

  // Grade Level filter, deduped and ordered the same way as the Students
  // page (Grade 1 → 13 → O/L → A/L, with Grade 11 folded into O/L).
  const uniqueGrades = useMemo(() => {
    const levels = Array.from(
      new Set(sessions.map((s) => normalizeGradeLabel(s.grade)).filter(Boolean)),
    ) as string[];
    return levels.sort((a, b) => gradeSortValue(a) - gradeSortValue(b));
  }, [sessions]);

  const handleExport = () => {
    if (filtered.length === 0) return;
    const header = ['ID', 'Student', 'Mode', 'Day', 'Time', 'Status', 'Grade', 'School', 'Sessions Attended'];
    const rows = filtered.map((s) => [s.id, s.student, s.mode, s.selected_day, s.selected_time, s.status, s.grade, s.school, s.sessions_attended]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sessions-report.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} session${filtered.length === 1 ? '' : 's'}.`);
  };

  const openDetails = (session: any) => setSelectedSession(session);
  const closeDetails = () => setSelectedSession(null);

  const confirmedCount = sessions.filter((s) => s.status === 'approved').length;
  const pendingCount = sessions.filter((s) => s.status === 'requested').length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleSessions = filtered.slice((page - 1) * pageSize, page * pageSize);
  const paginationRange = useMemo(() => getPaginationRange(page, totalPages), [page, totalPages]);

  const resetFilters = () => {
    setSearch(''); setMode('All Modes'); setStatus('All Status'); setDayFilter('All Days'); setGradeFilter('All Grades'); setPage(1);
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 22,
        background: 'linear-gradient(160deg, #f0fdfa 0%, #eef6ff 55%, #f6f4ff 100%)',
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
        <StatCard title="Confirmed"       value={confirmedCount.toString()}  detail="Ready to go"     accent="#22c55e" loading={loading} />
        <StatCard title="Pending"         value={pendingCount.toString()}    detail="Needs attention" accent="#f59e0b" loading={loading} />
        <StatCard title="Showing"         value={filtered.length.toString()} detail="After filters"   accent="#27c3ff" loading={loading} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Session Queue</h3>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Live data from your backend</div>
          </div>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            style={{
              borderRadius: 10,
              border: '1px solid ' + (filtered.length === 0 ? '#e5e7eb' : '#0f766e'),
              background: filtered.length === 0 ? '#f3f4f6' : '#0f766e',
              color: filtered.length === 0 ? '#9ca3af' : '#fff',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: 13,
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Export Report {filtered.length > 0 ? `(${filtered.length})` : ''}
          </button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)', border: '1px solid #d7f2ea', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.6fr 0.6fr 0.6fr 0.6fr 0.6fr', gap: 10 }}>
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
            <select value={gradeFilter} onChange={e => { setGradeFilter(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option value="All Grades">Grade: All</option>
              {uniqueGrades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={sortOrder} onChange={e => { setSortOrder(e.target.value as SortOrder); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', textAlign: 'left' }}>
                {['Student', 'Grade', 'School', 'Day', 'Time', 'Mode', 'Status', 'Attended', ''].map(h => (
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fdfb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px', color: '#111827', fontWeight: 700 }}>{session.student}</td>
                  <td style={{ padding: '14px' }}>
                    {session.grade ? (
                      <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#ecfeff', color: '#0f766e', border: '1px solid #99f6e4', fontWeight: 600 }}>
                        {normalizeGradeLabel(session.grade)}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.school || '—'}</td>
                  <td style={{ padding: '14px' }}>
                    {session.selected_day ? (
                      <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', fontWeight: 600 }}>
                        {session.selected_day}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.selected_time || '—'}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.mode || '—'}</td>
                  <td style={{ padding: '14px' }}><StatusBadge status={session.status} /></td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.sessions_attended ?? 0}</td>
                  <td style={{ padding: '14px' }}>
                    <button
                      onClick={() => openDetails(session)}
                      style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', fontWeight: 700, cursor: 'pointer', borderRadius: 8, padding: '7px 14px', fontSize: 13, whiteSpace: 'nowrap' }}
                    >
                      View Details
                    </button>
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

      {/* ── Details drawer ─────────────────────────────────────────────── */}
      {selectedSession && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,22,0.5)', zIndex: 40 }} onClick={closeDetails} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 480, height: '100vh', zIndex: 50, background: 'linear-gradient(180deg, #fbfdfc 0%, #f4faf8 100%)', borderLeft: '1px solid #e5e7eb', overflowY: 'auto', boxShadow: '-12px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '18px 22px', borderBottom: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', position: 'sticky', top: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 700, marginBottom: 4 }}>SESSION &nbsp;/&nbsp; #{selectedSession.id}</div>
                  <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 21 }}>Session Details</h3>
                </div>
                <button onClick={closeDetails} aria-label="Close" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, fontSize: 17, lineHeight: 1 }}>×</button>
              </div>
            </div>

            <div style={{ padding: 22, display: 'grid', gap: 18, flex: 1 }}>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #ecfeff 0%, #d7f2ea 100%)', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#0f766e', fontSize: 21, flexShrink: 0 }}>
                  {selectedSession.student?.charAt(0) || 'S'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#111827', fontSize: 18, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedSession.student || 'Unnamed student'}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <StatusBadge status={selectedSession.status} />
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Student & School</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="Grade level" value={normalizeGradeLabel(selectedSession.grade)} />
                  <DetailField label="School / Institute" value={selectedSession.school} />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Schedule</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="Day" value={selectedSession.selected_day} />
                  <DetailField label="Time" value={selectedSession.selected_time} />
                  <DetailField label="Mode" value={selectedSession.mode} />
                  <DetailField label="Sessions attended" value={selectedSession.sessions_attended ?? 0} />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Status</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="Session ID" value={`#${String(selectedSession.id).padStart(5, '0')}`} />
                  <DetailField label="Current status" value={selectedSession.status} />
                </div>
              </div>
            </div>

            <div style={{ padding: 22, borderTop: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #f8faf9 0%, #f0fdfa 100%)', position: 'sticky', bottom: 0 }}>
              <button
                onClick={closeDetails}
                style={{ width: '100%', border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
