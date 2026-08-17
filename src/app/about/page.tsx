'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, MapPin, Wallet } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { usePalette } from '@/hooks/usePalette';
import { useTheme } from '@/hooks/useTheme';

const VALUES = [
  {
    icon: <Award size={26} color="#059669" strokeWidth={1.8} />,
    title: 'Quality First',
    desc: 'Every tutor on Mentora.lk is manually vetted so students only ever learn from people who actually know their subject.',
    color: '#d1fae5',
  },
  {
    icon: <MapPin size={26} color="#059669" strokeWidth={1.8} />,
    title: 'Access For Everyone',
    desc: 'From Colombo to Jaffna, students anywhere in Sri Lanka can find a tutor nearby or connect online.',
    color: '#a7f3d0',
  },
  {
    icon: <Wallet size={26} color="#059669" strokeWidth={1.8} />,
    title: 'Honest Pricing',
    desc: 'No subscriptions, no hidden platform fees. Students pay tutors directly for the classes they take.',
    color: '#6ee7b7',
  },
];

const STORY_STATS = [
  { n: '1,200+', l: 'Verified Tutors' },
  { n: '25,000+', l: 'Active Students' },
  { n: '50+', l: 'Subjects' },
];

export default function AboutPage() {
  const palette = usePalette();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
        .delay-3 { animation-delay: 0.3s; }

        .section-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #10B981; margin-bottom: 8px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-eyebrow::before { content: ''; display: block; width: 24px; height: 2px; background: #10B981; border-radius: 2px; }

        .section-heading { font-family: 'Playfair Display', serif; font-size: clamp(28px,3.5vw,44px); font-weight: 900; color: ${palette.textPrimary}; line-height: 1.12; }

        .value-card {
          background: ${palette.surface}; border-radius: 22px; padding: 34px 26px;
          border: 1px solid ${palette.border}; box-shadow: ${palette.shadow};
          transition: all 0.32s cubic-bezier(.22,1,.36,1);
        }
        .value-card:hover { transform: translateY(-8px); box-shadow: 0 20px 44px rgba(16,185,129,0.14); border-color: rgba(16,185,129,0.25); }

        .btn-green { background: linear-gradient(135deg,#10B981,#059669); color: white; border: none; border-radius: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; box-shadow: 0 4px 18px rgba(16,185,129,0.38); transition: all 0.25s cubic-bezier(.22,1,.36,1); }
        .btn-green:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(16,185,129,0.45); }
        .btn-outline-green { background: transparent; color: #10B981; border: 2px solid #10B981; border-radius: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.25s cubic-bezier(.22,1,.36,1); }
        .btn-outline-green:hover { background: #10B981; color: white; transform: translateY(-3px); box-shadow: 0 10px 28px rgba(16,185,129,0.35); }

        .blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }

        @media (max-width: 900px) {
          .values-grid { grid-template-columns: 1fr !important; }
          .story-row { grid-template-columns: 1fr !important; }
          .stats-row { grid-template-columns: repeat(3,1fr) !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: palette.bg }}>
        <Navbar scrollY={scrollY} />

        {/* Hero */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '150px 6% 90px', background: 'linear-gradient(135deg,#064E3B 0%,#065F46 50%,#047857 100%)' }}>
          <div className="blob" style={{ width: 600, height: 600, background: 'rgba(16,185,129,0.18)', top: -220, right: -150 }} />
          <div className="blob" style={{ width: 380, height: 380, background: 'rgba(5,150,80,0.12)', bottom: -140, left: -80 }} />
          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 999, padding: '6px 16px', marginBottom: 22 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34D399', letterSpacing: '0.12em' }}>ABOUT MENTORA.LK</span>
            </div>
            <h1 className="fade-up delay-1" style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 'clamp(34px,5vw,58px)', color: 'white', lineHeight: 1.12, marginBottom: 20 }}>
              Helping Sri Lanka's students learn from the <span style={{ color: '#10B981' }}>right tutor</span>
            </h1>
            <p className="fade-up delay-2" style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto' }}>
              Mentora.lk is a tutoring marketplace built to close the gap between students who need help and
              verified tutors who can actually give it — no middlemen, no subscriptions, just real learning.
            </p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
              <path d="M0,30 C480,70 960,0 1440,36 L1440,60 L0,60 Z" fill={palette.bg} />
            </svg>
          </div>
        </section>

        {/* Our story */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '70px 6%' }}>
          <div className="story-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <p className="section-eyebrow">Our Story</p>
              <h2 className="section-heading" style={{ marginBottom: 18 }}>Built by students, for students</h2>
              <p style={{ fontSize: 15, color: palette.textSecondary, lineHeight: 1.85, marginBottom: 16 }}>
                Mentora.lk started as a final-year project by Team Loop 5 at the Faculty of Information Technology,
                University of Moratuwa — built around a simple observation: finding a good, trustworthy tutor in
                Sri Lanka usually comes down to word of mouth.
              </p>
              <p style={{ fontSize: 15, color: palette.textSecondary, lineHeight: 1.85 }}>
                We set out to fix that by putting verified tutor profiles, transparent pricing, and real student
                reviews in one place — so every student, wherever they are in the country, can find the right
                tutor for their subject, schedule and budget.
              </p>
            </div>
            <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.14)' }}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                alt="Students learning together"
                style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>

          <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, marginTop: 64, borderRadius: 20, overflow: 'hidden', background: 'rgba(16,185,129,0.1)' }}>
            {STORY_STATS.map((s, i) => (
              <div key={i} style={{ background: palette.surface, padding: '30px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 900, color: '#10B981', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 13, color: palette.textSecondary, marginTop: 6, fontWeight: 500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section style={{ background: isDark ? 'linear-gradient(160deg,#0F1512 0%,#131A16 60%,#0F1512 100%)' : 'linear-gradient(160deg,#f0fdf4 0%,#ecfdf5 60%,#f8fffe 100%)', padding: '80px 6%' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p className="section-eyebrow" style={{ justifyContent: 'center' }}>What We Stand For</p>
              <h2 className="section-heading">Our Values</h2>
            </div>
            <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
              {VALUES.map((v, i) => (
                <div key={i} className="value-card">
                  <div style={{ width: 58, height: 58, borderRadius: 18, background: `linear-gradient(135deg,${v.color},${v.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, marginBottom: 10, color: palette.textPrimary }}>{v.title}</h3>
                  <p style={{ color: palette.textSecondary, fontSize: 14, lineHeight: 1.75 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 6%', textAlign: 'center' }}>
          <h2 className="section-heading" style={{ marginBottom: 16 }}>Ready to get started?</h2>
          <p style={{ color: palette.textSecondary, fontSize: 15, marginBottom: 30, maxWidth: 480, margin: '0 auto 30px' }}>
            Whether you're looking to learn or looking to teach, Mentora.lk makes it easy to connect.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/classes/search"><button className="btn-green" style={{ padding: '13px 30px', fontSize: 14 }}>Browse Courses</button></Link>
            <Link href="/auth/signup"><button className="btn-outline-green" style={{ padding: '13px 30px', fontSize: 14 }}>Get Started</button></Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
