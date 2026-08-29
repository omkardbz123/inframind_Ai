import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Zap,
  Power,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { useCCTVStore } from '../../store/cctvStore';
import { useAuthStore } from '../../store/authStore';
import { CCTVCamera } from '../../types/cctv';

export const CCTVMonitoring: React.FC = () => {
  const {
    cameras,
    selectedCameraId,
    selectCamera,
    activeElectricityGrid,
    toggleElectricityGrid,
    runCameraAnalysis,
    setPresetScenario,
    isAnalyzing,
  } = useCCTVStore();

  const { customGeminiApiKey } = useAuthStore();
  const [sliderPos, setSliderPos] = useState(50);
  const [lastAnalyzedResult, setLastAnalyzedResult] = useState<any>(null);

  const selectedCam: CCTVCamera =
    cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  const handleRunAnalysis = async () => {
    try {
      const result = await runCameraAnalysis(selectedCam.id, customGeminiApiKey);
      setLastAnalyzedResult(result);
    } catch (e: any) {
      alert(`Analysis error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Automated CCTV Night LED Vision AI
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              Gemini 2.0 Flash
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Per-hour night inspection comparing baseline photos (lights ON) against live corridor feeds with electricity grid correlation
          </p>
        </div>

        {/* Electricity Grid Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-slate-700 px-2 flex items-center gap-1.5">
            <Zap className={`w-4 h-4 ${activeElectricityGrid ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>Campus Grid:</span>
          </div>
          <button
            type="button"
            onClick={() => toggleElectricityGrid()}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeElectricityGrid
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-rose-600 text-white shadow-xs'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{activeElectricityGrid ? 'MAINS ACTIVE (ON)' : 'POWER CUT (OFF)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Cameras List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active CCTV Corridor Nodes:
          </h3>

          <div className="space-y-2">
            {cameras.map((cam) => {
              const isSelected = cam.id === selectedCam.id;
              const hasFailure = cam.lastAnalysisResult === 'failure_detected';

              return (
                <button
                  key={cam.id}
                  onClick={() => {
                    selectCamera(cam.id);
                    setLastAnalyzedResult(null);
                  }}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-maroon-50 border-maroon-800 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-maroon-900">{cam.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        hasFailure
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {cam.lastAnalysisResult.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-slate-900">{cam.areaDescription}</div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Floor {cam.floor} ({cam.wing.toUpperCase()} Wing)</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cam.snapshots.length} Scans Logged
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Scenario Preset Simulator */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-maroon-700" />
              <span>Simulate Night Inspection Scenarios:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPresetScenario(selectedCam.id, 'all_ok')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition"
              >
                <div className="font-bold text-emerald-700">All 8 LEDs OK</div>
                <div className="text-[10px] text-slate-500">Normal lumen</div>
              </button>
              <button
                type="button"
                onClick={() => setPresetScenario(selectedCam.id, 'two_leds_dead')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition"
              >
                <div className="font-bold text-rose-700">2 LEDs Failed</div>
                <div className="text-[10px] text-slate-500">Defect detected</div>
              </button>
              <button
                type="button"
                onClick={() => setPresetScenario(selectedCam.id, 'flicker_dim')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition"
              >
                <div className="font-bold text-amber-800">Flicker Dim</div>
                <div className="text-[10px] text-slate-500">65% lumen drop</div>
              </button>
              <button
                type="button"
                onClick={() => setPresetScenario(selectedCam.id, 'power_cut')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition"
              >
                <div className="font-bold text-slate-700">Total Blackout</div>
                <div className="text-[10px] text-slate-500">Grid power cut</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Interactive Visual Comparator */}
        <div className="lg:col-span-8 space-y-4">
          <div className="white-card p-5 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-maroon-700" />
                  <span>{selectedCam.name} — Comparative Visual Stream</span>
                </h3>
                <p className="text-xs text-slate-500">{selectedCam.areaDescription}</p>
              </div>

              {/* Run Gemini Button */}
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini AI Inspecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Gemini AI Inspection</span>
                  </>
                )}
              </button>
            </div>

            {/* Split Comparison Frame */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-300 bg-slate-900">
              {/* Reference Image (Left Base) */}
              <img
                src={selectedCam.referenceImageURL}
                alt="Baseline Reference"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Current Night Snapshot Overlay */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              >
                <img
                  src={selectedCam.currentSnapshotURL}
                  alt="Current Night Snapshot"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Slider Divider Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-10"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-7 h-7 bg-white text-maroon-900 rounded-full flex items-center justify-center shadow-md font-bold text-xs">
                  ↔
                </div>
              </div>

              {/* Badges on Corners */}
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg border border-slate-200 text-[11px] font-mono text-emerald-800 font-bold shadow-xs">
                BASELINE: Lights ON
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg border border-slate-200 text-[11px] font-mono text-maroon-900 font-bold shadow-xs">
                NIGHT LIVE FEED
              </div>
            </div>

            {/* Range Slider */}
            <div className="flex items-center gap-3 px-2">
              <span className="text-xs text-emerald-800 font-bold">100% Baseline</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="flex-1 accent-maroon-800 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-maroon-800 font-bold">100% Night Feed</span>
            </div>
          </div>

          {/* AI Inspection Verdict Panel */}
          {lastAnalyzedResult && (
            <div
              className={`p-5 rounded-3xl border animate-in slide-in-from-bottom-2 duration-150 ${
                lastAnalyzedResult.analysisResult === 'failure_detected'
                  ? 'bg-rose-50 border-rose-300 shadow-sm'
                  : lastAnalyzedResult.analysisResult === 'power_outage'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-emerald-50 border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl ${
                      lastAnalyzedResult.analysisResult === 'failure_detected'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {lastAnalyzedResult.analysisResult === 'failure_detected' ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                      Gemini 2.0 Flash AI Verdict:
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 capitalize mt-0.5">
                      {lastAnalyzedResult.analysisResult.replace('_', ' ')} (Confidence: {Math.round(lastAnalyzedResult.confidenceScore * 100)}%)
                    </h4>
                  </div>
                </div>

                {lastAnalyzedResult.autoTicketId && (
                  <div className="px-3 py-1.5 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold font-mono">
                    Auto-Ticket: #{lastAnalyzedResult.autoTicketId}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Total Visible:</div>
                  <div className="font-bold text-slate-900 text-sm">{lastAnalyzedResult.totalLEDsVisible} Fixtures</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Working:</div>
                  <div className="font-bold text-emerald-700 text-sm">{lastAnalyzedResult.workingLEDs} ON</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]">Failed / Dim:</div>
                  <div className="font-bold text-rose-700 text-sm">{lastAnalyzedResult.failedLEDs} Dark</div>
                </div>
              </div>

              <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">AI Diagnostic Explanation:</div>
                <p className="text-slate-600 leading-relaxed">{lastAnalyzedResult.geminiExplanation}</p>
                {lastAnalyzedResult.detectedIssues?.length > 0 && (
                  <ul className="list-disc list-inside text-rose-700 space-y-0.5 pt-1 font-medium">
                    {lastAnalyzedResult.detectedIssues.map((iss: string, idx: number) => (
                      <li key={idx}>{iss}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
