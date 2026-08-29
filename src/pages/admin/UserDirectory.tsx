import React, { useState } from 'react';
import { Phone, Mail, CheckCircle2, Search } from 'lucide-react';
import { DEMO_USERS } from '../../lib/constants';

export const UserDirectory: React.FC = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = DEMO_USERS.filter((u) => {
    const matchSearch =
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Staff & Technician Directory
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              {DEMO_USERS.length} Registered Personnel
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Certified plumbers, senior electricians, AV technicians, and department heads
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
          />
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-xs">
        {['all', 'employee', 'manager', 'admin', 'teacher', 'student'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              roleFilter === r
                ? 'bg-maroon-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {r === 'employee' ? 'Technicians' : r}
          </button>
        ))}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => {
          return (
            <div
              key={user.uid}
              className="white-card white-card-hover p-5 rounded-2xl flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-maroon-800 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  {user.displayName[0]}
                </div>

                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{user.displayName}</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-maroon-50 text-maroon-800 border border-maroon-200 shrink-0">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">{user.email}</div>
                  {user.department && (
                    <div className="text-[11px] text-maroon-700 capitalize font-medium mt-1">
                      {user.department} Department
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                {user.employeeId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-mono text-slate-800">{user.employeeId}</span>
                  </div>
                )}
                {user.collegeId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">College ID:</span>
                    <span className="font-mono text-slate-800">{user.collegeId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Duty
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-medium border border-slate-200 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Staff</span>
                  </a>
                )}
                <a
                  href={`mailto:${user.email}`}
                  className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 font-medium border border-slate-200 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-maroon-700" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
