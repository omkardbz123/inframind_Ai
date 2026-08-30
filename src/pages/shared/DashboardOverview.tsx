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
  Phone,
  CheckCircle,
  Star,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTicketStore } from '../../store/ticketStore';
import { useAssetStore } from '../../store/assetStore';
import { useCCTVStore } from '../../store/cctvStore';
import { COLLEGE_CONFIG } from '../../lib/constants';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import { AIChatComplaintModal } from '../../components/common/AIChatComplaintModal';
import { Asset } from '../../types/asset';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';
import { Bot, Mic } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, selectedRole } = useAuthStore();
  const { tickets, submitTicketFeedback } = useTicketStore();
  const { assets } = useAssetStore();
  const { cameras } = useCCTVStore();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [ratingModalTicketId, setRatingModalTicketId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('Quick fix by maintenance team.');

  const isStudentOrTeacher = selectedRole === 'student' || selectedRole === 'teacher';

  // User's own tickets (complaints)
  const myTickets = tickets.filter(
    (t) => t.reporterId === currentUser?.uid || (isStudentOrTeacher && t.reporterEmail === currentUser?.email)
  );
  const myActiveTickets = myTickets.filter((t) => t.status !== 'resolved');
  const myResolvedTickets = myTickets.filter((t) => t.status === 'resolved');

  // Facilities & Management Statistics (Only for Manager/Admin/Technician)
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'assigned');
  const criticalTickets = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved');
  const criticalAssets = assets.filter((a) => a.predictiveScore >= 80);
  const cctvFailures = cameras.filter((c) => c.lastAnalysisResult === 'failure_detected');

  const handleQRScanned = (asset: Asset) => {
    navigate('/report-fault');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalTicketId) return;
    submitTicketFeedback(ratingModalTicketId, ratingScore, ratingComment);
    setRatingModalTicketId(null);
    alert('Thank you for your feedback!');
  };

  // ==========================================
  // 1. STUDENT & TEACHER DEDICATED VIEW
  // Only sees File Complaint and Ongoing Complaint Status
  // ==========================================
  if (isStudentOrTeacher) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Welcome & Quick Action Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-maroon-800 via-maroon-900 to-maroon-950 text-white rounded-3xl shadow-xl shadow-maroon-950/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/90 border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>MIT ACSC Alandi • {selectedRole === 'student' ? 'Student Desk' : 'Faculty Desk'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {currentUser?.displayName} 👋
              </h2>
              <p className="text-xs sm:text-sm text-maroon-100 max-w-xl leading-relaxed">
                Need anything fixed in your classroom, lab, washroom, or corridor? File a complaint or scan equipment to dispatch technicians immediately.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="px-5 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition active:scale-95 border border-amber-300"
              >
                <Bot className="w-4 h-4 text-maroon-950 shrink-0" />
                <span>Talk with AI (Voice & Chat)</span>
                <span className="px-1.5 py-0.5 bg-maroon-900 text-amber-300 rounded-full text-[9px] font-mono font-bold">
                  🎙️ AI Mic
                </span>
              </button>

              <button
                onClick={() => navigate('/report-fault')}
                className="px-5 py-3.5 bg-white hover:bg-slate-50 text-maroon-900 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-maroon-800 shrink-0" />
                <span>File a Complaint</span>
              </button>

              <button
                onClick={() => setIsQRModalOpen(true)}
                className="px-5 py-3.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>5s QR Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Voice & Chatbot Feature Banner for Students/Teachers */}
        <div
          onClick={() => setIsAIChatOpen(true)}
          className="p-5 bg-gradient-to-r from-amber-50 via-white to-amber-50/60 border-2 border-amber-200/80 hover:border-amber-400 rounded-3xl cursor-pointer transition-all shadow-xs group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-maroon-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-maroon-900 transition">
                  Have a complaint? Speak or chat with AI to file it instantly!
                </h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-md">
                  Gemini Voice AI
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Just say e.g. <em>"Fan sparking in Room 102"</em> or <em>"Projector not working in Lab 3"</em> — the AI files and dispatches the work order automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <span className="px-4 py-2 bg-maroon-800 group-hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition">
              <Mic className="w-3.5 h-3.5 text-amber-300" />
              <span>Open AI Chat & Voice →</span>
            </span>
          </div>
        </div>

        {/* ONGOING COMPLAINT STATUS TRACKER */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-maroon-800" />
                <span>My Ongoing Complaints & Live Status</span>
                <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-full border border-maroon-200">
                  {myActiveTickets.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Track resolution progress, assigned technician notes, and target completion times
              </p>
            </div>

            {myActiveTickets.length > 0 && (
              <button
                onClick={() => navigate('/report-fault')}
                className="text-xs font-bold text-maroon-800 hover:text-maroon-950 flex items-center gap-1 hover:underline"
              >
                <span>+ Report Another Issue</span>
              </button>
            )}
          </div>

          {/* Active Complaints List */}
          {myActiveTickets.length === 0 ? (
            <div className="white-card p-8 sm:p-10 text-center rounded-3xl space-y-3 border-2 border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">No active complaints pending</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All your previous maintenance requests have been resolved. If you notice any electrical, plumbing, fan, light, or projector issues, click below.
              </p>
              <button
                onClick={() => navigate('/report-fault')}
                className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                File a Complaint Now →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myActiveTickets.map((ticket) => {
                const isCritical = ticket.priority === 'critical';
                const isInProgress = ticket.status === 'in_progress';
                const isAssigned = ticket.status === 'assigned';

                return (
                  <div
                    key={ticket.id}
                    className="white-card p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-maroon-200 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-maroon-800">#{ticket.id}</span>
                          {isCritical && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold rounded">
                              URGENT
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                            isInProgress
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : isAssigned
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {ticket.status === 'open' ? 'In Triage' : ticket.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">{ticket.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>

                      {/* Location & Technician Box */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                        <div>
                          <strong>Location:</strong> {ticket.building} • Floor {ticket.floor} (Room {ticket.roomNumber || 'General'})
                        </div>
                        <div>
                          <strong>Department:</strong> <span className="capitalize">{ticket.category}</span> ({ticket.subcategory})
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                          <span className="text-slate-500">Assigned Technician:</span>
                          <span className="font-bold text-slate-900">
                            {ticket.assignedToName || 'Under department review'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">Target Resolution:</span>
                          <span className="text-amber-800 font-bold">
                            {new Date(ticket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(ticket.slaDeadline).toLocaleDateString()})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Logged: {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => downloadTicketReportPDF(ticket)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-maroon-700" />
                        <span>Download Work Slip PDF</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently Resolved Section if any */}
        {myResolvedTickets.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recently Resolved Complaints</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myResolvedTickets.slice(0, 2).map((ticket) => (
                <div key={ticket.id} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-900">#{ticket.id}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      RESOLVED
                    </span>
                  </div>
                  <div className="font-bold text-slate-900">{ticket.title}</div>
                  <div className="text-emerald-800 text-[11px]">{ticket.resolutionNotes || 'Repair verified and closed.'}</div>

                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                    {ticket.feedbackRating ? (
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Rated: {ticket.feedbackRating}/5 Stars</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingModalTicketId(ticket.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-xs flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>Rate Service</span>
                      </button>
                    )}

                    <button
                      onClick={() => downloadTicketReportPDF(ticket)}
                      className="text-emerald-900 font-bold text-[11px] hover:underline"
                    >
                      Download Receipt PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campus Emergency Helplines Info Box */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">Campus Emergency or Hazardous Breakdown?</div>
              <div className="text-[11px] text-slate-500">
                For electrical sparking, water floods, or immediate danger, use Emergency SOS or contact Security Gate.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${COLLEGE_CONFIG.emergencyHelpline}`}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Helpline</span>
            </a>
          </div>
        </div>

        {/* 5-Star Rating Modal */}
        {ratingModalTicketId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-center">
              <h3 className="text-base font-bold text-slate-900 mb-1">Rate Maintenance Service</h3>
              <p className="text-xs text-slate-500 mb-4">How satisfied are you with the repair resolution?</p>

              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingScore ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <form onSubmit={handleRatingSubmit} className="space-y-3 text-xs text-left">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Feedback Comment:</label>
                  <textarea
                    rows={2}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRatingModalTicketId(null)}
                    className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl font-bold shadow-xs"
                  >
                    Submit Rating
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        <QRScannerModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          onScanAsset={handleQRScanned}
        />

        {/* AI Voice & Chatbot Complaint Modal */}
        <AIChatComplaintModal
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
        />
      </div>
    );
  }

  // ==========================================
  // 2. MANAGEMENT & ADMIN EXECUTIVE OVERVIEW
  // (Manager, Principal, Technician)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* MIT ACSC Maroon Hero Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-br from-maroon-800 via-maroon-900 to-maroon-950 text-white rounded-3xl shadow-xl shadow-maroon-950/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/90 border border-white/20 rounded-full text-[11px] font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>MIT ACSC Alandi • {selectedRole.toUpperCase()} OPERATIONS SUITE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser?.displayName?.split(' ')[0]} 👋
            </h2>
            <p className="text-xs sm:text-sm text-maroon-100 max-w-xl leading-relaxed">
              {selectedRole === 'employee'
                ? 'Technician Work Orders • SLA Deadline Triage, Replacement Parts Logging & PDF Work Orders'
                : selectedRole === 'manager'
                ? 'Estate Management Suite • Department Triage, CCTV Night LED Vision AI & Predictive Risk Engine'
                : 'Executive Directorate Command • Campus Infrastructure Risk Radar, SLA BI Reports & Governance'}
            </p>
          </div>

          {/* Clean Action Buttons tailored to role */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            {selectedRole === 'employee' ? (
              <>
                <button
                  onClick={() => navigate('/assigned-tasks')}
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-maroon-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <Wrench className="w-4 h-4 text-maroon-700 shrink-0" />
                  <span>My Assigned Tasks</span>
                </button>
                <button
                  onClick={() => navigate('/asset-registry')}
                  className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
                >
                  <span>Asset Registry & QR</span>
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

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanAsset={handleQRScanned}
      />
    </div>
  );
};
