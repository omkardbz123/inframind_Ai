import React from 'react';
import {
  Download,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTicketStore } from '../../store/ticketStore';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';

const TREND_DATA = [
  { day: 'Mon', reported: 12, resolved: 10, aiDetected: 2 },
  { day: 'Tue', reported: 15, resolved: 14, aiDetected: 3 },
  { day: 'Wed', reported: 18, resolved: 16, aiDetected: 4 },
  { day: 'Thu', reported: 14, resolved: 13, aiDetected: 2 },
  { day: 'Fri', reported: 22, resolved: 19, aiDetected: 5 },
  { day: 'Sat', reported: 8, resolved: 8, aiDetected: 1 },
  { day: 'Sun', reported: 5, resolved: 6, aiDetected: 2 },
];

const DEPT_LOAD_DATA = [
  { department: 'Electrical', open: 8, inProgress: 4, resolved: 24 },
  { department: 'Plumbing', open: 5, inProgress: 3, resolved: 18 },
  { department: 'AV Tech', open: 4, inProgress: 2, resolved: 15 },
  { department: 'Janitorial', open: 2, inProgress: 1, resolved: 30 },
  { department: 'Furniture', open: 3, inProgress: 2, resolved: 10 },
  { department: 'Network', open: 2, inProgress: 1, resolved: 12 },
];

const CATEGORY_PIE = [
  { name: 'Electrical', value: 36, color: '#821930' },
  { name: 'Plumbing', value: 26, color: '#2563eb' },
  { name: 'AV & Tech', value: 21, color: '#7c3aed' },
  { name: 'Janitorial', value: 33, color: '#059669' },
  { name: 'Furniture', value: 15, color: '#d97706' },
];

export const AnalyticsReports: React.FC = () => {
  const { tickets } = useTicketStore();

  const handleExportFullReport = () => {
    if (tickets.length > 0) {
      downloadTicketReportPDF(tickets[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Infrastructure Analytics & Executive Reports
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              Live BI
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Workload distribution, SLA resolution velocity, maintenance expenditure, and automated reports for Directorate
          </p>
        </div>

        <button
          onClick={handleExportFullReport}
          className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition"
        >
          <Download className="w-4 h-4" />
          <span>Export MIT ACSC PDF Report</span>
        </button>
      </div>

      {/* KPI Cards in Crisp White */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="white-card p-4 rounded-2xl">
          <div className="text-slate-500 text-xs font-semibold">Total Fault Tickets</div>
          <div className="text-2xl font-black text-slate-900 mt-1">104 Orders</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">88% Resolution Rate</div>
        </div>

        <div className="white-card p-4 rounded-2xl">
          <div className="text-slate-500 text-xs font-semibold">Mean Time to Fix (MTTR)</div>
          <div className="text-2xl font-black text-maroon-800 mt-1">3.4 Hours</div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">SLA Target &lt; 8h</div>
        </div>

        <div className="white-card p-4 rounded-2xl">
          <div className="text-slate-500 text-xs font-semibold">SLA Compliance</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">94.2%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all 6 departments</div>
        </div>

        <div className="white-card p-4 rounded-2xl">
          <div className="text-slate-500 text-xs font-semibold">Quarterly Maintenance Spend</div>
          <div className="text-2xl font-black text-slate-900 mt-1">INR 48,250</div>
          <div className="text-[11px] text-maroon-800 mt-0.5 font-medium">Spares & servicing cost</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Weekly Volume Trend Area Chart */}
        <div className="lg:col-span-8 white-card p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-maroon-700" />
              <span>Weekly Fault Intake vs. Resolved Tickets</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Past 7 Days Telemetry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#821930" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#821930" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="reported" name="Reported Faults" stroke="#821930" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
                <Area type="monotone" dataKey="resolved" name="Resolved Tasks" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: Category Breakdown Pie Chart */}
        <div className="lg:col-span-4 white-card p-5 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Department Fault Share</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_PIE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700">
            {CATEGORY_PIE.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}: {c.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full Width 12 Cols: Department Workload Bar Chart */}
        <div className="lg:col-span-12 white-card p-5 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-maroon-700" />
            <span>Departmental Workload & Technician Utilization</span>
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_LOAD_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="open" name="Pending Triage" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Completed" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
