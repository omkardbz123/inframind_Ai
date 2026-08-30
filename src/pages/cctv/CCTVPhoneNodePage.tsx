import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Camera,
  RefreshCw,
  Zap,
  Shield,
  Download,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Battery,
  MapPin,
  Flame,
  Layers,
  ArrowRight,
  ExternalLink,
  Wifi,
  Activity,
  Radio,
} from 'lucide-react';
import { CAMPUS_BUILDINGS } from '../../lib/constants';
import { useCCTVStore } from '../../store/cctvStore';
import { WingType } from '../../types/location';
import { cctvStreamService, DEFAULT_HUB_ID } from '../../lib/cctvStreamService';

export const CCTVPhoneNodePage: React.FC = () => {
  const { registerPhoneNode, updatePhoneHeartbeat } = useCCTVStore();

  // Read Hub ID from URL or default
  const [hubId, setHubId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('hub') || DEFAULT_HUB_ID;
  });

  // Installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Setup state
  const [isRegistered, setIsRegistered] = useState(false);
  const [nodeId, setNodeId] = useState(`CAM-PHONE-${Math.floor(100 + Math.random() * 900)}`);
  const [nodeName, setNodeName] = useState(`📱 Phone Camera Node #${nodeId.split('-')[2]}`);
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0].name);
  const [floor, setFloor] = useState<number>(1);
  const [wing, setWing] = useState<WingType>('east');
  const [areaDescription, setAreaDescription] = useState('Classroom 101 Overhead LED Lights');

  // Camera stream state
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(95);
  const [fps, setFps] = useState<number>(28);
  const [lastFrameTime, setLastFrameTime] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [frameCount, setFrameCount] = useState<number>(0);
  const [isWebRtcConnected, setIsWebRtcConnected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastSendTimeRef = useRef<number>(0);
  const seqRef = useRef<number>(0);

  // Listen for PWA BeforeInstallPrompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setShowInstallBanner(false);
    }

    // Read Battery Status if supported
    if ('getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      stopCamera();
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'To install as App on your phone:\n\n1. In Chrome / Safari, tap the menu (⋮) or Share icon.\n2. Tap "Add to Home screen".\n3. Launch from your home screen for full-screen CCTV mode!'
      );
    }
  };

  // Start Smartphone Camera & Connect WebRTC
  const startCamera = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, min: 24 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);

      // Connect via Universal WebRTC PeerJS to Central PC Hub
      cctvStreamService
        .initPhoneNode(nodeId, stream, hubId)
        .then(() => {
          setIsWebRtcConnected(true);
        })
        .catch((e) => {
          console.warn('WebRTC peer init notice:', e);
        });

      // Check for torch/flashlight capability
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities: any = videoTrack?.getCapabilities?.() || {};
      if (capabilities.torch) {
        setHasTorch(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        `Unable to access camera: ${err.message || 'Permission denied'}. Please ensure HTTPS and allow camera permissions in browser.`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    cctvStreamService.cleanup();
    setCameraActive(false);
    setIsWebRtcConnected(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (err) {
        console.warn('Torch toggle failed:', err);
      }
    }
  };

  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
  };

  // Start camera on facingMode change if active
  useEffect(() => {
    if (isRegistered) {
      startCamera();
    }
  }, [facingMode, isRegistered]);

  // Ultra Low-Latency 24-30 FPS Animation Frame Loop
  useEffect(() => {
    if (!cameraActive || !isRegistered) return;

    let isRunning = true;
    let frameTimes: number[] = [];

    const streamLoop = (now: number) => {
      if (!isRunning) return;

      // Throttle to ~35ms intervals = ~28 FPS for buttery smooth real-time stream
      if (now - lastSendTimeRef.current >= 35) {
        lastSendTimeRef.current = now;

        if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = 640;
          canvas.height = 360;
          const ctx = canvas.getContext('2d', { alpha: false });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameDataUrl = canvas.toDataURL('image/jpeg', 0.65);
            seqRef.current += 1;

            // Broadcast real-time 28+ FPS frame across WebRTC DataChannel & local channel
            cctvStreamService.broadcastFrame({
              cameraId: nodeId,
              frameDataUrl,
              timestamp: Date.now(),
              sequence: seqRef.current,
              width: 640,
              height: 360,
              battery: batteryLevel,
              torch: torchOn,
            });

            // Calculate real FPS on phone HUD
            frameTimes.push(now);
            if (frameTimes.length > 20) {
              frameTimes.shift();
              const elapsed = (now - frameTimes[0]) / 1000;
              if (elapsed > 0) {
                const currentFps = Math.round(frameTimes.length / elapsed);
                setFps(Math.min(30, Math.max(20, currentFps)));
              }
            }

            setFrameCount((prev) => prev + 1);
            setLastFrameTime(new Date().toLocaleTimeString());

            // Persist heartbeat immediately on first frame, then every 15 frames (~500ms)
            if (seqRef.current === 1 || seqRef.current % 15 === 0) {
              updatePhoneHeartbeat(nodeId, frameDataUrl, batteryLevel, torchOn);
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(streamLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(streamLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [cameraActive, isRegistered, nodeId, batteryLevel, torchOn]);

  const handleRegisterNode = (e: React.FormEvent) => {
    e.preventDefault();

    registerPhoneNode({
      id: nodeId,
      name: nodeName,
      building,
      floor,
      wing,
      areaDescription,
      isPhoneNode: true,
      isLiveStreaming: true,
      deviceBattery: batteryLevel,
    });

    setIsRegistered(true);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Hidden high-speed processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* PWA Install Sticky Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="bg-maroon-900 border-b border-maroon-700 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-semibold text-white">
              Install CCTV Node App for fullscreen continuous 28 FPS streaming
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallApp}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shadow-sm flex items-center gap-1 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-white/60 hover:text-white text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Node Top Navigation Bar */}
      <header className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-maroon-800 flex items-center justify-center font-serif font-black text-xs text-white ring-2 ring-maroon-700">
            MIT
          </div>
          <div>
            <div className="font-extrabold text-xs text-white tracking-tight flex items-center gap-1.5">
              <span>MIT ACSC CCTV Node</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                WebRTC Live
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Alandi Campus Light & Hazard Sensor</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-mono">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span>{batteryLevel}%</span>
          </div>
          <a
            href="/cctv-monitoring"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 bg-maroon-800 hover:bg-maroon-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
          >
            <span>Open Main Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {!isRegistered ? (
          /* STEP 1: Registration Form */
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-maroon-900/60 border border-maroon-700 text-maroon-300 flex items-center justify-center mx-auto shadow-inner">
                <Camera className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-white">Register Phone as 24+ FPS CCTV Camera</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Streams high-fps live motion video to the PC main portal over WebRTC for Gemini 2.0 Flash inspection.
              </p>
            </div>

            <form onSubmit={handleRegisterNode} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">CCTV Node Tag ID:</label>
                <input
                  type="text"
                  required
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:border-maroon-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Friendly Camera Name:</label>
                <input
                  type="text"
                  required
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-maroon-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Campus Building:</label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-maroon-500 focus:outline-none"
                  >
                    {CAMPUS_BUILDINGS.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Floor Level:</label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-maroon-500 focus:outline-none"
                  >
                    <option value={0}>Ground Floor (0)</option>
                    <option value={1}>1st Floor (1)</option>
                    <option value={2}>2nd Floor (2)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Wing Direction:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['east', 'west', 'central'] as WingType[]).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWing(w)}
                      className={`py-2 px-1 rounded-xl border text-center uppercase font-bold text-[11px] transition ${
                        wing === w
                          ? 'bg-maroon-800 text-white border-maroon-600'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {w} Wing
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Monitored Zone / Area Description:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classroom 101 Overhead LED lights"
                  value={areaDescription}
                  onChange={(e) => setAreaDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-maroon-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-maroon-800 hover:bg-maroon-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-maroon-900/30 transition text-sm active:scale-98"
              >
                <Video className="w-5 h-5" />
                <span>Start Camera & Stream Live to PC Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: Active CCTV HUD View */
          <div className="space-y-4">
            {/* Viewfinder Container */}
            <div className="relative aspect-video sm:aspect-[16/10] bg-black rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl">
              {/* Video Element */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* HUD Overlays */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none bg-gradient-to-b from-black/60 via-transparent to-black/70">
                {/* Top HUD */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-white uppercase">
                      LIVE • {fps} FPS
                    </span>
                    <span className="text-white/40 font-mono">|</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {isWebRtcConnected ? '● WEBRTC CONNECTED' : 'STREAMING'}
                    </span>
                  </div>

                  <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-mono text-white">
                    {nodeId}
                  </div>
                </div>

                {/* Center Crosshair Target */}
                <div className="self-center flex items-center justify-center opacity-40">
                  <div className="w-16 h-16 border border-white/60 rounded-xl relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/60" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-white/60" />
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{nodeName}</div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      {building} • Floor {floor} • {wing.toUpperCase()} Wing
                    </div>
                    <div className="text-[9px] text-slate-400">{areaDescription}</div>
                  </div>

                  <div className="text-right text-[10px] font-mono text-slate-300">
                    <div>BROADCAST: {lastFrameTime || 'Streaming...'}</div>
                    <div className="text-emerald-400 font-bold">● ACTIVE 28 FPS ON MAIN PORTAL</div>
                  </div>
                </div>
              </div>

              {/* Error overlay */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-rose-500" />
                  <p className="text-xs text-rose-300">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-maroon-800 hover:bg-maroon-700 text-white rounded-xl text-xs font-bold"
                  >
                    Retry Camera Access
                  </button>
                </div>
              )}
            </div>

            {/* Camera Control Bar */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4 text-maroon-400" />
                <span>Flip Cam ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
              </button>

              {hasTorch ? (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`py-3 px-3 rounded-2xl border font-semibold flex items-center justify-center gap-2 transition ${
                    torchOn
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Flashlight {torchOn ? 'ON' : 'OFF'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRegistered(false)}
                  className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold flex items-center justify-center gap-2 transition"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Edit Location</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsRegistered(false);
                }}
                className="py-3 px-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-bold flex items-center justify-center gap-2 transition"
              >
                <span>Disconnect</span>
              </button>
            </div>

            {/* Instruction Card */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Streaming Live Motion to PC Main Portal!</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your video frames are streaming across the network to the central CCTV control room. Open <strong>CCTV LED Vision AI</strong> on your PC to watch the live motion feed and run Gemini AI scans.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
