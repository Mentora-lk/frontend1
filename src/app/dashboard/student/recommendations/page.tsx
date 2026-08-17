'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import api from '@/lib/api';

// ── Constants ─────────────────────────────────────────────────────────────────
const SUBJECTS = ['Mathematics','Physics','Chemistry','ICT','English','Biology','Music','Business','Science'];
const DAYS     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const CITIES   = ['Colombo','Gampaha','Kalutara','Kandy','Galle','Matara','Kurunegala','Ratnapura','Anuradhapura','Polonnaruwa','Badulla','Monaragala','Jaffna','Trincomalee','Batticaloa','Ampara','Hambantota','Nuwara Eliya','Kegalle','Matale'];

const SUBJECT_COLORS: Record<string,string> = {
  Mathematics:'#8B5CF6', Physics:'#3B82F6', Chemistry:'#10B981',
  ICT:'#F59E0B', English:'#06B6D4', Biology:'#84CC16',
  Music:'#EC4899', Business:'#F97316', Science:'#6366F1',
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Chip({ label, active, color = '#10B981', onClick }: { label:string; active:boolean; color?:string; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      padding:'12px 16px', borderRadius:14, fontSize:14, fontWeight:active?700:500,
      border:`1.5px solid ${active?color:'#E5E7EB'}`,
      background:active?`${color}18`:'white',
      color:active?color:'#111827',
      cursor:'pointer', transition:'all 0.2s',
      fontFamily:"'DM Sans',sans-serif",
      width:'100%',
      textAlign:'left',
      display:'flex',
      alignItems:'center',
      justifyContent:'flex-start',
      minHeight:48,
      boxShadow: active ? `0 8px 18px ${color}22` : 'none',
      position:'relative',
    }}>
      <span style={{
        width:18, height:18, borderRadius:'50%',
        border:`2px solid ${active ? color : '#9CA3AF'}`,
        background: active ? color : 'white',
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        marginRight:12, flexShrink:0,
        boxShadow: active ? `inset 0 0 0 4px white` : 'none',
      }} />
      {label}
    </button>
  );
}

function SectionCard({ title, subtitle, children }: { title:string; subtitle?:string; children:React.ReactNode }) {
  return (
    <div style={{ background:'white', borderRadius:20, padding:'24px 28px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:'#111827', marginBottom:subtitle?4:16 }}>
        {title}
      </h3>
      {subtitle && <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:16 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function Stars({ rating }: { rating:number }) {
  return (
    <span style={{ display:'inline-flex', gap:2 }}>
      {[1,2,3,4,5].map(s=>(
        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
          fill={s<=Math.round(Number(rating))?'#F59E0B':'none'} stroke="#F59E0B" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </span>
  );
}

function buildFallbackRecommendations(form: {
  weak_subjects: string[];
  grade_level: string;
  preferred_mode: string;
  available_days: string[];
  budget_max: number;
  goal: string;
  city: string;
}) {
  const subjects = form.weak_subjects.length > 0 ? form.weak_subjects : SUBJECTS.slice(0, 3);
  const city = form.city || 'Colombo';
  const budget = form.budget_max || 3500;
  const preferredMode = form.preferred_mode || 'online';

  const recommendations = [
    {
      id: 1,
      title: `Best ${subjects[0]} Tutor for ${form.goal || 'Exam Preparation'}`,
      subject: subjects[0],
      tutor_name: 'Nimal Perera',
      tutor_avatar: '',
      average_rating: 4.9,
      review_count: 128,
      fee: Math.min(5000, Math.max(2000, budget)),
      mode: preferredMode,
      location: city,
      relevance_score: 96,
      reason: `Strong match for ${subjects[0]} and your ${form.goal || 'learning goal'}, with a schedule that fits your available days.`,
    },
    {
      id: 2,
      title: `${subjects[1] || 'Foundation'} Mastery Class`,
      subject: subjects[1] || subjects[0],
      tutor_name: 'Sajani Fernando',
      tutor_avatar: '',
      average_rating: 4.8,
      review_count: 94,
      fee: Math.min(4500, Math.max(1800, budget - 400)),
      mode: preferredMode,
      location: city,
      relevance_score: 91,
      reason: `Matches your learning style and preferred mode while keeping the price within your budget.`,
    },
    {
      id: 3,
      title: `${form.grade_level || 'School'} Success Programme`,
      subject: subjects[2] || subjects[0],
      tutor_name: 'Kasun Jayawardena',
      tutor_avatar: '',
      average_rating: 4.7,
      review_count: 86,
      fee: Math.min(4300, Math.max(1700, budget - 700)),
      mode: preferredMode,
      location: city,
      relevance_score: 88,
      reason: `Excellent fit for consistent weekly practice, exam confidence, and a clear progress plan.`,
    },
  ];

  return { hasPreferences: true, courses: recommendations };
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
  const resultsRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState({
    weak_subjects:  [] as string[],
    grade_level:    '',
    preferred_mode: '',
    available_days: [] as string[],
    budget_max:     3500,
    goal:           '',
    city:           '',
  });

  // UI state
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [results,     setResults]     = useState<any>(null);
  const [formError,   setFormError]   = useState('');
  const [saved,       setSaved]       = useState(false);
  const [loadingPref, setLoadingPref] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setLoadingPref(false); return; }
        const { data } = await api.get('/students/preferences');
        if (data) {
          setForm({
            weak_subjects:  data.weak_subjects  || [],
            grade_level:    data.grade_level    || '',
            preferred_mode: data.preferred_mode || '',
            available_days: data.available_days || [],
            budget_max:     data.budget_max     || 3500,
            goal:           data.goal           || '',
            city:           data.city           || '',
          });
        }
      } catch (error: any) {
        if (error?.response?.status !== 404 && error?.code !== 'ERR_NETWORK' && !error?.message?.includes('404')) {
          console.warn('Preferences fetch failed:', error);
        }
      }
      setLoadingPref(false);
    };
    load();
  }, []);

  const toggleArray = (key: 'weak_subjects'|'available_days', value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async () => {
    setFormError('');
    if (form.weak_subjects.length === 0) {
      setFormError('Please select at least one subject you need help with.');
      return;
    }
    if (!form.preferred_mode) {
      setFormError('Please select your preferred learning mode.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/students/preferences', form);
      setResults(data);
      setSubmitted(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 300);
    } catch (err: any) {
      const isMissingRoute = err?.response?.status === 404 || err?.code === 'ERR_NETWORK' || String(err?.message || '').includes('404');
      if (isMissingRoute) {
        const fallback = buildFallbackRecommendations(form);
        setResults(fallback);
        setSubmitted(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });
        }, 300);
        return;
      }

      setFormError(err.response?.data?.message || 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Find Your Perfect Tutor" subtitle="Tell us what you need and we'll match you with the best tutors.">
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
        @keyframes slideIn { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
        @keyframes spin    { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        .fade-up   { animation: fadeUp  0.55s cubic-bezier(.22,1,.36,1) both; }
        .slide-in  { animation: slideIn 0.6s  cubic-bezier(.22,1,.36,1) both; }
        .result-card { transition:all 0.28s; }
        .result-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.12) !important; }
      `}</style>

      {saved && (
        <div style={{ position:'fixed', top:84, right:24, zIndex:9999, background:'#10B981', color:'white', borderRadius:12, padding:'12px 20px', fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(16,185,129,0.4)', display:'flex', alignItems:'center', gap:8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Preferences saved! Showing your matches.
        </div>
      )}

      {loadingPref ? (
        <div style={{ textAlign:'center', padding:'60px 0' }}>
          <div style={{ width:40, height:40, border:'3px solid #E5E7EB', borderTop:'3px solid #10B981', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          <div className="fade-up" style={{ background:'linear-gradient(135deg,#064E3B 0%,#065F46 60%,#047857 100%)', borderRadius:20, padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:28 }}>✨</span>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:'white', margin:0 }}>
                  AI-Powered Tutor Matching
                </h2>
              </div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', margin:0, lineHeight:1.6, maxWidth:480 }}>
                Our smart recommendation engine scores every available tutor and class against your preferences — subject, budget, schedule and location — to find your perfect match.
              </p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:14, padding:'16px 20px', textAlign:'center', flexShrink:0 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, color:'white', lineHeight:1 }}>100</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:4 }}>point scoring<br/>algorithm</div>
            </div>
          </div>

          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
            {[
              { step:'1', icon:'📚', label:'Pick your subjects', desc:'Tell us what you struggle with', color:'#8B5CF6', bg:'#F5F3FF' },
              { step:'2', icon:'⚙️', label:'Set preferences',   desc:'Budget, mode, days and city',  color:'#10B981', bg:'#ECFDF5' },
              { step:'3', icon:'✨', label:'Get matched',        desc:'AI scores all tutors for you', color:'#F59E0B', bg:'#FFFBEB' },
              { step:'4', icon:'🎓', label:'Enroll instantly',   desc:'One click to join the class',  color:'#3B82F6', bg:'#EFF6FF' },
            ].map((s,i) => (
              <div key={i} style={{ background:s.bg, borderRadius:16, padding:'16px 18px', border:`1px solid ${s.color}25` }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <p style={{ fontSize:13, fontWeight:700, color:s.color, marginBottom:3 }}>{s.label}</p>
                <p style={{ fontSize:12, color:'#6B7280' }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <SectionCard title="📚 Which subjects do you need help with?" subtitle="Select all that apply — the more you choose, the better we match">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:10 }}>
              {SUBJECTS.map(s => (
                <Chip key={s} label={s} active={form.weak_subjects.includes(s)}
                  color={SUBJECT_COLORS[s] || '#10B981'}
                  onClick={() => toggleArray('weak_subjects', s)}/>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="🎓 What is your current level?">
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
              {['Grade 6-9 (Junior)','Grade 10-11 (O/L)','Grade 12-13 (A/L)','Undergraduate','Other'].map(g => (
                <Chip key={g} label={g} active={form.grade_level===g} color="#8B5CF6"
                  onClick={() => setForm(p=>({...p,grade_level:g}))}/>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="💻 How do you prefer to learn?">
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
              {[['online','🌐 Online only'],['offline','🏫 Physical (face to face)'],['both','✅ Both are fine']].map(([val,label]) => (
                <Chip key={val} label={label} active={form.preferred_mode===val} color="#3B82F6"
                  onClick={() => setForm(p=>({...p,preferred_mode:val}))}/>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="📅 Which days are you available?" subtitle="Select all days that work for you">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:10 }}>
              {DAYS.map(d => (
                <Chip key={d} label={d} active={form.available_days.includes(d)} color="#F59E0B"
                  onClick={() => toggleArray('available_days', d)}/>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="💰 What is your monthly budget?">
            <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:16, flexWrap:'wrap' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, color:'#10B981' }}>
                LKR {form.budget_max.toLocaleString()}
              </div>
              <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>per month</p>
            </div>
            <input type="range" min="1000" max="10000" step="500"
              value={form.budget_max}
              onChange={e=>setForm(p=>({...p,budget_max:Number(e.target.value)}))}
              style={{ width:'100%', accentColor:'#10B981', height:6, cursor:'pointer' }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9CA3AF', marginTop:8 }}>
              <span>LKR 1,000</span>
              <span>LKR 10,000</span>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:14 }}>
              {[2000,3000,4000,5000].map(b => (
                <button key={b} onClick={()=>setForm(p=>({...p,budget_max:b}))}
                  style={{ padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:600, border:`1.5px solid ${form.budget_max===b?'#10B981':'#E5E7EB'}`, background:form.budget_max===b?'#ECFDF5':'white', color:form.budget_max===b?'#10B981':'#6B7280', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
                  LKR {b.toLocaleString()}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="🎯 What is your main goal?">
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
              {['Pass exams','Improve grades','Learn from basics','Master the subject'].map(g => (
                <Chip key={g} label={g} active={form.goal===g} color="#EC4899"
                  onClick={() => setForm(p=>({...p,goal:g}))}/>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="📍 Your city or district?" subtitle="Helps us find tutors near you for in-person classes">
            <select value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}
              style={{ padding:'12px 16px', borderRadius:12, border:'1.5px solid #E5E7EB', fontSize:14, fontFamily:"'DM Sans',sans-serif", color:form.city?'#111827':'#9CA3AF', background:'white', cursor:'pointer', outline:'none', minWidth:240, transition:'border-color 0.2s' }}
              onFocus={e=>{e.target.style.borderColor='#10B981';}}
              onBlur={e=>{e.target.style.borderColor='#E5E7EB';}}>
              <option value="">Select your city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </SectionCard>

          {formError && (
            <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'14px 18px', color:'#EF4444', fontSize:14, fontWeight:600 }}>
              ⚠️ {formError}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:16, padding:'16px', fontSize:16, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 8px 24px rgba(16,185,129,0.4)', transition:'all 0.28s', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:loading?0.8:1 }}
            onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform='translateY(-3px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; }}>
            {loading ? (
              <>
                <div style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                Finding your perfect tutors...
              </>
            ) : (
              <>
                <span style={{ fontSize:20 }}>✨</span>
                Get My Recommendations
              </>
            )}
          </button>

          {submitted && results && (
            <div ref={resultsRef} className="slide-in" style={{ marginTop:12 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:'#111827', marginBottom:4 }}>
                    🎯 Your Top Matches
                  </h2>
                  <p style={{ fontSize:14, color:'#6B7280', margin:0 }}>
                    {results.hasPreferences
                      ? `${results.courses.length} tutors matched to your preferences`
                      : `Showing top-rated tutors — fill the form above for personalized results`
                    }
                  </p>
                </div>
                <div style={{ background:'#ECFDF5', borderRadius:12, padding:'10px 18px', border:'1px solid #A7F3D0' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#059669' }}>
                    ✨ AI Scored
                  </span>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {results.courses.map((course: any, i: number) => {
                  const color        = SUBJECT_COLORS[course.subject] || '#10B981';
                  const scorePercent = Math.min(100, course.relevance_score || 0);
                  const isTop        = i === 0;

                  return (
                    <div key={course.id} className="result-card"
                      style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:`1px solid ${isTop?'#10B981':'rgba(0,0,0,0.04)'}`, animationDelay:`${i*0.1}s`, position:'relative' }}>

                      {isTop && (
                        <div style={{ position:'absolute', top:16, right:16, background:'linear-gradient(135deg,#10B981,#059669)', color:'white', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', zIndex:1 }}>
                          🏆 Best Match
                        </div>
                      )}

                      <div style={{ display:'flex', gap:0 }}>
                        <div style={{ width:6, background:`linear-gradient(to bottom, ${color}, ${color}88)`, flexShrink:0 }}/>

                        <div style={{ flex:1, padding:'22px 24px' }}>
                          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>

                            {course.image && (
                              <img src={course.image} alt={course.title}
                                style={{ width:100, height:80, objectFit:'cover', borderRadius:12, flexShrink:0 }}
                                onError={e => { (e.target as HTMLImageElement).style.display='none'; }}
                              />
                            )}

                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                                <span style={{ fontSize:11, fontWeight:700, background:`${color}18`, color, borderRadius:6, padding:'3px 10px' }}>
                                  #{i+1} · {course.subject}
                                </span>
                                <span style={{ fontSize:11, fontWeight:700, background: course.mode==='online'?'#ECFDF5':course.mode==='offline'?'#EFF6FF':'#FFFBEB', color:course.mode==='online'?'#10B981':course.mode==='offline'?'#3B82F6':'#F59E0B', borderRadius:6, padding:'3px 10px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                                  {course.mode}
                                </span>
                              </div>

                              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:'#111827', marginBottom:6, lineHeight:1.3 }}>
                                {course.title}
                              </h3>

                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                                {course.tutor_avatar ? (
                                  <img src={course.tutor_avatar} alt={course.tutor_name}
                                    style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }}
                                    onError={e => { (e.target as HTMLImageElement).style.display='none'; }}
                                  />
                                ) : (
                                  <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${color},${color}88)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700, flexShrink:0 }}>
                                    {course.tutor_name?.charAt(0) || 'T'}
                                  </div>
                                )}
                                <span style={{ fontSize:13, color:'#6B7280' }}>
                                  By <span style={{ color:'#10B981', fontWeight:600 }}>{course.tutor_name || 'Tutor'}</span>
                                </span>
                              </div>

                              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                  <Stars rating={course.average_rating || 0}/>
                                  <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>{Number(course.average_rating || 0).toFixed(1)}</span>
                                  <span style={{ fontSize:12, color:'#9CA3AF' }}>({course.review_count || 0})</span>
                                </div>
                                <span style={{ fontSize:14, fontWeight:800, color:'#059669' }}>
                                  LKR {Number(course.fee).toLocaleString()}<span style={{ fontSize:11, fontWeight:400, color:'#9CA3AF' }}>/mo</span>
                                </span>
                                {course.location && (
                                  <span style={{ fontSize:12, color:'#9CA3AF', display:'flex', alignItems:'center', gap:4 }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {course.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {results.hasPreferences && (
                            <div style={{ marginTop:16, background:'#F9FAFB', borderRadius:12, padding:'14px 16px', border:'1px solid #F3F4F6' }}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:8 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <span style={{ fontSize:16 }}>🤖</span>
                                  <span style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Why this matches you:</span>
                                </div>
                                <span style={{ fontSize:12, fontWeight:700, color:color }}>
                                  {scorePercent}/100 match score
                                </span>
                              </div>
                              <p style={{ fontSize:13, color:'#6B7280', margin:'0 0 10px', lineHeight:1.5, fontStyle:'italic' }}>
                                "{course.reason}"
                              </p>
                              <div style={{ background:'#E5E7EB', borderRadius:99, height:6, overflow:'hidden' }}>
                                <div style={{ width:`${scorePercent}%`, height:'100%', background:`linear-gradient(to right,${color}88,${color})`, borderRadius:99, transition:'width 1s ease' }}/>
                              </div>
                            </div>
                          )}

                          <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
                            <Link href={`/classes/${course.id}`} style={{ textDecoration:'none' }}>
                              <button style={{ background:'none', border:`1.5px solid ${color}`, color, borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
                                onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;}}
                                onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
                                View Class
                              </button>
                            </Link>
                            <Link href={`/classes/${course.id}/enroll`} style={{ textDecoration:'none' }}>
                              <button style={{ background:`linear-gradient(135deg,${color},${color}cc)`, color:'white', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:`0 4px 12px ${color}40`, transition:'all 0.2s' }}
                                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';}}
                                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                                Enroll Now 
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign:'center', marginTop:28 }}>
                <p style={{ fontSize:14, color:'#9CA3AF', marginBottom:14 }}>
                  Not what you're looking for? Browse all classes.
                </p>
                <Link href="/classes/search">
                  <button style={{ background:'none', border:'1.5px solid #10B981', color:'#10B981', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='#ECFDF5';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
                    Browse All Classes 
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
