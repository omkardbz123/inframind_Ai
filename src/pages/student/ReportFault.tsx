import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Zap,
  Droplets,
  Monitor,
  Sparkles,
  Armchair,
  Wifi,
  MapPin,
  Camera,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { DEPARTMENTS, CAMPUS_BUILDINGS } from '../../lib/constants';
import { DepartmentType } from '../../types/user';
import { TicketPriority } from '../../types/ticket';
import { WingType } from '../../types/location';
import { useAuthStore } from '../../store/authStore';
import { useTicketStore } from '../../store/ticketStore';
import { VoiceRecorderButton } from '../../components/common/VoiceRecorderButton';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import { Asset } from '../../types/asset';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';

const ICONS_MAP: Record<DepartmentType, React.ElementType> = {
  electrical: Zap,
  plumbing: Droplets,
  technical: Monitor,
  janitorial: Sparkles,
  furniture: Armchair,
  network: Wifi,
  general: AlertTriangle,
};

export const ReportFault: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { createTicket } = useTicketStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketData, setCreatedTicketData] = useState<any>(null);

  // Form State
  const [category, setCategory] = useState<DepartmentType>('electrical');
  const [subcategory, setSubcategory] = useState('LED Tube Light');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0].name);
  const [floor, setFloor] = useState<number>(1);
  const [wing, setWing] = useState<WingType>('east');
  const [roomNumber, setRoomNumber] = useState('101');
  const [locationDescription, setLocationDescription] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [photoURLs, setPhotoURLs] = useState<string[]>([
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  ]);
  const [urgencyScore, setUrgencyScore] = useState<number>(65);
  const [source, setSource] = useState<'manual' | 'qr_scan' | 'voice'>('manual');
  const [scannedAssetTag, setScannedAssetTag] = useState<string>('');

  const currentBuildingObj =
    CAMPUS_BUILDINGS.find((b) => b.name === building) || CAMPUS_BUILDINGS[0];
  const currentFloorObj =
    currentBuildingObj.floors.find((f) => f.floorNumber === floor) ||
    currentBuildingObj.floors[0];

  const currentDeptObj =
    DEPARTMENTS.find((d) => d.id === category) || DEPARTMENTS[0];

  const handleScannedAsset = (asset: Asset) => {
    setCategory(asset.category);
    setSubcategory(asset.subcategory);
    setBuilding(asset.building);
    setFloor(asset.floor);
    setWing(asset.wing);
    if (asset.roomNumber) setRoomNumber(asset.roomNumber);
    setScannedAssetTag(asset.assetTag);
    setSource('qr_scan');
    setTitle(`${asset.name} Fault`);
    setDescription(`Scanned physical QR tag (${asset.assetTag}). Equipment requires inspection.`);
    setStep(3);
  };

  const handleVoiceClassified = (result: any, transcript: string) => {
    setCategory(result.category);
    setSubcategory(result.subcategory);
    setPriority(result.priority);
    setUrgencyScore(result.urgencyScore);
    setTitle(result.refinedTitle || transcript.slice(0, 45));
    setDescription(transcript);
    setSource('voice');
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSubmitting(true);

    try {
      const ticket = await createTicket({
        title: title || `${subcategory} Issue in Room ${roomNumber || 'Corridor'}`,
        description: description || `Reported ${subcategory} fault at ${building}.`,
        category,
        subcategory,
        priority,
        building,
        floor,
        wing,
        roomNumber: roomNumber || undefined,
        locationDescription: locationDescription || undefined,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName,
        reporterEmail: currentUser.email,
        reporterRole: `${currentUser.role.toUpperCase()}`,
        photoURLs,
        source,
        assetTag: scannedAssetTag || undefined,
        urgencyScore,
      });

      setCreatedTicketData(ticket);
      setSubmitting(false);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      setSubmitting(false);
      alert('Error submitting report.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Fault Reporting
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              Step {step} of 4
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Submit broken fans, leaking water purifiers, dead corridor LEDs, or classroom projectors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsQRModalOpen(true)}
            className="px-3.5 py-2 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>5s QR Scan</span>
          </button>
          <VoiceRecorderButton onClassified={handleVoiceClassified} />
        </div>
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, label: 'Department' },
          { num: 2, label: 'Location' },
          { num: 3, label: 'Details' },
          { num: 4, label: 'Submit' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => s.num < step && setStep(s.num as any)}
            disabled={s.num > step}
            className={`p-2.5 rounded-xl text-left border transition ${
              step === s.num
                ? 'bg-maroon-800 text-white font-bold border-maroon-900 shadow-sm'
                : step > s.num
                ? 'bg-white border-emerald-300 text-emerald-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <div className="text-[10px] font-mono font-bold opacity-75">
              0{s.num}
            </div>
            <div className="text-xs truncate">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Success Card */}
      {createdTicketData ? (
        <div className="white-card p-6 sm:p-8 rounded-3xl border border-emerald-300 text-center space-y-5 animate-in zoom-in-95 duration-150">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">Work Order Registered!</h3>
            <p className="text-sm text-slate-600 mt-1">
              Ticket <strong className="text-maroon-800 font-mono">#{createdTicketData.id}</strong> routed to the{' '}
              <strong className="capitalize">{createdTicketData.category}</strong> Department.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Target SLA:</span>
              <span className="font-bold text-maroon-800 font-mono">
                {new Date(createdTicketData.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({createdTicketData.priority.toUpperCase()})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email Receipt:</span>
              <span className="text-emerald-700 font-semibold">Sent to {currentUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-medium text-slate-900">
                Floor {createdTicketData.floor}, {createdTicketData.wing.toUpperCase()} (Room {createdTicketData.roomNumber || 'General'})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => downloadTicketReportPDF(createdTicketData)}
              className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Download MIT ACSC Work Order PDF
            </button>
            <button
              onClick={() => navigate('/my-tickets')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              View My Tickets
            </button>
          </div>
        </div>
      ) : (
        <div className="white-card p-6 sm:p-8 rounded-3xl space-y-6">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select Department Category:
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DEPARTMENTS.map((dept) => {
                  const Icon = ICONS_MAP[dept.id] || Zap;
                  const isSelected = category === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setCategory(dept.id);
                        setSubcategory(dept.subcategories[0]);
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-maroon-50 border-maroon-700 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-maroon-800 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">{dept.name}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {dept.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Subcategories */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Specific Fixture / Equipment:
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentDeptObj.subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubcategory(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        subcategory === sub
                          ? 'bg-maroon-800 text-white border-maroon-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <span>Continue to Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Specify Campus Location:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Building:</label>
                  <select
                    value={building}
                    onChange={(e) => {
                      setBuilding(e.target.value);
                      setFloor(0);
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                  >
                    {CAMPUS_BUILDINGS.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor Level:</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                  >
                    {currentBuildingObj.floors.map((f) => (
                      <option key={f.floorNumber} value={f.floorNumber}>
                        {f.floorName} (Floor {f.floorNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Wing Direction:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {currentFloorObj.wings.map((w) => (
                      <button
                        key={w.wing}
                        type="button"
                        onClick={() => setWing(w.wing)}
                        className={`py-2 px-2 rounded-xl text-center border font-semibold uppercase text-[11px] transition ${
                          wing === w.wing
                            ? 'bg-maroon-800 text-white border-maroon-800'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {w.wing} Wing
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room / Lab Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. 002, 101, Lab-3, Corridor"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-maroon-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Landmark Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near the 2nd floor west water cooler, ceiling fan row 2"
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fault Details & Severity:
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Short Summary:</label>
                <input
                  type="text"
                  placeholder="e.g. Water Purifier Leaking on 2nd Floor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observed Symptoms:</label>
                <textarea
                  rows={3}
                  placeholder="Describe what is broken, making noise, leaking, or sparking..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700 resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Priority Urgency:</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'critical', label: 'Critical', desc: '< 2h SLA (Hazard / Exam)', border: 'border-rose-500 text-rose-700 bg-rose-50' },
                    { id: 'high', label: 'High', desc: '< 8h SLA (Classroom)', border: 'border-amber-500 text-amber-800 bg-amber-50' },
                    { id: 'medium', label: 'Medium', desc: '< 24h SLA (Standard)', border: 'border-blue-500 text-blue-700 bg-blue-50' },
                    { id: 'low', label: 'Low', desc: '< 72h SLA (Minor)', border: 'border-slate-400 text-slate-700 bg-slate-50' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        priority === p.id ? `${p.border} font-bold shadow-xs` : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="font-bold">{p.label}</div>
                      <div className="text-[9px] opacity-75 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Attach Fault Photos:</label>
                <div className="flex items-center gap-3">
                  {photoURLs.map((url, idx) => (
                    <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={url} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoURLs([...photoURLs, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80']);
                    }}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-maroon-700 flex flex-col items-center justify-center text-slate-500 hover:text-maroon-800 transition text-[10px]"
                  >
                    <Camera className="w-5 h-5 mb-1" />
                    <span>Add Photo</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <span>Review & Send</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Review & Confirm Dispatch:
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-sm">
                    {title || `${subcategory} in Room ${roomNumber || 'General'}`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-maroon-50 text-maroon-900 border border-maroon-200 uppercase">
                    {priority} Priority
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>Department: <strong className="capitalize text-slate-900">{category}</strong></div>
                  <div>Subcategory: <strong className="text-slate-900">{subcategory}</strong></div>
                  <div>Location: <strong className="text-slate-900">{building}, Floor {floor}</strong></div>
                  <div>Room: <strong className="text-slate-900">{roomNumber || 'Corridor'}</strong></div>
                  <div>Reporter: <strong className="text-slate-900">{currentUser?.displayName}</strong></div>
                  <div>Source: <strong className="text-maroon-800 uppercase font-mono">{source}</strong></div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-slate-600 italic text-[11px]">
                  "{description || 'Standard fault inspection requested.'}"
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-3 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md active:scale-95 transition"
                >
                  {submitting ? (
                    <span>Registering Work Order...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>SUBMIT FAULT WORK ORDER</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScanAsset={handleScannedAsset}
      />
    </div>
  );
};
