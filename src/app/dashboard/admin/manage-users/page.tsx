'use client';

import { useMemo, useState } from 'react';
import { tutorVerifications } from '../../../../data/adminData';
import { ADMIN_STORAGE_KEYS, appendAudit, downloadFile, loadStoredState, saveStoredState } from '../utils/operations';

type Tutor = (typeof tutorVerifications)[0] & { status: 'Pending' | 'Verified' | 'Missing Docs' };

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

function StatCard({ title, value, accent, trend }: { title: string; value: string; accent: string; trend: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
        <span style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>{trend}</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>(() => loadStoredState(ADMIN_STORAGE_KEYS.tutorQueue, tutorVerifications as Tutor[]));
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [note, setNote] = useState('');
  const [statusText, setStatusText] = useState('');

  const filteredTutors = useMemo(() => tutors.filter((tutor) => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) || tutor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || tutor.status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || tutor.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  }), [tutors, searchQuery, statusFilter, subjectFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTutors.length / pageSize));
  const visibleTutors = filteredTutors.slice((page - 1) * pageSize, page * pageSize);

  const persistTutors = (next: Tutor[]) => {
    setTutors(next);
    saveStoredState(ADMIN_STORAGE_KEYS.tutorQueue, next);
  };

  const exportQueue = () => {
    const header = ['Tutor', 'Email', 'Subject', 'Location', 'Status', 'Applied Date'];
    const rows = filteredTutors.map((tutor) => [tutor.name, tutor.email, tutor.subject, tutor.location, tutor.status, tutor.date]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    downloadFile('tutor-review-queue.csv', csv, 'text/csv;charset=utf-8;');
    appendAudit('TUTOR_QUEUE_EXPORT', `Exported ${filteredTutors.length} tutor records`);
    setStatusText('Queue exported.');
  };

  const updateTutorStatus = (nextStatus: Tutor['status']) => {
    if (!selectedTutor) return;
    const updated = tutors.map((item) => (item.id === selectedTutor.id ? { ...item, status: nextStatus } : item));
    persistTutors(updated);
    appendAudit('TUTOR_REVIEW', `${selectedTutor.name} marked as ${nextStatus}${note ? ` (${note})` : ''}`);
    setStatusText(`${selectedTutor.name} updated to ${nextStatus}.`);
    setNote('');
    setSelectedTutor(null);
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Tutor Verification</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Tutor review queue.</p>
      </div>

      {statusText && (
        <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>
          {statusText}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Pending Review" value="24" trend="+5% from yesterday" accent="#f59e0b" />
        <StatCard title="Verified Today" value="12" trend="-2% from yesterday" accent="#22c55e" />
        <StatCard title="Total Tutors" value="1,402" trend="+1% growth" accent="#27c3ff" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 0.8fr auto', gap: 10 }}>
          <input
            type="text"
            placeholder="Search by tutor name, email or NIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option value="All">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Missing Docs">Missing Docs</option>
          </select>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
            <option value="All">Subject: All</option>
            <option value="Science">Subject: Science</option>
            <option value="Maths">Subject: Maths</option>
            <option value="IT">Subject: IT</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setPage(1); }} style={{ borderRadius: 12, border: '1px solid #bbf7d0', background: '#ecfdf5', color: '#047857', padding: '0 14px', cursor: 'pointer' }}>Apply</button>
            <button onClick={exportQueue} style={{ borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#374151', padding: '0 14px', cursor: 'pointer' }}>Export</button>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f0fdf4', textAlign: 'left' }}>
                {['Tutor Profile', 'Subjects', 'Location', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleTutors.map((tutor) => (
                <tr key={tutor.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 999, background: '#ecfdf5', color: '#166534', display: 'grid', placeItems: 'center', fontWeight: 700 }}>{tutor.name.charAt(0)}</div>
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700 }}>{tutor.name}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{tutor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#ecfdf5', color: '#047857', border: '1px solid #bbf7d0' }}>{tutor.subject}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#374151' }}>📍 {tutor.location}</td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={tutor.status} /></td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={() => setSelectedTutor(tutor)} style={{ border: 'none', background: 'none', color: '#10B981', fontWeight: 700, cursor: 'pointer' }}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #ecf4ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6b7280', fontSize: 13 }}>
          <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredTutors.length)} of {filteredTutors.length} applications</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} style={{ border: '1px solid #bbf7d0', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#166534', cursor: 'pointer' }}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} style={{ border: n === page ? '1px solid #10B981' : '1px solid #bbf7d0', background: n === page ? '#10B981' : '#fff', borderRadius: 8, padding: '4px 10px', color: n === page ? '#fff' : '#166534', cursor: 'pointer' }}>{n}</button>
            ))}
            <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} style={{ border: '1px solid #bbf7d0', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#166534', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      </div>

      {selectedTutor && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} onClick={() => setSelectedTutor(null)} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 440, height: '100vh', zIndex: 50, background: '#fff', borderLeft: '1px solid #dfeee8', overflowY: 'auto', padding: 20, boxShadow: '-8px 0 30px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, color: '#111827' }}>Verification Detail</h3>
              <button onClick={() => setSelectedTutor(null)} style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #ecf4ef', paddingBottom: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#ecfdf5' }} />
              <div>
                <div style={{ color: '#111827', fontSize: 18, fontWeight: 800 }}>{selectedTutor.name}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Applied: {selectedTutor.date}</div>
                <div style={{ marginTop: 8 }}><StatusBadge status={selectedTutor.status} /></div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 8px', color: '#374151', fontWeight: 700, fontSize: 13 }}>Identity Verification</p>
              <div style={{ borderRadius: 12, height: 180, background: '#0f172a', border: '1px solid rgba(148,163,184,0.08)' }} />
              <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>NIC Front</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 8px', color: '#374151', fontWeight: 700, fontSize: 13 }}>Academic Credentials</p>
              <div style={{ border: '1px solid #dfeee8', borderRadius: 12, padding: 14, background: '#f8faf9', color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedTutor.credentials || 'No document'}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>University of Colombo • 2.4 MB</div>
                </div>
                <span style={{ color: '#10B981' }}>👁</span>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 8px', color: '#374151', fontWeight: 700, fontSize: 13 }}>Internal Notes (Optional)</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note or reason for rejection..." rows={4} style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 12, padding: 12, resize: 'vertical', background: '#fff', color: '#111827' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => updateTutorStatus('Missing Docs')} style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#be123c', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
              <button onClick={() => updateTutorStatus('Verified')} style={{ border: '1px solid #10B981', background: '#10B981', color: '#fff', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
