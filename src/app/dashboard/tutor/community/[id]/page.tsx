'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';

// ── Community Detail Data ─────────────────────────────────────────────────────
const COMMUNITY_DATA: Record<string, {
  name: string; description: string; category: string; color: string; icon: string; members: number;
}> = {
  'al-maths-2025': { name: 'A/L Maths 2025', description: 'Study group for A/L Combined Mathematics students.', category: 'Mathematics', color: '#8B5CF6', icon: '📐', members: 342 },
  'al-physics-hub': { name: 'A/L Physics Hub', description: 'Everything Physics! MCQs, structured questions, and past papers.', category: 'Physics', color: '#3B82F6', icon: '⚡', members: 518 },
};

const DISCUSSIONS = [
  { id: 1, author: 'Tutor Kasun', avatar: 'K', color: '#10B981', time: '30 min ago', content: 'Here is the recording for yesterday\'s live session on Integration.', likes: 8, replies: 4, pinned: true, isTutor: true, type: 'video', mediaName: 'Integration Seminar Recording', duration: '1h 45m' },
  { id: 2, author: 'Sanduni Silva', avatar: 'S', color: '#EC4899', time: '2 hours ago', content: 'Could someone help me with question 5 from the assignment? I\'m stuck on the integration part. 📝', likes: 23, replies: 7, pinned: false, isTutor: false, type: 'text' },
  { id: 4, author: 'Tutor Kasun', avatar: 'K', color: '#10B981', time: '1 day ago', content: 'Please review these syllabus guidelines before our next class.', likes: 45, replies: 5, pinned: false, isTutor: true, type: 'pdf', mediaName: '2025 Syllabus Updates.pdf', size: '2.1 MB' },
];

const FILES = [
  { id: 1, name: 'Differential Equations Notes.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Tutor Kasun', date: '2 hours ago', downloads: 45 },
  { id: 2, name: 'Past Paper 2024 Solutions.pdf', type: 'pdf', size: '5.1 MB', uploadedBy: 'Tutor Kasun', date: '3 days ago', downloads: 128 },
  { id: 3, name: 'Integration Formulas Cheat Sheet.png', type: 'image', size: '890 KB', uploadedBy: 'Tutor Kasun', date: '1 week ago', downloads: 234 },
];

const MEMBERS = [
  { name: 'Tutor Kasun', role: 'Admin', avatar: 'K', color: '#10B981', school: 'Mentora.lk', joined: '3 months ago' },
  { name: 'Sanduni Silva', role: 'Student', avatar: 'S', color: '#EC4899', school: 'Visakha Vidyalaya', joined: '2 months ago' },
  { name: 'Kavindu Jayawardena', role: 'Student', avatar: 'K', color: '#8B5CF6', school: 'Ananda College', joined: '1 month ago' },
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
export default function TutorCommunityDetailPage() {
  const params = useParams();
  const communityId = params.id as string;
  const community = COMMUNITY_DATA[communityId] || COMMUNITY_DATA['al-maths-2025'];

  const [activeTab, setActiveTab] = useState<'discussions' | 'files' | 'members'>('discussions');
  const [discussions, setDiscussions] = useState(DISCUSSIONS);
  const [newMessage, setNewMessage] = useState('');

  const submitPost = () => {
    if (!newMessage.trim()) return;
    setDiscussions(prev => [{
      id: Date.now(), author: 'Tutor Kasun', avatar: 'K', color: '#10B981',
      time: 'Just now', content: newMessage.trim(), likes: 0, replies: 0, pinned: false, isTutor: true, type: 'text'
    }, ...prev]);
    setNewMessage('');
  };

  const toggleLike = (id: number) => {
    setDiscussions(prev => prev.map(d => d.id === id ? { ...d, likes: d.likes + 1 } : d));
  };

  const tabs = [
    { key: 'discussions' as const, label: 'Feed & Discussions', count: discussions.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { key: 'files' as const, label: 'Materials', count: FILES.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { key: 'members' as const, label: 'Members', count: MEMBERS.length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  ];

  return (
    <TutorDashboardLayout title={community.name} subtitle={community.description}>
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
        .action-icon:hover { color: #3B82F6 !important; }
      `}</style>

      {/* Back link + community banner */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/tutor/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to My Communities
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
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{
              background: 'white', color: community.color,
              border: 'none', borderRadius: 10, padding: '8px 18px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
            <button style={{
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
              Invite Student
            </button>
          </div>
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
                  background: activeTab === tab.key ? '#3B82F6' : 'transparent',
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
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>K</div>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Make an announcement or start a discussion..."
                    style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: '#374151', resize: 'none', height: 70, outline: 'none', lineHeight: 1.5 }}
                    onFocus={e => { e.target.style.borderColor = '#3B82F6'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button style={{ background: 'none', border: 'none', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Attach
                    </button>
                    <button style={{ background: 'none', border: 'none', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Poll
                    </button>
                  </div>
                  <button onClick={submitPost} style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Post to Community</button>
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
                        {post.isTutor && <span style={{ background: '#ECFDF5', color: '#059669', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>TUTOR (YOU)</span>}
                      </p>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>{post.time}</p>
                    </div>
                    {/* Tutor Options menu on posts */}
                    <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                  </div>

                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>{post.content}</p>

                  {/* Media Content (Video/PDF) */}
                  {post.type === 'video' && (
                    <div style={{ background: '#111827', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{post.mediaName}</p>
                          <p style={{ color: '#9CA3AF', fontSize: 12 }}>Video • {post.duration}</p>
                        </div>
                      </div>
                      <button style={{ background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Play / Edit</button>
                    </div>
                  )}

                  {post.type === 'pdf' && (
                    <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div>
                          <p style={{ color: '#111827', fontWeight: 600, fontSize: 13 }}>{post.mediaName}</p>
                          <p style={{ color: '#6B7280', fontSize: 12 }}>PDF • {post.size}</p>
                        </div>
                      </div>
                      <button style={{ background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Manage
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
                    <button className="action-icon" onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6B7280', fontFamily: "'DM Sans',sans-serif" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {post.likes > 0 ? post.likes : 'Like'}
                    </button>
                    <button className="action-icon" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#6B7280', fontFamily: "'DM Sans',sans-serif" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {post.replies > 0 ? `${post.replies} Replies` : 'Reply'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FILES TAB ────────────────────────────────────────────────────────── */}
          {activeTab === 'files' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Shared Materials</h3>
                <button style={{
                  background: 'linear-gradient(135deg,#3B82F6,#2563EB)', color: 'white', border: 'none',
                  borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload New File
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {FILES.map((file, i) => (
                  <div key={file.id} className="file-row" style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    borderBottom: i < FILES.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer',
                  }}>
                    <FileIcon type={file.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF' }}>Uploaded by {file.uploadedBy} · {file.date}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{file.size}</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF' }}>{file.downloads} downloads</p>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
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
                  border: '1px solid rgba(0,0,0,0.04)', textAlign: 'center', position: 'relative'
                }}>
                  <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
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
                    background: member.role === 'Admin' ? '#FEF3C7' : member.role === 'Student' ? '#DBEAFE' : '#F3F4F6',
                    color: member.role === 'Admin' ? '#92400E' : member.role === 'Student' ? '#1E40AF' : '#6B7280',
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
          
          {/* My Communities Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>My Communities</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.entries(COMMUNITY_DATA).map(([id, ac]) => {
                const isActive = id === communityId;
                return (
                  <Link href={`/dashboard/tutor/community/${id}`} key={id} style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: isActive ? '#EFF6FF' : 'transparent', border: 'none', borderRadius: 12, width: '100%', cursor: 'pointer', color: isActive ? '#1D4ED8' : '#4B5563', transition: 'all 0.2s', textAlign: 'left', fontWeight: isActive ? 700 : 600, fontFamily: "'DM Sans', sans-serif" }} onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB' }} onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                      {ac.icon}
                      {ac.name}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Deadlines Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827' }}>Set Deadlines</h3>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
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
            </div>
          </div>

          {/* Pending Requests */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
              Pending Join Requests
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>Dinuka Bandara</p>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>Requested 2 hrs ago</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ flex: 1, background: '#3B82F6', color: 'white', border: 'none', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Accept</button>
                  <button style={{ flex: 1, background: '#F3F4F6', color: '#4B5563', border: 'none', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Decline</button>
                </div>
              </div>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>View all requests &rarr;</button>
          </div>

        </div>
      </div>
    </TutorDashboardLayout>
  );
}
