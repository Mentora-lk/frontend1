'use client';

import { useState } from 'react';
import {
  AlertCircle, CheckCircle, Users, Search, MoreHorizontal,
  MapPin, Eye, X, FileText, XCircle
} from 'lucide-react';
import { StatCard, StatusBadge } from '@/components/ui';
import { tutorVerifications } from '@/lib/data';

type Tutor = typeof tutorVerifications[0];

export default function TutorsPage() {
  const [selectedTutor, setSelectedTutor]   = useState<Tutor | null>(null);
  const [searchQuery,   setSearchQuery]     = useState('');
  const [statusFilter,  setStatusFilter]    = useState('All');
  const [subjectFilter, setSubjectFilter]   = useState('Science');

  const filteredTutors = tutorVerifications.filter((tutor) => {
    const matchesSearch  = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus  = statusFilter === 'All' || tutor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Tutor Verification</h2>
          <p className="text-slate-400 text-sm mt-1">Review and approve tutor applications for the marketplace.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Review"  value="24"    trend="up"   trendValue="+5% from yesterday"  icon={AlertCircle}  colorClass="text-amber-400" />
        <StatCard title="Verified Today"  value="12"    trend="down" trendValue="-2% from yesterday"  icon={CheckCircle}  colorClass="text-cyan-400"  />
        <StatCard title="Total Tutors"    value="1,402" trend="up"   trendValue="+1% growth"          icon={Users}        colorClass="text-blue-400"  />
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by tutor name, email or NIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/50 text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Missing Docs">Missing Docs</option>
            </select>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-900/50 text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="Science">Subject: Science</option>
              <option value="Maths">Subject: Maths</option>
              <option value="IT">Subject: IT</option>
            </select>
            <button className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2.5 rounded-lg transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Tutor Profile</th>
                <th className="px-6 py-4">Subjects</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {filteredTutors.map((tutor) => (
                <tr key={tutor.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                        {tutor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-slate-200 font-medium">{tutor.name}</div>
                        <div className="text-xs text-slate-500">{tutor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-cyan-900/30 text-cyan-400 text-xs font-medium px-2 py-1 rounded border border-cyan-500/20">
                      {tutor.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} /><span>{tutor.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={tutor.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedTutor(tutor)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium text-sm flex items-center justify-end space-x-1 ml-auto"
                    >
                      <Eye size={16} /><span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-700/50 flex justify-between items-center">
          <span className="text-sm text-slate-400">Showing 1 to 10 of 24 applications</span>
          <div className="flex items-center space-x-2">
            <button className="text-slate-400 hover:text-slate-200 text-sm font-medium">Previous</button>
            <button className="w-8 h-8 rounded-lg bg-cyan-500 text-white font-medium text-sm flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-700 text-slate-400 font-medium text-sm flex items-center justify-center">2</button>
            <button className="text-slate-400 hover:text-slate-200 text-sm font-medium">Next</button>
          </div>
        </div>
      </div>

      {/* Slide-over detail panel */}
      {selectedTutor && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedTutor(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-slate-100">Verification Detail</h2>
                <button onClick={() => setSelectedTutor(null)} className="text-slate-400 hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>

              {/* Tutor info */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-700">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xl">
                  {selectedTutor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{selectedTutor.name}</h3>
                  <p className="text-sm text-slate-400">Applied: {selectedTutor.date}</p>
                  <div className="mt-2"><StatusBadge status="Under Review" /></div>
                </div>
              </div>

              {/* Identity */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Identity Verification</h4>
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="h-48 bg-slate-900 flex items-center justify-center">
                    <div className="text-center">
                      <FileText size={48} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">NIC Front</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50">
                    <p className="text-xs text-slate-400">NIC Front</p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Academic Credentials</h4>
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-900/30 rounded-lg">
                      <FileText size={20} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{selectedTutor.credentials || 'No document'}</p>
                      <p className="text-xs text-slate-500">University of Colombo • 2.4 MB</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-200"><Eye size={18} /></button>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Internal Notes (Optional)</h4>
                <textarea
                  placeholder="Add a note or reason for rejection..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-rose-400 py-3 rounded-lg font-medium border border-slate-700"
                >
                  <XCircle size={18} /><span>Reject</span>
                </button>
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium"
                >
                  <CheckCircle size={18} /><span>Approve</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
