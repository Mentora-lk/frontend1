'use client';

import { useState } from 'react';
<<<<<<< Updated upstream
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

type JoinStatus = 'none' | 'pending' | 'joined';

interface Community {
  id: string;
  name: string;
  description: string;
  tags: string[];
  members: number;
  posts: number;
  files: number;
  color: string;
  icon: string;
  status: JoinStatus;
  recentActivity: string;
}

const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'al-maths-2025',
    name: 'A/L Maths 2025',
    description: 'Study group for A/L Combined Mathematics students. Share notes, solve problems together, and prepare for exams.',
    tags: ['Mathematics', 'A/L', 'Past Papers'],
    members: 342, posts: 89, files: 24,
    color: '#8B5CF6', icon: '📐',
    status: 'joined',
    recentActivity: '2 min ago',
  },
  {
    id: 'al-physics-hub',
    name: 'A/L Physics Hub',
    description: 'Everything Physics! MCQs, structured questions, experiment discussions, and past paper solutions.',
    tags: ['Physics', 'Science', 'Practicals'],
    members: 518, posts: 156, files: 47,
    color: '#3B82F6', icon: '⚡',
    status: 'joined',
    recentActivity: '15 min ago',
  },
  {
    id: 'chemistry-crew',
    name: 'Chemistry Crew',
    description: 'Organic, Inorganic & Physical Chemistry — notes, reactions, and exam tips for A/L students.',
    tags: ['Chemistry', 'Organic', 'Science'],
    members: 287, posts: 72, files: 31,
    color: '#10B981', icon: '🧪',
    status: 'none',
    recentActivity: '1 hour ago',
  },
  {
    id: 'ict-innovators',
    name: 'ICT Innovators',
    description: 'A/L ICT community — programming help, database design discussions, and project collaboration.',
    tags: ['ICT', 'Technology', 'Programming'],
    members: 193, posts: 48, files: 15,
    color: '#F59E0B', icon: '💻',
    status: 'none',
    recentActivity: '3 hours ago',
  },
  {
    id: 'biology-life',
    name: 'Biology Life',
    description: 'Cell biology, genetics, ecology and more. Diagrams, revision notes, and past paper walkthroughs.',
    tags: ['Biology', 'Science', 'Medicine'],
    members: 412, posts: 134, files: 56,
    color: '#84CC16', icon: '🧬',
    status: 'none',
    recentActivity: '30 min ago',
  },
  {
    id: 'design-thinkers',
    name: 'Design & Creativity',
    description: 'A community for aspiring designers. Learn UI/UX, graphic design, and share your creative portfolio.',
    tags: ['Design', 'Creative', 'UI/UX'],
    members: 156, posts: 38, files: 12,
    color: '#EC4899', icon: '🎨',
    status: 'none',
    recentActivity: '5 hours ago',
  },
];

const ALL_TAGS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Science', 'ICT', 'Technology', 'Design'];

export default function StudentCommunityPage() {
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'joined' | 'pending' | 'discover'>('all');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // Modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [joinReason, setJoinReason] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  const openRequestModal = (id: string) => {
    setSelectedCommunityId(id);
    setRequestModalOpen(true);
  };

  const submitRequest = () => {
    if (selectedCommunityId) {
      setCommunities(prev =>
        prev.map(c => c.id === selectedCommunityId ? { ...c, status: 'pending' } : c)
      );
    }
    setRequestModalOpen(false);
    setSelectedCommunityId(null);
    setJoinReason('');
    setProfileUrl('');
  };

  const cancelRequest = (id: string) => {
    setCommunities(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'none' } : c)
    );
  };

  const joinedCount  = communities.filter(c => c.status === 'joined').length;
  const pendingCount = communities.filter(c => c.status === 'pending').length;
  const discoverCount = communities.filter(c => c.status === 'none').length;

  const filtered = communities.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTabFilter =
      filter === 'all'      ? true :
      filter === 'joined'   ? c.status === 'joined' :
      filter === 'pending'  ? c.status === 'pending' :
      filter === 'discover' ? c.status === 'none' : true;
    const matchTag = selectedTag === 'All' || c.tags.includes(selectedTag);
    return matchSearch && matchTabFilter && matchTag;
  });

  return (
    <DashboardLayout title="Community" subtitle="Join study groups, share resources, and learn together.">
      <style>{`
        .community-card { transition: all 0.25s cubic-bezier(.22,1,.36,1); }
        .community-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important; }
        .action-btn { transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .action-btn:hover { opacity: 0.88; transform: scale(1.02); }
        .filter-pill { padding: 7px 18px; border-radius: 99px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .tag-btn { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        @keyframes pulse-ring { 0%,100%{opacity:1} 50%{opacity:.5} }
        .pending-dot { animation: pulse-ring 1.5s ease-in-out infinite; }
      `}</style>

      {/* ── Request Access Modal ────────────────────────────────────────────── */}
      {requestModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fade-up" style={{ background: 'white', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Request Access</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Introduce yourself to the community admin to get approved.</p>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Profile or LinkedIn URL</label>
              <input 
                type="url" 
                placeholder="https://linkedin.com/in/yourprofile" 
                value={profileUrl}
                onChange={e => setProfileUrl(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#374151', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Why do you want to join?</label>
              <textarea 
                placeholder="E.g., I'm studying A/L Science and looking for past paper discussions..." 
                value={joinReason}
                onChange={e => setJoinReason(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: '#374151', outline: 'none', height: 100, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setRequestModalOpen(false)} style={{ background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
              <button onClick={submitRequest} disabled={!joinReason} style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: joinReason ? 'pointer' : 'not-allowed', opacity: joinReason ? 1 : 0.6, fontFamily: "'DM Sans',sans-serif" }}>Submit Request</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Main Content ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Filters + Search */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'all',      label: `All (${communities.length})` },
                { key: 'joined',   label: `Joined (${joinedCount})` },
                { key: 'pending',  label: `Pending (${pendingCount})` },
                { key: 'discover', label: `Discover (${discoverCount})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  className="filter-pill"
                  onClick={() => setFilter(tab.key as typeof filter)}
                  style={{
                    background:  filter === tab.key ? (tab.key === 'pending' ? '#F59E0B' : '#10B981') : 'white',
                    color:       filter === tab.key ? 'white' : '#6B7280',
                    borderColor: filter === tab.key ? (tab.key === 'pending' ? '#F59E0B' : '#10B981') : '#E5E7EB',
                    boxShadow:   filter === tab.key ? (tab.key === 'pending' ? '0 4px 12px rgba(245,158,11,0.3)' : '0 4px 12px rgba(16,185,129,0.3)') : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1.5px solid #E5E7EB', borderRadius: 11, padding: '8px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: 13, color: '#374151', background: 'transparent', width: 160, fontFamily: "'DM Sans',sans-serif" }}
              />
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {ALL_TAGS.map(tag => (
              <button 
                key={tag} 
                className="tag-btn"
                onClick={() => setSelectedTag(tag)}
                style={{
                  background: selectedTag === tag ? '#111827' : '#F3F4F6',
                  color: selectedTag === tag ? 'white' : '#4B5563',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Pending notice banner */}
          {pendingCount > 0 && (
            <div style={{
              background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 14,
              padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>⏳</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
                  {pendingCount} join request{pendingCount > 1 ? 's' : ''} pending approval
                </p>
                <p style={{ fontSize: 12, color: '#B45309' }}>
                  The community admin will review your request. You'll be notified once approved.
                </p>
              </div>
            </div>
          )}

          {/* Community Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(community => (
              <div
                key={community.id}
                className="community-card"
                style={{
                  background: 'white', borderRadius: 20, padding: 0,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: community.status === 'pending'
                    ? '1.5px solid #FDE68A'
                    : community.status === 'joined'
                    ? '1.5px solid #A7F3D0'
                    : '1px solid rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}
              >
                {/* Banner */}
                <div style={{
                  height: 72,
                  background: `linear-gradient(135deg, ${community.color}, ${community.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                }}>
                  <span style={{ fontSize: 32 }}>{community.icon}</span>

                  {/* Status badge */}
                  {community.status === 'joined' && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)',
                      borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 700,
                      color: 'white', letterSpacing: '0.05em',
                    }}>
                      ✓ MEMBER
                    </span>
                  )}
                  {community.status === 'pending' && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(245,158,11,0.9)', backdropFilter: 'blur(10px)',
                      borderRadius: 99, padding: '3px 10px', fontSize: 10, fontWeight: 700,
                      color: 'white', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span className="pending-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'inline-block' }} />
                      PENDING
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '16px 20px 20px' }}>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
                      {community.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {community.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, fontWeight: 700, color: community.color,
                          background: `${community.color}15`, padding: '3px 8px', borderRadius: 6,
                        }}>
                          {tag}
                        </span>
                      ))}
                      {community.tags.length > 2 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', background: '#F3F4F6', padding: '3px 8px', borderRadius: 6 }}>
                          +{community.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16, minHeight: 42 }}>
                    {community.description}
                  </p>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {[
                      { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, val: community.members, label: 'members' },
                      { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, val: community.posts, label: 'posts' },
                      { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, val: community.files, label: 'files' },
                    ].map((stat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {stat.icon}
                        <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{stat.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {community.status === 'joined' && (
                    <Link href={`/dashboard/student/community/${community.id}`}>
                      <button className="action-btn" style={{
                        width: '100%', background: 'linear-gradient(135deg,#10B981,#059669)',
                        color: 'white', border: 'none', borderRadius: 10, padding: '10px',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>
                        Open Community →
                      </button>
                    </Link>
                  )}

                  {community.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn" style={{
                        flex: 1, background: '#FFFBEB', color: '#92400E',
                        border: '1.5px solid #FDE68A', borderRadius: 10, padding: '9px',
                        fontSize: 13, fontWeight: 700, cursor: 'default',
                      }}>
                        ⏳ Awaiting Approval
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => cancelRequest(community.id)}
                        title="Cancel request"
                        style={{
                          background: '#FEF2F2', color: '#EF4444', border: '1.5px solid #FECACA',
                          borderRadius: 10, padding: '9px 12px', fontSize: 13, fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {community.status === 'none' && (
                    <button
                      className="action-btn"
                      onClick={() => openRequestModal(community.id)}
                      style={{
                        width: '100%', background: 'white', color: '#10B981',
                        border: '2px solid #10B981', borderRadius: 10, padding: '9px',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      + Request to Join
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No communities found</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Try a different search term or filter</p>
            </div>
          )}
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────────── */}
        <div style={{ width: 240, flexShrink: 0 }}>

          {/* My Communities */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>My Communities</h3>
            {communities.filter(c => c.status === 'joined').map((c, i, arr) => (
              <Link key={c.id} href={`/dashboard/student/community/${c.id}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF' }}>{c.recentActivity}</p>
                  </div>
                </div>
              </Link>
            ))}
            {joinedCount === 0 && (
              <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', padding: '12px 0' }}>You haven&apos;t joined any communities yet</p>
            )}
          </div>

          {/* Pending Requests */}
          {pendingCount > 0 && (
            <div style={{ background: '#FFFBEB', borderRadius: 20, padding: 22, border: '1.5px solid #FDE68A', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#92400E', marginBottom: 14 }}>Pending Requests</h3>
              {communities.filter(c => c.status === 'pending').map((c, i, arr) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #FDE68A' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#92400E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: '#B45309' }}>Awaiting approval</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Activity Stats */}
          <div style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', borderRadius: 20, padding: 22 }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>My Activity</p>
            {[
              { l: 'Communities Joined', v: joinedCount.toString() },
              { l: 'Pending Requests',   v: pendingCount.toString() },
              { l: 'Saved Resources',    v: '12' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{s.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{s.v}</span>
=======
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const POSTS = [
  { id:1, author:'Amali Perera', avatar:'A', color:'#8B5CF6', role:'Student', time:'1 hour ago', content:'Does anyone have a good set of notes for the A/L Physics unit on Waves? I\'m struggling a bit with the Doppler Effect. 🌊 #ALPhysics #Help Needed', likes:12, comments:4, liked:false },
  { id:2, author:'Saman Gunawardena', avatar:'S', color:'#10B981', role:'Student', time:'3 hours ago', content:'Just finished a great session with Mr. Kasun Fernando. His explanation of Integration was so clear! Highly recommend checking out his classes if you\'re struggling with Pure Maths. 📐 #Maths #Mentora', likes:45, comments:8, liked:false },
  { id:3, author:'Nuwan Jayasena', avatar:'N', color:'#F59E0B', role:'Student', time:'5 hours ago', content:'Study group meeting this Saturday at 10 AM for Chemistry revision. We\'ll be covering Organic Chemistry. Anyone interested? 🧪 #StudyGroup #Chemistry', likes:28, comments:12, liked:false },
  { id:4, author:'Lakmini Fernando', avatar:'L', color:'#EC4899', role:'Student', time:'1 day ago', content:'So happy to have found Mentora.lk! It\'s so much easier to track my classes and connect with tutors now. 🎓✨', likes:56, comments:15, liked:false },
];

const STUDENTS_NEARBY = [
  { name:'Dilini Silva', school:'Visakha Vidyalaya', rating:4.9, avatar:'D', color:'#3B82F6' },
  { name:'Kamal Perera', school:'Ananda College', rating:4.7, avatar:'K', color:'#8B5CF6' },
  { name:'Minali Rajapaksa', school:'Musaeus College', rating:4.8, avatar:'M', color:'#EC4899' },
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
      id: Date.now(), author:'D.M.S.N. Dissanayake', avatar:'D', color:'#10B981',
      role:'Student', time:'Just now', content:newPost.trim(),
      likes:0, comments:0, liked:false,
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

      <div style={{ display:'flex', gap:24, alignItems:'flex-start' }}>

        {/* Main feed */}
        <div style={{ flex:1, minWidth:0 }}>

          {/* Create post */}
          <div style={{ background:'white', borderRadius:20, padding:22, boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)', marginBottom:20 }}>
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#10B981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:16, flexShrink:0 }}>D</div>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share something with the student community..."
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
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'#111827', marginBottom:16 }}>Students Nearby</h3>
            {STUDENTS_NEARBY.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom: i < STUDENTS_NEARBY.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`${s.color}20`, color:s.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 }}>{s.avatar}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{s.name}</p>
                  <p style={{ fontSize:11, color:'#9CA3AF' }}>{s.school}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:'linear-gradient(135deg,#064E3B,#065F46)', borderRadius:20, padding:22 }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:'white', marginBottom:8 }}>Community Stats</p>
            {[{l:'Active Students',v:'4,850'},{l:'Posts Today',v:'156'},{l:'Resources Shared',v:'1.2K'}].map((s,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{s.l}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'white' }}>{s.v}</span>
>>>>>>> Stashed changes
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
