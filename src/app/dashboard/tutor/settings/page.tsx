'use client';

import { useState } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';

export default function TutorSettingsPage() {
  const [notifications, setNotifications] = useState({ email:true,  sms:false, newRequest:true,  messages:true,  sessionReminder:true  });
  const [privacy,       setPrivacy]       = useState({ publicProfile:true, showPhone:false, showEarnings:false });
  const [saved, setSaved] = useState('');

  const toggle = (group: 'notifications' | 'privacy', key: string) => {
    if (group === 'notifications') setNotifications(p => ({ ...p, [key]: !(p as any)[key] }));
    else                           setPrivacy(p => ({ ...p, [key]: !(p as any)[key] }));
  };

  const save = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2500);
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <div onClick={onToggle} style={{ width:46, height:26, borderRadius:99, background:on?'#10B981':'#D1D5DB', cursor:'pointer', position:'relative', transition:'background 0.25s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:on?22:3, width:20, height:20, borderRadius:'50%', background:'white', boxShadow:'0 2px 4px rgba(0,0,0,0.2)', transition:'left 0.25s' }} />
    </div>
  );

  const Row = ({ label, desc, on, onToggle }: { label:string; desc:string; on:boolean; onToggle:()=>void }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 0', borderBottom:'1px solid #F3F4F6' }}>
      <div>
        <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:2 }}>{label}</p>
        <p style={{ fontSize:12, color:'#9CA3AF' }}>{desc}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );

  const Section = ({ title, icon, children, onSave }: { title:string; icon:string; children:React.ReactNode; onSave:()=>void }) => (
    <div style={{ background:'white', borderRadius:20, padding:'24px 28px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', marginBottom:20 }}>
      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#111827', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:20 }}>{icon}</span>{title}
      </h3>
      {children}
      <div style={{ marginTop:20, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onSave} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Save Changes</button>
        {saved === title && <span style={{ fontSize:13, color:'#10B981', fontWeight:600 }}>✓ Saved!</span>}
      </div>
    </div>
  );

  return (
    <TutorDashboardLayout title="Settings" subtitle="Manage your account preferences and notifications.">

      {/* Account */}
      <Section title="Account Security" icon="🔐" onSave={() => save('Account Security')}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            { label:'Current Password', ph:'Enter current password', type:'password' },
            { label:'New Password',     ph:'Enter new password',     type:'password' },
            { label:'Confirm Password', ph:'Confirm new password',   type:'password' },
            { label:'Phone Number',     ph:'077 000 0000',           type:'tel' },
          ].map(f => (
            <div key={f.label} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9CA3AF' }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} style={{ padding:'11px 14px', borderRadius:11, border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', color:'#374151' }}
                onFocus={e => { e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)'; }}
                onBlur={e  => { e.target.style.borderColor='#E5E7EB'; e.target.style.boxShadow='none'; }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon="🔔" onSave={() => save('Notifications')}>
        <Row label="Email Notifications"   desc="Receive updates via email"              on={notifications.email}           onToggle={() => toggle('notifications','email')} />
        <Row label="SMS Notifications"     desc="Receive SMS alerts on your phone"       on={notifications.sms}             onToggle={() => toggle('notifications','sms')} />
        <Row label="New Student Requests"  desc="Notify when a student sends a request"  on={notifications.newRequest}      onToggle={() => toggle('notifications','newRequest')} />
        <Row label="New Messages"          desc="Notify when you receive a message"      on={notifications.messages}        onToggle={() => toggle('notifications','messages')} />
        <Row label="Session Reminders"     desc="Remind me 30 mins before each session"  on={notifications.sessionReminder} onToggle={() => toggle('notifications','sessionReminder')} />
      </Section>

      {/* Privacy */}
      <Section title="Privacy" icon="🔒" onSave={() => save('Privacy')}>
        <Row label="Public Profile"     desc="Allow students to view your profile"        on={privacy.publicProfile}  onToggle={() => toggle('privacy','publicProfile')} />
        <Row label="Show Phone Number"  desc="Display phone number on your public page"   on={privacy.showPhone}     onToggle={() => toggle('privacy','showPhone')} />
        <Row label="Show Earnings"      desc="Show monthly earnings on community page"    on={privacy.showEarnings}  onToggle={() => toggle('privacy','showEarnings')} />
      </Section>

      {/* Danger zone */}
      <div style={{ background:'white', borderRadius:20, padding:'24px 28px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1.5px solid #FECACA' }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#DC2626', marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>⚠️ Danger Zone</h3>
        <p style={{ fontSize:13, color:'#6B7280', marginBottom:18, lineHeight:1.6 }}>These actions are irreversible. Please proceed with caution.</p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <button style={{ background:'#FEF2F2', color:'#DC2626', border:'1.5px solid #FECACA', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Deactivate Account</button>
          <button style={{ background:'#DC2626', color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Delete Account</button>
        </div>
      </div>
    </TutorDashboardLayout>
  );
}
