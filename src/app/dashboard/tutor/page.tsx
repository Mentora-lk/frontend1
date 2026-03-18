"use client";

import React, { useState, useEffect, useRef } from "react";
import { classes } from "@/data/dummyClasses";
import ClassCard from "@/components/cards/ClassCard";

const AVAILABILITY_OPTIONS = ["Weekdays", "Weekends", "Morning", "Evening", "Online"];
const SUBJECTS = ["Physics", "ICT", "IT", "Music", "Mathematics", "English"];
const SORT_OPTIONS = ["Most Popular", "Lowest Price", "Highest Rated", "Newest"];

export default function TutorHomePage() {
  const [search, setSearch]           = useState("");
  const [subject, setSubject]         = useState("");
  const [price, setPrice]             = useState(5000);
  const [rating, setRating]           = useState(0);
  const [availability, setAvailability] = useState<string[]>([]);
  const [sort, setSort]               = useState("Most Popular");
  const [mounted, setMounted]         = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredClasses = classes.filter((cls) => {
    return (
      cls.title.toLowerCase().includes(search.toLowerCase()) &&
      (subject ? cls.subject === subject : true) &&
      cls.price <= price &&
      cls.rating >= rating &&
      (availability.length > 0
        ? availability.some((a) => cls.availability.includes(a))
        : true)
    );
  });

  const toggleAvailability = (value: string) => {
    setAvailability((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSearch(""); setSubject(""); setPrice(5000); setRating(0); setAvailability([]);
  };

  const activeFilterCount = [
    subject,
    rating > 0,
    availability.length > 0,
    price < 5000,
  ].filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=Outfit:wght@400;500;600;700&display=swap');

        :root {
          --ink:        #0c1015;
          --teal:       #0d9488;
          --teal-light: #14b8a6;
          --teal-glow:  rgba(13,148,136,0.22);
          --amber:      #f59e0b;
          --surface:    #f0faf9;
          --card:       #ffffff;
          --muted:      #64748b;
          --border:     #e2eeec;
          --font-d:     'Fraunces', serif;
          --font-b:     'Outfit', sans-serif;
        }

        .th-wrap { font-family: var(--font-b); background: var(--surface); min-height: 100vh; }

        /* ── HERO ── */
        .th-hero-outer {
          position: relative; overflow: hidden; height: 340px;
          display: flex; align-items: center; justify-content: center;
        }
        .th-hero-bg {
          position: absolute; inset: -60px; will-change: transform;
          background: url('/banner.jpg') center/cover no-repeat;
        }
        .th-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(160deg,
            rgba(4,47,46,0.93)   0%,
            rgba(13,148,136,0.82) 60%,
            rgba(6,78,59,0.9)    100%);
        }
        .th-hero-mesh { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .th-hero-mesh::before {
          content: '';
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 65%);
          top: -200px; right: -100px;
          animation: mesh-drift 8s ease-in-out infinite alternate;
        }
        .th-hero-mesh::after {
          content: '';
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 65%);
          bottom: -150px; left: 5%;
          animation: mesh-drift 11s ease-in-out infinite alternate-reverse;
        }
        @keyframes mesh-drift {
          from { transform: scale(1) translate(0,0); }
          to   { transform: scale(1.15) translate(30px,-20px); }
        }

        .th-hero-content {
          position: relative; text-align: center; padding: 0 20px;
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .th-hero-content.visible { opacity: 1; transform: translateY(0); }

        .th-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #5eead4;
          background: rgba(20,184,166,0.15); border: 1px solid rgba(20,184,166,0.35);
          padding: 5px 14px; border-radius: 100px; margin-bottom: 14px;
        }
        .th-hero-eyebrow span {
          width: 6px; height: 6px; background: #2dd4bf; border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1);   }
          50%     { opacity:0.4; transform:scale(1.4); }
        }

        .th-hero-title {
          font-family: var(--font-d); color: #fff; line-height: 1.08;
          font-size: clamp(2rem,5vw,3.2rem); font-weight: 900; letter-spacing: -1.5px;
          margin-bottom: 8px;
        }
        .th-hero-title em { font-style: italic; color: #2dd4bf; }
        .th-hero-sub { color: rgba(255,255,255,0.6); font-size: 0.95rem; margin-bottom: 28px; }

        .th-search-bar {
          display: flex; max-width: 540px; margin: 0 auto;
          background: rgba(255,255,255,0.96); border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(20,184,166,0.2);
          overflow: hidden; transition: box-shadow 0.3s ease;
        }
        .th-search-bar:focus-within {
          box-shadow: 0 24px 70px rgba(0,0,0,0.3), 0 0 0 2px var(--teal-light);
        }
        .th-search-input {
          flex: 1; padding: 15px 18px; border: none; outline: none;
          font-family: var(--font-b); font-size: 0.9rem; color: var(--ink);
          background: transparent;
        }
        .th-search-input::placeholder { color: #94a3b8; }
        .th-search-btn {
          background: linear-gradient(135deg, var(--teal), #0f766e);
          border: none; color: white; padding: 15px 24px; cursor: pointer;
          font-family: var(--font-b); font-weight: 700; font-size: 0.88rem;
          display: flex; align-items: center; gap: 8px;
          transition: opacity 0.2s, transform 0.15s;
        }
        .th-search-btn:hover  { opacity: 0.88; transform: scale(1.02); }
        .th-search-btn:active { transform: scale(0.98); }

        /* ── LAYOUT ── */
        .th-main {
          max-width: 1300px; margin: 0 auto; padding: 44px 32px;
          display: grid; grid-template-columns: 272px 1fr; gap: 28px;
        }

        /* ── FILTER ── */
        .th-filter {
          background: var(--card); border-radius: 20px; padding: 28px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 16px rgba(13,148,136,0.06);
          height: fit-content; position: sticky; top: 20px;
          animation: slide-in-left 0.5s ease both;
        }
        @keyframes slide-in-left {
          from { opacity:0; transform: translateX(-20px); }
          to   { opacity:1; transform: translateX(0);     }
        }

        .th-filter-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 26px;
        }
        .th-filter-title { font-family: var(--font-d); font-size: 1.1rem; font-weight: 700; color: var(--ink); }
        .th-filter-badge {
          background: var(--teal); color: white;
          font-size: 0.7rem; font-weight: 700;
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .th-filter-badge:hover { transform: scale(1.2); }

        .th-filter-section { margin-bottom: 22px; }
        .th-filter-label {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 8px; display: block;
        }

        .th-select {
          width: 100%; padding: 10px 14px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-b); font-size: 0.875rem; color: var(--ink);
          background: #f8fffe; outline: none; appearance: none; cursor: pointer;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .th-select:focus { border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-glow); }

        .th-price-display {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 8px;
        }
        .th-price-val { font-family: var(--font-d); font-size: 1.1rem; font-weight: 700; color: var(--teal); }
        .th-range { width: 100%; height: 4px; accent-color: var(--teal); cursor: pointer; border-radius: 4px; }

        .th-rating-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .th-rating-chip {
          padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
          border: 1.5px solid var(--border); background: #f8fffe; cursor: pointer;
          color: var(--muted); transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .th-rating-chip:hover { border-color: var(--teal); color: var(--teal); transform: translateY(-2px); }
        .th-rating-chip.active {
          background: #fef3c7; border-color: var(--amber); color: #92400e;
          transform: translateY(-2px); box-shadow: 0 4px 10px rgba(245,158,11,0.2);
        }

        .th-avail-chips { display: flex; flex-direction: column; gap: 7px; }
        .th-avail-chip {
          display: flex; align-items: center; gap: 10px; padding: 8px 12px;
          border-radius: 9px; border: 1.5px solid var(--border); cursor: pointer;
          font-size: 0.855rem; font-weight: 500; color: var(--ink);
          background: #f8fffe; transition: all 0.22s ease;
        }
        .th-avail-chip:hover  { border-color: var(--teal); background: rgba(13,148,136,0.04); }
        .th-avail-chip.active { border-color: var(--teal); background: rgba(13,148,136,0.08); color: #0f766e; font-weight: 600; }
        .th-avail-chip input  { accent-color: var(--teal); width: 14px; height: 14px; pointer-events: none; }

        .th-clear-btn {
          width: 100%; padding: 11px; border-radius: 11px;
          font-family: var(--font-b); font-size: 0.85rem; font-weight: 700; cursor: pointer;
          background: #fef2f2; color: #b91c1c;
          border: 1.5px solid #fecaca; transition: all 0.25s ease;
        }
        .th-clear-btn:hover {
          background: #fee2e2; border-color: #f87171;
          transform: translateY(-1px); box-shadow: 0 4px 12px rgba(185,28,28,0.12);
        }

        /* ── CARDS AREA ── */
        .th-cards-area { animation: fade-up 0.5s ease 0.1s both; }
        @keyframes fade-up {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0);    }
        }

        .th-cards-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .th-cards-title { font-family: var(--font-d); font-size: 1.5rem; font-weight: 700; color: var(--ink); }
        .th-cards-meta  { display: flex; align-items: center; gap: 10px; }

        .th-count-badge {
          font-size: 0.78rem; font-weight: 700;
          background: rgba(13,148,136,0.1); color: var(--teal);
          padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(13,148,136,0.2);
        }
        .th-sort-select {
          padding: 8px 14px; border: 1.5px solid var(--border); border-radius: 10px;
          font-family: var(--font-b); font-size: 0.82rem; font-weight: 600;
          color: var(--ink); background: white; outline: none; cursor: pointer;
          transition: border-color 0.2s;
        }
        .th-sort-select:focus { border-color: var(--teal); }

        .th-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }

        /* ── EMPTY STATE ── */
        .th-empty {
          grid-column: 1/-1; text-align: center; padding: 80px 20px;
          animation: fade-up 0.4s ease both;
        }
        .th-empty-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(13,148,136,0.08);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .th-empty-title { font-family: var(--font-d); font-size: 1.3rem; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
        .th-empty-sub   { font-size: 0.875rem; color: var(--muted); }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) { .th-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 768px) {
          .th-main { grid-template-columns: 1fr; padding: 24px 16px; }
          .th-filter { display: none; }
          .th-grid { grid-template-columns: 1fr 1fr; }
          .th-hero-outer { height: 280px; }
        }
        @media (max-width: 480px) { .th-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="th-wrap">

        {/* ── HERO ── */}
        <div className="th-hero-outer">
          <div className="th-hero-bg" ref={heroRef} />
          <div className="th-hero-overlay" />
          <div className="th-hero-mesh" />

          <div className={`th-hero-content${mounted ? " visible" : ""}`}>
            <div className="th-hero-eyebrow">
              <span />
              Tutor Dashboard
            </div>
            <h1 className="th-hero-title">
              Discover <em>Amazing</em> Classes
            </h1>
            <p className="th-hero-sub">
              Find the perfect class for your learning journey
            </p>

            <div className="th-search-bar">
              <input
                className="th-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by class, subject, or tutor name…"
              />
              <button className="th-search-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="th-main">

          {/* ── FILTER ── */}
          <aside className="th-filter">
            <div className="th-filter-header">
              <h2 className="th-filter-title">Filters</h2>
              {activeFilterCount > 0 && (
                <div className="th-filter-badge">{activeFilterCount}</div>
              )}
            </div>

            {/* Subject */}
            <div className="th-filter-section">
              <span className="th-filter-label">Subject</span>
              <select
                className="th-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Price */}
            <div className="th-filter-section">
              <div className="th-price-display">
                <span className="th-filter-label" style={{ marginBottom: 0 }}>Max Price</span>
                <span className="th-price-val">Rs. {price.toLocaleString()}</span>
              </div>
              <input
                type="range" min="0" max="5000" value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="th-range"
              />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.72rem", color:"var(--muted)", marginTop:"4px" }}>
                <span>Rs. 0</span><span>Rs. 5,000</span>
              </div>
            </div>

            {/* Rating */}
            <div className="th-filter-section">
              <span className="th-filter-label">Minimum Rating</span>
              <div className="th-rating-chips">
                {[
                  { label: "All",    val: 0   },
                  { label: "4.0+ ⭐", val: 4   },
                  { label: "4.5+ ⭐", val: 4.5 },
                  { label: "5.0 ⭐",  val: 5   },
                ].map((r) => (
                  <button
                    key={r.val}
                    className={`th-rating-chip${rating === r.val ? " active" : ""}`}
                    onClick={() => setRating(r.val)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="th-filter-section">
              <span className="th-filter-label">Availability</span>
              <div className="th-avail-chips">
                {AVAILABILITY_OPTIONS.map((a) => (
                  <label
                    key={a}
                    className={`th-avail-chip${availability.includes(a) ? " active" : ""}`}
                    onClick={() => toggleAvailability(a)}
                  >
                    <input type="checkbox" readOnly checked={availability.includes(a)} />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <button className="th-clear-btn" onClick={clearFilters}>
              ✕ Clear All Filters
            </button>
          </aside>

          {/* ── CARDS ── */}
          <div className="th-cards-area">
            <div className="th-cards-header">
              <h2 className="th-cards-title">Available Classes</h2>
              <div className="th-cards-meta">
                <span className="th-count-badge">
                  {filteredClasses.length} result{filteredClasses.length !== 1 ? "s" : ""}
                </span>
                <select
                  className="th-sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {filteredClasses.length > 0 ? (
              <div className="th-grid">
                {filteredClasses.map((cls, i) => (
                  <ClassCard key={cls.id} cls={cls} index={i} />
                ))}
              </div>
            ) : (
              <div className="th-grid">
                <div className="th-empty">
                  <div className="th-empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="#0d9488" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <h3 className="th-empty-title">No classes found</h3>
                  <p className="th-empty-sub">
                    Try adjusting your filters or search terms to see more results.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}