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
      <div className="p-6 sm:p-8 bg-gradient-to-r from-maroon-800 via-maroon-900 to-maroon-950 text-white rounded-3xl shadow-xl shadow-maroon-950/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white/90 border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>MIT ACSC Alandi • Smart Campus Management</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser?.displayName?.split(' ')[0]} 👋
            </h2>
            <p className="text-xs sm:text-sm text-maroon-100 max-w-xl leading-relaxed">
              {COLLEGE_CONFIG.name} Facilities System • AI Fault Reporting, CCTV Night LED Inspection & Predictive Maintenance
            </p>
          </div>

          {/* Clean Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/report-fault')}
              className="px-5 py-3 bg-white hover:bg-slate-50 text-maroon-900 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-maroon-700" />
              <span>Report a Fault</span>
            </button>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-2xl flex items-center gap-2 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>5s QR Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* URGENT ATTENTION & HIGH-RISK AREAS PANEL */}
      {(criticalTickets.length > 0 || criticalAssets.length > 0 || cctvFailures.length > 0) && (
        <div className="p-5 bg-white border-2 border-rose-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  Urgent Attention & High-Risk Alerts
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-mono font-bold rounded-full">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Critical infrastructure bottlenecks, CCTV AI failures, and high predictive breakdown risks
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/risk-map')}
              className="text-xs text-maroon-800 hover:text-maroon-950 font-bold flex items-center gap-1 hover:underline"
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
                  {a.building} • Room {a.roomNumber || 'Corridor'} ({Math.round(a.ageInMonths / 12)} yrs in service)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Cards in Crisp White */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate(selectedRole === 'student' ? '/my-tickets' : '/ticket-queue')}
          className="white-card white-card-hover p-4 rounded-2xl cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold">Active Breakdowns</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{openTickets.length} Orders</div>
          <div className="text-[11px] text-maroon-700 mt-0.5 font-medium">In technician triage</div>
        </div>

        <div
          onClick={() => navigate('/cctv-monitoring')}
          className="white-card white-card-hover p-4 rounded-2xl cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold">CCTV Vision AI Nodes</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{cameras.length} Feeds</div>
          <div className="text-[11px] text-purple-600 mt-0.5">Gemini night scans active</div>
        </div>

        <div
          onClick={() => navigate('/predictive-maintenance')}
          className="white-card white-card-hover p-4 rounded-2xl cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold">Monitored Assets</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{assets.length} Units</div>
          <div className="text-[11px] text-slate-500 mt-0.5">QR tagged & tracked</div>
        </div>

        <div
          onClick={() => navigate('/analytics-reports')}
          className="white-card white-card-hover p-4 rounded-2xl cursor-pointer"
        >
          <div className="text-slate-500 text-xs font-semibold">SLA Resolution Rate</div>
          <div className="text-2xl font-black text-maroon-800 mt-1">94.2%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Mean fix velocity: 3.4h</div>
        </div>
      </div>

      {/* Two Column Layout: Recent Active Breakdowns & Modules Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Recent Tickets */}
        <div className="lg:col-span-7 white-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-maroon-700" />
              <span>Recent Campus Breakdown Reports</span>
            </h3>
            <button
              onClick={() => navigate(selectedRole === 'student' ? '/my-tickets' : '/ticket-queue')}
              className="text-xs text-maroon-800 hover:text-maroon-950 font-bold hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2.5">
            {tickets.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-maroon-300 transition flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 overflow-hidden pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-maroon-800">#{ticket.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded uppercase">
                      {ticket.category}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 truncate">{ticket.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {ticket.building} • Floor {ticket.floor} (Room {ticket.roomNumber || 'Corridor'})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => downloadTicketReportPDF(ticket)}
                    className="p-1.5 text-slate-500 hover:text-maroon-800 rounded-lg hover:bg-white transition"
                    title="Download Work Order PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border uppercase ${
                      ticket.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ticket.priority === 'critical'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-maroon-50 text-maroon-800 border-maroon-200'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Clean AI Tools Grid */}
        <div className="lg:col-span-5 white-card p-5 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-maroon-700" />
            <span>AI Platform Modules & Tools</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/cctv-monitoring')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-maroon-50/60 border border-slate-200 hover:border-maroon-300 text-left transition group"
            >
              <Video className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition" />
              <div className="font-bold text-xs text-slate-900">CCTV Night AI</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Gemini Vision comparison</div>
            </button>

            <button
              onClick={() => navigate('/predictive-maintenance')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-maroon-50/60 border border-slate-200 hover:border-maroon-300 text-left transition group"
            >
              <Activity className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition" />
              <div className="font-bold text-xs text-slate-900">Predictive Assets</div>
              <div className="text-[10px] text-slate-500 mt-0.5">AI risk breakdown scorer</div>
            </button>

            <button
              onClick={() => navigate('/risk-map')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-maroon-50/60 border border-slate-200 hover:border-maroon-300 text-left transition group"
            >
              <MapPin className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition" />
              <div className="font-bold text-xs text-slate-900">Campus Risk Map</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Geospatial trouble zones</div>
            </button>

            <button
              onClick={() => navigate('/asset-registry')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-maroon-50/60 border border-slate-200 hover:border-maroon-300 text-left transition group"
            >
              <QrCode className="w-5 h-5 text-maroon-700 mb-2 group-hover:scale-110 transition" />
              <div className="font-bold text-xs text-slate-900">Asset QR Labels</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Print sticker barcodes</div>
            </button>
          </div>
        </div>
      </div>

      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanAsset={handleQRScanned}
      />
    </div>
  );
};
