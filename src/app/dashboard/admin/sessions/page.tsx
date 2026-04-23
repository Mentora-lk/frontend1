'use client';

const sessions = [
  { id: 'SS-401', tutor: 'Amal Perera', student: 'Aarav Perera', subject: 'A/L Physics', time: 'Today · 4:30 PM', mode: 'Online', status: 'Confirmed', fee: 'LKR 3,500' },
  { id: 'SS-402', tutor: 'Sajith Silva', student: 'Nimasha Silva', subject: 'OL Maths', time: 'Today · 6:00 PM', mode: 'In person', status: 'Pending', fee: 'LKR 2,250' },
  { id: 'SS-403', tutor: 'Madhavi Jayasuriya', student: 'Rashmi Fernando', subject: 'English Literature', time: 'Tomorrow · 9:00 AM', mode: 'Online', status: 'Confirmed', fee: 'LKR 2,800' },
  { id: 'SS-404', tutor: 'Nimal Fonseka', student: 'Hirun Jayasinghe', subject: 'A/L Chemistry', time: 'Tomorrow · 1:30 PM', mode: 'Hybrid', status: 'Rescheduled', fee: 'LKR 3,200' },
  { id: 'SS-405', tutor: 'Sani Edirisinghe', student: 'Sanuki Bandara', subject: 'Grade 9 Science', time: 'Fri · 3:00 PM', mode: 'Online', status: 'Confirmed', fee: 'LKR 1,800' },
];

const upcoming = [
  { day: 'Today', total: 16, peak: '4:00 PM' },
  { day: 'Tomorrow', total: 21, peak: '7:00 PM' },
  { day: 'Friday', total: 18, peak: '5:30 PM' },
];

function StatCard({ title, value, detail, accent }: { title: string; value: string; detail: string; accent: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
        <span style={{ color: '#10B981', fontSize: 12, fontWeight: 700 }}>Status</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
      <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette =
    status === 'Confirmed'
      ? { bg: '#ecfdf5', color: '#047857', border: '#bbf7d0' }
      : status === 'Pending'
      ? { bg: '#fef3c7', color: '#b45309', border: '#fde68a' }
      : { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
      {status}
    </span>
  );
}

export default function AdminSessionsPage() {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Sessions</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Session schedule overview.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Upcoming Sessions" value="54" detail="Next 24 hours" accent="#10B981" />
        <StatCard title="Completed Today" value="38" detail="92% on-time finish rate" accent="#0f766e" />
        <StatCard title="Pending Reschedules" value="9" detail="Needs admin attention" accent="#1d4ed8" />
        <StatCard title="Session Revenue" value="LKR 284k" detail="This week across all tutors" accent="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Session Queue</h3>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Upcoming bookings</div>
            </div>
            <button style={{ border: '1px solid #bbf7d0', background: '#ecfdf5', color: '#047857', borderRadius: 12, padding: '10px 14px', fontWeight: 700 }}>New Session</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.7fr 0.7fr', gap: 10, marginBottom: 16 }}>
            <input type="text" placeholder="Search by tutor, student or subject..." style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }} />
            <select style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Modes</option>
              <option>Online</option>
              <option>In person</option>
              <option>Hybrid</option>
            </select>
            <select style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Rescheduled</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 940 }}>
              <thead>
                <tr style={{ background: '#f0fdf4', textAlign: 'left' }}>
                  {['Session', 'Tutor', 'Student', 'Subject', 'Time', 'Mode', 'Status', 'Fee'].map((heading) => (
                    <th key={heading} style={{ padding: '12px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                    <td style={{ padding: '14px', color: '#6b7280', fontSize: 12, fontFamily: 'monospace' }}>{session.id}</td>
                    <td style={{ padding: '14px', color: '#111827', fontWeight: 700 }}>{session.tutor}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.student}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.subject}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.time}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{session.mode}</td>
                    <td style={{ padding: '14px' }}><StatusBadge status={session.status} /></td>
                    <td style={{ padding: '14px', color: '#10B981', fontWeight: 700 }}>{session.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Upcoming Load</h3>
            <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
              {upcoming.map((item) => (
                <div key={item.day} style={{ border: '1px solid #ecf4ef', borderRadius: 14, padding: 14, background: '#f8faf9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#374151', fontSize: 13 }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{item.day}</span>
                    <span>{item.total} sessions</span>
                  </div>
                  <div style={{ height: 10, background: '#e5f7ef', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(item.total * 4, 100)}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #10B981, #059669)' }} />
                  </div>
                  <div style={{ marginTop: 8, color: '#6b7280', fontSize: 12 }}>Peak at {item.peak}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Operational Actions</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <button style={{ border: '1px solid #bbf7d0', background: '#ecfdf5', color: '#047857', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left' }}>Approve pending reschedule</button>
              <button style={{ border: '1px solid #dfeee8', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left' }}>Inspect tutor availability</button>
              <button style={{ border: '1px solid #dfeee8', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left' }}>Export booking schedule</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
