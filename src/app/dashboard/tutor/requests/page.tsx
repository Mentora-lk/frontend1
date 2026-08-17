'use client';

import { useState, useEffect } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { tutorService } from '@/services/tutorService';
import { getPendingRequests, updateRequestStatus as updateCommunityRequestStatus } from '@/services/tutorCommunityService';
import { usePalette } from '@/hooks/usePalette';

export default function RequestsPage() {
  const palette = usePalette();
  const [filter, setFilter] = useState('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Community join requests — a separate feature from enrollment requests
  // above (different table, different fields, different action verbs), but
  // shown as a tab on this same page since this is the page tutors actually
  // visit for "Requests". Previously these only appeared in a small widget on
  // the community management page, which tutors had no reason to check.
  const [activeSection, setActiveSection] = useState<'enrollment' | 'community'>('enrollment');
  const [communityRequests, setCommunityRequests] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await tutorService.getRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchCommunityRequests = async () => {
      try {
        const res = await getPendingRequests();
        if (res.status === 'success') setCommunityRequests(res.data);
      } catch (err) {
        console.warn('Failed to fetch community requests', err);
      } finally {
        setCommunityLoading(false);
      }
    };
    fetchCommunityRequests();
  }, []);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pending  = requests.filter(r => r.status === 'pending').length;

  const approve = async (id: number) => {
    try {
      await tutorService.updateRequestStatus(id, 'approved');
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error("Failed to approve request", err);
    }
  };

  const reject  = async (id: number) => {
    try {
      await tutorService.updateRequestStatus(id, 'rejected');
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  };

  const handleCommunityAction = async (membershipId: number, action: 'approved' | 'declined') => {
    try {
      const res = await updateCommunityRequestStatus(membershipId, action);
      if (res.status === 'success') {
        setCommunityRequests(prev => prev.filter(r => r.membership_id !== membershipId));
      }
    } catch (err) {
      console.error('Failed to update community request', err);
    }
  };

  const statusStyle: Record<string, { color: string; bg: string }> = {
    pending:  { color:'#D97706', bg:'#FFFBEB' },
    approved: { color:'#059669', bg:'#ECFDF5' },
    rejected: { color:'#DC2626', bg:'#FEF2F2' },
  };

  return (
    <TutorDashboardLayout title="Student Requests" subtitle="Review and manage enrollment requests from students.">
      <style>{`
        .req-card{transition:all 0.22s;} .req-card:hover{transform:translateX(4px);}
        .approve-btn{background:#10B981;color:white;border:none;border-radius:9px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .approve-btn:hover{background:#059669;transform:scale(1.04);}
        .reject-btn{background:${palette.surface};color:#DC2626;border:1.5px solid #FECACA;border-radius:9px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .reject-btn:hover{background:#FEF2F2;transform:scale(1.04);}
        .section-tab{transition:all 0.2s;}
      `}</style>

      {/* Section switcher — enrollment requests vs. community join requests */}
      <div style={{ display:'flex', gap:10, marginBottom:24 }}>
        {(['enrollment', 'community'] as const).map(s => {
          const isActive = activeSection === s;
          const badgeCount = s === 'enrollment' ? pending : communityRequests.length;
          return (
            <button
              key={s}
              className="section-tab"
              onClick={() => setActiveSection(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                border: isActive ? 'none' : `1.5px solid ${palette.border}`,
                fontFamily: "'DM Sans',sans-serif",
                background: isActive ? 'linear-gradient(135deg,#3B82F6,#2563EB)' : palette.surface,
                color: isActive ? 'white' : palette.textSecondary,
                boxShadow: isActive ? '0 4px 14px rgba(59,130,246,0.3)' : 'none',
              }}
            >
              {s === 'enrollment' ? 'Enrollment Requests' : 'Community Requests'}
              {badgeCount > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#FFFBEB',
                  color: isActive ? 'white' : '#D97706',
                  borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700,
                }}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeSection === 'enrollment' && (
      <>
      {/* Stats */}
      <div style={{ display:'flex', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { label:'Total Requests', value:requests.length,  color:'#8B5CF6', bg:'#F5F3FF', border:'#DDD6FE' },
          { label:'Pending',        value:pending,           color:'#F59E0B', bg:'#FFFBEB', border:'#FDE68A' },
          { label:'Approved',       value:requests.filter(r=>r.status==='approved').length, color:'#10B981', bg:'#ECFDF5', border:'#A7F3D0' },
          { label:'Rejected',       value:requests.filter(r=>r.status==='rejected').length, color:'#EF4444', bg:'#FEF2F2', border:'#FECACA' },
        ].map((s,i) => (
          <div key={i} style={{ background:palette.surface, borderRadius:16, padding:'16px 20px', border:`1px solid ${s.border}`, boxShadow:`0 4px 14px ${s.bg}`, flex:1, minWidth:120 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:palette.textSecondary, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 18px', borderRadius:99, fontSize:13, fontWeight:600, cursor:'pointer', border:'1.5px solid', fontFamily:"'DM Sans',sans-serif", transition:'all 0.2s', background:filter===f?'#10B981':palette.surface, color:filter===f?'white':palette.textSecondary, borderColor:filter===f?'#10B981':palette.border, boxShadow:filter===f?'0 4px 12px rgba(16,185,129,0.3)':'none' }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* Request list */}
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {filtered.map(r => {
          const statusKey = r.status?.toLowerCase() || 'pending';
          const ss = statusStyle[statusKey] || statusStyle['pending'];
          const avatar = r.avatar || r.name?.charAt(0)?.toUpperCase() || '?';
          const color = r.color || '#10B981';
          return (
            <div key={r.id} className="req-card" style={{ background:palette.surface, borderRadius:18, padding:'20px 24px', boxShadow:palette.shadow, border:`1px solid ${palette.border}` }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:`${color}20`, color:color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, flexShrink:0 }}>{avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2, flexWrap:'wrap' }}>
                    <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{r.name || 'Unknown Student'}</p>
                    <span style={{ fontSize:11, fontWeight:700, color:ss.color, background:ss.bg, borderRadius:6, padding:'2px 9px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{r.status || 'Pending'}</span>
                    <span style={{ fontSize:11, color:palette.textMuted, marginLeft:'auto' }}>{r.time || ''}</span>
                  </div>
                  <p style={{ fontSize:12, color:'#6366F1', fontWeight:600, marginBottom:8 }}>📚 {r.class || r.className || 'Class Request'}</p>
                  
                  {/* Expanded details */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, marginBottom:12, padding:'12px', background:palette.surfaceAlt, borderRadius:12 }}>
                    <div>
                      <p style={{ fontSize:10, color:palette.textMuted, textTransform:'uppercase', fontWeight:700 }}>Contact</p>
                      <p style={{ fontSize:12, color:palette.textSecondary, fontWeight:600 }}>{r.email}</p>
                      <p style={{ fontSize:12, color:palette.textSecondary }}>{r.phone}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10, color:palette.textMuted, textTransform:'uppercase', fontWeight:700 }}>Education</p>
                      <p style={{ fontSize:12, color:palette.textSecondary, fontWeight:600 }}>{r.grade}</p>
                      <p style={{ fontSize:12, color:palette.textSecondary }}>{r.school || 'Not specified'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize:10, color:palette.textMuted, textTransform:'uppercase', fontWeight:700 }}>Preferred Schedule</p>
                      <p style={{ fontSize:12, color:'#059669', fontWeight:700 }}>{r.selectedDay} · {r.selectedTime}</p>
                      <p style={{ fontSize:12, color:'#059669' }}>Mode: {r.preferredMode}</p>
                    </div>
                  </div>

                  <p style={{ fontSize:13, color:palette.textSecondary, lineHeight:1.5, background:palette.surfaceAlt, borderRadius:10, padding:'10px 14px', borderLeft:`3px solid ${palette.border}`, marginBottom:12 }}>&ldquo;{r.message}&rdquo;</p>
                  
                  {r.status === 'pending' && (
                    <div style={{ display:'flex', gap:10 }}>
                      <button className="approve-btn" onClick={() => approve(r.id)}>✓ Approve</button>
                      <button className="reject-btn"  onClick={() => reject(r.id)}>✕ Decline</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:palette.textMuted }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <p style={{ fontSize:16, fontWeight:600 }}>No {filter} requests</p>
          </div>
        )}
      </div>
      </>
      )}

      {activeSection === 'community' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {communityLoading ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:palette.textMuted }}>Loading...</div>
          ) : communityRequests.length > 0 ? (
            communityRequests.map(r => (
              <div key={r.membership_id} className="req-card" style={{ background:palette.surface, borderRadius:18, padding:'20px 24px', boxShadow:palette.shadow, border:`1px solid ${palette.border}` }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'#8B5CF620', color:'#8B5CF6', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, flexShrink:0 }}>
                    {r.student_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2, flexWrap:'wrap' }}>
                      <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{r.student_name || 'Unknown Student'}</p>
                      <span style={{ fontSize:11, fontWeight:700, color:'#D97706', background:'#FFFBEB', borderRadius:6, padding:'2px 9px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Pending</span>
                      <span style={{ fontSize:11, color:palette.textMuted, marginLeft:'auto' }}>
                        {r.requested_at ? new Date(r.requested_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p style={{ fontSize:12, color:'#6366F1', fontWeight:600, marginBottom:12 }}>
                      💬 Wants to join &ldquo;{r.community_name}&rdquo;
                    </p>
                    <div style={{ display:'flex', gap:10 }}>
                      <button className="approve-btn" onClick={() => handleCommunityAction(r.membership_id, 'approved')}>✓ Accept</button>
                      <button className="reject-btn" onClick={() => handleCommunityAction(r.membership_id, 'declined')}>✕ Decline</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign:'center', padding:'60px 0', color:palette.textMuted }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <p style={{ fontSize:16, fontWeight:600 }}>No pending community requests</p>
            </div>
          )}
        </div>
      )}
    </TutorDashboardLayout>
  );
}
