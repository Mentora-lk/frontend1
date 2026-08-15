'use client';
import { useState, useMemo, useEffect } from 'react';
import { getSessions, updateSessionStatus } from '@/services/adminApi';
import Spinner from '@/components/ui/Spinner';

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

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [modeFilter, setMode]   = useState('All Modes');
  const [statusFilter, setStatus] = useState('All Status');
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
    return matchSearch && matchMode && matchStatus;
  }), [sessions, search, modeFilter, statusFilter]);

  const uniqueModes = Array.from(new Set(sessions.map((s) => s.mode).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(sessions.map((s) => s.status).filter(Boolean)));

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

  return (
    <div style={{ display: 'grid', gap: 22 }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.7fr 0.7fr', gap: 10, marginBottom: 16 }}>
          <input type="text" placeholder="Search by student, school or grade..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }} />
          <select value={modeFilter} onChange={e => { setMode(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option>All Modes</option>
            {uniqueModes.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option>All Status</option>
            {uniqueStatuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f0fdfa', textAlign: 'left' }}>
                {['Student', 'Grade', 'School', 'Day', 'Time', 'Mode', 'Status', 'Attended', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center' }}><Spinner size={26} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>No sessions match your filters.</td></tr>
              ) : visibleSessions.map(session => (
                <tr key={session.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                  <td style={{ padding: '14px', color: '#111827', fontWeight: 700 }}>{session.student}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.grade || '—'}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.school || '—'}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{session.selected_day || '—'}</td>
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: 'pointer' }}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} style={{ border: n === page ? '1px solid #0f766e' : '1px solid #99f6e4', background: n === page ? '#0f766e' : '#fff', borderRadius: 8, padding: '4px 10px', color: n === page ? '#fff' : '#0f766e', cursor: 'pointer' }}>{n}</button>
              ))}
              <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
