import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Ticket as TicketIcon,
  Video,
  Activity,
  Layers,
  Box,
  MapPin,
  FileSpreadsheet,
  Users,
  Wrench,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTicketStore } from '../../store/ticketStore';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { selectedRole, currentUser } = useAuthStore();
  const { tickets } = useTicketStore();

  const isMobileDrawer = Boolean(onClose);

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const assignedCount = tickets.filter(
    (t) => t.status === 'assigned' || t.status === 'in_progress'
  ).length;

  const navItems = [
    // Student & Teacher Specific Navigation
    {
      to: '/',
      label: selectedRole === 'student' || selectedRole === 'teacher' ? 'My Complaint Dashboard' : 'Campus Overview',
      icon: LayoutDashboard,
      roles: ['student', 'teacher', 'admin', 'manager', 'employee'],
    },
    {
      to: '/report-fault',
      label: 'File a Complaint',
      icon: PlusCircle,
      badge: 'Quick',
      badgeColor: 'bg-maroon-50 text-maroon-800 border-maroon-200',
      roles: ['student', 'teacher', 'admin', 'manager', 'employee'],
    },
    {
      to: '/my-tickets',
      label: 'My Ongoing Complaints',
      icon: TicketIcon,
      badge: openCount > 0 && (selectedRole === 'student' || selectedRole === 'teacher') ? `${openCount}` : undefined,
      badgeColor: 'bg-maroon-50 text-maroon-800 border-maroon-200',
      roles: ['student', 'teacher'],
    },

    // Employee / Tech / Admin / Manager Tasks view
    {
      to: '/assigned-tasks',
      label: selectedRole === 'employee' ? 'My Assigned Tasks' : 'Work Orders & Tasks',
      icon: Wrench,
      badge: assignedCount > 0 ? `${assignedCount}` : undefined,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      roles: ['employee', 'manager', 'admin'],
    },

    // Manager / Admin Views
    {
      to: '/ticket-queue',
      label: 'Department Triage',
      icon: Layers,
      badge: openCount > 0 ? `${openCount} Open` : undefined,
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      roles: ['manager', 'admin'],
    },
    {
      to: '/cctv-monitoring',
      label: 'CCTV LED Vision AI',
      icon: Video,
      badge: 'Gemini AI',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      roles: ['admin', 'manager'],
    },
    {
      to: '/predictive-maintenance',
      label: 'Predictive Assets AI',
      icon: Activity,
      badge: 'Risk Engine',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      roles: ['admin', 'manager'],
    },
    {
      to: '/asset-registry',
      label: 'Asset Registry & QR',
      icon: Box,
      roles: ['manager', 'admin', 'employee'],
    },
    {
      to: '/risk-map',
      label: 'Campus Risk Map',
      icon: MapPin,
      roles: ['admin', 'manager'],
    },
    {
      to: '/analytics-reports',
      label: 'Analytics & Reports',
      icon: FileSpreadsheet,
      roles: ['admin', 'manager'],
    },
    {
      to: '/user-directory',
      label: 'Campus Directory',
      icon: Users,
      roles: ['admin', 'manager'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(selectedRole));

  return (
    <aside
      className={`w-full h-full bg-white flex flex-col select-none ${
        isMobileDrawer ? '' : 'w-64 border-r border-slate-200 sticky top-16 h-[calc(100vh-4rem)] shadow-sm'
      }`}
    >
      {/* Mobile Drawer Top Brand Bar */}
      {isMobileDrawer && (
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-maroon-800 flex items-center justify-center font-serif font-black text-xs text-white">
              MIT
            </div>
            <div>
              <div className="font-extrabold text-xs text-maroon-950">MIT ACSC CampusCare</div>
              <div className="text-[10px] text-slate-500">Alandi (D.), Pune</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Role Profile Info Card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3 overflow-hidden">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-maroon-100 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-maroon-800 flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0">
              {currentUser?.displayName?.[0] || 'M'}
            </div>
          )}
          <div className="overflow-hidden">
            <div className="font-bold text-xs text-slate-900 truncate">{currentUser?.displayName}</div>
            <div className="text-[11px] text-maroon-800 font-semibold capitalize flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {selectedRole} Portal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Campus Modules
        </div>

        {visibleNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-maroon-800 text-white shadow-sm shadow-maroon-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-1.5 text-maroon-900 text-xs font-bold mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-maroon-700" />
            <span>MIT ACSC Alandi</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Smart India Hackathon • Vision AI & Predictive Maintenance
          </p>
        </div>
      </div>
    </aside>
  );
};
