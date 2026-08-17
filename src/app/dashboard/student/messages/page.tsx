'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { usePalette } from '@/hooks/usePalette';
import { Send } from 'lucide-react';

const CONVERSATIONS = [
  { id:1, name:'Kasun Fernando', subject:'Mathematics', avatar:'K', lastMsg:'Great! See you on Monday at 6PM. Please prepare the past papers.', time:'2m ago', unread:2, online:true, color:'#8B5CF6' },
  { id:2, name:'Nimesh Dissanayake', subject:'ICT', avatar:'N', lastMsg:'The assignment deadline has been extended to Friday. No worries!', time:'1h ago', unread:0, online:true, color:'#F59E0B' },
  { id:3, name:'Dilshan Rajapaksa', subject:'Chemistry', avatar:'D', lastMsg:'Your enrollment request has been approved. First class is Friday 4PM.', time:'3h ago', unread:0, online:false, color:'#10B981' },
  { id:4, name:'Thilak Perera', subject:'Physics', avatar:'T', lastMsg:'Thank you for your interest. I will review your request shortly.', time:'1d ago', unread:0, online:false, color:'#3B82F6' },
];

const MESSAGES: Record<number, { from:'me'|'tutor'; text:string; time:string }[]> = {
  1: [
    { from:'tutor', text:"Hi! I received your enrollment request for A/L Mathematics. Welcome!", time:'Yesterday 2:00 PM' },
    { from:'me',    text:"Thank you! I'm really excited to start. What should I prepare for the first class?", time:'Yesterday 2:05 PM' },
    { from:'tutor', text:"Please bring your textbook and past papers from 2020–2023. We'll start with Pure Maths Chapter 1.", time:'Yesterday 2:10 PM' },
    { from:'me',    text:"Perfect, I'll get them ready. What time do we start exactly?", time:'Yesterday 4:00 PM' },
    { from:'tutor', text:"Great! See you on Monday at 6PM. Please prepare the past papers.", time:'2m ago' },
  ],
  2: [
    { from:'tutor', text:"Hello! Your ICT class is confirmed. Please download Python 3.11 before our first session.", time:'Yesterday 10:00 AM' },
    { from:'me',    text:"Done! I've already installed it. Should I install any other tools?", time:'Yesterday 10:30 AM' },
    { from:'tutor', text:"The assignment deadline has been extended to Friday. No worries!", time:'1h ago' },
  ],
  3: [
    { from:'tutor', text:"Your enrollment request has been approved. First class is Friday 4PM.", time:'3h ago' },
  ],
  4: [
    { from:'me',    text:"Hello sir, I'm interested in joining your Physics class. Is there space available?", time:'1d ago' },
    { from:'tutor', text:"Thank you for your interest. I will review your request shortly.", time:'1d ago' },
  ],
};

export default function MessagesPage() {
  const palette = usePalette();
  const [activeId,  setActiveId]  = useState(1);
  const [newMsg,    setNewMsg]    = useState('');
  const [messages,  setMessages]  = useState(MESSAGES);

  const active = CONVERSATIONS.find(c=>c.id===activeId)!;
  const thread = messages[activeId] || [];

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId]||[]), { from:'me', text:newMsg.trim(), time:'Just now' }],
    }));
    setNewMsg('');
  };

  return (
    <DashboardLayout title="Messages" subtitle="Chat with your tutors.">
      <div style={{ display:'flex', gap:20, height:580 }}>

        {/* Conversation list */}
        <div style={{ width:280, flexShrink:0, background:palette.surface, borderRadius:20, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'18px 18px 12px', borderBottom:`1px solid ${palette.border}` }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:palette.textPrimary }}>Conversations</h3>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {CONVERSATIONS.map(c=>(
              <div key={c.id} onClick={()=>setActiveId(c.id)}
                style={{ padding:'14px 18px', cursor:'pointer', borderBottom:`1px solid ${palette.border}`, background:activeId===c.id?palette.activeBg:palette.surface, transition:'all 0.18s' }}
                onMouseEnter={e=>{ if(activeId!==c.id) (e.currentTarget as HTMLDivElement).style.background=palette.hoverBg; }}
                onMouseLeave={e=>{ if(activeId!==c.id) (e.currentTarget as HTMLDivElement).style.background=palette.surface; }}>
                <div style={{ display:'flex', gap:11, alignItems:'flex-start' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg,${c.color},${c.color}cc)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:16 }}>{c.avatar}</div>
                    {c.online && <div style={{ position:'absolute', bottom:0, right:0, width:11, height:11, borderRadius:'50%', background:'#10B981', border:'2px solid white' }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:palette.textPrimary }}>{c.name}</p>
                      <p style={{ fontSize:10, color:palette.textMuted }}>{c.time}</p>
                    </div>
                    <p style={{ fontSize:11, color:palette.textMuted, marginBottom:2 }}>{c.subject}</p>
                    <p style={{ fontSize:12, color:palette.textSecondary, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:140 }}>{c.lastMsg}</p>
                  </div>
                  {c.unread>0 && <span style={{ width:18, height:18, borderRadius:'50%', background:'#EF4444', color:'white', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{c.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div style={{ flex:1, background:palette.surface, borderRadius:20, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ padding:'16px 22px', borderBottom:`1px solid ${palette.border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,${active.color},${active.color}cc)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:16 }}>{active.avatar}</div>
              {active.online && <div style={{ position:'absolute', bottom:0, right:0, width:11, height:11, borderRadius:'50%', background:'#10B981', border:'2px solid white' }}/>}
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{active.name}</p>
              <p style={{ fontSize:12, color:active.online?'#10B981':palette.textMuted }}>{active.online?'Online now':'Offline'} · {active.subject} Tutor</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
            {thread.map((msg, i)=>(
              <div key={i} style={{ display:'flex', justifyContent:msg.from==='me'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'72%' }}>
                  <div style={{
                    padding:'11px 16px', borderRadius:msg.from==='me'?'18px 18px 4px 18px':'18px 18px 18px 4px',
                    background:msg.from==='me'?'linear-gradient(135deg,#10B981,#059669)':palette.surfaceAlt,
                    color:msg.from==='me'?'white':palette.textPrimary,
                    fontSize:14, lineHeight:1.6,
                    boxShadow:msg.from==='me'?'0 4px 12px rgba(16,185,129,0.3)':'none',
                  }}>
                    {msg.text}
                  </div>
                  <p style={{ fontSize:10, color:palette.textMuted, marginTop:4, textAlign:msg.from==='me'?'right':'left' }}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'14px 18px', borderTop:`1px solid ${palette.border}`, display:'flex', gap:10 }}>
            <input
              type="text"
              placeholder={`Message ${active.name}...`}
              value={newMsg}
              onChange={e=>setNewMsg(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') sendMsg(); }}
              style={{ flex:1, border:`1.5px solid ${palette.border}`, borderRadius:12, padding:'11px 16px', fontSize:14, fontFamily:"'DM Sans',sans-serif", color:palette.textPrimary, background:palette.surfaceAlt, outline:'none', transition:'border-color 0.2s' }}
              onFocus={e=>{ e.target.style.borderColor='#10B981'; e.target.style.background=palette.surface; }}
              onBlur={e=>{ e.target.style.borderColor=palette.border; e.target.style.background=palette.surfaceAlt; }}
            />
            <button onClick={sendMsg} style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#10B981,#059669)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(16,185,129,0.4)', transition:'all 0.2s', flexShrink:0 }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.05)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; }}>
              <Send size={18} color="white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}