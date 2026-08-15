'use client';

import Link from 'next/link';
import { usePalette } from '@/hooks/usePalette';

interface NavbarProps {
  scrollY: number;
}

export default function Navbar({ scrollY }: NavbarProps) {
  const palette = usePalette();
  const scrolled = scrollY > 50;

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: scrolled ? palette.navBg : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        boxShadow: scrolled ? palette.shadow : 'none',
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
              color: scrolled ? palette.textPrimary : 'white',
              transition: 'color 0.4s',
            }}
          >
            Mentora<span style={{ color: '#10B981' }}>.lk</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['HOME', 'COURSES', 'ABOUT US', 'CONTACT US'].map((item) => (
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
                  color: scrolled ? palette.textSecondary : 'rgba(255,255,255,0.88)',
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
        </div>
      </div>
    </nav>
  );
}

