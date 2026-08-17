"use client";

import React, { useState, useEffect, useRef } from "react";
import { Target, Eye, BookOpen, MapPin, Mail, Phone, Clock, Check, Send } from "lucide-react";

const STATS = [
  { num: "15,000+", label: "Students Empowered" },
  { num: "1,200+",  label: "Expert Tutors" },
  { num: "98%",     label: "Success Rate" },
  { num: "25+",     label: "Subjects Covered" },
];

const PILLARS = [
  {
    icon: (
      <Target size={26} strokeWidth={1.8} />
    ),
    color: "#0d9488",
    bg: "rgba(13,148,136,0.1)",
    title: "Our Mission",
    desc: "To democratize access to high-quality education by connecting learners with skilled tutors across every corner of Sri Lanka.",
  },
  {
    icon: (
      <Eye size={26} strokeWidth={1.8} />
    ),
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    title: "Our Vision",
    desc: "To become the leading digital education hub in South Asia, fostering innovation, excellence and lifelong learning.",
  },
  {
    icon: (
      <BookOpen size={26} strokeWidth={1.8} />
    ),
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    title: "Our Story",
    desc: "Founded by educators and tech enthusiasts with a simple goal: make finding the right tutor effortless and affordable for every student.",
  },
];

const CONTACT_INFO = [
  {
    icon: (
      <MapPin size={20} strokeWidth={2} />
    ),
    color: "#0d9488",
    label: "Colombo HQ",
    value: "123 Galle Road, Colombo 03",
  },
  {
    icon: (
      <Mail size={20} strokeWidth={2} />
    ),
    color: "#6366f1",
    label: "Email Us",
    value: "support@mentora.lk",
  },
  {
    icon: (
      <Phone size={20} strokeWidth={2} />
    ),
    color: "#f59e0b",
    label: "Phone",
    value: "+94 77 123 4567",
  },
  {
    icon: (
      <Clock size={20} strokeWidth={2} />
    ),
    color: "#22c55e",
    label: "Support Hours",
    value: "Mon – Fri, 8 AM – 8 PM",
  },
];

const FEATURES = [
  "Verified professional tutors",
  "Flexible learning schedules",
  "Affordable pricing for all",
  "Real-time progress tracking",
];

export default function ContactClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !counted) setCounted(true); },
      { threshold: 0.3 }
    );
    if (counterRef.current) obs.observe(counterRef.current);
    return () => obs.disconnect();
  }, [counted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Mulish:wght@400;500;600;700&display=swap');

        :root {
          --teal:    #0d9488;
          --teal-d:  #0f766e;
          --teal-g:  rgba(13,148,136,0.14);
          --indigo:  #6366f1;
          --amber:   #f59e0b;
          --ink:     #0c1420;
          --muted:   #64748b;
          --border:  #e2e8f0;
          --surface: #f8fafb;
          --white:   #ffffff;
          --font-d:  'Playfair Display', serif;
          --font-b:  'Mulish', sans-serif;
        }

        .cc-wrap { font-family: var(--font-b); background: var(--surface); min-height: 100vh; overflow-x: hidden; }

        /* ══ HERO ══ */
        .cc-hero {
          position: relative; overflow: hidden; min-height: 560px;
          display: flex; align-items: center;
          background: linear-gradient(135deg, #042f2e 0%, #0f4c44 45%, #134e4a 100%);
          padding: 100px 60px 80px;
        }
        .cc-hero-orb1 {
          position: absolute; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 65%);
          top: -200px; right: -150px; pointer-events: none;
          animation: orb-float 12s ease-in-out infinite alternate;
        }
        .cc-hero-orb2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%);
          bottom: -150px; left: -80px; pointer-events: none;
          animation: orb-float 9s ease-in-out infinite alternate-reverse;
        }
        @keyframes orb-float {
          from { transform: scale(1) translate(0,0); }
          to   { transform: scale(1.18) translate(25px,-18px); }
        }
        .cc-hero-grid {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .cc-hero-inner { position: relative; max-width: 1100px; margin: 0 auto; width: 100%; }
        .cc-hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: #5eead4; background: rgba(20,184,166,0.14); border: 1px solid rgba(20,184,166,0.3);
          padding: 5px 16px; border-radius: 100px; margin-bottom: 20px;
        }
        .cc-hero-pill span { width: 5px; height: 5px; background: #2dd4bf; border-radius: 50%; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .cc-hero h1 {
          font-family: var(--font-d); font-size: clamp(2.4rem,5vw,4rem);
          font-weight: 900; color: white; line-height: 1.08; letter-spacing: -1.5px;
          max-width: 680px;
        }
        .cc-hero h1 em { font-style: italic; color: #2dd4bf; }
        .cc-hero-sub { color: rgba(255,255,255,0.58); font-size: 1rem; line-height: 1.7; margin-top: 16px; max-width: 520px; }

        /* ── STATS BAND ── */
        .cc-stats-band {
          background: white; border-bottom: 1px solid var(--border);
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
        }
        .cc-stats-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 40px;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .cc-stat-item {
          padding: 28px 20px; text-align: center; position: relative;
          transition: background 0.3s;
        }
        .cc-stat-item:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 20%; bottom: 20%;
          width: 1px; background: var(--border);
        }
        .cc-stat-item:hover { background: rgba(13,148,136,0.03); }
        .cc-stat-num {
          font-family: var(--font-d); font-size: 2rem; font-weight: 900;
          color: var(--teal); line-height: 1;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .cc-stat-num.show { opacity: 1; transform: translateY(0); }
        .cc-stat-num:nth-child(1) { transition-delay: 0s; }
        .cc-stat-num:nth-child(2) { transition-delay: 0.1s; }
        .cc-stat-num:nth-child(3) { transition-delay: 0.2s; }
        .cc-stat-num:nth-child(4) { transition-delay: 0.3s; }
        .cc-stat-label { font-size: 0.75rem; font-weight: 600; color: var(--muted); margin-top: 4px; letter-spacing: 0.04em; }

        /* ── SECTIONS ── */
        .cc-section { max-width: 1100px; margin: 0 auto; padding: 80px 40px; }
        .cc-section-eyebrow {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--teal); margin-bottom: 10px;
        }
        .cc-section-title {
          font-family: var(--font-d); font-size: clamp(2rem,4vw,3rem);
          font-weight: 900; color: var(--ink); letter-spacing: -1px; line-height: 1.1;
        }
        .cc-section-title em { font-style: italic; color: var(--teal); }

        /* ── PILLARS ── */
        .cc-pillars { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; margin-top: 44px; }
        .cc-pillar {
          background: white; border-radius: 22px; padding: 32px 28px;
          border: 1px solid var(--border);
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.3s;
          position: relative; overflow: hidden;
        }
        .cc-pillar:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 60px rgba(0,0,0,0.09);
        }
        .cc-pillar-icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cc-pillar:hover .cc-pillar-icon { transform: scale(1.12) rotate(-4deg); }
        .cc-pillar-title { font-family: var(--font-d); font-size: 1.15rem; font-weight: 700; color: var(--ink); margin-bottom: 10px; }
        .cc-pillar-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.75; }

        /* ── SPLIT ── */
        .cc-split { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-top: 80px; }
        .cc-split-img-wrap {
          position: relative; border-radius: 24px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.14);
        }
        .cc-split-img-wrap img {
          width: 100%; height: 420px; object-fit: cover; display: block;
          transition: transform 0.6s ease; filter: saturate(1.05);
        }
        .cc-split-img-wrap:hover img { transform: scale(1.04); }
        .cc-split-img-badge {
          position: absolute; bottom: 20px; left: 20px;
          background: linear-gradient(135deg, var(--teal), var(--teal-d));
          color: white; font-family: var(--font-d); font-size: 1.2rem; font-weight: 700;
          padding: 12px 20px; border-radius: 14px;
          box-shadow: 0 8px 24px rgba(13,148,136,0.4);
        }
        .cc-split-img-badge span { font-size: 0.7rem; font-family: var(--font-b); font-weight: 600; display: block; opacity: 0.8; }
        .cc-split-text h2 {
          font-family: var(--font-d); font-size: clamp(1.7rem,3vw,2.4rem); font-weight: 900;
          color: var(--ink); letter-spacing: -0.8px; line-height: 1.2;
        }
        .cc-split-text h2 em { font-style: italic; color: var(--teal); }
        .cc-split-text p { font-size: 0.9rem; color: var(--muted); line-height: 1.8; margin-top: 14px; }
        .cc-features { margin-top: 22px; display: flex; flex-direction: column; gap: 10px; }
        .cc-feature {
          display: flex; align-items: center; gap: 12px; font-size: 0.875rem; font-weight: 600; color: var(--ink);
          padding: 10px 14px; border-radius: 12px; background: white; border: 1.5px solid var(--border);
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cc-feature:hover { border-color: var(--teal); background: rgba(13,148,136,0.04); transform: translateX(4px); }
        .cc-feature-check {
          width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, var(--teal), var(--teal-d));
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          box-shadow: 0 3px 8px rgba(13,148,136,0.35);
        }

        /* ══ CONTACT DIVIDER ══ */
        .cc-contact-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 80px 40px; text-align: center; position: relative; overflow: hidden;
        }
        .cc-contact-hero-inner { position: relative; }
        .cc-contact-hero h2 {
          font-family: var(--font-d); font-size: clamp(2rem,4vw,3.2rem);
          font-weight: 900; color: white; letter-spacing: -1px;
        }
        .cc-contact-hero h2 em { font-style: italic; color: #2dd4bf; }
        .cc-contact-hero p { color: rgba(255,255,255,0.5); font-size: 1rem; margin-top: 12px; }

        /* ══ CONTACT SECTION ══ */
        .cc-contact-section { max-width: 1100px; margin: 0 auto; padding: 64px 40px 80px; display: grid; grid-template-columns: 1fr 1.5fr; gap: 44px; align-items: start; }

        .cc-info-list { display: flex; flex-direction: column; gap: 14px; }
        .cc-info-card {
          background: white; border-radius: 18px; padding: 18px 20px;
          border: 1.5px solid var(--border); display: flex; align-items: center; gap: 16px;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cc-info-card:hover { transform: translateX(6px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
        .cc-info-icon {
          width: 46px; height: 46px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .cc-info-card:hover .cc-info-icon { transform: scale(1.12) rotate(-5deg); }
        .cc-info-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
        .cc-info-value { font-size: 0.9rem; font-weight: 600; color: var(--ink); margin-top: 3px; }

        .cc-form-card {
          background: white; border-radius: 24px; padding: 36px;
          border: 1px solid var(--border); box-shadow: 0 4px 40px rgba(13,148,136,0.08);
        }
        .cc-form-title { font-family: var(--font-d); font-size: 1.5rem; font-weight: 700; color: var(--ink); margin-bottom: 28px; }
        .cc-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .cc-field { position: relative; margin-bottom: 14px; }
        .cc-label {
          display: block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 6px;
        }
        .cc-input, .cc-textarea {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 1.5px solid var(--border); background: #f9fffe;
          font-family: var(--font-b); font-size: 0.9rem; color: var(--ink);
          outline: none; transition: border-color 0.25s, box-shadow 0.25s, background 0.2s;
          resize: none;
        }
        .cc-input:focus, .cc-textarea:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(13,148,136,0.14);
          background: white;
        }
        .cc-textarea { height: 120px; }
        .cc-submit {
          width: 100%; margin-top: 20px; padding: 14px;
          background: linear-gradient(135deg, var(--teal), var(--teal-d));
          border: none; border-radius: 14px; color: white;
          font-family: var(--font-b); font-weight: 700; font-size: 0.92rem;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .cc-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(13,148,136,0.45); }
        .cc-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .cc-success {
          text-align: center; padding: 32px 20px;
        }
        .cc-success-icon {
          width: 68px; height: 68px; border-radius: 50%; margin: 0 auto 16px;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(34,197,94,0.3);
        }
        .cc-success-title { font-family: var(--font-d); font-size: 1.4rem; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .cc-success-sub { font-size: 0.875rem; color: var(--muted); }

        .cc-spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cc-wrap">

        {/* ══ HERO ══ */}
        <section className="cc-hero">
          <div className="cc-hero-grid" />
          <div className="cc-hero-orb1" />
          <div className="cc-hero-orb2" />
          <div className="cc-hero-inner">
            <div className="cc-hero-pill"><span />About Mentora.lk</div>
            <h1>Empowering Education<br />Across <em>Sri Lanka</em></h1>
            <p className="cc-hero-sub">
              Mentora is more than a marketplace — it's a movement to bridge the gap between
              passion and knowledge, connecting students with the finest educators across the island.
            </p>
          </div>
        </section>

        {/* ══ STATS BAND ══ */}
        <div className="cc-stats-band" ref={counterRef}>
          <div className="cc-stats-inner">
            {STATS.map((s, i) => (
              <div className="cc-stat-item" key={s.label} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={`cc-stat-num${counted ? " show" : ""}`} style={{ transitionDelay: `${i * 0.12}s` }}>{s.num}</div>
                <div className="cc-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ ABOUT SECTION ══ */}
        <div className="cc-section">
          <p className="cc-section-eyebrow">Who We Are</p>
          <h2 className="cc-section-title">Built by educators,<br />powered by <em>passion</em></h2>

          {/* Pillars */}
          <div className="cc-pillars">
            {PILLARS.map((p) => (
              <div className="cc-pillar" key={p.title}>
                <div className="cc-pillar-icon" style={{ background: p.bg, color: p.color }}>
                  {p.icon}
                </div>
                <div className="cc-pillar-title">{p.title}</div>
                <div className="cc-pillar-desc">{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Split */}
          <div className="cc-split">
            <div className="cc-split-img-wrap">
              <img src="/teacher.jpg" alt="Teaching" />
              <div className="cc-split-img-badge">
                98% <span>Success Rate</span>
              </div>
            </div>
            <div className="cc-split-text">
              <p className="cc-section-eyebrow">Why Mentora</p>
              <h2>Building the future of <em>E-Learning in Sri Lanka</em></h2>
              <p>
                In a rapidly changing world, traditional classrooms are no longer enough.
                We provide a space where curiosity meets expertise — anytime, anywhere across the island.
              </p>
              <div className="cc-features">
                {FEATURES.map((f) => (
                  <div className="cc-feature" key={f}>
                    <div className="cc-feature-check">
                      <Check size={12} color="white" strokeWidth={3} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ CONTACT DIVIDER ══ */}
        <div className="cc-contact-hero">
          <div className="cc-contact-hero-inner">
            <p className="cc-section-eyebrow" style={{ color: "#5eead4" }}>Get In Touch</p>
            <h2>Contact <em>Us</em></h2>
            <p>Have questions about our platform? We're here to help you — anytime.</p>
          </div>
        </div>

        {/* ══ CONTACT SECTION ══ */}
        <div className="cc-contact-section">

          {/* Info Cards */}
          <div>
            <p className="cc-section-eyebrow" style={{ marginBottom: 18 }}>Contact Information</p>
            <div className="cc-info-list">
              {CONTACT_INFO.map((c) => (
                <div className="cc-info-card" key={c.label}>
                  <div className="cc-info-icon" style={{ background: `${c.color}15`, color: c.color }}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="cc-info-label">{c.label}</div>
                    <div className="cc-info-value">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="cc-form-card">
            {sent ? (
              <div className="cc-success">
                <div className="cc-success-icon">
                  <Check size={30} color="#16a34a" strokeWidth={2.5} />
                </div>
                <div className="cc-success-title">Message Sent!</div>
                <div className="cc-success-sub">Thank you for reaching out. We'll get back to you within 24 hours.</div>
                <button
                  onClick={() => setSent(false)}
                  style={{ marginTop: 20, padding: "8px 22px", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-b)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", color: "var(--ink)", transition: "all 0.2s" }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <div className="cc-form-title">Send a Message</div>
                <form onSubmit={handleSubmit}>
                  <div className="cc-form-row">
                    <div>
                      <label className="cc-label">Full Name</label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="cc-input" required />
                    </div>
                    <div>
                      <label className="cc-label">Email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className="cc-input" required />
                    </div>
                  </div>
                  <div className="cc-field">
                    <label className="cc-label">Subject</label>
                    <input name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" className="cc-input" required />
                  </div>
                  <div className="cc-field">
                    <label className="cc-label">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us more about your question or feedback…" className="cc-textarea" required />
                  </div>
                  <button type="submit" className="cc-submit" disabled={sending}>
                    {sending ? (
                      <><div className="cc-spinner" /> Sending…</>
                    ) : (
                      <>Send Message
                        <Send size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}