'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import { getAuditTrail } from './utils/operations';

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function TutorsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 9l8-4 8 4-8 4-8-4Z" />
      <path d="M7 10v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4" />
      <path d="M19 12v4" />
    </svg>
  );
}

function StudentsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 11a4 4 0 1 0-8 0" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <circle cx="17" cy="8" r="2.5" />
    </svg>
  );
}

function SessionsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 4h6" />
      <path d="M9 4v3" />
      <path d="M15 4v3" />
      <path d="M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      <path d="M8 12h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

function PaymentsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
    </svg>
  );
}

function AdsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 11v2" />
      <path d="M7 9v6" />
      <path d="M10 7v10" />
      <path d="M14 6l6-2v16l-6-2-6 1V7l6-1Z" />
      <path d="M4 13h3" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.05.05a2.2 2.2 0 0 1-1.56 3.76 2.2 2.2 0 0 1-1.56-.64l-.05-.05a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V22a2.2 2.2 0 0 1-4.4 0v-.59a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-2 .36l-.05.05a2.2 2.2 0 0 1-3.12-3.12l.05-.05a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.1H2a2.2 2.2 0 0 1 0-4.4h.59a1.8 1.8 0 0 0 1.65-1.1 1.8 1.8 0 0 0-.36-2l-.05-.05A2.2 2.2 0 0 1 7.35 2.9l.05.05a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.1-1.65V2a2.2 2.2 0 0 1 4.4 0v.59a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.05-.05a2.2 2.2 0 0 1 3.12 3.12l-.05.05a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.65 1.1H22a2.2 2.2 0 0 1 0 4.4h-.59a1.8 1.8 0 0 0-1.65 1.1Z" />
    </svg>
  );
}

function ActivityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14h4l2-5 3 10 2-5h5" />
      <path d="M4 6h16" />
    </svg>
  );
}

const adminSections = [
  {
    label: 'MAIN',
    links: [{ href: '/dashboard/admin', label: 'Dashboard', icon: DashboardIcon }],
  },
  {
    label: 'MANAGEMENT',
    links: [
      { href: '/dashboard/admin/tutors', label: 'Tutors', icon: TutorsIcon },
      { href: '/dashboard/admin/students', label: 'Students', icon: StudentsIcon },
      { href: '/dashboard/admin/sessions', label: 'Sessions', icon: SessionsIcon },
    ],
  },
  {
    label: 'BUSINESS',
    links: [
      { href: '/dashboard/admin/report', label: 'Payments', icon: PaymentsIcon },
      { href: '/dashboard/admin/advertisements', label: 'Advertisements', icon: AdsIcon },
    ],
  },
  {
    label: 'SYSTEM',
    links: [
      { href: '/dashboard/admin/settings', label: 'Settings', icon: SettingsIcon },
      { href: '/dashboard/admin/activity', label: 'Activity', icon: ActivityIcon },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isAuthPage =
      pathname === '/dashboard/admin/auth' ||
      pathname.startsWith('/dashboard/admin/auth/');

    if (isAuthPage) {
      setAuthorized(true);
      return;
    }

    const cookies = document.cookie.split(';');
    const roleCookie = cookies.find(c => c.trim().startsWith('user_role='));
    const role = roleCookie?.split('=')[1]?.trim();

    if (role !== 'admin') {
      window.location.replace('/dashboard/admin/auth');
    } else {
      setAuthorized(true);
    }
  }, [pathname]);

  const notifications = useMemo(() => {
    const recent = getAuditTrail().slice(0, 3);
    if (recent.length === 0) {
      return [
        { id: 'seed-1', title: 'No recent operational alerts', href: '/dashboard/admin/activity' },
      ];
    }
    return recent.map((item) => ({
      id: item.id,
      title: `${item.action}: ${item.detail}`,
      href: '/dashboard/admin/activity',
    }));
  }, [pathname]);

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#0f766e', fontSize: 14, fontWeight: 600 }}>Checking access...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,900&family=Outfit:wght@400;500;600;700;800&display=swap');
        .admin-shell { min-height: 100vh; background: #f3f4f6; color: #111827; font-family: 'Outfit', sans-serif; }
        .admin-wrap { display: flex; height: 100vh; overflow: hidden; }
        .admin-backdrop { position: fixed; inset: 0; background: rgba(17, 24, 39, 0.30); z-index: 30; border: none; }
        .admin-sidebar {
          position: fixed; inset: 0 auto 0 0; width: 260px; z-index: 40;
          background: #ffffff; border-right: 1px solid #e5e7eb;
          transform: translateX(-100%); transition: transform .2s ease;
          box-shadow: 12px 0 30px rgba(15, 23, 42, 0.04);
        }
        .admin-sidebar.open { transform: translateX(0); }
        .admin-main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
        .admin-header {
          height: 76px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px; border-bottom: 1px solid #e5e7eb;
          background: rgba(255, 255, 255, 0.90); backdrop-filter: blur(8px);
        }
        .admin-content {
          flex: 1; overflow-y: auto; padding: 24px; background:
            radial-gradient(1000px 300px at 15% -10%, rgba(15, 118, 110, 0.10), transparent 60%),
            radial-gradient(800px 260px at 95% -20%, rgba(217, 119, 6, 0.06), transparent 60%),
            #f3f4f6;
        }
        .admin-inner { max-width: 1200px; margin: 0 auto; }
        .admin-brand {
          height: 76px; padding: 0 18px; border-bottom: 1px solid #eef5f0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .admin-links { padding: 14px 10px 12px; display: grid; gap: 8px; }
        .admin-section-label { padding: 10px 12px 6px; color: #94a3b8; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; }
        .admin-link {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px;
          color: #374151; text-decoration: none; font-size: 14px; font-weight: 600;
          border: 1px solid transparent; transition: background .2s, border-color .2s, color .2s;
        }
        .admin-link:hover { background: #f9fafb; }
        .admin-link.active { background: #ecfeff; border-color: #99f6e4; color: #0f766e; }
        .admin-link-icon {
          width: 24px; height: 24px; display: grid; place-items: center; border-radius: 8px;
          background: #ccfbf1; color: #0f766e; font-size: 12px; flex: 0 0 auto;
        }
        .admin-link.active .admin-link-icon { background: #99f6e4; color: #0f766e; }
        .admin-sidebar-body { display: flex; flex-direction: column; height: calc(100vh - 76px); }
        .admin-sidebar-spacer { flex: 1; }
        .admin-profile {
          margin: 0 10px 12px; padding: 12px; border-radius: 14px;
          background: #f8faf9; border: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .admin-profile-photo-link { text-decoration: none; border-radius: 999px; }
        .admin-profile-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .admin-avatar {
          width: 34px; height: 34px; border-radius: 999px; display: grid; place-items: center;
          background: linear-gradient(135deg, #0f766e, #14b8a6); color: #fff; font-size: 12px; font-weight: 800; flex: 0 0 auto;
        }
        .admin-profile-name { color: #111827; font-size: 13px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-profile-role { color: #6b7280; font-size: 11px; }
        .admin-muted { color: #6b7280; font-size: 12px; }
        .admin-title { font-size: 18px; font-weight: 700; color: #111827; }
        .admin-right { display: flex; align-items: center; gap: 10px; position: relative; }
        .admin-notify-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid #e5e7eb;
          background: #fff; color: #374151; cursor: pointer; position: relative;
          display: grid; place-items: center; font-size: 16px;
        }
        .admin-notify-dot { position: absolute; top: 7px; right: 7px; width: 8px; height: 8px; background: #ef4444; border: 2px solid #fff; border-radius: 999px; }
        .admin-notify-panel {
          position: absolute; top: 48px; right: 0; width: 310px; max-width: calc(100vw - 40px);
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 18px 30px rgba(15,23,42,0.10);
          overflow: hidden; z-index: 60;
        }
        .admin-notify-head { padding: 12px 14px; border-bottom: 1px solid #ecf4ef; font-size: 13px; font-weight: 700; color: #111827; }
        .admin-notify-item { display: block; text-decoration: none; color: #374151; font-size: 13px; padding: 12px 14px; border-bottom: 1px solid #f1f5f9; }
        .admin-notify-item:hover { background: #f8faf9; }
        .admin-notify-item:last-child { border-bottom: none; }
        .admin-menu-btn, .admin-close-btn { border: 1px solid #d1d5db; background: #fff; color: #374151; border-radius: 10px; padding: 8px 11px; cursor: pointer; }
        .admin-close-btn { padding: 6px 10px; font-size: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .admin-backdrop { display: none; }
          .admin-sidebar { position: static; transform: none; }
          .admin-menu-btn, .admin-close-btn { display: none; }
          .admin-header { padding: 0 28px; }
          .admin-content { padding: 28px; }
        }
      `}</style>

      <div className="admin-shell">
        <div className="admin-wrap">
          {sidebarOpen && (
            <button type="button" className="admin-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close menu overlay" />
          )}

          <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="admin-brand">
              <div>
                <p style={{ fontSize: 15, color: '#111827', fontWeight: 800, margin: 0, fontFamily: "'Fraunces', serif" }}>Mentora</p>
                <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12 }}>Admin</p>
              </div>
              <button type="button" className="admin-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">Close</button>
            </div>

            <div className="admin-sidebar-body">
              <nav className="admin-links">
                {adminSections.map((section) => (
                  <div key={section.label}>
                    <div className="admin-section-label">{section.label}</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {section.links.map((link) => {
                        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        const Icon = link.icon;
                        return (
                 <Link key={link.href} href={link.href} onClick={(e) => {
                        const cookies = document.cookie.split(';');
                        const roleCookie = cookies.find(c => c.trim().startsWith('user_role='));
                        const role = roleCookie?.split('=')[1]?.trim();
                        if (role !== 'admin') {
                          e.preventDefault();
                          window.location.replace('/dashboard/admin/auth');
                          return;
                        }
                        setSidebarOpen(false);
                      }} className={`admin-link ${active ? 'active' : ''}`}>
                            <span className="admin-link-icon"><Icon width={14} height={14} strokeWidth={2.4} /></span>
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="admin-sidebar-spacer" />

              <div className="admin-profile">
                <div className="admin-profile-main">
                  <Link href="/dashboard/admin/profile" onClick={() => setSidebarOpen(false)} className="admin-profile-photo-link" aria-label="Open profile settings">
                    <div className="admin-avatar">AP</div>
                  </Link>
                  <div style={{ minWidth: 0 }}>
                    <div className="admin-profile-name">Nuwan Perera</div>
                    <div className="admin-profile-role">Tap photo to edit profile</div>
                  </div>
                </div>
                <div className="admin-muted" style={{ color: '#94a3b8' }}>⟶</div>
              </div>
            </div>
          </aside>

          <main className="admin-main">
            <header className="admin-header">
              <button type="button" className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>Menu</button>
              <div>
                <h1 className="admin-title" style={{ margin: 0, fontFamily: "'Fraunces', serif" }}>Admin Dashboard</h1>
                <div className="admin-muted">Overview</div>
              </div>
              <div className="admin-right">
                <button type="button" className="admin-notify-btn" onClick={() => setNotificationsOpen((prev) => !prev)} aria-label="Open notifications">
                  🔔
                  {notifications.length > 0 && <span className="admin-notify-dot" />}
                </button>
                {notificationsOpen && (
                  <div className="admin-notify-panel">
                    <div className="admin-notify-head">Notifications ({notifications.length})</div>
                    {notifications.map((item) => (
                      <Link key={item.id} href={item.href} className="admin-notify-item" onClick={() => setNotificationsOpen(false)}>
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    document.cookie = 'user_role=; path=/; max-age=0';
                    window.location.replace('/dashboard/admin/auth');
                  }}
                  style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
            </header>
            <div className="admin-content">
              <div className="admin-inner">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}