'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getAuditTrail } from './utils/operations';

const adminSections = [
  {
    label: 'MAIN',
    links: [{ href: '/dashboard/admin', label: 'Dashboard', icon: '▣' }],
  },
  {
    label: 'MANAGEMENT',
    links: [
      { href: '/dashboard/admin/tutors', label: 'Tutors', icon: '◉' },
      { href: '/dashboard/admin/students', label: 'Students', icon: '◉' },
      { href: '/dashboard/admin/sessions', label: 'Sessions', icon: '◉' },
    ],
  },
  {
    label: 'BUSINESS',
    links: [
      { href: '/dashboard/admin/report', label: 'Payments', icon: '◉' },
      { href: '/dashboard/admin/advertisements', label: 'Advertisements', icon: '◉' },
    ],
  },
  {
    label: 'SYSTEM',
    links: [
      { href: '/dashboard/admin/settings', label: 'Settings', icon: '◉' },
      { href: '/dashboard/admin/profile', label: 'Profile', icon: '◉' },
      { href: '/dashboard/admin/activity', label: 'Activity', icon: '◉' },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        .admin-shell { min-height: 100vh; background: #f8faf9; color: #111827; font-family: 'DM Sans', sans-serif; }
        .admin-wrap { display: flex; height: 100vh; overflow: hidden; }
        .admin-backdrop {
          position: fixed; inset: 0; background: rgba(17, 24, 39, 0.30); z-index: 30; border: none;
        }
        .admin-sidebar {
          position: fixed; inset: 0 auto 0 0; width: 260px; z-index: 40;
          background: #ffffff;
          border-right: 1px solid #dfeee8;
          transform: translateX(-100%);
          transition: transform .2s ease;
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
            radial-gradient(1000px 300px at 15% -10%, rgba(16, 185, 129, 0.10), transparent 60%),
            radial-gradient(800px 260px at 95% -20%, rgba(20, 184, 166, 0.06), transparent 60%),
            #f8faf9;
        }
        .admin-inner { max-width: 1200px; margin: 0 auto; }
        .admin-brand {
          height: 76px; padding: 0 18px; border-bottom: 1px solid #eef5f0;
          display: flex; align-items: center; justify-content: space-between;
        }
        .admin-links { padding: 14px 10px 12px; display: grid; gap: 8px; }
        .admin-section-label {
          padding: 10px 12px 6px; color: #94a3b8; font-size: 11px; font-weight: 800;
          letter-spacing: 0.12em;
        }
        .admin-link {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px;
          color: #374151; text-decoration: none; font-size: 14px; font-weight: 600;
          border: 1px solid transparent; transition: background .2s, border-color .2s, color .2s;
        }
        .admin-link:hover { background: #f8faf9; }
        .admin-link.active {
          background: #ecfdf5;
          border-color: #bbf7d0; color: #047857;
        }
        .admin-link-icon {
          width: 24px; height: 24px; display: grid; place-items: center; border-radius: 8px;
          background: #eefcf5; color: #10b981; font-size: 12px; flex: 0 0 auto;
        }
        .admin-link.active .admin-link-icon {
          background: #d1fae5; color: #047857;
        }
        .admin-sidebar-body { display: flex; flex-direction: column; height: calc(100vh - 76px); }
        .admin-sidebar-spacer { flex: 1; }
        .admin-profile {
          margin: 0 10px 12px; padding: 12px; border-radius: 14px;
          background: #f8faf9; border: 1px solid #dfeee8;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .admin-profile-link {
          text-decoration: none;
          display: block;
          border-radius: 14px;
        }
        .admin-profile-link:hover .admin-profile {
          border-color: #bbf7d0;
          background: #ecfdf5;
        }
        .admin-profile-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .admin-avatar {
          width: 34px; height: 34px; border-radius: 999px; display: grid; place-items: center;
          background: linear-gradient(135deg, #10b981, #0f766e); color: #fff; font-size: 12px; font-weight: 800;
          flex: 0 0 auto;
        }
        .admin-profile-name { color: #111827; font-size: 13px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .admin-profile-role { color: #6b7280; font-size: 11px; }
        .admin-muted { color: #6b7280; font-size: 12px; }
        .admin-title { font-size: 18px; font-weight: 700; color: #111827; }
        .admin-right { display: flex; align-items: center; gap: 10px; position: relative; }
        .admin-notify-btn {
          width: 38px; height: 38px; border-radius: 10px; border: 1px solid #dfeee8;
          background: #fff; color: #374151; cursor: pointer; position: relative;
          display: grid; place-items: center; font-size: 16px;
        }
        .admin-notify-dot {
          position: absolute; top: 7px; right: 7px; width: 8px; height: 8px;
          background: #ef4444; border: 2px solid #fff; border-radius: 999px;
        }
        .admin-notify-panel {
          position: absolute; top: 48px; right: 0; width: 310px; max-width: calc(100vw - 40px);
          background: #fff; border: 1px solid #dfeee8; border-radius: 14px; box-shadow: 0 18px 30px rgba(15,23,42,0.10);
          overflow: hidden; z-index: 60;
        }
        .admin-notify-head {
          padding: 12px 14px; border-bottom: 1px solid #ecf4ef; font-size: 13px; font-weight: 700; color: #111827;
        }
        .admin-notify-item {
          display: block; text-decoration: none; color: #374151; font-size: 13px;
          padding: 12px 14px; border-bottom: 1px solid #f1f5f9;
        }
        .admin-notify-item:hover { background: #f8faf9; }
        .admin-notify-item:last-child { border-bottom: none; }
        .admin-menu-btn, .admin-close-btn {
          border: 1px solid #d1d5db; background: #fff;
          color: #374151; border-radius: 10px; padding: 8px 11px; cursor: pointer;
        }
        .admin-close-btn { padding: 6px 10px; font-size: 12px; }
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
        <button
          type="button"
          className="admin-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="admin-brand">
          <div>
            <p style={{ fontSize: 15, color: '#111827', fontWeight: 800, margin: 0 }}>Mentora</p>
            <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12 }}>Admin</p>
          </div>
          <button
            type="button"
            className="admin-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <div className="admin-sidebar-body">
          <nav className="admin-links">
            {adminSections.map((section) => (
              <div key={section.label}>
                <div className="admin-section-label">{section.label}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {section.links.map((link) => {
                    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`admin-link ${active ? 'active' : ''}`}
                      >
                        <span className="admin-link-icon">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-spacer" />

          <Link href="/dashboard/admin/profile" onClick={() => setSidebarOpen(false)} className="admin-profile-link">
            <div className="admin-profile">
              <div className="admin-profile-main">
                <div className="admin-avatar">AP</div>
                <div style={{ minWidth: 0 }}>
                  <div className="admin-profile-name">Nuwan Perera</div>
                  <div className="admin-profile-role">Admin</div>
                </div>
              </div>
              <div className="admin-muted" style={{ color: '#94a3b8' }}>⟶</div>
            </div>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <div>
            <h1 className="admin-title" style={{ margin: 0 }}>Admin Dashboard</h1>
            <div className="admin-muted">Overview</div>
          </div>
          <div className="admin-right">
            <button
              type="button"
              className="admin-notify-btn"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              aria-label="Open notifications"
            >
              🔔
              {notifications.length > 0 && <span className="admin-notify-dot" />}
            </button>

            {notificationsOpen && (
              <div className="admin-notify-panel">
                <div className="admin-notify-head">Notifications ({notifications.length})</div>
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="admin-notify-item"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="admin-muted">Admin</div>
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
