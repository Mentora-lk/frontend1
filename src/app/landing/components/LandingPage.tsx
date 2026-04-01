"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Navbar from "../../../components/navbar/Navbar";

const COURSES = [
  {
    id: 1,
    title: "Advanced Level : Physics",
    tutor: "Thilak Perera",
    location: "Moratuwa",
    rating: 4.8,
    reviews: 94,
    badge: null,
    subject: "Physics",
    mode: "offline",
    fee: 2500,
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80",
    desc: "Government teacher, BSc Graduate with 10+ years of experience.",
  },
  {
    id: 2,
    title: "Advanced Level : ICT",
    tutor: "Nimesh Dissanayake",
    location: "Piliyandala",
    rating: 4.6,
    reviews: 110,
    badge: null,
    subject: "ICT",
    mode: "online",
    fee: 3000,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80",
    desc: "An enthusiastic ICT teacher who teaches coding, technology skills and inspires.",
  },
  {
    id: 3,
    title: "IT : Web Development From Basics",
    tutor: "Isaac Rudansky",
    location: "Piliyandala",
    rating: 4.9,
    reviews: 121,
    badge: "Best Seller",
    subject: "ICT",
    mode: "online",
    fee: 4500,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
    desc: "Full-stack web development from HTML to React and Node.js.",
  },
  {
    id: 4,
    title: "Music : Guitar For Beginners",
    tutor: "Manoj Kumara",
    location: "Matale",
    rating: 4.7,
    reviews: 638,
    badge: "Best Seller",
    subject: "Music",
    mode: "offline",
    fee: 1500,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
    desc: "A passionate guitar teacher who inspires students, teaches techniques.",
  },
  {
    id: 5,
    title: "උසස් පෙළ : භෞතික විද්‍යාව",
    tutor: "Saman Kumara",
    location: "Moratuwa",
    rating: 4.5,
    reviews: 360,
    badge: "Best Seller",
    subject: "Physics",
    mode: "both",
    fee: 2000,
    image: "https://images.unsplash.com/photo-1532094349884-543559c1a21c?w=400&q=80",
    desc: "A knowledgeable physics teacher who explains concepts clearly.",
  },
  {
    id: 6,
    title: "Personal Branding: Creating A Strong Online Presence",
    tutor: "Dennis Yu",
    location: "Online",
    rating: 4.8,
    reviews: 81,
    badge: null,
    subject: "Business",
    mode: "online",
    fee: 5000,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
    desc: "Build your personal brand and dominate social media.",
  },
];

const POPULAR_TAGS = ["IT", "Music", "Physics", "Accounting", "English"];

const TESTIMONIALS = [
  {
    quote:
      "This teacher is highly effective; I achieved an A in A/L ICT within just six months of guidance.",
    name: "Sonal Perera",
    rating: 5,
    tutorName: "Jehan Fernando",
    tutorDesc:
      "An A/L ICT tutor who is currently completing a BSc in IT at the University of Moratuwa.",
    tutorWorked: "YouTube",
  },
  {
    quote:
      "Found the perfect maths tutor within minutes. My daughter's grades improved dramatically in just two months!",
    name: "Priya Wickramasinghe",
    rating: 5,
    tutorName: "Kasun Fernando",
    tutorDesc:
      "Senior Mathematics tutor with 10+ years of experience coaching A/L students across Sri Lanka.",
    tutorWorked: "National Schools",
  },
];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#F59E0B" : "none"}
          stroke="#F59E0B"
          strokeWidth="1.5"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </span>
  );
}

function CourseCard({ course }: { course: (typeof COURSES)[0] }) {
  const [hov, setHov] = useState(false);

  return (
    <Link href={`/classes/${course.id}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "white",
          borderRadius: 20,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.35s cubic-bezier(.22,1,.36,1)",
          transform: hov ? "translateY(-8px)" : "translateY(0)",
          boxShadow: hov
            ? "0 24px 48px rgba(16,185,129,0.18), 0 8px 24px rgba(0,0,0,0.1)"
            : "0 4px 20px rgba(0,0,0,0.07)",
          border: hov ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ position: "relative", overflow: "hidden", height: 185 }}>
          <img
            src={course.image}
            alt={course.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: hov ? "scale(1.09)" : "scale(1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)",
            }}
          />
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 100,
                color: "white",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Course
            </span>
            {course.badge && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 100,
                  color: "white",
                  background: "linear-gradient(135deg,#F59E0B,#EF4444)",
                }}
              >
                {course.badge}
              </span>
            )}
          </div>
          <div style={{ position: "absolute", bottom: 10, right: 12 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 6,
                color:
                  course.mode === "online"
                    ? "#34D399"
                    : course.mode === "offline"
                    ? "#60A5FA"
                    : "#FBBF24",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(6px)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {course.mode}
            </span>
          </div>
        </div>

        <div style={{ padding: "16px 18px 18px" }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 15,
              color: "#111827",
              lineHeight: 1.4,
              marginBottom: 8,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
            <Stars rating={course.rating} size={13} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B" }}>{course.rating}</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>({course.reviews})</span>
          </div>

          <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>
            By <span style={{ fontWeight: 600, color: "#10B981" }}>{course.tutor}</span>
          </p>

          <p
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.desc}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid #F3F4F6",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {course.location}
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>LKR {course.fee.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("IT");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterRating, setFilterRating] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [priceRange, setPriceRange] = useState(5000);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const filteredCourses = COURSES.filter((c) => {
    const matchSearch =
      searchQuery.trim() === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tutor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag = activeTag === "IT" ? true : c.subject.toLowerCase().includes(activeTag.toLowerCase());
    const matchSubject = filterSubject === "All" || c.subject === filterSubject;
    const matchRating = filterRating === 0 || c.rating >= filterRating;
    const matchFee = c.fee <= priceRange;
    return matchSearch && matchTag && matchSubject && matchRating && matchFee;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #F8FAF9; color: #1a1a1a; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #10B981; border-radius: 999px; }
        input:focus, select:focus, button:focus { outline: none; }
        input[type=range] { accent-color: #10B981; cursor: pointer; }
        input[type=radio]  { accent-color: #10B981; cursor: pointer; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes floatA   { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-14px) rotate(2deg); } }
        @keyframes floatB   { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-10px) rotate(-2deg); } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }

        .anim-fade-up   { animation: fadeUp  0.85s cubic-bezier(.22,1,.36,1) both; }
        .delay-1  { animation-delay: 0.15s; }
        .delay-2  { animation-delay: 0.3s; }
        .delay-3  { animation-delay: 0.45s; }
        .delay-4  { animation-delay: 0.6s; }
        .delay-5  { animation-delay: 0.75s; }
        .delay-6  { animation-delay: 0.9s; }

        .float-a { animation: floatA 5s ease-in-out infinite; }
        .float-b { animation: floatB 7s ease-in-out infinite 1s; }
        .float-c { animation: floatA 6s ease-in-out infinite 0.5s; }

        .nav-link { transition: color 0.2s; font-size: 12px; font-weight: 600; letter-spacing: 0.07em; cursor: pointer; }
        .nav-link:hover { color: #10B981 !important; }

        .tag-pill {
          padding: 6px 18px; border-radius: 999px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1.5px solid; font-family: 'DM Sans', sans-serif;
          transition: all 0.22s cubic-bezier(.22,1,.36,1);
        }
        .tag-pill:hover { transform: translateY(-2px) scale(1.04); }

        .btn-green {
          background: linear-gradient(135deg,#10B981,#059669);
          color: white; border: none; border-radius: 12px;
          font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer;
          box-shadow: 0 4px 18px rgba(16,185,129,0.38);
          transition: all 0.25s cubic-bezier(.22,1,.36,1);
        }
        .btn-green:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(16,185,129,0.45); }

        .btn-outline-green {
          background: transparent; color: #10B981; border: 2px solid #10B981;
          border-radius: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.25s cubic-bezier(.22,1,.36,1);
        }
        .btn-outline-green:hover { background: #10B981; color: white; transform: translateY(-3px); box-shadow: 0 10px 28px rgba(16,185,129,0.35); }

        .feature-card {
          background: white; border-radius: 22px; padding: 36px 28px;
          border: 1px solid rgba(16,185,129,0.08);
          box-shadow: 0 4px 24px rgba(0,0,0,0.045);
          transition: all 0.32s cubic-bezier(.22,1,.36,1);
        }
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 24px 50px rgba(16,185,129,0.13);
          border-color: rgba(16,185,129,0.25);
        }

        .filter-card {
          background: white; border-radius: 20px; padding: 26px 22px;
          box-shadow: 0 4px 28px rgba(0,0,0,0.07);
          position: sticky; top: 88px;
          border: 1px solid rgba(0,0,0,0.04);
        }

        .section-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #10B981; margin-bottom: 8px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-eyebrow::before {
          content: ''; display: block; width: 24px; height: 2px;
          background: #10B981; border-radius: 2px;
        }

        .section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px,3.5vw,44px);
          font-weight: 900; color: #111827; line-height: 1.12;
        }

        .dot-nav {
          width: 8px; height: 8px; border-radius: 999px;
          cursor: pointer; border: none; transition: all 0.28s;
        }

        .hero-particle {
          position: absolute; border-radius: 50%;
          background: rgba(16,185,129,0.55);
          pointer-events: none;
        }

        .search-wrap {
          display: flex; background: white; border-radius: 16px; overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.28); max-width: 560px;
          border: 2px solid transparent;
          transition: border-color 0.25s;
        }
        .search-wrap:focus-within { border-color: rgba(16,185,129,0.4); }
        .search-input { flex:1; border:none; background:transparent; padding: 18px 0; font-size:15px; color:#111; font-family:'DM Sans',sans-serif; }

        .stat-float {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 18px; padding: 16px 22px;
          display: flex; align-items: center; gap: 14px;
        }

        .courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(272px, 1fr));
          gap: 26px;
        }

        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }

        @media (max-width: 1024px) {
          .sidebar { display: none !important; }
          .courses-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 640px) {
          .courses-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr !important; }
          .footer-grid   { grid-template-columns: 1fr 1fr !important; }
          .hero-stats-col { display: none !important; }
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .cta-btns { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F8FAF9" }}>
        <Navbar scrollY={scrollY} />

        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              transform: `translateY(${scrollY * 0.28}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(2,20,14,0.92) 0%, rgba(5,60,38,0.78) 40%, rgba(0,0,0,0.72) 100%)",
            }}
          />
          <div className="blob" style={{ width: 700, height: 700, background: "rgba(16,185,129,0.13)", top: -200, right: -150 }} />
          <div className="blob" style={{ width: 450, height: 450, background: "rgba(5,150,80,0.1)", bottom: 0, left: -80 }} />

          {Array.from({ length: 22 }).map((_, i) => (
            <div
              key={i}
              className="hero-particle"
              style={{
                width: 2 + (i % 3) * 2,
                height: 2 + (i % 3) * 2,
                left: `${(i * 4.7 + 3) % 100}%`,
                top: `${(i * 7.3 + 5) % 100}%`,
                animation: `floatA ${3.5 + (i % 4) * 1.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.28}s`,
                opacity: 0.4 + (i % 3) * 0.2,
              }}
            />
          ))}

          <svg
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }}
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="200" x2="400" y2="600" stroke="#10B981" strokeWidth="1" />
            <line x1="1440" y1="150" x2="900" y2="700" stroke="#10B981" strokeWidth="1" />
            <circle cx="200" cy="400" r="200" fill="none" stroke="#10B981" strokeWidth="0.5" />
            <circle cx="1200" cy="300" r="150" fill="none" stroke="#10B981" strokeWidth="0.5" />
          </svg>

          <div
            style={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              maxWidth: 1280,
              margin: "0 auto",
              padding: "130px 6% 90px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 48,
            }}
          >
            <div style={{ maxWidth: 660 }}>
              <div
                className="anim-fade-up delay-1"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.4)",
                  borderRadius: 999,
                  padding: "6px 16px",
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 10px #10B981",
                    animation: "pulseDot 2s ease-in-out infinite",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#34D399", letterSpacing: "0.12em" }}>
                  SRI LANKA'S #1 TUTORING PLATFORM
                </span>
              </div>

              <h1
                className="anim-fade-up delay-2"
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontWeight: 900,
                  fontSize: "clamp(44px,5.5vw,78px)",
                  color: "white",
                  lineHeight: 1.08,
                  marginBottom: 22,
                  textShadow: "0 4px 40px rgba(0,0,0,0.3)",
                }}
              >
                Find Your
                <br />
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ color: "#10B981" }}>Best Tutor</span>
                  <svg style={{ position: "absolute", bottom: -10, left: 0, width: "100%" }} viewBox="0 0 320 14" fill="none" preserveAspectRatio="none">
                    <path
                      d="M4 10 Q40 4 80 10 Q120 16 160 10 Q200 4 240 10 Q280 16 316 10"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  </svg>
                </span>
              </h1>

              <p className="anim-fade-up delay-3" style={{ fontSize: 17, color: "rgba(255,255,255,0.68)", marginBottom: 38, lineHeight: 1.65, fontWeight: 300, maxWidth: 520 }}>
                Beginning journey with us.... Connect with verified tutors across Sri Lanka for personalized one-to-one
                learning.
              </p>

              <div className="anim-fade-up delay-4 search-wrap">
                <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 18px", gap: 10 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    className="search-input"
                    type="text"
                    placeholder="What you discover"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn-green" style={{ borderRadius: 0, padding: "18px 26px", fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Search
                </button>
              </div>

              <div className="anim-fade-up delay-5" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 9, marginTop: 22 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>Popular:</span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    className="tag-pill"
                    onClick={() => setActiveTag(tag)}
                    style={{
                      background: activeTag === tag ? "#10B981" : "rgba(255,255,255,0.09)",
                      color: activeTag === tag ? "white" : "rgba(255,255,255,0.78)",
                      borderColor: activeTag === tag ? "#10B981" : "rgba(255,255,255,0.2)",
                      boxShadow: activeTag === tag ? "0 4px 14px rgba(16,185,129,0.4)" : "none",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <p className="anim-fade-up delay-6" style={{ marginTop: 18, fontSize: 13, color: "rgba(255,255,255,0.38)", fontStyle: "italic" }}>
                ඔබට අවශ්‍ය හොඳම ගුරුවරයෙකු හොයාගන්නේ?
              </p>

              <div className="anim-fade-up cta-btns" style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
                <Link href="/auth/signup">
                  <button className="btn-green" style={{ padding: "12px 26px", fontSize: 14, fontWeight: 700 }}>
                    Get Started
                  </button>
                </Link>
                <Link href="/auth/login">
                  <button className="btn-outline-green" style={{ padding: "12px 26px", fontSize: 14, color: "#E5E7EB", borderColor: "rgba(255,255,255,0.5)" }}>
                    Log In
                  </button>
                </Link>
              </div>
            </div>

            <div className="hero-stats-col" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Active Tutors", val: "1,200+", icon: "👨‍🏫", cls: "float-a" },
                { label: "Students Enrolled", val: "25,000+", icon: "🎓", cls: "float-b" },
                { label: "Subjects Available", val: "50+", icon: "📚", cls: "float-c" },
              ].map((s, i) => (
                <div key={i} className={`stat-float ${s.cls} anim-fade-up`} style={{ animationDelay: `${0.5 + i * 0.18}s` }}>
                  <span style={{ fontSize: 30 }}>{s.icon}</span>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 24,
                        fontWeight: 900,
                        color: "white",
                        lineHeight: 1,
                      }}
                    >
                      {s.val}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80 }}>
              <path d="M0,40 C480,90 960,0 1440,50 L1440,80 L0,80 Z" fill="#F8FAF9" />
            </svg>
          </div>
        </section>

        <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 6%" }}>
          <div style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>
            <div className="sidebar" style={{ width: 230, flexShrink: 0 }}>
              <div className="filter-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 22,
                    paddingBottom: 16,
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                      <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16 }}>Filters</h3>
                </div>

                <FilterGroup label="Subject">
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    style={{
                      width: "100%",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 10,
                      padding: "9px 12px",
                      fontSize: 13,
                      color: "#374151",
                      background: "white",
                      fontFamily: "'DM Sans',sans-serif",
                      cursor: "pointer",
                    }}
                  >
                    {["All", "Physics", "ICT", "Mathematics", "Chemistry", "Music", "Business"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </FilterGroup>

                <FilterGroup label={`Price Range (LKR/hr) - up to ${priceRange.toLocaleString()}`}>
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={500}
                    value={priceRange}
                    onChange={(e) => setPriceRange(+e.target.value)}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                    <span>Rs. 500</span>
                    <span>Rs. 5,000+</span>
                  </div>
                </FilterGroup>

                <FilterGroup label="Minimum Rating">
                  {[
                    { v: 0, l: "Any" },
                    { v: 4.5, l: "4.5+" },
                    { v: 4.0, l: "4.0+" },
                  ].map((r) => (
                    <label
                      key={r.v}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      <input type="radio" name="rating" checked={filterRating === r.v} onChange={() => setFilterRating(r.v)} />
                      {r.v > 0 && <Stars rating={r.v} size={12} />}
                      <span>{r.l}</span>
                    </label>
                  ))}
                </FilterGroup>

                <FilterGroup label="Availability">
                  {["Weekdays", "Weekends", "Evening Slots", "Morning Slots"].map((opt) => (
                    <label
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      <input type="radio" name="avail" /> {opt}
                    </label>
                  ))}
                </FilterGroup>

                <button
                  onClick={() => {
                    setFilterSubject("All");
                    setFilterRating(0);
                    setPriceRange(5000);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: 10,
                    border: "1.5px solid #E5E7EB",
                    background: "white",
                    color: "#6B7280",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FEF2F2";
                    e.currentTarget.style.borderColor = "#FCA5A5";
                    e.currentTarget.style.color = "#EF4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.color = "#6B7280";
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 32 }}>
                <p className="section-eyebrow">Discover Classes</p>
                <h2 className="section-heading">Top Classes For You</h2>
                <p style={{ color: "#6B7280", marginTop: 8, fontSize: 14 }}>
                  <span style={{ fontWeight: 700, color: "#10B981" }}>{filteredCourses.length}</span> classes found
                  . Only verified tutors
                </p>
              </div>

              {filteredCourses.length > 0 ? (
                <div className="courses-grid">{filteredCourses.map((c) => <CourseCard key={c.id} course={c} />)}</div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>No classes match your filters</p>
                  <p style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your filters</p>
                </div>
              )}

              <div style={{ textAlign: "center", marginTop: 52 }}>
                <Link href="/tutors/list">
                  <button className="btn-outline-green" style={{ padding: "14px 44px", fontSize: 15 }}>
                    View All Tutors -&gt;
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "linear-gradient(160deg,#f0fdf4 0%,#ecfdf5 60%,#f8fffe 100%)",
            padding: "80px 6%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="blob" style={{ width: 500, height: 500, background: "rgba(16,185,129,0.07)", top: -150, right: -100 }} />
          <div className="blob" style={{ width: 300, height: 300, background: "rgba(16,185,129,0.05)", bottom: -80, left: -60 }} />

          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p className="section-eyebrow" style={{ justifyContent: "center" }}>
                Why Choose Us
              </p>
              <h2 className="section-heading" style={{ marginBottom: 14 }}>
                Learning Made Simple
              </h2>
              <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 460, margin: "0 auto" }}>
                Everything you need to find the right tutor and start learning today.
              </p>
            </div>

            <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
              {[
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  title: "Nearby Tutor",
                  desc: "Find tutors near your location, no matter where you are in Sri Lanka.",
                  color: "#d1fae5",
                },
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  ),
                  title: "Learn From the Best",
                  desc: "Filter and select verified top-rated tutors based on your preferences.",
                  color: "#a7f3d0",
                },
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8">
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  ),
                  title: "No Subscription Fees",
                  desc: "This platform is completely free to use. Pay only for the classes you take.",
                  color: "#6ee7b7",
                },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      background: `linear-gradient(135deg,${f.color},${f.color}aa)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, marginBottom: 10, color: "#111827" }}>
                    {f.title}
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.75 }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 1,
                marginTop: 56,
                borderRadius: 20,
                overflow: "hidden",
                background: "rgba(16,185,129,0.1)",
              }}
            >
              {[
                { n: "1,200+", l: "Verified Tutors" },
                { n: "25,000+", l: "Active Students" },
                { n: "50+", l: "Subjects" },
                { n: "4.8★", l: "Avg. Rating" },
              ].map((s, i) => (
                <div key={i} style={{ background: "white", padding: "28px 24px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: "#10B981", lineHeight: 1 }}>
                    {s.n}
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 6, fontWeight: 500 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "80px 6%", background: "white" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="testimonial-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "center" }}>
              <div>
                <p className="section-eyebrow">Student Stories</p>
                <h2 className="section-heading" style={{ marginBottom: 32 }}>
                  What Our
                  <br />
                  Students Say
                </h2>

                <div
                  style={{
                    background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
                    borderRadius: 24,
                    padding: 36,
                    position: "relative",
                    border: "1px solid rgba(16,185,129,0.15)",
                    overflow: "hidden",
                    transition: "all 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 20,
                      fontSize: 120,
                      color: "#10B981",
                      opacity: 0.1,
                      lineHeight: 1,
                      fontFamily: "Georgia,serif",
                      userSelect: "none",
                    }}
                  >
                    "
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: -30,
                      right: 20,
                      fontSize: 120,
                      color: "#10B981",
                      opacity: 0.07,
                      lineHeight: 1,
                      fontFamily: "Georgia,serif",
                      userSelect: "none",
                    }}
                  >
                    "
                  </div>

                  <p
                    style={{
                      fontSize: 17,
                      lineHeight: 1.8,
                      color: "#1F2937",
                      fontStyle: "italic",
                      marginBottom: 24,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    "{TESTIMONIALS[testimonialIdx].quote}"
                  </p>

                  <Stars rating={TESTIMONIALS[testimonialIdx].rating} size={18} />

                  <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#10B981,#059669)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 17,
                        flexShrink: 0,
                      }}
                    >
                      {TESTIMONIALS[testimonialIdx].name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{TESTIMONIALS[testimonialIdx].name}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>Verified Student</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      className="dot-nav"
                      onClick={() => setTestimonialIdx(i)}
                      style={{ background: i === testimonialIdx ? "#10B981" : "#D1FAE5", width: i === testimonialIdx ? 24 : 8, border: "none" }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ background: "#0F172A", borderRadius: 28, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}>
                <div style={{ padding: "32px", display: "flex", gap: 20, alignItems: "flex-start", background: "linear-gradient(135deg,#1F2937,#111827)" }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 20,
                      flexShrink: 0,
                      background: "linear-gradient(135deg,#10B981,#059669)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 30,
                      color: "white",
                      fontWeight: 700,
                      fontFamily: "'Playfair Display',serif",
                      boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
                      border: "3px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {TESTIMONIALS[testimonialIdx].tutorName[0]}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "white" }}>
                        {TESTIMONIALS[testimonialIdx].tutorName}
                      </h3>
                      <span
                        style={{
                          background: "rgba(16,185,129,0.2)",
                          border: "1px solid rgba(16,185,129,0.35)",
                          borderRadius: 6,
                          padding: "2px 9px",
                          fontSize: 11,
                          color: "#34D399",
                          fontWeight: 600,
                        }}
                      >
                        ✓ Verified
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                      {TESTIMONIALS[testimonialIdx].tutorDesc}
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {[
                    { l: "Rating", v: "4.9★" },
                    { l: "Students", v: "320+" },
                    { l: "Classes", v: "48" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "18px 20px",
                        borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#10B981" }}>
                        {s.v}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Worked with:</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{TESTIMONIALS[testimonialIdx].tutorWorked}</span>
                </div>

                <div style={{ padding: "0 28px 28px" }}>
                  <Link href="/classes/search">
                    <button className="btn-green" style={{ width: "100%", padding: "13px", fontSize: 14 }}>
                      Book a Session
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer style={{ background: "#0F172A", color: "white", padding: "64px 6% 28px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 52 }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, marginBottom: 14 }}>
                  Mentora<span style={{ color: "#10B981" }}>.lk</span>
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: 22, maxWidth: 210 }}>
                  Sri Lanka's leading online tutoring marketplace connecting students and tutors.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "f", title: "Facebook" },
                    { label: "X", title: "Twitter/X" },
                    { label: "in", title: "LinkedIn" },
                  ].map((s) => (
                    <a
                      key={s.label}
                      href="#"
                      title={s.title}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.45)",
                        fontSize: 13,
                        fontWeight: 700,
                        transition: "all 0.22s",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#10B981";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#10B981";
                        e.currentTarget.style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>

              {[
                {
                  heading: "Categories",
                  links: ["All Courses", "ICT", "Graphic Design", "Music", "Arts", "Business", "Video & Photography", "Sports"],
                },
                { heading: "About", links: ["Our Instructors", "Our Courses", "Terms of Service", "Mentora Privacy Policy"] },
                { heading: "Support", links: ["FAQ", "Contact Support", "Forum"] },
                { heading: "Share", links: ["Suggest a course", "Become an affiliate"] },
              ].map((col) => (
                <div key={col.heading}>
                  <h4
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: 18,
                    }}
                  >
                    {col.heading}
                  </h4>
                  <ul style={{ listStyle: "none" }}>
                    {col.links.map((l) => (
                      <li key={l} style={{ marginBottom: 10 }}>
                        <a
                          href="#"
                          style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLAnchorElement).style.color = "#10B981";
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)";
                          }}
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                paddingTop: 22,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                © 2026 Mentora.lk . Team Loop 5 . Faculty of IT, University of Moratuwa
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>mentora.lk</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#9CA3AF",
          display: "block",
          marginBottom: 10,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
