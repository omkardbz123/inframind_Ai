import React, { useState } from 'react';
import { QrCode, Sparkles, X, CheckCircle2, Search } from 'lucide-react';
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
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [isScanningSim, setIsScanningSim] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = (asset: Asset) => {
    setIsScanningSim(true);
    setTimeout(() => {
      setIsScanningSim(false);
      onScanAsset(asset);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-maroon-50 text-maroon-800 rounded-2xl border border-maroon-200">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">5-Second Asset QR Scanner</h3>
            <p className="text-xs text-slate-500">Scan physical barcode sticker on fan / projector</p>
          </div>
        </div>

        {/* Viewfinder simulation box */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border-2 border-dashed border-maroon-500">
          <div className="text-center text-white space-y-2">
            <QrCode className={`w-12 h-12 mx-auto text-maroon-400 ${isScanningSim ? 'animate-bounce' : 'animate-pulse'}`} />
            <div className="text-xs font-mono font-bold text-slate-200">
              {isScanningSim ? 'Decoding QR Barcode...' : 'Camera Viewfinder Active'}
            </div>
            <div className="text-[10px] text-slate-400">Position barcode sticker within frame</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">Or Tap a Physical Asset to Simulate Scan:</div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSimulateScan(a)}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-maroon-50 border border-slate-200 hover:border-maroon-300 text-left transition flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{a.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {a.assetTag} • {a.building} (Room {a.roomNumber || 'Corridor'})
                  </div>
                </div>
                <span className="text-maroon-800 font-bold text-xs">Scan →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
