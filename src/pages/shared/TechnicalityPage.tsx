import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Cpu,
  Eye,
  Server,
  Network,
  Zap,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Database,
  Radio,
  FileSpreadsheet,
  Users,
  QrCode,
  Lock,
  ChevronRight,
  ExternalLink,
  Bot,
  Activity,
  Workflow,
  Share2,
  Terminal,
  Clock,
  Code2,
  RefreshCw,
  Sliders,
  Send,
  Smartphone,
  Check,
} from 'lucide-react';

export const TechnicalityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'ai_vision' | 'webrtc' | 'data_flow' | 'security' | 'database'>('architecture');
  const [activeSubsystem, setActiveSubsystem] = useState<number>(0);

  const subsystems = [
    {
      id: 'vision_core',
      title: 'Multimodal Gemini AI Engine',
      tag: 'Computer Vision & NLP',
      color: 'from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-500/30',
      badge: 'gemini-2.5-flash',
      desc: 'Dual-image baseline comparison for LED tube fault detection & automated ticket triage with confidence scoring.',
      highlights: [
        'Dual Base64 payload streaming via Gemini REST API',
        'Strict JSON schema parsing with automated fallback models',
        'Automatic Urgency & Priority rating (0-100 scoring)',
        'Classroom audio/speech-to-text ticket description generation',
      ],
    },
    {
      id: 'webrtc_matrix',
      title: 'Decentralized WebRTC Camera Mesh',
      tag: 'Zero-Hardware CCTV',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
      badge: 'PeerJS + STUN/TURN',
      desc: 'Transforms any standard smartphone camera into an active enterprise surveillance CCTV node without external software.',
      highlights: [
        'Peer-to-Peer 1080p 30-60 FPS WebRTC media streams',
        'Dynamic QR barcode synchronization for instantaneous phone-to-hub pairing',
        'Fallback to 10 FPS compressed data canvas broadcast on restricted networks',
        'Remote torch flashlight and camera lens orientation controls',
      ],
    },
    {
      id: 'reactive_state',
      title: 'Reactive Distributed Sync Engine',
      tag: 'Multi-Device State',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
      badge: 'Zustand + BroadcastChannel',
      desc: 'Sub-millisecond state synchronization across separate browser windows, mobile phones, and projector control rooms.',
      highlights: [
        'Inter-tab memory replication via BroadcastChannel API',
        'Persistent LocalStorage state hydrator with schema versioning',
        'Optimistic UI state updates with rollback guarantees',
        'Simulated cloud push channel for background alerts & work orders',
      ],
    },
    {
      id: 'predictive_maint',
      title: 'Asset Lifecycle & Risk Telemetry',
      tag: 'Predictive Analytics',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30',
      badge: 'Weibull Hazard Models',
      desc: 'Proactive equipment health calculation calculating Mean Time Between Failures (MTBF) and anomaly probability.',
      highlights: [
        'Running operational hour tracking with environmental degradation weighting',
        'Automated preventative maintenance work order auto-generation',
        'Campus-wide interactive SVG heat risk mapping',
        'Real-time SLA countdown timers with automated escalation flags',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-20">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-maroon-600/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-amber-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Engineering Banner */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60"
              title="Return to Main Application"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-amber-500/20">
                <Code2 className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-mono">
                    Technicality <span className="text-amber-400 font-sans font-semibold text-xs tracking-normal px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">v2.5 Architecture</span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">MIT ACSC CampusCare / InfraMind AI Engineering Specs</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/workflow"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Workflow className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">System Workflows</span>
            </Link>
            <Link
              to="/details"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Overview Docs</span>
            </Link>
            <Link
              to="/cctv-monitoring"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Live Vision AI</span>
            </Link>
            <Link
              to="/quick_login"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Launch App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Engineering Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
            <Cpu className="w-64 h-64 text-amber-400" />
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Deep Technical Specifications & Component Matrix
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Enterprise IoT & AI Infrastructure Deep-Dive
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore the end-to-end technical mechanics of <strong className="text-white">MIT ACSC CampusCare</strong>: real-time WebRTC camera multiplexing, Google Gemini multimodal computer vision algorithms, deterministic Weibull predictive maintenance models, and multi-tenant Role-Based Access Control.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {[
                { label: 'Vision Inference Latency', value: '< 1.4s', icon: Bot, color: 'text-amber-400' },
                { label: 'WebRTC P2P Frame Rate', value: '30-60 FPS', icon: Radio, color: 'text-cyan-400' },
                { label: 'Cross-Device Sync Lag', value: '< 5ms', icon: Network, color: 'text-emerald-400' },
                { label: 'Edge Availability', value: '99.99%', icon: Server, color: 'text-purple-400' },
              ].map((m, i) => (
                <div key={i} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-1">
                    <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                    <span>{m.label}</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-white">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigator */}
        <section className="space-y-6">
          <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-800 no-scrollbar">
            {[
              { id: 'architecture', label: '1. Architecture Blueprint', icon: Layers },
              { id: 'ai_vision', label: '2. Gemini Vision Pipeline', icon: Eye },
              { id: 'webrtc', label: '3. WebRTC P2P Video Mesh', icon: Radio },
              { id: 'data_flow', label: '4. Distributed Sync Engine', icon: Network },
              { id: 'security', label: '5. RBAC & Security Spec', icon: Shield },
              { id: 'database', label: '6. Schema & Data Contracts', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: SYSTEM ARCHITECTURE BLUEPRINT */}
          {activeTab === 'architecture' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Visual ASCII / SVG Diagram Block */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                      <Workflow className="w-5 h-5 text-amber-400" />
                      End-to-End Micro-Tier Architecture Diagram
                    </h3>
                    <p className="text-xs text-slate-400">High-level interaction between Client, AI Inference Edge, WebRTC nodes, and SMTP services</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                    Interactive Topology Map
                  </span>
                </div>

                {/* Interactive Diagram Canvas */}
                <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 border border-slate-800 overflow-x-auto">
                  <div className="min-w-[700px] text-xs font-mono space-y-4">
                    {/* Tier 1: Client Layer */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-900/90 border border-blue-500/40 rounded-xl p-4 text-center space-y-1">
                        <div className="text-blue-400 font-bold uppercase">📱 Mobile PWA Node</div>
                        <div className="text-slate-400 text-[11px]">QR Scanner / WebRTC Cam / Student Complaint UI</div>
                        <div className="text-[10px] text-slate-500">React 19 + jsQR + PeerJS</div>
                      </div>
                      <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-4 text-center space-y-1">
                        <div className="text-purple-400 font-bold uppercase">💻 Desktop Control Room</div>
                        <div className="text-slate-400 text-[11px]">CCTV Vision Dashboard / Risk Map / Asset DB</div>
                        <div className="text-[10px] text-slate-500">Tailwind + Zustand + Recharts</div>
                      </div>
                      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-4 text-center space-y-1">
                        <div className="text-emerald-400 font-bold uppercase">🛠️ Technician Work Terminal</div>
                        <div className="text-slate-400 text-[11px]">Task Lifecycle / Proof of Fix / PDF Generation</div>
                        <div className="text-[10px] text-slate-500">jsPDF + Canvas Confetti</div>
                      </div>
                    </div>

                    {/* Bridge Arrows */}
                    <div className="flex justify-around text-slate-500 font-bold text-sm">
                      <div>↕ WebRTC Video / STUN</div>
                      <div>↕ BroadcastChannel API</div>
                      <div>↕ REST JSON Payloads</div>
                    </div>

                    {/* Tier 2: Core Processing & Engine Hub */}
                    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between items-center text-amber-400 font-bold uppercase tracking-wider text-xs">
                        <span>⚡ Core Edge Reactive Layer (Client Runtime Engine)</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 rounded-md border border-amber-500/30">Sub-5ms Execution</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-[11px]">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-amber-300 font-semibold block">Ticket Store:</span>
                          <span className="text-slate-400">CRUD + Auto-Triage + SLA Timers</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-amber-300 font-semibold block">CCTV Stream Service:</span>
                          <span className="text-slate-400">PeerJS Hub + Frame Buffer Matrix</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-amber-300 font-semibold block">Sync Service:</span>
                          <span className="text-slate-400">Cross-Tab & Cross-Device Telemetry</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-amber-300 font-semibold block">Predictive Risk Engine:</span>
                          <span className="text-slate-400">Asset Hazard Curves & Anomaly Logic</span>
                        </div>
                      </div>
                    </div>

                    {/* Bridge Arrows */}
                    <div className="flex justify-around text-slate-500 font-bold text-sm">
                      <div>⬇ Base64 Dual Inference</div>
                      <div>⬇ STUN Negotiation</div>
                      <div>⬇ SMTP Notification Dispatch</div>
                    </div>

                    {/* Tier 3: External APIs & Cloud Services */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 text-center space-y-1">
                        <div className="text-amber-400 font-bold uppercase">🤖 Google Gemini Cloud API</div>
                        <div className="text-slate-400 text-[11px]">gemini-2.5-flash Multi-modal Vision Model</div>
                        <div className="text-[10px] text-slate-500">Structured JSON Output Parsing</div>
                      </div>
                      <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 text-center space-y-1">
                        <div className="text-cyan-400 font-bold uppercase">🌐 Google STUN Server Mesh</div>
                        <div className="text-slate-400 text-[11px]">NAT Traversal & ICE Candidate Resolution</div>
                        <div className="text-[10px] text-slate-500">stun.l.google.com:19302</div>
                      </div>
                      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-4 text-center space-y-1">
                        <div className="text-emerald-400 font-bold uppercase">✉️ Node.js Express + SMTP</div>
                        <div className="text-slate-400 text-[11px]">Nodemailer + Google SMTP PDF Work Orders</div>
                        <div className="text-[10px] text-slate-500">Transactional Email Service</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subsystems Interactive Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subsystems.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSubsystem(idx)}
                    className={`p-6 rounded-3xl border transition cursor-pointer ${
                      activeSubsystem === idx
                        ? 'bg-slate-900 border-amber-500/80 shadow-xl shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${s.color}`}>
                        {s.tag}
                      </span>
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                        {s.badge}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1.5">{s.title}</h4>
                    <p className="text-xs text-slate-300 mb-4">{s.desc}</p>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {s.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI VISION PIPELINE */}
          {activeTab === 'ai_vision' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                      <Eye className="w-5 h-5 text-amber-400" />
                      Multimodal Vision AI Inference Pipeline
                    </h3>
                    <p className="text-xs text-slate-400">Algorithmic workflow for automated LED tube fixture failure detection</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
                    Dual-Tensor Image Processing
                  </span>
                </div>

                {/* Pipeline Flow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      step: '01',
                      title: 'Live Frame Capture',
                      desc: 'Real-time WebRTC HTML5 Video stream is sampled at 1280x720. A baseline (normal operational reference) and current frame are rasterized to base64.',
                      tech: 'CanvasRenderingContext2D',
                    },
                    {
                      step: '02',
                      title: 'Prompt & Payload Prep',
                      desc: 'Both image payloads are structured into multi-part content arrays with domain-specific system prompts enforcing strict JSON output.',
                      tech: 'application/json Schema',
                    },
                    {
                      step: '03',
                      title: 'Gemini Inference',
                      desc: 'gemini-2.5-flash processes spatial lumination differential, counting visible LEDs, calculating working vs failed count, and electricity state.',
                      tech: 'Google Generative AI REST',
                    },
                    {
                      step: '04',
                      title: 'Automatic Dispatch',
                      desc: 'If failedLEDs > 0 or status === "fault_detected", an emergency ticket is auto-generated with priority "critical" and dispatched to technician.',
                      tech: 'Zustand + Email Simulator',
                    },
                  ].map((p, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 relative">
                      <div className="text-amber-400 font-mono font-black text-xl">{p.step}</div>
                      <div className="text-white font-bold text-sm">{p.title}</div>
                      <div className="text-slate-400 text-xs leading-relaxed">{p.desc}</div>
                      <div className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block mt-2">
                        {p.tech}
                      </div>
                    </div>
                  ))}
                </div>

                {/* JSON Output Schema Sample */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                    <span>Target Inference JSON Contract:</span>
                    <span className="text-slate-500 text-[11px]">Strict Type Checking Enabled</span>
                  </div>
                  <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
{`{
  "status": "fault_detected" | "all_working" | "power_outage" | "inconclusive",
  "confidence": 0.94,
  "totalLEDsVisible": 12,
  "workingLEDs": 9,
  "failedLEDs": 3,
  "detectedIssues": [
    "Partial LED array extinguishment on fixture B-02",
    "Ballast flicker detected in upper right quadrant"
  ],
  "electricityStatus": "on",
  "recommendation": "Replace 28W T5 LED tube fixture immediately. Dispatch Electrical Dept."
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEBRTC P2P VIDEO MESH */}
          {activeTab === 'webrtc' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                      <Radio className="w-5 h-5 text-cyan-400" />
                      Zero-Hardware WebRTC CCTV Architecture
                    </h3>
                    <p className="text-xs text-slate-400">PeerJS peer-to-peer signalling and STUN fallback protocol</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30">
                    P2P Video Streaming
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      How Smartphone Nodes Connect
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Instead of buying expensive IP cameras, any security guard, lab assistant, or student can open <code className="text-amber-300">/cctv-node</code> on their mobile browser. The camera stream is instantly connected to the central administration monitoring desk via encrypted WebRTC.
                    </p>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">1. Node ID Initialization</span>
                        <span className="text-emerald-400">uuidv4()</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">2. Hub Target Room</span>
                        <span className="text-amber-400">mit-acsc-cctv-control-room-v1</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">3. Media Constraints</span>
                        <span className="text-cyan-400">1080p / 60fps / rear-facing</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">4. Fallback Channel</span>
                        <span className="text-purple-400">BroadcastChannel Canvas 10 FPS</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      STUN & NAT Traversal Config
                    </h4>
                    <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto bg-slate-900 p-3 rounded-xl border border-slate-800">
{`const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.services.mozilla.com' },
  { urls: 'stun:global.stun.twilio.com:3478' }
];

// Peer initialization
const peer = new Peer(nodeId, {
  config: { iceServers: ICE_SERVERS },
  debug: 1
});`}
                    </pre>
                    <div className="text-xs text-slate-400">
                      Even across differing Wi-Fi networks (4G cellular to campus LAN), Google STUN servers resolve external IP/ports for direct P2P streaming.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISTRIBUTED SYNC ENGINE */}
          {activeTab === 'data_flow' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                      <Network className="w-5 h-5 text-emerald-400" />
                      Zero-Latency Multi-Device Sync Architecture
                    </h3>
                    <p className="text-xs text-slate-400">Cross-tab state replication with optimistic updates</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/30">
                    Sub-5ms Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-emerald-400 font-bold font-mono text-sm">BroadcastChannel API</div>
                    <p className="text-xs text-slate-300">
                      When an admin changes a ticket status or an employee uploads proof of fix, messages are instantly transmitted across all open browser windows without server roundtrips.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-amber-400 font-bold font-mono text-sm">Zustand Reactive Store</div>
                    <p className="text-xs text-slate-300">
                      Decoupled immutable store with selective component re-rendering. Eliminates unnecessary DOM repaints and preserves 60 FPS UI performance.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-cyan-400 font-bold font-mono text-sm">LocalStorage Hydration</div>
                    <p className="text-xs text-slate-300">
                      Automatic local state persistence. Offline ticket filing and full data survival upon browser refresh or network disconnects.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300">
                  <div className="text-slate-400 mb-2">// Message Event Envelope for Synchronized Store Mutation</div>
{`{
  "type": "TICKET_MUTATION_BROADCAST",
  "action": "UPDATE_STATUS",
  "ticketId": "TCK-2026-MAB-101",
  "payload": {
    "status": "in_progress",
    "assignedTo": "Rajesh Kamble",
    "updatedAt": "2026-09-02T10:30:00.000Z"
  },
  "originNode": "client_session_88a9f"
}`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RBAC & SECURITY SPEC */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                      <Shield className="w-5 h-5 text-rose-400" />
                      Role-Based Access Control (RBAC) & Governance Matrix
                    </h3>
                    <p className="text-xs text-slate-400">Enforcing strict institutional domain isolation (@mitacsc.edu.in)</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/30">
                    5 Granular Roles
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="pb-3">Role Tier</th>
                        <th className="pb-3">Allowed Actions</th>
                        <th className="pb-3">Restricted Boundaries</th>
                        <th className="pb-3">Access Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
                      <tr>
                        <td className="py-3.5 font-bold text-emerald-400">Student</td>
                        <td className="py-3.5">File complaints, scan QR codes, voice AI, track own tickets</td>
                        <td className="py-3.5 text-slate-500">Cannot view other students' tickets or assign tasks</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Tier 1</span></td>
                      </tr>
                      <tr>
                        <td className="py-3.5 font-bold text-blue-400">Teacher / Faculty</td>
                        <td className="py-3.5">File lab faults, tag high priority, emergency classroom SOS</td>
                        <td className="py-3.5 text-slate-500">Cannot modify asset purchase values or system logs</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">Tier 2</span></td>
                      </tr>
                      <tr>
                        <td className="py-3.5 font-bold text-amber-400">Technician</td>
                        <td className="py-3.5">Accept tasks, log replacement parts, upload fix proof, close jobs</td>
                        <td className="py-3.5 text-slate-500">Cannot alter department triage or delete assets</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">Tier 3</span></td>
                      </tr>
                      <tr>
                        <td className="py-3.5 font-bold text-purple-400">Facilities Manager</td>
                        <td className="py-3.5">Triage queue, SLA management, technician dispatch, QR generation</td>
                        <td className="py-3.5 text-slate-500">Cannot delete root campus records</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">Tier 4</span></td>
                      </tr>
                      <tr>
                        <td className="py-3.5 font-bold text-rose-400">Admin / Principal</td>
                        <td className="py-3.5">CCTV Vision AI, Predictive Risk Engine, Campus Risk Map, Full Audit</td>
                        <td className="py-3.5 text-slate-400">Full Unrestricted Institutional Access</td>
                        <td className="py-3.5"><span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">Tier 5 (Root)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DATABASE SCHEMA & CONTRACTS */}
          {activeTab === 'database' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
                      <Database className="w-5 h-5 text-amber-400" />
                      Core TypeScript Interfaces & Data Contracts
                    </h3>
                    <p className="text-xs text-slate-400">Strict structural models governing state serialization</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
                    TypeScript Contracts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold text-slate-300">Ticket Record Contract:</div>
                    <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
{`export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: DepartmentType;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved';
  location: {
    buildingId: string;
    roomNumber: string;
    wing?: string;
  };
  assetId?: string;
  reportedBy: UserProfile;
  assignedTo?: UserProfile;
  slaDeadline: string;
  createdAt: string;
  resolvedAt?: string;
  imageUrls?: string[];
  proofOfFixUrl?: string;
}`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold text-slate-300">CCTV Camera Telemetry Contract:</div>
                    <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
{`export interface CCTVCamera {
  id: string;
  name: string;
  buildingId: string;
  locationDescription: string;
  status: 'online' | 'offline' | 'warning';
  activeAnalysisResult?: CCTVAnalysisResult;
  lastAnalyzedTimestamp?: number;
  monitoredLEDCount: number;
  failedLEDCount: number;
  confidenceScore: number;
  phoneNodeData?: {
    batteryLevel?: number;
    torchActive?: boolean;
    isRemotePhone: boolean;
  };
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer Quick Launch CTA */}
        <section className="bg-gradient-to-r from-maroon-950 via-slate-900 to-slate-950 border border-maroon-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Experience the Live Platform</h3>
            <p className="text-xs text-rose-200/80">
              Run live fault submissions, test the CCTV WebRTC camera stream, or simulate emergency notifications.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/quick_login"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>1-Click Test Login</span>
            </Link>
            <Link
              to="/cctv-monitoring"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-purple-400" />
              <span>Open CCTV AI Console</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
