import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAssetStore } from '../../store/assetStore';
import { Asset } from '../../types/asset';
import { useTicketStore } from '../../store/ticketStore';
import { useAuthStore } from '../../store/authStore';

export const PredictiveMaint: React.FC = () => {
  const { assets, recalculatePredictiveScores } = useAssetStore();
  const { createTicket } = useTicketStore();
  const { currentUser } = useAuthStore();

  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'moderate' | 'healthy'>('all');

  const filtered = assets
    .filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        a.building.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterRisk === 'critical') return a.predictiveScore >= 80;
      if (filterRisk === 'moderate') return a.predictiveScore >= 60 && a.predictiveScore < 80;
      if (filterRisk === 'healthy') return a.predictiveScore < 60;
      return true;
    })
    .sort((a, b) => b.predictiveScore - a.predictiveScore);

  const criticalAssets = assets.filter((a) => a.predictiveScore >= 80);
  const avgRiskScore = Math.round(assets.reduce((sum, a) => sum + a.predictiveScore, 0) / (assets.length || 1));

  const handleSchedulePreventive = async (asset: Asset) => {
    if (!currentUser) return;
    await createTicket({
      title: `Preventive Maintenance: Overhaul ${asset.name}`,
      description: `AI Predictive Risk Score is ${asset.predictiveScore}/100. Diagnostic: ${asset.predictiveRiskReason}. Scheduled preventive inspection prior to breakdown.`,
      category: asset.category,
      subcategory: asset.subcategory,
      priority: asset.predictiveScore >= 80 ? 'critical' : 'high',
      building: asset.building,
      floor: asset.floor,
      wing: asset.wing,
      roomNumber: asset.roomNumber,
      reporterId: currentUser.uid,
      reporterName: 'AI Predictive Engine',
      reporterEmail: 'predictive.ai@mitacsc.ac.in',
      reporterRole: 'System AI',
      assetId: asset.id,
      assetTag: asset.assetTag,
      urgencyScore: asset.predictiveScore,
    });

    alert(`Preventive Work Order successfully registered for ${asset.assetTag}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Predictive Maintenance & Asset Risk Engine
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              Risk Algorithm
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Calculates breakdown probability based on operational runtime, repair frequency, and condition decay
          </p>
        </div>

        <button
          onClick={recalculatePredictiveScores}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-maroon-700" />
          <span>Recalculate Risk Matrix</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="white-card p-4 rounded-2xl">
          <div className="text-slate-500 text-xs font-semibold">Total Tracked Assets</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{assets.length} Units</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Electrical, RO Water, AV & HVAC</div>
        </div>

        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60">
          <div className="text-rose-800 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>High Breakdown Risk (&gt;80)</span>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{criticalAssets.length} Critical Units</div>
          <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Require preventive overhaul</div>
        </div>

        <div className="white-card p-4 rounded-2xl">
          <div className="text-slate-500 text-xs font-semibold">Campus Mean Health Index</div>
          <div className="text-2xl font-black text-maroon-800 mt-1">{100 - avgRiskScore} / 100</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Infrastructure stability</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset, tag, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'critical', label: 'Critical Risk (>80)' },
            { id: 'moderate', label: 'Moderate (60-79)' },
            { id: 'healthy', label: 'Healthy (<60)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRisk(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterRisk === f.id
                  ? 'bg-maroon-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Risk Table */}
      <div className="white-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-200 tracking-wider">
              <tr>
                <th className="p-3.5">Asset Details</th>
                <th className="p-3.5">Campus Location</th>
                <th className="p-3.5">Service Age</th>
                <th className="p-3.5">Maintenance History</th>
                <th className="p-3.5 text-center">AI Risk Score</th>
                <th className="p-3.5 text-right">Preventive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((asset) => {
                const isCritical = asset.predictiveScore >= 80;
                const isModerate = asset.predictiveScore >= 60 && asset.predictiveScore < 80;

                return (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{asset.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-maroon-800">
                        <span>Tag: {asset.assetTag}</span>
                        <span>•</span>
                        <span className="capitalize">{asset.category}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800">{asset.building}</div>
                      <div className="text-[11px] text-slate-500">
                        Floor {asset.floor}, {asset.wing.toUpperCase()} (Room {asset.roomNumber || 'Corridor'})
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-xs">
                      <div className="font-bold text-slate-800">{Math.round(asset.ageInMonths / 12)} Yrs ({asset.ageInMonths} mo)</div>
                      <div className="text-[10px] text-slate-500">
                        Rated: {asset.expectedLifespanYears} Yrs Max
                      </div>
                    </td>

                    <td className="p-3.5 text-xs">
                      <div><strong>{asset.maintenanceCount}</strong> Overhauls Logged</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Spend: INR {asset.totalMaintenanceCost}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono font-bold text-xs border ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isModerate
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>{asset.predictiveScore} / 100</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate mx-auto" title={asset.predictiveRiskReason}>
                        {asset.predictiveRiskReason}
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleSchedulePreventive(asset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-maroon-800 hover:bg-maroon-900 text-white'
                        }`}
                      >
                        Schedule Overhaul
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
