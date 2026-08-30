import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  Mail,
  Key,
  LogOut,
  Menu,
  Users,
  Layers,
  ArrowRight,
  GraduationCap,
  UserCheck,
  Wrench,
  Briefcase,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { COLLEGE_CONFIG } from '../../lib/constants';
import { EmergencySOSModal } from '../common/EmergencySOSModal';
import { GeminiKeyModal } from '../common/GeminiKeyModal';
import { EmailSentHistoryModal } from '../common/EmailSentHistoryModal';
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
  const { currentUser, selectedRole, logout, customGeminiApiKey } = useAuthStore();
  const { tickets } = useTicketStore();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isGeminiKeyOpen, setIsGeminiKeyOpen] = useState(false);
  const [isEmailLogOpen, setIsEmailLogOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const openTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'assigned').length;
  const criticalCount = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length;
  const RoleIcon = ROLE_ICON_MAP[selectedRole] || GraduationCap;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
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
                  Smart Infrastructure • CCTV AI Vision • Predictive Maintenance
                </p>
              </div>
            </Link>
          </div>

          {/* Middle: Active Role Badge & Portals Directory Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs">
              <RoleIcon className="w-3.5 h-3.5 text-maroon-800" />
              <span className="font-bold text-slate-900 capitalize">{selectedRole} Portal</span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">● Active</span>
            </div>

            <Link
              to="/portals"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-maroon-50 hover:bg-maroon-100 text-maroon-900 border border-maroon-200 text-xs font-bold transition shadow-xs"
              title="Open Multi-Role Portals Directory"
            >
              <Users className="w-3.5 h-3.5 text-maroon-800" />
              <span>Portals Gateway</span>
              <span className="px-1.5 py-0.2 bg-maroon-800 text-white text-[9px] rounded-full font-mono font-bold">
                5 Roles
              </span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Portals Gateway Link for Mobile/Tablet */}
            <Link
              to="/portals"
              className="lg:hidden p-2 rounded-xl bg-maroon-50 text-maroon-800 border border-maroon-200 text-xs font-bold flex items-center gap-1"
              title="Portals Gateway"
            >
              <Users className="w-4 h-4 text-maroon-800" />
            </Link>

            {/* Gemini Key Config */}
            <button
              onClick={() => setIsGeminiKeyOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                customGeminiApiKey
                  ? 'bg-maroon-50 border-maroon-300 text-maroon-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Gemini 2.0 Flash AI Settings"
            >
              <Key className="w-3.5 h-3.5 text-maroon-700" />
              <span className="hidden xl:inline text-[11px]">
                {customGeminiApiKey ? 'Gemini AI Active' : 'Gemini Key'}
              </span>
            </button>

            {/* Email & PDF Logs */}
            <button
              onClick={() => setIsEmailLogOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Inspect Outbound Emails & PDF Work Orders"
            >
              <Mail className="w-3.5 h-3.5 text-maroon-700" />
              <span className="hidden sm:inline text-[11px]">Email & PDF Logs</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
              title="Broadcast Emergency Hazard"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency SOS</span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
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

                  {/* Switch Portal Link */}
                  <Link
                    to="/portals"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full p-2.5 rounded-xl bg-maroon-50 hover:bg-maroon-100 text-maroon-900 border border-maroon-200 flex items-center justify-between font-bold transition"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-maroon-800" />
                      <span>Portals & Users Gateway</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-maroon-800" />
                  </Link>

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

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 flex items-center justify-center gap-2 font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <EmergencySOSModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      <GeminiKeyModal isOpen={isGeminiKeyOpen} onClose={() => setIsGeminiKeyOpen(false)} />
      <EmailSentHistoryModal isOpen={isEmailLogOpen} onClose={() => setIsEmailLogOpen(false)} />
    </>
  );
};
