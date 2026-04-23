"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const SCHEDULE = [
  { day: "MON", times: ["02:30", "08:30"] },
  { day: "TUE", times: ["02:30", "10:30"] },
  { day: "WED", times: ["12:30", "16:30"] },
  { day: "THU", times: ["01:30", "17:30"] },
  { day: "FRI", times: ["02:30"] },
  { day: "SAT", times: ["--"] },
  { day: "SUN", times: ["--"] },
];

const PENDING = [
  { id: 1, name: "Heshan Silva",    subject: "A/L Physics",      avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { id: 2, name: "Amaya Perera",   subject: "A/L ICT",          avatar: "https://randomuser.me/api/portraits/women/22.jpg" },
  { id: 3, name: "Tharindu Weerasinghe", subject: "O/L Maths",  avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
];

const BOOKED = [
  { id: 1, name: "Kasun Jayawardena", subject: "AI ICT Special Coaching", date: "Mon, 14 Oct", time: "4:30 PM", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
  { id: 2, name: "Dilsha Fernando",   subject: "Advanced ICT Theory",     date: "Wed, 16 Oct", time: "6:00 PM", avatar: "https://randomuser.me/api/portraits/women/34.jpg" },
  { id: 3, name: "Ruwan Bandara",     subject: "Practical Lab Session",   date: "Fri, 18 Oct", time: "3:00 PM", avatar: "https://randomuser.me/api/portraits/men/55.jpg" },
];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState<number[]>([]);
  const [declined, setDeclined] = useState<number[]>([]);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --ink:        #0a0f1a;
          --teal:       #0d9488;
          --teal-d:     #0f766e;
          --teal-glow:  rgba(13,148,136,0.18);
          --teal-soft:  #f0fdf9;
          --amber:      #f59e0b;
          --rose:       #f43f5e;
          --indigo:     #6366f1;
          --muted:      #64748b;
          --border:     #e2e8f0;
          --card:       #ffffff;
          --surface:    #f8fafc;
          --font-d:     'Cormorant Garamond', serif;
          --font-b:     'DM Sans', sans-serif;
        }

        .pp-wrap {
          font-family: var(--font-b); background: var(--surface);
          min-height: 100vh; padding-bottom: 60px;
        }

        /* ── STAGGER ENTRANCE ── */
        .pp-section {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .pp-section.vis { opacity: 1; transform: translateY(0); }
        .pp-section:nth-child(1) { transition-delay: 0.05s; }
        .pp-section:nth-child(2) { transition-delay: 0.12s; }
        .pp-section:nth-child(3) { transition-delay: 0.19s; }
        .pp-section:nth-child(4) { transition-delay: 0.26s; }
        .pp-section:nth-child(5) { transition-delay: 0.33s; }
        .pp-section:nth-child(6) { transition-delay: 0.40s; }

        /* ── HEADER BAR ── */
        .pp-header {
          background: linear-gradient(135deg, #042f2e 0%, #134e4a 60%, #0f766e 100%);
          padding: 28px 40px 0; position: relative; overflow: hidden;
        }
        .pp-header-mesh {
          position: absolute; inset: 0; pointer-events: none;
        }
        .pp-header-mesh::before {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(20,184,166,0.25) 0%, transparent 65%);
          top: -200px; right: -100px;
          animation: orb-drift 10s ease-in-out infinite alternate;
        }
        @keyframes orb-drift {
          from { transform: scale(1) translate(0,0); }
          to   { transform: scale(1.2) translate(20px,-15px); }
        }

        .pp-header-top {
          position: relative; display: flex; align-items: flex-start;
          justify-content: space-between; padding-bottom: 24px;
        }
        .pp-header-subject {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #5eead4;
          background: rgba(20,184,166,0.15); border: 1px solid rgba(20,184,166,0.3);
          padding: 4px 12px; border-radius: 100px; display: inline-block; margin-bottom: 10px;
        }
        .pp-header-title {
          font-family: var(--font-d); font-size: clamp(1.6rem,3vw,2.6rem);
          font-weight: 700; color: #fff; letter-spacing: -0.5px; line-height: 1.1;
        }
        .pp-header-sub { color: rgba(255,255,255,0.55); font-size: 0.88rem; margin-top: 6px; }

        .pp-header-actions { display: flex; gap: 10px; flex-shrink: 0; margin-top: 4px; }
        .pp-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 18px; border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.08); font-family: var(--font-b);
          font-size: 0.84rem; font-weight: 600; cursor: pointer; text-decoration: none;
          transition: all 0.25s ease; backdrop-filter: blur(8px);
        }
        .pp-btn-ghost:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.5); transform: translateY(-1px); }
        .pp-btn-solid {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 12px;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          color: white; font-family: var(--font-b);
          font-size: 0.84rem; font-weight: 700; cursor: pointer; text-decoration: none;
          border: none; transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(13,148,136,0.45);
        }
        .pp-btn-solid:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(13,148,136,0.5); opacity: 0.92; }

        /* ── BANNER ── */
        .pp-banner-wrap {
          position: relative; overflow: hidden;
          border-radius: 0 0 0 0; height: 240px;
        }
        .pp-banner-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s ease;
          filter: brightness(0.88) saturate(1.1);
        }
        .pp-banner-wrap:hover img { transform: scale(1.03); }
        .pp-banner-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(4,47,46,0.7) 100%);
        }

        /* ── CONTENT ── */
        .pp-content { max-width: 1100px; margin: 0 auto; padding: 40px 32px; display: flex; flex-direction: column; gap: 36px; }

        /* ── TUTOR INFO CARD ── */
        .pp-info-card {
          background: var(--card); border-radius: 22px; padding: 28px 32px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 20px rgba(13,148,136,0.07);
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
          transition: box-shadow 0.3s;
        }
        .pp-info-card:hover { box-shadow: 0 8px 40px rgba(13,148,136,0.13); }
        .pp-info-left { display: flex; align-items: center; gap: 18px; }
        .pp-avatar-wrap {
          position: relative; flex-shrink: 0;
        }
        .pp-avatar {
          width: 64px; height: 64px; border-radius: 50%; object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 0 0 3px var(--teal), 0 8px 24px rgba(13,148,136,0.3);
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pp-avatar:hover { transform: scale(1.08); }
        .pp-avatar-status {
          position: absolute; bottom: 2px; right: 2px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #22c55e; border: 2.5px solid white;
          animation: status-pulse 2.5s infinite;
        }
        @keyframes status-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0);  }
        }
        .pp-info-name { font-family: var(--font-d); font-size: 1.25rem; font-weight: 700; color: var(--ink); }
        .pp-info-role { font-size: 0.82rem; color: var(--muted); margin-top: 3px; }
        .pp-info-tags { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
        .pp-tag {
          font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 100px;
          letter-spacing: 0.04em;
        }
        .pp-tag.teal   { background: rgba(13,148,136,0.1); color: var(--teal-d); border: 1px solid rgba(13,148,136,0.2); }
        .pp-tag.amber  { background: rgba(245,158,11,0.1); color: #b45309; border: 1px solid rgba(245,158,11,0.25); }
        .pp-tag.indigo { background: rgba(99,102,241,0.08); color: #4338ca; border: 1px solid rgba(99,102,241,0.2); }

        .pp-stats { display: flex; gap: 28px; }
        .pp-stat { text-align: center; }
        .pp-stat-num { font-family: var(--font-d); font-size: 1.5rem; font-weight: 700; color: var(--teal); line-height: 1; }
        .pp-stat-label { font-size: 0.7rem; color: var(--muted); font-weight: 500; margin-top: 2px; letter-spacing: 0.04em; }
        .pp-stat-divider { width: 1px; background: var(--border); align-self: stretch; }

        /* ── SECTION CARD ── */
        .pp-card {
          background: var(--card); border-radius: 22px; padding: 28px 32px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 20px rgba(13,148,136,0.06);
          transition: box-shadow 0.3s;
        }
        .pp-card:hover { box-shadow: 0 8px 40px rgba(13,148,136,0.11); }
        .pp-card-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;
        }
        .pp-card-title {
          font-family: var(--font-d); font-size: 1.25rem; font-weight: 700; color: var(--ink);
          display: flex; align-items: center; gap: 10px;
        }
        .pp-card-title-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--teal);
          box-shadow: 0 0 0 3px rgba(13,148,136,0.2);
        }
        .pp-view-all {
          font-size: 0.8rem; font-weight: 700; color: var(--teal); background: none;
          border: 1.5px solid rgba(13,148,136,0.25); border-radius: 8px;
          padding: 5px 14px; cursor: pointer; transition: all 0.2s;
        }
        .pp-view-all:hover { background: rgba(13,148,136,0.06); border-color: var(--teal); transform: translateY(-1px); }

        /* ── ABOUT ── */
        .pp-about-text { font-size: 0.9rem; color: #334155; line-height: 1.8; }
        .pp-lang-row { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
        .pp-lang-label { font-size: 0.78rem; font-weight: 700; color: var(--muted); }
        .pp-lang-chip {
          font-size: 0.75rem; font-weight: 600; padding: 3px 11px; border-radius: 100px;
          background: rgba(99,102,241,0.08); color: #4338ca; border: 1px solid rgba(99,102,241,0.2);
        }

        /* ── SCHEDULE ── */
        .pp-schedule-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 10px; }
        .pp-day-col {
          background: var(--surface); border-radius: 14px; padding: 14px 10px; text-align: center;
          border: 1.5px solid var(--border);
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pp-day-col:hover:not(.inactive) {
          border-color: var(--teal); background: rgba(13,148,136,0.04);
          transform: translateY(-4px); box-shadow: 0 8px 24px rgba(13,148,136,0.14);
        }
        .pp-day-col.inactive { opacity: 0.45; }
        .pp-day-name {
          font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em;
          color: var(--teal); margin-bottom: 10px; text-transform: uppercase;
        }
        .pp-time-slot {
          font-size: 0.75rem; font-weight: 600; padding: 5px 6px; border-radius: 8px;
          margin-bottom: 5px; background: white; border: 1px solid var(--border); color: var(--ink);
          transition: background 0.2s, color 0.2s;
        }
        .pp-time-slot:hover { background: var(--teal); color: white; border-color: var(--teal); }
        .pp-time-slot.empty { background: transparent; border: 1px dashed var(--border); color: var(--muted); font-size: 0.7rem; }

        /* ── REQUEST CARDS ── */
        .pp-request-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .pp-request-card {
          border: 1.5px solid var(--border); border-radius: 18px; padding: 20px;
          background: white; transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; overflow: hidden;
        }
        .pp-request-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--teal), #34d399);
          transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
        }
        .pp-request-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(13,148,136,0.14); border-color: rgba(13,148,136,0.3); }
        .pp-request-card:hover::before { transform: scaleX(1); }
        .pp-request-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .pp-req-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); transition: transform 0.3s; }
        .pp-request-card:hover .pp-req-avatar { transform: scale(1.08); }
        .pp-req-name { font-size: 0.9rem; font-weight: 700; color: var(--ink); }
        .pp-req-subject { font-size: 0.76rem; color: var(--muted); margin-top: 2px; }
        .pp-req-actions { display: flex; gap: 8px; margin-top: 4px; }
        .pp-accept-btn {
          flex: 1; padding: 8px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--teal), var(--teal-d));
          color: white; font-family: var(--font-b); font-weight: 700; font-size: 0.8rem;
          cursor: pointer; transition: all 0.2s;
        }
        .pp-accept-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(13,148,136,0.4); }
        .pp-decline-btn {
          flex: 1; padding: 8px; border-radius: 10px;
          border: 1.5px solid var(--border); background: transparent;
          color: var(--muted); font-family: var(--font-b); font-weight: 600; font-size: 0.8rem;
          cursor: pointer; transition: all 0.2s;
        }
        .pp-decline-btn:hover { border-color: var(--rose); color: var(--rose); background: rgba(244,63,94,0.04); }
        .pp-accepted-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.76rem; font-weight: 700; color: #15803d;
          background: #dcfce7; padding: 5px 12px; border-radius: 100px; margin-top: 4px;
          border: 1px solid #bbf7d0;
        }
        .pp-declined-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.76rem; font-weight: 700; color: #be123c;
          background: #ffe4e6; padding: 5px 12px; border-radius: 100px; margin-top: 4px;
          border: 1px solid #fecdd3;
        }

        /* ── BOOKED CARDS ── */
        .pp-booked-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .pp-booked-card {
          border: 1.5px solid var(--border); border-radius: 18px; padding: 20px;
          background: white; transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; overflow: hidden;
        }
        .pp-booked-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--indigo), #818cf8);
          transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
        }
        .pp-booked-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(99,102,241,0.13); border-color: rgba(99,102,241,0.3); }
        .pp-booked-card:hover::after { transform: scaleX(1); }
        .pp-booked-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .pp-booked-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border); transition: transform 0.3s; }
        .pp-booked-card:hover .pp-booked-avatar { transform: scale(1.08); }
        .pp-booked-name    { font-size: 0.9rem; font-weight: 700; color: var(--ink); }
        .pp-booked-subject { font-size: 0.76rem; color: var(--muted); margin-top: 2px; }
        .pp-booked-time {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.78rem; font-weight: 600; color: var(--indigo);
          background: rgba(99,102,241,0.07); padding: 6px 12px; border-radius: 8px;
          margin-bottom: 14px; border: 1px solid rgba(99,102,241,0.15);
        }
        .pp-booked-actions { display: flex; gap: 8px; }
        .pp-action-btn {
          flex: 1; padding: 8px; border-radius: 10px;
          border: 1.5px solid var(--border); background: var(--surface);
          color: var(--ink); font-family: var(--font-b); font-weight: 600; font-size: 0.78rem;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .pp-action-btn:hover { border-color: var(--teal); color: var(--teal); background: rgba(13,148,136,0.05); transform: translateY(-1px); }

        @media (max-width: 900px) {
          .pp-request-grid, .pp-booked-grid { grid-template-columns: 1fr 1fr; }
          .pp-schedule-grid { grid-template-columns: repeat(4,1fr); }
          .pp-stats { display: none; }
        }
        @media (max-width: 600px) {
          .pp-header { padding: 20px 20px 0; }
          .pp-content { padding: 24px 16px; }
          .pp-request-grid, .pp-booked-grid { grid-template-columns: 1fr; }
          .pp-schedule-grid { grid-template-columns: repeat(4,1fr); }
          .pp-header-actions { flex-direction: column; gap: 8px; }
          .pp-info-card { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="pp-wrap">

        {/* ── HEADER ── */}
        <div className="pp-header pp-section vis">
          <div className="pp-header-mesh" />
          <div className="pp-header-top">
            <div>
              <span className="pp-header-subject">A/L ICT · Grade 12 & 13</span>
              <h1 className="pp-header-title">Advanced Level : ICT</h1>
              <p className="pp-header-sub">Learn ICT that is guaranteed to impress with fundamentals teaching.</p>
            </div>
            <div className="pp-header-actions">
              <Link href="/dashboard/tutor/profile/edit" className="pp-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </Link>
              <Link href="/dashboard/tutor/post-ad" className="pp-btn-solid">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Post Ad
              </Link>
            </div>
          </div>

          {/* Banner */}
          <div className="pp-banner-wrap">
            <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94" alt="banner" />
            <div className="pp-banner-gradient" />
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="pp-content">

          {/* ── TUTOR INFO ── */}
          <div className={`pp-info-card pp-section${mounted ? " vis" : ""}`}>
            <div className="pp-info-left">
              <div className="pp-avatar-wrap">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" className="pp-avatar" alt="tutor" />
                <div className="pp-avatar-status" />
              </div>
              <div>
                <div className="pp-info-name">Nimesh Dissanayake</div>
                <div className="pp-info-role">BSc(Hons) Computer Science (UCSC) · Software Engineer</div>
                <div className="pp-info-tags">
                  <span className="pp-tag teal">ICT Specialist</span>
                  <span className="pp-tag amber">5+ Years Exp</span>
                  <span className="pp-tag indigo">Online & In-Person</span>
                </div>
              </div>
            </div>
            <div className="pp-stats">
              <div className="pp-stat"><div className="pp-stat-num">4.9</div><div className="pp-stat-label">Rating</div></div>
              <div className="pp-stat-divider" />
              <div className="pp-stat"><div className="pp-stat-num">142</div><div className="pp-stat-label">Students</div></div>
              <div className="pp-stat-divider" />
              <div className="pp-stat"><div className="pp-stat-num">98%</div><div className="pp-stat-label">Success</div></div>
            </div>
          </div>

          {/* ── ABOUT ── */}
          <div className={`pp-card pp-section${mounted ? " vis" : ""}`}>
            <div className="pp-card-header">
              <h3 className="pp-card-title"><span className="pp-card-title-dot"/>About Me</h3>
            </div>
            <p className="pp-about-text">
              An enthusiastic ICT teacher turned software engineer, blending teaching with coding.
              Experienced in simplifying complex concepts and building real-world applications.
              Passionate about empowering the next generation of Sri Lankan tech talent through
              hands-on, practical learning methods.
            </p>
            <div className="pp-lang-row">
              <span className="pp-lang-label">Languages:</span>
              <span className="pp-lang-chip">Sinhala</span>
              <span className="pp-lang-chip">English</span>
            </div>
          </div>

          {/* ── SCHEDULE ── */}
          <div className={`pp-card pp-section${mounted ? " vis" : ""}`}>
            <div className="pp-card-header">
              <h3 className="pp-card-title"><span className="pp-card-title-dot"/>Free Time Slots</h3>
            </div>
            <div className="pp-schedule-grid">
              {SCHEDULE.map((item) => {
                const inactive = item.times[0] === "--";
                return (
                  <div key={item.day} className={`pp-day-col${inactive ? " inactive" : ""}`}>
                    <div className="pp-day-name">{item.day}</div>
                    {item.times.map((t, i) =>
                      t === "--"
                        ? <div key={i} className="pp-time-slot empty">Free</div>
                        : <div key={i} className="pp-time-slot">{t}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── PENDING REQUESTS ── */}
          <div className={`pp-card pp-section${mounted ? " vis" : ""}`}>
            <div className="pp-card-header">
              <h3 className="pp-card-title"><span className="pp-card-title-dot"/>Pending Requests</h3>
              <button className="pp-view-all">View All</button>
            </div>
            <div className="pp-request-grid">
              {PENDING.map((req) => (
                <div key={req.id} className="pp-request-card">
                  <div className="pp-request-top">
                    <img src={req.avatar} className="pp-req-avatar" alt={req.name} />
                    <div>
                      <div className="pp-req-name">{req.name}</div>
                      <div className="pp-req-subject">{req.subject}</div>
                    </div>
                  </div>
                  {accepted.includes(req.id) ? (
                    <div className="pp-accepted-badge">✓ Accepted</div>
                  ) : declined.includes(req.id) ? (
                    <div className="pp-declined-badge">✕ Declined</div>
                  ) : (
                    <div className="pp-req-actions">
                      <button className="pp-accept-btn" onClick={() => setAccepted(p => [...p, req.id])}>Accept</button>
                      <button className="pp-decline-btn" onClick={() => setDeclined(p => [...p, req.id])}>Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── BOOKED STUDENTS ── */}
          <div className={`pp-card pp-section${mounted ? " vis" : ""}`}>
            <div className="pp-card-header">
              <h3 className="pp-card-title"><span className="pp-card-title-dot"/>Currently Booked Students</h3>
              <button className="pp-view-all">View All</button>
            </div>
            <div className="pp-booked-grid">
              {BOOKED.map((b) => (
                <div key={b.id} className="pp-booked-card">
                  <div className="pp-booked-top">
                    <img src={b.avatar} className="pp-booked-avatar" alt={b.name} />
                    <div>
                      <div className="pp-booked-name">{b.name}</div>
                      <div className="pp-booked-subject">{b.subject}</div>
                    </div>
                  </div>
                  <div className="pp-booked-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {b.date} · {b.time}
                  </div>
                  <div className="pp-booked-actions">
                    <button className="pp-action-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Schedule
                    </button>
                    <button className="pp-action-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}