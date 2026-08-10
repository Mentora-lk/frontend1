'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

const SESSIONS = [
  { id:1, day:'Mon', time:'6:00 PM', endTime:'7:30 PM', subject:'Mathematics', tutor:'Kasun Fernando', color:'#8B5CF6', mode:'online' },
  { id:2, day:'Wed', time:'6:00 PM', endTime:'7:30 PM', subject:'Mathematics', tutor:'Kasun Fernando', color:'#8B5CF6', mode:'online' },
  { id:3, day:'Wed', time:'5:00 PM', endTime:'6:30 PM', subject:'ICT',         tutor:'Nimesh Dissanayake', color:'#F59E0B', mode:'online' },
  { id:4, day:'Thu', time:'5:00 PM', endTime:'6:30 PM', subject:'ICT',         tutor:'Nimesh Dissanayake', color:'#F59E0B', mode:'online' },
  { id:5, day:'Fri', time:'4:00 PM', endTime:'5:30 PM', subject:'Chemistry',   tutor:'Dilshan Rajapaksa', color:'#10B981', mode:'both' },
  { id:6, day:'Sat', time:'9:00 AM', endTime:'10:30 AM', subject:'Mathematics', tutor:'Kasun Fernando', color:'#8B5CF6', mode:'online' },
];

const UPCOMING = [
  { subject:'Mathematics', tutor:'Kasun Fernando', day:'Monday',   time:'6:00 PM', date:'Today',     color:'#8B5CF6', mode:'online' },
  { subject:'ICT',         tutor:'Nimesh Dissanayake', day:'Wednesday', time:'5:00 PM', date:'In 2 days',  color:'#F59E0B', mode:'online' },
  { subject:'Mathematics', tutor:'Kasun Fernando', day:'Wednesday', time:'6:00 PM', date:'In 2 days',  color:'#8B5CF6', mode:'online' },
  { subject:'ICT',         tutor:'Nimesh Dissanayake', day:'Thursday',  time:'5:00 PM', date:'In 3 days',  color:'#F59E0B', mode:'online' },
  { subject:'Chemistry',   tutor:'Dilshan Rajapaksa', day:'Friday',    time:'4:00 PM', date:'In 4 days',  color:'#10B981', mode:'both' },
];

export default function SchedulePage() {
  const [view, setView] = useState<'week'|'list'>('week');

  return (
    <DashboardLayout title="My Schedule" subtitle="View all your upcoming sessions in one place.">
      <style>{`
        .session-block { transition: all 0.2s; cursor: pointer; }
        .session-block:hover { filter: brightness(1.08); transform: scale(1.02); }
        .upcoming-row { transition: all 0.22s; }
        .upcoming-row:hover { background: #F9FAFB !important; transform: translateX(4px); }
      `}</style>

      {/* View toggle + stats row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:16 }}>
          {[
            { label:'Sessions This Week', value:'5', color:'#8B5CF6', bg:'#F5F3FF', border:'#DDD6FE' },
            { label:'Hours of Learning',  value:'7.5h', color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
            { label:'Subjects Active',    value:'3', color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
          ].map(s=>(
            <div key={s.label} style={{ background:'white', borderRadius:16, padding:'14px 18px', border:`1px solid ${s.border}`, boxShadow:`0 4px 14px ${s.bg}` }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', background:'white', borderRadius:10, border:'1.5px solid #E5E7EB', overflow:'hidden' }}>
          {(['week','list'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:'8px 18px', border:'none', cursor:'pointer', background:view===v?'#10B981':'white', color:view===v?'white':'#6B7280', fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
              {v==='week'?'Week View':'List View'}
            </button>
          ))}
        </div>
      </div>

      {/* WEEK VIEW */}
      {view==='week' && (
        <div style={{ background:'white', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', overflow:'hidden' }}>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'80px repeat(7,1fr)', borderBottom:'1px solid #F3F4F6' }}>
            <div style={{ padding:'14px 12px' }}/>
            {DAYS.map(d=>(
              <div key={d} style={{ padding:'14px 8px', textAlign:'center', borderLeft:'1px solid #F3F4F6' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>{d}</p>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div style={{ maxHeight:520, overflowY:'auto' }}>
            {HOURS.map(hour=>(
              <div key={hour} style={{ display:'grid', gridTemplateColumns:'80px repeat(7,1fr)', borderBottom:'1px solid #F9FAFB', minHeight:52 }}>
                <div style={{ padding:'6px 12px', display:'flex', alignItems:'flex-start' }}>
                  <span style={{ fontSize:11, color:'#9CA3AF', fontWeight:500 }}>{hour}</span>
                </div>
                {DAYS.map(day=>{
                  const session = SESSIONS.find(s=>s.day===day && s.time===hour);
                  return (
                    <div key={day} style={{ borderLeft:'1px solid #F3F4F6', padding:'3px 4px', position:'relative' }}>
                      {session && (
                        <div className="session-block" style={{ background:`${session.color}18`, border:`1.5px solid ${session.color}40`, borderLeft:`4px solid ${session.color}`, borderRadius:8, padding:'6px 8px' }}>
                          <p style={{ fontSize:11, fontWeight:700, color:session.color, lineHeight:1.2 }}>{session.subject}</p>
                          <p style={{ fontSize:10, color:'#6B7280', marginTop:2 }}>{session.time}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ padding:'14px 20px', borderTop:'1px solid #F3F4F6', display:'flex', gap:20, flexWrap:'wrap' }}>
            {[{label:'Mathematics',color:'#8B5CF6'},{label:'ICT',color:'#F59E0B'},{label:'Chemistry',color:'#10B981'}].map(l=>(
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:l.color }}/>
                <span style={{ fontSize:12, color:'#6B7280' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view==='list' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {UPCOMING.map((s,i)=>(
            <div key={i} className="upcoming-row" style={{ background:'white', borderRadius:16, padding:'18px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.04)', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <p style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{s.subject}</p>
                  <span style={{ fontSize:10, fontWeight:700, color:s.mode==='online'?'#10B981':'#3B82F6', background:s.mode==='online'?'#ECFDF5':'#EFF6FF', borderRadius:5, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.mode}</span>
                </div>
                <p style={{ fontSize:13, color:'#9CA3AF' }}>By <span style={{ color:'#10B981', fontWeight:600 }}>{s.tutor}</span></p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{s.day} · {s.time}</p>
                <p style={{ fontSize:12, color: s.date==='Today'?'#10B981':'#9CA3AF', fontWeight: s.date==='Today'?700:400, marginTop:2 }}>{s.date}</p>
              </div>
            </div>
          ))}
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
    </DashboardLayout>
  );
}