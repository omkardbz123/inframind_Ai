import React, { useState, useRef } from 'react';
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
import { sendTransactionalEmail } from '../../lib/emailSimulator';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    CAMPUS_BUILDINGS.find((b: any) => b.name === building) || CAMPUS_BUILDINGS[0];
  const currentFloorObj =
    currentBuildingObj.floors.find((f: any) => f.floorNumber === floor) ||
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

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoURLs([...photoURLs, uploadEvent.target.result as string]);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);

    const fullTitle =
      title || `${subcategory} Breakdown in ${roomNumber || 'Room'}`;
    const fullDesc =
      description ||
      `Reported issue with ${subcategory} located on Floor ${floor}, ${wing.toUpperCase()} Wing.`;

    const newTicket = await createTicket({
      title: fullTitle,
      description: fullDesc,
      category,
      subcategory,
      building,
      floor,
      wing,
      roomNumber,
      locationDescription,
      priority,
      photoURLs,
      urgencyScore,
      reporterId: currentUser.uid,
      reporterName: currentUser.displayName,
      reporterEmail: currentUser.email,
      reporterRole: currentUser.role,
      source,
      assetTag: scannedAssetTag || undefined,
    });

    // Send transactional email notice
    sendTransactionalEmail({
      to: currentUser.email,
      subject: `[MIT ACSC Work Order Registered] #${newTicket.id} - ${newTicket.title}`,
      template: 'TicketCreated',
      ticket: newTicket,
      hasPdfAttachment: true,
    });

    setCreatedTicketData(newTicket);
    setSubmitting(false);
    setStep(4);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#821930', '#d97706', '#0f172a', '#ffffff'],
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Fault Reporting Wizard
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              MIT ACSC
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Submit classroom breakdowns, water leaks, corridor light failures, and technical issues in 30 seconds
          </p>
        </div>

        {/* Quick Tools */}
        {step !== 4 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5 transition"
              title="Scan QR Barcode on Equipment"
            >
              <QrCode className="w-4 h-4 text-maroon-800" />
              <span>5s QR Scan</span>
            </button>

            <VoiceRecorderButton onClassified={handleVoiceClassified} />
          </div>
        )}
      </div>

      {/* Stepper Progress Bar */}
      {step !== 4 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: '1. Location' },
            { num: 2, label: '2. Issue Category' },
            { num: 3, label: '3. Details & Photos' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => s.num < step && setStep(s.num as any)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                step === s.num
                  ? 'bg-maroon-800 text-white border-maroon-800 font-bold shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <div className="text-xs truncate">{s.label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Location Selection */}
      {step === 1 && (
        <div className="white-card p-5 sm:p-7 rounded-3xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 1: Where is the breakdown located?</h3>
            <p className="text-xs text-slate-500">Select the building, floor level, and room / corridor</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Building:</label>
              <select
                value={building}
                onChange={(e) => {
                  setBuilding(e.target.value);
                  setFloor(0);
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
              >
                {CAMPUS_BUILDINGS.map((b: any) => (
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
              >
                {currentBuildingObj.floors.map((f: any) => (
                  <option key={f.floorNumber} value={f.floorNumber}>
                    {f.floorName} (Floor {f.floorNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Wing Direction:</label>
              <div className="grid grid-cols-3 gap-2">
                {currentFloorObj.wings.map((w: any) => (
                  <button
                    key={w.wing}
                    type="button"
                    onClick={() => setWing(w.wing)}
                    className={`py-2 px-1 rounded-xl text-center border font-semibold uppercase text-[11px] transition ${
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-maroon-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
            >
              <span>Next: Select Category</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Category & Subcategory */}
      {step === 2 && (
        <div className="white-card p-5 sm:p-7 rounded-3xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 2: What type of issue is it?</h3>
            <p className="text-xs text-slate-500">Choose the maintenance department to route your report</p>
          </div>

          {/* Department Cards */}
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
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-maroon-800 bg-maroon-50/70 ring-2 ring-maroon-800/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl w-fit ${isSelected ? 'bg-maroon-800 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <div className={`text-xs font-bold ${isSelected ? 'text-maroon-900' : 'text-slate-800'}`}>
                      {dept.name}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{dept.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Subcategory Pills */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700">Specific Equipment / Fixture:</label>
            <div className="flex flex-wrap gap-2">
              {currentDeptObj.subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    subcategory === sub
                      ? 'bg-maroon-800 text-white border-maroon-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
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
              className="px-6 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs"
            >
              <span>Next: Add Photos & Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details, Photos & Submit */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="white-card p-5 sm:p-7 rounded-3xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 3: Fault Details & Photo Proof</h3>
            <p className="text-xs text-slate-500">Provide description and snapshot for technician diagnosis</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Summary Title:</label>
              <input
                type="text"
                placeholder={`e.g. ${subcategory} not turning on`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description:</label>
              <textarea
                rows={3}
                placeholder="Explain the symptom (e.g. humming noise, sparks, water overflowing, projector no signal)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700 resize-none"
              />
            </div>

            {/* Priority Urgency Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Priority Urgency:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'critical', label: 'Critical', desc: '< 2h SLA (Hazard)', border: 'border-rose-500 text-rose-700 bg-rose-50' },
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
                    <div className="text-[10px] opacity-75 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload & Phone Camera Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Attach Fault Photos / Smartphone Camera:</label>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-3">
                {photoURLs.map((url, idx) => (
                  <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
                    <img src={url} alt="Proof" className="w-full h-full object-cover" />
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-maroon-300 hover:border-maroon-700 bg-maroon-50/50 flex flex-col items-center justify-center text-maroon-800 hover:bg-maroon-50 transition text-[10px] font-bold"
                >
                  <Camera className="w-5 h-5 mb-1 text-maroon-800" />
                  <span>Snap Photo</span>
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
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Confirm & Dispatch Work Order'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Step 4: Success Screen */}
      {step === 4 && createdTicketData && (
        <div className="white-card p-6 sm:p-8 rounded-3xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 bg-maroon-50 text-maroon-800 rounded-full font-mono text-xs font-bold border border-maroon-200">
              Work Order #{createdTicketData.id}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              Fault Report Successfully Registered!
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Your ticket has been dispatched to the <strong>{category.toUpperCase()}</strong> Department. Real-time updates and PDF work order sent to <strong>{createdTicketData.reporterEmail}</strong>.
            </p>
          </div>

          {/* Quick Details Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left max-w-md mx-auto space-y-1.5">
            <div><strong>Location:</strong> {createdTicketData.building} (Floor {createdTicketData.floor}, Room {createdTicketData.roomNumber})</div>
            <div><strong>Equipment:</strong> {createdTicketData.subcategory}</div>
            <div><strong>SLA Target:</strong> {new Date(createdTicketData.slaDeadline).toLocaleTimeString()} ({createdTicketData.priority.toUpperCase()})</div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => downloadTicketReportPDF(createdTicketData)}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
            >
              <FileText className="w-4 h-4 text-maroon-800" />
              <span>Download A4 Work Order PDF</span>
            </button>

            <button
              onClick={() => navigate('/my-tickets')}
              className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Track Live Status in My Tickets →
            </button>
          </div>
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
