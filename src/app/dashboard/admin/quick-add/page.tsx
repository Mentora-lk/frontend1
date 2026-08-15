'use client';

import { useState } from 'react';
import { createTutor, createStudent, createSession, createAd } from '@/services/adminApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #d1d5db',
  background: '#fff', color: '#111827', fontSize: 14, transition: 'border-color 0.15s',
};
const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: '#fca5a5' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const fieldErrorStyle: React.CSSProperties = { color: '#dc2626', fontSize: 12, marginTop: 4 };
const sectionCardStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)', overflow: 'hidden' };
const sectionHeaderStyle: React.CSSProperties = { padding: '20px 24px', borderBottom: '1px solid #ecf4ef', display: 'flex', alignItems: 'center', gap: 12 };
const iconBoxStyle = (bg: string): React.CSSProperties => ({ width: 38, height: 38, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16, flexShrink: 0 });
const submitButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg,#0f766e,#14b8a6)', color: '#fff', border: 'none',
  borderRadius: 10, padding: '12px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14,
};

function Banner({ type, text }: { type: 'success' | 'error'; text: string }) {
  const isSuccess = type === 'success';
  return (
    <div style={{
      background: isSuccess ? '#ecfeff' : '#FEF2F2',
      border: `1px solid ${isSuccess ? '#99f6e4' : '#FECACA'}`,
      color: isSuccess ? '#0f766e' : '#991B1B',
      borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, fontWeight: 600,
    }}>
      {isSuccess ? '✓ ' : '⚠ '}{text}
    </div>
  );
}

// ── Tutor Section ─────────────────────────────────────────────────────────

function AddTutorSection() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', subject: '', city: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function validate() {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(''); setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await createTutor(form);
      setMessage('Tutor account created successfully.');
      setForm({ fullName: '', email: '', password: '', subject: '', city: '', phone: '' });
      setErrors({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tutor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={sectionCardStyle}>
      <div style={sectionHeaderStyle}>
        <div style={iconBoxStyle('#0f766e')}>🎓</div>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', serif" }}>Add Tutor</h3>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12.5 }}>Create a new tutor account and profile</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 24 }}>
        {message && <Banner type="success" text={message} />}
        {error && <Banner type="error" text={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={errors.fullName ? inputErrorStyle : inputStyle} placeholder="Kasun Perera" />
            {errors.fullName && <div style={fieldErrorStyle}>{errors.fullName}</div>}
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={errors.email ? inputErrorStyle : inputStyle} placeholder="tutor@mentora.lk" />
            {errors.email && <div style={fieldErrorStyle}>{errors.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={errors.password ? inputErrorStyle : inputStyle} placeholder="Min. 8 characters" />
            {errors.password && <div style={fieldErrorStyle}>{errors.password}</div>}
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} placeholder="Physics" />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} placeholder="Colombo" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="0771234567" />
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} style={submitButtonStyle}>{loading ? 'Creating…' : 'Create Tutor'}</button>
        </div>
      </form>
    </div>
  );
}

// ── Student Section ───────────────────────────────────────────────────────

function AddStudentSection() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', gradeLevel: '', schoolInstitute: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function validate() {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(''); setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await createStudent(form);
      setMessage('Student account created successfully.');
      setForm({ fullName: '', email: '', password: '', gradeLevel: '', schoolInstitute: '', phone: '' });
      setErrors({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create student.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={sectionCardStyle}>
      <div style={sectionHeaderStyle}>
        <div style={iconBoxStyle('#1d4ed8')}>🧑‍🎓</div>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', serif" }}>Add Student</h3>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12.5 }}>Create a new student account and profile</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 24 }}>
        {message && <Banner type="success" text={message} />}
        {error && <Banner type="error" text={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={errors.fullName ? inputErrorStyle : inputStyle} placeholder="Aarav Perera" />
            {errors.fullName && <div style={fieldErrorStyle}>{errors.fullName}</div>}
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={errors.email ? inputErrorStyle : inputStyle} placeholder="student@mentora.lk" />
            {errors.email && <div style={fieldErrorStyle}>{errors.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={errors.password ? inputErrorStyle : inputStyle} placeholder="Min. 8 characters" />
            {errors.password && <div style={fieldErrorStyle}>{errors.password}</div>}
          </div>
          <div>
            <label style={labelStyle}>Grade Level</label>
            <input value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} style={inputStyle} placeholder="A/L" />
          </div>
          <div>
            <label style={labelStyle}>School / Institute</label>
            <input value={form.schoolInstitute} onChange={(e) => setForm({ ...form, schoolInstitute: e.target.value })} style={inputStyle} placeholder="Royal College" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="0771234567" />
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} style={submitButtonStyle}>{loading ? 'Creating…' : 'Create Student'}</button>
        </div>
      </form>
    </div>
  );
}

// ── Session Section ───────────────────────────────────────────────────────

function AddSessionSection() {
  const [form, setForm] = useState({ fullName: '', phone: '', school: '', grade: '', email: '', message: '', preferredMode: 'online', selectedDay: '', selectedTime: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function validate() {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Student name is required';
    if (!form.selectedDay.trim()) next.selectedDay = 'Day is required';
    if (!form.selectedTime.trim()) next.selectedTime = 'Time is required';
    if (form.email && !EMAIL_REGEX.test(form.email)) next.email = 'Enter a valid email address';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(''); setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await createSession(form);
      setMessage('Session created successfully.');
      setForm({ fullName: '', phone: '', school: '', grade: '', email: '', message: '', preferredMode: 'online', selectedDay: '', selectedTime: '' });
      setErrors({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create session.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={sectionCardStyle}>
      <div style={sectionHeaderStyle}>
        <div style={iconBoxStyle('#7c3aed')}>📅</div>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', serif" }}>Add Session</h3>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12.5 }}>Manually schedule a session or enrollment</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 24 }}>
        {message && <Banner type="success" text={message} />}
        {error && <Banner type="error" text={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Student Name *</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} style={errors.fullName ? inputErrorStyle : inputStyle} placeholder="Nimasha Silva" />
            {errors.fullName && <div style={fieldErrorStyle}>{errors.fullName}</div>}
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={errors.email ? inputErrorStyle : inputStyle} placeholder="student@mentora.lk" />
            {errors.email && <div style={fieldErrorStyle}>{errors.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="0771234567" />
          </div>
          <div>
            <label style={labelStyle}>School</label>
            <input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} style={inputStyle} placeholder="Visakha Vidyalaya" />
          </div>
          <div>
            <label style={labelStyle}>Grade</label>
            <input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} style={inputStyle} placeholder="O/L" />
          </div>
          <div>
            <label style={labelStyle}>Preferred Mode</label>
            <select value={form.preferredMode} onChange={(e) => setForm({ ...form, preferredMode: e.target.value })} style={inputStyle}>
              <option value="online">Online</option>
              <option value="in-person">In person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Selected Day *</label>
            <input value={form.selectedDay} onChange={(e) => setForm({ ...form, selectedDay: e.target.value })} style={errors.selectedDay ? inputErrorStyle : inputStyle} placeholder="Monday" />
            {errors.selectedDay && <div style={fieldErrorStyle}>{errors.selectedDay}</div>}
          </div>
          <div>
            <label style={labelStyle}>Selected Time *</label>
            <input value={form.selectedTime} onChange={(e) => setForm({ ...form, selectedTime: e.target.value })} style={errors.selectedTime ? inputErrorStyle : inputStyle} placeholder="5:00 PM" />
            {errors.selectedTime && <div style={fieldErrorStyle}>{errors.selectedTime}</div>}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Message (optional)</label>
          <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Looking forward to this class!" />
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} style={submitButtonStyle}>{loading ? 'Creating…' : 'Create Session'}</button>
        </div>
      </form>
    </div>
  );
}

// ── Advertisement Section ─────────────────────────────────────────────────

function AddAdSection() {
  const [form, setForm] = useState({ tutorId: '', title: '', description: '', price: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function validate() {
    const next: Record<string, string> = {};
    if (!form.tutorId.trim()) next.tutorId = 'Tutor ID is required';
    else if (isNaN(Number(form.tutorId))) next.tutorId = 'Tutor ID must be a number';
    if (!form.title.trim()) next.title = 'Title is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(''); setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await createAd({ ...form, tutorId: Number(form.tutorId) });
      setMessage('Advertisement created successfully.');
      setForm({ tutorId: '', title: '', description: '', price: '' });
      setErrors({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create advertisement.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={sectionCardStyle}>
      <div style={sectionHeaderStyle}>
        <div style={iconBoxStyle('#d97706')}>📣</div>
        <div>
          <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces', serif" }}>Create Advertisement</h3>
          <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12.5 }}>Post an advertisement on behalf of a tutor</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 24 }}>
        {message && <Banner type="success" text={message} />}
        {error && <Banner type="error" text={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Tutor ID *</label>
            <input type="number" value={form.tutorId} onChange={(e) => setForm({ ...form, tutorId: e.target.value })} style={errors.tutorId ? inputErrorStyle : inputStyle} placeholder="See ID on Tutors page" />
            {errors.tutorId && <div style={fieldErrorStyle}>{errors.tutorId}</div>}
          </div>
          <div>
            <label style={labelStyle}>Price</label>
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={inputStyle} placeholder="LKR 2,500" />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={errors.title ? inputErrorStyle : inputStyle} placeholder="A/L Physics — Individual & Group Classes" />
          {errors.title && <div style={fieldErrorStyle}>{errors.title}</div>}
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Experienced tutor offering..." />
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} style={submitButtonStyle}>{loading ? 'Creating…' : 'Create Advertisement'}</button>
        </div>
      </form>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function QuickAddPage() {
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 30, fontWeight: 900, fontFamily: "'Fraunces', serif" }}>Quick Add</h2>
        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Manually create tutors, students, sessions, and advertisements.</p>
      </div>

      <AddTutorSection />
      <AddStudentSection />
      <AddSessionSection />
      <AddAdSection />
    </div>
  );
}
