'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getMySchedule } from '@/services/enrollmentService';
import { usePalette } from '@/hooks/usePalette';

export default function SchedulePage() {
  const palette = usePalette();
  // Real data from backend
  const [sessions,  setSessions]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Keep existing UI state
  const [view, setView] = useState<'week'|'list'>('week');

  // Keep DAYS and HOURS constants for week grid UI
  const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const HOURS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
                 '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
                 '6:00 PM','7:00 PM','8:00 PM'];

  // Fetch schedule from backend
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMySchedule();
        setSessions(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          window.location.href = '/auth/login';
          return;
        }
        setError('Failed to load your schedule. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Subject color map
  const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: '#8B5CF6', Physics: '#3B82F6', Chemistry: '#10B981',
    ICT: '#F59E0B', Music: '#EC4899', Business: '#F97316',
    English: '#06B6D4', Biology: '#84CC16',
  };

  // Stats calculated from real session data
  const totalSessions   = sessions.length;
  const uniqueSubjects  = [...new Set(sessions.map(s => s.course?.subject || s.subject))];
  const totalHours      = sessions.length * 1.5;

  // Build week grid map from sessions
  const sessionMap: Record<string, any> = {};
  sessions.forEach(s => {
    const dayShort = s.selectedDay?.slice(0, 3);
    const key      = `${dayShort}-${s.selectedTime}`;
    sessionMap[key] = s;
  });

  // Build upcoming list sorted by day
  const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const upcoming = [...sessions].sort((a, b) =>
    DAY_ORDER.indexOf(a.selectedDay) - DAY_ORDER.indexOf(b.selectedDay)
  );

  return (
    <DashboardLayout title="My Schedule" subtitle="View all your upcoming sessions in one place.">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .session-block { transition: all 0.2s; cursor: pointer; }
        .session-block:hover { filter: brightness(1.08); transform: scale(1.02); }
        .upcoming-row { transition: all 0.22s; }
        .upcoming-row:hover { background: #F9FAFB !important; transform: translateX(4px); }
      `}</style>

      {loading ? (
        <div style={{ textAlign:'center', padding:'80px 0' }}>
          <div style={{ width:40, height:40, border:'3px solid #E5E7EB', borderTop:'3px solid #10B981', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
          <p style={{ color:palette.textMuted, fontSize:14 }}>Loading your schedule...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign:'center', padding:'80px 0' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
          <p style={{ fontSize:16, color:'#EF4444', fontWeight:600, marginBottom:16 }}>{error}</p>
          <button onClick={() => window.location.reload()}
            style={{ background:'#10B981', color:'white', border:'none', borderRadius:10, padding:'10px 24px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
            Try Again
          </button>
        </div>
      ) : (
        <>

      {/* View toggle + stats row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:16 }}>
          {[
            { label:'Sessions This Week', value: totalSessions,              color:'#8B5CF6', bg:'#F5F3FF', border:'#DDD6FE' },
            { label:'Hours of Learning',  value: `${totalHours}h`,          color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
            { label:'Subjects Active',    value: uniqueSubjects.length,      color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
          ].map(s=>(
            <div key={s.label} style={{ background:palette.surface, borderRadius:16, padding:'14px 18px', border:`1px solid ${s.border}`, boxShadow:`0 4px 14px ${s.bg}` }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:palette.textSecondary, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', background:palette.surface, borderRadius:10, border:`1.5px solid ${palette.border}`, overflow:'hidden' }}>
          {(['week','list'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'8px 18px', border:'none', cursor:'pointer', background:view===v?'#10B981':palette.surface, color:view===v?`white`:palette.textSecondary, fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
              {v==='week'?'Week View':'List View'}
            </button>
          ))}
        </div>
      </div>

      {/* WEEK VIEW */}
      {view==='week' && (
        <div style={{ background:palette.surface, borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:`1px solid ${palette.border}`, overflow:'hidden' }}>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'80px repeat(7,1fr)', borderBottom:`1px solid ${palette.border}` }}>
            <div style={{ padding:'14px 12px' }}/>
            {DAYS.map(d=>(
              <div key={d} style={{ padding:'14px 8px', textAlign:'center', borderLeft:`1px solid ${palette.border}` }}>
                <p style={{ fontSize:12, fontWeight:700, color:palette.textSecondary, textTransform:'uppercase', letterSpacing:'0.06em' }}>{d}</p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div style={{ maxHeight:520, overflowY:'auto' }}>
            {HOURS.map(hour=>(
              <div key={hour} style={{ display:'grid', gridTemplateColumns:'80px repeat(7,1fr)', borderBottom:`1px solid ${palette.border}`, minHeight:52 }}>
                <div style={{ padding:'6px 12px', display:'flex', alignItems:'flex-start' }}>
                  <span style={{ fontSize:11, color:palette.textMuted, fontWeight:500 }}>{hour}</span>
                </div>
                {DAYS.map(day=>{
                  const key     = `${day}-${hour}`;
                  const session = sessionMap[key];
                  const subject = session?.course?.subject || session?.subject;
                  const color   = session ? (SUBJECT_COLORS[subject] || '#6B7280') : null;

                  return (
                    <div key={day} style={{ borderLeft:`1px solid ${palette.border}`, padding:'3px 4px' }}>
                      {session && color && (
                        <div className="session-block" style={{ background:`${color}18`, border:`1.5px solid ${color}40`, borderLeft:`4px solid ${color}`, borderRadius:8, padding:'6px 8px' }}>
                          <p style={{ fontSize:11, fontWeight:700, color, lineHeight:1.2 }}>{subject}</p>
                          <p style={{ fontSize:10, color:palette.textSecondary, marginTop:2 }}>{session.selectedTime}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ padding:'14px 20px', borderTop:`1px solid ${palette.border}`, display:'flex', gap:20, flexWrap:'wrap' }}>
            {uniqueSubjects.map(subject=>(
              <div key={subject} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div style={{ width:12, height:12, borderRadius:3, background: SUBJECT_COLORS[subject] || '#6B7280' }}/>
                <span style={{ fontSize:12, color:palette.textSecondary }}>{subject}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view==='list' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {upcoming.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', background:palette.surface, borderRadius:20, color:palette.textMuted }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <p style={{ fontSize:16, fontWeight:600 }}>No sessions scheduled</p>
              <p style={{ fontSize:13, marginTop:6 }}>Enroll in a class to see your schedule here</p>
            </div>
          ) : (
            upcoming.map((s, i)=>{
              const subject = s.course?.subject || s.subject;
              const tutor   = s.course?.tutor?.name || s.tutor;
              const color   = SUBJECT_COLORS[subject] || '#6B7280';
              return (
                <div key={i} className="upcoming-row" style={{ background:palette.surface, borderRadius:16, padding:'18px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', border:`1px solid ${palette.border}`, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{subject}</p>
                      <span style={{ fontSize:10, fontWeight:700, color:s.preferred_mode==='online'||s.mode==='online'?'#10B981':'#3B82F6', background:s.preferred_mode==='online'||s.mode==='online'?'#ECFDF5':'#EFF6FF', borderRadius:5, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                        {s.preferred_mode||s.mode}
                      </span>
                    </div>
                    <p style={{ fontSize:13, color:palette.textMuted }}>By <span style={{ color:'#10B981', fontWeight:600 }}>{tutor}</span></p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:14, fontWeight:700, color:palette.textPrimary }}>{s.selectedDay} · {s.selectedTime}</p>
                    <p style={{ fontSize:12, color:palette.textMuted, marginTop:2 }}>{s.course?.location || s.location || 'TBA'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Quick action */}
      <div style={{ marginTop:28, background:'linear-gradient(135deg,#064E3B,#065F46)', borderRadius:20, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
        <div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'white', marginBottom:4 }}>Want more sessions?</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Browse and enroll in new classes anytime.</p>
        </div>
        <Link href="/classes/search">
          <button style={{ background:'white', color:'#065F46', border:'none', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            Browse Classes →
          </button>
        </Link>
      </div>
        </>
      )}
    </DashboardLayout>
  );
}