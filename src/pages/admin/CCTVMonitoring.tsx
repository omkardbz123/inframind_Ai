import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Camera,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Smartphone,
  Power,
  Grid,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { useCCTVStore } from '../../store/cctvStore';
import { useAuthStore } from '../../store/authStore';
import { CCTVCamera, CCTVSnapshotRecord } from '../../types/cctv';
import { cctvStreamService, LiveFramePayload, DEFAULT_HUB_ID } from '../../lib/cctvStreamService';
import { QRCodeSVG } from 'qrcode.react';

export const CCTVMonitoring: React.FC = () => {
  const {
    cameras,
    selectedCameraId,
    selectCamera,
    runCameraAnalysis,
    updateCameraImages,
    toggleElectricityGrid,
    isAnalyzing,
  } = useCCTVStore();

  const { customGeminiApiKey } = useAuthStore();

  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isQuadView, setIsQuadView] = useState(false);
  const [hubId, setHubId] = useState<string>(DEFAULT_HUB_ID);
  const [liveFps, setLiveFps] = useState<number>(28);
  const [liveLatencyMs, setLiveLatencyMs] = useState<number>(24);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('');
  const [lastAnalyzedResult, setLastAnalyzedResult] = useState<CCTVSnapshotRecord | null>(null);
  const [hasRemoteWebRtcStream, setHasRemoteWebRtcStream] = useState<boolean>(false);

  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const latestFrameDataRef = useRef<string | null>(null);

  const selectedCam =
    cameras.find((c) => c.id === selectedCameraId) || cameras[0] || ({} as CCTVCamera);

  // Initialize WebRTC Hub & Listeners
  useEffect(() => {
    const targetHub = DEFAULT_HUB_ID;
    setHubId(targetHub);

    cctvStreamService.initHub(targetHub);

    // 1. Direct WebRTC MediaStream
    const unsubscribeStream = cctvStreamService.subscribeToStream((stream: MediaStream, camId: string) => {
      setHasRemoteWebRtcStream(true);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (camId) {
        selectCamera(camId);
      }
    });

    // 2. High-speed 24-30 FPS Canvas Frame Decoder
    const unsubscribeFrames = cctvStreamService.subscribeToAllFrames((frame: LiveFramePayload) => {
      latestFrameDataRef.current = frame.frameDataUrl;
      const calcFps = cctvStreamService.getFps(frame.cameraId);
      setLiveFps(calcFps || 28);
      setLiveLatencyMs(Math.max(12, Math.floor(Date.now() - frame.timestamp)));
      setLiveTimestamp(new Date(frame.timestamp).toLocaleTimeString());

      if (liveCanvasRef.current && frame.frameDataUrl) {
        const canvas = liveCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            if (canvas.width !== img.width || canvas.height !== img.height) {
              canvas.width = img.width || 640;
              canvas.height = img.height || 480;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = frame.frameDataUrl;
        }
      }
    });

    return () => {
      unsubscribeStream();
      unsubscribeFrames();
    };
  }, []);

  // Fallback draw default camera snapshot on canvas when no phone frame arrives
  useEffect(() => {
    if (selectedCam && !selectedCam.isPhoneNode && liveCanvasRef.current) {
      const canvas = liveCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          canvas.width = img.width || 640;
          canvas.height = img.height || 480;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = selectedCam.currentSnapshotURL || selectedCam.referenceImageURL;
      }
    }
  }, [selectedCam]);

  const handleRunAnalysis = async () => {
    if (!selectedCam) return;

    try {
      if (selectedCam.isPhoneNode && remoteVideoRef.current && hasRemoteWebRtcStream) {
        const video = remoteVideoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameSnapshot = canvas.toDataURL('image/jpeg', 0.85);
          updateCameraImages(selectedCam.id, undefined, frameSnapshot);
        }
      } else if (latestFrameDataRef.current && latestFrameDataRef.current.startsWith('data:')) {
        updateCameraImages(selectedCam.id, undefined, latestFrameDataRef.current);
      }

      const result = await runCameraAnalysis(selectedCam.id, customGeminiApiKey);
      setLastAnalyzedResult(result);
    } catch (e: any) {
      alert(`Analysis error: ${e.message}`);
    }
  };

  const phoneNodeUrl = `${window.location.origin}/cctv-node?hub=${hubId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Automated CCTV Night LED Vision AI
          </h2>
          <p className="text-xs text-slate-500">
            Cross-device WebRTC live video streaming and intelligent LED defect diagnosis across campus corridors & classrooms
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pair Phone Button */}
          <button
            type="button"
            onClick={() => setIsPairModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-maroon-800 hover:bg-maroon-900 text-white flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Connect Phone CCTV</span>
          </button>

          {/* Quad Grid Toggle */}
          <button
            type="button"
            onClick={() => setIsQuadView(!isQuadView)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              isQuadView
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Quad Cam Wall</span>
          </button>

          {/* Mains Power Toggle */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <select
              defaultValue="on"
              onChange={(e) => toggleElectricityGrid(e.target.value === 'on')}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="on">Power: Mains Active (ON)</option>
              <option value="off">Power: Outage Test (OFF)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Viewport Content */}
      {isQuadView ? (
        /* Quad Camera Wall View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Grid className="w-4 h-4 text-maroon-800" />
              <span>Campus Multi-Feed Matrix View</span>
            </h3>
            <button
              onClick={() => setIsQuadView(false)}
              className="text-xs text-maroon-800 font-bold hover:underline"
            >
              Back to Single Camera Focus →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.slice(0, 4).map((cam) => (
              <div
                key={cam.id}
                onClick={() => {
                  selectCamera(cam.id);
                  setIsQuadView(false);
                }}
                className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-800 cursor-pointer group"
              >
                <img
                  src={cam.currentSnapshotURL || cam.referenceImageURL}
                  alt={cam.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-white">
                      {cam.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        cam.lastAnalysisResult === 'failure_detected'
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {cam.lastAnalysisResult.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white">{cam.name}</div>
                    <div className="text-[10px] text-slate-300">{cam.areaDescription}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Standard Single Camera Focus View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Cameras List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Camera Node:
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {cameras.length} Connected
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
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
                        ? 'bg-maroon-50 border-maroon-800 shadow-sm ring-2 ring-maroon-800/10'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {cam.isPhoneNode ? (
                          <Smartphone className="w-3.5 h-3.5 text-maroon-700 shrink-0" />
                        ) : (
                          <Video className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-bold text-maroon-900 truncate">
                          {cam.name}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                          hasFailure
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {cam.lastAnalysisResult.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900">{cam.areaDescription}</div>

                    {cam.isPhoneNode && (
                      <div className="mt-2 flex items-center gap-2 p-1.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                        <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-emerald-300 relative">
                          {cam.currentSnapshotURL ? (
                            <img src={cam.currentSnapshotURL} alt="Live Feed" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-emerald-400">
                              STREAM
                            </div>
                          )}
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <div className="text-[10px] text-emerald-900">
                          <div className="font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Real-Time Stream</span>
                          </div>
                          <div className="font-mono text-[9px] text-emerald-700">
                            Battery: {cam.deviceBattery ?? 90}% • 28+ FPS
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                      <span>
                        Floor {cam.floor} ({cam.wing.toUpperCase()} Wing)
                      </span>
                      {cam.isPhoneNode ? (
                        <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {hasRemoteWebRtcStream ? 'WEBRTC LIVE' : '28 FPS STREAM'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {cam.snapshots.length} Scans Logged
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 8 Cols: Live Interactive Vision Viewport & Analysis */}
          <div className="lg:col-span-8 space-y-4">
            <div className="white-card p-4 sm:p-5 rounded-3xl space-y-4 shadow-sm border border-slate-200">
              {/* Viewfinder Header & Run Diagnostic Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {selectedCam.name}
                    </h3>
                    {selectedCam.isPhoneNode && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Phone Node Online
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{selectedCam.areaDescription}</p>
                </div>

                {/* AI Trigger Action Button */}
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleRunAnalysis}
                  className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  )}
                  <span>
                    {isAnalyzing ? 'Analyzing Frame...' : 'Check LED Status (AI Vision)'}
                  </span>
                </button>
              </div>

              {/* Live Phone Node Detection Alert Banner */}
              {cameras.some((c) => c.isPhoneNode && c.isLiveStreaming) && !selectedCam.isPhoneNode && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-150 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <span>📱 Smartphone Camera Node is actively streaming live motion!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const phoneCam = cameras.find((c) => c.isPhoneNode);
                      if (phoneCam) selectCamera(phoneCam.id);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition active:scale-95 flex items-center gap-1"
                  >
                    <span>▶ Switch to Phone Stream</span>
                  </button>
                </div>
              )}

              {/* Viewport: Live Stream Monitor */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none group">
                {/* Remote WebRTC Video Player */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    selectedCam.isPhoneNode && hasRemoteWebRtcStream ? 'block' : 'hidden'
                  }`}
                />

                {/* High-Speed Hardware Accelerated Canvas for 24-30 FPS Live Stream */}
                <canvas
                  ref={liveCanvasRef}
                  className={`w-full h-full object-cover ${
                    selectedCam.isPhoneNode && hasRemoteWebRtcStream ? 'hidden' : 'block'
                  }`}
                />

                {/* HUD Overlay */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/70">
                  {/* Top HUD Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-white uppercase">
                        {hasRemoteWebRtcStream ? 'WEBRTC LIVE • 1080P' : `LIVE STREAM • ${liveFps} FPS`}
                      </span>
                      <span className="text-white/40 font-mono">|</span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        LATENCY: {liveLatencyMs}ms
                      </span>
                    </div>

                    <div className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-mono text-white">
                      {liveTimestamp || new Date().toLocaleTimeString()}
                    </div>
                  </div>

                  {/* Center Targeting Box */}
                  <div className="self-center flex items-center justify-center opacity-25">
                    <div className="w-20 h-20 border border-white/80 rounded-2xl relative">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/80" />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-white/80" />
                    </div>
                  </div>

                  {/* Bottom HUD Bar */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs font-bold text-white drop-shadow">
                        {selectedCam.name}
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        {selectedCam.building} • Floor {selectedCam.floor} ({selectedCam.wing.toUpperCase()} Wing)
                      </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-emerald-400">
                      ● {hasRemoteWebRtcStream ? 'CROSS-DEVICE WEBRTC ONLINE' : `LOW LATENCY (${liveFps} FPS)`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Result Box */}
              {lastAnalyzedResult && (
                <div className="p-4 sm:p-5 rounded-2xl border bg-slate-50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      {lastAnalyzedResult.analysisResult === 'all_ok' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : lastAnalyzedResult.analysisResult === 'power_outage' ? (
                        <Power className="w-5 h-5 text-slate-600 shrink-0" />
                      ) : lastAnalyzedResult.analysisResult === 'inconclusive' ? (
                        <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <span className="font-extrabold text-sm text-slate-900 uppercase">
                        {lastAnalyzedResult.analysisResult === 'all_ok'
                          ? 'DIAGNOSIS: LIGHT IS ON & OPERATIONAL'
                          : lastAnalyzedResult.analysisResult === 'failure_detected'
                          ? 'DIAGNOSIS: LIGHT IS UNLIT / FAILED (OFF)'
                          : lastAnalyzedResult.analysisResult === 'power_outage'
                          ? 'DIAGNOSIS: BUILDING POWER OUTAGE'
                          : 'DIAGNOSIS: NO LIGHT FIXTURE IN VIEW'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-mono text-[11px] font-bold">
                        Confidence: {Math.round(lastAnalyzedResult.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Total Visible LEDs</div>
                      <div className="text-lg font-black text-slate-900">{lastAnalyzedResult.totalLEDsVisible}</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-[10px] text-emerald-700 font-semibold">Operational</div>
                      <div className="text-lg font-black text-emerald-700">{lastAnalyzedResult.workingLEDs}</div>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border ${
                        lastAnalyzedResult.failedLEDs > 0
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-semibold">Failed / Unlit</div>
                      <div className="text-lg font-black">{lastAnalyzedResult.failedLEDs}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-maroon-900">AI Diagnostic Summary:</div>
                    <div className="text-slate-600 leading-relaxed">
                      {lastAnalyzedResult.geminiExplanation}
                    </div>
                  </div>

                  {lastAnalyzedResult.autoTicketId && lastAnalyzedResult.failedLEDs > 0 && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                      <div className="font-bold">
                        Work Order Auto-Generated: #{lastAnalyzedResult.autoTicketId}
                      </div>
                      <span className="font-semibold text-[11px]">Dispatched to Electrical Team</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Phone Pairing Modal */}
      {isPairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5 text-center">
            <button
              onClick={() => setIsPairModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-xl text-sm"
            >
              ✕
            </button>

            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-maroon-50 text-maroon-800 flex items-center justify-center mx-auto shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Connect Smartphone as CCTV Node
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Scan this QR code with your phone camera or open the link to start 28+ FPS live video streaming
              </p>
            </div>

            {/* Render QR Code */}
            <div className="p-4 bg-white border-2 border-dashed border-maroon-300 rounded-2xl inline-block shadow-inner">
              <QRCodeSVG value={phoneNodeUrl} size={180} level="M" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 break-all select-all">
                {phoneNodeUrl}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(phoneNodeUrl);
                    alert('Phone CCTV Node URL copied to clipboard!');
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition text-xs"
                >
                  Copy URL
                </button>
                <a
                  href={phoneNodeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-1"
                >
                  <span>Open in Tab →</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
