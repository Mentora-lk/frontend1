'use client';

import Link from 'next/link';
import { usePalette } from '@/hooks/usePalette';
import { useCurrentUser, getInitial } from '@/hooks/useCurrentUser';
import { DASHBOARD_PREFIX_BY_ROLE, isUserRole } from '@/lib/routeRoles';

interface NavbarProps {
  scrollY: number;
}

export default function Navbar({ scrollY }: NavbarProps) {
  const palette = usePalette();
  const scrolled = scrollY > 50;
  const currentUser = useCurrentUser();
  const dashboardHref = currentUser && isUserRole(currentUser.role)
    ? DASHBOARD_PREFIX_BY_ROLE[currentUser.role]
    : null;

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
          {[
            { label: 'HOME', href: '/' },
            { label: 'COURSES', href: '/classes/search' },
            { label: 'ABOUT US', href: '/about' },
            { label: 'CONTACT US', href: '/contact' },
          ].map(({ label: item, href }) => (
            <Link key={item} href={href}>
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

          {dashboardHref && (
            <Link href={dashboardHref} title="Go to Dashboard">
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#10B981,#059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  border: scrolled ? 'none' : '2px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px) scale(1.06)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0) scale(1)'; }}
              >
                {getInitial(currentUser)}
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

