import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Star,
  PlusCircle,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import { useTicketStore } from '../../store/ticketStore';
import { useAuthStore } from '../../store/authStore';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';
import { TicketDetailsModal } from '../../components/common/TicketDetailsModal';
import { Ticket } from '../../types/ticket';

export const MyTickets: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, submitTicketFeedback } = useTicketStore();
  const { currentUser } = useAuthStore();

  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<Ticket | null>(null);
  const [ratingModalTicketId, setRatingModalTicketId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('Technician fixed the fixture quickly and left the classroom clean.');

  const myTickets = tickets.filter(
    (t) => t.reporterId === currentUser?.uid || currentUser?.role === 'admin'
  );

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalTicketId) return;

    submitTicketFeedback(ratingModalTicketId, ratingScore, ratingComment);
    setRatingModalTicketId(null);
    alert('Thank you for rating the maintenance service!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            My Reported Faults & Status Tracker
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              {myTickets.length} Tickets
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Track real-time progress, SLA countdown timers, technician notes, and provide resolution feedback
          </p>
        </div>

        <button
          onClick={() => navigate('/report-fault')}
          className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Fault</span>
        </button>
      </div>

      {/* Tickets List */}
      {myTickets.length === 0 ? (
        <div className="white-card p-12 text-center rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">No active tickets reported yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not submitted any breakdown reports. Click below to file an issue.
          </p>
          <button
            onClick={() => navigate('/report-fault')}
            className="px-4 py-2 bg-maroon-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Report a Fault Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTickets.map((ticket) => {
            const isResolved = ticket.status === 'resolved';
            const isCritical = ticket.priority === 'critical';

            return (
              <div
                key={ticket.id}
                className="white-card p-5 rounded-2xl flex flex-col justify-between space-y-4"
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
                          : 'bg-maroon-50 text-maroon-800 border-maroon-200'
                      }`}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{ticket.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ticket.description}</p>

                  {/* Location & Time */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div><strong>Location:</strong> {ticket.building} (Floor {ticket.floor}, Room {ticket.roomNumber || 'General'})</div>
                    <div><strong>Department:</strong> <span className="capitalize">{ticket.category}</span></div>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">
                      Target SLA: {new Date(ticket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({ticket.priority.toUpperCase()})
                    </div>
                  </div>

                  {/* Resolution Notes if closed */}
                  {isResolved && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Resolution Completed</span>
                      </div>
                      <div className="text-[11px] text-emerald-800">{ticket.resolutionNotes}</div>

                      {/* Feedback rating display */}
                      {ticket.feedbackRating ? (
                        <div className="pt-2 flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (ticket.feedbackRating || 5) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-bold text-slate-700 ml-1">
                            ({ticket.feedbackRating}/5 Stars)
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRatingModalTicketId(ticket.id)}
                          className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Rate Resolution (1-5 Stars)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Photo Preview Strip if photos attached */}
                {ticket.photoURLs && ticket.photoURLs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForDetails(ticket)}
                    className="mt-2 w-full p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={ticket.photoURLs[0]}
                        alt="Fault proof"
                        className="w-8 h-8 rounded-lg object-cover border border-slate-300 shrink-0"
                      />
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-maroon-800" />
                          <span>{ticket.photoURLs.length} Photo{ticket.photoURLs.length > 1 ? 's' : ''} Attached</span>
                        </div>
                        <div className="text-[9px] text-slate-500">Tap to inspect attached photos</div>
                      </div>
                    </div>
                    <span className="text-maroon-800 font-bold text-[10px]">View →</span>
                  </button>
                )}

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 truncate">
                    Logged: {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedTicketForDetails(ticket)}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                      title="View Details"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => downloadTicketReportPDF(ticket)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-maroon-800" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5-Star Rating Modal */}
      {ratingModalTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Rate Maintenance Service
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              How satisfied are you with the technician's repair work?
            </p>

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

      {/* Ticket Details & Uploaded Photos Inspection Modal */}
      <TicketDetailsModal
        ticket={selectedTicketForDetails}
        isOpen={!!selectedTicketForDetails}
        onClose={() => setSelectedTicketForDetails(null)}
        canManage={false}
      />
    </div>
  );
};
