'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { authService } from '@/services/authService';
import { useTheme } from '@/hooks/useTheme';

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width:44, height:24, borderRadius:99, background:on?'#10B981':'#D1D5DB', cursor:'pointer', position:'relative', transition:'background 0.25s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:on?22:3, width:18, height:18, borderRadius:'50%', background:'white', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.25s' }}/>
    </div>
  );
}

function Section({ title, icon, isDark, children }: { title:string; icon:React.ReactNode; isDark:boolean; children:React.ReactNode }) {
  return (
    <div style={{ background:isDark?'#161D1A':'white', borderRadius:20, padding:'26px 28px', boxShadow:isDark?'0 4px 24px rgba(0,0,0,0.35)':'0 4px 24px rgba(0,0,0,0.06)', border:isDark?'1px solid #232E28':'1px solid rgba(0,0,0,0.04)', marginBottom:20, transition:'background 0.25s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22, paddingBottom:16, borderBottom:isDark?'1px solid #232E28':'1px solid #F3F4F6' }}>
        <div style={{ width:36, height:36, borderRadius:11, background:isDark?'rgba(16,185,129,0.15)':'linear-gradient(135deg,#d1fae5,#a7f3d0)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:isDark?'#F3F4F6':'#111827' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, desc, isDark, children }: { label:string; desc?:string; isDark:boolean; children:React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:isDark?'1px solid #1D2622':'1px solid #F9FAFB' }}>
      <div>
        <p style={{ fontSize:14, fontWeight:600, color:isDark?'#F3F4F6':'#111827', marginBottom:desc?2:0 }}>{label}</p>
        {desc && <p style={{ fontSize:12, color:isDark?'#8B968F':'#9CA3AF' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [saved, setSaved] = useState(false);

  // Language preference — a real, persisted choice. Note: this does not
  // translate any UI text yet (no i18n library is wired up in this app) —
  // that's a separate, larger project. This just remembers the choice.
  const [language, setLanguage] = useState('English');
  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored) setLanguage(stored);
  }, []);
  const changeLanguage = (value: string) => {
    setLanguage(value);
    localStorage.setItem('language', value);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'user_role=; path=/; max-age=0';
  };

  const handleLogout = () => {
    clearSession();
    router.push('/auth/login');
  };

  // Delete account — two-step inline confirm, real backend call.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await authService.deleteAccount();
      clearSession();
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  const selStyle: React.CSSProperties = { width:'100%', padding:'10px 12px', borderRadius:10, border:isDark?'1.5px solid #232E28':'1.5px solid #E5E7EB', fontSize:13, fontFamily:"'DM Sans',sans-serif", color:isDark?'#F3F4F6':'#374151', background:isDark?'#0F1512':'white', cursor:'pointer', outline:'none' };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences.">
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}`}</style>

      {saved && (
        <div style={{ position:'fixed', top:84, right:24, zIndex:999, background:'#10B981', color:'white', borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(16,185,129,0.4)', display:'flex', alignItems:'center', gap:8, animation:'slideDown 0.3s ease' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Settings saved!
        </div>
      )}

      {/* Appearance */}
      <Section isDark={isDark} title="Appearance" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>}>
        <SettingRow isDark={isDark} label="Dark Mode" desc="Switch the dashboard to a dark theme">
          <Toggle on={isDark} onChange={toggleTheme}/>
        </SettingRow>
      </Section>

      {/* Language */}
      <Section isDark={isDark} title="Language" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>}>
        <div style={{ display:'flex', flexDirection:'column', gap:6, maxWidth:280 }}>
          <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:isDark?'#8B968F':'#9CA3AF' }}>Display Language</label>
          <select value={language} onChange={e=>changeLanguage(e.target.value)} style={selStyle}>
            <option>English</option>
            <option>Sinhala</option>
            <option>Tamil</option>
          </select>
          <p style={{ fontSize:11, color:isDark?'#8B968F':'#9CA3AF', marginTop:4 }}>Your preference is saved — full translation of the app is coming in a future update.</p>
        </div>
      </Section>

      {/* Log Out */}
      <Section isDark={isDark} title="Log Out" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}>
        <SettingRow isDark={isDark} label="Sign out of Mentora" desc="You'll need to log in again to access your dashboard">
          <button onClick={handleLogout} style={{ background:isDark?'#1F2A25':'#F3F4F6', color:isDark?'#F3F4F6':'#374151', border:'none', borderRadius:10, padding:'9px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            Log Out
          </button>
        </SettingRow>
      </Section>

      {/* Danger zone */}
      <div style={{ background:isDark?'#1F1414':'white', borderRadius:20, padding:'24px 28px', boxShadow:isDark?'0 4px 24px rgba(0,0,0,0.35)':'0 4px 24px rgba(0,0,0,0.06)', border:'1.5px solid #FECACA' }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#EF4444', marginBottom:16 }}>Danger Zone</h3>

        {!confirmingDelete ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:isDark?'#F3F4F6':'#111827', marginBottom:3 }}>Delete Account</p>
              <p style={{ fontSize:12, color:isDark?'#8B968F':'#9CA3AF' }}>Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <button onClick={()=>setConfirmingDelete(true)} style={{ background:'#FEF2F2', color:'#EF4444', border:'1.5px solid #FECACA', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#EF4444'; e.currentTarget.style.color='white';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#FEF2F2'; e.currentTarget.style.color='#EF4444';}}>
              Delete Account
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:'#EF4444', marginBottom:4 }}>Are you absolutely sure?</p>
            <p style={{ fontSize:12, color:isDark?'#8B968F':'#9CA3AF', marginBottom:16 }}>This will permanently delete your account, profile, and all associated data. This action cannot be undone.</p>
            {deleteError && (
              <p style={{ fontSize:12, color:'#EF4444', marginBottom:12, padding:'8px 12px', background:'#FEF2F2', borderRadius:8 }}>{deleteError}</p>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleConfirmDelete} disabled={deleting} style={{ background:'#EF4444', color:'white', border:'none', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:deleting?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", opacity:deleting?0.7:1 }}>
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
              <button onClick={()=>{setConfirmingDelete(false); setDeleteError('');}} disabled={deleting} style={{ background:'transparent', color:isDark?'#8B968F':'#6B7280', border:isDark?'1.5px solid #232E28':'1.5px solid #E5E7EB', borderRadius:10, padding:'10px 22px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
