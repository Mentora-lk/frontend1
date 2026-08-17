'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { getMyEnrollments, cancelEnrollment } from '@/services/enrollmentService';
import { useCurrentUser, getInitial, getDisplayName } from '@/hooks/useCurrentUser';
import { usePalette } from '@/hooks/usePalette';
import { useEnrollmentStatusSocket } from '@/hooks/useEnrollmentStatusSocket';

type MyClassStatus = 'active' | 'requested' | 'approved';
type MyClassMode = 'online' | 'offline' | 'both';

type MyClass = {
  id: number;
  tutorId: number;
  title: string;
  tutor: string;
  subject: string;
  location: string;
  mode: MyClassMode;
  fee: number;
  status: MyClassStatus;
  sessionsAttended: number;
  totalSessions: number;
  nextSession: string;
  image: string;
};

function MyClassCard({ cls, view, onCancel, onView }: { cls: MyClass; view: 'grid' | 'list'; onCancel?: () => void; onView?: () => void }) {
  const palette = usePalette();
  const statusColor = cls.status === 'active' ? '#10B981' : cls.status === 'approved' ? '#3B82F6' : '#F59E0B';
  const thumbnail = cls.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80';

  return (
    <div
      onClick={onView}
      style={{
        display: 'flex',
        flexDirection: view === 'grid' ? 'column' : 'row',
        gap: 12,
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: 16,
        padding: 14,
        boxShadow: palette.shadow,
        cursor: onView ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { if (onView) e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { if (onView) e.currentTarget.style.transform = 'none'; }}
    >
      <img
        src={thumbnail}
        alt={cls.title}
        style={{
          width: view === 'grid' ? '100%' : 130,
          height: view === 'grid' ? 130 : 90,
          objectFit: 'cover',
          borderRadius: 12,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.title}</h4>
          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, textTransform: 'capitalize' }}>{cls.status}</span>
        </div>
        <p style={{ fontSize: 12, color: palette.textSecondary, marginBottom: 6 }}>{cls.subject} • {cls.tutor}</p>
        <p style={{ fontSize: 12, color: palette.textMuted, marginBottom: 8 }}>{cls.location} • {cls.mode} • Rs. {cls.fee}</p>
        <p style={{ fontSize: 12, color: palette.textSecondary }}>Next: {cls.nextSession}</p>
      </div>
    </div>
  );
}

// PUT /enrollments/:id (updateEnrollmentDetails) now exists on the backend for
// editing a still-pending enrollment's details/schedule — separate from PATCH
// /enrollments/:id, which is the status-transition endpoint.
const ENROLLMENT_EDIT_ENABLED = true;

function EnrollmentDetailsModal({ enrollment, onClose }: { enrollment: any; onClose: () => void }) {
  const palette = usePalette();
  const mode = enrollment.preferred_mode || enrollment.mode;

  const personalRows = [
    { l: 'Full Name', v: enrollment.full_name },
    { l: 'Email', v: enrollment.email },
    { l: 'Phone', v: enrollment.phone },
    { l: 'School', v: enrollment.school },
    { l: 'Grade', v: enrollment.grade },
    { l: 'Message', v: enrollment.message },
  ].filter(row => row.v);

  const scheduleRows = [
    { l: 'Day', v: enrollment.selected_day },
    { l: 'Time', v: enrollment.selected_time ? `🕐 ${enrollment.selected_time}` : undefined },
    { l: 'Mode', v: mode ? mode.charAt(0).toUpperCase() + mode.slice(1) : undefined },
    { l: 'Location', v: mode === 'online' ? 'Online (video call)' : enrollment.location },
    { l: 'Fee', v: enrollment.fee ? `LKR ${Number(enrollment.fee).toLocaleString()}/month` : undefined },
  ].filter(row => row.v);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: palette.surface, borderRadius: 20, padding: '28px 30px', maxWidth: 460, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: palette.textPrimary, lineHeight: 1.3 }}>{enrollment.title}</h2>
            <p style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>Your enrollment submission</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.textMuted, fontSize: 20, lineHeight: 1, padding: 4, flexShrink: 0 }}>✕</button>
        </div>

        {personalRows.length > 0 && (
          <div style={{ background: palette.surfaceAlt, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: palette.textMuted, marginBottom: 10 }}>Personal Details</p>
            {personalRows.map(row => (
              <div key={row.l} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: `1px solid ${palette.border}` }}>
                <span style={{ fontSize: 13, color: palette.textSecondary, width: 110, flexShrink: 0 }}>{row.l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: palette.textPrimary, flex: 1 }}>{row.v}</span>
              </div>
            ))}
          </div>
        )}

        {scheduleRows.length > 0 && (
          <div style={{ background: '#F0FDF4', borderRadius: 14, padding: '16px 18px', border: '1px solid #A7F3D0' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#059669', marginBottom: 10 }}>Selected Schedule</p>
            {scheduleRows.map(row => (
              <div key={row.l} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                <span style={{ fontSize: 13, color: '#065F46', width: 110, flexShrink: 0 }}>{row.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46', flex: 1 }}>{row.v}</span>
              </div>
            ))}
          </div>
        )}

        {ENROLLMENT_EDIT_ENABLED && enrollment.status === 'requested' && (
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <Link href={`/classes/${enrollment.class_id}/enroll?enrollmentId=${enrollment.id}`}>
              <button style={{ background: '#10B981', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                Edit Enrollment
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const user = useCurrentUser();
  const palette = usePalette();

  // Real data from backend
  const [classes,  setClasses]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Keep existing UI state
  const [view,        setView]        = useState<'grid'|'list'>('grid');
  const [statusFilter, setStatus]     = useState<string>('all');
  const [searchQuery,  setSearch]     = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMyEnrollments();
        setClasses(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          window.location.href = '/auth/login';
          return;
        }
        setError(err.response?.data?.message || 'Failed to load your classes. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // Live-update a class's status the moment a tutor approves/rejects it —
  // no reload needed. Backend pushes this from updateEnrollmentStatus.
  useEnrollmentStatusSocket((update) => {
    setClasses(prev => prev.map(c => c.id === update.id ? { ...c, status: update.status } : c));
  });

  const handleCancel = async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to cancel this enrollment?')) return;
    try {
      await cancelEnrollment(enrollmentId);
      setClasses(prev => prev.map(c =>
        c.id === enrollmentId ? { ...c, status: 'cancelled' } : c
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel enrollment.');
    }
  };

  // These now calculated from real backend data
  const activeClasses  = classes.filter(c => c.status === 'active');
  const pendingClasses  = classes.filter(c => c.status === 'requested');

  const approvedClasses = classes.filter(c => c.status === 'approved');

  // Filter by both the selected status tab and the search query, all client-side
  // against the full enrollment list already fetched above.
  const filtered = classes.filter(c => {
    const title = c.title?.toLowerCase() || '';
    const tutor = c.tutor_name?.toLowerCase() || '';
    const q     = searchQuery.toLowerCase();
    const matchesSearch = !q || title.includes(q) || tutor.includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: ${palette.bg}; transition: background 0.25s ease; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #10B981; border-radius: 99px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }

        .stat-card {
          background: ${palette.surface}; border-radius: 18px; padding: 20px 22px; flex: 1;
          transition: all 0.28s cubic-bezier(.22,1,.36,1);
          border: 1px solid ${palette.border};
        }
        .stat-card:hover { transform: translateY(-5px); }

        .filter-tab {
          padding: 7px 18px; border-radius: 99px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1.5px solid; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .class-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); gap: 22px; }
        .class-list  { display: flex; flex-direction: column; gap: 16px; }

        @media (max-width: 900px) {
          .dashboard-layout { flex-direction: column !important; }
          .sidebar-col { position: static !important; width: 100% !important; }
        }
      `}</style>

      {/* ── Top nav bar ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: palette.navBg, backdropFilter: 'blur(20px)',
        boxShadow: palette.shadow, padding: '0 5%',
        transition: 'background 0.25s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/">
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: palette.textPrimary }}>
              Mentora<span style={{ color: '#10B981' }}>.lk</span>
            </span>
          </Link>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification bell — no unread badge shown: there's no real
                notification backend yet (src/services/notification.ts is a
                stub), so this used to show a fake "3" regardless of reality. */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: palette.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={palette.textMuted} strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>{getInitial(user)}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: palette.textPrimary, lineHeight: 1.2 }}>{getDisplayName(user)}</span>
                <span style={{ fontSize: 11, color: palette.textMuted }}>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '88px 5% 48px' }}>
        <div className="dashboard-layout" style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
          <div className="sidebar-col">
            <Sidebar />
          </div>

          {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Welcome header */}
            <div className="fade-up" style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: '#10B981', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Welcome back 👋</p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, color: palette.textPrimary, lineHeight: 1.15 }}>
                My Learning Dashboard
              </h1>
              <p style={{ fontSize: 14, color: palette.textSecondary, marginTop: 6 }}>Track your classes, progress, and upcoming sessions.</p>
            </div>

            {/* ── STAT CARDS ──────────────────────────────────────────────── */}
            <div className="fade-up delay-1" style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Classes',    value: classes.length,        icon: '📚', color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', shadow: 'rgba(139,92,246,0.1)' },
                { label: 'Active Classes',   value: activeClasses.length,  icon: '🟢', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', shadow: 'rgba(16,185,129,0.1)'  },
                { label: 'Pending Approval', value: pendingClasses.length, icon: '⏳', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', shadow: 'rgba(245,158,11,0.1)'  },

              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ boxShadow: `0 4px 20px ${s.shadow}`, border: `1px solid ${s.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: palette.textPrimary, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: palette.textSecondary, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Link href="/dashboard/student/recommendations">
              <div
                style={{
                  background:'linear-gradient(135deg,#064E3B,#065F46)',
                  borderRadius:16, padding:'20px 24px', marginBottom:24,
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  cursor:'pointer', transition:'all 0.2s', flexWrap:'wrap', gap:12,
                }}
                onMouseEnter={e=>{
                  (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow='0 12px 32px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={e=>{
                  (e.currentTarget as HTMLDivElement).style.transform='translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow='none';
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                    ✨
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'white', margin:'0 0 4px' }}>
                      Find Your Perfect Tutor
                    </p>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', margin:0 }}>
                      Let our AI match you based on your subjects, budget and schedule
                    </p>
                  </div>
                </div>
                <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'10px 18px', color:'white', fontSize:13, fontWeight:700, flexShrink:0, border:'1px solid rgba(255,255,255,0.2)' }}>
                  Get Recommended Tutors →
                </div>
              </div>
            </Link>

            {/* ── TWO COLUMN: Classes + Right panel ───────────────────────── */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

              {/* Classes column */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Toolbar */}
                <div className="fade-up delay-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                  {/* Status filters */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { key: 'all',       label: `All (${classes.length})` },
                      { key: 'active',    label: `Active (${activeClasses.length})` },
                      { key: 'requested', label: `Pending (${pendingClasses.length})` },
                      { key: 'approved',  label: `Approved (${approvedClasses.length})` },
                    ].map(tab => (
                      <button key={tab.key} className="filter-tab" onClick={() => setStatus(tab.key)}
                        style={{
                          background:   statusFilter === tab.key ? '#10B981' : palette.surface,
                          color:        statusFilter === tab.key ? 'white'   : palette.textSecondary,
                          borderColor:  statusFilter === tab.key ? '#10B981' : palette.border,
                          boxShadow:    statusFilter === tab.key ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                        }}>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search + view toggle */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: palette.surface, border: `1.5px solid ${palette.border}`, borderRadius: 11, padding: '8px 14px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={palette.textMuted} strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        type="text" placeholder="Search classes..."
                        value={searchQuery} onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: 13, color: palette.textSecondary, background: 'transparent', width: 130, fontFamily: "'DM Sans',sans-serif" }}
                      />
                    </div>
                    {/* Grid / List toggle */}
                    <div style={{ display: 'flex', background: palette.surface, border: `1.5px solid ${palette.border}`, borderRadius: 11, overflow: 'hidden' }}>
                      {(['grid', 'list'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} style={{
                          padding: '8px 13px', border: 'none', cursor: 'pointer',
                          background: view === v ? '#10B981' : 'transparent',
                          color: view === v ? 'white' : palette.textMuted,
                          transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                        }}>
                          {v === 'grid'
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                          }
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Class cards */}
                <div className={`fade-up delay-3 ${view === 'grid' ? 'class-grid' : 'class-list'}`}>
                  {loading ? (
                    <div style={{ textAlign:'center', padding:'60px 0', gridColumn:'1/-1' }}>
                      <div style={{ width:40, height:40, border:`3px solid ${palette.border}`, borderTop:'3px solid #10B981', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
                      <p style={{ color:palette.textMuted, fontSize:14 }}>Loading your classes...</p>
                    </div>
                  ) : error ? (
                    <div style={{ textAlign:'center', padding:'60px 0', gridColumn:'1/-1' }}>
                      <p style={{ fontSize:16, color:'#EF4444', fontWeight:600, marginBottom:16 }}>{error}</p>
                      <button onClick={() => setStatus('all')}
                        style={{ background:'#10B981', color:'white', border:'none', borderRadius:10, padding:'10px 24px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                        Try Again
                      </button>
                    </div>
                  ) : filtered.length > 0 ? (
                    filtered.map(enrollment => (
                      <MyClassCard
                        key={enrollment.id}
                        cls={{
                          id:               enrollment.id,
                          tutorId:          enrollment.class_id,
                          title:            enrollment.title,
                          tutor:            enrollment.tutor_name || 'Tutor',
                          subject:          enrollment.subject,
                          location:         enrollment.location,
                          mode:             enrollment.preferred_mode || enrollment.mode,
                          fee:              Number(enrollment.fee),
                          status:           enrollment.status,
                          sessionsAttended: enrollment.sessions_attended || 0,
                          totalSessions:    enrollment.max_students || 20,
                          nextSession:      enrollment.status === 'active'
                                              ? `${enrollment.selected_day} at ${enrollment.selected_time}`
                                              : enrollment.status === 'requested'
                                              ? 'Awaiting tutor approval'
                                              : enrollment.status === 'approved'
                                              ? `Starts ${enrollment.selected_day} at ${enrollment.selected_time}`
                                              : 'Cancelled',
                          image:            enrollment.image,
                        }}
                        view={view}
                        onCancel={() => handleCancel(enrollment.id)}
                        onView={() => setSelectedEnrollment(enrollment)}
                      />
                    ))
                  ) : (
                    <div style={{ textAlign:'center', padding:'60px 0', gridColumn:'1/-1', color:palette.textMuted }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>🎓</div>
                      <p style={{ fontSize:16, fontWeight:600 }}>No classes found</p>
                      <p style={{ fontSize:13, marginTop:6 }}>
                        {statusFilter !== 'all' ? 'Try a different filter' : 'You have not enrolled in any classes yet'}
                      </p>
                      <Link href="/classes/search">
                        <button style={{ marginTop:20, background:'#10B981', color:'white', border:'none', borderRadius:10, padding:'11px 28px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                          Browse Classes
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
              <div className="fade-up delay-4" style={{ width: 260, flexShrink: 0 }}>
                {/* Upcoming sessions panel could be added here */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedEnrollment && (
        <EnrollmentDetailsModal enrollment={selectedEnrollment} onClose={() => setSelectedEnrollment(null)} />
      )}
    </>
  );
}
