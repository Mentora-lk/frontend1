'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { usePalette } from '@/hooks/usePalette';
import { studentService } from '@/services/studentService';
import { Check, Camera, Pencil } from 'lucide-react';

interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  bio: string;
  address: string;
  photoUrl: string | null;
}

interface AcademicStats {
  classesEnrolled: number;
  activeClasses: number;
  pendingApprovals: number;
  sessionsAttended: number;
  subjectsStudying: number;
}

const EMPTY_STATS: AcademicStats = {
  classesEnrolled: 0, activeClasses: 0, pendingApprovals: 0,
  sessionsAttended: 0, subjectsStudying: 0,
};

export default function ProfilePage() {
  const palette = usePalette();
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [stats,   setStats]   = useState<AcademicStats>(EMPTY_STATS);

  const [form, setForm] = useState<StudentProfile>({
    name: '', email: '', phone: '', school: '', grade: '', bio: '', address: '', photoUrl: null,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await studentService.getProfile();
        setForm(prev => ({
          ...prev,
          name:    data.name    ?? prev.name,
          email:   data.email   ?? prev.email,
          phone:   data.phone   ?? prev.phone,
          school:  data.school  ?? prev.school,
          grade:   data.grade   ?? prev.grade,
          bio:     data.bio     ?? prev.bio,
          address: data.address ?? prev.address,
          photoUrl: data.profilePicture ?? prev.photoUrl,
        }));
        setStats(data.stats || EMPTY_STATS);
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setError('Failed to load your profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const update = (key: Exclude<keyof StudentProfile, 'photoUrl'>, val: string) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      const result = await studentService.updateProfile({
        name: form.name, phone: form.phone, school: form.school,
        grade: form.grade, bio: form.bio, address: form.address,
      }, photoFile);

      if (result?.profilePicture) {
        setForm(f => ({ ...f, photoUrl: result.profilePicture }));
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...stored, avatarUrl: result.profilePicture }));
        } catch {}
      }
      setPhotoFile(null);
      setPhotoPreview(null);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving student profile:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inp = (key: Exclude<keyof StudentProfile, 'photoUrl'>, placeholder: string, type = 'text', disabled = false) => (
    <input
      type={type}
      value={form[key]}
      onChange={e => update(key, e.target.value)}
      placeholder={placeholder}
      disabled={!editing || disabled}
      style={{ width:'100%', padding:'11px 14px', borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:palette.textPrimary, border:`1.5px solid ${editing && !disabled ? palette.border : 'transparent'}`, background:editing && !disabled ? palette.surface : palette.surfaceAlt, outline:'none', transition:'all 0.2s', cursor:editing && !disabled ? 'text' : 'default' }}
      onFocus={e => { if (editing && !disabled) { e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)'; } }}
      onBlur={e => { e.target.style.borderColor = editing && !disabled ? palette.border : 'transparent'; e.target.style.boxShadow = 'none'; }}
    />
  );

  if (loading) {
    return (
      <DashboardLayout title="My Profile" subtitle="Manage your personal information.">
        <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}>
          <div style={{ color:'#10B981', fontWeight:600 }}>Loading profile data...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Badges only appear when backed by real data — no more unconditional
  // "Enrolled/Active Learner/Multi-Subject" claims shown for every student.
  const badges: string[] = [];
  if (stats.classesEnrolled > 0) badges.push('🎓 Enrolled');
  if (stats.activeClasses > 0) badges.push('Active Learner');
  if (stats.subjectsStudying >= 2) badges.push('📚 Multi-Subject');

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information.">
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}`}</style>

      {/* Saved toast */}
      {saved && (
        <div style={{ position:'fixed', top:84, right:24, zIndex:999, background:'#10B981', color:'white', borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(16,185,129,0.4)', display:'flex', alignItems:'center', gap:8, animation:'slideDown 0.3s ease' }}>
          <Check size={16} color="white" strokeWidth={2.5} />
          Profile saved successfully!
        </div>
      )}

      {error && (
        <div style={{ background:'#FEF2F2', color:'#DC2626', borderRadius:12, padding:'12px 18px', fontSize:13, fontWeight:600, marginBottom:20, border:'1px solid #FECACA' }}>
          {error}
        </div>
      )}

      <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* Left — Avatar card */}
        <div style={{ width:240, flexShrink:0 }}>
          <div style={{ background:palette.surface, borderRadius:20, padding:'28px 20px', boxShadow:palette.shadow, border:`1px solid ${palette.border}`, textAlign:'center' }}>
            <div style={{ position:'relative', display:'inline-block', marginBottom:16 }}>
              {(photoPreview || form.photoUrl) ? (
                <img src={photoPreview || form.photoUrl || ''} alt={form.name || 'Profile photo'}
                  style={{ width:90, height:90, borderRadius:'50%', objectFit:'cover', margin:'0 auto', display:'block', boxShadow:'0 8px 24px rgba(16,185,129,0.4)' }}/>
              ) : (
                <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:34, fontFamily:"'Playfair Display',serif", margin:'0 auto', boxShadow:'0 8px 24px rgba(16,185,129,0.4)' }}>
                  {form.name ? form.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              {editing && (
                <label style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#111827', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <Camera size={13} color="white" strokeWidth={2} />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:'none' }}/>
                </label>
              )}
            </div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:palette.textPrimary, marginBottom:4 }}>{form.name || 'Student'}</h3>
            <p style={{ fontSize:12, color:'#10B981', fontWeight:600, marginBottom:20 }}>Student</p>

            {/* Stats */}
            {[
              { l: 'Classes Enrolled', v: String(stats.classesEnrolled) },
              { l: 'Sessions Attended', v: String(stats.sessionsAttended) },
            ].map((s, i) => (
              <div key={i} style={{ padding:'10px 0', borderTop:`1px solid ${palette.border}`, textAlign:'center' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:'#10B981' }}>{s.v}</div>
                <div style={{ fontSize:11, color:palette.textMuted, marginTop:2 }}>{s.l}</div>
              </div>
            ))}

            {/* Badges */}
            {badges.length > 0 && (
              <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${palette.border}` }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:palette.textMuted, marginBottom:10 }}>Badges</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
                  {badges.map(b => (
                    <span key={b} style={{ fontSize:11, fontWeight:600, background:'#ECFDF5', color:'#059669', borderRadius:99, padding:'3px 10px', border:'1px solid #A7F3D0' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ flex:1 }}>
          <div style={{ background:palette.surface, borderRadius:20, padding:'28px 32px', boxShadow:palette.shadow, border:`1px solid ${palette.border}`, marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:palette.textPrimary }}>Personal Information</h3>
              {!editing
                ? <button onClick={()=>setEditing(true)} style={{ background:'none', border:`1.5px solid ${palette.border}`, borderRadius:10, padding:'8px 18px', fontSize:13, fontWeight:600, color:palette.textSecondary, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:7, transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#10B981'; e.currentTarget.style.color='#10B981';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=palette.border; e.currentTarget.style.color=palette.textSecondary;}}>
                    <Pencil size={14} strokeWidth={2} />
                    Edit Profile
                  </button>
                : <div style={{ display:'flex', gap:10 }}>
                    <button onClick={()=>{ setEditing(false); setPhotoFile(null); setPhotoPreview(null); }} disabled={saving} style={{ background:'none', border:`1.5px solid ${palette.border}`, borderRadius:10, padding:'8px 18px', fontSize:13, fontWeight:600, color:palette.textSecondary, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                    <button onClick={save} disabled={saving} style={{ background:'linear-gradient(135deg,#10B981,#059669)', border:'none', borderRadius:10, padding:'8px 20px', fontSize:13, fontWeight:700, color:'white', cursor:saving?'default':'pointer', opacity:saving?0.7:1, fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 12px rgba(16,185,129,0.38)' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  </div>
              }
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              {[
                {key:'name',    label:'Full Name',          ph:'Your full name' },
                {key:'email',   label:'Email Address',      ph:'your@email.com', type:'email', disabled:true },
                {key:'phone',   label:'Phone Number',       ph:'077 000 0000' },
                {key:'school',  label:'School / University', ph:'Your institution' },
                {key:'grade',   label:'Grade / Level',      ph:'Your current level' },
                {key:'address', label:'Address',            ph:'City, Province' },
              ].map(f=>(
                <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:palette.textMuted }}>{f.label}</label>
                  {inp(f.key as Exclude<keyof StudentProfile, 'photoUrl'>, f.ph, f.type||'text', f.disabled)}
                </div>
              ))}

              <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:palette.textMuted }}>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e=>update('bio',e.target.value)}
                  disabled={!editing}
                  placeholder="Tell tutors a little about yourself..."
                  style={{ width:'100%', padding:'11px 14px', borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:palette.textPrimary, border:`1.5px solid ${editing?palette.border:'transparent'}`, background:editing?palette.surface:palette.surfaceAlt, outline:'none', resize:'vertical', minHeight:80, lineHeight:1.6, cursor:editing?'text':'default', transition:'all 0.2s' }}
                  onFocus={e=>{ if(editing){ e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)'; }}}
                  onBlur={e=>{ e.target.style.borderColor=editing?palette.border:'transparent'; e.target.style.boxShadow='none'; }}
                />
              </div>
            </div>
          </div>

          {/* Academic info */}
          <div style={{ background:palette.surface, borderRadius:20, padding:'24px 32px', boxShadow:palette.shadow, border:`1px solid ${palette.border}` }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:palette.textPrimary, marginBottom:18 }}>Academic Summary</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {[
                {l:'Subjects Studying', v:String(stats.subjectsStudying), icon:'📚', color:'#8B5CF6', bg:'#F5F3FF'},
                {l:'Active Classes',    v:String(stats.activeClasses),    icon:'🟢', color:'#10B981', bg:'#ECFDF5'},
                {l:'Pending Approvals', v:String(stats.pendingApprovals), icon:'⏳', color:'#F59E0B', bg:'#FFFBEB'},
              ].map((s,i)=>(
                <div key={i} style={{ background:s.bg, borderRadius:14, padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:s.color }}>{s.v}</div>
                  <div style={{ fontSize:12, color:palette.textSecondary, marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
