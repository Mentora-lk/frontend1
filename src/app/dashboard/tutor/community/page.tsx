'use client';

import { useState } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';

const POSTS = [
  { id:1, author:'Dilshan Perera', avatar:'D', color:'#8B5CF6', role:'Tutor · Physics', time:'2 hours ago', content:'Just finished a productive A/L Physics session! My students are making great progress. Remember: practice makes perfect. 💪 #ALPhysics #TutorLife', likes:24, comments:5, liked:false },
  { id:2, author:'Amali Wickrama', avatar:'A', color:'#10B981', role:'Tutor · Biology', time:'5 hours ago', content:'Sharing my free revision notes for A/L Biology — Cell Division chapter. Hope this helps all my students! Feel free to share. 📚 Download link in comments.', likes:67, comments:18, liked:false },
  { id:3, author:'Ruwan Jayasena', avatar:'R', color:'#F59E0B', role:'Tutor · Mathematics', time:'1 day ago', content:'Quick tip for Integration by Parts: Always use the LIATE rule (Logarithmic, Inverse trig, Algebraic, Trig, Exponential) to pick your u. Works every time! 🧮', likes:112, comments:34, liked:false },
  { id:4, author:'Shalini Fernando', avatar:'S', color:'#EC4899', role:'Tutor · English', time:'2 days ago', content:'Hosting a FREE webinar on Essay Writing techniques this Saturday at 3 PM. All A/L students are welcome! Drop your email in the comments to register. ✍️', likes:89, comments:41, liked:false },
];

const TUTORS_NEARBY = [
  { name:'Nimesh Gunawardena', subject:'Chemistry', rating:4.9, avatar:'N', color:'#3B82F6' },
  { name:'Thilak Samarasinghe', subject:'Physics', rating:4.7, avatar:'T', color:'#8B5CF6' },
  { name:'Madhavi Rajapaksa', subject:'Biology', rating:4.8, avatar:'M', color:'#EC4899' },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState(POSTS);
  const [newPost, setNewPost] = useState('');

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    setPosts(prev => [{
      id: Date.now(), author:'Kasun Fernando', avatar:'K', color:'#10B981',
      role:'Tutor · Mathematics', time:'Just now', content:newPost.trim(),
      likes:0, comments:0, liked:false,
    }, ...prev]);
    setNewPost('');
  };

  return (
    <TutorDashboardLayout title="Community" subtitle="Connect and share with fellow tutors on Mentora.lk.">
      <style>{`
        .post-card{transition:all 0.22s;} .post-card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.1)!important;}
        .like-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:7px 14px;border-radius:9px;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
        .like-btn:hover{background:#F3F4F6;}
      `}</style>

      <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* Main feed */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Create post */}
          <div style={{ background:'white', borderRadius:20, padding:22, boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', marginBottom:20 }}>
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:16, flexShrink:0 }}>K</div>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share something with the tutor community..."
                style={{ flex:1, border:'1.5px solid #E5E7EB', borderRadius:12, padding:'11px 14px', fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'#374151', resize:'none', height:80, outline:'none', lineHeight:1.5 }}
                onFocus={e => { e.target.style.borderColor='#10B981'; }}
                onBlur={e  => { e.target.style.borderColor='#E5E7EB'; }}
              />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={submitPost} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:10, padding:'9px 22px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Post</button>
            </div>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div key={post.id} className="post-card" style={{ background:'white', borderRadius:20, padding:22, boxShadow:'0 4px 16px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:`${post.color}20`, color:post.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:17, flexShrink:0 }}>{post.avatar}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'#111827' }}>{post.author}</p>
                  <p style={{ fontSize:12, color:'#9CA3AF' }}>{post.role} · {post.time}</p>
                </div>
              </div>
              <p style={{ fontSize:14, color:'#374151', lineHeight:1.7, marginBottom:16 }}>{post.content}</p>
              <div style={{ display:'flex', gap:4, paddingTop:12, borderTop:'1px solid #F3F4F6' }}>
                <button className="like-btn" onClick={() => toggleLike(post.id)} style={{ color: post.liked ? '#EF4444' : '#6B7280' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={post.liked ? '#EF4444' : 'none'} stroke={post.liked ? '#EF4444' : '#6B7280'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {post.likes}
                </button>
                <button className="like-btn" style={{ color:'#6B7280' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {post.comments}
                </button>
                <button className="like-btn" style={{ color:'#6B7280', marginLeft:'auto' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div style={{ width:240, flexShrink:0 }}>
          <div style={{ background:'white', borderRadius:20, padding:22, boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', marginBottom:16 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#111827', marginBottom:16 }}>Tutors Nearby</h3>
            {TUTORS_NEARBY.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i < TUTORS_NEARBY.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`${t.color}20`, color:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 }}>{t.avatar}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{t.name}</p>
                  <p style={{ fontSize:11, color:'#9CA3AF' }}>{t.subject} · ⭐ {t.rating}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:'linear-gradient(135deg,#064E3B,#065F46)', borderRadius:20, padding:22 }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'white', marginBottom:8 }}>Community Stats</p>
            {[{l:'Active Tutors',v:'1,240'},{l:'Posts Today',v:'38'},{l:'Tips Shared',v:'9.4K'}].map((s,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{s.l}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'white' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TutorDashboardLayout>
  );
}
