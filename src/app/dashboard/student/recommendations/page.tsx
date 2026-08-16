'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// ── Constants ─────────────────────────────────────────────────────────────────
const RECOMMENDATIONS_URL = 'http://localhost:5000/api/recommendations';

const SUBJECTS = ['Mathematics','Physics','Chemistry','ICT','English','Biology','Music','Business','Science'];

const LEVELS: { value: string; label: string }[] = [
  { value: 'O/L', label: 'O/L (Grade 10-11)' },
  { value: 'A/L', label: 'A/L (Grade 12-13)' },
  { value: 'Undergraduate', label: 'Undergraduate' },
];

const MODES: { value: string; label: string }[] = [
  { value: 'Online', label: '🌐 Online only' },
  { value: 'Physical', label: '🏫 Physical (face to face)' },
  { value: 'Both', label: '✅ Both are fine' },
];

const GOALS = ['Pass exams', 'Improve grades', 'Grade Enhancement', 'Master the subject'];

const DAY_ABBR: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
  Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};
const DAYS = Object.keys(DAY_ABBR);

const CITIES = ['Colombo','Gampaha','Kalutara','Kandy','Galle','Matara','Kurunegala','Ratnapura','Anuradhapura','Polonnaruwa','Badulla','Monaragala','Jaffna','Trincomalee','Batticaloa','Ampara','Hambantota','Nuwara Eliya','Kegalle','Matale'];

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

// ── Types ─────────────────────────────────────────────────────────────────────
type RecommendationMatch = {
  id: number;
  tutor_id: number;
  title: string;
  subject: string;
  fee: string;
  mode: string;
  location: string;
  image?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  what_you_learn?: string[];
  schedule?: Record<string, string[]>;
  tutor?: {
    name?: string;
    experience?: string;
    university?: string;
    degree?: string;
    city?: string;
    profile_picture?: string;
  };
  matchScore: number;
  aiInsight?: string;
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RecommendationsPage() {
  const resultsRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    subjects:      [] as string[],
    level:         '',
    mode:          '',
    availableDays: [] as string[],
    budget:        3500,
    goal:          '',
    city:          '',
  });

  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results,   setResults]   = useState<RecommendationMatch[]>([]);
  const [formError, setFormError] = useState('');

  const toggleArray = (key: 'subjects'|'availableDays', value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async () => {
    setFormError('');
    setLoading(true);
    try {
      const payload = {
        subjects: form.subjects,
        level: form.level || undefined,
        mode: form.mode || undefined,
        availableDays: form.availableDays.map(d => DAY_ABBR[d]),
        budget: form.budget || undefined,
        goal: form.goal || undefined,
        city: form.city || undefined,
      };

      const res = await fetch(RECOMMENDATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const errBody = await res.json();
          message = errBody.message || message;
        } catch {}
        throw new Error(message);
      }

      const json = await res.json();
      setResults(Array.isArray(json.data) ? json.data : []);
      setSubmitted(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior:'smooth', block:'start' });
      }, 300);
    } catch (err: any) {
      setFormError(err.message || 'Failed to get recommendations. Please try again.');
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
              Our AI scores every available tutor and class against your preferences — subject, budget, schedule and location — to find your perfect match.
            </p>
          </div>
        </div>

        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14 }}>
          {[
            { icon:'📚', label:'Pick your subjects', desc:'Tell us what you struggle with', color:'#8B5CF6', bg:'#F5F3FF' },
            { icon:'⚙️', label:'Set preferences',   desc:'Budget, mode, days and city',  color:'#10B981', bg:'#ECFDF5' },
            { icon:'✨', label:'Get matched',        desc:'AI scores all tutors for you', color:'#F59E0B', bg:'#FFFBEB' },
            { icon:'🎓', label:'Enroll instantly',   desc:'One click to join the class',  color:'#3B82F6', bg:'#EFF6FF' },
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
              <Chip key={s} label={s} active={form.subjects.includes(s)}
                color={SUBJECT_COLORS[s] || '#10B981'}
                onClick={() => toggleArray('subjects', s)}/>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="🎓 What is your current level?">
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
            {LEVELS.map(l => (
              <Chip key={l.value} label={l.label} active={form.level===l.value} color="#8B5CF6"
                onClick={() => setForm(p=>({...p,level:l.value}))}/>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="💻 How do you prefer to learn?">
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
            {MODES.map(m => (
              <Chip key={m.value} label={m.label} active={form.mode===m.value} color="#3B82F6"
                onClick={() => setForm(p=>({...p,mode:m.value}))}/>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="📅 Which days are you available?" subtitle="Select all days that work for you">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:10 }}>
            {DAYS.map(d => (
              <Chip key={d} label={d} active={form.availableDays.includes(d)} color="#F59E0B"
                onClick={() => toggleArray('availableDays', d)}/>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="💰 What is your monthly budget?">
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, color:'#10B981' }}>
              LKR {form.budget.toLocaleString()}
            </div>
            <p style={{ fontSize:13, color:'#9CA3AF', margin:0 }}>per month</p>
          </div>
          <input type="range" min="1000" max="10000" step="500"
            value={form.budget}
            onChange={e=>setForm(p=>({...p,budget:Number(e.target.value)}))}
            style={{ width:'100%', accentColor:'#10B981', height:6, cursor:'pointer' }}
          />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#9CA3AF', marginTop:8 }}>
            <span>LKR 1,000</span>
            <span>LKR 10,000</span>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:14 }}>
            {[2000,3000,4000,5000].map(b => (
              <button key={b} onClick={()=>setForm(p=>({...p,budget:b}))}
                style={{ padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:600, border:`1.5px solid ${form.budget===b?'#10B981':'#E5E7EB'}`, background:form.budget===b?'#ECFDF5':'white', color:form.budget===b?'#10B981':'#6B7280', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}>
                LKR {b.toLocaleString()}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="🎯 What is your main goal?">
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
            {GOALS.map(g => (
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

        {submitted && (
          <div ref={resultsRef} className="slide-in" style={{ marginTop:12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:'#111827', marginBottom:4 }}>
                  🎯 Your Top Matches
                </h2>
                <p style={{ fontSize:14, color:'#6B7280', margin:0 }}>
                  {results.length > 0
                    ? `${results.length} tutor${results.length===1?'':'s'} matched to your preferences`
                    : `No matches found for these preferences yet`
                  }
                </p>
              </div>
              {results.length > 0 && (
                <div style={{ background:'#ECFDF5', borderRadius:12, padding:'10px 18px', border:'1px solid #A7F3D0' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#059669' }}>
                    ✨ AI Scored
                  </span>
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
                <p style={{ fontSize:16, fontWeight:600 }}>No matches yet</p>
                <p style={{ fontSize:13, marginTop:6 }}>Try widening your budget, days, or subjects.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {results.map((course, i) => {
                  const color        = SUBJECT_COLORS[course.subject] || '#10B981';
                  const scorePercent = Math.min(100, Math.round(course.matchScore || 0));
                  const isTop        = i === 0;
                  const tutor        = course.tutor || {};
                  const scheduleEntries = course.schedule ? Object.entries(course.schedule) : [];

                  return (
                    <div key={course.id} className="result-card"
                      style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:`1px solid ${isTop?'#10B981':'rgba(0,0,0,0.04)'}`, position:'relative' }}>

                      {(course.badge || isTop) && (
                        <div style={{ position:'absolute', top:16, right:16, background:'linear-gradient(135deg,#10B981,#059669)', color:'white', borderRadius:8, padding:'4px 12px', fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', zIndex:1 }}>
                          🏆 {course.badge || 'Best Match'}
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
                                {tutor.profile_picture ? (
                                  <img src={tutor.profile_picture} alt={tutor.name || 'Tutor'}
                                    style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' }}
                                    onError={e => { (e.target as HTMLImageElement).style.display='none'; }}
                                  />
                                ) : (
                                  <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${color},${color}88)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700, flexShrink:0 }}>
                                    {(tutor.name || 'T').charAt(0)}
                                  </div>
                                )}
                                <span style={{ fontSize:13, color:'#6B7280' }}>
                                  By <span style={{ color:'#10B981', fontWeight:600 }}>{tutor.name || 'Tutor'}</span>
                                  {tutor.university && <> · {tutor.university}</>}
                                </span>
                              </div>

                              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                                <span style={{ fontSize:14, fontWeight:800, color:'#059669' }}>
                                  LKR {Number(course.fee || 0).toLocaleString()}<span style={{ fontSize:11, fontWeight:400, color:'#9CA3AF' }}>/mo</span>
                                </span>
                                {course.location && (
                                  <span style={{ fontSize:12, color:'#9CA3AF', display:'flex', alignItems:'center', gap:4 }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    {course.location}
                                  </span>
                                )}
                              </div>

                              {course.what_you_learn && course.what_you_learn.length > 0 && (
                                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>
                                  {course.what_you_learn.map(topic => (
                                    <span key={topic} style={{ fontSize:11, fontWeight:600, background:'#F9FAFB', color:'#6B7280', borderRadius:6, padding:'4px 10px', border:'1px solid #F3F4F6' }}>
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {scheduleEntries.length > 0 && (
                                <p style={{ fontSize:12, color:'#9CA3AF', marginTop:10 }}>
                                  {scheduleEntries.map(([day, times]) => `${day}: ${times.join(', ')}`).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>

                          {course.aiInsight && (
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
                                "{course.aiInsight}"
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
                                Enroll Now →
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ textAlign:'center', marginTop:28 }}>
              <p style={{ fontSize:14, color:'#9CA3AF', marginBottom:14 }}>
                Not what you're looking for? Browse all classes.
              </p>
              <Link href="/classes/search">
                <button style={{ background:'none', border:'1.5px solid #10B981', color:'#10B981', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#ECFDF5';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
                  Browse All Classes →
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
