"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  {
    href: "/dashboard/tutor",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tutor/profile",
    label: "Profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tutor/community",
    label: "Community",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tutor/contact",
    label: "Contact",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;800&family=DM+Sans:wght@400;500;600&display=swap');

        .mentora-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mentora-nav.scrolled {
          filter: drop-shadow(0 8px 32px rgba(16, 185, 129, 0.12));
        }

        .nav-inner {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(16, 185, 129, 0.12);
          transition: background 0.4s ease, border-color 0.4s ease;
        }

        .mentora-nav.scrolled .nav-inner {
          background: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 68px;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        /* ── LOGO ── */
        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .logo-link:hover .logo-icon {
          transform: rotate(-6deg) scale(1.08);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.55);
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.35rem;
          background: linear-gradient(135deg, #064e3b 0%, #10b981 60%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .logo-badge {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          padding: 2px 7px;
          border-radius: 100px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          margin-top: 2px;
        }

        /* ── NAV LINKS ── */
        .nav-links {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .nav-pill-container {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(240, 253, 244, 0.8);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: 16px;
          padding: 5px;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 11px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          transition: color 0.25s ease, background 0.25s ease, transform 0.2s ease;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: #065f46;
          background: rgba(16, 185, 129, 0.1);
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: #ffffff;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .nav-link .nav-icon {
          opacity: 0.7;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .nav-link:hover .nav-icon,
        .nav-link.active .nav-icon {
          opacity: 1;
          transform: scale(1.15);
        }

        .nav-link.active .nav-icon {
          opacity: 1;
        }

        /* active dot */
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 6px #34d399;
        }

        /* ── RIGHT ACTIONS ── */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .avatar-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
          border: 2px solid rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
        }

        .avatar-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
          border-color: rgba(16, 185, 129, 0.6);
        }

        .notification-btn {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(240, 253, 244, 0.9);
          border: 1px solid rgba(16, 185, 129, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          color: #065f46;
        }

        .notification-btn:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.4);
          transform: translateY(-1px);
        }

        .notif-dot {
          position: absolute;
          top: 7px;
          right: 8px;
          width: 7px;
          height: 7px;
          background: #f59e0b;
          border-radius: 50%;
          border: 1.5px solid white;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }

        /* ── MOBILE ── */
        .mobile-toggle {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(240, 253, 244, 0.9);
          border: 1px solid rgba(16, 185, 129, 0.2);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #065f46;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .mobile-toggle:hover {
          background: rgba(16, 185, 129, 0.1);
        }

        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
          padding: 12px 1.5rem 16px;
          gap: 6px;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .mobile-menu.open {
          display: flex;
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s ease;
        }

        .mobile-link:hover,
        .mobile-link.active {
          background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08));
          color: #065f46;
        }

        .mobile-link.active {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-actions .notification-btn { display: none; }
          .mobile-toggle { display: flex; }
          .nav-inner { position: relative; }
          .nav-container { gap: 1rem; }
        }
      `}</style>

      <nav className={`mentora-nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <div className="nav-container">

            {/* LOGO */}
            <Link href="/dashboard/tutor" className="logo-link">
              <div className="logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div>
                <div className="logo-text">Mentora.lk</div>
              </div>
              <span className="logo-badge">Tutor</span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="nav-links">
              <div className="nav-pill-container">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link${pathname === link.href ? " active" : ""}`}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="nav-actions">
              <button className="notification-btn" aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="notif-dot" />
              </button>

              <button className="avatar-btn" aria-label="Account">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {/* MOBILE TOGGLE */}
              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-link${pathname === link.href ? " active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}