import React, { useState } from 'react';
import {
  MapPin,
  Flame,
  Layers,
  ArrowRight,
  AlertTriangle,
  Zap,
  Droplets,
  Activity,
  Video,
} from 'lucide-react';
import { CAMPUS_BUILDINGS } from '../../lib/constants';
import { useTicketStore } from '../../store/ticketStore';
import { useAssetStore } from '../../store/assetStore';
import { useCCTVStore } from '../../store/cctvStore';

export const CampusRiskMap: React.FC = () => {
  const { tickets } = useTicketStore();
  const { assets } = useAssetStore();
  const { cameras } = useCCTVStore();

  const [selectedBuildingId, setSelectedBuildingId] = useState(CAMPUS_BUILDINGS[0].id);
  const [selectedFloorNum, setSelectedFloorNum] = useState<number>(2);
  const [selectedWing, setSelectedWing] = useState<'east' | 'west' | 'central' | 'north'>('east');

  const selectedBuilding =
    CAMPUS_BUILDINGS.find((b: any) => b.id === selectedBuildingId) || CAMPUS_BUILDINGS[0];
  const selectedFloor =
    selectedBuilding.floors.find((f: any) => f.floorNumber === selectedFloorNum) ||
    selectedBuilding.floors[0];

  const getWingRiskLevel = (buildingName: string, floorNum: number, wingName: string) => {
    const wingTickets = tickets.filter(
      (t) =>
        t.building.includes(buildingName) &&
        t.floor === floorNum &&
        t.wing === wingName &&
        t.status !== 'resolved'
    );
    const hasCritical = wingTickets.some((t) => t.priority === 'critical');
    const hasHigh = wingTickets.some((t) => t.priority === 'high');

    const wingAssets = assets.filter(
      (a) =>
        a.building.includes(buildingName) &&
        a.floor === floorNum &&
        a.wing === wingName &&
        a.predictiveScore >= 80
    );

    const wingCameras = cameras.filter(
      (c) =>
        c.building.includes(buildingName) &&
        c.floor === floorNum &&
        c.wing === wingName &&
        c.lastAnalysisResult === 'failure_detected'
    );

    let score = 20;
    if (hasCritical) score += 40;
    if (hasHigh) score += 20;
    score += wingAssets.length * 15;
    score += wingCameras.length * 20;
    score = Math.min(100, score);

    return {
      score,
      tickets: wingTickets,
      assets: wingAssets,
      cameras: wingCameras,
      level: score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 30 ? 'moderate' : 'low',
    };
  };

  const currentWingRisk = getWingRiskLevel(selectedBuilding.name, selectedFloorNum, selectedWing);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Infrastructure Risk Heat Map
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              Live Radar
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Geospatial hazard breakdown, CCTV night vision defects, and predictive equipment hotspots across MIT ACSC
          </p>
        </div>
      </div>

      {/* Building & Floor Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto max-w-full">
          {CAMPUS_BUILDINGS.map((b: any) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBuildingId(b.id);
                setSelectedFloorNum(b.floors[0].floorNumber);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedBuildingId === b.id
                  ? 'bg-maroon-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto max-w-full">
          {selectedBuilding.floors.map((f: any) => (
            <button
              key={f.floorNumber}
              onClick={() => setSelectedFloorNum(f.floorNumber)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedFloorNum === f.floorNumber
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.floorName}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Floor Plan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Floor Wings Architecture Map */}
        <div className="lg:col-span-7 space-y-4">
          <div className="white-card p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-maroon-700" />
                <span>
                  {selectedBuilding.name} — {selectedFloor?.floorName} Layout
                </span>
              </h3>
              <span className="text-[11px] text-slate-500">Click wing zone to inspect</span>
            </div>

            {/* Wing Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {selectedFloor?.wings.map((w: any) => {
                const risk = getWingRiskLevel(selectedBuilding.name, selectedFloorNum, w.wing);
                const isSelected = selectedWing === w.wing;

                return (
                  <button
                    key={w.wing}
                    type="button"
                    onClick={() => setSelectedWing(w.wing as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-maroon-800 bg-maroon-50/70 ring-2 ring-maroon-800/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        {w.wing} Wing
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          risk.level === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : risk.level === 'high'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        Risk: {risk.score}/100
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">{w.label}</p>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                      <span>{risk.tickets.length} Active Tickets</span>
                      <span>•</span>
                      <span>{w.rooms.length} Rooms</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Wing Drilldown Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="white-card p-5 rounded-3xl space-y-4 border-l-4 border-l-maroon-800">
            <div>
              <div className="text-[10px] uppercase font-bold text-maroon-800 tracking-wider">
                Zone Inspection Details
              </div>
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {selectedWing} Wing — Floor {selectedFloorNum} ({selectedBuilding.name})
              </h3>
            </div>

            {/* Risk Indicators */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Calculated Zone Risk Index:</span>
                <span className="font-mono font-bold text-maroon-800 text-sm">
                  {currentWingRisk.score}/100
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    currentWingRisk.score >= 75
                      ? 'bg-rose-600'
                      : currentWingRisk.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${currentWingRisk.score}%` }}
                />
              </div>
            </div>

            {/* Active Tickets in this Wing */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Open Tickets in this Zone:</div>
              {currentWingRisk.tickets.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                  No open breakdown tickets reported in this wing.
                </div>
              ) : (
                currentWingRisk.tickets.map((t) => (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-maroon-800">#{t.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200">
                        {t.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-500">Room {t.roomNumber || 'General'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
