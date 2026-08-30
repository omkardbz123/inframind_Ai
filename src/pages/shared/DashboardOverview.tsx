import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  QrCode,
  Video,
  Wrench,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  MapPin,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTicketStore } from '../../store/ticketStore';
import { useAssetStore } from '../../store/assetStore';
import { useCCTVStore } from '../../store/cctvStore';
import { COLLEGE_CONFIG } from '../../lib/constants';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import { Asset } from '../../types/asset';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, selectedRole } = useAuthStore();
  const { tickets } = useTicketStore();
  const { assets } = useAssetStore();
  const { cameras } = useCCTVStore();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Statistics
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'assigned');
  const criticalTickets = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved');
  const criticalAssets = assets.filter((a) => a.predictiveScore >= 80);
  const cctvFailures = cameras.filter((c) => c.lastAnalysisResult === 'failure_detected');

  const handleQRScanned = (asset: Asset) => {
    navigate('/report-fault');
  };

  return (
    <div className="space-y-6">
      {/* MIT ACSC Maroon Hero Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-br from-maroon-800 via-maroon-900 to-maroon-950 text-white rounded-3xl shadow-xl shadow-maroon-950/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/90 border border-white/20 rounded-full text-[11px] font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>MIT ACSC Alandi • {selectedRole.toUpperCase()} PORTAL ACTIVE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser?.displayName?.split(' ')[0]} 👋
            </h2>
            <p className="text-xs sm:text-sm text-maroon-100 max-w-xl leading-relaxed">
              {selectedRole === 'student'
                ? 'Student Workspace • Quick Fault Reporting, 5s QR Barcode Scanner & Personal Ticket Tracking'
                : selectedRole === 'teacher'
                ? 'Faculty & Classroom Infrastructure • Priority Lecture Hall Escalations, Smart AV & Lab Diagnostics'
                : selectedRole === 'employee'
                ? 'Technician Work Orders • SLA Deadline Triage, Replacement Parts Logging & PDF Work Orders'
                : selectedRole === 'manager'
                ? 'Estate Management Suite • Department Triage, CCTV Night LED Vision AI & Predictive Risk Engine'
                : 'Executive Directorate Command • Campus Infrastructure Risk Radar, SLA BI Reports & Governance'}
            </p>
          </div>

          {/* Clean Action Buttons tailored to role */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            {selectedRole === 'student' || selectedRole === 'teacher' ? (
              <>
                <button
                  onClick={() => navigate('/report-fault')}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-maroon-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 text-maroon-700 shrink-0" />
                  <span>Report a Fault</span>
                </button>
                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>5s QR Scan</span>
                </button>
              </>
            ) : selectedRole === 'employee' ? (
              <>
                <button
                  onClick={() => navigate('/assigned-tasks')}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-maroon-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <Wrench className="w-4 h-4 text-maroon-700 shrink-0" />
                  <span>My Assigned Tasks</span>
                </button>
                <button
                  onClick={() => navigate('/portals')}
                  className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <span>Portals Gateway</span>
                </button>
              </>
            ) : selectedRole === 'manager' ? (
              <>
                <button
                  onClick={() => navigate('/ticket-queue')}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-maroon-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <Layers className="w-4 h-4 text-maroon-700 shrink-0" />
                  <span>Dispatch Queue</span>
                </button>
                <button
                  onClick={() => navigate('/cctv-monitoring')}
                  className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <Video className="w-4 h-4 shrink-0" />
                  <span>CCTV Vision AI</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/analytics-reports')}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-maroon-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <FileText className="w-4 h-4 text-maroon-700 shrink-0" />
                  <span>Executive BI Reports</span>
                </button>
                <button
                  onClick={() => navigate('/risk-map')}
                  className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Campus Risk Radar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* URGENT ATTENTION & HIGH-RISK AREAS PANEL */}
      {(criticalTickets.length > 0 || criticalAssets.length > 0 || cctvFailures.length > 0) && (
        <div className="p-4 sm:p-5 bg-white border-2 border-rose-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-rose-100">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 shrink-0 mt-0.5 sm:mt-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Urgent Attention & High-Risk Alerts
                  </h3>
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-mono font-bold rounded-full uppercase shrink-0">
                    Action Required
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Critical infrastructure bottlenecks, CCTV AI failures, and high predictive breakdown risks
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/risk-map')}
              className="text-xs text-maroon-800 hover:text-maroon-950 font-bold flex items-center gap-1 self-start sm:self-auto hover:underline shrink-0"
            >
              <span>View Campus Risk Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 text-xs">
            {/* Critical Ticket Item */}
            {criticalTickets.slice(0, 1).map((t) => (
              <div
                key={t.id}
                onClick={() => navigate('/ticket-queue')}
                className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200 hover:border-rose-300 transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-700">#{t.id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                    CRITICAL FAULT
                  </span>
                </div>
                <div className="font-bold text-slate-900 truncate">{t.title}</div>
                <div className="text-[11px] text-slate-600 truncate">
                  {t.building} • Room {t.roomNumber || 'Corridor'}
                </div>
              </div>
            ))}

            {/* CCTV Detection Item */}
            {cctvFailures.slice(0, 1).map((c) => (
              <div
                key={c.id}
                onClick={() => navigate('/cctv-monitoring')}
                className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200 hover:border-purple-300 transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-700">{c.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">
                    CCTV AI DEFECT
                  </span>
                </div>
                <div className="font-bold text-slate-900 truncate">{c.areaDescription}</div>
                <div className="text-[11px] text-slate-600">
                  Gemini Vision detected unlit corridor fixtures
                </div>
              </div>
            ))}

            {/* High Risk Asset Item */}
            {criticalAssets.slice(0, 1).map((a) => (
              <div
                key={a.id}
                onClick={() => navigate('/predictive-maintenance')}
                className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 hover:border-amber-300 transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-800">Risk: {a.predictiveScore}/100</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                    DEGRADED ASSET
                  </span>
                </div>
                <div className="font-bold text-slate-900 truncate">{a.name}</div>
                <div className="text-[11px] text-slate-600 truncate">
                  {a.building} • Room {a.roomNumber} ({Math.round(a.ageInMonths / 12)} yrs in service)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="white-card p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">Active Breakdowns</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{openTickets.length} Orders</div>
          <div className="text-[11px] text-slate-500">In technician triage</div>
        </div>

        <div className="white-card p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">CCTV Vision AI Nodes</div>
          <div className="text-xl sm:text-2xl font-black text-purple-700">{cameras.length} Feeds</div>
          <div className="text-[11px] text-purple-600">Gemini night scans active</div>
        </div>

        <div className="white-card p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">Monitored Assets</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">{assets.length} Units</div>
          <div className="text-[11px] text-emerald-600">QR tagged & tracked</div>
        </div>

        <div className="white-card p-4 sm:p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">SLA Resolution Rate</div>
          <div className="text-xl sm:text-2xl font-black text-maroon-800">94.2%</div>
          <div className="text-[11px] text-slate-500">Mean fix velocity: 3.4h</div>
        </div>
      </div>

      {/* AI Tool Launchpad Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-maroon-700" />
            <span>AI Platform Modules & Tools</span>
          </h3>
          <span className="text-xs text-slate-500">Full system access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/cctv-monitoring')}
            className="white-card p-5 rounded-3xl cursor-pointer hover:border-purple-300 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Video className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition">
                CCTV Night LED Vision AI
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Comparative visual scan comparing baseline lights-ON photos against live night camera feeds with Gemini 2.0 Flash.
              </p>
            </div>
            <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>Open CCTV Suite</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          <div
            onClick={() => navigate('/predictive-maintenance')}
            className="white-card p-5 rounded-3xl cursor-pointer hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                Predictive Maintenance AI
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Asset breakdown probability calculator analyzing operational age, maintenance intervals, and wear decay.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Inspect Health Index</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          <div
            onClick={() => navigate('/risk-map')}
            className="white-card p-5 rounded-3xl cursor-pointer hover:border-maroon-300 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-maroon-50 text-maroon-800 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-maroon-800 transition">
                Campus Risk Heat Map
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Interactive spatial floor layout mapping hazardous zones, open work orders, and CCTV faults in MIT ACSC wings.
              </p>
            </div>
            <div className="text-xs font-bold text-maroon-800 flex items-center gap-1">
              <span>View Floor Radar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Role Portals Directory Banner */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-maroon-800 flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                CampusCare Multi-Role Portal Directory
              </h4>
              <span className="px-2 py-0.5 bg-maroon-900 text-amber-300 text-[10px] font-mono font-bold rounded-md border border-maroon-700">
                5 Dedicated Portals
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Access separated portals for Students, Faculty, Technicians, Estate Managers, and the Principal.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/portals')}
          className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition active:scale-95 shrink-0"
        >
          <span>Open Portals Gateway</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanAsset={handleQRScanned}
      />
    </div>
  );
};
