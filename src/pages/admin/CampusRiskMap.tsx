import React, { useState } from 'react';
import {
  MapPin,
  Flame,
  Layers,
  ArrowRight,
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
    CAMPUS_BUILDINGS.find((b) => b.id === selectedBuildingId) || CAMPUS_BUILDINGS[0];
  const selectedFloor =
    selectedBuilding.floors.find((f) => f.floorNumber === selectedFloorNum) ||
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

    const hasCameraFailure = cameras.some(
      (c) =>
        c.building.includes(buildingName) &&
        c.floor === floorNum &&
        c.wing === wingName &&
        c.lastAnalysisResult === 'failure_detected'
    );

    if (hasCritical || hasCameraFailure || wingAssets.length >= 2 || wingTickets.length >= 3) {
      return {
        level: 'critical',
        badge: 'CRITICAL HOTSPOT',
        color: 'border-rose-300 bg-rose-50/70 text-rose-900',
        dot: 'bg-rose-600 animate-ping',
        count: wingTickets.length,
        assetCount: wingAssets.length,
      };
    }

    if (hasHigh || wingTickets.length > 0 || wingAssets.length > 0) {
      return {
        level: 'moderate',
        badge: 'MODERATE RISK',
        color: 'border-amber-300 bg-amber-50/70 text-amber-900',
        dot: 'bg-amber-500',
        count: wingTickets.length,
        assetCount: wingAssets.length,
      };
    }

    return {
      level: 'low',
      badge: 'OPTIMAL',
      color: 'border-slate-200 bg-white text-slate-700',
      dot: 'bg-emerald-500',
      count: 0,
      assetCount: 0,
    };
  };

  const activeZoneTickets = tickets.filter(
    (t) =>
      t.building.includes(selectedBuilding.name) &&
      t.floor === selectedFloorNum &&
      t.wing === selectedWing &&
      t.status !== 'resolved'
  );

  const activeZoneAssets = assets.filter(
    (a) =>
      a.building.includes(selectedBuilding.name) &&
      a.floor === selectedFloorNum &&
      a.wing === selectedWing
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Infrastructure Risk Heat Map
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              Hotspot Radar
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time geospatial breakdown density across academic wings, floors, and classroom clusters
          </p>
        </div>
      </div>

      {/* Top Urgent Alert Banner */}
      <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl border border-rose-200 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-rose-700 uppercase tracking-widest">
                Highest Priority Risk Zone Detected
              </span>
              <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full">
                LVL 1 URGENT
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              MIT ACSC Main Building — 2nd Floor East Corridor
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              CCTV AI detected 2 failed LED tube lights + 1 sparking fan fixture in Class 202 + High RO purifier saturation.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedBuildingId('bldg-mit-main');
            setSelectedFloorNum(2);
            setSelectedWing('east');
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm flex items-center gap-1.5 transition"
        >
          <span>Drill Down Hotspot</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Building & Floor Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
          {CAMPUS_BUILDINGS.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBuildingId(b.id);
                setSelectedFloorNum(b.floors[0].floorNumber);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedBuildingId === b.id
                  ? 'bg-maroon-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
          {selectedBuilding.floors.map((f) => (
            <button
              key={f.floorNumber}
              onClick={() => setSelectedFloorNum(f.floorNumber)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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
              {selectedFloor?.wings.map((w) => {
                const risk = getWingRiskLevel(selectedBuilding.name, selectedFloorNum, w.wing);
                const isSelected = selectedWing === w.wing;

                return (
                  <button
                    key={w.wing}
                    type="button"
                    onClick={() => setSelectedWing(w.wing as any)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'ring-2 ring-maroon-800 scale-[1.01] shadow-md'
                        : 'hover:border-slate-300'
                    } ${risk.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${risk.dot}`} />
                        <span className="font-bold text-xs capitalize text-slate-900">
                          {w.wing} Wing Area
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-current">
                        {risk.badge}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-2">{w.label}</div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono">
                      <span>{risk.count} Active Faults</span>
                      <span>{risk.assetCount} High-Risk Assets</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Detail Breakdown of Selected Zone */}
        <div className="lg:col-span-5 space-y-4">
          <div className="white-card p-5 rounded-3xl space-y-4">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-maroon-800">
                Selected Zone Diagnostics
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 capitalize">
                {selectedFloor?.floorName} — {selectedWing} Wing
              </h3>
              <p className="text-xs text-slate-500">Active breakdowns and critical telemetry in this sector</p>
            </div>

            {/* Active Tickets in this wing */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Open Fault Tickets ({activeZoneTickets.length}):
              </div>
              {activeZoneTickets.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No active reported breakdowns in this wing.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeZoneTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-maroon-800">#{t.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">
                          {t.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500">
                        Room: {t.roomNumber || 'Corridor'} • {t.assignedToName || 'Unassigned'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aging equipment in this wing */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Monitored Equipment ({activeZoneAssets.length}):
              </div>
              <div className="space-y-1.5">
                {activeZoneAssets.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{a.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Tag: {a.assetTag}</div>
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        a.predictiveScore >= 80
                          ? 'text-rose-600'
                          : a.predictiveScore >= 60
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {a.predictiveScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
