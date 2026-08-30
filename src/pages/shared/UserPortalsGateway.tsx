import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  UserCheck,
  Wrench,
  Briefcase,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Layers,
  Activity,
  Video,
  FileSpreadsheet,
  AlertTriangle,
  QrCode,
  Zap,
  Droplets,
  Monitor,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user';
import { DEMO_USERS, COLLEGE_CONFIG } from '../../lib/constants';

interface PortalCardConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  primaryUser: (typeof DEMO_USERS)[0];
  description: string;
  capabilities: string[];
  restrictedFrom?: string[];
  landingRoute: string;
  themeColor: string;
  accentBorder: string;
  bgGradient: string;
  actionText: string;
}

export const UserPortalsGateway: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, selectedRole, switchUserRole, loginWithGoogle } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'academic' | 'operations' | 'executive'>('all');

  const portals: PortalCardConfig[] = [
    {
      role: 'student',
      title: 'Student Portal',
      subtitle: 'Classroom & Campus Infrastructure Access',
      badge: 'Academic Tier',
      badgeColor: 'bg-maroon-50 text-maroon-800 border-maroon-200',
      icon: GraduationCap,
      primaryUser: DEMO_USERS.find((u) => u.role === 'student') || DEMO_USERS[0],
      description:
        'Designed for students to rapidly report classroom breakdowns, scan equipment QR codes, and track ticket status in real-time.',
      capabilities: [
        '30-second AI Fault Reporting Wizard',
        '5-Second Smartphone QR Barcode Scanning',
        'Personal Ticket Tracker with 5-Star Feedback',
        'Campus Emergency SOS & Safety Helpline',
        'Campus Risk Heat Map Inspection',
      ],
      restrictedFrom: ['Department Triage', 'CCTV Night Vision AI', 'Technician Dispatch'],
      landingRoute: '/',
      themeColor: 'text-maroon-800',
      accentBorder: 'border-maroon-800 hover:ring-maroon-800/20',
      bgGradient: 'from-maroon-900/10 via-maroon-800/5 to-transparent',
      actionText: 'Launch Student Portal',
    },
    {
      role: 'teacher',
      title: 'Teacher & Faculty Portal',
      subtitle: 'Lecture Hall & Lab Facilities Desk',
      badge: 'Faculty Tier',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: UserCheck,
      primaryUser: DEMO_USERS.find((u) => u.role === 'teacher') || DEMO_USERS[1],
      description:
        'Tailored for teaching faculty and HODs to submit priority lecture hall tickets, request AV / projector repairs, and track academic wing maintenance.',
      capabilities: [
        'Priority Classroom & Lab Fault Escalation',
        'Smart Podium, Projector & Audio-Visual Triage',
        'Faculty Department Ticket Tracking',
        '5-Second QR Scanning on Lab Assets',
        'Campus Risk Radar & Maintenance Notifications',
      ],
      restrictedFrom: ['Assigning Technicians', 'CCTV Video Feeds', 'BI Cost Accounting'],
      landingRoute: '/',
      themeColor: 'text-blue-700',
      accentBorder: 'border-blue-600 hover:ring-blue-600/20',
      bgGradient: 'from-blue-900/10 via-blue-800/5 to-transparent',
      actionText: 'Launch Faculty Portal',
    },
    {
      role: 'employee',
      title: 'Technician & Operations Portal',
      subtitle: 'Field Maintenance & Work Order Execution',
      badge: 'Operations Tier',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Wrench,
      primaryUser: DEMO_USERS.find((u) => u.role === 'employee') || DEMO_USERS[2],
      description:
        'Field dashboard for certified electricians, plumbers, and AV technicians to triage assigned work orders, log spare parts, and verify fixes.',
      capabilities: [
        'Live Assigned Tasks & Priority Work Orders',
        'SLA Target Countdown Timer & Overdue Alerts',
        'Spare Parts & Actual Maintenance Cost Logging',
        'Photo Proof Upload & Resolution Notes',
        'Instant A4 PDF Work Order Generation',
      ],
      restrictedFrom: ['Staff Management', 'Executive BI Reports', 'System Configuration'],
      landingRoute: '/assigned-tasks',
      themeColor: 'text-amber-700',
      accentBorder: 'border-amber-600 hover:ring-amber-600/20',
      bgGradient: 'from-amber-900/10 via-amber-800/5 to-transparent',
      actionText: 'Launch Technician Portal',
    },
    {
      role: 'manager',
      title: 'Facilities & Estate Manager Portal',
      subtitle: 'Department Triage & AI Diagnostics',
      badge: 'Management Tier',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: Briefcase,
      primaryUser: DEMO_USERS.find((u) => u.role === 'manager') || DEMO_USERS[5],
      description:
        'Full administrative suite for estate managers to assign work orders to technicians, review CCTV Gemini Night scans, and inspect predictive breakdown risks.',
      capabilities: [
        'Central Department Triage & Work Order Queue',
        'CCTV Night LED Vision AI Automated Defect Scanner',
        'Predictive Maintenance Breakdown Probability Engine',
        'QR Asset Registry & Equipment Tagging',
        'Technician Workload & Utilization Oversight',
      ],
      restrictedFrom: ['Principal Security Clearance'],
      landingRoute: '/ticket-queue',
      themeColor: 'text-purple-700',
      accentBorder: 'border-purple-600 hover:ring-purple-600/20',
      bgGradient: 'from-purple-900/10 via-purple-800/5 to-transparent',
      actionText: 'Launch Manager Portal',
    },
    {
      role: 'admin',
      title: 'Principal & Executive Admin Portal',
      subtitle: 'Directorate Governance & Institutional BI',
      badge: 'Executive Clearance',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: Shield,
      primaryUser: DEMO_USERS.find((u) => u.role === 'admin') || DEMO_USERS[6],
      description:
        'Executive dashboard for college leadership to monitor campus-wide SLA velocity, campus risk heat map, quarterly maintenance expenditure, and staff directory.',
      capabilities: [
        'Campus Infrastructure Risk Spatial Heat Map',
        'Executive BI Analytics & SLA Compliance Reports',
        'Campus Staff & Certified Technician Directory',
        'Full System-Wide Auditing & Security Controls',
        'Official A4 PDF Directorate Report Export',
      ],
      restrictedFrom: [],
      landingRoute: '/analytics-reports',
      themeColor: 'text-emerald-700',
      accentBorder: 'border-emerald-700 hover:ring-emerald-700/20',
      bgGradient: 'from-emerald-900/10 via-emerald-800/5 to-transparent',
      actionText: 'Launch Principal Portal',
    },
  ];

  const handleLaunchPortal = (portal: PortalCardConfig) => {
    switchUserRole(portal.role);
    navigate(portal.landingRoute);
  };

  const handleSelectSpecificUser = (user: (typeof DEMO_USERS)[0]) => {
    loginWithGoogle(user.email, user.displayName, user.role);
    navigate(
      user.role === 'admin'
        ? '/analytics-reports'
        : user.role === 'manager'
        ? '/ticket-queue'
        : user.role === 'employee'
        ? '/assigned-tasks'
        : '/'
    );
  };

  const filteredPortals = portals.filter((p) => {
    if (selectedFilter === 'academic') return p.role === 'student' || p.role === 'teacher';
    if (selectedFilter === 'operations') return p.role === 'employee' || p.role === 'manager';
    if (selectedFilter === 'executive') return p.role === 'admin' || p.role === 'manager';
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="p-6 sm:p-10 bg-gradient-to-br from-maroon-800 via-maroon-900 to-slate-950 text-white rounded-3xl shadow-xl shadow-maroon-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white/90 border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>MIT ACSC Alandi • Multi-Role Access Gateway</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            CampusCare Multi-Role Portal Directory
          </h1>

          <p className="text-xs sm:text-sm text-maroon-100 max-w-2xl leading-relaxed">
            Institutional access control directory dividing Student, Faculty, Technician, Manager, and Principal portals. Each webpage is strictly isolated with role-specific tools, permissions, and security tiers.
          </p>

          {/* Active User Indicator */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 bg-black/30 border border-white/20 rounded-2xl flex items-center gap-2.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Currently Active Portal:</span>
              <span className="font-bold text-amber-300 uppercase tracking-wide">
                {selectedRole} Portal
              </span>
              <span className="text-white/60">({currentUser?.displayName})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Select & Access Dedicated User Portals
          </h2>
          <p className="text-xs text-slate-500">
            5 distinct portals configured for MIT ACSC stakeholders
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All 5 Portals' },
            { id: 'academic', label: 'Student & Faculty' },
            { id: 'operations', label: 'Operations & Tech' },
            { id: 'executive', label: 'Directorate / Admin' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === f.id
                  ? 'bg-maroon-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Main Portal Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPortals.map((portal) => {
          const Icon = portal.icon;
          const isCurrent = selectedRole === portal.role;

          return (
            <div
              key={portal.role}
              className={`white-card p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-5 border-2 transition-all relative overflow-hidden group hover:shadow-lg ${
                isCurrent
                  ? 'border-maroon-800 ring-2 ring-maroon-800/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Active Badge if currently logged in */}
              {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-maroon-800 text-white text-[10px] font-mono font-bold rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  <span>CURRENT ACTIVE SESSION</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0 transition transform group-hover:scale-105 ${
                      isCurrent ? 'bg-maroon-800 text-white' : 'bg-slate-100 text-slate-800 group-hover:bg-maroon-800 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="overflow-hidden flex-1 pr-16">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{portal.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{portal.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {portal.description}
                </p>

                {/* Primary User Account Details Box */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Designated Stakeholder Account</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">● Active Institutional Profile</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{portal.primaryUser.displayName}</span>
                    <span className="font-mono text-[11px] text-slate-500">{portal.primaryUser.collegeId || portal.primaryUser.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <Mail className="w-3 h-3 text-maroon-700 shrink-0" />
                    <span className="truncate">{portal.primaryUser.email}</span>
                  </div>
                </div>

                {/* Capabilities List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Portal Modules & Features:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                    {portal.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-maroon-700 shrink-0" />
                        <span className="truncate">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleLaunchPortal(portal)}
                  className={`flex-1 py-3 px-5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 ${
                    isCurrent
                      ? 'bg-maroon-800 hover:bg-maroon-900 text-white'
                      : 'bg-slate-900 hover:bg-maroon-800 text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Enter Active Portal Dashboard' : portal.actionText}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Staff / Technician Quick Select Section */}
      <div className="white-card p-6 sm:p-8 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-maroon-800" />
              <span>Campus Field Technicians Trade Accounts</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct access to individual trade technicians for specific maintenance departments
            </p>
          </div>
          <span className="px-3 py-1 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-full border border-maroon-200 w-fit">
            3 Specialized Trades
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {DEMO_USERS.filter((u) => u.role === 'employee').map((tech) => {
            const isTechCurrent = currentUser?.uid === tech.uid;
            return (
              <div
                key={tech.uid}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-maroon-300 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-mono font-bold capitalize">
                      {tech.department} Trade
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{tech.employeeId}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{tech.displayName}</div>
                  <div className="text-slate-500 font-mono text-[11px] truncate mt-0.5">{tech.email}</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Phone: <span className="font-mono font-medium text-slate-800">{tech.phone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectSpecificUser(tech)}
                  className="w-full py-2 bg-white hover:bg-maroon-800 hover:text-white text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isTechCurrent ? 'Active Work Orders' : `Switch to ${tech.displayName.split(' ')[0]}`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Institutional Security & Single Sign-On Guidelines */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-maroon-800 rounded-2xl text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Institutional Single Sign-On (SSO) & Access Security
            </h4>
            <p className="text-xs text-slate-400">
              Role-Based Access Control (RBAC) enforced per Savitribai Phule Pune University & NAAC Guidelines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <div className="font-bold text-white">Domain Restriction</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Logins are authenticated exclusively for verified institutional email handles (<code>@mitacsc.edu.in</code>).
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <div className="font-bold text-white">Zero Cross-Role Leakage</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Student accounts cannot view staff queues or CCTV AI telemetry. Administrative controls require Principal clearance.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <div className="font-bold text-white">Automatic SLA Logging</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every dispatched work order logs reporter ID, timestamp, and technician resolution proof into immutable records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
