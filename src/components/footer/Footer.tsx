'use client';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: 'white', padding: '64px 6% 28px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 40, marginBottom: 52 }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, marginBottom: 14 }}>
              Mentora<span style={{ color: '#10B981' }}>.lk</span>
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, marginBottom: 22, maxWidth: 240 }}>
              Sri Lanka's leading online tutoring marketplace connecting students and tutors.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'f', title: 'Facebook' },
                { label: 'X', title: 'Twitter/X' },
                { label: 'in', title: 'LinkedIn' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  title={s.title}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700,
                    transition: 'all 0.22s', textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#10B981';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#10B981';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {[
            { heading: 'Explore', links: [{ l: 'Browse Courses', href: '/classes/search' }, { l: 'Become a Tutor', href: '/auth/signup' }, { l: 'Sign In', href: '/auth/login' }] },
            { heading: 'Company', links: [{ l: 'About Us', href: '/about' }, { l: 'Contact Us', href: '/contact' } ] },
            { heading: 'Support', links: [{ l: 'FAQ', href: '/contact' }, { l: 'Contact Support', href: '/contact' } ] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: 18 }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map((l) => (
                  <li key={l.l} style={{ marginBottom: 10 }}>
                    <a
                      href={l.href}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = '#10B981'; }}
                      onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)'; }}
                    >
                      {l.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Mentora.lk · Team Loop 5 · Faculty of IT, University of Moratuwa
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>mentora.lk</p>
        </div>
      </div>
    </footer>
  );
}
