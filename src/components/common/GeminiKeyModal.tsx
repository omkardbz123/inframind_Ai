import React, { useState } from 'react';
import { Key, Sparkles, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose }) => {
  const { customGeminiApiKey, setGeminiApiKey } = useAuthStore();
  const [keyInput, setKeyInput] = useState(
    customGeminiApiKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || ''
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(keyInput.trim());
    onClose();
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
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Gemini 3.5 Flash Lite</h3>
            <p className="text-xs text-slate-500">Google AI Studio • Live Multimodal CCTV Vision</p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-maroon-700" />
            <span>Google AI Studio Key Connected</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Running <strong>Gemini 3.5 Flash Lite</strong> with high-speed rate limits (up to 250,000 tokens/min) for real-time corridor illumination scans and voice report NLP.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gemini API Key:</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-maroon-700"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                setKeyInput('');
                setGeminiApiKey('');
              }}
              className="text-slate-500 hover:text-rose-600 text-xs font-semibold"
            >
              Reset Key
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl font-bold shadow-xs transition"
            >
              Save & Activate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
