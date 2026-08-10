'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { discoverCommunities, getMyClasses, getMyDeadlines, getCommunityFeed, requestCommunityAccess, togglePostReaction } from '@/services/studentCommunityService';

const ALL_TAGS = ['All', 'Physics', 'Maths', 'ICT', 'Technology', 'Design', 'Backend', 'Science'];

export default function StudentCommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [activeCommunities, setActiveCommunities] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);

  // Discover state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Active Community state
  const [selectedActiveCommunity, setSelectedActiveCommunity] = useState<any>(null);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [mutedCommunities, setMutedCommunities] = useState<number[]>([]);

  // Modal state
  const [pendingCommunities, setPendingCommunities] = useState<number[]>([]);

  const loadInitialData = async () => {
    try {
      const [discRes, classesRes, deadRes] = await Promise.all([
        discoverCommunities(),
        getMyClasses(),
        getMyDeadlines()
      ]);
      if (discRes) setCommunities(discRes);
      if (classesRes) setActiveCommunities(classesRes);
      if (deadRes) setDeadlines(deadRes);
    } catch (err) {
      console.error("Failed to load community data", err);
    }
  };

  const loadCommunityFeed = async (communityId: string | number) => {
    try {
      const res = await getCommunityFeed(communityId);
      if (res) setPosts(res);
    } catch (err) {
      console.error("Failed to load community feed", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedActiveCommunity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCommunityFeed(selectedActiveCommunity.id);
    }
  }, [selectedActiveCommunity]);

  const toggleLike = async (id: number) => {
    try {
      const res = await togglePostReaction(id);
      if (res) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, has_reacted: res.reacted, reaction_count: res.reactionCount } : p));
      }
    } catch (err) {
      console.error("Failed to toggle reaction", err);
    }
  };

  const handleRequestAccess = async (id: number) => {
    try {
      await requestCommunityAccess(id);
      setPendingCommunities(prev => [...prev, id]);
    } catch (err) {
      console.error("Failed to request access", err);
    }
  };

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.tutor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || (c.tags && c.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const renderPosts = () => (
    <>
      {posts.map(post => (
        <div key={post.id} className="post-card" style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `#3B82F620`, color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, flexShrink: 0, overflow: 'hidden' }}>
                {post.author_avatar ? <img src={post.author_avatar} alt={post.author_name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : post.author_name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
                  {post.author_name}
                  {post.role === 'Tutor' && <span style={{ marginLeft: 6, color: '#4B5563', fontSize: 13, fontWeight: 600 }}>(Lead Tutor)</span>}
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {post.is_pinned && (
                    <span style={{ color: '#0F766E', display: 'flex' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#0F766E" stroke="#0F766E" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </span>
                  )}
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            {post.role === 'Tutor' && (
              <div style={{ display: 'flex', gap: 12, color: '#9CA3AF' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg></button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg></button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
              </div>
            )}
          </div>

          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>{post.content}</p>

          {/* Media Content */}
          {post.type === 'announcement' && post.media_url && (
            <div style={{ position: 'relative', width: '100%', height: 240, background: '#111827', borderRadius: 12, marginBottom: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video src={post.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {post.type === 'announcement' && post.media_url && (
                        console.log('Rendering image post with media URL:', post.type, post.media_url),
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, background: '#E0F2FE', color: '#0EA5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>Attached Document</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>PDF</p>
              </div>
              <a href={post.media_url} target="_blank" rel="noreferrer" style={{ background: 'none', color: '#10B981', border: 'none', padding: '8px 8px', fontSize: 18, cursor: 'pointer', display: 'flex' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              </a>
            </div>
          )}
          {/* nisiya */}
          {post.type === 'announcement' && post.media_url && (
            console.log('Rendering image post with media URL:', post.type, post.media_url),
            <div style={{ position: 'relative', width: '100%', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
              <img src={post.media_url} alt="Post media" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
            <button className="like-btn" onClick={() => toggleLike(post.id)} style={{ color: post.has_reacted ? '#EF4444' : '#6B7280' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={post.has_reacted ? '#EF4444' : 'none'} stroke={post.has_reacted ? '#EF4444' : '#6B7280'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              {post.reaction_count || 0}
            </button>
            <button className="like-btn" style={{ color: '#6B7280' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Reply
            </button>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <DashboardLayout title="Community" subtitle="Connect, discover, and learn with fellow students on Mentora.lk.">
      <style>{`
        .post-card { transition: all 0.22s; } 
        .post-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1)!important; }
        .like-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 9px; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .like-btn:hover { background: #F3F4F6; }
        .tab-btn { background: none; border: none; padding: 12px 24px; font-size: 15px; font-weight: 700; cursor: pointer; border-bottom: 2px solid transparent; color: #6B7280; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .tab-btn.active { color: #10B981; border-bottom-color: #10B981; }
        .tag-btn { background: white; border: 1px solid #E5E7EB; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: #374151; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .tag-btn:hover, .tag-btn.active { background: #10B981; color: white; border-color: #10B981; }
      `}</style>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingTop: 24 }}>
        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedActiveCommunity ? (
            <>
              {/* Community Detail Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
                    {selectedActiveCommunity.name}
                    {mutedCommunities.includes(selectedActiveCommunity.id) && (
                      <span style={{ marginLeft: 10, color: '#9CA3AF', display: 'flex' }} title="Notifications Muted">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                      </span>
                    )}
                  </h2>
                  <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{selectedActiveCommunity.member_count || 0} Students active • Tutor: {selectedActiveCommunity.tutor_name}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => setSelectedActiveCommunity(null)} style={{ background: '#ECFDF5', color: '#0F766E', border: '1px solid #CCFBF1', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>Discover Communities</button>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setIsManageMenuOpen(!isManageMenuOpen)} style={{ background: 'white', color: '#374151', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Manage</button>
                    {isManageMenuOpen && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: 180, zIndex: 100, overflow: 'hidden' }}>
                        <button style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }} onMouseOver={e => e.currentTarget.style.background = '#F9FAFB'} onMouseOut={e => e.currentTarget.style.background = 'white'} onClick={() => {
                          if (mutedCommunities.includes(selectedActiveCommunity.id)) {
                            setMutedCommunities(prev => prev.filter(id => id !== selectedActiveCommunity.id));
                          } else {
                            setMutedCommunities(prev => [...prev, selectedActiveCommunity.id]);
                          }
                          setIsManageMenuOpen(false);
                        }}>
                          {mutedCommunities.includes(selectedActiveCommunity.id) ? 'Unmute Notifications' : 'Mute Notifications'}
                        </button>
                        <button style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#EF4444', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={e => e.currentTarget.style.background = 'white'} onClick={() => { setIsManageMenuOpen(false); alert('You have left the community.'); setSelectedActiveCommunity(null); }}>
                          Leave Community
                        </button>
                      </div>
                    )}
                  </div>
                  <button style={{ background: '#38B2AC', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg> Invite</button>
                </div>
              </div>

              {renderPosts()}
            </>
          ) : (
            <>
              {/* Discover Header & Search */}
              <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Find Your Community</h2>
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <svg style={{ position: 'absolute', left: 14, top: 13, color: '#9CA3AF' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <input
                    type="text"
                    placeholder="Search by community name or tutor..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#10B981'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {ALL_TAGS.map(tag => (
                    <button key={tag} className={`tag-btn ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(tag)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discover Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {filteredCommunities.map(c => (
                  <div key={c.id} className="post-card" style={{ background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `#8B5CF615`, color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0, overflow: 'hidden' }}>
                        {c.tutor_avatar ? <img src={c.tutor_avatar} alt={c.tutor_name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>{c.name}</h4>
                        <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{c.tutor_name} • {c.member_count || 0} members</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                      {c.tags?.map((tag: string) => (
                        <span key={tag} style={{ background: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                      {pendingCommunities.includes(c.id) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button
                            disabled
                            style={{ width: '100%', background: '#F3F4F6', border: '1.5px solid #E5E7EB', color: '#9CA3AF', padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'not-allowed', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Pending
                          </button>
                          <button
                            onClick={() => setPendingCommunities(prev => prev.filter(id => id !== c.id))}
                            style={{ width: '100%', background: 'white', border: '1.5px solid #EF4444', color: '#EF4444', padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
                          >
                            Cancel Request
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestAccess(c.id)}
                          style={{ width: '100%', background: 'white', border: '1.5px solid #10B981', color: '#10B981', padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#10B981'; }}
                        >
                          Request Access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Right panel */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Active Communities Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Active Communities</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {activeCommunities.map(ac => {
                const isActive = selectedActiveCommunity?.id === ac.id;
                return (
                  <button key={ac.id} onClick={() => setSelectedActiveCommunity(ac)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: isActive ? '#E0F2FE' : 'transparent', border: 'none', borderRadius: 12, width: '100%', cursor: 'pointer', color: isActive ? '#0F766E' : '#4B5563', transition: 'all 0.2s', textAlign: 'left', fontWeight: isActive ? 700 : 600, fontFamily: "'DM Sans', sans-serif" }} onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#F9FAFB' }} onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 'bold' }}>{ac.name.charAt(0)}</div>
                    {ac.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Upcoming Deadlines
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {deadlines.map(d => (
                <div key={d.id} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ width: 4, background: '#EF4444', borderRadius: 2 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>{d.title}</p>
                    <p style={{ fontSize: 12, color: '#6B7280' }}>{new Date(d.due_date).toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>{d.community_name}</p>
                  </div>
                </div>
              ))}
              <button style={{ background: 'none', border: 'none', color: '#10B981', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>View all calendar &rarr;</button>
            </div>
          </div>

          {/* Need Help CTA */}
          <div style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', borderRadius: 20, padding: 22, color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8, position: 'relative' }}>Need Help?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20, lineHeight: 1.5, position: 'relative' }}>Struggling with a specific topic or assignment? Book a 1-on-1 session with your tutor for personalized guidance.</p>
            <button style={{ width: '100%', background: 'white', color: '#064E3B', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              Schedule Session
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Community Stats</p>
            {[{ l: 'Active Students', v: '4,850' }, { l: 'Posts Today', v: '156' }, { l: 'Resources Shared', v: '1.2K' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px dashed #E5E7EB' : 'none' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{s.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{s.v}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </DashboardLayout>
  );
}
