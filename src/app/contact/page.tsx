'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Plus } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { usePalette } from '@/hooks/usePalette';

const CONTACT_INFO = [
  {
    icon: <Mail size={22} color="#059669" strokeWidth={1.8} />,
    label: 'Email',
    value: 'support@mentora.lk',
    href: 'mailto:support@mentora.lk',
  },
  {
    icon: <Phone size={22} color="#059669" strokeWidth={1.8} />,
    label: 'Phone',
    value: '+94 11 234 5678',
    href: 'tel:+94112345678',
  },
  {
    icon: <MapPin size={22} color="#059669" strokeWidth={1.8} />,
    label: 'Location',
    value: 'Faculty of IT, University of Moratuwa, Sri Lanka',
    href: undefined,
  },
];

const OFFICE_HOURS = [
  { day: 'Monday – Friday', hours: '9:00 AM – 6:00 PM' },
  { day: 'Saturday', hours: '10:00 AM – 2:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
];

const FAQS = [
  {
    q: 'How do I become a tutor on Mentora.lk?',
    a: 'Sign up for a tutor account, complete your profile with your subjects and qualifications, and submit it for verification. Once approved, you can start posting classes.',
  },
  {
    q: 'Is Mentora.lk free to use?',
    a: 'Yes — creating an account and browsing tutors is completely free. There are no subscription fees; you only pay tutors directly for the classes you enroll in.',
  },
  {
    q: 'I found a bug or issue — how do I report it?',
    a: 'Email us at support@mentora.lk with a description of what happened. Screenshots help us fix things faster.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const palette = usePalette();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: palette.shadow }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans',sans-serif" }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary }}>{q}</span>
        <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: open ? '#10B981' : palette.surfaceAlt, color: open ? 'white' : palette.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>
          <Plus size={13} strokeWidth={2.5} />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 22px 20px' }}>
          <p style={{ fontSize: 14, color: palette.textSecondary, lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const palette = usePalette();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: ${palette.bg}; color: ${palette.textPrimary}; overflow-x: hidden; transition: background 0.25s ease; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #10B981; border-radius: 999px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }

        .section-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #10B981; margin-bottom: 8px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-eyebrow::before { content: ''; display: block; width: 24px; height: 2px; background: #10B981; border-radius: 2px; }
        .section-heading { font-family: 'Playfair Display', serif; font-size: clamp(26px,3.2vw,38px); font-weight: 900; color: ${palette.textPrimary}; line-height: 1.15; }

        .info-card {
          background: ${palette.surface}; border: 1px solid ${palette.border}; border-radius: 20px;
          padding: 28px 24px; text-align: center; box-shadow: ${palette.shadow};
          transition: all 0.28s cubic-bezier(.22,1,.36,1);
        }
        .info-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(16,185,129,0.14); border-color: rgba(16,185,129,0.25); }

        .btn-green { background: linear-gradient(135deg,#10B981,#059669); color: white; border: none; border-radius: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 4px 18px rgba(16,185,129,0.38); transition: all 0.25s cubic-bezier(.22,1,.36,1); }
        .btn-green:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(16,185,129,0.45); }
        .btn-outline-green { background: transparent; color: #10B981; border: 2px solid #10B981; border-radius: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.25s cubic-bezier(.22,1,.36,1); }
        .btn-outline-green:hover { background: #10B981; color: white; transform: translateY(-3px); box-shadow: 0 10px 28px rgba(16,185,129,0.35); }

        .blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @media (max-width: 900px) {
          .info-grid { grid-template-columns: 1fr !important; }
          .hours-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: palette.bg }}>
        <Navbar scrollY={scrollY} />

        {/* Hero */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '150px 6% 80px', background: 'linear-gradient(135deg,#064E3B 0%,#065F46 50%,#047857 100%)' }}>
          <div className="blob" style={{ width: 600, height: 600, background: 'rgba(16,185,129,0.18)', top: -220, right: -150 }} />
          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 999, padding: '6px 16px', marginBottom: 22 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34D399', letterSpacing: '0.12em' }}>GET IN TOUCH</span>
            </div>
            <h1 className="fade-up delay-1" style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 'clamp(32px,4.5vw,50px)', color: 'white', lineHeight: 1.15, marginBottom: 18 }}>
              We'd love to <span style={{ color: '#10B981' }}>hear from you</span>
            </h1>
            <p className="fade-up delay-2" style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
              Questions, feedback, or need help with your account? Reach out through any of the channels below.
            </p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
              <path d="M0,30 C480,70 960,0 1440,36 L1440,60 L0,60 Z" fill={palette.bg} />
            </svg>
          </div>
        </section>

        {/* Contact info cards */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '70px 6% 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="section-eyebrow" style={{ justifyContent: 'center' }}>Contact Info</p>
            <h2 className="section-heading">Reach out anytime</h2>
          </div>

          <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {CONTACT_INFO.map((c) => (
              <div key={c.label} className="info-card">
                <div style={{ width: 54, height: 54, borderRadius: 16, background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {c.icon}
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: palette.textMuted, marginBottom: 8 }}>{c.label}</p>
                {c.href ? (
                  <a href={c.href} style={{ fontSize: 15, fontWeight: 700, color: palette.textPrimary }}>{c.value}</a>
                ) : (
                  <p style={{ fontSize: 14, fontWeight: 600, color: palette.textPrimary, lineHeight: 1.5 }}>{c.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Office hours */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '50px 6%' }}>
          <div style={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 22, padding: '32px 36px', boxShadow: palette.shadow, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={22} color="#059669" strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: palette.textPrimary, marginBottom: 4 }}>Support Hours</h3>
              <p style={{ fontSize: 13, color: palette.textMuted }}>We typically reply to emails within one business day.</p>
            </div>
            <div className="hours-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,auto)', gap: 24 }}>
              {OFFICE_HOURS.map(h => (
                <div key={h.day}>
                  <p style={{ fontSize: 12, color: palette.textMuted, marginBottom: 3 }}>{h.day}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: palette.textPrimary }}>{h.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '50px 6% 90px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p className="section-eyebrow" style={{ justifyContent: 'center' }}>Common Questions</p>
            <h2 className="section-heading">Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '0 6% 90px', textAlign: 'center' }}>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>Still have questions?</h2>
          <p style={{ color: palette.textSecondary, fontSize: 15, marginBottom: 28, maxWidth: 460, margin: '0 auto 28px' }}>
            Email us directly and our team will get back to you as soon as possible.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:support@mentora.lk"><button className="btn-green" style={{ padding: '13px 30px', fontSize: 14 }}>Email Us</button></a>
            <Link href="/classes/search"><button className="btn-outline-green" style={{ padding: '13px 30px', fontSize: 14 }}>Browse Courses</button></Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
