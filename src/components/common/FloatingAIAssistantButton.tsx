import React, { useState } from 'react';
import { Bot, Mic, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AIChatComplaintModal } from './AIChatComplaintModal';

export const FloatingAIAssistantButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-maroon-800 to-maroon-950 hover:from-maroon-900 hover:to-black text-white rounded-full shadow-xl shadow-maroon-950/25 border-2 border-amber-300/40 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Open AI Complaint Voice & Chat Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-maroon-950 flex items-center justify-center font-bold shadow-inner">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-maroon-900 animate-pulse" />
          </div>

          <div className="text-left pr-1">
            <div className="text-xs font-extrabold flex items-center gap-1">
              <span>Talk to AI</span>
              <Mic className="w-3 h-3 text-amber-300 animate-bounce" />
            </div>
            <div className="text-[10px] text-maroon-200 font-medium leading-none">Voice & Chat</div>
          </div>
        </button>
      </div>

      <AIChatComplaintModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
