import React, { useState, useMemo, useRef } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Play,
  FileText,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  MapPin,
  Tag,
  CheckCircle,
  Info,
  Image as ImageIcon,
  Camera,
  Upload,
} from 'lucide-react';
import { useTicketStore } from '../../store/ticketStore';
import { useAuthStore } from '../../store/authStore';
import { Ticket, TicketStatus } from '../../types/ticket';
import { DepartmentType } from '../../types/user';
import { DEPARTMENTS, CAMPUS_BUILDINGS } from '../../lib/constants';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';
import { sendTransactionalEmail } from '../../lib/emailSimulator';
import { TicketDetailsModal } from '../../components/common/TicketDetailsModal';

export const AssignedTasks: React.FC = () => {
  const { tickets, updateTicketStatus } = useTicketStore();
  const { currentUser, selectedRole } = useAuthStore();
  const resolveFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTicketForDetails, setSelectedTicketForDetails] = useState<Ticket | null>(null);
  const [selectedTicketForResolve, setSelectedTicketForResolve] = useState<Ticket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('Replaced blown capacitor (3.15 uF) and tested fan speeds 1 to 5. Operational.');
  const [partsUsed, setPartsUsed] = useState('Havells 3.15uF Capacitor, 2.5mm Wire Sleeve');
  const [actualCost, setActualCost] = useState<number>(350);
  const [resolutionPhotos, setResolutionPhotos] = useState<string[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const isTechnician = selectedRole === 'employee';
  const isAdminOrManager = selectedRole === 'admin' || selectedRole === 'manager';

  // Base tickets visible to user
  const baseTasks = useMemo(() => {
    return tickets.filter((t) => {
      if (isTechnician) {
        return (
          t.assignedTo === currentUser?.uid ||
          t.category === currentUser?.department ||
          t.assignedDepartment === currentUser?.department
        );
      }
      return true; // Admin and Manager see all campus work orders
    });
  }, [tickets, isTechnician, currentUser]);

  // Filtered tickets
  const filteredTasks = useMemo(() => {
    const now = Date.now();
    const query = searchQuery.trim().toLowerCase();

    return baseTasks.filter((t) => {
      // 1. Text Search (ID, title, description, room, technician, reporter)
      if (query) {
        const matchesId = t.id.toLowerCase().includes(query);
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesRoom = t.roomNumber?.toLowerCase().includes(query);
        const matchesTech = t.assignedToName?.toLowerCase().includes(query);
        const matchesReporter = t.reporterName?.toLowerCase().includes(query);

        if (!matchesId && !matchesTitle && !matchesDesc && !matchesRoom && !matchesTech && !matchesReporter) {
          return false;
        }
      }

      // 2. Category / Type Filter (Plumbing, Electrical, etc.)
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // 3. Location Filter (Building)
      if (selectedLocation !== 'all' && !t.building.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'open_or_assigned') {
          if (t.status !== 'open' && t.status !== 'assigned') return false;
        } else if (t.status !== selectedStatus) {
          return false;
        }
      }

      // 5. Date Filter (Created Date)
      if (selectedDateFilter !== 'all') {
        const createdMs = new Date(t.createdAt).getTime();
        const diffHours = (now - createdMs) / (1000 * 3600);

        if (selectedDateFilter === 'today' && diffHours > 24) return false;
        if (selectedDateFilter === '7days' && diffHours > 24 * 7) return false;
        if (selectedDateFilter === '30days' && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [baseTasks, searchQuery, selectedCategory, selectedLocation, selectedDateFilter, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedDateFilter('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'all' ||
    selectedDateFilter !== 'all' ||
    selectedStatus !== 'all';

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

  const handleResolutionPhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setResolutionPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForResolve || !currentUser) return;

    const parts = partsUsed
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const finalPhotos =
      resolutionPhotos.length > 0
        ? resolutionPhotos
        : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'];

    updateTicketStatus(
      selectedTicketForResolve.id,
      'resolved',
      currentUser.uid,
      currentUser.displayName,
      resolutionNotes,
      finalPhotos,
      actualCost,
      parts
    );

    sendTransactionalEmail({
      to: selectedTicketForResolve.reporterEmail,
      subject: `[Resolved] Ticket #${selectedTicketForResolve.id}: ${selectedTicketForResolve.title}`,
      template: 'TicketResolved',
      ticket: {
        ...selectedTicketForResolve,
        status: 'resolved',
        resolutionNotes,
        resolvedPhotoURLs: finalPhotos,
        partsUsed: parts,
        actualCost,
      },
      hasPdfAttachment: true,
    });

    setSelectedTicketForResolve(null);
    setResolutionPhotos([]);
  };

  return (
    <div className="space-y-6">
      {/* Header - Role Adaptive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            {isTechnician ? 'Technician Work Orders & Assignments' : 'Campus Work Orders & Technician Dispatch'}
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Order' : 'Orders'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {isTechnician
              ? 'Log replacement parts, update repair status, upload proof photos, and close tickets'
              : 'Monitor campus work order progress, technician assignments, SLA deadlines, and resolutions'}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-2.5">
          {/* Live Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #ID, problem title, room, technician, or reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
            />
          </div>

          {/* Type / Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-maroon-700 w-full md:w-auto"
            >
              <option value="all">All Types / Categories</option>
              <option value="electrical">⚡ Electrical</option>
              <option value="plumbing">💧 Plumbing</option>
              <option value="technical">💻 Technical / IT</option>
              <option value="janitorial">✨ Janitorial</option>
              <option value="furniture">🪑 Furniture</option>
              <option value="network">📶 Network</option>
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-maroon-700 w-full md:w-auto"
            >
              <option value="all">All Locations</option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Filters: Date & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'open_or_assigned', label: 'Open / Assigned' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'resolved', label: 'Resolved' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    selectedStatus === st.id
                      ? 'bg-maroon-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Date Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'all', label: 'All Dates' },
                { id: 'today', label: 'Today (24h)' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'This Month' },
              ].map((df) => (
                <button
                  key={df.id}
                  onClick={() => setSelectedDateFilter(df.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    selectedDateFilter === df.id
                      ? 'bg-maroon-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="white-card p-12 text-center rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">No work orders match the selected filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, location, category, or date range filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-maroon-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((ticket) => {
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
                    <div>
                      <strong>Location:</strong> {ticket.building}
                    </div>
                    <div>
                      Floor {ticket.floor}, {ticket.wing.toUpperCase()} (Room {ticket.roomNumber || 'General'})
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                      Technician: <strong className="text-slate-800">{ticket.assignedToName || 'Unassigned'}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Reported by: {ticket.reporterName} ({ticket.reporterRole})
                    </div>
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
                          alt="Fault photo"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-300 shrink-0"
                        />
                        <div className="text-left">
                          <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-maroon-800" />
                            <span>{ticket.photoURLs.length} Fault Photo{ticket.photoURLs.length > 1 ? 's' : ''} Attached</span>
                          </div>
                          <div className="text-[9px] text-slate-500">Click to inspect photo & proof</div>
                        </div>
                      </div>
                      <span className="text-maroon-800 font-bold text-[10px]">View →</span>
                    </button>
                  )}

                  {/* SLA target deadline */}
                  <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Target SLA:</span>
                    <span className="text-amber-800 font-bold">
                      {new Date(ticket.slaDeadline).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ({new Date(ticket.slaDeadline).toLocaleDateString()})
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

                  <button
                    onClick={() => setSelectedTicketForDetails(ticket)}
                    className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl hover:text-blue-900 border border-blue-200 transition flex items-center gap-1 font-bold text-xs"
                    title="Inspect Ticket Details & Uploaded Photos"
                  >
                    <Info className="w-4 h-4" />
                    <span className="text-[11px]">Details</span>
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

                  {isResolved && (
                    <div className="flex-1 py-1.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      Closed & Verified
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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

              {/* Attach Resolution Proof Photos */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Attach Resolution Proof Photos:</label>
                  <span className="text-[10px] text-slate-400">Show fixed hardware</span>
                </div>

                <input
                  type="file"
                  ref={resolveFileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleResolutionPhotoCapture}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  {resolutionPhotos.map((url, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-300 shadow-xs relative group">
                      <img src={url} alt="Resolution proof" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setResolutionPhotos(resolutionPhotos.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[9px] shadow-sm hover:bg-rose-700"
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => resolveFileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-600 bg-emerald-50/50 flex flex-col items-center justify-center text-emerald-800 hover:bg-emerald-50 transition text-[9px] font-bold"
                  >
                    <Camera className="w-4 h-4 mb-0.5 text-emerald-700" />
                    <span>Snap Proof</span>
                  </button>
                </div>
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

      {/* Ticket Details & Uploaded Photos Inspection Modal */}
      <TicketDetailsModal
        ticket={selectedTicketForDetails}
        isOpen={!!selectedTicketForDetails}
        onClose={() => setSelectedTicketForDetails(null)}
        onStartWork={(id) => handleStartWork(id)}
        onOpenResolveModal={(t) => setSelectedTicketForResolve(t)}
        canManage={isTechnician || isAdminOrManager}
      />
    </div>
  );
};
