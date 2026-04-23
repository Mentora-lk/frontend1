'use client';

const students = [
  { id: 'ST-201', name: 'Aarav Perera', email: 'aarav.p@example.com', level: 'Grade 10', city: 'Colombo 05', sessions: 18, status: 'Active', spend: 'LKR 24,500' },
  { id: 'ST-202', name: 'Nimasha Silva', email: 'nimasha.s@example.com', level: 'A/L Science', city: 'Kandy', sessions: 12, status: 'Active', spend: 'LKR 18,900' },
  { id: 'ST-203', name: 'Rashmi Fernando', email: 'rashmi.f@example.com', level: 'Grade 11', city: 'Galle', sessions: 7, status: 'At Risk', spend: 'LKR 9,800' },
  { id: 'ST-204', name: 'Hirun Jayasinghe', email: 'hirun.j@example.com', level: 'A/L Maths', city: 'Kurunegala', sessions: 22, status: 'Active', spend: 'LKR 31,200' },
  { id: 'ST-205', name: 'Sanuki Bandara', email: 'sanuki.b@example.com', level: 'Grade 9', city: 'Matara', sessions: 4, status: 'New', spend: 'LKR 2,600' },
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
    status === 'Active'
      ? { bg: '#ecfdf5', color: '#047857', border: '#bbf7d0' }
      : status === 'New'
      ? { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }
      : { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}>
      {status}
    </span>
  );
}

export default function AdminStudentsPage() {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Students</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Student activity and spend summary.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Students" value="3,120" detail="+8.2% this month" accent="#10B981" />
        <StatCard title="Active Learners" value="2,614" detail="83.8% active rate" accent="#0f766e" />
        <StatCard title="New This Week" value="186" detail="Admissions and reactivations" accent="#1d4ed8" />
        <StatCard title="Revenue From Students" value="LKR 4.2M" detail="All-time course and session spend" accent="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Student Directory</h3>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Search and review learner accounts</div>
            </div>
            <button style={{ border: '1px solid #bbf7d0', background: '#ecfdf5', color: '#047857', borderRadius: 12, padding: '10px 14px', fontWeight: 700 }}>Export CSV</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.6fr 0.6fr', gap: 10, marginBottom: 16 }}>
            <input type="text" placeholder="Search by name, email or student ID..." style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }} />
            <select style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Levels</option>
              <option>Grade 9</option>
              <option>Grade 10</option>
              <option>Grade 11</option>
              <option>A/L Science</option>
              <option>A/L Maths</option>
            </select>
            <select style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}>
              <option>All Status</option>
              <option>Active</option>
              <option>At Risk</option>
              <option>New</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr style={{ background: '#f0fdf4', textAlign: 'left' }}>
                  {['Student', 'Level', 'City', 'Sessions', 'Spend', 'Status'].map((heading) => (
                    <th key={heading} style={{ padding: '12px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderTop: '1px solid #ecf4ef' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 999, background: '#ecfdf5', color: '#047857', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{student.name.charAt(0)}</div>
                        <div>
                          <div style={{ color: '#111827', fontWeight: 700 }}>{student.name}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#374151' }}>{student.level}</td>
                    <td style={{ padding: '14px', color: '#374151' }}>{student.city}</td>
                    <td style={{ padding: '14px', color: '#111827', fontWeight: 700 }}>{student.sessions}</td>
                    <td style={{ padding: '14px', color: '#10B981', fontWeight: 700 }}>{student.spend}</td>
                    <td style={{ padding: '14px' }}><StatusBadge status={student.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Engagement Snapshot</h3>
            <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
              {[
                { label: 'Weekly active students', value: '2,145', bar: '76%' },
                { label: 'Average sessions booked', value: '8.3', bar: '58%' },
                { label: 'Repeat booking rate', value: '64%', bar: '64%' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#374151', fontSize: 13 }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{item.value}</span>
                  </div>
                  <div style={{ height: 10, background: '#e5f7ef', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: item.bar, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #10B981, #059669)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dfeee8', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <button style={{ border: '1px solid #bbf7d0', background: '#ecfdf5', color: '#047857', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left' }}>Send announcement</button>
              <button style={{ border: '1px solid #dfeee8', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left' }}>Review inactive accounts</button>
              <button style={{ border: '1px solid #dfeee8', background: '#fff', color: '#111827', borderRadius: 12, padding: '12px 14px', fontWeight: 700, textAlign: 'left' }}>Export learner list</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
