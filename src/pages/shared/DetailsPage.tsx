import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Layers,
  Cpu,
  Eye,
  FileText,
  Users,
  QrCode,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Zap,
  Sparkles,
  Server,
  Globe,
} from 'lucide-react';

export const DetailsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-maroon-950 via-maroon-900 to-slate-950 border-b-4 border-amber-500 py-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
              Smart India Hackathon 2026
            </span>
            <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full text-xs font-semibold">
              MAEER's MIT ACSC, Alandi (D.), Pune
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
              Production Edge Live
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            MIT ACSC CampusCare (InfraMind AI)
          </h1>
          <p className="text-sm sm:text-base text-rose-200/90 max-w-3xl leading-relaxed">
            Comprehensive Architectural Blueprint, Computer Vision Workflows, Predictive Failure Analytics, Cross-Device WebRTC Video Nodes, and Role-Based Lifecycle Operations.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campus Portal</span>
            </Link>
            <Link
              to="/quick_login"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition border border-white/20"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Quick Login</span>
            </Link>
            <a
              href="/details.html"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition border border-white/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Standalone HTML</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-10 space-y-10">
        {/* Section 1: Executive Overview */}
        <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <div className="w-10 h-10 rounded-xl bg-maroon-900/60 border border-maroon-700 flex items-center justify-center text-rose-300 font-bold text-lg">
              🏛️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">1. Executive Overview & Problem Statement</h2>
              <p className="text-xs text-slate-400">Transforming educational campus facilities with real-time AI intelligence</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Educational campuses with thousands of classrooms, labs, electrical fixtures, water purifiers, and projectors experience maintenance delays due to manual telephone/paper reporting, lack of automated outage detection, missing diagnostic records, and delayed technician dispatches. <strong>MIT ACSC CampusCare</strong> delivers a reactive, AI-assisted maintenance ecosystem combining <strong>Computer Vision, WebRTC Live Video Streaming, Gemini Multimodal AI, and Physical QR Asset Tags</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                <span>5-Second QR Filing</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Physical QR code scan directly autofills campus location (building, floor, wing, room) and navigates instantly to fault description & camera capture.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="text-rose-400 font-bold text-sm flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>CCTV Vision AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated night CCTV feed analysis detects unlit corridor LEDs and electrical outages, raising automated priority tickets without human intervention.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Verified Dual Proof PDF</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Captures before-and-after photo proof. Auto-generates official signed PDF work orders and sends live Gmail notifications to students and managers.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Architecture & Data Flow */}
        <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">2. System Architecture & Flow Pipeline</h2>
              <p className="text-xs text-slate-400">Multi-tier distributed architecture spanning edge, client, and transactional SMTP</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-amber-300">Client Presentation Layer:</strong> React 18 SPA + Vite 6 + Tailwind CSS PWA with role-based adaptive navigation.
              </div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-amber-300">Hardware & Vision Stream:</strong> WebRTC live camera streams (<code className="text-cyan-300">getUserMedia</code>) + <code className="text-cyan-300">jsQR</code> frame decoder + Gemini Vision API.
              </div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-amber-300">Distributed Reactive State:</strong> Zustand stores with <code className="text-cyan-300">BroadcastChannel API</code> for instant real-time synchronization across all tabs and devices.
              </div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">4</span>
              <div>
                <strong className="text-amber-300">Transactional Email & PDF Server:</strong> Node.js Express + Nodemailer + Google SMTP for physical PDF email attachments.
              </div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">5</span>
              <div>
                <strong className="text-amber-300">Cloudflare Edge CDN:</strong> Hosted on Cloudflare Workers edge network with Workbox service worker caching.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Technology Stack */}
        <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">3. Technology Stack & Key Dependencies</h2>
              <p className="text-xs text-slate-400">Complete technology index powering MIT ACSC CampusCare</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'React 18', role: 'Component Framework' },
              { name: 'TypeScript', role: 'Type Safety & Contracts' },
              { name: 'Vite 6', role: 'Build & Bundler' },
              { name: 'Tailwind CSS', role: 'Responsive Styling' },
              { name: 'Google Gemini AI', role: 'Vision & Multimodal NLP' },
              { name: 'Zustand', role: 'Reactive Global State' },
              { name: 'BroadcastChannel', role: 'Cross-Tab Instant Sync' },
              { name: 'jsQR', role: 'WebRTC Barcode Decoder' },
              { name: 'jsPDF', role: 'PDF Work Order Engine' },
              { name: 'Node.js Express', role: 'SMTP API Backend' },
              { name: 'Nodemailer', role: 'Google SMTP Mailer' },
              { name: 'Cloudflare Workers', role: 'Edge Deployment' },
            ].map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-xs">
                <div className="font-bold text-amber-300 font-mono">{t.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{t.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Role-Based Access Control */}
        <div className="bg-slate-800/80 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">4. User Personas & Permissions (RBAC)</h2>
              <p className="text-xs text-slate-400">Institutional domain enforcement and workflow responsibilities</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="pb-3 font-bold">Role Persona</th>
                  <th className="pb-3 font-bold">Email Format</th>
                  <th className="pb-3 font-bold">Workspaces & Capabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 font-bold text-emerald-400">Student (Omkar Bhujbal)</td>
                  <td className="py-3 font-mono">5454317@mitacsc.edu.in</td>
                  <td className="py-3">QR scanner fault filing, voice AI complaint, track personal tickets, PDF work orders.</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-blue-400">Teacher (Dr. Rajiv Deshpande)</td>
                  <td className="py-3 font-mono">dr.deshpande@mitacsc.edu.in</td>
                  <td className="py-3">Classroom/lab equipment fault requests, priority tagging, department notifications.</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-amber-400">Technician (Rajesh Kamble)</td>
                  <td className="py-3 font-mono">rajesh.electrician@mitacsc.edu.in</td>
                  <td className="py-3">Work Orders & Tasks, start work, diagnostic logs, parts replacement, resolution proof photos.</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-purple-400">Facilities Manager (Er. Ramesh Kulkarni)</td>
                  <td className="py-3 font-mono">ramesh.manager@mitacsc.edu.in</td>
                  <td className="py-3">Department triage queue, SLA assignment, technician reallocation, asset QR inventory.</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-rose-400">Principal / Admin (Dr. B. B. Waphare)</td>
                  <td className="py-3 font-mono">principal.admin@mitacsc.edu.in</td>
                  <td className="py-3">CCTV AI monitoring, Predictive Risk Engine, Campus Risk Map, Staff Directory, Analytics.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Live Links & Navigation */}
        <div className="bg-gradient-to-r from-maroon-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-maroon-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-white">Experience MIT ACSC CampusCare Live</h3>
            <p className="text-xs text-rose-200/80 mt-1">
              Explore the live portal, test camera QR scanning, inspect CCTV AI vision, and trigger transactional emails.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/quick_login"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
            >
              ⚡ Quick 1-Click Login
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition border border-white/20"
            >
              Institutional Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
