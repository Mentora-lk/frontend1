'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [form, setForm] = useState({
    name:   'D.M.S.N. Dissanayake',
    email:  'dissanayake@student.com',
    phone:  '077 123 4567',
    school: 'University of Moratuwa',
    grade:  'Undergraduate (Year 2)',
    bio:    'IT undergraduate passionate about software development and mathematics.',
    address:'Moratuwa, Western Province, Sri Lanka',
  });

  const update = (key: string, val: string) => setForm(f=>({...f,[key]:val}));

  const save = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(()=>setSaved(false), 3000);
  };

  const inp = (key: string, placeholder: string, type='text') => (
    <input
      type={type}
      value={(form as any)[key]}
      onChange={e=>update(key,e.target.value)}
      placeholder={placeholder}
      disabled={!editing}
      style={{ width:'100%', padding:'11px 14px', borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'#111827', border:`1.5px solid ${editing?'#E5E7EB':'transparent'}`, background:editing?'white':'#F9FAFB', outline:'none', transition:'all 0.2s', cursor:editing?'text':'default' }}
      onFocus={e=>{ if(editing){ e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)'; }}}
      onBlur={e=>{ e.target.style.borderColor=editing?'#E5E7EB':'transparent'; e.target.style.boxShadow='none'; }}
    />
  );

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information.">
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}`}</style>

      {/* Saved toast */}
      {saved && (
        <div style={{ position:'fixed', top:84, right:24, zIndex:999, background:'#10B981', color:'white', borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(16,185,129,0.4)', display:'flex', alignItems:'center', gap:8, animation:'slideDown 0.3s ease' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Profile saved successfully!
        </div>
      )}

      <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* Left — Avatar card */}
        <div style={{ width:240, flexShrink:0 }}>
          <div style={{ background:'white', borderRadius:20, padding:'28px 20px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', textAlign:'center' }}>
            <div style={{ position:'relative', display:'inline-block', marginBottom:16 }}>
              <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:34, fontFamily:"'Playfair Display',serif", margin:'0 auto', boxShadow:'0 8px 24px rgba(16,185,129,0.4)' }}>D</div>
              {editing && (
                <div style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#111827', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              )}
            </div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:'#111827', marginBottom:4 }}>{form.name}</h3>
            <p style={{ fontSize:12, color:'#10B981', fontWeight:600, marginBottom:4 }}>Student</p>
            <p style={{ fontSize:11, color:'#9CA3AF', marginBottom:20 }}>Index: 234058V</p>

            {/* Stats */}
            {[{l:'Classes Enrolled',v:'5'},{l:'Sessions Attended',v:'25'},{l:'Avg Rating Given',v:'4.8★'}].map((s,i)=>(
              <div key={i} style={{ padding:'10px 0', borderTop:'1px solid #F3F4F6', textAlign:'center' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:'#10B981' }}>{s.v}</div>
                <div style={{ fontSize:11, color:'#9CA3AF', marginTop:2 }}>{s.l}</div>
              </div>
            ))}

            {/* Badges */}
            <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid #F3F4F6' }}>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'#9CA3AF', marginBottom:10 }}>Badges</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
                {['🎓 Enrolled','⭐ Active Learner','📚 Multi-Subject'].map(b=>(
                  <span key={b} style={{ fontSize:11, fontWeight:600, background:'#ECFDF5', color:'#059669', borderRadius:99, padding:'3px 10px', border:'1px solid #A7F3D0' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ flex:1 }}>
          <div style={{ background:'white', borderRadius:20, padding:'28px 32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#111827' }}>Personal Information</h3>
              {!editing
                ? <button onClick={()=>setEditing(true)} style={{ background:'none', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'8px 18px', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:7, transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#10B981'; e.currentTarget.style.color='#10B981';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.color='#374151';}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Profile
                  </button>
                : <div style={{ display:'flex', gap:10 }}>
                    <button onClick={()=>setEditing(false)} style={{ background:'none', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'8px 18px', fontSize:13, fontWeight:600, color:'#6B7280', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                    <button onClick={save} style={{ background:'linear-gradient(135deg,#10B981,#059669)', border:'none', borderRadius:10, padding:'8px 20px', fontSize:13, fontWeight:700, color:'white', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 12px rgba(16,185,129,0.38)' }}>Save Changes</button>
                  </div>
              }
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              {[
                {key:'name',    label:'Full Name',          ph:'Your full name' },
                {key:'email',   label:'Email Address',      ph:'your@email.com', type:'email' },
                {key:'phone',   label:'Phone Number',       ph:'077 000 0000' },
                {key:'school',  label:'School / University', ph:'Your institution' },
                {key:'grade',   label:'Grade / Level',      ph:'Your current level' },
                {key:'address', label:'Address',            ph:'City, Province' },
              ].map(f=>(
                <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF' }}>{f.label}</label>
                  {inp(f.key, f.ph, f.type||'text')}
                </div>
              ))}

              <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF' }}>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e=>update('bio',e.target.value)}
                  disabled={!editing}
                  placeholder="Tell tutors a little about yourself..."
                  style={{ width:'100%', padding:'11px 14px', borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'#111827', border:`1.5px solid ${editing?'#E5E7EB':'transparent'}`, background:editing?'white':'#F9FAFB', outline:'none', resize:'vertical', minHeight:80, lineHeight:1.6, cursor:editing?'text':'default', transition:'all 0.2s' }}
                  onFocus={e=>{ if(editing){ e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)'; }}}
                  onBlur={e=>{ e.target.style.borderColor=editing?'#E5E7EB':'transparent'; e.target.style.boxShadow='none'; }}
                />
              </div>
            </div>
          </div>

          {/* Academic info */}
          <div style={{ background:'white', borderRadius:20, padding:'24px 32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#111827', marginBottom:18 }}>Academic Summary</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {[
                {l:'Subjects Studying', v:'3', icon:'📚', color:'#8B5CF6', bg:'#F5F3FF'},
                {l:'Active Classes',    v:'2', icon:'🟢', color:'#10B981', bg:'#ECFDF5'},
                {l:'Pending Approvals', v:'1', icon:'⏳', color:'#F59E0B', bg:'#FFFBEB'},
              ].map((s,i)=>(
                <div key={i} style={{ background:s.bg, borderRadius:14, padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:s.color }}>{s.v}</div>
                  <div style={{ fontSize:12, color:'#6B7280', marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}