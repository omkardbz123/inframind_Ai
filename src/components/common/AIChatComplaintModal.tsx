import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  X,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Zap,
  Droplets,
  Monitor,
  Armchair,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTicketStore } from '../../store/ticketStore';
import { classifyFaultWithGemini } from '../../lib/gemini';
import { CAMPUS_BUILDINGS, DEPARTMENTS } from '../../lib/constants';
import { DepartmentType } from '../../types/user';
import { TicketPriority, Ticket } from '../../types/ticket';
import { WingType } from '../../types/location';
import { downloadTicketReportPDF } from '../../lib/pdfGenerator';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  ticketData?: Ticket;
  suggestedPills?: string[];
}

interface AIChatComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatComplaintModal: React.FC<AIChatComplaintModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { currentUser, customGeminiApiKey, selectedRole } = useAuthStore();
  const { createTicket } = useTicketStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello ${currentUser?.displayName?.split(' ')[0] || 'there'}! 👋 I am your **CampusCare AI Assistant**.\n\nTell me what's broken or malfunctioning (by **voice speech** 🎙️ or **chat text** 💬), and I'll automatically diagnose, categorize, and dispatch a work order for you!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPills: [
        'Ceiling fan in Room 102 is making sparks and squeaking',
        'Water purifier on 2nd Floor East is leaking',
        'Projector in Classroom 101 has no display signal',
        'Washroom tap leaking on Ground Floor West',
      ],
    },
  ]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-IN'; // Indian English

        recog.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setInputMessage(transcript);
        };

        recog.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsRecording(false);
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recog;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      if (inputMessage.trim()) {
        handleSendMessage(inputMessage);
      }
    } else {
      try {
        setInputMessage('');
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech start error:', err);
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || !currentUser || isThinking) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    try {
      // 1. Classify with Gemini AI
      const classification = await classifyFaultWithGemini(query, customGeminiApiKey);

      // 2. Extract Location heuristics
      const lower = query.toLowerCase();
      let building = CAMPUS_BUILDINGS[0].name;
      let floor = 1;
      let wing: WingType = 'east';
      let roomNumber = '102';

      if (lower.includes('rnd') || lower.includes('research') || lower.includes('tower') || lower.includes('robotics')) {
        building = CAMPUS_BUILDINGS[1].name;
      }

      if (lower.includes('ground') || lower.includes('floor 0') || lower.includes('00') || lower.includes('auditorium')) {
        floor = 0;
      } else if (lower.includes('2nd') || lower.includes('second') || lower.includes('floor 2') || lower.includes('20')) {
        floor = 2;
      } else if (lower.includes('1st') || lower.includes('first') || lower.includes('floor 1') || lower.includes('10')) {
        floor = 1;
      }

      if (lower.includes('west')) {
        wing = 'west';
      } else if (lower.includes('central') || lower.includes('lobby') || lower.includes('atrium')) {
        wing = 'central';
      } else {
        wing = 'east';
      }

      // Room number regex extraction (e.g. room 101, class 002, 203)
      const roomMatch = query.match(/(?:room|class|hall|lab|cabin)\s*([a-zA-Z0-9-]+)/i);
      if (roomMatch && roomMatch[1]) {
        roomNumber = roomMatch[1].toUpperCase();
      }

      // 3. Automatically Create Work Order Ticket
      const newTicket = await createTicket({
        title: classification.refinedTitle || `${classification.subcategory} Issue in Room ${roomNumber}`,
        description: `${query}\n\n[AI Diagnostic]: ${classification.summaryReason}`,
        category: classification.category,
        subcategory: classification.subcategory,
        priority: classification.priority,
        building,
        floor,
        wing,
        roomNumber,
        locationDescription: `${building}, Floor ${floor}, ${wing.toUpperCase()} Wing (Room ${roomNumber})`,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName,
        reporterEmail: currentUser.email,
        reporterRole: currentUser.role,
        source: 'voice',
        urgencyScore: classification.urgencyScore,
      });

      // 4. Synthesize friendly AI conversational reply
      const aiReplyText = `✅ **Work Order #${newTicket.id} Successfully Dispatched!**\n\nI have diagnosed your report as **${classification.category.toUpperCase()} (${classification.subcategory})** with **${classification.priority.toUpperCase()} Priority**.\n\n📍 **Location**: ${building}, Floor ${floor}, ${wing.toUpperCase()} Wing (Room ${roomNumber})\n⏱️ **SLA Resolution Target**: ${new Date(newTicket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nOur campus technician team has been notified. You can track live updates in your dashboard!`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ticketData: newTicket,
      };

      setMessages((prev) => [...prev, aiMsg]);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#821930', '#10b981', '#3b82f6'],
        });
      } catch {}
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "I encountered an error parsing your request. Please try speaking again or click 'Report a Fault' directly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col h-[640px] max-h-[92vh] overflow-hidden">
        {/* Chatbot Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-maroon-800 via-maroon-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  CampusCare AI Voice & Chat Assistant
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-maroon-200">
                Speak or type your breakdown • Instant complaint dispatch for Students & Teachers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-maroon-800 text-white shadow-xs'
                      : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xs'
                  }`}
                >
                  {isUser ? currentUser?.displayName?.[0] || 'U' : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-maroon-800 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>

                  {/* Render Work Order Slip if Ticket is Created */}
                  {msg.ticketData && (
                    <div className="p-4 bg-white border-2 border-emerald-200 rounded-2xl shadow-sm text-xs space-y-2.5 animate-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono font-bold text-emerald-900">
                            Ticket #{msg.ticketData.id}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {msg.ticketData.priority} Priority
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-700">
                        <div>
                          <strong>Equipment:</strong> {msg.ticketData.subcategory} (
                          <span className="capitalize">{msg.ticketData.category}</span>)
                        </div>
                        <div>
                          <strong>Location:</strong> {msg.ticketData.building} • Room{' '}
                          {msg.ticketData.roomNumber || 'General'}
                        </div>
                        <div className="text-[11px] font-mono text-amber-800">
                          SLA Target:{' '}
                          {new Date(msg.ticketData.slaDeadline).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => downloadTicketReportPDF(msg.ticketData!)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-maroon-700" />
                          <span>PDF Slip</span>
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            navigate('/my-tickets');
                          }}
                          className="px-3 py-1.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <span>Track in My Complaints →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestedPills && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedPills.map((pill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(pill)}
                          className="text-left px-3 py-1.5 bg-white hover:bg-maroon-50 border border-slate-200 hover:border-maroon-300 rounded-xl text-[11px] font-medium text-slate-700 hover:text-maroon-900 transition shadow-2xs"
                        >
                          "{pill}"
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 px-1 font-mono">{msg.timestamp}</div>
                </div>
              </div>
            );
          })}

          {/* AI Thinking Animation */}
          {isThinking && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-maroon-700 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-maroon-700 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-maroon-700 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Gemini AI is analyzing your report & dispatching work order...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Voice Listening Active Wave Banner */}
        {isRecording && (
          <div className="px-4 py-2.5 bg-rose-600 text-white flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="font-bold">Listening to your voice... Speak your complaint now</span>
            </div>
            <button
              onClick={toggleVoiceRecording}
              className="px-3 py-1 bg-white text-rose-700 rounded-lg font-bold text-[11px] shadow-xs"
            >
              Done / Send
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Mic Voice Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-3 rounded-2xl flex items-center justify-center transition shrink-0 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-bounce shadow-md shadow-rose-600/30'
                  : 'bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200'
              }`}
              title={isRecording ? 'Stop recording' : 'Speak complaint (Voice to text)'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-maroon-800" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={
                isRecording
                  ? 'Listening to speech...'
                  : 'Type or speak: e.g. "Ceiling fan #2 vibrating in Room 102"...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-maroon-700 font-medium"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isThinking}
              className="p-3 bg-maroon-800 hover:bg-maroon-900 disabled:opacity-40 text-white rounded-2xl transition shadow-xs shrink-0 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Google Gemini AI & MIT ACSC Facility Engine</span>
            <span>Click Mic 🎙️ to talk or type to submit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
