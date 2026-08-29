import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle2,
  FileText,
  X,
} from 'lucide-react';
import { useTicketStore } from '../../store/ticketStore';
import { useAuthStore } from '../../store/authStore';
import { DEMO_USERS } from '../../lib/constants';
import { Ticket } from '../../types/ticket';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';
import { sendTransactionalEmail } from '../../lib/emailSimulator';

export const TicketQueue: React.FC = () => {
  const { tickets, assignTicket } = useTicketStore();
  const { currentUser } = useAuthStore();

  const [search, setSearch] = useState('');
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState<Ticket | null>(null);

  const technicians = DEMO_USERS.filter((u) => u.role === 'employee');

  const filtered = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignTechnician = (tech: (typeof DEMO_USERS)[0]) => {
    if (!selectedTicketForAssign || !currentUser) return;

    assignTicket(
      selectedTicketForAssign.id,
      tech.uid,
      tech.displayName,
      currentUser.displayName
    );

    sendTransactionalEmail({
      to: tech.email,
      subject: `[Assigned Work Order] Ticket #${selectedTicketForAssign.id}: ${selectedTicketForAssign.title}`,
      template: 'TicketAssigned',
      ticket: {
        ...selectedTicketForAssign,
        status: 'assigned',
        assignedTo: tech.uid,
        assignedToName: tech.displayName,
      },
      hasPdfAttachment: true,
    });

    setSelectedTicketForAssign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Department Triage & Work Order Queue
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              {tickets.filter((t) => t.status === 'open').length} Unassigned
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Assign incoming student/faculty fault tickets to campus technicians with automatic SLA timers
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search queue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="white-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-3.5">Ticket ID & Title</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">SLA Target Deadline</th>
                <th className="p-3.5">Assigned Technician</th>
                <th className="p-3.5 text-right">Triage Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((ticket) => {
                const isCritical = ticket.priority === 'critical';

                return (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-maroon-800">#{ticket.id}</span>
                        {isCritical && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[9px] font-mono font-bold">
                            CRITICAL
                          </span>
                        )}
                        {ticket.isAutoDetected && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-mono">
                            CCTV AI
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 mt-1">{ticket.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{ticket.description}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{ticket.building}</div>
                      <div className="text-[11px] text-slate-500">
                        Floor {ticket.floor}, {ticket.wing.toUpperCase()} (Room {ticket.roomNumber || 'Corridor'})
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium capitalize">
                        {ticket.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-xs">
                      <div className="text-amber-800 font-bold">
                        {new Date(ticket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(ticket.slaDeadline).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-3.5">
                      {ticket.assignedToName ? (
                        <div className="font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{ticket.assignedToName}</span>
                        </div>
                      ) : (
                        <span className="text-rose-600 font-semibold italic">Unassigned (In Queue)</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedTicketForAssign(ticket)}
                        className="px-3 py-1.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        {ticket.assignedToName ? 'Reassign' : 'Assign Tech'}
                      </button>
                      <button
                        onClick={() => downloadTicketReportPDF(ticket)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                        title="Download PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Technician Modal */}
      {selectedTicketForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Assign Technician to Ticket #{selectedTicketForAssign.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedTicketForAssign.title}</p>

            <div className="space-y-2 mb-6">
              <label className="block text-xs font-semibold text-slate-700">Select Available Department Staff:</label>
              {technicians.map((tech) => (
                <button
                  key={tech.uid}
                  type="button"
                  onClick={() => handleAssignTechnician(tech)}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-300 text-left transition flex items-center justify-between text-xs group"
                >
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-maroon-900">{tech.displayName}</div>
                    <div className="text-[10px] text-slate-500 capitalize font-mono mt-0.5">
                      {tech.department} Department • ID: {tech.employeeId}
                    </div>
                  </div>
                  <span className="text-maroon-800 font-bold text-xs group-hover:underline">Dispatch →</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedTicketForAssign(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
