'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width:44, height:24, borderRadius:99, background:on?'#10B981':'#D1D5DB', cursor:'pointer', position:'relative', transition:'background 0.25s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:on?22:3, width:18, height:18, borderRadius:'50%', background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.25s' }}/>
    </div>
  );
}

function Section({ title, icon, children }: { title:string; icon:React.ReactNode; children:React.ReactNode }) {
  return (
    <div style={{ background:'white', borderRadius:20, padding:'26px 28px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22, paddingBottom:16, borderBottom:'1px solid #F3F4F6' }}>
        <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(135deg,#d1fae5,#a7f3d0)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#111827' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, desc, children }: { label:string; desc?:string; children:React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid #F9FAFB' }}>
      <div>
        <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:desc?2:0 }}>{label}</p>
        {desc && <p style={{ fontSize:12, color:'#9CA3AF' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  // Notification settings
  const [notif, setNotif] = useState({
    sessionReminder:  true,
    enrollmentUpdate: true,
    newMessage:       true,
    promotions:       false,
    weeklyDigest:     true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showProfile:   true,
    showSchedule:  false,
    allowMessages: true,
  });

  // Appearance
  const [language, setLanguage]     = useState('English');
  const [timezone, setTimezone]     = useState('Asia/Colombo (GMT+5:30)');
  const [currency, setCurrency]     = useState('LKR (Sri Lankan Rupee)');

  // Password form
  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' });
  const [pwErrors, setPwErrors] = useState<Record<string,string>>({});

  const toggleNotif  = (k: keyof typeof notif)  => setNotif(p=>({...p,[k]:!p[k]}));
  const togglePrivacy = (k: keyof typeof privacy) => setPrivacy(p=>({...p,[k]:!p[k]}));

  const savePassword = () => {
    const e: Record<string,string> = {};
    if (!pwForm.current)                       e.current = 'Required';
    if (pwForm.newPw.length < 8)               e.newPw   = 'At least 8 characters';
    if (pwForm.newPw !== pwForm.confirm)        e.confirm = 'Passwords do not match';
    setPwErrors(e);
    if (Object.keys(e).length === 0) {
      setPwForm({current:'',newPw:'',confirm:''});
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    }
  };

  const selStyle: React.CSSProperties = { width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E5E7EB', fontSize:13, fontFamily:"'DM Sans',sans-serif", color:'#374151', background:'white', cursor:'pointer', outline:'none' };
  const inpStyle = (err?:string): React.CSSProperties => ({ width:'100%', padding:'11px 14px', borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'#111827', border:`1.5px solid ${err?'#FCA5A5':'#E5E7EB'}`, background:err?'#FFF5F5':'white', outline:'none', transition:'border-color 0.2s' });

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences.">
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}`}</style>

      {saved && (
        <div style={{ position:'fixed', top:84, right:24, zIndex:999, background:'#10B981', color:'white', borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(16,185,129,0.4)', display:'flex', alignItems:'center', gap:8, animation:'slideDown 0.3s ease' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Settings saved!
        </div>
      )}

      {/* Notifications */}
      <Section title="Notifications" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}>
        {[
          {k:'sessionReminder',  l:'Session Reminders',    d:'Get notified 30 minutes before your class'},
          {k:'enrollmentUpdate', l:'Enrollment Updates',   d:'When tutors approve or reject your request'},
          {k:'newMessage',       l:'New Messages',         d:'When a tutor sends you a message'},
          {k:'promotions',       l:'Promotions & Offers',  d:'Deals, discounts and platform news'},
          {k:'weeklyDigest',     l:'Weekly Digest',        d:'Summary of your learning progress'},
        ].map(item=>(
          <SettingRow key={item.k} label={item.l} desc={item.d}>
            <Toggle on={notif[item.k as keyof typeof notif]} onChange={()=>toggleNotif(item.k as keyof typeof notif)}/>
          </SettingRow>
        ))}
      </Section>

      {/* Privacy */}
      <Section title="Privacy" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}>
        {[
          {k:'showProfile',   l:'Public Profile',    d:'Let tutors view your profile information'},
          {k:'showSchedule',  l:'Show My Schedule',  d:'Allow tutors to see your available times'},
          {k:'allowMessages', l:'Allow Messages',    d:'Let enrolled tutors message you directly'},
        ].map(item=>(
          <SettingRow key={item.k} label={item.l} desc={item.d}>
            <Toggle on={privacy[item.k as keyof typeof privacy]} onChange={()=>togglePrivacy(item.k as keyof typeof privacy)}/>
          </SettingRow>
        ))}
      </Section>

      {/* Preferences */}
      <Section title="Preferences" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, paddingTop:4 }}>
          {[
            {l:'Language', val:language, set:setLanguage, opts:['English','Sinhala','Tamil']},
            {l:'Timezone', val:timezone, set:setTimezone, opts:['Asia/Colombo (GMT+5:30)','Asia/Kolkata (GMT+5:30)','UTC']},
            {l:'Currency', val:currency, set:setCurrency, opts:['LKR (Sri Lankan Rupee)','USD (US Dollar)']},
          ].map(f=>(
            <div key={f.l} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF' }}>{f.l}</label>
              <select value={f.val} onChange={e=>f.set(e.target.value)} style={selStyle}>
                {f.opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={()=>{ setSaved(true); setTimeout(()=>setSaved(false),3000); }} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:11, padding:'11px 26px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 14px rgba(16,185,129,0.38)' }}>
            Save Preferences
          </button>
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF' }}>Current Password</label>
            <input type="password" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} placeholder="Enter current password" style={inpStyle(pwErrors.current)}
              onFocus={e=>{e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)';}}
              onBlur={e=>{e.target.style.borderColor=pwErrors.current?'#FCA5A5':'#E5E7EB'; e.target.style.boxShadow='none';}}/>
            {pwErrors.current && <span style={{ fontSize:11, color:'#EF4444' }}>{pwErrors.current}</span>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF' }}>New Password</label>
            <input type="password" value={pwForm.newPw} onChange={e=>setPwForm(p=>({...p,newPw:e.target.value}))} placeholder="At least 8 characters" style={inpStyle(pwErrors.newPw)}
              onFocus={e=>{e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)';}}
              onBlur={e=>{e.target.style.borderColor=pwErrors.newPw?'#FCA5A5':'#E5E7EB'; e.target.style.boxShadow='none';}}/>
            {pwErrors.newPw && <span style={{ fontSize:11, color:'#EF4444' }}>{pwErrors.newPw}</span>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF' }}>Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} placeholder="Repeat new password" style={inpStyle(pwErrors.confirm)}
              onFocus={e=>{e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)';}}
              onBlur={e=>{e.target.style.borderColor=pwErrors.confirm?'#FCA5A5':'#E5E7EB'; e.target.style.boxShadow='none';}}/>
            {pwErrors.confirm && <span style={{ fontSize:11, color:'#EF4444' }}>{pwErrors.confirm}</span>}
          </div>
        </div>
        <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={savePassword} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:11, padding:'11px 26px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 14px rgba(16,185,129,0.38)' }}>
            Update Password
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <div style={{ background:'white', borderRadius:20, padding:'24px 28px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1.5px solid #FECACA' }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#EF4444', marginBottom:16 }}>Danger Zone</h3>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:3 }}>Delete Account</p>
            <p style={{ fontSize:12, color:'#9CA3AF' }}>Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <button style={{ background:'#FEF2F2', color:'#EF4444', border:'1.5px solid #FECACA', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#EF4444'; e.currentTarget.style.color='white';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.color='#EF4444';}}>
            Delete Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}