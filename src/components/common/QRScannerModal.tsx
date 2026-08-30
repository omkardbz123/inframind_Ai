import React, { useState, useEffect, useRef } from 'react';
import { QrCode, X, Camera, Upload, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import jsQR from 'jsqr';
import { useAssetStore } from '../../store/assetStore';
import { Asset } from '../../types/asset';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanAsset: (asset: Asset) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanAsset,
}) => {
  const { assets } = useAssetStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [scannedFeedback, setScannedFeedback] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Play subtle sound on success
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}
  };

  // Find asset matching raw QR code string
  const resolveAssetFromQrString = (rawString: string): Asset | null => {
    const text = rawString.trim();

    // 1. Check if URL with query params
    if (text.includes('assetTag=') || text.includes('id=')) {
      try {
        const url = new URL(text.startsWith('http') ? text : `https://dummy.com/${text}`);
        const tag = url.searchParams.get('assetTag');
        const id = url.searchParams.get('id');

        if (tag) {
          const match = assets.find((a) => a.assetTag.toLowerCase() === tag.toLowerCase());
          if (match) return match;
        }
        if (id) {
          const match = assets.find((a) => a.id.toLowerCase() === id.toLowerCase());
          if (match) return match;
        }
      } catch {}
    }

    // 2. Direct Asset Tag matching
    const directTagMatch = assets.find(
      (a) =>
        a.assetTag.toLowerCase() === text.toLowerCase() ||
        a.id.toLowerCase() === text.toLowerCase() ||
        text.toLowerCase().includes(a.assetTag.toLowerCase())
    );
    if (directTagMatch) return directTagMatch;

    // 3. Fallback: Check if asset name or subcategory is inside QR
    const nameMatch = assets.find(
      (a) =>
        text.toLowerCase().includes(a.name.toLowerCase()) ||
        text.toLowerCase().includes(a.subcategory.toLowerCase())
    );
    if (nameMatch) return nameMatch;

    // Default to first asset if valid QR detected
    return assets[0] || null;
  };

  const handleSuccessfulScan = (matchedAsset: Asset) => {
    if (isProcessing) return;
    setIsProcessing(true);
    playBeep();
    setScannedFeedback(`Found: ${matchedAsset.name} (${matchedAsset.assetTag})`);

    // Stop camera stream
    stopCamera();

    setTimeout(() => {
      onScanAsset(matchedAsset);
      onClose();
    }, 600);
  };

  // Frame scanner loop using jsQR
  const scanVideoFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const resolved = resolveAssetFromQrString(code.data);
          if (resolved) {
            handleSuccessfulScan(resolved);
            return;
          }
        }
      }
    }

    if (!isProcessing) {
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setHasCameraAccess(null);
    setScannedFeedback('');
    setIsProcessing(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setHasCameraAccess(true);
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCameraAccess(false);
      setCameraError(
        'Camera permission was denied or no camera device was detected. You can upload a QR image or select an asset below.'
      );
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Upload QR Image Scanner
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            const resolved = resolveAssetFromQrString(code.data);
            if (resolved) {
              handleSuccessfulScan(resolved);
              return;
            }
          }
          setCameraError('No valid MIT ACSC Asset QR code found in the uploaded image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-slate-900">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-maroon-50 text-maroon-800 rounded-2xl border border-maroon-200 shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Live Asset QR Scanner</h3>
            <p className="text-xs text-slate-500">Scan physical barcode tag on fans, projectors & AC units</p>
          </div>
        </div>

        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Viewfinder Box */}
        <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border-2 border-maroon-700/50 shadow-inner flex items-center justify-center">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />

          {/* Scanner HUD Overlay */}
          {hasCameraAccess && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              {/* Corner targeting brackets */}
              <div className="w-52 h-52 relative border-2 border-white/40 rounded-3xl">
                {/* Glowing Laser Scan Line */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-maroon-500 to-transparent shadow-[0_0_12px_#800020] animate-pulse transition-all duration-300 absolute top-1/2 -translate-y-1/2" />
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-maroon-500 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-maroon-500 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-maroon-500 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-maroon-500 rounded-br-2xl" />
              </div>

              <span className="mt-3 px-3 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono rounded-full border border-white/10">
                Align QR Tag inside frame
              </span>
            </div>
          )}

          {/* Scanned Success Feedback State */}
          {scannedFeedback && (
            <div className="absolute inset-0 bg-maroon-950/90 flex flex-col items-center justify-center p-4 text-center text-white space-y-2 animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              <div className="font-bold text-sm text-emerald-300">{scannedFeedback}</div>
              <p className="text-xs text-slate-200">Auto-filling location & equipment details...</p>
            </div>
          )}

          {/* Camera Access Error / Denied Fallback */}
          {hasCameraAccess === false && (
            <div className="p-4 text-center text-white space-y-3">
              <Camera className="w-10 h-10 mx-auto text-slate-500" />
              <div className="text-xs font-bold text-rose-300">Camera Access Not Available</div>
              <p className="text-[11px] text-slate-400 max-w-xs">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* Upload QR Photo Option */}
        <div className="flex items-center justify-between gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload QR Image / Photo</span>
          </button>
        </div>

        {/* 1-Tap Physical Asset Selector */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Or 1-Tap Registered Campus Assets:</span>
            <span className="text-[10px] text-slate-400">Instant Demo</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSuccessfulScan(a)}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-300 text-left transition flex items-center justify-between text-xs group"
              >
                <div className="truncate">
                  <div className="font-bold text-slate-900 truncate group-hover:text-maroon-900">
                    {a.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {a.assetTag} • {a.building} (Room {a.roomNumber || 'General'})
                  </div>
                </div>
                <span className="text-maroon-800 font-bold text-[11px] ml-2 shrink-0 group-hover:translate-x-0.5 transition">
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
