'use client';
import { useState, useMemo } from 'react';

const allSessions = [
  { id: 'SS-401', tutor: 'Amal Perera',        student: 'Aarav Perera',     subject: 'A/L Physics',        time: 'Today · 4:30 PM',     mode: 'Online',    status: 'Confirmed',   fee: 'LKR 3,500' },
  { id: 'SS-402', tutor: 'Sajith Silva',        student: 'Nimasha Silva',    subject: 'OL Maths',           time: 'Today · 6:00 PM',     mode: 'In person', status: 'Pending',     fee: 'LKR 2,250' },
  { id: 'SS-403', tutor: 'Madhavi Jayasuriya',  student: 'Rashmi Fernando',  subject: 'English Literature', time: 'Tomorrow · 9:00 AM',  mode: 'Online',    status: 'Confirmed',   fee: 'LKR 2,800' },
  { id: 'SS-404', tutor: 'Nimal Fonseka',       student: 'Hirun Jayasinghe', subject: 'A/L Chemistry',      time: 'Tomorrow · 1:30 PM',  mode: 'Hybrid',    status: 'Rescheduled', fee: 'LKR 3,200' },
  { id: 'SS-405', tutor: 'Sani Edirisinghe',    student: 'Sanuki Bandara',   subject: 'Grade 9 Science',    time: 'Fri · 3:00 PM',       mode: 'Online',    status: 'Confirmed',   fee: 'LKR 1,800' },
];

const upcoming = [
  { day: 'Today',    total: 16, peak: '4:00 PM' },
  { day: 'Tomorrow', total: 21, peak: '7:00 PM' },
  { day: 'Friday',   total: 18, peak: '5:30 PM' },
];

function StatCard({ title, value, detail, accent }: { title: string; value: string; detail: string; accent: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
        <span style={{ color: '#0f766e', fontSize: 12, fontWeight: 700 }}>Status</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === 'Confirmed'   ? { bg: '#ecfeff', color: '#0f766e', border: '#99f6e4' } :
    status === 'Pending'     ? { bg: '#fef3c7', color: '#b45309', border: '#fde68a' } :
                               { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
      {status}
    </span>
  );
}

export default function AdminSessionsPage() {
  const [search, setSearch]       = useState('');
  const [modeFilter, setMode]     = useState('All Modes');
  const [statusFilter, setStatus] = useState('All Status');
  const [sessions, setSessions]   = useState(allSessions);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSession, setNewSession]   = useState({ tutor: '', student: '', subject: '', time: '', mode: 'Online', fee: '' });
  const [toast, setToast]             = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = useMemo(() => sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.tutor.toLowerCase().includes(q) || s.student.toLowerCase().includes(q) || s.subject.toLowerCase().includes(q);
    const matchMode   = modeFilter   === 'All Modes'   || s.mode   === modeFilter;
    const matchStatus = statusFilter === 'All Status'  || s.status === statusFilter;
    return matchSearch && matchMode && matchStatus;
  }), [sessions, search, modeFilter, statusFilter]);

  const handleApproveReschedule = () => showToast('✅ Pending reschedules approved!');
  const handleInspect           = () => showToast('🔍 Tutor availability inspection started.');
  const handleExport            = () => {
    const csv = ['Session,Tutor,Student,Subject,Time,Mode,Status,Fee', ...sessions.map(s => `${s.id},${s.tutor},${s.student},${s.subject},${s.time},${s.mode},${s.status},${s.fee}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'sessions.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Schedule exported!');
  };

  const handleAddSession = () => {
    if (!newSession.tutor || !newSession.student || !newSession.subject || !newSession.time || !newSession.fee) {
      showToast('❌ Please fill in all fields.'); return;
    }
    const id = `SS-${400 + sessions.length + 1}`;
    setSessions(prev => [...prev, { ...newSession, id, status: 'Pending' }]);
    setNewSession({ tutor: '', student: '', subject: '', time: '', mode: 'Online', fee: '' });
    setShowNewForm(false);
    showToast('✅ New session added!');
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Sessions</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Session schedule overview.</p>
      </div>

      {toast && <div style={{ background: '#ecfeff', border: '1px solid #99f6e4', color: '#0f766e', borderRadius: 12, padding: '10px 16px', fontWeight: 600, fontSize: 13 }}>{toast}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Upcoming Sessions"    value={filtered.length.toString()} detail="Filtered results"        accent="#0f766e" />
        <StatCard title="Confirmed"            value={filtered.filter(s=>s.status==='Confirmed').length.toString()}   detail="Ready to go"    accent="#0f766e" />
        <StatCard title="Pending Reschedules"  value={filtered.filter(s=>s.status==='Pending').length.toString()}     detail="Needs attention" accent="#1d4ed8" />
        <StatCard title="Rescheduled"          value={filtered.filter(s=>s.status==='Rescheduled').length.toString()} detail="Updated slots"   accent="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Session Queue</h3>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Upcoming bookings</div>
            </div>
            <button onClick={() => setShowNewForm(true)} style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', borderRadius: 12, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>+ New Session</button>
          </div>

          {showNewForm && (
            <div style={{ background: '#f8faf9', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, marginBottom: 16, display: 'grid', gap: 10 }}>
              <h4 style={{ margin: 0, color: '#111827' }}>Add New Session</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input placeholder="Tutor name"   value={newSession.tutor}   onChange={e => setNewSession(p=>({...p, tutor: e.target.value}))}   style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
                <input placeholder="Student name" value={newSession.student} onChange={e => setNewSession(p=>({...p, student: e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
                <input placeholder="Subject"      value={newSession.subject} onChange={e => setNewSession(p=>({...p, subject: e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
                <input placeholder="Time (e.g. Today · 5:00 PM)" value={newSession.time} onChange={e => setNewSession(p=>({...p, time: e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
                <select value={newSession.mode} onChange={e => setNewSession(p=>({...p, mode: e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }}>
                  <option>Online</option><option>In person</option><option>Hybrid</option>
                </select>
                <input placeholder="Fee (e.g. LKR 2,500)" value={newSession.fee} onChange={e => setNewSession(p=>({...p, fee: e.target.value}))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleAddSession} style={{ background: '#0f766e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Add Session</button>
                <button onClick={() => setShowNewForm(false)} style={{ background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.7fr 0.7fr', gap: 10, marginBottom: 16 }}>
            <input type="text" placeholder="Search by tutor, student or subject..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }} />
            <select value={modeFilter} onChange={e => setMode(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Modes</option><option>Online</option><option>In person</option><option>Hybrid</option>
            </select>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Status</option><option>Confirmed</option><option>Pending</option><option>Rescheduled</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ background: '#f0fdfa', textAlign: 'left' }}>
                  {['Session','Tutor','Student','Subject','Time','Mode','Status','Fee'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>No sessions match your filters.</td></tr>
                ) : filtered.map(session => (
                  <tr key={session.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                    <td style={{ padding: '14px', color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{session.id}</td>
                    <td style={{ padding: '14px', color: '#111827', fontWeight: 700 }}>{session.tutor}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.student}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.subject}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.time}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.mode}</td>
                    <td style={{ padding: '14px' }}><StatusBadge status={session.status} /></td>
                    <td style={{ padding: '14px', color: '#0f766e', fontWeight: 700 }}>{session.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Upcoming Load</h3>
            <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
              {upcoming.map(item => (
                <div key={item.day} style={{ border: '1px solid #ecf4ef', borderRadius: 14, padding: 14, background: '#f8faf9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#374151', fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{item.day}</span>
                    <span>{item.total} sessions</span>
                  </div>
                  <div style={{ height: 10, background: '#e5f7ef', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(item.total * 4, 100)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #0f766e, #14b8a6)' }} />
                  </div>
                  <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>Peak at {item.peak}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Operational Actions</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <button onClick={handleApproveReschedule} style={{ border: '1px solid #99f6e4', background: '#ecfeff', color: '#0f766e', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left', cursor: 'pointer' }}>✅ Approve pending reschedule</button>
              <button onClick={handleInspect}           style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left', cursor: 'pointer' }}>🔍 Inspect tutor availability</button>
              <button onClick={handleExport}            style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left', cursor: 'pointer' }}>📥 Export booking schedule</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}