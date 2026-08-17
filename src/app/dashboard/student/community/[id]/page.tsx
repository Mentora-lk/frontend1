'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getCommunityFeed } from '@/services/studentCommunityService';
import { toDownloadUrl } from '@/utils/cloudinaryDownload';

// ── Community Detail Data ─────────────────────────────────────────────────────
const COMMUNITY_DATA: Record<string, {
  name: string; description: string; category: string; color: string; icon: string; members: number;
}> = {
  'al-maths-2025': { name: 'A/L Maths 2025', description: 'Study group for A/L Combined Mathematics students.', category: 'Mathematics', color: '#8B5CF6', icon: '📐', members: 342 },
  'al-physics-hub': { name: 'A/L Physics Hub', description: 'Everything Physics! MCQs, structured questions, and past papers.', category: 'Physics', color: '#3B82F6', icon: '⚡', members: 518 },
  'chemistry-crew': { name: 'Chemistry Crew', description: 'Organic, Inorganic & Physical Chemistry notes and tips.', category: 'Chemistry', color: '#10B981', icon: '🧪', members: 287 },
  'ict-innovators': { name: 'ICT Innovators', description: 'A/L ICT community — programming help and project collaboration.', category: 'ICT', color: '#F59E0B', icon: '💻', members: 193 },
  'biology-life': { name: 'Biology Life', description: 'Cell biology, genetics, ecology and more.', category: 'Biology', color: '#84CC16', icon: '🧬', members: 412 },
  'design-thinkers': { name: 'Design & Creativity', description: 'Learn UI/UX, graphic design, and share your creative portfolio.', category: 'Design', color: '#EC4899', icon: '🎨', members: 156 },
};

const DISCUSSIONS = [
  { id: 1, author: 'Tutor Kasun', avatar: 'K', color: '#10B981', time: '30 min ago', content: 'Here is the recording for yesterday\'s live session on Integration.', likes: 8, replies: 4, pinned: true, isTutor: true, type: 'video', mediaName: 'Integration Seminar Recording', duration: '1h 45m' },
  { id: 2, author: 'Sanduni Silva', avatar: 'S', color: '#EC4899', time: '2 hours ago', content: 'Just uploaded my handwritten notes on Differential Equations — check the Files tab! Hope it helps everyone. 📝', likes: 23, replies: 7, pinned: false, isTutor: false, type: 'text' },
  { id: 3, author: 'Kavindu Jayawardena', avatar: 'K', color: '#8B5CF6', time: '5 hours ago', content: 'Study session this Saturday at 2PM. We can go through the 2024 past paper together. Who is in? 🙋‍♂️', likes: 15, replies: 12, pinned: false, isTutor: false, type: 'text' },
  { id: 4, author: 'Tutor Kasun', avatar: 'K', color: '#10B981', time: '1 day ago', content: 'Please review these syllabus guidelines before our next class.', likes: 45, replies: 5, pinned: false, isTutor: true, type: 'pdf', mediaName: '2025 Syllabus Updates.pdf', size: '2.1 MB' },
];

const FILES = [
  { id: 1, name: 'Differential Equations Notes.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Sanduni Silva', date: '2 hours ago', downloads: 45 },
  { id: 2, name: 'Past Paper 2024 Solutions.pdf', type: 'pdf', size: '5.1 MB', uploadedBy: 'Kavindu Jayawardena', date: '3 days ago', downloads: 128 },
  { id: 3, name: 'Integration Formulas Cheat Sheet.png', type: 'image', size: '890 KB', uploadedBy: 'Nimal Perera', date: '1 week ago', downloads: 234 },
  { id: 4, name: 'Statistics Chapter Summary.docx', type: 'doc', size: '1.2 MB', uploadedBy: 'Madhavi Fernando', date: '2 weeks ago', downloads: 67 },
  { id: 5, name: 'Trigonometry Practice Problems.pdf', type: 'pdf', size: '3.8 MB', uploadedBy: 'Amali Perera', date: '3 weeks ago', downloads: 189 },
];

const MEMBERS = [
  { name: 'Tutor Kasun', role: 'Admin', avatar: 'K', color: '#10B981', school: 'Mentora.lk', joined: '3 months ago' },
  { name: 'Sanduni Silva', role: 'Moderator', avatar: 'S', color: '#EC4899', school: 'Visakha Vidyalaya', joined: '2 months ago' },
  { name: 'Kavindu Jayawardena', role: 'Member', avatar: 'K', color: '#8B5CF6', school: 'Ananda College', joined: '1 month ago' },
  { name: 'Madhavi Fernando', role: 'Member', avatar: 'M', color: '#F59E0B', school: 'Musaeus College', joined: '2 weeks ago' },
  { name: 'Amali Perera', role: 'Member', avatar: 'A', color: '#3B82F6', school: 'Devi Balika', joined: '1 week ago' },
  { name: 'D.M.S.N. Dissanayake', role: 'Member', avatar: 'D', color: '#10B981', school: 'Nalanda College', joined: '5 days ago' },
];

// ── File type icon helper ─────────────────────────────────────────────────────
function FileIcon({ type }: { type: string }) {
  const colors: Record<string, string> = { pdf: '#EF4444', doc: '#3B82F6', image: '#F59E0B' };
  const labels: Record<string, string> = { pdf: 'PDF', doc: 'DOC', image: 'IMG' };
  const c = colors[type] || '#6B7280';
  return (
    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: c, letterSpacing: '0.05em' }}>{labels[type] || 'FILE'}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.id as string;
  const community = COMMUNITY_DATA[communityId] || COMMUNITY_DATA['al-maths-2025'];

  const [activeTab, setActiveTab] = useState<'discussions' | 'files' | 'members'>('discussions');
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await getCommunityFeed(communityId);
        const fetchedPosts = (Array.isArray(res) ? res : []).map((p: any) => {
          let mediaUrl = p.media_url;
          if (mediaUrl === 'undefined' || mediaUrl === 'null') mediaUrl = null;
          return {
            id: p.id,
            author: p.author_name,
            avatar: p.author_avatar || (p.author_name ? p.author_name[0] : 'U'),
            color: '#10B981',
            time: new Date(p.created_at).toLocaleString(),
            content: p.content,
            likes: p.reaction_count || 0,
            replies: 0,
            pinned: p.is_pinned,
            isTutor: p.role === 'Tutor',
            type: p.type || 'text',
            media_url: mediaUrl,
            mediaName: mediaUrl ? mediaUrl.split('/').pop() : '',
            size: 'Unknown'
          };
        });
        setDiscussions(fetchedPosts);
        
        setFiles(fetchedPosts.filter((p: any) => !!p.media_url).map((p: any) => ({
          id: p.id,
          name: p.mediaName || 'File',
          type: p.type,
          size: p.size,
          uploadedBy: p.author,
          date: p.time,
          downloads: 0
        })));
      } catch (err) {
        console.error("Failed to fetch feed", err);
      }
    };
    fetchFeed();
  }, [communityId]);

  const submitPost = () => {
    if (!newMessage.trim()) return;
    setDiscussions(prev => [{
      id: Date.now(), author: 'D.M.S.N. Dissanayake', avatar: 'D', color: '#10B981',
      time: 'Just now', content: newMessage.trim(), likes: 0, replies: 0, pinned: false, isTutor: false, type: 'text'
    }, ...prev]);
    setNewMessage('');
  };

  const toggleLike = (id: number) => {
    setDiscussions(prev => prev.map(d => d.id === id ? { ...d, likes: d.likes + 1 } : d));
  };

  const tabs = [
    { key: 'discussions' as const, label: 'Feed & Discussions', count: discussions.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { key: 'files' as const, label: 'Materials', count: files.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { key: 'members' as const, label: 'Members', count: MEMBERS.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  ];

  return (
    <DashboardLayout title={community.name} subtitle={community.description}>
      <style>{`
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { background: #F3F4F6 !important; }
        .disc-card { transition: all 0.2s; }
        .disc-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.08) !important; }
        .file-row { transition: all 0.2s; }
        .file-row:hover { background: #F9FAFB !important; }
        .member-card { transition: all 0.2s; }
        .member-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .action-icon { transition: all 0.2s; cursor: pointer; }
        .action-icon:hover { color: #10B981 !important; }
      `}</style>

      {/* Back link + community banner */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/student/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Communities
        </Link>

        {/* Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${community.color}, ${community.color}99)`,
          borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 40 }}>{community.icon}</span>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: "'DM Sans',sans-serif" }}>{community.name}</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{community.members} members · {community.category}</p>
            </div>
          </div>
          <button style={{
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
          }}>
            ✓ Joined
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 300 }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', borderRadius: 14, padding: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className="tab-btn"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  fontFamily: "'DM Sans',sans-serif",
                  background: activeTab === tab.key ? '#10B981' : 'transparent',
                  color: activeTab === tab.key ? 'white' : '#6B7280',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.icon} {tab.label}
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                  color: activeTab === tab.key ? 'white' : '#9CA3AF',
                  borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700,
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── DISCUSSIONS TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'discussions' && (
            <div>
              {/* New post */}
              <div style={{ background: 'white', borderRadius: 18, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>D</div>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Ask a question or share something with the community..."
                    style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: '#374151', resize: 'none', height: 70, outline: 'none', lineHeight: 1.5 }}
                    onFocus={e => { e.target.style.borderColor = '#10B981'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={submitPost} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Post</button>
                </div>
              </div>

              {/* Posts Feed */}
              {discussions.map(post => (
                <div key={post.id} className="disc-card" style={{ background: 'white', borderRadius: 18, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 12 }}>
                  
                  {post.pinned && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 12 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      PINNED ANNOUNCEMENT
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${post.color}20`, color: post.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{post.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {post.author}
                        {post.isTutor && <span style={{ background: '#ECFDF5', color: '#059669', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>TUTOR</span>}
                      </p>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>{post.time}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>{post.content}</p>

                  {/* Media Content (Video/PDF/Image) */}
                  {post.type === 'image' && post.media_url && (
                    <div style={{ marginBottom: 16, padding: 12, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={post.media_url} alt={post.mediaName} style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 12 }} />
                        <p style={{ color: '#111827', fontWeight: 600, fontSize: 13 }}>{post.mediaName}</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                          <a href={toDownloadUrl(post.media_url, post.mediaName)} rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#3B82F6', fontSize: 13, fontWeight: 600 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download Image
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {['document', 'pdf', 'doc'].includes(post.type) && post.media_url && (
                    <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#111827', fontWeight: 600, fontSize: 13 }}>{post.mediaName || 'Attached Document'}</p>
                          <p style={{ color: '#6B7280', fontSize: 12, textTransform: 'uppercase' }}>{post.type}</p>
                        </div>
                        <a href={toDownloadUrl(post.media_url, post.mediaName)} rel="noreferrer" style={{ background: '#3B82F6', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {post.type === 'video' && post.media_url && (
                    <div style={{ background: '#111827', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{post.mediaName || 'Attached Video'}</p>
                          <p style={{ color: '#9CA3AF', fontSize: 12 }}>Video</p>
                        </div>
                      </div>
                      <a href={post.media_url} target="_blank" rel="noreferrer" style={{ background: '#10B981', color: 'white', textDecoration: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Watch Now</a>
                    </div>
                  )}

                  {post.type === 'announcement' && post.media_url && (
                    <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#111827', fontWeight: 600, fontSize: 13 }}>{post.mediaName || 'Attached File'}</p>
                          <p style={{ color: '#6B7280', fontSize: 12 }}>Attachment</p>
                        </div>
                        <a href={toDownloadUrl(post.media_url, post.mediaName)} rel="noreferrer" style={{ background: '#4F46E5', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
                    <button className="action-icon" onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6B7280', fontFamily: "'DM Sans',sans-serif" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {post.likes > 0 ? post.likes : 'React'}
                    </button>
                    <button className="action-icon" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6B7280', fontFamily: "'DM Sans',sans-serif" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {post.replies > 0 ? `${post.replies} Comments` : 'Comment'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FILES TAB ────────────────────────────────────────────────────────── */}
          {activeTab === 'files' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button style={{
                  background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none',
                  borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload File
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {files.map((file, i) => (
                  <div key={file.id} className="file-row" style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    borderBottom: i < files.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer',
                  }}>
                    <FileIcon type={file.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>by {file.uploadedBy} · {file.date}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{file.size}</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF' }}>{file.downloads} downloads</p>
                    </div>
                    <a href={toDownloadUrl(file.media_url, file.name)} rel="noreferrer" style={{
                      background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '6px 12px',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#4B5563'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MEMBERS TAB ──────────────────────────────────────────────────────── */}
          {activeTab === 'members' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {MEMBERS.map((member, i) => (
                <div key={i} className="member-card" style={{
                  background: 'white', borderRadius: 18, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', background: `${member.color}20`, color: member.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20,
                    margin: '0 auto 12px',
                  }}>
                    {member.avatar}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{member.name}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{member.school}</p>
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 700,
                    padding: '2px 10px', borderRadius: 99, letterSpacing: '0.05em',
                    background: member.role === 'Admin' ? '#FEF3C7' : member.role === 'Moderator' ? '#DBEAFE' : '#F3F4F6',
                    color: member.role === 'Admin' ? '#92400E' : member.role === 'Moderator' ? '#1E40AF' : '#6B7280',
                  }}>
                    {member.role.toUpperCase()}
                  </span>
                  <p style={{ fontSize: 10, color: '#9CA3AF', marginTop: 8 }}>Joined {member.joined}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Panel (Widgets) ───────────────────────────────────────────── */}
        <div style={{ width: 280, flexShrink: 0 }}>
          
          {/* Deadlines Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827' }}>Upcoming Deadlines</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 4, borderRadius: 4, background: '#EF4444' }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Integration Quiz 1</p>
                  <p style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginTop: 2 }}>Due Tomorrow, 11:59 PM</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 4, borderRadius: 4, background: '#F59E0B' }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Submit Past Paper 2023</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Friday, 6:00 PM</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 4, borderRadius: 4, background: '#10B981' }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Live Q&A Session</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Saturday, 10:00 AM</p>
                </div>
              </div>
            </div>
            <button style={{ width: '100%', background: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 16 }}>View Calendar</button>
          </div>

          {/* Need Help / Book Session Widget */}
          <div style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', borderRadius: 20, padding: 24, color: 'white', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Need Extra Help?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20, lineHeight: 1.5 }}>
              Struggling with a topic? Book a 1-on-1 private session with the tutor to clear your doubts.
            </p>
            <button style={{
              width: '100%', background: 'white', color: '#064E3B', border: 'none',
              borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Schedule Session
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
