'use client';

import { useEffect, useMemo, useState } from 'react';
import { getStudents } from '@/services/adminApi';
import { appendAudit, downloadFile } from '../utils/operations';
import Spinner from '@/components/ui/Spinner';

type Student = {
  user_id: number | string;
  full_name: string;
  grade_level?: string | null;
  school_institute?: string | null;
  email: string;
  created_at?: string;
  age?: number | null;
  language?: string | null;
  address?: string | null;
  phone?: string | null;
  bio?: string | null;
  profile_picture_url?: string | null;
};

type SortOrder = 'newest' | 'oldest';

function formatDate(iso?: string): string {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Assigns a logical rank to a grade level so the filter dropdown always
// reads Grade 1 → Grade 13 → O/L → A/L instead of raw DB / alphabetical
// order. O/L sits after Grade 11 and A/L after Grade 13, matching the
// actual Sri Lankan school progression these values represent.
function gradeSortValue(grade?: string | null): number {
  if (!grade) return 999;
  const g = grade.trim().toUpperCase();
  if (g === 'O/L') return 11.5;
  if (g === 'A/L') return 13.5;
  const numMatch = g.match(/\d+(\.\d+)?/);
  if (numMatch) return parseFloat(numMatch[0]);
  return 500;
}

// Full canonical set of grade levels, so the dropdown always shows every
// possible grade — including ones with zero current students — and stays
// identical to the Sessions page's grade filter.
const ALL_GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'O/L', 'Grade 12', 'Grade 13', 'A/L',
];

// Grade 11 and O/L refer to the same level in this school system, so they're
// shown as one unified label ("O/L") instead of two separate dropdown
// entries / badges.
function normalizeGradeLabel(grade?: string | null): string | null {
  if (!grade) return grade ?? null;
  const g = grade.trim().toUpperCase();
  if (g === 'GRADE 11' || g === 'GRADE11') return 'O/L';
  return grade;
}

function avatarSrc(student: Pick<Student, 'full_name' | 'profile_picture_url'>): string {
  return (
    student.profile_picture_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.full_name || 'S')}&backgroundColor=ecfeff&textColor=0f766e`
  );
}

function StatCard({ title, value, detail, accent, loading }: { title: string; value: string; detail: string; accent: string; loading?: boolean }) {
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

// Compact pagination: numbered pages with dots once the range gets long
// (e.g. 1 2 3 … 8 9 10), so it stays usable as the student list scales.
function getPaginationRange(current: number, total: number, siblingCount = 1): (number | 'dots')[] {
  const totalPageNumbers = siblingCount * 2 + 5;
  if (totalPageNumbers >= total) return Array.from({ length: total }, (_, i) => i + 1);

  const leftSiblingIndex = Math.max(current - siblingCount, 1);
  const rightSiblingIndex = Math.min(current + siblingCount, total);
  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < total - 1;
  const firstPageIndex = 1;
  const lastPageIndex = total;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...Array.from({ length: leftItemCount }, (_, i) => i + 1), 'dots', lastPageIndex];
  }
  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [firstPageIndex, 'dots', ...Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1)];
  }
  const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
  return [firstPageIndex, 'dots', ...middleRange, 'dots', lastPageIndex];
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All Levels');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusText, setStatusText] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    async function fetchStudents() {
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (err: any) {
        console.error('Failed to fetch students:', err);
        setError('Could not load students. Make sure your backend is running.');
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Grade Level dropdown options, always in real school-progression order
  // (Grade 1 → 13 → O/L → A/L) rather than raw DB order.
  const sortedGradeLevels = useMemo(() => {
    const levels = Array.from(
      new Set(students.map((s) => normalizeGradeLabel(s.grade_level)).filter(Boolean)),
    ) as string[];
    return levels.sort((a, b) => gradeSortValue(a) - gradeSortValue(b));
  }, [students]);

  const filtered = useMemo(() => {
    let result = students;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q),
      );
    }

    if (levelFilter !== 'All Levels') {
      result = result.filter((s) => normalizeGradeLabel(s.grade_level) === levelFilter);
    }

    // Newest/oldest — lets admins quickly find recently joined students vs
    // long-standing accounts, using the join date already returned by the API.
    result = [...result].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [students, search, levelFilter, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, levelFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginationRange = useMemo(() => getPaginationRange(currentPage, totalPages), [currentPage, totalPages]);

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

  // Export builds a report from whatever is currently filtered/sorted —
  // search + grade level + newest/oldest — instead of a manual selection.
  const exportFiltered = () => {
    if (filtered.length === 0) return;

    const header = ['Name', 'Grade Level', 'School / Institute', 'Age', 'Language', 'Email', 'Phone', 'Address', 'Joined'];
    const csvRows = filtered.map((s) => [
      s.full_name || '',
      s.grade_level || '',
      s.school_institute || '',
      s.age ?? '',
      s.language || '',
      s.email || '',
      s.phone || '',
      s.address || '',
      formatDate(s.created_at),
    ]);
    const csv = [header, ...csvRows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    downloadFile('students-report.csv', csv, 'text/csv;charset=utf-8;');
    appendAudit('STUDENT_EXPORT', `Exported ${filtered.length} filtered student record(s)`);
    setStatusText(`Exported ${filtered.length} student${filtered.length === 1 ? '' : 's'}.`);
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 20,
        background: 'linear-gradient(160deg, #f0fdfa 0%, #eef6ff 55%, #f6f4ff 100%)',
        borderRadius: 24,
        padding: 20,
        margin: -20,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Students</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Student accounts.</p>
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
        <StatCard title="Total Students" value={students.length.toString()} detail="From database" accent="#0f766e" loading={loading} />
        <StatCard title="Showing" value={filtered.length.toString()} detail="After filters" accent="#27c3ff" loading={loading} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 16 }}>Student Directory</h3>
          </div>
          <button
            onClick={exportFiltered}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', gap: 10 }}>
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
              {sortedGradeLevels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 14 }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', textAlign: 'left' }}>
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
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fdfb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={avatarSrc(student)}
                        alt=""
                        style={{ width: 42, height: 42, borderRadius: 999, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }}
                      />
                      <button
                        onClick={() => openDetails(student)}
                        style={{ background: 'none', border: 'none', padding: 0, color: '#111827', fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'left', textDecoration: 'none' }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {student.full_name || 'Unnamed student'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    {student.grade_level ? (
                      <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#ecfeff', color: '#0f766e', border: '1px solid #99f6e4', fontWeight: 600 }}>
                        {normalizeGradeLabel(student.grade_level)}
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
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>

              {paginationRange.map((item, idx) =>
                item === 'dots' ? (
                  <span key={`dots-${idx}`} style={{ padding: '4px 6px', color: '#6b7280', fontSize: 13, userSelect: 'none' }}>&hellip;</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goToPage(item)}
                    style={{
                      border: item === currentPage ? '1px solid #0f766e' : '1px solid #99f6e4',
                      background: item === currentPage ? '#0f766e' : '#fff',
                      borderRadius: 8,
                      padding: '4px 10px',
                      color: item === currentPage ? '#fff' : '#0f766e',
                      cursor: 'pointer',
                      minWidth: 32,
                    }}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ border: '1px solid #99f6e4', background: '#fff', borderRadius: 8, padding: '4px 10px', color: '#0f766e', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Details drawer ─────────────────────────────────────────────── */}
      {selectedStudent && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,22,0.5)', zIndex: 40 }} onClick={closeDetails} />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 500, height: '100vh', zIndex: 50, background: 'linear-gradient(180deg, #fbfdfc 0%, #f4faf8 100%)', borderLeft: '1px solid #e5e7eb', overflowY: 'auto', boxShadow: '-12px 0 32px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '18px 22px', borderBottom: '1px solid #ecf4ef', background: 'linear-gradient(90deg, #ecfeff 0%, #f0fdfa 100%)', position: 'sticky', top: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 700, marginBottom: 4 }}>STUDENT PROFILE &nbsp;/&nbsp; #{selectedStudent.user_id}</div>
                  <h3 style={{ margin: 0, color: '#111827', fontFamily: "'Fraunces', serif", fontSize: 21 }}>Student Details</h3>
                </div>
                <button onClick={closeDetails} aria-label="Close" style={{ border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, fontSize: 17, lineHeight: 1 }}>×</button>
              </div>
            </div>

            <div style={{ padding: 22, display: 'grid', gap: 18, flex: 1 }}>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
                <img
                  src={avatarSrc(selectedStudent)}
                  alt=""
                  style={{ width: 56, height: 56, borderRadius: 14, border: '1px solid #e5e7eb', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#111827', fontSize: 18, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedStudent.full_name || 'Unnamed student'}
                  </div>
                  {selectedStudent.grade_level && (
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 12, padding: '4px 8px', borderRadius: 8, background: '#ecfeff', color: '#0f766e', border: '1px solid #99f6e4', fontWeight: 600 }}>
                      {normalizeGradeLabel(selectedStudent.grade_level)}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Contact Information</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <DetailField label="Email address" value={selectedStudent.email} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={copyEmail} title="Copy email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                      {copied ? '✓' : '⧉'}
                    </button>
                    <a href={`mailto:${selectedStudent.email}`} title="Send email" style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 8, width: 32, height: 32, display: 'grid', placeItems: 'center', fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                      ✉
                    </a>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 12 }}>
                  <DetailField label="Phone" value={selectedStudent.phone} />
                  <DetailField label="Age" value={selectedStudent.age} />
                  <DetailField label="Address" value={selectedStudent.address} fullWidth />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>Academic Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <DetailField label="Grade level" value={normalizeGradeLabel(selectedStudent.grade_level)} />
                  <DetailField label="Preferred language" value={selectedStudent.language} />
                  <DetailField label="School / Institute" value={selectedStudent.school_institute} fullWidth />
                  <DetailField label="Student ID" value={`#${String(selectedStudent.user_id).padStart(5, '0')}`} />
                  <DetailField label="Joined on" value={formatDate(selectedStudent.created_at)} />
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18 }}>
                <div style={{ color: '#0f766e', fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 14 }}>About</div>
                <DetailField label="Bio" value={selectedStudent.bio} fullWidth />
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
