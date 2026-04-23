'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar/Navbar';

// ── All data self-contained ────────────────────────────────────────────────────
const ALL_COURSES = [
  { id:1, title:'A/L Combined Mathematics', tutor:'Kasun Fernando', subject:'Mathematics', location:'Moratuwa', mode:'online', fee:2500, rating:4.8, reviews:94, badge:'Best Seller', image:'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80', desc:'Full A/L syllabus with past paper practice and exam techniques.' },
  { id:2, title:'Advanced Level : ICT', tutor:'Nimesh Dissanayake', subject:'ICT', location:'Piliyandala', mode:'online', fee:3000, rating:4.6, reviews:110, badge:null, image:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80', desc:'An enthusiastic ICT teacher who teaches coding and technology skills.' },
  { id:3, title:'IT : Web Development From Basics', tutor:'Isaac Rudansky', subject:'ICT', location:'Online', mode:'online', fee:4500, rating:4.9, reviews:121, badge:'Best Seller', image:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80', desc:'HTML, CSS, JavaScript and React from scratch.' },
  { id:4, title:'Music : Guitar For Beginners', tutor:'Manoj Kumara', subject:'Music', location:'Matale', mode:'offline', fee:1500, rating:4.7, reviews:638, badge:'Best Seller', image:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80', desc:'A passionate guitar teacher who inspires students.' },
  { id:5, title:'A/L Physics Full Syllabus', tutor:'Thilak Perera', subject:'Physics', location:'Moratuwa', mode:'offline', fee:2000, rating:4.8, reviews:94, badge:null, image:'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80', desc:'Government teacher, BSc Graduate with 10+ years of experience.' },
  { id:6, title:'A/L Chemistry', tutor:'Dilshan Rajapaksa', subject:'Chemistry', location:'Colombo', mode:'both', fee:3500, rating:4.5, reviews:77, badge:null, image:'https://images.unsplash.com/photo-1532094349884-543559c1a21c?w=400&q=80', desc:'A/L Chemistry full syllabus. MCQ and essay training.' },
  { id:7, title:'Personal Branding Online', tutor:'Dennis Yu', subject:'Business', location:'Online', mode:'online', fee:5000, rating:4.8, reviews:81, badge:null, image:'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', desc:'Build your personal brand and dominate social media.' },
  { id:8, title:'O/L English Literature', tutor:'Priya Wickramasinghe', subject:'English', location:'Kandy', mode:'both', fee:2000, rating:4.4, reviews:52, badge:null, image:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80', desc:'O/L English literature and language mastery.' },
];

const SUBJECTS  = ['All','Mathematics','Physics','Chemistry','ICT','Music','Business','English'];
const LOCATIONS = ['All Locations','Moratuwa','Colombo','Kandy','Piliyandala','Matale','Online'];
const SORT_OPTIONS = [
  { value:'rating',   label:'Top Rated' },
  { value:'fee_asc',  label:'Price: Low to High' },
  { value:'fee_desc', label:'Price: High to Low' },
  { value:'reviews',  label:'Most Reviewed' },
];
const ITEMS_PER_PAGE = 6;
const SUBJECT_COLORS: Record<string,string> = {
  Mathematics:'#8B5CF6', Physics:'#3B82F6', Chemistry:'#10B981',
  ICT:'#F59E0B', Music:'#EC4899', Business:'#F97316', English:'#06B6D4',
};
const MODE_COLOR: Record<string,string> = { online:'#10B981', offline:'#3B82F6', both:'#F59E0B' };

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
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
function CourseCard({ course, view }: { course: typeof ALL_COURSES[0]; view: 'grid'|'list' }) {
  const [hov, setHov] = useState(false);
  const sc = SUBJECT_COLORS[course.subject] || '#6B7280';

  if (view === 'list') {
    return (
      <Link href={`/classes/${course.id}`} style={{ textDecoration:'none' }}>
        <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
          style={{ display:'flex', background:'white', borderRadius:18, overflow:'hidden', transition:'all 0.3s', transform:hov?'translateX(6px)':'translateX(0)', boxShadow:hov?`0 12px 32px ${sc}18`:'0 2px 12px rgba(0,0,0,0.05)', border:hov?`1px solid ${sc}30`:'1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ width:5, background:sc, flexShrink:0 }}/>
          <div style={{ width:180, flexShrink:0, overflow:'hidden' }}>
            <img src={course.image} alt={course.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s', transform:hov?'scale(1.06)':'scale(1)' }}/>
          </div>
          <div style={{ flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#111827', lineHeight:1.35, maxWidth:'70%' }}>{course.title}</h3>
                {course.badge && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, background:'linear-gradient(135deg,#F59E0B,#EF4444)', color:'white', flexShrink:0 }}>{course.badge}</span>}
              </div>
              <p style={{ fontSize:13, color:'#10B981', fontWeight:600, marginBottom:4 }}>By {course.tutor}</p>
              <p style={{ fontSize:12, color:'#9CA3AF', marginBottom:8 }}>{course.desc}</p>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <Stars rating={course.rating}/>
                <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>{course.rating}</span>
                <span style={{ fontSize:11, color:'#9CA3AF' }}>({course.reviews})</span>
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
          <p style={{ fontSize:12, color:'#9CA3AF', marginBottom:7 }}>By <span style={{ fontWeight:600, color:'#10B981' }}>{course.tutor}</span></p>
          <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:10 }}>
            <Stars rating={course.rating}/>
            <span style={{ fontSize:12, fontWeight:700, color:'#F59E0B' }}>{course.rating}</span>
            <span style={{ fontSize:11, color:'#9CA3AF' }}>({course.reviews})</span>
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
  const [scrollY,   setScrollY]   = useState(0);
  const [query,     setQuery]     = useState('');
  const [subject,   setSubject]   = useState('All');
  const [mode,      setMode]      = useState('All');
  const [location,  setLocation]  = useState('All Locations');
  const [minRating, setMinRating] = useState(0);
  const [maxFee,    setMaxFee]    = useState(6000);
  const [sortBy,    setSortBy]    = useState('rating');
  const [view,      setView]      = useState<'grid'|'list'>('grid');
  const [page,      setPage]      = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => { setPage(1); }, [query, subject, mode, location, minRating, maxFee, sortBy]);

  const filtered = ALL_COURSES.filter(c => {
    const q = query.toLowerCase();
    return (
      (!q || c.title.toLowerCase().includes(q) || c.tutor.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q))
      && (subject === 'All' || c.subject === subject)
      && (mode === 'All' || c.mode === mode)
      && (location === 'All Locations' || c.location === location)
      && (minRating === 0 || c.rating >= minRating)
      && (c.fee <= maxFee)
    );
  });

  const sorted = [...filtered].sort((a,b) => {
    if (sortBy==='rating')   return b.rating - a.rating;
    if (sortBy==='fee_asc')  return a.fee - b.fee;
    if (sortBy==='fee_desc') return b.fee - a.fee;
    if (sortBy==='reviews')  return b.reviews - a.reviews;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated  = sorted.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);
  const clearAll   = () => { setQuery(''); setSubject('All'); setMode('All'); setLocation('All Locations'); setMinRating(0); setMaxFee(6000); };
  const activeCount = [subject!=='All', mode!=='All', location!=='All Locations', minRating>0, maxFee<6000].filter(Boolean).length;
  const scrollTop  = () => topRef.current?.scrollIntoView({ behavior:'smooth' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#F4F6F5;color:#1a1a1a;}
        a{text-decoration:none;color:inherit;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#10B981;border-radius:99px;}
        input:focus,select:focus{outline:none;} input[type=range]{accent-color:#10B981;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
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
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.55)', marginBottom:26, fontWeight:300 }}>{ALL_COURSES.length} classes from verified tutors across Sri Lanka</p>

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
                {filtered.length} <span style={{ fontWeight:400, fontSize:16, color:'#6B7280' }}>classes found</span>
                {query && <span style={{ fontSize:13, color:'#9CA3AF', marginLeft:10 }}>for "<span style={{ color:'#10B981', fontWeight:600 }}>{query}</span>"</span>}
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
            {paginated.length>0 ? (
              <>
                <div style={{ display:view==='grid'?'grid':'flex', gridTemplateColumns:view==='grid'?'repeat(auto-fill,minmax(275px,1fr))':undefined, flexDirection:view==='list'?'column':undefined, gap:22 }}>
                  {paginated.map((c,i)=>(
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
                  Showing {(page-1)*ITEMS_PER_PAGE+1}–{Math.min(page*ITEMS_PER_PAGE,filtered.length)} of {filtered.length} results
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