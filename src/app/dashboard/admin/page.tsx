'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAdminStats, getTutors } from '@/services/adminApi';
import { revenueData, userAcquisitionData } from '@/data/adminData';
import Spinner from '@/components/ui/Spinner';

function StatCard({ title, value, accent, loading }: { title: string; value: string; accent: string; loading: boolean }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 44, height: 32, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>▣</div>
      </div>
      <div style={{ color: '#6b7280', fontSize: 13 }}>{title}</div>
      <div style={{ color: '#111827', fontSize: 28, fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center' }}>
        {loading ? <Spinner size={22} /> : value}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  // Backend returns: { totalUsers, totalTutors, totalStudents, totalCourses }
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalCourses: 0,
  });
  const [tutors, setTutors]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const statsData = await getAdminStats();
        setStats(statsData);

        const tutorsData = await getTutors();
        setTutors(tutorsData.slice(0, 3));
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Could not load data. Make sure your backend is running on port 5000.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>Admin Overview</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Welcome back! Here&apos;s what&apos;s happening on Mentora today.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat Cards — consistent with Tutors/Students/Sessions style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Users"    value={stats.totalUsers.toString()}    accent="#0f766e" loading={loading} />
        <StatCard title="Total Tutors"   value={stats.totalTutors.toString()}   accent="#27c3ff" loading={loading} />
        <StatCard title="Total Students" value={stats.totalStudents.toString()} accent="#1d4ed8" loading={loading} />
        <StatCard title="Total Courses"  value={stats.totalCourses.toString()}  accent="#7c3aed" loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2"
          style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Monthly Revenue Growth</h3>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>Jan – Jun 2024</p>
          <div style={{ height: 220 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Spinner size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `LKR ${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>User Acquisition</h3>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>Tutors vs Students</p>
          <div style={{ height: 220 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Spinner size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userAcquisitionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8 }} />
                  <Bar dataKey="students" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="tutors"   fill="#D1FAE5" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tutors from real API */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Recent Tutors</h3>
          <a href="/dashboard/admin/tutors" style={{ fontSize: 13, color: '#10B981', fontWeight: 600, textDecoration: 'none' }}>View All</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Tutor Name</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>Subjects</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>City</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center' }}><Spinner size={22} /></td></tr>
              ) : tutors.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>No tutors found</td></tr>
              ) : tutors.map((tutor) => (
                // Backend returns: { id, full_name, email, subjects, city, created_at }
                <tr key={tutor.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#059669', fontSize: 13 }}>
                        {tutor.full_name?.charAt(0) || 'T'}
                      </div>
                      <span style={{ fontWeight: 500, color: '#111827' }}>{tutor.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px', color: '#6B7280' }}>{tutor.email}</td>
                  <td style={{ padding: '14px 24px', color: '#6B7280' }}>{tutor.subject}</td>
                  <td style={{ padding: '14px 24px', color: '#6B7280' }}>{tutor.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
