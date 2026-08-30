import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  LogOut,
  Menu,
  GraduationCap,
  UserCheck,
  Wrench,
  Briefcase,
  Shield,
  PlusCircle,
  Bell,
  Check,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { EmergencySOSModal } from '../common/EmergencySOSModal';
import { useTicketStore } from '../../store/ticketStore';

const ROLE_ICON_MAP = {
  student: GraduationCap,
  teacher: UserCheck,
  employee: Wrench,
  manager: Briefcase,
  admin: Shield,
};

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { currentUser, selectedRole, logout } = useAuthStore();
  const { tickets } = useTicketStore();
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const openTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'assigned').length;
  const criticalCount = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length;
  const RoleIcon = ROLE_ICON_MAP[selectedRole] || GraduationCap;
  const isStudentOrTeacher = selectedRole === 'student' || selectedRole === 'teacher';

  // Strict user-specific notification filtering
  const myNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) => {
      // 1. Direct match with current user's UID
      if (n.userId === currentUser.uid) return true;
      // 2. Global system broadcast
      if (n.userId === 'broadcast') return true;
      // 3. Department technician match (e.g. user-electrician-01, user-plumber-01)
      if (
        currentUser.role === 'employee' &&
        currentUser.department &&
        n.userId === `user-${currentUser.department}-01`
      ) {
        return true;
      }
      // 4. Estate Manager / Admin work order notices
      if (
        (currentUser.role === 'manager' || currentUser.role === 'admin') &&
        (n.userId === 'user-manager-01' || n.userId === 'user-admin-01')
      ) {
        return true;
      }
      return false;
    });
  }, [notifications, currentUser]);

  const myUnreadCount = myNotifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Mobile Menu & MIT ACSC Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              {/* MIT ACSC Maroon Logo */}
              <div className="w-10 h-10 rounded-xl bg-maroon-800 flex items-center justify-center text-white shadow-md shadow-maroon-900/20 ring-2 ring-maroon-100 shrink-0 group-hover:scale-105 transition">
                <span className="font-serif font-black text-sm tracking-tighter">MIT</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-maroon-900 tracking-tight">
                    MIT ACSC <span className="font-normal text-slate-600">CampusCare</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-maroon-50 text-maroon-800 text-[10px] font-mono font-bold rounded-full border border-maroon-200">
                    Alandi (D.), Pune
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden md:block">
                  Smart Infrastructure • CCTV AI Vision • Realtime Maintenance
                </p>
              </div>
            </Link>
          </div>

          {/* Middle: Active Role Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs shadow-2xs">
              <RoleIcon className="w-3.5 h-3.5 text-maroon-800" />
              <span className="font-bold text-slate-900 capitalize">{selectedRole} Portal</span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">● Active</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Quick File Complaint Button for Students/Teachers */}
            {isStudentOrTeacher && (
              <Link
                to="/report-fault"
                className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">File Complaint</span>
              </Link>
            )}

            {/* Real-time Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setShowProfileMenu(false);
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-700" />
                {myUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full animate-pulse ring-2 ring-white">
                    {myUnreadCount}
                  </span>
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 text-xs animate-in fade-in duration-150 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-maroon-800" />
                      <span>Live Notifications</span>
                      {myUnreadCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-full">
                          {myUnreadCount} New
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {myUnreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded text-[11px] font-semibold flex items-center gap-1"
                          title="Mark all as read"
                        >
                          <Check className="w-3 h-3" />
                          <span>Read All</span>
                        </button>
                      )}
                      {myNotifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded text-[11px]"
                          title="Clear all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                    {myNotifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        No notifications for your account.
                      </div>
                    ) : (
                      myNotifications.slice(0, 15).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.linkedTicketId) {
                              setShowNotificationMenu(false);
                              if (selectedRole === 'student' || selectedRole === 'teacher') {
                                navigate('/my-tickets');
                              } else if (selectedRole === 'employee') {
                                navigate('/assigned-tasks');
                              } else {
                                navigate('/assigned-tasks');
                              }
                            }
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            !notif.isRead
                              ? 'bg-maroon-50/70 border-maroon-200'
                              : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-900 text-xs">{notif.title}</div>
                            <span className="text-[9px] font-mono text-slate-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              title="Broadcast Emergency Hazard"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency SOS</span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotificationMenu(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-maroon-800 text-white font-bold text-xs flex items-center justify-center">
                  {currentUser?.displayName?.[0] || 'M'}
                </div>
                <div className="hidden xl:block text-left pr-1">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {currentUser?.displayName?.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-maroon-800 capitalize font-medium">
                    {selectedRole}
                  </div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 text-xs animate-in fade-in duration-150 space-y-3">
                  <div className="pb-3 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser?.displayName}</div>
                    <div className="text-slate-500 font-mono text-[11px] truncate">{currentUser?.email}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-maroon-50 text-maroon-800 border border-maroon-100 rounded-lg text-[10px] font-bold uppercase">
                      <RoleIcon className="w-3 h-3 text-maroon-800" />
                      <span>{selectedRole} Portal Active</span>
                    </div>
                  </div>

                  <div className="py-1 space-y-1 text-slate-600">
                    <div className="flex justify-between py-1">
                      <span>Active Tickets:</span>
                      <span className="font-bold text-slate-900">{openTicketsCount}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Critical Priority:</span>
                      <span className="font-bold text-rose-600">{criticalCount}</span>
                    </div>
                  </div>

                  {/* Direct Sign Out Button */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 flex items-center justify-center gap-2 font-bold transition border border-slate-200 hover:border-rose-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Modal */}
      <EmergencySOSModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </>
  );
};
