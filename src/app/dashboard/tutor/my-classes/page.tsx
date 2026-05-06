'use client';

import { useState } from 'react';
import Link from 'next/link';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';

type TutorClass = {
  id: number; title: string; subject: string; location: string;
  mode: 'online' | 'offline' | 'both'; fee: number; rating: number;
  status: 'active' | 'pending' | 'completed';
  studentsEnrolled: number; totalSlots: number; nextSession: string; image: string;
};

const MY_CLASSES: TutorClass[] = [
  { id:1, title:'A/L Combined Mathematics',  subject:'Mathematics', location:'Moratuwa', mode:'online',  fee:2500, rating:4.8, status:'active',    studentsEnrolled:18, totalSlots:25, nextSession:'Mon, 6:00 PM', image:'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80' },
  { id:2, title:'Advanced Level : ICT',       subject:'ICT',         location:'Colombo',  mode:'online',  fee:3000, rating:4.6, status:'active',    studentsEnrolled:12, totalSlots:20, nextSession:'Wed, 5:00 PM', image:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80' },
  { id:3, title:'A/L Physics Full Syllabus',  subject:'Physics',     location:'Moratuwa', mode:'offline', fee:2000, rating:4.9, status:'active',    studentsEnrolled:8,  totalSlots:15, nextSession:'Fri, 4:00 PM', image:'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80' },
  { id:4, title:'Music : Guitar For Beginners',subject:'Music',      location:'Matale',   mode:'both',    fee:1500, rating:4.7, status:'pending',   studentsEnrolled:0,  totalSlots:10, nextSession:'Awaiting approval', image:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80' },
  { id:5, title:'A/L Chemistry',              subject:'Chemistry',   location:'Colombo',  mode:'both',    fee:3500, rating:4.5, status:'completed', studentsEnrolled:22, totalSlots:22, nextSession:'Completed', image:'https://images.unsplash.com/photo-1532094349884-543559c1a21c?w=400&q=80' },
];

const STATUS_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  active:    { color:'#059669', bg:'#ECFDF5', label:'ACTIVE' },
  pending:   { color:'#D97706', bg:'#FFFBEB', label:'PENDING' },
  completed: { color:'#6B7280', bg:'#F3F4F6', label:'COMPLETED' },
};

export default function MyClassesPage() {
  const [statusFilter, setStatus] = useState('all');
  const [searchQuery,  setSearch] = useState('');
  const [view, setView] = useState<'grid'|'list'>('grid');

  const active    = MY_CLASSES.filter(c => c.status === 'active');
  const pending   = MY_CLASSES.filter(c => c.status === 'pending');
  const completed = MY_CLASSES.filter(c => c.status === 'completed');

  const filtered = MY_CLASSES.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <TutorDashboardLayout title="My Classes" subtitle="All the classes you teach on Mentora.lk.">
      <style>{`
        .cls-card{transition:all 0.25s cubic-bezier(.22,1,.36,1);} .cls-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.12)!important;}
        .filter-tab{padding:7px 18px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .cls-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:22px;}
        .cls-list{display:flex;flex-direction:column;gap:14px;}
      `}</style>

      {/* Stats */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { label:'Total Classes',    v:MY_CLASSES.length, color:'#8B5CF6', bg:'#F5F3FF', border:'#DDD6FE' },
          { label:'Active Classes',   v:active.length,     color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
          { label:'Pending Approval', v:pending.length,    color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
          { label:'Completed',        v:completed.length,  color:'#6B7280', bg:'#F3F4F6', border:'#E5E7EB' },
        ].map((s,i) => (
          <div key={i} style={{ background:'white', borderRadius:16, padding:'16px 20px', border:`1px solid ${s.border}`, flex:1, minWidth:120 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:s.color }}>{s.v}</div>
            <div style={{ fontSize:12, color:'#6B7280', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:22 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {[
            { key:'all',       label:`All (${MY_CLASSES.length})` },
            { key:'active',    label:`Active (${active.length})` },
            { key:'pending',   label:`Pending (${pending.length})` },
            { key:'completed', label:'Completed' },
          ].map(tab => (
            <button key={tab.key} className="filter-tab" onClick={() => setStatus(tab.key)}
              style={{ background:statusFilter===tab.key?'#10B981':'white', color:statusFilter===tab.key?'white':'#6B7280', borderColor:statusFilter===tab.key?'#10B981':'#E5E7EB', boxShadow:statusFilter===tab.key?'0 4px 12px rgba(16,185,129,0.3)':'none' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'white', border:'1.5px solid #E5E7EB', borderRadius:11, padding:'8px 14px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search classes..." value={searchQuery} onChange={e => setSearch(e.target.value)} style={{ border:'none', outline:'none', fontSize:13, color:'#374151', background:'transparent', width:130, fontFamily:"'DM Sans',sans-serif" }} />
          </div>
          <div style={{ display:'flex', background:'white', border:'1.5px solid #E5E7EB', borderRadius:11, overflow:'hidden' }}>
            {(['grid','list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding:'8px 13px', border:'none', cursor:'pointer', background:view===v?'#10B981':'transparent', color:view===v?'white':'#9CA3AF', transition:'all 0.2s', display:'flex', alignItems:'center' }}>
                {v === 'grid'
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
              </button>
            ))}
          </div>
          <Link href="/dashboard/tutor/post-ad">
            <button style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:11, padding:'9px 18px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}>+ Post New</button>
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className={view === 'grid' ? 'cls-grid' : 'cls-list'}>
        {filtered.length > 0 ? filtered.map(cls => {
          const st = STATUS_COLOR[cls.status];
          const progress = Math.round((cls.studentsEnrolled / cls.totalSlots) * 100);
          return view === 'grid' ? (
            <div key={cls.id} className="cls-card" style={{ background:'white', borderRadius:18, boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1px solid rgba(0,0,0,0.04)', overflow:'hidden' }}>
              <div style={{ position:'relative', height:140, overflow:'hidden' }}>
                <img src={cls.image} alt={cls.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.5),transparent)' }} />
                <span style={{ position:'absolute', top:12, right:12, background:st.bg, color:st.color, fontSize:10, fontWeight:700, borderRadius:6, padding:'3px 8px' }}>{st.label}</span>
                <span style={{ position:'absolute', bottom:12, left:12, color:'white', fontSize:12, fontWeight:600 }}>⭐ {cls.rating}</span>
              </div>
              <div style={{ padding:'16px 18px' }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#111827', marginBottom:4, lineHeight:1.3 }}>{cls.title}</p>
                <p style={{ fontSize:12, color:'#9CA3AF', marginBottom:12 }}>{cls.subject} · {cls.mode} · {cls.location}</p>
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6B7280', marginBottom:5 }}>
                    <span>{cls.studentsEnrolled}/{cls.totalSlots} students</span>
                    <span style={{ color:'#10B981', fontWeight:600 }}>{progress}%</span>
                  </div>
                  <div style={{ height:5, background:'#F3F4F6', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg,#10B981,#059669)', borderRadius:99 }} />
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>Rs. {cls.fee.toLocaleString()}/mo</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <button style={{ fontSize:11, fontWeight:600, color:'#6366F1', background:'#EEF2FF', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Edit</button>
                    <button style={{ fontSize:11, fontWeight:600, color:'#DC2626', background:'#FEF2F2', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={cls.id} className="cls-card" style={{ background:'white', borderRadius:16, boxShadow:'0 4px 16px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', padding:'18px 20px', display:'flex', alignItems:'center', gap:16 }}>
              <img src={cls.image} alt={cls.title} style={{ width:64, height:64, borderRadius:12, objectFit:'cover', flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <p style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{cls.title}</p>
                  <span style={{ fontSize:10, fontWeight:700, color:st.color, background:st.bg, borderRadius:5, padding:'2px 7px' }}>{st.label}</span>
                </div>
                <p style={{ fontSize:12, color:'#9CA3AF' }}>{cls.subject} · {cls.studentsEnrolled}/{cls.totalSlots} students · {cls.nextSession}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#10B981', marginBottom:6 }}>Rs. {cls.fee.toLocaleString()}</p>
                <div style={{ display:'flex', gap:6 }}>
                  <button style={{ fontSize:11, fontWeight:600, color:'#6366F1', background:'#EEF2FF', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Edit</button>
                  <button style={{ fontSize:11, fontWeight:600, color:'#DC2626', background:'#FEF2F2', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF', gridColumn:'1/-1' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <p style={{ fontSize:16, fontWeight:600 }}>No classes found</p>
            <Link href="/dashboard/tutor/post-ad">
              <button style={{ marginTop:20, background:'#10B981', color:'white', border:'none', borderRadius:10, padding:'11px 28px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>+ Post New Class</button>
            </Link>
          </div>
        )}
      </div>
    </TutorDashboardLayout>
  );
}
