'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { authService } from '@/services/authService';
import { useTheme } from '@/hooks/useTheme';
import { Sun, LogOut } from 'lucide-react';

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

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences.">

      {/* Appearance */}
      <Section isDark={isDark} title="Appearance" icon={<Sun size={18} color="#059669" strokeWidth={2} />}>
        <SettingRow isDark={isDark} label="Dark Mode" desc="Switch the dashboard to a dark theme">
          <Toggle on={isDark} onChange={toggleTheme}/>
        </SettingRow>
      </Section>

      {/* Log Out */}
      <Section isDark={isDark} title="Log Out" icon={<LogOut size={18} color="#059669" strokeWidth={2} />}>
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
