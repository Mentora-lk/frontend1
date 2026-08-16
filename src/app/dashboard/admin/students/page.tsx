'use client';

import { useEffect, useState } from 'react';
import { getStudents } from '@/services/adminApi';
import Spinner from '@/components/ui/Spinner';

type Student = {
  user_id: number | string;
  full_name: string;
  grade_level?: string;
  school_institute?: string;
  email: string;
  created_at?: string;
};

function formatDate(iso?: string): string {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function StatCard({ title, value, detail, accent, loading }: { title: string; value: string; detail: string; accent: string; loading?: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copied, setCopied] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    async function fetchStudents() {
      try {
        const data = await getStudents();
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
    setCurrentPage(1);
  }, [search, levelFilter, students]);

  const gradeLevels = Array.from(new Set(students.map((s) => s.grade_level).filter(Boolean))) as string[];

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openDetails = (student: Student) => {
    setSelectedStudent(student);
    setCopied(false);
  };

  const closeDetails = () => setSelectedStudent(null);

  const copyEmail = async () => {
    if (!selectedStudent) return;
    try {
      await navigator.clipboard.writeText(selectedStudent.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available — ignore silently.
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 22,
        background: 'linear-gradient(160deg, #eef6ff 0%, #f0fdfa 55%, #f6f4ff 100%)',
        borderRadius: 24,
        padding: 20,
        margin: -20,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Students</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Student accounts from the database.</p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Students" value={students.length.toString()} detail="From database" accent="#0f766e" loading={loading} />
        <StatCard title="Showing" value={filtered.length.toString()} detail="After filters" accent="#1d4ed8" loading={loading} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Student Directory</h3>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>Live data from your backend</div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdfa 100%)', border: '1px solid #dbeafe', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 10 }}>
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
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #f0fdfa 100%)', textAlign: 'left' }}>
                {['Student', 'Grade Level', 'School / Institute', 'Email', 'Joined'].map((heading) => (
                  <th key={heading} style={{ padding: '12px 14px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f766e' }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center' }}><Spinner size={26} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ color: '#111827', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No students found</div>
                    <div style={{ color: '#9ca3af', fontSize: 13 }}>
                      {search || levelFilter !== 'All Levels' ? 'Try adjusting your search or filter.' : 'Student accounts will appear here once created.'}
                    </div>
                  </td>
                </tr>
              ) : paginated.map((student) => (
                <tr
                  key={student.user_id}
                  style={{ borderTop: '1px solid #ecf4ef', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fbff')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.full_name || 'S')}&backgroundColor=ecfeff&textColor=0f766e`}
                        alt=""
                        style={{ width: 42, height: 42, borderRadius: 999, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }}
                      />
                      <button
                        onClick={() => openDetails(student)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#111827',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          textAlign: 'left',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {student.full_name || 'Unnamed student'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    {student.grade_level ? (
                      <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600 }}>
                        {student.grade_level}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '14px', color: '#374151' }}>{student.school_institute || '—'}</td>
                  <td style={{ padding: '14px', color: '#6b7280', fontSize: 13 }}>{student.email}</td>
                  <td style={{ padding: '14px', color: '#6b7280', fontSize: 12 }}>
                    {student.created_at ? new Date(student.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid #ecf4ef' }}>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  background: currentPage === 1 ? '#f3f4f6' : '#fff',
                  color: currentPage === 1 ? '#9ca3af' : '#111827',
                  fontSize: 13,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: '1px solid ' + (p === currentPage ? '#0f766e' : '#d1d5db'),
                        background: p === currentPage ? '#0f766e' : '#fff',
                        color: p === currentPage ? '#fff' : '#111827',
                        fontSize: 13,
                        fontWeight: p === currentPage ? 700 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                  color: currentPage === totalPages ? '#9ca3af' : '#111827',
                  fontSize: 13,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedStudent && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,22,0.5)', zIndex: 40 }} onClick={closeDetails} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 440, height: '100vh', zIndex: 50, background: 'linear-gradient(180deg, #fbfdff 0%, #f4f8fa 100%)', borderLeft: '1px solid #e5e7eb', overflowY: 'auto', boxShadow: '-12px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '18px 20px', borderBottom: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #eff6ff 0%, #f0fdfa 100%)', position: 'sticky', top: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700, marginBottom: 4 }}>STUDENT PROFILE &nbsp;/&nbsp; #{selectedStudent.user_id}</div>
                  <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 20 }}>Student Details</h3>
                </div>
                <button
                  onClick={closeDetails}
                  aria-label="Close"
                  style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 16, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: 20, display: 'grid', gap: 18, flex: 1 }}>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedStudent.full_name || 'S')}&backgroundColor=ecfeff&textColor=0f766e`}
                  alt=""
                  style={{ width: 54, height: 54, borderRadius: 14, border: '1px solid #e5e7eb', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#111827', fontSize: 17, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedStudent.full_name || 'Unnamed student'}
                  </div>
                  {selectedStudent.grade_level && (
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600 }}>
                      {selectedStudent.grade_level}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Contact Information</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Email address</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedStudent.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={copyEmail} title="Copy email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 12, color: '#374151' }}>
                      {copied ? '✓' : '⧉'}
                    </button>
                    <a href={`mailto:${selectedStudent.email}`} title="Send email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 30, height: 30, display: 'grid', placeItems: 'center', fontSize: 12, color: '#374151', textDecoration: 'none' }}>
                      ✉
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                <div style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Academic Details</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Grade level</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginTop: 2 }}>{selectedStudent.grade_level || 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Student ID</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginTop: 2, fontFamily: 'monospace' }}>#{String(selectedStudent.user_id).padStart(5, '0')}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>School / Institute</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginTop: 2 }}>{selectedStudent.school_institute || 'Not specified'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Joined on</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 600, marginTop: 2 }}>{formatDate(selectedStudent.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: 20, borderTop: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #f8faff 0%, #f0fdfa 100%)', position: 'sticky', bottom: 0 }}>
              <button
                onClick={closeDetails}
                style={{ width: '100%', border: '1px solid #d1d5db', background: '#fff', color: '#374151', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}
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