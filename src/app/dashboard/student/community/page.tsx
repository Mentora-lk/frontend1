'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { discoverCommunities, getMyClasses, getMyDeadlines, getCommunityFeed, requestCommunityAccess, cancelCommunityRequest, dismissDeclinedRequest, togglePostReaction, getMyRequests, getPostComments, addPostComment, deletePostComment, submitAssignment } from '@/services/studentCommunityService';

const ALL_TAGS = ['All', 'Physics', 'Maths', 'ICT', 'Technology', 'Design', 'Backend', 'Science'];

export default function StudentCommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [activeCommunities, setActiveCommunities] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [uploadDeadline, setUploadDeadline] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Decode JWT to get current user id for comment ownership check
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.userId || payload.sub || null);
      }
    } catch { }
  }, []);

  // Discover state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  // Active Community state
  const [selectedActiveCommunity, setSelectedActiveCommunity] = useState<any>(null);
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [mutedCommunities, setMutedCommunities] = useState<number[]>([]);

  // Modal state
  const [pendingCommunities, setPendingCommunities] = useState<number[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  // Comment/reply state
  const [openComments, setOpenComments] = useState<Record<number, any[]>>({}); // postId -> comments[]
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({}); // postId -> text
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedActiveCommunity) {
      loadCommunityFeed(selectedActiveCommunity.id);
    }
  }, [selectedActiveCommunity]);

  const loadInitialData = async () => {
    const [discRes, classesRes, deadRes, reqsRes] = await Promise.allSettled([
      discoverCommunities(),
      getMyClasses(),
      getMyDeadlines(),
      getMyRequests()
    ]);

    if (discRes.status === 'fulfilled' && discRes.value) setCommunities(discRes.value);
    if (classesRes.status === 'fulfilled' && classesRes.value) setActiveCommunities(classesRes.value);
    if (deadRes.status === 'fulfilled' && deadRes.value) setDeadlines(deadRes.value);
    if (reqsRes.status === 'fulfilled' && reqsRes.value) {
      const reqs = reqsRes.value;
      setMyRequests(reqs);
      // Notification for newly accepted requests
      try {
        const notified = JSON.parse(localStorage.getItem('notified_requests') || '[]');
        const newlyApproved = reqs.filter((r: any) => r.status === 'approved' && !notified.includes(r.id));
        if (newlyApproved.length > 0) {
          // Show toast for the first newly approved
          setToastMessage(`Your request to join "${newlyApproved[0].name}" was accepted!`);
          setTimeout(() => setToastMessage(''), 6000);
          // Increment the bell badge count
          const current = parseInt(localStorage.getItem('unread_notifications') || '0', 10);
          localStorage.setItem('unread_notifications', String(current + newlyApproved.length));
          // Mark them as notified so they don't re-trigger
          newlyApproved.forEach((r: any) => notified.push(r.id));
          localStorage.setItem('notified_requests', JSON.stringify(notified));
        }
      } catch {
        // localStorage not available (SSR guard)
      }
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
      loadInitialData(); // Refresh requests list
    } catch (err) {
      console.error("Failed to request access", err);
    }
  };

  const handleCancelRequest = async (id: number) => {
    try {
      await cancelCommunityRequest(id);
      setMyRequests(prev => prev.filter((r: any) => r.id !== id));
      setPendingCommunities(prev => prev.filter(pid => pid !== id));
    } catch (err) {
      console.error("Failed to cancel request", err);
    }
  };

  const handleDismissDeclined = async (id: number) => {
    try {
      await dismissDeclinedRequest(id);
      setMyRequests(prev => prev.filter((r: any) => r.id !== id));
    } catch (err) {
      console.error("Failed to dismiss declined request", err);
    }
  };

  const handleToggleComments = async (postId: number) => {
    if (openComments[postId]) {
      // Close comments
      setOpenComments(prev => { const copy = { ...prev }; delete copy[postId]; return copy; });
      return;
    }
    // Open and fetch comments
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    setOpenComments(prev => ({ ...prev, [postId]: [] }));
    try {
      const res = await getPostComments(postId);
      if (res) setOpenComments(prev => ({ ...prev, [postId]: res }));
    } catch (err) {
      console.error("Failed to load comments", err);
    }
    setLoadingComments(prev => ({ ...prev, [postId]: false }));
  };

  const handleAddComment = async (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    try {
      const res = await addPostComment(postId, content);
      if (res) {
        setOpenComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res] }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        // Update comment count on the post
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (parseInt(p.comment_count) || 0) + 1 } : p));
      }
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    if (!confirm('Delete this reply?')) return;
    try {
      await deletePostComment(postId, commentId);
      setOpenComments(prev => ({ ...prev, [postId]: prev[postId].filter((c: any) => c.id !== commentId) }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, (parseInt(p.comment_count) || 1) - 1) } : p));
    } catch (err) {
      console.error("Failed to delete comment", err);
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
                {post.author_avatar ? <img src={post.author_avatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : post.author_name?.charAt(0)}
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

          </div>

          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>{post.content}</p>

          {/* Media Content */}
          {post.type === 'video' && post.media_url && (
            <div style={{ position: 'relative', width: '100%', height: 240, background: '#111827', borderRadius: 12, marginBottom: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video src={post.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {post.type === 'pdf' && post.media_url && (
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

          {post.type === 'image' && post.media_url && (
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
            <button className="like-btn" onClick={() => handleToggleComments(post.id)} style={{ color: openComments[post.id] ? '#10B981' : '#6B7280' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              {post.comment_count || 0} {(post.comment_count == 1) ? 'Reply' : 'Replies'}
            </button>
          </div>

          {/* Comments Section */}
          {openComments[post.id] && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #E5E7EB' }}>
              {/* Existing comments */}
              {loadingComments[post.id] ? (
                <p style={{ fontSize: 12, color: '#9CA3AF', padding: '8px 0' }}>Loading replies...</p>
              ) : openComments[post.id].length === 0 ? (
                <p style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', padding: '4px 0' }}>No replies yet. Be the first!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', marginBottom: 12 }}>
                  {openComments[post.id].map((c: any) => (
                    <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: c.author_avatar ? `url(${c.author_avatar}) center/cover` : (c.role === 'Tutor' ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'linear-gradient(135deg,#10B981,#059669)'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>
                        {!c.author_avatar && (c.author_name?.charAt(0) || '?')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{c.author_name}</span>
                          <span style={{ fontSize: 10, color: c.role === 'Tutor' ? '#6366F1' : '#10B981', fontWeight: 600 }}>{c.role}</span>
                          <span style={{ fontSize: 10, color: '#9CA3AF' }}>· {new Date(c.created_at).toLocaleString()}</span>
                          {/* Delete button — only for comment's own author */}
                          {currentUserId && Number(c.author_id) === Number(currentUserId) && (
                            <button
                              onClick={() => handleDeleteComment(post.id, c.id)}
                              title="Delete reply"
                              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}>{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Comment input */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <input
                  value={commentInputs[post.id] || ''}
                  onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(post.id); } }}
                  placeholder="Write a reply..."
                  style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#FAFAFA', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#10B981'}
                  onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  disabled={!commentInputs[post.id]?.trim()}
                  style={{ background: '#10B981', border: 'none', borderRadius: 10, padding: '9px 16px', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: commentInputs[post.id]?.trim() ? 1 : 0.4, transition: 'opacity 0.2s' }}
                >
                  Reply
                </button>
              </div>
            </div>
          )}
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
        .community-scroll { scrollbar-width: thin; scrollbar-color: #D1FAE5 transparent; }
        .community-scroll::-webkit-scrollbar { width: 6px; }
        .community-scroll::-webkit-scrollbar-track { background: #F3F4F6; border-radius: 99px; }
        .community-scroll::-webkit-scrollbar-thumb { background: #10B981; border-radius: 99px; }
        .community-scroll::-webkit-scrollbar-thumb:hover { background: #059669; }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 88, right: 24, zIndex: 1000, background: '#10B981', color: 'white', padding: '14px 24px', borderRadius: 12, boxShadow: '0 10px 25px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: 12, animation: 'fadeUp 0.3s ease-out' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 8 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
        </div>
      )}

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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                      </span>
                    )}
                  </h2>
                  <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{selectedActiveCommunity.member_count || 0} Students active • Tutor: {selectedActiveCommunity.tutor_name}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => setSelectedActiveCommunity(null)} style={{ background: '#ECFDF5', color: '#0F766E', border: '1px solid #CCFBF1', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>Discover Communities</button>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setIsManageMenuOpen(!isManageMenuOpen)} style={{ background: 'white', color: '#374151', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> Manage</button>
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
                        {c.tutor_avatar ? <img src={c.tutor_avatar} alt={c.tutor_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.name.charAt(0)}
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
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
            <div className="community-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 150, overflowY: 'scroll', paddingRight: 4 }}>
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
              {deadlines.map(d => {
                const isSubmitted = d.is_submitted;
                return (
                  <div
                    key={d.id}
                    style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: '1px solid #F3F4F6', cursor: isSubmitted ? 'default' : 'pointer', transition: 'background 0.2s', padding: '8px', opacity: isSubmitted ? 0.7 : 1 }}
                    onClick={() => { if (!isSubmitted) setUploadDeadline(d); }}
                    onMouseOver={e => { if (!isSubmitted) e.currentTarget.style.background = '#F9FAFB'; }}
                    onMouseOut={e => { if (!isSubmitted) e.currentTarget.style.background = 'transparent'; }}
                    title={isSubmitted ? "Assignment submitted" : "Click to upload assignment"}
                  >
                    <div style={{ width: 4, background: isSubmitted ? '#10B981' : '#EF4444', borderRadius: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 4px 0', lineHeight: 1.3, textDecoration: isSubmitted ? 'line-through' : 'none' }}>{d.title}</p>
                        {isSubmitted && <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', background: '#D1FAE5', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>Done</span>}
                      </div>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{new Date(d.due_date).toLocaleString()}</p>
                      <p style={{ fontSize: 11, color: '#10B981', marginTop: 4, margin: 0 }}>{d.community_name}</p>
                    </div>
                  </div>
                );
              })}
              <Link href="/dashboard/student/schedule" style={{ background: 'none', border: 'none', color: '#10B981', fontSize: 13, fontWeight: 700, cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: 4, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', display: 'inline-block' }}>View all calendar →</Link>
            </div>
          </div>

          {/* Need Help CTA */}
          <div style={{ background: 'linear-gradient(135deg,#064E3B,#065F46)', borderRadius: 20, padding: 22, color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8, position: 'relative' }}>Need Help?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 20, lineHeight: 1.5, position: 'relative' }}>Struggling with a specific topic or assignment? Book a 1-on-1 session with your tutor for personalized guidance.</p>
            <Link href="/dashboard/student/schedule" style={{ display: 'block', width: '100%', background: 'white', color: '#064E3B', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', textDecoration: 'none' }}>
              Schedule Session
            </Link>
          </div>

          {/* Sent Requests Widget */}
          <div style={{ background: 'white', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Sent Requests</p>
            {myRequests.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No pending or declined requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
                {myRequests.map((r: any) => (
                  <div key={r.id} style={{ padding: '12px', background: r.status === 'declined' ? '#FFF5F5' : '#FAFAFA', borderRadius: 12, border: `1px solid ${r.status === 'declined' ? '#FEE2E2' : '#F3F4F6'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ overflow: 'hidden' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{r.tutor_name}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: r.status === 'pending' ? '#FEF3C7' : '#FEE2E2', color: r.status === 'pending' ? '#D97706' : '#DC2626', flexShrink: 0, marginLeft: 8, textTransform: 'capitalize' }}>
                        {r.status}
                      </span>
                    </div>
                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(r.id)}
                        style={{ width: '100%', background: 'white', border: '1.5px solid #EF4444', color: '#EF4444', padding: '6px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
                      >
                        Cancel Request
                      </button>
                    )}
                    {r.status === 'declined' && (
                      <button
                        onClick={() => handleDismissDeclined(r.id)}
                        style={{ width: '100%', background: 'white', border: '1.5px solid #9CA3AF', color: '#6B7280', padding: '6px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#F3F4F6'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Upload Assignment Modal */}
      {uploadDeadline && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, padding: 30, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>Upload Assignment</h2>
                <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{uploadDeadline.title} • {uploadDeadline.community_name}</p>
              </div>
              <button onClick={() => { setUploadDeadline(null); setSelectedFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <label style={{ display: 'block', border: '2px dashed #E5E7EB', borderRadius: 12, padding: 40, textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: '#F9FAFB' }}>
              <input type="file" style={{ display: 'none' }} accept=".pdf,.docx,.zip" onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }} />
              {selectedFile ? (
                <>
                  <div style={{ width: 48, height: 48, background: '#D1FAE5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0F766E', margin: '0 0 4px 0' }}>{selectedFile.name}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>Click to change file</p>
                </>
              ) : (
                <>
                  <div style={{ width: 48, height: 48, background: '#E0F2FE', color: '#0EA5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px 0' }}>Click to upload or drag and drop</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>PDF, DOCX, or ZIP (Max 10MB)</p>
                </>
              )}
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => { setUploadDeadline(null); setSelectedFile(null); }} style={{ padding: '10px 16px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }} disabled={isSubmitting}>Cancel</button>
              <button onClick={async () => {
                if (!selectedFile) {
                  alert('Please select a file first.');
                  return;
                }
                try {
                  setIsSubmitting(true);
                  await submitAssignment(uploadDeadline.id, selectedFile);
                  setToastMessage(`Assignment "${selectedFile.name}" uploaded successfully!`);
                  setDeadlines(prev => prev.map(d => d.id === uploadDeadline.id ? { ...d, is_submitted: true } : d));
                  setUploadDeadline(null);
                  setSelectedFile(null);
                } catch (err) {
                  console.error(err);
                  alert('Failed to submit assignment. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }} style={{ padding: '10px 24px', background: '#0F766E', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: (selectedFile && !isSubmitting) ? 1 : 0.6 }} disabled={!selectedFile || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
