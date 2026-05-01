'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const POSTS = [
  { id: 1, author: 'Amali Perera', avatar: 'A', color: '#8B5CF6', role: 'Student', time: '1 hour ago', content: 'Does anyone have a good set of notes for the A/L Physics unit on Waves? I\'m struggling a bit with the Doppler Effect. 🌊 #ALPhysics #Help Needed', likes: 12, comments: 4, liked: false },
  { id: 2, author: 'Saman Gunawardena', avatar: 'S', color: '#10B981', role: 'Student', time: '3 hours ago', content: 'Just finished a great session with Mr. Kasun Fernando. His explanation of Integration was so clear! Highly recommend checking out his classes if you\'re struggling with Pure Maths. 📐 #Maths #Mentora', likes: 45, comments: 8, liked: false },
  { id: 3, author: 'Nuwan Jayasena', avatar: 'N', color: '#F59E0B', role: 'Student', time: '5 hours ago', content: 'Study group meeting this Saturday at 10 AM for Chemistry revision. We\'ll be covering Organic Chemistry. Anyone interested? 🧪 #StudyGroup #Chemistry', likes: 28, comments: 12, liked: false },
  { id: 4, author: 'Lakmini Fernando', avatar: 'L', color: '#EC4899', role: 'Student', time: '1 day ago', content: 'So happy to have found Mentora.lk! It\'s so much easier to track my classes and connect with tutors now. 🎓✨', likes: 56, comments: 15, liked: false },
];

const STUDENTS_NEARBY = [
  { name: 'Dilini Silva', school: 'Visakha Vidyalaya', rating: 4.9, avatar: 'D', color: '#3B82F6' },
  { name: 'Kamal Perera', school: 'Ananda College', rating: 4.7, avatar: 'K', color: '#8B5CF6' },
  { name: 'Minali Rajapaksa', school: 'Musaeus College', rating: 4.8, avatar: 'M', color: '#EC4899' },
];

export default function StudentCommunityPage() {
  const [posts, setPosts] = useState(POSTS);
  const [newPost, setNewPost] = useState('');

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const submitPost = () => {
    if (!newPost.trim()) return;
    setPosts(prev => [{
      id: Date.now(), author: 'D.M.S.N. Dissanayake', avatar: 'D', color: '#10B981',
      role: 'Student', time: 'Just now', content: newPost.trim(),
      likes: 0, comments: 0, liked: false,
    }, ...prev]);
    setNewPost('');
  };

  return (
    <DashboardLayout title="Community" subtitle="Connect and share with fellow students on Mentora.lk.">
      <style>{`
        .post-card{transition:all 0.22s;} .post-card:hover{box-shadow:0 8px 32px rgba(0,0,0,0.1)!important;}
        .like-btn{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:7px 14px;border-radius:9px;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
        .like-btn:hover{background:#F3F4F6;}
      `}</style>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Main feed */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Create post */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>D</div>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share something with the student community..."
                style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '11px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#374151', resize: 'none', height: 80, outline: 'none', lineHeight: 1.5 }}
                onFocus={e => { e.target.style.borderColor = '#10B981'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={submitPost} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Post</button>
            </div>
          </div>

          {/* Posts */}
          {posts.map(post => (
            <div key={post.id} className="post-card" style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${post.color}20`, color: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>{post.avatar}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{post.author}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{post.role} · {post.time}</p>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>{post.content}</p>
              <div style={{ display: 'flex', gap: 4, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
                <button className="like-btn" onClick={() => toggleLike(post.id)} style={{ color: post.liked ? '#EF4444' : '#6B7280' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={post.liked ? '#EF4444' : 'none'} stroke={post.liked ? '#EF4444' : '#6B7280'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  {post.likes}
                </button>
                <button className="like-btn" style={{ color: '#6B7280' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  {post.comments}
                </button>
                <button className="like-btn" style={{ color: '#6B7280', marginLeft: 'auto' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Students Nearby</h3>
            {STUDENTS_NEARBY.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < STUDENTS_NEARBY.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${s.color}20`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.avatar}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>{s.school}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', borderRadius: 20, padding: 22 }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>Community Stats</p>
            {[{ l: 'Active Students', v: '4,850' }, { l: 'Posts Today', v: '156' }, { l: 'Resources Shared', v: '1.2K' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{s.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
