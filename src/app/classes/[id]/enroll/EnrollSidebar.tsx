import Link from 'next/link';

interface EnrollSidebarProps {
  courseId: number;
  title: string;
  image: string;
  tutorName: string;
  tutorAvatar: string;
  fee: number;
  mode: string;
  location: string;
  enrolled: number;
  maxStudents: number;
  currentStep: number;
}

export default function EnrollSidebar({
  courseId, title, image, tutorName, tutorAvatar,
  fee, mode, location, enrolled, maxStudents, currentStep,
}: EnrollSidebarProps) {
  const spotsLeft = maxStudents - enrolled;
  const fillPct   = Math.round((enrolled / maxStudents) * 100);

  return (
    <div style={{ position: 'sticky', top: 84 }}>
      {/* Course card */}
      <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)', marginBottom: 16 }}>
        <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
          <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)' }}/>
          <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>LKR {fee.toLocaleString()}<span style={{ fontWeight: 400, opacity: 0.7 }}>/mo</span></span>
            <span style={{ fontSize: 10, fontWeight: 700, color: mode === 'online' ? '#34D399' : mode === 'offline' ? '#93C5FD' : '#FCD34D', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{mode}</span>
          </div>
        </div>

        <div style={{ padding: '16px 18px' }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4, marginBottom: 10 }}>{title}</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <img src={tutorAvatar} alt={tutorName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #d1fae5' }}/>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>{tutorName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0FDF4', padding: '10px 14px', borderRadius: 10, border: '1px solid #D1FAE5' }}>
            <span style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>Status</span>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 800 }}>● Open for Enrollment</span>
          </div>

          <Link href={`/classes/${courseId}`}>
            <button style={{ width: '100%', marginTop: 14, background: 'none', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '9px', fontSize: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; }}>
              ← View Class Details
            </button>
          </Link>
        </div>
      </div>

      {/* Step tracker */}
      {currentStep < 4 && (
        <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: 14 }}>Your Progress</p>
          {[{ n: 1, label: 'Personal Details' }, { n: 2, label: 'Pick Schedule' }, { n: 3, label: 'Confirm & Submit' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: currentStep > s.n ? '#10B981' : currentStep === s.n ? 'linear-gradient(135deg,#10B981,#059669)' : '#F3F4F6', transition: 'all 0.3s' }}>
                {currentStep > s.n
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: currentStep >= s.n ? 'white' : '#9CA3AF' }}>{s.n}</span>
                }
              </div>
              <span style={{ fontSize: 13, fontWeight: currentStep === s.n ? 700 : 400, color: currentStep === s.n ? '#10B981' : currentStep > s.n ? '#059669' : '#9CA3AF', transition: 'color 0.3s' }}>
                {s.label}
              </span>
              {currentStep === s.n && <span style={{ marginLeft: 'auto', fontSize: 10, background: '#ECFDF5', color: '#059669', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>Current</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}