'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import EnrollSidebar from './EnrollSidebar';
import { getCourseById } from '@/services/classService';
import { submitEnrollment } from '@/services/enrollmentService';


// ── Reusable sub-pieces (small, only used inside this file) ────────────────────
const inputStyle = (hasErr?: boolean): React.CSSProperties => ({
  width:'100%', padding:'12px 14px', borderRadius:11, fontSize:14,
  fontFamily:"'DM Sans',sans-serif", color:'#111827',
  border:`1.5px solid ${hasErr?'#FCA5A5':'#E5E7EB'}`,
  background:hasErr?'#FFF5F5':'white', outline:'none', transition:'border-color 0.2s',
});
const selectStyle = (hasErr?: boolean): React.CSSProperties => ({
  ...inputStyle(hasErr), cursor:'pointer',
  backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:38,
  appearance:'none' as const,
});
function ErrMsg({ msg }: { msg:string }) {
  return <span style={{ fontSize:11, color:'#EF4444', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    {msg}
  </span>;
}
function FieldLabel({ label, required, hint, children }: { label:string; required?:boolean; hint?:string; children:React.ReactNode }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'flex', alignItems:'center', gap:4 }}>
      {label}{required && <span style={{ color:'#EF4444' }}>*</span>}
    </label>
    {children}
    {hint && <span style={{ fontSize:11, color:'#9CA3AF' }}>{hint}</span>}
  </div>;
}
function NavBtn({ label, onClick, primary=false, icon }: { label:string; onClick:()=>void; primary?:boolean; icon?:React.ReactNode }) {
  return <button onClick={onClick} style={{
    background: primary ? 'linear-gradient(135deg,#10B981,#059669)' : 'white',
    color: primary ? 'white' : '#6B7280',
    border: primary ? 'none' : '1.5px solid #E5E7EB',
    borderRadius:13, padding:'13px 32px', fontSize:14, fontWeight:700,
    cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
    boxShadow: primary ? '0 6px 22px rgba(16,185,129,0.38)' : 'none',
    display:'flex', alignItems:'center', gap:8, transition:'all 0.25s',
  }}
    onMouseEnter={e=>{e.currentTarget.style.transform = primary ? 'translateY(-3px)' : 'translateX(-2px)';}}
    onMouseLeave={e=>{e.currentTarget.style.transform='none';}}>
    {!primary && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>}
    {label}
    {primary && icon}
  </button>;
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [{ n:1, label:'Your Details' }, { n:2, label:'Pick Schedule' }, { n:3, label:'Confirm' }];
  return (
    <div style={{ background:'white', borderRadius:18, padding:'22px 32px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        {steps.map((s,i)=>(
          <div key={s.n} style={{ display:'flex', alignItems:'center', flex: i<2?1:'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, transition:'all 0.35s cubic-bezier(.22,1,.36,1)', background:currentStep>s.n?'#10B981':currentStep===s.n?'linear-gradient(135deg,#10B981,#059669)':'white', color:(currentStep>s.n||currentStep===s.n)?'white':'#9CA3AF', border:(currentStep>s.n||currentStep===s.n)?'none':'2px solid #E5E7EB', boxShadow:currentStep===s.n?'0 6px 20px rgba(16,185,129,0.4)':currentStep>s.n?'0 2px 8px rgba(16,185,129,0.25)':'none', fontFamily:"'DM Sans',sans-serif" }}>
                {currentStep>s.n ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : s.n}
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:currentStep===s.n?'#10B981':currentStep>s.n?'#059669':'#9CA3AF', whiteSpace:'nowrap' }}>{s.label}</span>
            </div>
            {i<2 && <div style={{ flex:1, height:2, margin:'0 4px', marginBottom:22, background:currentStep>s.n?'#10B981':'#E5E7EB', transition:'background 0.4s' }}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EnrollPage() {
  const params = useParams();
  const id     = Number(params?.id);

  // Course data from backend
  const [course,   setCourse]   = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step state
  const [step, setStep] = useState(1);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dashboardLink, setDashboardLink] = useState('/dashboard/student');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'tutor') setDashboardLink('/dashboard/tutor');
        if (user.role === 'admin') setDashboardLink('/dashboard/admin');
      }
    } catch (e) {}
  }, []);

  // Step 1 state
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [school,   setSchool]   = useState('');
  const [grade,    setGrade]    = useState('');
  const [message,  setMessage]  = useState('');

  // Step 2 state
  const [preferredMode, setPreferredMode] = useState('');
  const [selectedDay,   setSelectedDay]   = useState('');
  const [selectedTime,  setSelectedTime]  = useState('');

  // Step 3 state
  const [agreed, setAgreed] = useState(false);

  const [scrollY, setScrollY] = useState(0);
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const data = await getCourseById(id);
        setCourse(data);
        if (data.mode !== 'both') setPreferredMode(data.mode);
      } catch (err) {
        setError('Failed to load class details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }); }, [step]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#F4F6F5', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:40, height:40, border:'4px solid #f3f4f6', borderTopColor:'#10B981', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  if (!course) return <div style={{ padding: 100, textAlign: 'center' }}>Course not found</div>;

  const tutor = course.tutor;

  const focus = (e: React.FocusEvent<any>) => { e.target.style.borderColor='#10B981'; e.target.style.boxShadow='0 0 0 3px rgba(16,185,129,0.12)'; };
  const blur  = (e: React.FocusEvent<any>, hasErr: boolean) => { e.target.style.borderColor=hasErr?'#FCA5A5':'#E5E7EB'; e.target.style.boxShadow='none'; };

  const validateStep1 = () => {
    const e: Record<string,string> = {};
    if (!fullName.trim())                      e.fullName = 'Full name is required';
    if (!email.trim() || !email.includes('@')) e.email    = 'Valid email is required';
    if (!phone.trim() || phone.length < 9)    e.phone    = 'Valid phone number is required';
    if (!grade)                                e.grade    = 'Please select your grade/level';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const validateStep2 = () => {
    const e: Record<string,string> = {};
    if (course?.mode==='both' && !preferredMode) e.mode = 'Please select a teaching mode';
    if (!selectedDay)                           e.day  = 'Please select a day';
    if (!selectedTime)                          e.time = 'Please select a time slot';
    setErrors(e); return Object.keys(e).length === 0;
  };
  const validateStep3 = () => {
    const e: Record<string,string> = {};
    if (!agreed) e.agreed = 'Please accept the terms to continue';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleNext   = () => { if (step===1&&!validateStep1()) return; if (step===2&&!validateStep2()) return; setErrors({}); setStep(s=>s+1); };
  const handleBack   = () => { setErrors({}); setStep(s=>s-1); };
  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await submitEnrollment({
        classId:       course.id,
        fullName,
        email,
        phone,
        school,
        grade,
        message,
        preferredMode: preferredMode || course.mode,
        selectedDay,
        selectedTime,
      });

      setStep(4);
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || 'Failed to submit enrollment. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayMode = preferredMode || course?.mode;

  if (loading) return (
    <>
      <Navbar scrollY={scrollY} />
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4F6F5' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, border:'3px solid #E5E7EB', borderTop:'3px solid #10B981', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
          <p style={{ color:'#9CA3AF', fontSize:15 }}>Loading enrollment form...</p>
        </div>
      </div>
    </>
  );

  if (error || !course) return (
    <>
      <Navbar scrollY={scrollY} />
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F4F6F5' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>⚠️</div>
          <p style={{ fontSize:16, color:'#EF4444', fontWeight:600, marginBottom:20 }}>{error || 'Course not found'}</p>
          <Link href="/classes/search">
            <button style={{ background:'#10B981', color:'white', border:'none', borderRadius:12, padding:'11px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              Back to Search
            </button>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#F4F6F5;}
        a{text-decoration:none;color:inherit;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#10B981;border-radius:99px;}
        input:focus,select:focus,textarea:focus{outline:none;}
        input[type=checkbox]{accent-color:#10B981;}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        .step-panel{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both;}
        @media(max-width:1024px){.enroll-sidebar{display:none!important;}}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#F4F6F5' }}>
        <Navbar scrollY={scrollY} />

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#064E3B 0%,#065F46 50%,#047857 100%)', padding:'90px 6% 40px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, opacity:0.06, pointerEvents:'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 1440 180" preserveAspectRatio="xMidYMid slice">
              <circle cx="150" cy="90" r="140" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="1300" cy="70" r="110" fill="none" stroke="white" strokeWidth="1"/>
            </svg>
          </div>
          <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:16 }}>
              <Link href="/"><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Home</span></Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <Link href="/classes/search"><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Classes</span></Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <Link href={`/classes/${course.id}`}><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{course.subject}</span></Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <span style={{ fontSize:12, color:'#34D399', fontWeight:600 }}>Enroll</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,3.5vw,44px)', fontWeight:900, color:'white', marginBottom:8, lineHeight:1.1 }}>
              {step<4 ? 'Enroll in This Class' : 'Enrollment Requested!'}
            </h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', fontWeight:300 }}>
              {step<4 ? `Joining ${course?.tutor_name || 'tutor'}'s class · ${course?.title}` : 'Your request has been sent to the tutor'}
            </p>
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0 }}>
            <svg viewBox="0 0 1440 36" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:36 }}>
              <path d="M0,16 C360,40 1080,0 1440,20 L1440,36 L0,36 Z" fill="#F4F6F5"/>
            </svg>
          </div>
        </div>

        {/* Main */}
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 6% 80px', display:'flex', gap:28, alignItems:'flex-start' }}>

          {/* Form column */}
          <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:20 }}>
            {step<4 && <StepIndicator currentStep={step}/>}

            {/* ══ STEP 1 — Personal details ══════════════════════════════════ */}
            {step===1 && (
              <div className="step-panel" style={{ background:'white', borderRadius:22, padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                  <div style={{ width:44, height:44, borderRadius:13, background:'linear-gradient(135deg,#d1fae5,#6ee7b7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#111827' }}>Your Details</h2>
                    <p style={{ fontSize:13, color:'#9CA3AF' }}>Tell us a bit about yourself</p>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
                  <FieldLabel label="Full Name" required>
                    <input style={inputStyle(!!errors.fullName)} type="text" placeholder="e.g. Amal Perera" value={fullName} onChange={e=>setFullName(e.target.value)} onFocus={focus} onBlur={e=>blur(e,!!errors.fullName)}/>
                    {errors.fullName && <ErrMsg msg={errors.fullName}/>}
                  </FieldLabel>
                  <FieldLabel label="Email Address" required>
                    <input style={inputStyle(!!errors.email)} type="email" placeholder="e.g. amal@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} onFocus={focus} onBlur={e=>blur(e,!!errors.email)}/>
                    {errors.email && <ErrMsg msg={errors.email}/>}
                  </FieldLabel>
                  <FieldLabel label="Phone Number" required hint="We'll use this to confirm your enrollment">
                    <input style={inputStyle(!!errors.phone)} type="tel" placeholder="e.g. 077 123 4567" value={phone} onChange={e=>setPhone(e.target.value)} onFocus={focus} onBlur={e=>blur(e,!!errors.phone)}/>
                    {errors.phone && <ErrMsg msg={errors.phone}/>}
                  </FieldLabel>
                  <FieldLabel label="School / University">
                    <input style={inputStyle()} type="text" placeholder="e.g. Nalanda College" value={school} onChange={e=>setSchool(e.target.value)} onFocus={focus} onBlur={e=>blur(e,false)}/>
                  </FieldLabel>
                  <FieldLabel label="Grade / Level" required>
                    <select style={selectStyle(!!errors.grade)} value={grade} onChange={e=>setGrade(e.target.value)} onFocus={focus} onBlur={e=>blur(e,!!errors.grade)}>
                      <option value="">Select your level...</option>
                      {['Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11 (O/L)','Grade 12 (A/L — Year 1)','Grade 13 (A/L — Year 2)','University / Higher Education','Other / Adult Learner'].map(g=><option key={g}>{g}</option>)}
                    </select>
                    {errors.grade && <ErrMsg msg={errors.grade}/>}
                  </FieldLabel>
                  <div style={{ gridColumn:'1 / -1' }}>
                    <FieldLabel label="Message to Tutor" hint="Optional — introduce yourself or ask a question">
                      <textarea style={{ ...inputStyle(), resize:'vertical', minHeight:90, lineHeight:1.6 }} placeholder={`Hi ${course?.tutor?.name?.split(' ')[0] || 'Tutor'}, I'm interested in joining your class because...`} value={message} onChange={e=>setMessage(e.target.value)} onFocus={focus} onBlur={e=>blur(e,false)}/>
                    </FieldLabel>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:28 }}>
                  <NavBtn primary label="Next: Pick Schedule" onClick={handleNext} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>}/>
                </div>
              </div>
            )}

            {/* ══ STEP 2 — Schedule ══════════════════════════════════════════ */}
            {step===2 && (
              <div className="step-panel">
                {/* Mode selection */}
                {course?.mode==='both' && (
                  <div style={{ background:'white', borderRadius:22, padding:'28px 32px', marginBottom:20, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#111827', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ width:4, height:20, background:'#10B981', borderRadius:2, display:'inline-block' }}/>Preferred Mode
                    </h2>
                    <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:20 }}>This class supports both — choose your preference</p>
                    <div style={{ display:'flex', gap:14 }}>
                      {[
                        { val:'online',  icon:'💻', label:'Online',    desc:'Attend from anywhere via video call', color:'#10B981' },
                        { val:'offline', icon:'🏫', label:'In-Person', desc:`At ${course?.location}`, color:'#3B82F6' },
                      ].map(m=>(
                        <div key={m.val} onClick={()=>setPreferredMode(m.val)} style={{ flex:1, border:`2px solid ${preferredMode===m.val?m.color:'#E5E7EB'}`, borderRadius:14, padding:20, cursor:'pointer', textAlign:'center', transition:'all 0.22s', background:preferredMode===m.val?(m.val==='online'?'#f0fdf4':'#eff6ff'):'white' }}>
                          <div style={{ fontSize:28, marginBottom:10 }}>{m.icon}</div>
                          <div style={{ fontWeight:700, fontSize:15, color:preferredMode===m.val?m.color:'#111827', marginBottom:4 }}>{m.label}</div>
                          <div style={{ fontSize:12, color:'#9CA3AF' }}>{m.desc}</div>
                          {preferredMode===m.val && <div style={{ marginTop:10, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                            <div style={{ width:18, height:18, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span style={{ fontSize:12, fontWeight:600, color:m.color }}>Selected</span>
                          </div>}
                        </div>
                      ))}
                    </div>
                    {errors.mode && <span style={{ fontSize:11, color:'#EF4444', marginTop:10, display:'flex' }}>{errors.mode}</span>}
                  </div>
                )}

                {/* Day selection */}
                <div style={{ background:'white', borderRadius:22, padding:'28px 32px', marginBottom:20, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#111827', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ width:4, height:20, background:'#10B981', borderRadius:2, display:'inline-block' }}/>Preferred Day
                  </h2>
                  <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:20 }}>Choose the day that works best for you</p>
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                    {Object.keys(course?.schedule || {}).map(day=>(
                      <div key={day} onClick={()=>{ setSelectedDay(day); setSelectedTime(''); }} style={{ flex:'1', minWidth:80, maxWidth:110, border:`2px solid ${selectedDay===day?'#10B981':'#E5E7EB'}`, borderRadius:14, padding:'14px 8px', cursor:'pointer', textAlign:'center', transition:'all 0.22s', background:selectedDay===day?'linear-gradient(135deg,#f0fdf4,#ecfdf5)':'white', boxShadow:selectedDay===day?'0 6px 20px rgba(16,185,129,0.18)':'none', transform:selectedDay===day?'translateY(-3px)':'none' }}>
                        <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.1em', color:selectedDay===day?'#10B981':'#9CA3AF', textTransform:'uppercase', marginBottom:4 }}>{day}</div>
                        <div style={{ fontSize:12, color:'#6B7280' }}>{course?.schedule?.[day]?.length || 0} slots</div>
                        {selectedDay===day && <div style={{ width:20, height:20, borderRadius:'50%', background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', margin:'8px auto 0' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>}
                      </div>
                    ))}
                  </div>
                  {errors.day && <span style={{ fontSize:11, color:'#EF4444', marginTop:10, display:'flex' }}>{errors.day}</span>}
                </div>

                {/* Time slots */}
                {selectedDay && (
                  <div style={{ background:'white', borderRadius:22, padding:'28px 32px', marginBottom:20, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#111827', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ width:4, height:20, background:'#10B981', borderRadius:2, display:'inline-block' }}/>Available Times — {selectedDay}
                    </h2>
                    <p style={{ fontSize:13, color:'#9CA3AF', marginBottom:20 }}>Pick your preferred session time</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                      {course?.schedule?.[selectedDay]?.map((t: string)=>(
                        <button key={t} onClick={()=>setSelectedTime(t)} style={{ padding:'10px 18px', borderRadius:11, fontSize:14, fontWeight:600, cursor:'pointer', border:`1.5px solid ${selectedTime===t?'#10B981':'#E5E7EB'}`, background:selectedTime===t?'#10B981':'white', color:selectedTime===t?'white':'#374151', fontFamily:"'DM Sans',sans-serif", boxShadow:selectedTime===t?'0 4px 12px rgba(16,185,129,0.35)':'none', transition:'all 0.2s' }}>
                          🕐 {t}
                        </button>
                      ))}
                    </div>
                    {errors.time && <span style={{ fontSize:11, color:'#EF4444', marginTop:10, display:'flex' }}>{errors.time}</span>}
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <NavBtn label="Back" onClick={handleBack}/>
                  <NavBtn primary label="Next: Review" onClick={handleNext} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>}/>
                </div>
              </div>
            )}

            {/* ══ STEP 3 — Confirm ═══════════════════════════════════════════ */}
            {step===3 && (
              <div className="step-panel">
                <div style={{ background:'white', borderRadius:22, padding:'28px 32px', marginBottom:20, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#111827', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ width:4, height:22, background:'#10B981', borderRadius:2, display:'inline-block' }}/>Review Your Enrollment
                  </h2>

                  {/* Personal summary */}
                  <div style={{ background:'#F9FAFB', borderRadius:14, padding:'18px 20px', marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9CA3AF' }}>Personal Details</p>
                      <button onClick={()=>{ setErrors({}); setStep(1); }} style={{ fontSize:12, color:'#10B981', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
                      </button>
                    </div>
                    {[{l:'Full Name',v:fullName},{l:'Email',v:email},{l:'Phone',v:phone},{l:'School',v:school||'—'},{l:'Grade',v:grade},...(message?[{l:'Message',v:message}]:[])].map(row=>(
                      <div key={row.l} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
                        <span style={{ fontSize:13, color:'#6B7280', width:120, flexShrink:0 }}>{row.l}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:'#111827', flex:1 }}>{row.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Schedule summary */}
                  <div style={{ background:'#F0FDF4', borderRadius:14, padding:'18px 20px', marginBottom:16, border:'1px solid #A7F3D0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                      <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#059669' }}>Selected Schedule</p>
                      <button onClick={()=>{ setErrors({}); setStep(2); }} style={{ fontSize:12, color:'#10B981', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
                      </button>
                    </div>
                    {[
                      {l:'Day',v:selectedDay},{l:'Time',v:`🕐 ${selectedTime}`},
                      {l:'Mode',v:displayMode?.charAt(0).toUpperCase()+displayMode?.slice(1)},
                      {l:'Location',v:displayMode==='online'?'Online (video call)':course?.location},
                      {l:'Fee',v:`LKR ${course?.fee?.toLocaleString()}/month`},
                    ].map(row=>(
                      <div key={row.l} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(16,185,129,0.1)' }}>
                        <span style={{ fontSize:13, color:'#065F46', width:120, flexShrink:0 }}>{row.l}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'#065F46', flex:1 }}>{row.v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Terms */}
                  <div style={{ background:agreed?'#F0FDF4':'#FAFAFA', borderRadius:12, padding:'16px 18px', border:`1.5px solid ${agreed?'#A7F3D0':'#E5E7EB'}`, transition:'all 0.25s' }}>
                    <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer' }}>
                      <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ width:18, height:18, marginTop:1, flexShrink:0, cursor:'pointer' }}/>
                      <span style={{ fontSize:13, color:'#4B5563', lineHeight:1.6 }}>
                        I agree to Mentora.lk's <a href="#" style={{ color:'#10B981', fontWeight:600 }}>Terms of Service</a> and <a href="#" style={{ color:'#10B981', fontWeight:600 }}>Privacy Policy</a>. I understand enrollment is subject to tutor approval.
                      </span>
                    </label>
                    {errors.agreed && <span style={{ fontSize:11, color:'#EF4444', marginTop:8, display:'flex' }}>{errors.agreed}</span>}
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <NavBtn label="Back" onClick={handleBack}/>
                  <button
                    onClick={handleSubmit}
                    disabled={!agreed || submitting}
                    style={{
                      background: 'linear-gradient(135deg,#10B981,#059669)',
                      color: 'white', border: 'none', borderRadius: 13,
                      padding: '13px 40px', fontSize: 15, fontWeight: 700,
                      cursor: (!agreed || submitting) ? 'not-allowed' : 'pointer',
                      fontFamily: "'DM Sans',sans-serif",
                      boxShadow: '0 6px 22px rgba(16,185,129,0.38)',
                      display: 'flex', alignItems: 'center', gap: 8,
                      opacity: (!agreed || submitting) ? 0.6 : 1,
                      transition: 'all 0.28s',
                    }}
                    onMouseEnter={e => { if (agreed && !submitting) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Submit Enrollment Request
                      </>
                    )}
                  </button>
                </div>

                {submitError && (
                  <p style={{ fontSize:13, color:'#EF4444', marginTop:12, textAlign:'center', fontWeight:600 }}>
                    ⚠️ {submitError}
                  </p>
                )}
              </div>
            )}

            {/* ══ STEP 4 — Success ═══════════════════════════════════════════ */}
            {step===4 && (
              <div className="step-panel" style={{ textAlign:'center', padding:'48px 32px', background:'white', borderRadius:24, boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 12px 40px rgba(16,185,129,0.4)', animation:'scaleIn 0.5s cubic-bezier(.22,1,.36,1)' }}>
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:'#111827', marginBottom:8 }}>You're Almost In! 🎉</h2>
                <p style={{ fontSize:15, color:'#6B7280', marginBottom:28, lineHeight:1.7, maxWidth:420, margin:'0 auto 28px' }}>
                  Hi <strong style={{ color:'#111827' }}>{fullName}</strong>! Your enrollment request for <strong style={{ color:'#10B981' }}>{course?.title}</strong> has been sent to <strong style={{ color:'#111827' }}>{course?.tutor_name || 'tutor'}</strong>.
                </p>

                <div style={{ background:'#F0FDF4', borderRadius:16, padding:'22px 24px', marginBottom:28, border:'1px solid #A7F3D0', textAlign:'left' }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#059669', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14 }}>What happens next</p>
                  {[
                    { icon:'📧', text:'Confirmation email sent to your inbox' },
                    { icon:'⏳', text:`${course?.tutor_name || 'Your tutor'} will review your request within 24 hours` },
                    { icon:'✅', text:"You'll receive approval + payment details via email" },
                    { icon:'🎓', text:`First class: ${selectedDay} at ${selectedTime}` },
                  ].map((item,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:i<3?'1px solid rgba(16,185,129,0.12)':'none' }}>
                      <span style={{ fontSize:18 }}>{item.icon}</span>
                      <span style={{ fontSize:13, color:'#065F46', fontWeight:500 }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                  <Link href={dashboardLink}>
                    <button style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:13, padding:'13px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 6px 22px rgba(16,185,129,0.38)', transition:'all 0.25s' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='none';}}>View My Classes →</button>
                  </Link>
                  <Link href="/classes/search">
                    <button style={{ background:'white', color:'#374151', border:'1.5px solid #E5E7EB', borderRadius:13, padding:'13px 28px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.25s' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='none';}}>Browse More Classes</button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="enroll-sidebar" style={{ width:300, flexShrink:0 }}>
            <EnrollSidebar
              courseId={course.id} title={course.title} image={course.image}
              tutorName={course.tutor_name || 'Tutor'} tutorAvatar={course.tutor_avatar || ''}
              fee={course.fee} mode={course.mode} location={course.location}
              enrolled={course.enrolledCount || 0} maxStudents={course.max_students || 10}
              currentStep={step}
            />
          </div>
        </div>

        <div style={{ background:'#0F172A', padding:'20px 6%', textAlign:'center' }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2026 Mentora<span style={{ color:'#10B981' }}>.lk</span> · Team Loop 5</span>
        </div>
      </div>
    </>
  );
}