'use client';

import { useState } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';

const REQUESTS = [
  { id:1, name:'Nimesh Perera',   avatar:'N', color:'#8B5CF6', subject:'Mathematics', class:'A/L Combined Mathematics', date:'28 Apr 2026', time:'2 mins ago',  message:'Hi, I am interested in joining your mathematics class. I am an A/L student.', status:'pending' },
  { id:2, name:'Dilshan Silva',   avatar:'D', color:'#F59E0B', subject:'ICT',         class:'Advanced Level : ICT',      date:'28 Apr 2026', time:'1 hour ago',  message:'I saw your profile and would love to join your ICT class this semester.',       status:'pending' },
  { id:3, name:'Amali Fernando',  avatar:'A', color:'#10B981', subject:'Physics',     class:'A/L Physics Full Syllabus', date:'27 Apr 2026', time:'1 day ago',   message:'Please consider my application. I am a hardworking student.',                  status:'pending' },
  { id:4, name:'Ruwan Bandara',   avatar:'R', color:'#3B82F6', subject:'Mathematics', class:'A/L Combined Mathematics', date:'26 Apr 2026', time:'2 days ago',  message:'I need to improve my math skills for the A/L exam next year.',               status:'approved' },
  { id:5, name:'Shalini Jayawardene', avatar:'S', color:'#EC4899', subject:'ICT',    class:'Advanced Level : ICT',      date:'25 Apr 2026', time:'3 days ago',  message:'Your reviews are great! Looking forward to joining your class.',              status:'rejected' },
];

export default function RequestsPage() {
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState(REQUESTS);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pending  = requests.filter(r => r.status === 'pending').length;

  const approve = (id: number) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  const reject  = (id: number) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));

  const statusStyle: Record<string, { color: string; bg: string }> = {
    pending:  { color:'#D97706', bg:'#FFFBEB' },
    approved: { color:'#059669', bg:'#ECFDF5' },
    rejected: { color:'#DC2626', bg:'#FEF2F2' },
  };

  return (
    <TutorDashboardLayout title="Student Requests" subtitle="Review and manage enrollment requests from students.">
      <style>{`
        .req-card{transition:all 0.22s;} .req-card:hover{transform:translateX(4px);}
        .approve-btn{background:#10B981;color:white;border:none;border-radius:9px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .approve-btn:hover{background:#059669;transform:scale(1.04);}
        .reject-btn{background:white;color:#DC2626;border:1.5px solid #FECACA;border-radius:9px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .reject-btn:hover{background:#FEF2F2;transform:scale(1.04);}
      `}</style>

      {/* Stats */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { label:'Total Requests', value:requests.length,  color:'#8B5CF6', bg:'#F5F3FF', border:'#DDD6FE' },
          { label:'Pending',        value:pending,           color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
          { label:'Approved',       value:requests.filter(r=>r.status==='approved').length, color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
          { label:'Rejected',       value:requests.filter(r=>r.status==='rejected').length, color:'#EF4444', bg:'#FEF2F2', border:'#FECACA' },
        ].map((s,i) => (
          <div key={i} style={{ background:'white', borderRadius:16, padding:'16px 20px', border:`1px solid ${s.border}`, boxShadow:`0 4px 14px ${s.bg}`, flex:1, minWidth:120 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 18px', borderRadius:99, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s', background:filter===f?'#10B981':'white', color:filter===f?'white':'#6B7280', borderColor:filter===f?'#10B981':'#E5E7EB', boxShadow:filter===f?'0 4px 12px rgba(16,185,129,0.3)':'none' }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* Request list */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {filtered.map(r => {
          const ss = statusStyle[r.status];
          return (
            <div key={r.id} className="req-card" style={{ background:'white', borderRadius:18, padding:'20px 24px', boxShadow:'0 4px 16px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:`${r.color}20`, color:r.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, flexShrink:0 }}>{r.avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2, flexWrap:'wrap' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{r.name}</p>
                    <span style={{ fontSize:11, fontWeight:700, color:ss.color, background:ss.bg, borderRadius:6, padding:'2px 9px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{r.status}</span>
                    <span style={{ fontSize:11, color:'#9CA3AF', marginLeft:'auto' }}>{r.time}</span>
                  </div>
                  <p style={{ fontSize:12, color:'#6366F1', fontWeight:600, marginBottom:8 }}>📚 {r.class}</p>
                  <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.5, background:'#F9FAFB', borderRadius:10, padding:'10px 14px', borderLeft:'3px solid #E5E7EB' }}>&ldquo;{r.message}&rdquo;</p>
                  {r.status === 'pending' && (
                    <div style={{ display:'flex', gap:10, marginTop:14 }}>
                      <button className="approve-btn" onClick={() => approve(r.id)}>✓ Approve</button>
                      <button className="reject-btn"  onClick={() => reject(r.id)}>✕ Decline</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <p style={{ fontSize:16, fontWeight:600 }}>No {filter} requests</p>
          </div>
        )}
      </div>
    </TutorDashboardLayout>
  );
}
