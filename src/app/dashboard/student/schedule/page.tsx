'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getMySchedule } from '@/services/enrollmentService';
import { usePalette } from '@/hooks/usePalette';
import { useEnrollmentStatusSocket } from '@/hooks/useEnrollmentStatusSocket';

export default function SchedulePage() {
  const palette = usePalette();
  // Real data from backend
  const [sessions,  setSessions]  = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // Fetch schedule from backend. `showLoading` is false for the socket-triggered
  // refresh below so a new approval doesn't flash the whole page back to a spinner.
  const fetchSchedule = async (showLoading = true) => {
    if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // A newly-approved class needs to be ADDED to the schedule (it wasn't there
  // before, since getMySchedule only returns approved/active enrollments), so
  // a silent refetch is simpler and more correct than patching local state —
  // the socket payload doesn't carry the joined course/tutor fields anyway.
  useEnrollmentStatusSocket(() => {
    fetchSchedule(false);
  });

  // Subject color map
  const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: '#8B5CF6', Physics: '#3B82F6', Chemistry: '#10B981',
    ICT: '#F59E0B', Music: '#EC4899', Business: '#F97316',
    English: '#06B6D4', Biology: '#84CC16',
  };

  // Sorted by day of week, tidy list — just date (day) and time per session
  const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const upcoming = [...sessions].sort((a, b) =>
    DAY_ORDER.indexOf(a.selectedDay) - DAY_ORDER.indexOf(b.selectedDay)
  );

  return (
    <DashboardLayout title="My Schedule" subtitle="View all your upcoming sessions in one place.">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
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

      {/* Tidy schedule list — just day & time per session */}
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
              <div key={i} className="upcoming-row" style={{ background:palette.surface, borderRadius:16, padding:'16px 20px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', border:`1px solid ${palette.border}`, display:'flex', alignItems:'center', gap:16 }}>

                {/* Date & time — the primary, tidy focus of this row */}
                <div style={{ width:96, flexShrink:0, textAlign:'center', background:`${color}12`, border:`1px solid ${color}30`, borderRadius:12, padding:'10px 6px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.selectedDay}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:palette.textPrimary, marginTop:3 }}>{s.selectedTime}</div>
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{subject}</p>
                    <span style={{ fontSize:10, fontWeight:700, color:s.preferred_mode==='online'||s.mode==='online'?'#10B981':'#3B82F6', background:s.preferred_mode==='online'||s.mode==='online'?'#ECFDF5':'#EFF6FF', borderRadius:5, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      {s.preferred_mode||s.mode}
                    </span>
                  </div>
                  <p style={{ fontSize:13, color:palette.textMuted }}>
                    By <span style={{ color:'#10B981', fontWeight:600 }}>{tutor}</span> · {s.course?.location || s.location || 'TBA'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

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
