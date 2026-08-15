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

  const updateTutorStatus = (nextStatus: Tutor['status']) => {
    if (!selectedTutor) return;
    persistStatus(selectedTutor.id, nextStatus);
    appendAudit('TUTOR_REVIEW', `${selectedTutor.full_name} marked as ${nextStatus}${note ? ` (${note})` : ''}`);
    setStatusText(`${selectedTutor.full_name} updated to ${nextStatus}.`);
    setNote('');
    setSelectedTutor(null);
  };

  const pendingCount = tutors.filter((t) => t.status === 'Pending').length;
  const verifiedCount = tutors.filter((t) => t.status === 'Verified').length;

  return (
    <div style={{ display: 'grid', gap: 20 }}>
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

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
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
              <tr style={{ background: '#f0fdfa', textAlign: 'left' }}>
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
                <tr key={tutor.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 999, background: '#ecfeff', color: '#0f766e', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{tutor.full_name?.charAt(0) || 'T'}</div>
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
                    <button onClick={() => setSelectedTutor(tutor)} style={{ border: 'none', background: 'none', color: '#0f766e', fontWeight: 700, cursor: 'pointer' }}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredTutors.length > 0 && (
          <div style={{ padding: 16, borderTop: '1px solid #ecf4ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280', fontSize: 13, flexWrap: 'wrap', gap: 10 }}>
            <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredTutors.length)} of {filteredTutors.length} tutors</span>
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

      {selectedTutor && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} onClick={() => setSelectedTutor(null)} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 440, height: '100vh', zIndex: 50, background: '#fff', borderLeft: '1px solid #e5e7eb', overflowY: 'auto', padding: 20, boxShadow: '-8px 0 30px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif" }}>Verification Detail</h3>
              <button onClick={() => setSelectedTutor(null)} style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #ecf4ef', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ecfeff', display: 'grid', placeItems: 'center', fontWeight: 800, color: '#0f766e', fontSize: 20 }}>
                {selectedTutor.full_name?.charAt(0) || 'T'}
              </div>
              <div>
                <div style={{ color: '#111827', fontSize: 18, fontWeight: 800 }}>{selectedTutor.full_name}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{selectedTutor.email}</div>
                <div style={{ marginTop: 8 }}><StatusBadge status={selectedTutor.status} /></div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 8px', color: '#374151', fontWeight: 700, fontSize: 13 }}>Subjects</p>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#f8faf9', color: '#111827' }}>
                {selectedTutor.subject || 'Not specified'}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 8px', color: '#374151', fontWeight: 700, fontSize: 13 }}>City</p>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#f8faf9', color: '#111827' }}>
                {selectedTutor.city || 'Not specified'}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 8px', color: '#374151', fontWeight: 700, fontSize: 13 }}>Internal Notes (Optional)</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note or reason for rejection..." rows={4} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 12, padding: 12, resize: 'vertical', background: '#fff', color: '#111827' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => updateTutorStatus('Missing Docs')} style={{ border: '1px solid #fca5a5', background: '#fff1f2', color: '#be123c', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
              <button onClick={() => updateTutorStatus('Verified')} style={{ border: '1px solid #0f766e', background: '#0f766e', color: '#fff', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
