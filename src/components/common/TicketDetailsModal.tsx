import React, { useState } from 'react';
import {
  X,
  FileText,
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  Play,
  Wrench,
  Tag,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  Bot,
  QrCode,
  DollarSign,
  Maximize2,
} from 'lucide-react';
import { Ticket } from '../../types/ticket';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onStartWork?: (ticketId: string) => void;
  onOpenResolveModal?: (ticket: Ticket) => void;
  canManage?: boolean;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onStartWork,
  onOpenResolveModal,
  canManage = true,
}) => {
  const [selectedZoomPhoto, setSelectedZoomPhoto] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const isResolved = ticket.status === 'resolved';
  const isInProgress = ticket.status === 'in_progress';
  const isCritical = ticket.priority === 'critical';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
          {/* Header Banner */}
          <div className="px-6 py-4 bg-gradient-to-r from-maroon-900 to-maroon-800 text-white flex items-center justify-between border-b border-maroon-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <FileText className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    #{ticket.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      isResolved
                        ? 'bg-emerald-500 text-white'
                        : isInProgress
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  {isCritical && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500 text-white animate-pulse">
                      CRITICAL SLA
                    </span>
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                  {ticket.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-maroon-200 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs">
            {/* Category & Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-maroon-50 text-maroon-900 font-bold rounded-lg border border-maroon-200 uppercase tracking-wide text-[10px]">
                {ticket.category}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-[10px]">
                {ticket.subcategory}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200 text-[10px]">
                Priority: {ticket.priority.toUpperCase()}
              </span>
              {ticket.source === 'qr_scan' && (
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-lg border border-purple-200 text-[10px] flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  <span>Physical QR Scanned</span>
                </span>
              )}
            </div>

            {/* Location & Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-maroon-800" />
                  <span>Campus Location</span>
                </div>
                <div className="font-bold text-slate-900">{ticket.building}</div>
                <div className="text-slate-600">
                  Floor {ticket.floor}, {ticket.wing.toUpperCase()} Wing (Room {ticket.roomNumber || 'General / Corridor'})
                </div>
                {ticket.locationDescription && (
                  <div className="text-slate-500 text-[11px] italic">"{ticket.locationDescription}"</div>
                )}
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-maroon-800" />
                  <span>SLA & Assigned Technician</span>
                </div>
                <div>
                  Technician:{' '}
                  <strong className="text-slate-900">{ticket.assignedToName || 'Unassigned (In Queue)'}</strong>
                </div>
                <div className="text-slate-600">
                  Target SLA:{' '}
                  <strong className="text-amber-800 font-mono">
                    {new Date(ticket.slaDeadline).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>
                </div>
                <div className="text-[10px] text-slate-400">
                  Reported: {new Date(ticket.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Reporter Profile */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {ticket.reporterName}{' '}
                    <span className="text-[10px] font-normal text-slate-500 uppercase">
                      ({ticket.reporterRole})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{ticket.reporterEmail || 'MIT ACSC Account'}</div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400 font-mono">
                Source: {ticket.source.toUpperCase()}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs">Problem Description:</h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                {ticket.description || 'No detailed text description provided.'}
              </div>
            </div>

            {/* Attached Photos / Evidence Section (Accessible to Tech, Manager & Admin) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-maroon-800" />
                  <span>Attached Fault Photos & Proof ({ticket.photoURLs?.length || 0}):</span>
                </h4>
                {ticket.photoURLs && ticket.photoURLs.length > 0 && (
                  <span className="text-[10px] text-slate-400">Click any image to enlarge</span>
                )}
              </div>

              {ticket.photoURLs && ticket.photoURLs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ticket.photoURLs.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedZoomPhoto(photoUrl)}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer bg-slate-100 hover:ring-2 hover:ring-maroon-700 transition"
                    >
                      <img
                        src={photoUrl}
                        alt={`Fault Photo #${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition flex items-center justify-center">
                        <div className="p-1.5 bg-white/90 rounded-lg text-slate-900 shadow-sm opacity-0 group-hover:opacity-100 transition">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400 text-xs italic">
                  No photographic proof was attached when this complaint was filed.
                </div>
              )}
            </div>

            {/* Resolution Details (If Resolved) */}
            {isResolved && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Technician Resolution Report:</span>
                </div>
                <p className="text-xs text-emerald-900 whitespace-pre-line leading-relaxed">
                  {ticket.resolutionNotes || 'Task completed and verified operational.'}
                </p>

                {ticket.partsUsed && ticket.partsUsed.length > 0 && (
                  <div className="text-[11px] text-emerald-800">
                    <strong>Parts Replaced:</strong> {ticket.partsUsed.join(', ')}
                  </div>
                )}

                {ticket.actualCost !== undefined && ticket.actualCost > 0 && (
                  <div className="text-[11px] text-emerald-800">
                    <strong>Maintenance Cost:</strong> ₹{ticket.actualCost.toLocaleString('en-IN')}
                  </div>
                )}

                {ticket.resolvedPhotoURLs && ticket.resolvedPhotoURLs.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-emerald-900 mb-1">Resolution Proof Photo:</div>
                    <div className="flex gap-2">
                      {ticket.resolvedPhotoURLs.map((proof: string, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedZoomPhoto(proof)}
                          className="w-20 h-20 rounded-xl overflow-hidden border border-emerald-300 shadow-xs cursor-pointer hover:ring-2 hover:ring-emerald-500"
                        >
                          <img src={proof} alt="Resolution proof" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={() => downloadTicketReportPDF(ticket)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Download PDF Work Order</span>
            </button>

            <div className="flex items-center gap-2">
              {canManage && !isResolved && (
                <>
                  {!isInProgress && onStartWork ? (
                    <button
                      onClick={() => {
                        onStartWork(ticket.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Work</span>
                    </button>
                  ) : onOpenResolveModal ? (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenResolveModal(ticket);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved & Upload Proof</span>
                    </button>
                  ) : null}
                </>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Photo Zoom Modal */}
      {selectedZoomPhoto && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedZoomPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl border border-white/20">
            <button
              onClick={() => setSelectedZoomPhoto(null)}
              className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-900 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedZoomPhoto}
              alt="Enlarged fault photo"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
          <p className="text-xs text-white/70 mt-3 font-mono">Click anywhere to close full preview</p>
        </div>
      )}
    </>
  );
};
