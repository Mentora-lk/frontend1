'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { authService } from '@/services/authService';
import { tutorService } from '@/services/tutorService';
import { usePalette } from '@/hooks/usePalette';

type TutorClass = {
  id: number;
  title: string;
  subject: string;
  location: string;
  mode: 'online' | 'offline' | 'both';
  fee: number;
  rating: number;
  status: 'active' | 'pending' | 'completed';
  studentsEnrolled: number;
  totalSlots: number;
  nextSession: string;
  image: string;
};



const STATUS_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  active:    { color: '#059669', bg: '#ECFDF5', label: 'ACTIVE' },
  pending:   { color: '#D97706', bg: '#FFFBEB', label: 'PENDING' },
  completed: { color: '#6B7280', bg: '#F3F4F6', label: 'COMPLETED' },
};

export default function TutorDashboard() {
  const palette = usePalette();
  const [view, setView]       = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatus] = useState('all');
  const [searchQuery, setSearch]  = useState('');
  
  const [classes, setClasses] = useState<TutorClass[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Full enrollment list (all statuses) — used to build the "Active Students" modal.
  // Reuses the same data the Requests page already fetches, just filtered here to
  // active/approved so we can show who's actually enrolled, in which class, and when.
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await authService.getTutorDashboard();
        if (data.classes && data.classes.length > 0) setClasses(data.classes);
        if (data.recentRequests && data.recentRequests.length > 0) setRecentRequests(data.recentRequests);
        if (data.upcomingSessions && data.upcomingSessions.length > 0) setUpcomingSessions(data.upcomingSessions);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();

    const fetchRequests = async () => {
      try {
        const data = await tutorService.getRequests();
        setAllRequests(data || []);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      }
    };
    fetchRequests();
  }, []);

  const activeStudents = allRequests.filter(r => r.status === 'active' || r.status === 'approved');
  // "Pending Requests" is a count of enrollment requests, not course records — courses
  // can only ever be active/inactive/draft, so filtering `classes` by status:'pending'
  // (the old approach) always returned 0 regardless of real pending requests.
  const pendingRequestsCount = allRequests.filter(r => r.status === 'pending').length;

  const activeClasses  = classes.filter(c => c.status === 'active');
  const pendingClasses = classes.filter(c => c.status === 'pending');
  const totalStudents  = activeClasses.reduce((s, c) => s + c.studentsEnrolled, 0);
  const monthlyEarnings = activeClasses.reduce((s, c) => s + c.fee * c.studentsEnrolled, 0);

  const filtered = classes.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <TutorDashboardLayout title="My Teaching Dashboard" subtitle="Manage your classes, students, and track your earnings.">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        .fade-up{animation:fadeUp 0.6s cubic-bezier(.22,1,.36,1) both;}
        .delay-1{animation-delay:0.08s;} .delay-2{animation-delay:0.16s;}
        .delay-3{animation-delay:0.24s;} .delay-4{animation-delay:0.32s;}
        .stat-card{background:${palette.surface};border-radius:18px;padding:20px 22px;flex:1;transition:all 0.28s cubic-bezier(.22,1,.36,1);border:1px solid ${palette.border};}
        .stat-card:hover{transform:translateY(-5px);}
        .filter-tab{padding:7px 18px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .class-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:22px;}
        .class-list{display:flex;flex-direction:column;gap:16px;}
        .class-card-hover{transition:all 0.25s cubic-bezier(.22,1,.36,1);}
        .class-card-hover:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.12)!important;}
      `}</style>

      {/* ── STAT CARDS ── */}
      <div className="fade-up delay-1" style={{ display:'flex', gap:16, marginBottom:28, flexWrap:'wrap' }}>
        {[
          { label:'Total Classes',    value: classes.length,       icon:'📚', color:'#8B5CF6', bg:'#F5F3FF', border:'#DDD6FE', shadow:'rgba(139,92,246,0.1)', clickable:false },
          { label:'Active Students',  value: totalStudents,        icon:'🎓', color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0', shadow:'rgba(16,185,129,0.1)', clickable:true  },
          { label:'Pending Requests', value: pendingRequestsCount, icon:'⏳', color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A', shadow:'rgba(245,158,11,0.1)', clickable:false },
          { label:'Monthly Earnings', value:`Rs.${(monthlyEarnings/1000).toFixed(0)}K`, icon:'💰', color:'#3B82F6', bg:'#EFF6FF', border:'#BFDBFE', shadow:'rgba(59,130,246,0.1)', clickable:false },
        ].map((s, i) => (
          <div key={i} className="stat-card" onClick={() => s.clickable && setShowStudentsModal(true)}
            style={{ boxShadow:`0 4px 20px ${s.shadow}`, border:`1px solid ${s.border}`, cursor: s.clickable ? 'pointer' : 'default' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{s.icon}</div>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:palette.textPrimary, lineHeight:1, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:13, color:palette.textSecondary, fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── TWO COLUMN ── */}
      <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* Classes column */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Toolbar */}
          <div className="fade-up delay-2" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[
                { key:'all',       label:`All (${classes.length})` },
                { key:'active',    label:`Active (${activeClasses.length})` },
                { key:'pending',   label:`Pending (${pendingClasses.length})` },
                { key:'completed', label:'Completed' },
              ].map(tab => (
                <button key={tab.key} className="filter-tab" onClick={() => setStatus(tab.key)}
                  style={{
                    background:  statusFilter === tab.key ? '#10B981' : palette.surface,
                    color:       statusFilter === tab.key ? 'white'   : palette.textSecondary,
                    borderColor: statusFilter === tab.key ? '#10B981' : palette.border,
                    boxShadow:   statusFilter === tab.key ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search + view toggle */}
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:palette.surface, border:`1.5px solid ${palette.border}`, borderRadius:11, padding:'8px 14px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search classes..." value={searchQuery} onChange={e => setSearch(e.target.value)}
                  style={{ border:'none', outline:'none', fontSize:13, color:palette.textSecondary, background:'transparent', width:130, fontFamily:"'DM Sans',sans-serif" }} />
              </div>
              <div style={{ display:'flex', background:palette.surface, border:`1.5px solid ${palette.border}`, borderRadius:11, overflow:'hidden' }}>
                {(['grid','list'] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ padding:'8px 13px', border:'none', cursor:'pointer', background:view===v?'#10B981':'transparent', color:view===v?'white':palette.textMuted, transition:'all 0.2s', display:'flex', alignItems:'center' }}>
                    {v === 'grid'
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Class cards */}
          <div className={`fade-up delay-3 ${view === 'grid' ? 'class-grid' : 'class-list'}`}>
            {filtered.length > 0 ? filtered.map(cls => {
              const st = STATUS_COLOR[cls.status];
              const progress = Math.round((cls.studentsEnrolled / cls.totalSlots) * 100);
              const thumbnail = cls.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80';
              return view === 'grid' ? (
                <div key={cls.id} className="class-card-hover" style={{ background:palette.surface, borderRadius:18, boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:`1px solid ${palette.border}`, overflow:'hidden' }}>
                  <div style={{ position:'relative', height:140, overflow:'hidden' }}>
                    <img src={thumbnail} alt={cls.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.5),transparent)' }} />
                    <span style={{ position:'absolute', top:12, right:12, background:st.bg, color:st.color, fontSize:10, fontWeight:700, borderRadius:6, padding:'3px 8px', letterSpacing:'0.06em' }}>{st.label}</span>
                  </div>
                  <div style={{ padding:'16px 18px' }}>
                    <p style={{ fontSize:14, fontWeight:700, color:palette.textPrimary, marginBottom:4, lineHeight:1.3 }}>{cls.title}</p>
                    <p style={{ fontSize:12, color:palette.textMuted, marginBottom:12 }}>{cls.subject} · {cls.mode}</p>
                    {/* Progress bar */}
                    <div style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:palette.textSecondary, marginBottom:5 }}>
                        <span>{cls.studentsEnrolled}/{cls.totalSlots} students</span>
                        <span style={{ color:'#10B981', fontWeight:600 }}>{progress}%</span>
                      </div>
                      <div style={{ height:5, background:palette.surfaceAlt, borderRadius:99, overflow:'hidden' }}>
                        <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#10B981,#059669)', borderRadius:99, transition:'width 0.6s ease' }} />
                      </div>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>Rs. {cls.fee.toLocaleString()}/mo</span>
                      <span style={{ fontSize:11, color:palette.textMuted }}>{cls.nextSession}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={cls.id} className="class-card-hover" style={{ background:palette.surface, borderRadius:16, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, padding:'18px 20px', display:'flex', alignItems:'center', gap:16 }}>
                  <img src={thumbnail} alt={cls.title} style={{ width:64, height:64, borderRadius:12, objectFit:'cover', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{cls.title}</p>
                      <span style={{ fontSize:10, fontWeight:700, color:st.color, background:st.bg, borderRadius:5, padding:'2px 7px' }}>{st.label}</span>
                    </div>
                    <p style={{ fontSize:12, color:palette.textMuted }}>{cls.subject} · {cls.mode} · {cls.studentsEnrolled} students</p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:'#10B981' }}>Rs. {cls.fee.toLocaleString()}</p>
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign:'center', padding:'60px 0', color:palette.textMuted, gridColumn:'1/-1' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                <p style={{ fontSize:16, fontWeight:600 }}>No classes found</p>
                <p style={{ fontSize:13, marginTop:6 }}>Try a different filter or post a new class</p>
                <Link href="/dashboard/tutor/post-ad">
                  <button style={{ marginTop:20, background:'#10B981', color:'white', border:'none', borderRadius:10, padding:'11px 28px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    + Post New Class
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="fade-up delay-4" style={{ width:260, flexShrink:0 }}>

          {/* Upcoming sessions */}
          <div style={{ background:palette.surface, borderRadius:20, padding:22, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, marginBottom:20 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:palette.textPrimary, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Upcoming Sessions
            </h3>
            {upcomingSessions.map((s: any, i: number) => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 0', borderBottom: i < upcomingSessions.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width:40, height:40, borderRadius:11, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:palette.textPrimary, marginBottom:2 }}>{s.subject}</p>
                  <p style={{ fontSize:11, color:palette.textMuted }}>{s.students} students</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:11, fontWeight:600, color:palette.textSecondary }}>{s.time.split('·')[0].trim()}</p>
                  <p style={{ fontSize:10, color:palette.textMuted }}>{s.time.split('·')[1]?.trim()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent requests */}
          <div style={{ background:palette.surface, borderRadius:20, padding:22, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:palette.textPrimary }}>New Requests</h3>
              <Link href="/dashboard/tutor/requests"><span style={{ fontSize:12, color:'#10B981', fontWeight:600, cursor:'pointer' }}>View all</span></Link>
            </div>
            {recentRequests.map((r: any, i: number) => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i < recentRequests.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`${r.color}20`, color:r.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 }}>{r.avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:palette.textPrimary, marginBottom:1 }}>{r.name}</p>
                  <p style={{ fontSize:11, color:palette.textMuted }}>{r.subject}</p>
                </div>
                <p style={{ fontSize:10, color:palette.textMuted, flexShrink:0 }}>{r.time}</p>
              </div>
            ))}
            <Link href="/dashboard/tutor/requests">
              <button style={{ width:'100%', marginTop:14, background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:10, padding:'9px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                Review Requests
              </button>
            </Link>
          </div>

          {/* Quick earnings */}
          <div style={{ background:'linear-gradient(135deg,#064E3B,#065F46)', borderRadius:20, padding:22 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>This Month</p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:'white', marginBottom:4 }}>Rs. {monthlyEarnings.toLocaleString()}</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:16 }}>From {activeClasses.length} active classes</p>
            <div style={{ height:1, background:'rgba(255,255,255,0.15)', marginBottom:16 }} />
            <div>
              <p style={{ fontSize:18, fontWeight:900, color:'white', fontFamily:"'Playfair Display',serif" }}>{totalStudents}</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE STUDENTS MODAL ── */}
      {showStudentsModal && (
        <div
          onClick={() => setShowStudentsModal(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:palette.surface, borderRadius:22, width:'100%', maxWidth:640, maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', border:`1px solid ${palette.border}` }}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:`1px solid ${palette.border}` }}>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:800, color:palette.textPrimary }}>Active Students</h3>
                <p style={{ fontSize:12, color:palette.textMuted, marginTop:2 }}>{activeStudents.length} student{activeStudents.length !== 1 ? 's' : ''} currently enrolled</p>
              </div>
              <button onClick={() => setShowStudentsModal(false)}
                style={{ width:32, height:32, borderRadius:10, border:'none', background:palette.surfaceAlt, color:palette.textSecondary, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                ✕
              </button>
            </div>

            <div style={{ padding:'16px 24px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:12 }}>
              {activeStudents.length > 0 ? activeStudents.map((r: any) => {
                const avatar = r.avatar || r.name?.charAt(0)?.toUpperCase() || '?';
                const color  = r.color || '#10B981';
                return (
                  <div key={r.id} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px', background:palette.surfaceAlt, borderRadius:14, border:`1px solid ${palette.border}` }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', background:`${color}20`, color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, flexShrink:0 }}>{avatar}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:3 }}>
                        <p style={{ fontSize:14, fontWeight:700, color:palette.textPrimary }}>{r.name || 'Unknown Student'}</p>
                        <span style={{ fontSize:10, fontWeight:700, color:'#059669', background:'#ECFDF5', borderRadius:6, padding:'2px 8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{r.status}</span>
                      </div>
                      <p style={{ fontSize:12, color:'#6366F1', fontWeight:600, marginBottom:6 }}>📚 {r.class || r.className || 'Class'}</p>
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                        <span style={{ fontSize:12, color:palette.textSecondary }}>
                          🗓️ <b style={{ color:palette.textPrimary }}>{r.selectedDay || 'TBD'}</b>
                        </span>
                        <span style={{ fontSize:12, color:palette.textSecondary }}>
                          🕐 <b style={{ color:palette.textPrimary }}>{r.selectedTime || 'TBD'}</b>
                        </span>
                        {r.email && <span style={{ fontSize:12, color:palette.textMuted }}>✉️ {r.email}</span>}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign:'center', padding:'50px 0', color:palette.textMuted }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>🎓</div>
                  <p style={{ fontSize:14, fontWeight:600 }}>No active students yet</p>
                  <p style={{ fontSize:12, marginTop:4 }}>Approve a pending request to see students here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TutorDashboardLayout>
  );
}