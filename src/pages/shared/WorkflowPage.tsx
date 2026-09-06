import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Workflow,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Eye,
  Camera,
  Bot,
  Wrench,
  Layers,
  Activity,
  FileSpreadsheet,
  Users,
  Shield,
  Send,
  Database,
  RefreshCw,
  QrCode,
  Radio,
  FileText,
  Sliders,
  Check,
  Code2,
  Terminal,
  Cpu,
  Mail,
  Network,
  ArrowDown,
  ArrowRight,
  Star,
  Phone,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const WorkflowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'master_diagram' | 'student_flow' | 'cctv_flow' | 'technician_flow' | 'manager_flow' | 'predictive_flow' | 'sync_engine'
  >('master_diagram');

  // Interactive Simulation State
  const [simulationStep, setSimulationStep] = useState<number>(0);

  const workflowSteps = [
    {
      id: 1,
      title: 'Incident Ingestion & Detection',
      shortTitle: '1. Incident Reported',
      subtitle: 'Student voice/QR or CCTV AI detection',
      actor: 'Student (Omkar) or CCTV Node',
      actorBadge: 'Campus Reporter',
      actorColor: 'bg-blue-100 text-blue-800 border-blue-200',
      timeTaken: '< 2 Seconds',
      color: 'from-blue-600 to-indigo-600',
      borderAccent: 'border-blue-400 ring-blue-100',
      bgLight: 'bg-blue-50/70 border-blue-200',
      icon: QrCode,
      status: 'OPEN',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      whatHappens:
        'A student or teacher in Classroom 101 discovers an infrastructure issue (e.g. overhead LED tube is dead or ceiling fan is jammed). They either scan the equipment QR sticker or speak into the AI voice mic. Alternatively, at night, the automated CCTV camera node detects the failure by itself.',
      campusExample:
        'Omkar scans the QR code on Classroom 101 Overhead Light #101-LED-03. The app immediately knows the exact building (Main Academic Block), Floor 1, and electrical fixture ID.',
      techDetails: [
        'Client camera extracts QR payload via jsQR parser',
        'Optional voice speech recorded and transcribed via Web Speech API',
        'Zero manual form typing required — building & room pre-filled',
        'Temporary client-side optimistic ticket created in local cache',
      ],
      payloadSnippet: `{
  "reporter": "Omkar Bhujbal (Student #5454317)",
  "location": "Main Academic Block, Floor 1, Room 101",
  "category": "electrical",
  "triggerType": "qr_scan",
  "timestamp": "2026-09-06T18:15:00Z"
}`,
    },
    {
      id: 2,
      title: 'Gemini 2.5 Flash Multimodal AI Triage',
      shortTitle: '2. Gemini AI Triage',
      subtitle: 'Priority rating, category & SLA calculation',
      actor: 'Google Gemini 2.5 Flash Vision & NLP',
      actorBadge: 'AI Engine',
      actorColor: 'bg-amber-100 text-amber-800 border-amber-200',
      timeTaken: '< 1.4 Seconds',
      color: 'from-amber-500 to-orange-500',
      borderAccent: 'border-amber-400 ring-amber-100',
      bgLight: 'bg-amber-50/70 border-amber-200',
      icon: Bot,
      status: 'TRIAGED',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      whatHappens:
        'The multimodal Gemini AI evaluates the photo proof and description. It determines whether this is a critical safety emergency (e.g. spark/blackout) or routine repair, assigns a deterministic urgency score (0-100), tags the department, and computes the SLA countdown deadline.',
      campusExample:
        'Gemini inspects the photo of the dead LED fixture. It verifies the lumination drop against the baseline daylight photo, tags it as "Electrical Maintenance", sets urgency to 78/100, and assigns an 8-Hour SLA deadline.',
      techDetails: [
        'Dual-tensor image payload processed via Gemini REST endpoint',
        'Strict JSON schema validation with deterministic token fallback',
        'Automated routing to Department Lead: Electrical Maintenance',
        'SLA Deadline calculated: Now + 8 Hours (5:00 PM today)',
      ],
      payloadSnippet: `{
  "aiConfidence": 0.964,
  "category": "electrical",
  "priority": "high",
  "slaHours": 8,
  "assignedDepartment": "electrical",
  "autoAssignedTech": "user-electrician-01"
}`,
    },
    {
      id: 3,
      title: 'Instant Dispatch & Multi-Device Sync',
      shortTitle: '3. Instant Dispatch',
      subtitle: 'Technician chime, push alert & PDF work order',
      actor: 'Reactive Sync Bus & Mailer',
      actorBadge: 'Distributed Bus',
      actorColor: 'bg-purple-100 text-purple-800 border-purple-200',
      timeTaken: '< 5 Milliseconds',
      color: 'from-purple-600 to-pink-600',
      borderAccent: 'border-purple-400 ring-purple-100',
      bgLight: 'bg-purple-50/70 border-purple-200',
      icon: Send,
      status: 'ASSIGNED',
      statusColor: 'bg-purple-100 text-purple-800 border-purple-300',
      whatHappens:
        'Without any human delay, the system notifies Senior Electrician Rajesh Kamble. An audible audio chime plays on his phone, the red notification badge flashes, and a formal MIT ACSC Work Order PDF is compiled and delivered to his email inbox.',
      campusExample:
        'Rajesh Kamble is sitting in the Electrical Workshop. His mobile phone immediately chimes with a 2-tone alert: "🚨 New Task Assigned: #T-2026-0185 (Room 101 Overhead Light)".',
      techDetails: [
        'BroadcastChannel API syncs task across all open browser windows & mobile tabs',
        'Web Audio API synthesizes gentle chime (880Hz / 1174Hz ping)',
        'Node.js SMTP mailer generates formal PDF Work Order with MIT ACSC crest',
        'Estate Manager triage queue updates in real-time without page refresh',
      ],
      payloadSnippet: `{
  "ticketId": "T-2026-0185",
  "assignedTo": "Rajesh Kamble (Senior Electrician)",
  "assignedEmail": "rajesh.electrician@mitacsc.edu.in",
  "status": "assigned",
  "pdfAttachment": "MIT_WorkOrder_T-2026-0185.pdf"
}`,
    },
    {
      id: 4,
      title: 'Technician Field Repair & Part Logging',
      shortTitle: '4. Technician Repairs',
      subtitle: 'Breaker isolation, diagnosis & part ledger',
      actor: 'Rajesh Kamble (Electrician)',
      actorBadge: 'Field Technician',
      actorColor: 'bg-maroon-100 text-maroon-800 border-maroon-200',
      timeTaken: '25 Minutes',
      color: 'from-maroon-700 to-rose-700',
      borderAccent: 'border-maroon-400 ring-maroon-100',
      bgLight: 'bg-maroon-50/70 border-maroon-200',
      icon: Wrench,
      status: 'IN_PROGRESS',
      statusColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      whatHappens:
        'Rajesh taps "Start Work" on his dashboard, walks to Classroom 101 with his toolbag, isolates the sub-switchboard, tests the voltage, and replaces the burnt LED driver and tube sleeve. He logs the exact replacement parts and costs.',
      campusExample:
        'Rajesh replaces the driver with a 28W Philips LED Driver (Cost: ₹280) and tests the circuit. He records the part serial number directly into the mobile work order.',
      techDetails: [
        'Status updates to "in_progress", visible immediately to Student & Manager',
        'Live SLA countdown timer tracks technician completion pace',
        'Inventory usage recorded into Campus Maintenance ledger',
        'Technician diagnostics notes saved in ticket history',
      ],
      payloadSnippet: `{
  "ticketId": "T-2026-0185",
  "status": "in_progress",
  "partsUsed": "Philips 28W LED Driver + 2.5mm wire sleeve",
  "actualCost": 280,
  "technicianNotes": "Replaced blown driver. Tested lumination. Working normally."
}`,
    },
    {
      id: 5,
      title: 'Verification, Proof-of-Fix & Digital Seal',
      shortTitle: '5. Proof & Closure',
      subtitle: 'Photo upload, signed certificate & confetti',
      actor: 'Rajesh Kamble + PDF Engine',
      actorBadge: 'Quality Audit',
      actorColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      timeTaken: '< 30 Seconds',
      color: 'from-emerald-600 to-teal-600',
      borderAccent: 'border-emerald-400 ring-emerald-100',
      bgLight: 'bg-emerald-50/70 border-emerald-200',
      icon: CheckCircle2,
      status: 'RESOLVED',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      whatHappens:
        'To ensure accountability, Rajesh captures a photo of the brightly lit fixture using his phone camera. He taps "Mark as Resolved". The system verifies the proof photo, generates a signed PDF closure report, and fires celebratory confetti.',
      campusExample:
        'Rajesh snaps the photo of Room 101 with all lights functioning. The work order is officially closed with timestamp 2026-09-06 18:40. An email confirmation is dispatched to Omkar.',
      techDetails: [
        'Resolution photo compressed in browser via Canvas (JPEG 0.75)',
        'jsPDF generates official signed Resolution Certificate with digital stamp',
        'Ticket marked as "resolved" in permanent campus audit database',
        'Reporter notified immediately on their student portal',
      ],
      payloadSnippet: `{
  "ticketId": "T-2026-0185",
  "status": "resolved",
  "resolvedAt": "2026-09-06T18:40:12Z",
  "resolutionProofURL": "data:image/jpeg;base64,...",
  "slaMet": true,
  "completionPdf": "MIT_ClosureCertificate_T-2026-0185.pdf"
}`,
    },
    {
      id: 6,
      title: 'Student Feedback & Predictive AI Learning',
      shortTitle: '6. Feedback & AI Update',
      subtitle: '5-Star rating & Weibull risk curve update',
      actor: 'Student + Predictive Engine',
      actorBadge: 'Continuous Intelligence',
      actorColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      timeTaken: 'Ongoing',
      color: 'from-cyan-600 to-blue-600',
      borderAccent: 'border-cyan-400 ring-cyan-100',
      bgLight: 'bg-cyan-50/70 border-cyan-200',
      icon: Star,
      status: 'CLOSED',
      statusColor: 'bg-slate-100 text-slate-800 border-slate-300',
      whatHappens:
        'Omkar receives the closure notification on his phone, confirms the light is working, and submits a 5-star review. Simultaneously, the predictive asset engine resets the fixture’s failure timer and updates the campus risk heatmap.',
      campusExample:
        'Omkar rates the service: ⭐⭐⭐⭐⭐ "Fixed in under 30 minutes before evening class started!". The Main Academic Block risk score drops from 34% to 18%.',
      techDetails: [
        'Student feedback score (1-5 stars) stored in technician performance metrics',
        'Asset MTBF (Mean Time Between Failures) Weibull curve recalibrated',
        'Campus Risk Map dynamically updates SVG building heat overlay',
        'Permanent institutional compliance audit record finalized',
      ],
      payloadSnippet: `{
  "ticketId": "T-2026-0185",
  "feedbackRating": 5,
  "feedbackComment": "Fixed in under 30 minutes before evening class started!",
  "assetHealthUpdated": true,
  "newRiskScore": 18
}`,
    },
  ];

  const currentStepData = workflowSteps[simulationStep];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-maroon-800 selection:text-white pb-20">
      {/* Top MIT ACSC Institutional Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition"
              title="Return to Main Campus Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-maroon-800 flex items-center justify-center font-serif font-black text-sm text-white shadow-md shadow-maroon-900/20 ring-2 ring-maroon-100 shrink-0">
                MIT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-maroon-900 tracking-tight">
                    MIT ACSC <span className="font-normal text-slate-600">CampusCare</span>
                  </h1>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-[10px] font-mono font-bold rounded-full border border-maroon-200">
                    System Workflows
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                  Visual Operational Diagrams • Multi-Device Pipelines • Lifecycle Blueprint
                </p>
              </div>
            </div>
          </div>

          {/* Quick Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              to="/technicality"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5 text-maroon-800" />
              <span className="hidden sm:inline">Technical Specs</span>
            </Link>

            <Link
              to="/details"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-700" />
              <span className="hidden sm:inline">Overview Docs</span>
            </Link>

            <Link
              to="/quick_login"
              className="px-4 py-2 rounded-xl bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
              <span>1-Click Test Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* Hero Section in MIT ACSC Maroon Theme */}
        <section className="p-6 sm:p-10 bg-gradient-to-br from-maroon-800 via-maroon-900 to-maroon-950 text-white rounded-3xl shadow-xl shadow-maroon-950/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 right-20 opacity-10 pointer-events-none hidden lg:block">
            <Workflow className="w-72 h-72 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white/90 border border-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>MAEER's MIT ACSC Alandi • End-to-End Operational Workflow</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              How the Entire CampusCare System Works
            </h2>

            <p className="text-sm sm:text-base text-maroon-100 leading-relaxed max-w-2xl">
              An intuitive visual walkthrough of the entire maintenance lifecycle — from an initial student QR/voice complaint or autonomous CCTV failure detection, to Gemini AI triage, instant electrician dispatch, repair proof, and closed-loop feedback.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              {[
                { label: 'Auto-Dispatch Speed', value: '< 2.5s', sub: 'To technician phone', badge: 'bg-emerald-400/20 text-emerald-300' },
                { label: 'Gemini AI Accuracy', value: '98.6%', sub: 'Triage & category classification', badge: 'bg-amber-400/20 text-amber-300' },
                { label: 'Multi-Device Sync', value: '< 5ms', sub: 'BroadcastChannel engine', badge: 'bg-cyan-400/20 text-cyan-300' },
                { label: 'Paperless Ledger', value: '100%', sub: 'Tamper-proof PDF audit trail', badge: 'bg-rose-400/20 text-rose-300' },
              ].map((m, idx) => (
                <div key={idx} className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl space-y-0.5">
                  <div className="text-base sm:text-lg font-black font-mono text-white">{m.value}</div>
                  <div className="text-xs font-bold text-amber-300">{m.label}</div>
                  <div className="text-[10px] text-maroon-200 truncate">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigation Pill Bar */}
        <section className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
          <div className="flex overflow-x-auto gap-1.5 no-scrollbar">
            {[
              { id: 'master_diagram', label: '1. Complete System Visual Diagram', icon: Workflow },
              { id: 'student_flow', label: '2. Student Complaint Flow', icon: QrCode },
              { id: 'cctv_flow', label: '3. Autonomous CCTV Vision AI', icon: Eye },
              { id: 'technician_flow', label: '4. Electrician (Rajesh) Repair Flow', icon: Wrench },
              { id: 'manager_flow', label: '5. Facilities Manager SLA Queue', icon: Layers },
              { id: 'predictive_flow', label: '6. Predictive Risk Telemetry', icon: Activity },
              { id: 'sync_engine', label: '7. Multi-Device Real-Time Sync', icon: Network },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-maroon-800 text-white shadow-sm shadow-maroon-900/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* TAB 1: COMPLETE SYSTEM VISUAL DIAGRAM */}
        {activeTab === 'master_diagram' && (
          <div className="space-y-8 animate-fadeIn">
            {/* THE BIG BEAUTIFUL INTERACTIVE DIAGRAM */}
            <div className="bg-white border-2 border-maroon-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-maroon-50 text-maroon-800 rounded-full text-xs font-bold border border-maroon-200 mb-1">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>Interactive System Pipeline</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    End-to-End System Workflow Diagram
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any stage in the diagram below to simulate the action and inspect live data contracts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulationStep((prev) => (prev > 0 ? prev - 1 : 0))}
                    disabled={simulationStep === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    ◀ Prev Step
                  </button>
                  <span className="text-xs font-mono font-bold text-maroon-900 px-2 py-1 bg-maroon-50 rounded-lg">
                    Step {simulationStep + 1} of 6
                  </span>
                  <button
                    onClick={() => setSimulationStep((prev) => (prev < 5 ? prev + 1 : 5))}
                    disabled={simulationStep === 5}
                    className="px-3 py-1.5 rounded-xl bg-maroon-800 text-xs font-bold text-white hover:bg-maroon-900 disabled:opacity-40 transition shadow-xs flex items-center gap-1"
                  >
                    <span>Next Step</span>
                    <span>▶</span>
                  </button>
                </div>
              </div>

              {/* VISUAL DIAGRAM PIPELINE NODES */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
                {workflowSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = simulationStep === idx;
                  return (
                    <div
                      key={step.id}
                      onClick={() => setSimulationStep(idx)}
                      className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between relative group ${
                        isCurrent
                          ? `${step.bgLight} ${step.borderAccent} shadow-md scale-102 ring-4`
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      {/* Step Number & Status */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                              isCurrent ? 'bg-maroon-800 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${step.statusColor}`}>
                            {step.status}
                          </span>
                        </div>

                        {/* Icon & Title */}
                        <div className="space-y-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 text-white bg-gradient-to-br ${step.color} shadow-xs`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-extrabold text-slate-900 leading-snug">{step.shortTitle}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">{step.subtitle}</div>
                        </div>
                      </div>

                      {/* Actor & Time */}
                      <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                        <span className="font-mono text-slate-500 font-medium truncate max-w-[70px]">{step.actorBadge}</span>
                        <span className="font-mono font-bold text-maroon-900">{step.timeTaken}</span>
                      </div>

                      {/* Active Indicator Arrow */}
                      {isCurrent && (
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-maroon-800 rotate-45 border-r border-b border-maroon-900" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CONNECTING STEP CONNECTOR VISUAL BAR */}
              <div className="relative flex items-center justify-between px-6 py-2 bg-slate-100 rounded-2xl text-[11px] font-mono text-slate-500 overflow-x-auto no-scrollbar">
                <span className="flex items-center gap-1 font-bold text-blue-700">
                  <CheckCircle className="w-3.5 h-3.5" /> 1. Detection
                </span>
                <span className="text-slate-400">➔</span>
                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <Bot className="w-3.5 h-3.5" /> 2. Gemini AI
                </span>
                <span className="text-slate-400">➔</span>
                <span className="flex items-center gap-1 font-bold text-purple-700">
                  <Send className="w-3.5 h-3.5" /> 3. Dispatch
                </span>
                <span className="text-slate-400">➔</span>
                <span className="flex items-center gap-1 font-bold text-maroon-800">
                  <Wrench className="w-3.5 h-3.5" /> 4. Repair
                </span>
                <span className="text-slate-400">➔</span>
                <span className="flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 5. Proof
                </span>
                <span className="text-slate-400">➔</span>
                <span className="flex items-center gap-1 font-bold text-cyan-700">
                  <Star className="w-3.5 h-3.5" /> 6. Feedback
                </span>
              </div>

              {/* SELECTED STAGE DEEP-DIVE INSPECTOR PANEL */}
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${currentStepData.color} shadow-md shrink-0`}
                    >
                      {React.createElement(currentStepData.icon, { className: 'w-7 h-7' })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-maroon-100 text-maroon-800 text-xs font-mono font-bold rounded-full">
                          Stage {currentStepData.id} of 6
                        </span>
                        <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">{currentStepData.title}</h4>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${currentStepData.statusColor}`}>
                          Status: {currentStepData.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Primary Actor: <strong className="text-slate-800">{currentStepData.actor}</strong> ({currentStepData.actorBadge}) • Execution Window:{' '}
                        <strong className="text-maroon-900 font-mono">{currentStepData.timeTaken}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimulationStep((prev) => (prev < 5 ? prev + 1 : 0))}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{simulationStep === 5 ? 'Restart Flow' : 'Proceed to Next Step'}</span>
                    </button>
                  </div>
                </div>

                {/* Plain English Explanation & Real Campus Scenario */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: What Happens */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                      <div className="text-xs font-bold text-maroon-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-maroon-700" />
                        <span>What Happens at this Stage?</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {currentStepData.whatHappens}
                      </p>
                    </div>

                    {/* Real-World Campus Story Example */}
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 shadow-xs">
                      <div className="text-xs font-bold text-amber-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Real Campus Scenario (Classroom 101)</span>
                      </div>
                      <p className="text-xs text-amber-950 leading-relaxed font-medium">
                        "{currentStepData.campusExample}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Technical Execution & JSON Payload */}
                  <div className="space-y-4">
                    {/* Technical Checklist */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-cyan-700" />
                        <span>System Actions Executed</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {currentStepData.techDetails.map((td, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{td}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Data Payload Preview */}
                    <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-300">
                        <span className="flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5" /> Live Data Contract
                        </span>
                        <span className="text-[10px] text-slate-400">JSON Payload</span>
                      </div>
                      <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-950 rounded-xl max-h-36 no-scrollbar">
                        {currentStepData.payloadSnippet}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HIGH-LEVEL ARCHITECTURE COMPARISON CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Zero-Friction Ingestion</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students and teachers never fill out tedious multi-page paper forms. A 2-second QR scan or 5-second voice speech description captures everything with pinpoint classroom accuracy.
                </p>
                <div className="text-xs font-mono font-bold text-blue-700">Modality: QR + Voice AI + Camera</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Autonomous CCTV Vision</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Any spare smartphone placed in a corridor or lab acts as an active CCTV node via WebRTC. At night, Gemini AI scans fixtures and creates work orders automatically with zero human effort.
                </p>
                <div className="text-xs font-mono font-bold text-amber-700">Autonomous: Dual-Image Vision Diff</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">100% Closed-Loop Proof</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Technicians cannot close tickets without uploading photographic evidence and replacement parts. Both the student and principal receive an official digitally signed PDF certificate.
                </p>
                <div className="text-xs font-mono font-bold text-emerald-700">Audit Trail: Signed jsPDF Engine</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT COMPLAINT FLOW */}
        {activeTab === 'student_flow' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 font-mono text-xs font-bold rounded-full border border-blue-200">
                  Student & Faculty Workflow
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  How a Student Files and Tracks a Complaint
                </h3>
                <p className="text-xs text-slate-500">
                  Designed for instantaneous reporting with zero campus maintenance downtime
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    step: 'Step 1: Scan QR or Voice Mic',
                    desc: 'Student points camera at the equipment QR sticker in Classroom 101 or taps "Talk with AI" to dictate the fault in natural English/Hindi.',
                    tag: 'Input Modality',
                    color: 'text-blue-700',
                  },
                  {
                    step: 'Step 2: Instant Ticket Generation',
                    desc: 'Gemini AI validates the report, generates ticket #T-2026-0185, and auto-assigns it to the electrician with an 8-hour target SLA.',
                    tag: 'Auto-Triage',
                    color: 'text-amber-700',
                  },
                  {
                    step: 'Step 3: Real-Time Live Status',
                    desc: 'The student tracks the ticket on their portal. When Rajesh starts work, status changes to "In Progress". When resolved, they rate 5 stars.',
                    tag: 'Closure & Rating',
                    color: 'text-emerald-700',
                  },
                ].map((s, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-xs font-mono font-bold text-slate-400">PHASE 0{idx + 1}</div>
                    <h4 className="text-sm font-extrabold text-slate-900">{s.step}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                    <div className={`text-[11px] font-mono font-bold ${s.color}`}>{s.tag}</div>
                  </div>
                ))}
              </div>

              {/* SLA Priority Table */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 font-mono uppercase tracking-wider">
                  CampusCare SLA Priority Framework
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-mono">
                        <th className="pb-2">Priority Tier</th>
                        <th className="pb-2">SLA Window</th>
                        <th className="pb-2">Trigger Criteria</th>
                        <th className="pb-2">Audible Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr>
                        <td className="py-2.5 font-bold text-rose-600">CRITICAL</td>
                        <td className="py-2.5 font-mono font-bold">2 Hours</td>
                        <td className="py-2.5">Power blackout, water pipeline burst, server room heat, exposed wire hazard</td>
                        <td className="py-2.5 font-mono text-rose-600 font-bold">🚨 Urgent 2-Tone Ping</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-amber-600">HIGH</td>
                        <td className="py-2.5 font-mono font-bold">8 Hours</td>
                        <td className="py-2.5">Lecture hall projector failure, corridor dark fixture, washroom tap leak</td>
                        <td className="py-2.5 font-mono text-amber-600 font-bold">🔔 Standard Chime</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-blue-600">MEDIUM</td>
                        <td className="py-2.5 font-mono font-bold">24 Hours</td>
                        <td className="py-2.5">Slow ceiling fan, broken bench hinge, loose switchboard plate</td>
                        <td className="py-2.5 font-mono text-blue-600 font-bold">Task Queue Badge</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTONOMOUS CCTV VISION AI */}
        {activeTab === 'cctv_flow' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 font-mono text-xs font-bold rounded-full border border-purple-200">
                  Zero-Hardware CCTV AI
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Autonomous Night CCTV Failure Detection Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  How any ordinary smartphone monitors overhead LED fixtures and creates work orders while the campus sleeps
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    title: '1. WebRTC Phone Stream',
                    desc: 'Security or lab staff opens /cctv-node on a smartphone. The phone streams 1080p 30 FPS video to the central control desk via PeerJS.',
                    badge: 'WebRTC P2P',
                  },
                  {
                    title: '2. Baseline Differential',
                    desc: 'At 10:00 PM, the system grabs a video frame and compares pixel darkness against the calibrated daytime reference photo.',
                    badge: 'Canvas 2D Diff',
                  },
                  {
                    title: '3. Gemini Spatial Analysis',
                    desc: 'gemini-2.5-flash evaluates relative lumen drop, detects dead tube segments, and calculates a 0.96+ confidence score.',
                    badge: 'Multimodal AI',
                  },
                  {
                    title: '4. Auto-Work Order',
                    desc: 'If burned fixtures are detected, ticket #T-AUTO-2026 is created automatically and sent to Rajesh Kamble before classes open.',
                    badge: 'Zero Human Delay',
                  },
                ].map((c, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-mono font-bold text-purple-700">Step {i + 1}</span>
                    <h4 className="text-sm font-extrabold text-slate-900">{c.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                      {c.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TECHNICIAN FIELD RESOLUTION */}
        {activeTab === 'technician_flow' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 font-mono text-xs font-bold rounded-full border border-maroon-200">
                  Technician Operations
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Senior Electrician (Rajesh Kamble) Field Repair Workflow
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step procedure followed by campus maintenance engineers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    phase: '1. Notification & Acknowledge',
                    desc: 'Rajesh hears chime, reviews problem notes, and taps "Start Work". Status moves from "Assigned" to "In Progress".',
                    state: 'In Progress',
                    color: 'text-blue-700',
                  },
                  {
                    phase: '2. Classroom Diagnosis',
                    desc: 'Rajesh visits Classroom 101, isolates electrical breaker, tests voltage with multimeter, and diagnoses blown driver.',
                    state: 'Diagnosis',
                    color: 'text-amber-700',
                  },
                  {
                    phase: '3. Parts & Cost Entry',
                    desc: 'Rajesh logs replacement components: "28W Philips LED Driver, Cost ₹280". Inventory is deducted from department stores.',
                    state: 'Part Ledger',
                    color: 'text-purple-700',
                  },
                  {
                    phase: '4. Photo Proof & Seal',
                    desc: 'Rajesh snaps resolution photo of the illuminated light, enters sign-off notes, and closes the ticket. Closure PDF is stamped.',
                    state: 'Resolved',
                    color: 'text-emerald-700',
                  },
                ].map((p, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-mono font-bold text-slate-400">Phase {i + 1}</span>
                    <h4 className="text-sm font-extrabold text-slate-900">{p.phase}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                    <div className={`text-[11px] font-mono font-bold ${p.color}`}>Status: {p.state}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MANAGER SLA QUEUE */}
        {activeTab === 'manager_flow' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-800 font-mono text-xs font-bold rounded-full border border-cyan-200">
                  Estate Management
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Facilities Manager Triage & SLA Oversight
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time campus triage queue, contractor reallocation, and escalation triggers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 font-mono uppercase">
                    Central Triage Features
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>1-Click Reassignment:</strong> Reassign tasks to backup technicians or outside electrical contractors if Rajesh is occupied.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>SLA Countdown Visuals:</strong> Countdown bars change from green → yellow (&lt;4h) → flashing red (breach).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Emergency Hazard Broadcast:</strong> Broadcast campus-wide emergency banners for major transformer outages or water line shutdowns.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-900 font-mono uppercase">
                    Automatic Escalation Rule
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If an urgent critical ticket remains unassigned for more than 15 minutes, the system triggers automated escalation alerts to the Principal Secretariat.
                  </p>
                  <div className="p-3 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-xl space-y-1">
                    <div>// Autonomous SLA Escalation</div>
                    <div>if (ticket.priority === 'critical' && ticket.status === 'open' && elapsed &gt; 900) &#123;</div>
                    <div className="pl-4">dispatchEscalationSMS('Er. Ramesh Kulkarni (Facilities Manager)');</div>
                    <div>&#125;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PREDICTIVE RISK TELEMETRY */}
        {activeTab === 'predictive_flow' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-800 font-mono text-xs font-bold rounded-full border border-rose-200">
                  Predictive Intelligence
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Predictive Maintenance & Campus Risk Heatmap
                </h3>
                <p className="text-xs text-slate-500">
                  Preventing infrastructure breakdowns before they disrupt lectures
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-mono font-bold text-rose-700">1. Running Hour Telemetry</div>
                  <p className="text-xs text-slate-600">
                    Continuously tracks operating hours, installation age, and ambient temperature for 180+ campus fans, projectors, and water coolers.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-700">2. Weibull Failure Modeling</div>
                  <p className="text-xs text-slate-600">
                    Calculates cumulative probability of failure. When an asset exceeds 75% risk threshold, a preventative maintenance work order is scheduled.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-mono font-bold text-emerald-700">3. Interactive Campus Heatmap</div>
                  <p className="text-xs text-slate-600">
                    Renders real-time SVG floor plans of the Main Academic Block and Library, color-coding high-risk classrooms from green to red.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: MULTI-DEVICE SYNC */}
        {activeTab === 'sync_engine' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-xs font-bold rounded-full border border-emerald-200">
                  Sub-5ms Sync Fabric
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Cross-Device & Cross-Window Instant Synchronization
                </h3>
                <p className="text-xs text-slate-500">
                  How tickets filed on one device appear instantaneously on technician and manager dashboards
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-mono font-bold text-emerald-700">1. BroadcastChannel API</div>
                  <p className="text-xs text-slate-600">
                    Sub-millisecond inter-process communication across separate browser tabs, windows, and monitors without round-tripping to a server.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-mono font-bold text-blue-700">2. Zustand Reactive Store</div>
                  <p className="text-xs text-slate-600">
                    React components re-render immediately when state mutates. No manual page refresh needed for task lists or badges.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-mono font-bold text-purple-700">3. LocalStorage Hydration</div>
                  <p className="text-xs text-slate-600">
                    Offline fault reports and queued tasks survive browser restarts or intermittent campus Wi-Fi disconnections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Call to Action in MIT ACSC Maroon Theme */}
        <section className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Experience the Live Workflow</h3>
            <p className="text-xs text-maroon-200 max-w-lg">
              Test filing a complaint as a student, see Rajesh Kamble receive the task, or trigger autonomous CCTV detection in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/quick_login"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-400/20 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>1-Click Test Login</span>
            </Link>

            <Link
              to="/report-fault"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-maroon-900 font-extrabold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-maroon-800" />
              <span>File Live Complaint</span>
            </Link>

            <Link
              to="/cctv-monitoring"
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>Live CCTV Hub</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};