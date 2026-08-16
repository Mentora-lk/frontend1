'use client';

import { useState } from 'react';
import TutorDashboardLayout from '@/components/dashboard/TutorDashboardLayout';
import { usePalette } from '@/hooks/usePalette';

const CONVERSATIONS = [
  { id:1, name:'Nimesh Perera',  avatar:'N', color:'#8B5CF6', lastMsg:'Thanks sir, I will attend tomorrow!', time:'2m',  unread:3, subject:'Mathematics' },
  { id:2, name:'Dilshan Silva',  avatar:'D', color:'#F59E0B', lastMsg:'What time does the class start?',      time:'1h',  unread:1, subject:'ICT'         },
  { id:3, name:'Amali Fernando', avatar:'A', color:'#10B981', lastMsg:'Okay, understood. Thank you!',        time:'3h',  unread:0, subject:'Physics'      },
  { id:4, name:'Ruwan Bandara',  avatar:'R', color:'#3B82F6', lastMsg:'Can I get the notes from last class?', time:'1d', unread:0, subject:'Mathematics'  },
  { id:5, name:'Shalini J.',     avatar:'S', color:'#EC4899', lastMsg:'I have a question about the exam.',   time:'2d',  unread:0, subject:'ICT'         },
];

const MESSAGES: Record<number, { from: 'me' | 'them'; text: string; time: string }[]> = {
  1: [
    { from:'them', text:'Good evening sir, I have a question about the integration chapter.', time:'6:00 PM' },
    { from:'me',   text:'Sure Nimesh, what is your question?', time:'6:05 PM' },
    { from:'them', text:'I don\'t understand how to solve by parts. Can you explain?', time:'6:06 PM' },
    { from:'me',   text:'I will cover that in tomorrow\'s class with examples. Please come prepared!', time:'6:10 PM' },
    { from:'them', text:'Thanks sir, I will attend tomorrow!', time:'6:11 PM' },
  ],
  2: [
    { from:'them', text:'Hello sir, what time does the ICT class start?', time:'5:00 PM' },
    { from:'me',   text:'Class starts at 5:00 PM every Wednesday and Thursday.', time:'5:02 PM' },
    { from:'them', text:'What time does the class start?', time:'5:03 PM' },
  ],
};

export default function MessagesPage() {
  const palette = usePalette();
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState('');
  const [chats, setChats] = useState(MESSAGES);

  const active = CONVERSATIONS.find(c => c.id === activeId)!;
  const msgs   = chats[activeId] || [];

  const sendMsg = () => {
    if (!input.trim()) return;
    setChats(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), { from:'me', text:input.trim(), time:'Now' }] }));
    setInput('');
  };

  return (
    <TutorDashboardLayout title="Messages" subtitle="Chat with your students.">
      <div style={{ display:'flex', gap:20, height:580 }}>

        {/* Sidebar */}
        <div style={{ width:280, background:palette.surface, borderRadius:18, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, overflow:'hidden', flexShrink:0, display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'18px 18px 12px', borderBottom:`1px solid ${palette.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, background:palette.surfaceAlt, borderRadius:10, padding:'8px 12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search messages..." style={{ border:'none', outline:'none', background:'transparent', fontSize:13, color:palette.textSecondary, width:'100%', fontFamily:"'DM Sans',sans-serif" }} />
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {CONVERSATIONS.map(c => (
              <div key={c.id} onClick={() => setActiveId(c.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', cursor:'pointer', background:activeId===c.id?palette.activeBg:palette.surface, borderLeft:`3px solid ${activeId===c.id?'#10B981':'transparent'}`, transition:'all 0.2s' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:`${c.color}20`, color:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16 }}>{c.avatar}</div>
                  {c.unread > 0 && <span style={{ position:'absolute', top:-2, right:-2, width:16, height:16, borderRadius:'50%', background:'#EF4444', color:'white', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.unread}</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:palette.textPrimary }}>{c.name}</p>
                    <span style={{ fontSize:10, color:palette.textMuted }}>{c.time}</span>
                  </div>
                  <p style={{ fontSize:12, color:palette.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.lastMsg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex:1, background:palette.surface, borderRadius:18, boxShadow:palette.shadow, border:`1px solid ${palette.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Chat header */}
          <div style={{ padding:'18px 22px', borderBottom:`1px solid ${palette.border}`, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:`${active.color}20`, color:active.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16 }}>{active.avatar}</div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:palette.textPrimary }}>{active.name}</p>
              <p style={{ fontSize:12, color:'#10B981', fontWeight:600 }}>📚 {active.subject}</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 22px', display:'flex', flexDirection:'column', gap:12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.from==='me'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'70%', background:m.from==='me'?'linear-gradient(135deg,#10B981,#059669)':palette.surfaceAlt, color:m.from==='me'?'white':palette.textPrimary, borderRadius:m.from==='me'?'18px 18px 4px 18px':'18px 18px 18px 4px', padding:'11px 16px', fontSize:14, lineHeight:1.5 }}>
                  <p>{m.text}</p>
                  <p style={{ fontSize:10, marginTop:4, opacity:0.7, textAlign:m.from==='me'?'right':'left' }}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'14px 18px', borderTop:`1px solid ${palette.border}`, display:'flex', gap:10 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && sendMsg()} placeholder="Type a message..." style={{ flex:1, border:`1.5px solid ${palette.border}`, borderRadius:12, padding:'11px 16px', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', color:palette.textSecondary }} />
            <button onClick={sendMsg} style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:12, padding:'0 20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </TutorDashboardLayout>
  );
}
