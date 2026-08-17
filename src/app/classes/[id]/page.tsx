'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import { getCourseById, getCourseReviews, submitReview, Review } from '@/services/classService';
import { getMyEnrollments } from '@/services/enrollmentService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePalette } from '@/hooks/usePalette';

const BADGE_COLORS: Record<string,string> = { 'Best Seller':'#10B981', 'Top Rated':'#8B5CF6', 'New':'#3B82F6' };
const MODE_COLOR: Record<string,string> = { online:'#10B981', offline:'#3B82F6', both:'#F59E0B' };

// All course data now comes from the backend API

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ClassDetailPage() {
  const palette = usePalette();
  const params = useParams();
  const id     = Number(params?.id);

  const [course, setCourse] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState<'about'|'schedule'|'reviews'>('about');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const currentUser = useCurrentUser();
  const [myEnrollment, setMyEnrollment] = useState<any>(null);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const myReview = reviews.find((r: Review) =>
    String(r.student?.id ?? r.student_id) === String(currentUser?.id)
  );

  const thumbnail = course?.image || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80';

  // Map flat tutor fields from backend into a tutor object
  const tutor = course?.tutor_name ? {
    name:           course.tutor_name,
    avatar:         course.tutor_avatar || 'https://via.placeholder.com/72',
    bio:            course.tutor_bio || '',
    qualification:  course.tutor_qualifications
                    ? `${course.tutor_qualifications}, ${course.tutor_university || ''}`
                    : course.tutor_university || 'Professional Tutor',
    total_students: course.tutor_total_students || 0,
    total_classes:  0,
    is_verified:    course.tutor_is_verified,
    experience:     course.tutor_experience,
    medium:         course.tutor_medium,
    city:           course.tutor_city,
  } : null;

  // Fetch course data and reviews
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [courseData, reviewsData] = await Promise.all([
          getCourseById(id),
          getCourseReviews(id),
        ]);
        console.log('Course from DB:', courseData);
        setCourse(courseData);
        setReviews(reviewsData);
      } catch (err: any) {
        console.error('API failed:', err.response?.data || err.message);
        setError('Failed to load class details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Only students with a matching active/approved enrollment may review this
  // class. This page is public, so never call the authed endpoint without a
  // token — api.ts hard-redirects to /auth/login on any 401.
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token || !id) { setEnrollmentChecked(true); return; }
    (async () => {
      try {
        const all = await getMyEnrollments();
        const found = (all || []).find((e: any) =>
          Number(e.class_id) === Number(id) && (e.status === 'active' || e.status === 'approved')
        );
        setMyEnrollment(found || null);
      } catch {
        setMyEnrollment(null);
      } finally {
        setEnrollmentChecked(true);
      }
    })();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const created = await submitReview(id, 5, reviewComment.trim());
      setReviews(prev => [
        { ...created, student: created.student ?? { name: currentUser?.fullName || 'You' } },
        ...prev,
      ]);
      setShowReviewModal(false);
      setReviewComment('');
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading state
  if (loading) return (
    <>
      <Navbar scrollY={scrollY} />
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:palette.bg }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, border:'3px solid #E5E7EB', borderTop:'3px solid #10B981', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
          <p style={{ color:palette.textMuted, fontSize:15 }}>Loading class details...</p>
        </div>
      </div>
    </>
  );

  // Error state
  if (error) return (
    <>
      <Navbar scrollY={scrollY} />
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:palette.bg }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>⚠️</div>
          <p style={{ fontSize:16, fontWeight:600, color:'#EF4444', marginBottom:20 }}>{error}</p>
          <Link href="/classes/search">
            <button style={{ background:'#10B981', color:'white', border:'none', borderRadius:12, padding:'11px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              Back to Search
            </button>
          </Link>
        </div>
      </div>
    </>
  );

  // No course found
  if (!course) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:${palette.bg};color:${palette.textPrimary};}
        a{text-decoration:none;color:inherit;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#10B981;border-radius:99px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);}}
        @keyframes shimmer{0%{background-position:-600px 0;}100%{background-position:600px 0;}}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        .fade-up{animation:fadeUp 0.6s cubic-bezier(.22,1,.36,1) both;}
        .tab-btn{padding:10px 22px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;transition:all 0.22s;}
        .shimmer{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;}
        .modal-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:fadeIn 0.2s ease;}
        .modal-box{background:${palette.surface};border-radius:24px;padding:40px;max-width:420px;width:90%;animation:scaleIn 0.3s cubic-bezier(.22,1,.36,1);text-align:center;}
        @media(max-width:1024px){.right-col{display:none!important;} .mobile-enroll{display:flex!important;}}
      `}</style>

      <div style={{ minHeight:'100vh', background:palette.bg }}>
        <Navbar scrollY={scrollY} />

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#064E3B 0%,#065F46 50%,#047857 100%)', padding:'90px 6% 40px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, opacity:0.06, pointerEvents:'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMid slice">
              <circle cx="150" cy="100" r="160" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="1300" cy="80" r="120" fill="none" stroke="white" strokeWidth="1"/>
            </svg>
          </div>
          <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:16 }}>
              <Link href="/"><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Home</span></Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <Link href="/classes/search"><span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>Browse Courses</span></Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <span style={{ fontSize:12, color:'#34D399', fontWeight:600 }}>{course.subject}</span>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16 }}>
              <div>
                {course.badge && <span style={{ display:'inline-block', background:BADGE_COLORS[course.badge]||'#10B981', borderRadius:99, padding:'4px 14px', fontSize:11, fontWeight:700, color:'white', marginBottom:10 }}>{course.badge}</span>}
                <h1 className="fade-up" style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,3.5vw,46px)', fontWeight:900, color:'white', lineHeight:1.1, marginBottom:10, maxWidth:680 }}>{course.title}</h1>
                <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {course.location}
                  </span>
                  <span style={{ fontSize:12, fontWeight:700, color:MODE_COLOR[course.mode], background:`${MODE_COLOR[course.mode]}25`, border:`1px solid ${MODE_COLOR[course.mode]}50`, borderRadius:6, padding:'3px 10px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{course.mode}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, lineHeight:0 }}>
            <svg viewBox="0 0 1440 36" preserveAspectRatio="none" style={{ display:'block', width:'100%', height:36 }}>
              <path d="M0,16 C360,40 1080,0 1440,20 L1440,36 L0,36 Z" fill={palette.bg}/>
            </svg>
          </div>
        </div>

        {/* Main */}
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 6% 80px', display:'flex', gap:28, alignItems:'flex-start' }}>

          {/* Left */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* Image */}
            <div className="fade-up" style={{ borderRadius:22, overflow:'hidden', marginBottom:28, boxShadow:'0 12px 40px rgba(0,0,0,0.12)', position:'relative', maxWidth:520 }}>
              {!imgLoaded && <div className="shimmer" style={{ position:'absolute', inset:0, borderRadius:22, zIndex:1 }}/>}
              <img src={thumbnail} alt={course.title} style={{ width:'100%', height:300, objectFit:'cover', display:'block', transition:'opacity 0.4s', opacity:imgLoaded?1:0 }} onLoad={()=>setImgLoaded(true)}/>
              <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 100%)', padding:'24px 20px 16px', borderRadius:'0 0 22px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'white', fontSize:13 }}>
                    🕐 {course.schedule ? Object.keys(course.schedule).join(', ') : 'TBA'}
                  </span>
                  <span style={{ color:'white', fontSize:16, fontWeight:800 }}>LKR {course.fee.toLocaleString()}<span style={{ fontSize:11, fontWeight:400, opacity:0.7 }}>/mo</span></span>
                </div>
              </div>
            </div>

            {/* Tutor card */}
            {tutor && (
            <div style={{ background:palette.surface, borderRadius:20, padding:'24px', marginBottom:24, boxShadow:palette.shadow, border:`1px solid ${palette.border}` }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:16 }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <img src={tutor.avatar} alt={tutor.name} style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', border:'3px solid #d1fae5' }}/>
                  {tutor.is_verified && <div style={{ position:'absolute', bottom:-2, right:-2, width:22, height:22, borderRadius:'50%', background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid white' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>}
                </div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:palette.textPrimary }}>{tutor.name}</h3>
                    {tutor.is_verified && <span style={{ fontSize:11, fontWeight:700, background:'#ECFDF5', color:'#059669', borderRadius:6, padding:'2px 8px', border:'1px solid #A7F3D0' }}>✓ Verified</span>}
                  </div>
                  <p style={{ fontSize:12, color:palette.textMuted, marginBottom:8 }}>{tutor.qualification}</p>
                </div>
              </div>
              <p style={{ fontSize:14, color:'#4B5563', lineHeight:1.7, marginBottom:16 }}>{tutor.bio}</p>
              <div style={{ display:'flex', gap:0, borderRadius:12, overflow:'hidden', border:`1px solid ${palette.border}` }}>
                {[{l:'Students',v:`${tutor.total_students}+`},{l:'Classes',v:`${tutor.total_classes}`}].map((s,i)=>(
                  <div key={i} style={{ flex:1, padding:'14px', textAlign:'center', borderRight:i<1?'1px solid #F3F4F6':'none', background:'#FAFAFA' }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:'#10B981' }}>{s.v}</div>
                    <div style={{ fontSize:11, color:palette.textMuted, marginTop:3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:22, background:palette.surface, borderRadius:14, padding:5, boxShadow:'0 2px 12px rgba(0,0,0,0.05)', width:'fit-content', border:`1px solid ${palette.border}` }}>
              {([['about','About Me'],['schedule','Free Time Slots'],['reviews','Reviews']] as const).map(([key,label])=>(
                <button key={key} className="tab-btn" onClick={()=>setActiveTab(key)} style={{ background:activeTab===key?'#10B981':'transparent', color:activeTab===key?'white':'#6B7280', boxShadow:activeTab===key?'0 4px 12px rgba(16,185,129,0.35)':'none' }}>{label}</button>
              ))}
            </div>

            {/* Tab: About */}
            {activeTab==='about' && (
              <div style={{ background:palette.surface, borderRadius:20, padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', border:`1px solid ${palette.border}` }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:palette.textPrimary, marginBottom:12 }}>About This Class</h3>
                <p style={{ fontSize:14, color:'#4B5563', lineHeight:1.75, marginBottom:20 }}>{course.description}</p>
                <h4 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:palette.textPrimary, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  What You'll Learn
                </h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {(course.what_you_learn || []).map((item: string) => (
                    <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', background:'#F0FDF4', borderRadius:12, border:'1px solid #D1FAE5' }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize:13, color:'#065F46', lineHeight:1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Schedule */}
            {activeTab==='schedule' && (
              <div style={{ background:palette.surface, borderRadius:20, padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', border:`1px solid ${palette.border}` }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:palette.textPrimary, marginBottom:20 }}>Available Time Slots</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {course.schedule && Object.entries(course.schedule).map(([day, times]: [string, any]) => (
                    <div key={day} style={{ background:palette.surfaceAlt, borderRadius:14, padding:'16px 20px', border:`1px solid ${palette.border}` }}>
                      <p style={{ fontWeight:700, fontSize:14, color:palette.textPrimary, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {day}
                      </p>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {times.map((t: string) => (
                          <span key={t} style={{ padding:'6px 14px', background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:8, fontSize:13, fontWeight:600, color:'#059669' }}>🕐 {t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab==='reviews' && (
              <div style={{ background:palette.surface, borderRadius:20, padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', border:`1px solid ${palette.border}` }}>
                <p style={{ fontSize:13, color:palette.textMuted, marginBottom:12 }}>{course.review_count || 0} reviews</p>

                {enrollmentChecked && (
                  <div style={{ marginBottom:20 }}>
                    {myReview ? (
                      <p style={{ fontSize:13, color:'#059669', fontWeight:600 }}>✓ You've already reviewed this class</p>
                    ) : myEnrollment ? (
                      <button onClick={()=>setShowReviewModal(true)}
                        style={{ background:'none', border:`1.5px solid ${palette.border}`, borderRadius:12, padding:'11px 22px', fontSize:13, fontWeight:600, color:palette.textSecondary, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#10B981'; e.currentTarget.style.color='#10B981';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=palette.border; e.currentTarget.style.color=palette.textSecondary;}}>
                        Write a Review
                      </button>
                    ) : currentUser ? (
                      <p style={{ fontSize:13, color:palette.textMuted }}>Only enrolled students can review this class.</p>
                    ) : (
                      <p style={{ fontSize:13, color:palette.textMuted }}>Sign in and enroll to write a review.</p>
                    )}
                  </div>
                )}

                {reviews.length === 0 ? (
                  <p style={{ fontSize:14, color:palette.textMuted, textAlign:'center', padding:'20px 0' }}>
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {reviews.map((r: any, i: number) => (
                      <div key={i} style={{ padding:'18px 20px', background:palette.surfaceAlt, borderRadius:14, border:`1px solid ${palette.border}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700 }}>
                            {r.student?.name?.[0] || 'S'}
                          </div>
                          <div>
                            <p style={{ fontSize:13, fontWeight:700, color:palette.textPrimary }}>{r.student?.name || 'Student'}</p>
                            <p style={{ fontSize:11, color:palette.textMuted }}>
                              {new Date(r.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })}
                            </p>
                          </div>
                        </div>
                        <p style={{ fontSize:13, color:'#4B5563', lineHeight:1.6 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fee row */}
            <div style={{ background:palette.surface, borderRadius:20, padding:'22px 28px', marginTop:24, boxShadow:'0 4px 20px rgba(0,0,0,0.05)', border:`1px solid ${palette.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:palette.textPrimary }}>
                Rs: {course.fee.toLocaleString()}<span style={{ fontSize:14, fontWeight:400, color:palette.textMuted }}>/2Hrs</span>
              </span>
              <Link href={`/classes/${course.id}/enroll`}>
                <button style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:13, padding:'13px 32px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 6px 22px rgba(16,185,129,0.38)', transition:'all 0.25s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                  Enroll Now →
                </button>
              </Link>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="right-col" style={{ width:300, flexShrink:0 }}>
            <div style={{ position:'sticky', top:84 }}>
              <div style={{ background:palette.surface, borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.1)', border:'1px solid rgba(0,0,0,0.05)', marginBottom:16 }}>
                <div style={{ position:'relative', height:180, overflow:'hidden' }}>
                  <img src={thumbnail} alt={course.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 50%)' }}/>
                  <div style={{ position:'absolute', bottom:12, left:16, right:16 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:'white' }}>LKR {course.fee.toLocaleString()}<span style={{ fontSize:13, fontWeight:400, opacity:0.7 }}>/mo</span></div>
                  </div>
                </div>
                <div style={{ padding:'18px 20px' }}>
                  {[
                    {icon:'📚', label:'Subject', val:course.subject},
                    {icon:'📍', label:'Location', val:course.location},
                    {icon:'💻', label:'Mode', val:course.mode.charAt(0).toUpperCase()+course.mode.slice(1)},
                    {icon:'👥', label:'Students', val:`${course.enrolledCount || 0}/${course.max_students || 0}`},
                  ].map((row,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:i<3?'1px solid #F3F4F6':'none' }}>
                      <span style={{ fontSize:16 }}>{row.icon}</span>
                      <span style={{ fontSize:13, color:palette.textMuted, width:70 }}>{row.label}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:palette.textPrimary }}>{row.val}</span>
                    </div>
                  ))}

                  <Link href={`/classes/${course.id}/enroll`}>
                    <button style={{ width:'100%', marginTop:16, background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:12, padding:'14px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 6px 20px rgba(16,185,129,0.38)', transition:'all 0.25s' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                      Enroll Now →
                    </button>
                  </Link>
                  <button onClick={()=>setShowModal(true)} style={{ width:'100%', marginTop:10, background:'none', border:`1.5px solid ${palette.border}`, borderRadius:12, padding:'12px', fontSize:14, fontWeight:600, color:palette.textSecondary, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#10B981'; e.currentTarget.style.color='#10B981';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.color='#6B7280';}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Message Tutor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile enroll bar */}
        <div className="mobile-enroll" style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, zIndex:900, background:palette.surface, borderTop:'1px solid #E5E7EB', padding:'14px 6%', alignItems:'center', justifyContent:'space-between', boxShadow:'0 -4px 20px rgba(0,0,0,0.08)' }}>
          <div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900 }}>LKR {course.fee.toLocaleString()}</span>
            <span style={{ fontSize:12, color:palette.textMuted, marginLeft:4 }}>/mo</span>
          </div>
          <Link href={`/classes/${course.id}/enroll`}>
            <button style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:12, padding:'13px 32px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Enroll Now →</button>
          </Link>
        </div>

        <div style={{ background:'#0F172A', padding:'20px 6%', textAlign:'center' }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2026 Mentora<span style={{ color:'#10B981' }}>.lk</span> · Team Loop 5</span>
        </div>
      </div>

      {/* Message modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#d1fae5,#6ee7b7)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>Message Tutor</h3>
            <p style={{ fontSize:14, color:palette.textSecondary, marginBottom:20 }}>Please sign in to message {tutor?.name || "Tutor"}</p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <Link href="/auth/login"><button style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Sign In</button></Link>
              <button onClick={()=>setShowModal(false)} style={{ background:palette.surface, color:palette.textSecondary, border:`1.5px solid ${palette.border}`, borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Review submission modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={()=>{ if(!reviewSubmitting){ setShowReviewModal(false); setReviewError(''); } }}>
          <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ textAlign:'left' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, marginBottom:16, textAlign:'center' }}>Write a Review</h3>
            <textarea
              value={reviewComment}
              onChange={e=>setReviewComment(e.target.value)}
              placeholder="Share your experience with this class..."
              rows={5}
              style={{ width:'100%', resize:'vertical', border:`1.5px solid ${palette.border}`, background:palette.inputBg, color:palette.textPrimary, borderRadius:12, padding:'12px 14px', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
            />
            {reviewError && <p style={{ fontSize:13, color:'#EF4444', marginTop:10 }}>{reviewError}</p>}
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:20 }}>
              <button onClick={handleSubmitReview} disabled={!reviewComment.trim() || reviewSubmitting}
                style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, cursor: (!reviewComment.trim()||reviewSubmitting) ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", opacity: (!reviewComment.trim()||reviewSubmitting) ? 0.6 : 1 }}>
                {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
              </button>
              <button onClick={()=>{ setShowReviewModal(false); setReviewError(''); }} disabled={reviewSubmitting}
                style={{ background:palette.surface, color:palette.textSecondary, border:`1.5px solid ${palette.border}`, borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}