'use client';

import Link from 'next/link';

interface NavbarProps {
  scrollY: number;
}

export default function Navbar({ scrollY }: NavbarProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: scrollY > 50 ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(24px)' : 'none',
        boxShadow: scrollY > 50 ? '0 2px 24px rgba(0,0,0,0.07)' : 'none',
        transition: 'all 0.4s ease',
        padding: '0 6%',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}
      >
        <Link href="/">
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              fontWeight: 900,
              color: scrollY > 50 ? '#111' : 'white',
              transition: 'color 0.4s',
            }}
          >
            Mentora<span style={{ color: '#10B981' }}>.lk</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['HOME', 'COURSES', 'BECOME A TUTOR', 'ABOUT US', 'CONTACT US'].map((item) => (
            <Link
              key={item}
              href={
                item === 'COURSES'
                  ? '/classes/search'
                  : item === 'BECOME A TUTOR'
                  ? '/auth/register'
                  : '#'
              }
            >
              <span
                className="nav-link"
                style={{
                  color: scrollY > 50 ? '#374151' : 'rgba(255,255,255,0.88)',
                  transition: 'color 0.2s',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  cursor: 'pointer',
                }}
              >
                {item}
              </span>
            </Link>
          ))}
          <span
            style={{
              color: scrollY > 50 ? '#374151' : 'rgba(255,255,255,0.88)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              transition: 'color 0.2s',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.07em',
              cursor: 'pointer',
            }}
          >
            Browse Courses
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>
    </nav>
  );
}
