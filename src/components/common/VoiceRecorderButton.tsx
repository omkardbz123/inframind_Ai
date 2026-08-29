import React, { useState } from 'react';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { classifyFaultWithGemini } from '../../lib/gemini';
import { useAuthStore } from '../../store/authStore';

interface VoiceRecorderButtonProps {
  onClassified: (result: any, transcript: string) => void;
}

export const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = ({
  onClassified,
}) => {
  const { customGeminiApiKey } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);

      const sampleTranscript =
        'The water purifier on the second floor east wing near room 201 is leaking water and the cooling is not working properly.';

      try {
        const result = await classifyFaultWithGemini(sampleTranscript, customGeminiApiKey);
        onClassified(result, sampleTranscript);
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setIsRecording(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleRecord}
      disabled={isProcessing}
      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
        isRecording
          ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
          : isProcessing
          ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
          : 'bg-maroon-800 hover:bg-maroon-900 text-white shadow-xs'
      }`}
      title="Speak your breakdown report"
    >
      {isProcessing ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin text-maroon-800" />
          <span>Gemini AI Parsing...</span>
        </>
      ) : isRecording ? (
        <>
          <MicOff className="w-4 h-4" />
          <span>Tap to Stop & Parse</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 text-amber-300" />
          <span>Voice AI Report</span>
        </>
      )}
    </button>
  );
};
