import React, { useState } from 'react';
import { AlertTriangle, Phone, Flame, X } from 'lucide-react';
import { COLLEGE_CONFIG, CAMPUS_BUILDINGS } from '../../lib/constants';
import { useAuthStore } from '../../store/authStore';
import { useTicketStore } from '../../store/ticketStore';
import { sendTransactionalEmail } from '../../lib/emailSimulator';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuthStore();
  const { createTicket } = useTicketStore();

  const [hazardType, setHazardType] = useState('Electrical Short Circuit / Fire Sparking');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0].name);
  const [floor, setFloor] = useState<number>(0);
  const [room, setRoom] = useState('Ground Floor');
  const [dispatched, setDispatched] = useState(false);

  if (!isOpen) return null;

  const handleBroadcastSOS = async () => {
    if (!currentUser) return;

    const ticket = await createTicket({
      title: `[EMERGENCY SOS] ${hazardType}`,
      description: `Critical campus hazard reported at ${building}, Floor ${floor}, Room/Area ${room}. Immediate security and maintenance dispatch required.`,
      category: hazardType.includes('Electrical')
        ? 'electrical'
        : hazardType.includes('Water')
        ? 'plumbing'
        : 'general',
      subcategory: 'Emergency Hazard',
      priority: 'critical',
      building,
      floor,
      wing: 'central',
      roomNumber: room,
      reporterId: currentUser.uid,
      reporterName: currentUser.displayName,
      reporterEmail: currentUser.email,
      reporterRole: `EMERGENCY SOS (${currentUser.role.toUpperCase()})`,
      source: 'manual',
      urgencyScore: 100,
    });

    sendTransactionalEmail({
      to: 'security@mitacsc.ac.in',
      subject: `🚨 [CRITICAL HAZARD SOS] ${hazardType} at ${building}`,
      template: 'EmergencySOS',
      ticket,
      hasPdfAttachment: true,
    });

    setDispatched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white border-2 border-rose-500 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full uppercase">
              Priority 0 Protocol
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              Broadcast Campus Emergency Hazard
            </h3>
          </div>
        </div>

        {dispatched ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <h4 className="font-bold text-sm text-emerald-900">
              🚨 Emergency Alert Dispatched to Campus Directorate!
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Ticket logged as Priority 0. Campus Security & Maintenance teams have received emergency broadcast emails and SMS.
            </p>
            <button
              onClick={() => {
                setDispatched(false);
                onClose();
              }}
              className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              Close SOS Window
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Emergency Nature:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Electrical Short Circuit / Fire Sparking',
                  'Major Pipeline Burst / Flood',
                  'Structural / Glass Breakage Danger',
                  'Severe Chemical / Gas Leakage',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setHazardType(type)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      hazardType === type
                        ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Building:</label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900"
                >
                  {CAMPUS_BUILDINGS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specific Room / Area:</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            {/* Direct Helpline Links */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">Direct Campus Security Line</div>
                <div className="text-slate-500 font-mono">{COLLEGE_CONFIG.emergencyHelpline}</div>
              </div>
              <a
                href={`tel:${COLLEGE_CONFIG.emergencyHelpline}`}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBroadcastSOS}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/30"
              >
                BROADCAST SOS ALERT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
