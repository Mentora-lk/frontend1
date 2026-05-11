'use client';

import { useEffect, useState } from 'react';
import { CreditCard, GraduationCap, Users, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAdminStats, getTutors } from '@/services/adminApi';
import { revenueData, userAcquisitionData } from '@/data/adminData';

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

  // Backend field names: totalUsers, totalTutors, totalStudents, totalCourses
  const statCards = [
    { title: 'Total Users',    value: stats.totalUsers.toString(),    icon: Users         },
    { title: 'Total Tutors',   value: stats.totalTutors.toString(),   icon: GraduationCap },
    { title: 'Total Students', value: stats.totalStudents.toString(), icon: CreditCard    },
    { title: 'Total Courses',  value: stats.totalCourses.toString(),  icon: BookOpen      },
  ];

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

      {/* Stat Cards — using real backend fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <card.icon size={20} color="#059669" />
            </div>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>{card.title}</p>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
              {loading ? '...' : card.value}
            </span>
          </div>
        ))}
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
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>User Acquisition</h3>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>Tutors vs Students</p>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userAcquisitionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: 8 }} />
                <Bar dataKey="students" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="tutors"   fill="#D1FAE5" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tutors from real API */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Recent Tutors</h3>
          <button style={{ fontSize: 13, color: '#10B981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
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
                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#9CA3AF' }}>Loading...</td></tr>
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
                  <td style={{ padding: '14px 24px', color: '#6B7280' }}>{tutor.subjects}</td>
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
