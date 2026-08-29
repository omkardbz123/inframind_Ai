import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Play,
  FileText,
  X,
} from 'lucide-react';
import { useTicketStore } from '../../store/ticketStore';
import { useAuthStore } from '../../store/authStore';
import { Ticket } from '../../types/ticket';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';
import { sendTransactionalEmail } from '../../lib/emailSimulator';

export const AssignedTasks: React.FC = () => {
  const { tickets, updateTicketStatus } = useTicketStore();
  const { currentUser } = useAuthStore();

  const [selectedTicketForResolve, setSelectedTicketForResolve] = useState<Ticket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('Replaced blown capacitor (3.15 uF) and tested fan speeds 1 to 5. Operational.');
  const [partsUsed, setPartsUsed] = useState('Havells 3.15uF Capacitor, 2.5mm Wire Sleeve');
  const [actualCost, setActualCost] = useState<number>(350);
  const [proofPhoto, setProofPhoto] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80');

  const myTasks = tickets.filter(
    (t) =>
      t.assignedTo === currentUser?.uid ||
      t.category === currentUser?.department ||
      currentUser?.role === 'admin'
  );

  const handleStartWork = (ticketId: string) => {
    if (!currentUser) return;
    updateTicketStatus(
      ticketId,
      'in_progress',
      currentUser.uid,
      currentUser.displayName,
      'Technician on-site troubleshooting hardware.'
    );
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForResolve || !currentUser) return;

    updateTicketStatus(
      selectedTicketForResolve.id,
      'resolved',
      currentUser.uid,
      currentUser.displayName,
      resolutionNotes,
      [proofPhoto],
      actualCost,
      partsUsed.split(',').map((p) => p.trim())
    );

    sendTransactionalEmail({
      to: selectedTicketForResolve.reporterEmail,
      subject: `[Resolved] Ticket #${selectedTicketForResolve.id}: ${selectedTicketForResolve.title}`,
      template: 'TicketResolved',
      ticket: {
        ...selectedTicketForResolve,
        status: 'resolved',
        resolutionNotes,
        partsUsed: partsUsed.split(',').map((p) => p.trim()),
        actualCost,
      },
      hasPdfAttachment: true,
    });

    setSelectedTicketForResolve(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Technician Work Orders & Assignments
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              {myTasks.length} Assigned Orders
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Log replacement parts, update repair status, upload proof photos, and close tickets
          </p>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myTasks.map((ticket) => {
          const isCritical = ticket.priority === 'critical';
          const isInProgress = ticket.status === 'in_progress';
          const isResolved = ticket.status === 'resolved';

          return (
            <div
              key={ticket.id}
              className={`white-card p-5 rounded-2xl flex flex-col justify-between space-y-4 border transition-all ${
                isInProgress ? 'border-maroon-800 ring-1 ring-maroon-800/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-maroon-800">#{ticket.id}</span>
                    {isCritical && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold rounded">
                        CRITICAL
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isInProgress
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{ticket.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>

                {/* Location Box */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div><strong>Location:</strong> {ticket.building}</div>
                  <div>Floor {ticket.floor}, {ticket.wing.toUpperCase()} (Room {ticket.roomNumber || 'General'})</div>
                  <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                    Reported by: {ticket.reporterName} ({ticket.reporterRole})
                  </div>
                </div>

                {/* SLA target deadline */}
                <div className="mt-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Target SLA:</span>
                  <span className="text-amber-800 font-bold">
                    {new Date(ticket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(ticket.slaDeadline).toLocaleDateString()})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => downloadTicketReportPDF(ticket)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition"
                  title="Download Work Order PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>

                {!isResolved && (
                  <div className="flex-1 flex gap-2">
                    {!isInProgress ? (
                      <button
                        onClick={() => handleStartWork(ticket.id)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTicketForResolve(ticket)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolve Work Order Modal */}
      {selectedTicketForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Resolve Ticket #{selectedTicketForResolve.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedTicketForResolve.title}</p>

            <form onSubmit={handleResolveSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Repair Summary & Diagnostic Notes:</label>
                <textarea
                  rows={2}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Spare Parts Used:</label>
                <input
                  type="text"
                  required
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Repair Cost (INR):</label>
                <input
                  type="number"
                  required
                  value={actualCost}
                  onChange={(e) => setActualCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForResolve(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm & Close Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
