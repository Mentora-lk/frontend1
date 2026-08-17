'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { authService } from '@/services/authService';
import { classService } from '@/services/classService';
import { usePalette } from '@/hooks/usePalette';

type TutorClass = {
  id: number; title: string; subject: string; location: string;
  mode: 'online' | 'offline' | 'both'; fee: number; rating: number;
  status: 'active' | 'pending' | 'completed';
  studentsEnrolled: number; totalSlots: number; nextSession: string; image: string;
};

const STATUS_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  active:    { color:'#059669', bg:'#ECFDF5', label:'ACTIVE' },
  pending:   { color:'#D97706', bg:'#FFFBEB', label:'PENDING' },
  completed: { color:'#6B7280', bg:'#F3F4F6', label:'COMPLETED' },
};

export default function MyClassesPage() {
  const palette = usePalette();
  const [statusFilter, setStatus] = useState('all');
  const [searchQuery,  setSearch] = useState('');
  const [view, setView] = useState<'grid'|'list'>('grid');
  
  const [classes, setClasses] = useState<TutorClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await authService.getTutorDashboard();
        if (data.classes) {
          setClasses(data.classes);
        }
      } catch (err) {
        console.error("Failed to fetch classes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await classService.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Failed to delete class", err);
      alert("Failed to delete class. Please try again.");
    }
  };

  const filtered = classes.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <TutorDashboardLayout title="Dashboard" subtitle="All the classes you teach on Mentora.lk.">
      <style>{`
        .cls-card{transition:all 0.25s cubic-bezier(.22,1,.36,1);} .cls-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.12)!important;}
        .filter-tab{padding:7px 18px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .cls-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:22px;}
        .cls-list{display:flex;flex-direction:column;gap:14px;}
      `}</style>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', flexWrap:'wrap', gap:12, marginBottom:22 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:palette.surface, border:`1.5px solid ${palette.border}`, borderRadius:11, padding:'8px 14px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search classes..." value={searchQuery} onChange={e => setSearch(e.target.value)} style={{ border:'none', outline:'none', fontSize:13, color:palette.textSecondary, background:'transparent', width:130, fontFamily:"'DM Sans',sans-serif" }} />
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
          const thumbnail = cls.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80';
          return view === 'grid' ? (
            <div key={cls.id} className="cls-card" style={{ background:palette.surface, borderRadius:18, boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:`1px solid ${palette.border}`, overflow:'hidden' }}>
              <div style={{ position:'relative', height:140, overflow:'hidden' }}>
                <img src={thumbnail} alt={cls.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.5),transparent)' }} />
                <span style={{ position:'absolute', top:12, right:12, background:st.bg, color:st.color, fontSize:10, fontWeight:700, borderRadius:6, padding:'3px 8px' }}>{st.label}</span>
                <span style={{ position:'absolute', bottom:12, left:12, color:'white', fontSize:12, fontWeight:600 }}>⭐ {cls.rating}</span>
              </div>
              <div style={{ padding:'16px 18px' }}>
                <p style={{ fontSize:14, fontWeight:700, color:palette.textPrimary, marginBottom:4, lineHeight:1.3 }}>{cls.title}</p>
                <p style={{ fontSize:12, color:palette.textMuted, marginBottom:12 }}>{cls.subject} · {cls.mode} · {cls.location}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#10B981' }}>Rs. {cls.fee.toLocaleString()}/mo</span>
                  <div style={{ display:'flex', gap:6 }}>
                    <Link href={`/dashboard/tutor/edit-ad/${cls.id}`}>
                      <button style={{ fontSize:11, fontWeight:600, color:'#6366F1', background:'#EEF2FF', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Edit</button>
                    </Link>
                    <button onClick={() => handleDelete(cls.id)} style={{ fontSize:11, fontWeight:600, color:'#DC2626', background:'#FEF2F2', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div key={cls.id} className="cls-card" style={{ background:palette.surface, borderRadius:16, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, padding:'18px 20px', display:'flex', alignItems:'center', gap:16 }}>
              <img src={thumbnail} alt={cls.title} style={{ width:64, height:64, borderRadius:12, objectFit:'cover', flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{cls.title}</p>
                  <span style={{ fontSize:10, fontWeight:700, color:st.color, background:st.bg, borderRadius:5, padding:'2px 7px' }}>{st.label}</span>
                </div>
                <p style={{ fontSize:12, color:palette.textMuted }}>{cls.subject} · {cls.studentsEnrolled}/{cls.totalSlots} students · {cls.nextSession}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#10B981', marginBottom:6 }}>Rs. {cls.fee.toLocaleString()}</p>
                <div style={{ display:'flex', gap:6 }}>
                  <Link href={`/dashboard/tutor/edit-ad/${cls.id}`}>
                    <button style={{ fontSize:11, fontWeight:600, color:'#6366F1', background:'#EEF2FF', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Edit</button>
                  </Link>
                  <button onClick={() => handleDelete(cls.id)} style={{ fontSize:11, fontWeight:600, color:'#DC2626', background:'#FEF2F2', border:'none', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ textAlign:'center', padding:'60px 0', color:palette.textMuted, gridColumn:'1/-1' }}>
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
