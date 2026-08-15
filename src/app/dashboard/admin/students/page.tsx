'use client';

import { useEffect, useState } from 'react';
import { getStudents } from '@/services/adminApi';
import Spinner from '@/components/ui/Spinner';

function StatCard({ title, value, detail, accent, loading }: { title: string; value: string; detail: string; accent: string; loading?: boolean }) {
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');

  useEffect(() => {
    async function fetchStudents() {
      try {
        const data = await getStudents();
        // Backend returns: [{ user_id, full_name, grade_level, school_institute, email, created_at }]
        setStudents(data);
        setFiltered(data);
      } catch (err: any) {
        console.error('Failed to fetch students:', err);
        setError('Could not load students. Make sure your backend is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Search + filter
  useEffect(() => {
    let result = students;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q),
      );
    }

    if (levelFilter !== 'All Levels') {
      result = result.filter((s) => s.grade_level === levelFilter);
    }

    setFiltered(result);
  }, [search, levelFilter, students]);

  // Unique grade levels for filter dropdown
  const gradeLevels = Array.from(new Set(students.map((s) => s.grade_level).filter(Boolean)));

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Students</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Student accounts from the database.</p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
       <StatCard title="Total Students" value={students.length.toString()} detail="From database" accent="#0f766e" loading={loading} />
       <StatCard title="Showing"        value={filtered.length.toString()}  detail="After filters"  accent="#1d4ed8" loading={loading} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Student Directory</h3>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Live data from your backend</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 10, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
          >
            <option>All Levels</option>
            {gradeLevels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#f0fdfa', textAlign: 'left' }}>
                {['Student', 'Grade Level', 'School / Institute', 'Email', 'Joined'].map((heading) => (
                  <th key={heading} style={{ padding: '12px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center' }}><Spinner size={26} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No students found.</td></tr>
              ) : filtered.map((student) => (
                // Backend fields: user_id, full_name, grade_level, school_institute, email, created_at
                <tr key={student.user_id} style={{ borderTop: '1px solid #ecf4ef' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 999, background: '#ecfeff', color: '#0f766e', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                        {student.full_name?.charAt(0) ?? 'S'}
                      </div>
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700 }}>{student.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px', color: '#374151' }}>{student.grade_level ?? '—'}</td>
                  <td style={{ padding: '14px', color: '#374151' }}>{student.school_institute ?? '—'}</td>
                  <td style={{ padding: '14px', color: '#6b7280', fontSize: 13 }}>{student.email}</td>
                  <td style={{ padding: '14px', color: '#6b7280', fontSize: 12 }}>
                    {student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
