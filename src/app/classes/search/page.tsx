'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';
import { searchCourses } from '@/services/classService';

//!Filter Dropdown
const SUBJECTS  = ['All','Mathematics','Physics','Chemistry','ICT','Music','Business','English'];
const LOCATIONS = ['All Locations','Moratuwa','Colombo','Kandy','Piliyandala','Matale','Online'];
const SORT_OPTIONS = [
  { value:'rating',   label:'Top Rated' },
  { value:'fee_asc',  label:'Price: Low to High' },   //!An array of objects:value → used internally:label → shown to user
  { value:'fee_desc', label:'Price: High to Low' },
  { value:'reviews',  label:'Most Reviewed' },
];
type Course = {         //!TypeScript type declaration:creating a blueprint of course object
  id: string;
  title: string;
  image: string;
  tutor: string;
  tutor_name?: string;
  average_rating?: number;
  review_count?: number;
  subject: string;
  rating: number;
  reviews: number;
  fee: number;
  location: string;
  mode: string;
  desc?: string;
  badge?: string;
};
const SUBJECT_COLORS: Record<string,string> = {
  Mathematics:'#8B5CF6', Physics:'#3B82F6', Chemistry:'#10B981',  //!colors used for subjects
  ICT:'#F59E0B', Music:'#EC4899', Business:'#F97316', English:'#06B6D4',
};
const MODE_COLOR: Record<string,string> = { online:'#10B981', offline:'#3B82F6', both:'#F59E0B' };

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {           //!rating(not yet implemented)
  return (
    <span style={{ display:'inline-flex', gap:1 }}>
      {[1,2,3,4,5].map(s=>(
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s<=Math.round(rating)?'#F59E0B':'none'} stroke="#F59E0B" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </span>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
//!grid view and list view of class cards
function CourseCard({ course, view }: { course: Course; view: 'grid'|'list' }) {
  const [hov, setHov] = useState(false);//!creating a variable to remember whether the card is hovered or not
  const sc = SUBJECT_COLORS[course.subject] || '#6B7280';

  if (view === 'list') {
    return (
      <Link href={`/classes/${course.id}`} style={{ textDecoration:'none' }}>
        <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} //!track mouse on/leave
          style={{ display:'flex', background:'white', borderRadius:18, overflow:'hidden', transition:'all 0.3s', transform:hov?'translateX(6px)':'translateX(0)', boxShadow:hov?`0 12px 32px ${sc}18`:'0 2px 12px rgba(0,0,0,0.05)', border:hov?`1px solid ${sc}30`:'1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ width:5, background:sc, flexShrink:0 }}/>
        {/* course img */}
          <div style={{ width:180, flexShrink:0, overflow:'hidden' }}>
           <img src={course.image} alt={course.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s', transform:hov?'scale(1.06)':'scale(1)' }}/>
          </div>

           {/* right-side content area */}
          <div style={{ flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#111827', lineHeight:1.35, maxWidth:'70%' }}>{course.title}</h3>
                {course.badge && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'white', flexShrink:0 }}>{course.badge}</span>}
              </div>
              <p style={{ fontSize:13, color:'#10B981', fontWeight:600, marginBottom:4 }}>By {course.tutor_name || "Tutor"}</p>
              <p style={{ fontSize:12, color:'#9CA3AF', marginBottom:8 }}>{course.desc}</p>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <Stars rating={course.average_rating || course.rating || 0}/>
                <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>{course.average_rating || course.rating}</span>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>({course.review_count || course.reviews || 0})</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
              <div style={{ display:'flex', gap:10 }}>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>📍 {course.location}</span>
                <span style={{ fontSize:11, fontWeight:700, color:MODE_COLOR[course.mode], background:`${MODE_COLOR[course.mode]}15`, borderRadius:5, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{course.mode}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:15, fontWeight:800, color:'#059669' }}>LKR {course.fee.toLocaleString()}<span style={{ fontSize:11, fontWeight:400, color:'#9CA3AF' }}>/mo</span></span>
                <span style={{ fontSize:13, fontWeight:600, color:'#10B981', border:'1px solid #10B981', borderRadius:8, padding:'5px 14px' }}>View →</span>
              </div>
            </div>
          </div>
        </div>
      </Link> 
    );
  }

  //!grid view of class cards
  return (
    <Link href={`/classes/${course.id}`} style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ background:'white', borderRadius:20, overflow:'hidden', transition:'all 0.32s cubic-bezier(.22,1,.36,1)', transform:hov?'translateY(-8px)':'translateY(0)', boxShadow:hov?`0 20px 44px ${sc}20`:'0 4px 18px rgba(0,0,0,0.06)', border:hov?`1px solid ${sc}30`:'1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ position:'relative', height:185, overflow:'hidden' }}>
          <img src={course.image} alt={course.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s', transform:hov?'scale(1.08)':'scale(1)' }}/>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 55%)' }}/>
          <div style={{ position:'absolute', top:12, left:12, background:sc, borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, color:'white' }}>{course.subject}</div>
          {course.badge && <div style={{ position:'absolute', top:12, right:12, background:'linear-gradient(135deg,#F59E0B,#EF4444)', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, color:'white' }}>{course.badge}</div>}
          <div style={{ position:'absolute', bottom:10, left:12, right:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.8)' }}>📍 {course.location}</span>
            <span style={{ fontSize:11, fontWeight:700, color:MODE_COLOR[course.mode], background:'rgba(0,0,0,0.55)', padding:'2px 7px', borderRadius:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>{course.mode}</span>
          </div>
        </div>
        <div style={{ padding:'15px 17px 17px' }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:'#111827', lineHeight:1.4, marginBottom:5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{course.title}</h3>
          <p style={{ fontSize:12, color:'#9CA3AF', marginBottom:7 }}>By <span style={{ fontWeight:600, color:'#10B981' }}>{course.tutor_name || "Tutor"}</span></p>
          <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:10 }}>
            <Stars rating={course.average_rating || course.rating || 0}/>
            <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>{course.average_rating || course.rating}</span>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>({course.review_count || course.reviews || 0})</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid #F3F4F6' }}>
            <span style={{ fontSize:14, fontWeight:800, color:'#059669' }}>LKR {course.fee.toLocaleString()}<span style={{ fontSize:10, fontWeight:400, color:'#9CA3AF' }}>/mo</span></span>
            <span style={{ fontSize:12, fontWeight:600, color:'#10B981' }}>View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Filter Chip ───────────────────────────────────────────────────────────────
//!show filter + tell parent to remove it
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:99, padding:'5px 12px', fontSize:12, fontWeight:600, color:'#059669' }}>
      {label}
      <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'#059669', display:'flex', padding:0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClassSearchPage() {
  //!These lines store filter values selected by the user
  const [scrollY,   setScrollY]   = useState(0); //!creates a state variable to store:the current vertical scroll position (Y-axis) of the page.has used in navbar file
  const [query,     setQuery]     = useState('');//!the value serched by  user saved in usestate and through API call fetch relevant data
  const [subject,   setSubject]   = useState('All');
  const [mode,      setMode]      = useState('All');
  const [location,  setLocation]  = useState('All Locations');
  const [minRating, setMinRating] = useState(0);
  const [maxFee,    setMaxFee]    = useState(6000);
  const [sortBy,    setSortBy]    = useState('rating');
  const [view,      setView]      = useState<'grid'|'list'>('grid');
  const [page,      setPage]      = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
const [total, setTotal] = useState(0);
const [totalPages, setTotalPages] = useState(1);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
  const topRef = useRef<HTMLDivElement>(null);



//! Fetch courses from backend whenever any filter or page changes
useEffect(() => {
  const fetchCourses = async () => {
    setLoading(true);//!show loading
    setError('');
    try { //!errorhandling for if API fails
      const data = await searchCourses({  //!call api:Sends request like:"subject": "Math","location": "Colombo",
        q:         query     || undefined,
        subject:   subject   !== 'All'           ? subject   : undefined,        
        mode:      mode      !== 'All'           ? mode      : undefined,    
        location:  location  !== 'All Locations' ? location  : undefined,
        minRating: minRating > 0                 ? minRating : undefined,
        maxFee:    maxFee    < 6000              ? maxFee    : undefined,
        sortBy,
        page,
        limit: 6,
      });
      setCourses(data.courses);
      setTotal(data.total);
      setTotalPages(data.totalPages);  //!Store data.Saves API response into state
    } catch (err) {
      setError('Failed to load courses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchCourses();
}, [query, subject, mode, location, minRating, maxFee, sortBy, page]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clearAll   = () => { setQuery(''); setSubject('All'); setMode('All'); setLocation('All Locations'); setMinRating(0); setMaxFee(6000); }; //!resets filters back to default values
  const activeCount = [subject!=='All', mode!=='All', location!=='All Locations', minRating>0, maxFee<6000].filter(Boolean).length;              //!counts how many filters are currently active.
  const scrollTop  = () => topRef.current?.scrollIntoView({ behavior:'smooth' });

  return (
    <>
      <style>{`

//!Inline CSS AND Internal CSS used for search pg

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#F4F6F5;color:#1a1a1a;}
        a{text-decoration:none;color:inherit;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#10B981;border-radius:99px;}
        input:focus,select:focus{outline:none;} input[type=range]{accent-color:#10B981;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .card-appear{animation:fadeUp 0.42s cubic-bezier(.22,1,.36,1) both;}
        .filter-card{background:white;border-radius:20px;padding:24px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.07);border:1px solid rgba(0,0,0,0.04);position:sticky;top:84px;}
        .filter-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:#9CA3AF;display:block;margin-bottom:10px;}
        .pg-btn{width:36px;height:36px;border-radius:9px;border:1.5px solid #E5E7EB;background:white;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;display:flex;align-items:center;justify-content:center;color:#6B7280;}
        .pg-btn:hover:not(:disabled){border-color:#10B981;color:#10B981;}
        .pg-btn.active{background:#10B981;border-color:#10B981;color:white;box-shadow:0 4px 12px rgba(16,185,129,0.35);}
        .pg-btn:disabled{opacity:0.35;cursor:not-allowed;}
        @media(max-width:1024px){.filter-sidebar{display:none!important;}}
      `}</style>

      <div style={{ minHeight:'100vh', background:'#F4F6F5' }}>
        <Navbar scrollY={scrollY} />

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#064E3B 0%,#065F46 50%,#047857 100%)', padding:'106px 6% 48px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, opacity:0.06, pointerEvents:'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMid slice">
              <circle cx="180" cy="130" r="180" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="1260" cy="90" r="140" fill="none" stroke="white" strokeWidth="1"/>
            </svg>
          </div>
          <div style={{ maxWidth:1380, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:16 }}>
              <Link href="/"><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Home</span></Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <span style={{ fontSize:12, color:'#34D399', fontWeight:600 }}>Browse Courses</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,50px)', fontWeight:900, color:'white', marginBottom:8, lineHeight:1.1 }}>Browse All Classes</h1>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.55)', marginBottom:26, fontWeight:300 }}>{total} classes from verified tutors across Sri Lanka</p>

            {/* Search */}
            <div style={{ display:'flex', background:'white', borderRadius:14, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.12)', maxWidth:680, border:'2px solid transparent' }}>
              <div style={{ flex:1, display:'flex', alignItems:'center', padding:'0 16px', gap:10 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search by subject, tutor name, or keyword..." value={query} onChange={e=>setQuery(e.target.value)}
                  style={{ flex:1, border:'none', background:'transparent', padding:'15px 0', fontSize:14, color:'#111', fontFamily:"'DM Sans',sans-serif" }}/>
                {query && <button onClick={()=>setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>}
              </div>
              <button style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', padding:'0 26px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Search</button>
            </div>

            {/* Quick subject chips */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:20 }}>
              {['All','Physics','ICT','Mathematics','Chemistry','Music','Business','English'].map(s=>(
                <button key={s} onClick={()=>setSubject(s)}
                  style={{ padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s', background:subject===s?'#10B981':'rgba(255,255,255,0.1)', color:subject===s?'white':'rgba(255,255,255,0.75)', borderColor:subject===s?'#10B981':'rgba(255,255,255,0.2)', boxShadow:subject===s?'0 4px 14px rgba(16,185,129,0.4)':'none' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0 }}>
            <svg viewBox="0 0 1440 38" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:38 }}>
              <path d="M0,18 C360,42 1080,0 1440,24 L1440,38 L0,38 Z" fill="#F4F6F5"/>
            </svg>
          </div>
        </div>

        {/* Main */}
        <div ref={topRef} style={{ maxWidth:1380, margin:'0 auto', padding:'28px 6% 64px', display:'flex', gap:26, alignItems:'flex-start' }}>

          {/* Filter Sidebar */}
          <div className="filter-sidebar" style={{ width:240, flexShrink:0 }}>
            <div className="filter-card">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22, paddingBottom:16, borderBottom:'1px solid #F3F4F6' }}>
                <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#d1fae5,#a7f3d0)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                </div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:16 }}>Filters</h3>
                {activeCount>0 && <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, background:'#10B981', color:'white', borderRadius:99, padding:'2px 8px' }}>{activeCount}</span>}
              </div>

              {/* Subject */}
              <div style={{ marginBottom:20 }}>
                <label className="filter-label">Subject</label>
                <select value={subject} onChange={e=>setSubject(e.target.value)} style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'9px 12px', fontSize:13, color:'#374151', background:'white', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                  {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Mode */}
              <div style={{ marginBottom:20 }}>
                <label className="filter-label">Mode</label>
                {['All','online','offline','both'].map(m=>(
                  <label key={m} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer', fontSize:13, color:'#374151' }}>
                    <input type="radio" name="mode" checked={mode===m} onChange={()=>setMode(m)} style={{ accentColor:'#10B981' }}/>
                    {m==='All'?'All Modes':m.charAt(0).toUpperCase()+m.slice(1)}
                  </label>
                ))}
              </div>

              {/* Location */}
              <div style={{ marginBottom:20 }}>
                <label className="filter-label">Location</label>
                <select value={location} onChange={e=>setLocation(e.target.value)} style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:10, padding:'9px 12px', fontSize:13, color:'#374151', background:'white', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                  {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Max fee */}
              <div style={{ marginBottom:20 }}>
                <label className="filter-label">Max Fee — LKR {maxFee.toLocaleString()}</label>
                <input type="range" min={500} max={6000} step={500} value={maxFee} onChange={e=>setMaxFee(+e.target.value)} style={{ width:'100%' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9CA3AF', marginTop:4 }}>
                  <span>500</span><span>6,000+</span>
                </div>
              </div>

              {/* Rating */}
              <div style={{ marginBottom:22 }}>
                <label className="filter-label">Min Rating</label>
                {[{v:0,l:'Any'},{v:4.5,l:'4.5+ ★'},{v:4.0,l:'4.0+ ★'}].map(r=>(
                  <label key={r.v} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer', fontSize:13, color:'#374151' }}>
                    <input type="radio" name="rating" checked={minRating===r.v} onChange={()=>setMinRating(r.v)} style={{ accentColor:'#10B981' }}/>
                    {r.l}
                  </label>
                ))}
              </div>

              <button onClick={clearAll} style={{ width:'100%', padding:'9px', borderRadius:10, border:'1.5px solid #E5E7EB', background:'white', color:'#6B7280', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
                onMouseEnter={e=>{(e.currentTarget.style.background='#FEF2F2');(e.currentTarget.style.borderColor='#FCA5A5');(e.currentTarget.style.color='#EF4444');}}
                onMouseLeave={e=>{(e.currentTarget.style.background='white');(e.currentTarget.style.borderColor='#E5E7EB');(e.currentTarget.style.color='#6B7280');}}>
                Clear All
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ flex:1, minWidth:0 }}>
            {/* Top bar */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#111827' }}>
                {total} <span style={{ fontWeight:400, fontSize:16, color:'#6B7280' }}>classes found</span>
                {query && <span style={{ fontSize:13, color:'#9CA3AF', marginLeft:10 }}>for &quot;<span style={{ color:'#10B981', fontWeight:600 }}>{query}</span>&quot;</span>}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:'8px 28px 8px 12px', borderRadius:10, fontSize:12, fontWeight:500, border:'1.5px solid #E5E7EB', background:'white', color:'#374151', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' }}>
                  {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div style={{ display:'flex', background:'white', borderRadius:10, border:'1.5px solid #E5E7EB', overflow:'hidden' }}>
                  {(['grid','list'] as const).map(v=>(
                    <button key={v} onClick={()=>setView(v)} style={{ width:36, height:34, border:'none', cursor:'pointer', background:view===v?'#10B981':'white', color:view===v?'white':'#9CA3AF', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                      {v==='grid'
                        ?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                        :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                      }
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active chips */}
            {activeCount>0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                {subject!=='All'             && <FilterChip label={`Subject: ${subject}`}                onRemove={()=>setSubject('All')}/>}
                {mode!=='All'               && <FilterChip label={`Mode: ${mode}`}                      onRemove={()=>setMode('All')}/>}
                {location!=='All Locations' && <FilterChip label={`📍 ${location}`}                    onRemove={()=>setLocation('All Locations')}/>}
                {minRating>0                && <FilterChip label={`${minRating}★ & above`}              onRemove={()=>setMinRating(0)}/>}
                {maxFee<6000                && <FilterChip label={`Max LKR ${maxFee.toLocaleString()}`} onRemove={()=>setMaxFee(6000)}/>}
              </div>
            )}

            {/* Cards */}
            {loading ? (
              <div style={{ textAlign:'center', padding:'60px 0' }}>
                <div style={{ width:40, height:40, border:'3px solid #E5E7EB', borderTop:'3px solid #10B981', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
                <p style={{ color:'#9CA3AF', fontSize:14 }}>Loading courses...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign:'center', padding:'60px 0', color:'#EF4444' }}>
                <p style={{ fontSize:16, fontWeight:600 }}>{error}</p>
                <button onClick={() => setError('')}
                  style={{ marginTop:16, background:'#10B981', color:'white', border:'none', borderRadius:10, padding:'10px 24px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                  Try Again
                </button>
              </div>
            ) : courses.length > 0 ? (
              <>
                <div style={{ display:view==='grid'?'grid':'flex', gridTemplateColumns:view==='grid'?'repeat(auto-fill,minmax(275px,1fr))':undefined, flexDirection:view==='list'?'column':undefined, gap:22 }}>
                  {courses.map((c,i)=>(
                    <div key={c.id} className="card-appear" style={{ animationDelay:`${i*0.06}s` }}>
                      <CourseCard course={c} view={view}/>
                    </div>
                  ))}
                </div>

                {totalPages>1 && (
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, marginTop:40 }}>
                    <button className="pg-btn" onClick={()=>{setPage(p=>p-1);scrollTop();}} disabled={page===1}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                      <button key={p} className={`pg-btn${page===p?' active':''}`} onClick={()=>{setPage(p);scrollTop();}}>{p}</button>
                    ))}
                    <button className="pg-btn" onClick={()=>{setPage(p=>p+1);scrollTop();}} disabled={page===totalPages}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                )}
                <p style={{ textAlign:'center', fontSize:12, color:'#9CA3AF', marginTop:12 }}>
                  Showing {(page-1)*6+1}–{Math.min(page*6,total)} of {total} results
                </p>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'80px 24px', background:'white', borderRadius:20, border:'1px solid #F3F4F6' }}>
                <div style={{ fontSize:52, marginBottom:14 }}>🔍</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:10 }}>No classes found</h3>
                <p style={{ fontSize:14, color:'#9CA3AF', marginBottom:22 }}>Try adjusting your filters.</p>
                <button onClick={clearAll} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:12, padding:'11px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Clear All Filters</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ background:'#0F172A', padding:'20px 6%', textAlign:'center' }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2026 Mentora<span style={{ color:'#10B981' }}>.lk</span> · Team Loop 5</span>
        </div>
      </div>
    </>
  );
}