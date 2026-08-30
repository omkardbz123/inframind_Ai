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
  MapPin,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTicketStore } from '../../store/ticketStore';
import { classifyFaultWithGemini } from '../../lib/gemini';
import { CAMPUS_BUILDINGS } from '../../lib/constants';
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
  suggestedOptions?: Array<{ label: string; actionValue: string; icon?: string }>;
  isConfirmationCard?: boolean;
  draftSummary?: {
    category: DepartmentType;
    subcategory: string;
    specificProblem: string;
    building: string;
    floor: number;
    wing: WingType;
    roomNumber: string;
    priority: TicketPriority;
  };
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
  const { currentUser, customGeminiApiKey } = useAuthStore();
  const { createTicket } = useTicketStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Conversational Multi-Turn Draft State
  const draftRef = useRef<{
    category: DepartmentType;
    subcategory: string;
    specificProblem: string;
    building: string;
    floor: number;
    wing: WingType;
    roomNumber: string;
    priority: TicketPriority;
    urgencyScore: number;
  }>({
    category: 'electrical',
    subcategory: 'Air Conditioner',
    specificProblem: '',
    building: 'Main Academic Building (MAB)',
    floor: 1,
    wing: 'east',
    roomNumber: '102',
    priority: 'medium',
    urgencyScore: 70,
  });

  const conversationStepRef = useRef<'idle' | 'asking_problem_detail' | 'asking_location' | 'confirming'>('idle');

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const getInitialMessages = (): ChatMessage[] => [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello ${currentUser?.displayName?.split(' ')[0] || 'there'}! 👋 I am your **CampusCare AI Assistant** (powered by Gemini 2.0 Flash).\n\nTell me what's broken or malfunctioning (by **voice speech** 🎙️ or **chat text** 💬), and I'll help you file the complaint with the right technician!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedOptions: [
        { label: '❄️ AC is not working', actionValue: 'AC is not working' },
        { label: '🌀 Ceiling fan making noise', actionValue: 'Ceiling fan is making noise' },
        { label: '💧 Water purifier leaking', actionValue: 'Water purifier is leaking' },
        { label: '📽️ Projector has no display', actionValue: 'Projector has no display' },
        { label: '💡 Tube light is unlit / dark', actionValue: 'Corridor tube light is unlit' },
      ],
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);

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

  const handleResetConversation = () => {
    conversationStepRef.current = 'idle';
    draftRef.current = {
      category: 'electrical',
      subcategory: 'Air Conditioner',
      specificProblem: '',
      building: 'Main Academic Building (MAB)',
      floor: 1,
      wing: 'east',
      roomNumber: '102',
      priority: 'medium',
      urgencyScore: 70,
    };
    setMessages(getInitialMessages());
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

    // Simulated short AI processing delay
    await new Promise((r) => setTimeout(r, 450));

    try {
      const lower = query.toLowerCase();
      const currentStep = conversationStepRef.current;

      // =========================================================================
      // STEP 1: If in idle state, identify equipment & ask for specific breakdown details
      // =========================================================================
      if (currentStep === 'idle') {
        const classification = await classifyFaultWithGemini(query, customGeminiApiKey);

        draftRef.current.category = classification.category;
        draftRef.current.subcategory = classification.subcategory;
        draftRef.current.priority = classification.priority;
        draftRef.current.urgencyScore = classification.urgencyScore;

        conversationStepRef.current = 'asking_problem_detail';

        let problemOptions: Array<{ label: string; actionValue: string }> = [];

        if (lower.includes('ac') || lower.includes('air conditioner') || lower.includes('cooling')) {
          draftRef.current.category = 'electrical';
          draftRef.current.subcategory = 'Air Conditioner';
          problemOptions = [
            { label: '❄️ Not cooling / blowing warm air', actionValue: 'AC is blowing warm air and not cooling' },
            { label: '💧 Water leaking from indoor unit', actionValue: 'Water is dripping from the indoor AC unit' },
            { label: '🔌 Dead power / remote not responding', actionValue: 'AC won\'t turn on and remote is dead' },
            { label: '🔊 Loud vibration or rattling noise', actionValue: 'AC is making violent vibrating rattling noise' },
          ];
        } else if (lower.includes('fan')) {
          draftRef.current.category = 'electrical';
          draftRef.current.subcategory = 'Ceiling Fan';
          problemOptions = [
            { label: '🌀 Fan not spinning / dead', actionValue: 'Ceiling fan is not spinning at all' },
            { label: '⚡ Sparks / burning smell', actionValue: 'Fan motor sparking near clamp with burning smell' },
            { label: '🔊 Loud squeaking / bearing noise', actionValue: 'Fan bearing is screeching loudly' },
            { label: '⚠️ Fan wobbling / loose hook', actionValue: 'Fan is wobbling dangerously from ceiling clamp' },
          ];
        } else if (lower.includes('water') || lower.includes('purifier') || lower.includes('filter')) {
          draftRef.current.category = 'plumbing';
          draftRef.current.subcategory = 'RO Water Purifier';
          problemOptions = [
            { label: '💧 RO unit leaking / overflow', actionValue: 'Water purifier bottom filter leaking rapidly' },
            { label: '🚫 No water dispensing', actionValue: 'Water purifier tap not dispensing water' },
            { label: '👅 Foul taste / filter change needed', actionValue: 'Water has strange taste and filter needs replacement' },
          ];
        } else if (lower.includes('projector') || lower.includes('screen') || lower.includes('display')) {
          draftRef.current.category = 'technical';
          draftRef.current.subcategory = 'Projector Display / Bulb';
          problemOptions = [
            { label: '📽️ No HDMI / display signal', actionValue: 'Projector turns on but says No Signal with HDMI' },
            { label: '💡 Lamp overheating / shutting down', actionValue: 'Projector displays Lamp Temp Error and turns off' },
            { label: '⚡ Projector won\'t power ON', actionValue: 'Power LED is dead and won\'t turn on' },
          ];
        } else {
          problemOptions = [
            { label: '⚠️ Equipment not working / broken', actionValue: `${classification.subcategory} is broken and not working` },
            { label: '🔌 Power or electrical fault', actionValue: `${classification.subcategory} has power failure` },
            { label: '🔊 Strange noise / vibration', actionValue: `${classification.subcategory} is making abnormal noise` },
          ];
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Got it! I detected this as a **${draftRef.current.subcategory} (${draftRef.current.category.toUpperCase()})** issue.\n\n👉 **What exact problem are you facing with the ${draftRef.current.subcategory}?** Please select an option below or describe it:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedOptions: problemOptions,
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
      // =========================================================================
      // STEP 2: Capture problem detail -> Ask for Location
      // =========================================================================
      else if (currentStep === 'asking_problem_detail') {
        draftRef.current.specificProblem = query;
        conversationStepRef.current = 'asking_location';

        const locationOptions = [
          { label: '🏛️ MAB - Room 102 (Floor 1)', actionValue: 'Main Academic Building (MAB), Floor 1, Room 102' },
          { label: '🏛️ MAB - Room 201 (Floor 2)', actionValue: 'Main Academic Building (MAB), Floor 2, Room 201' },
          { label: '🔬 Science Block - Computer Lab 1', actionValue: 'Science Block, Floor 2, Computer Lab 1' },
          { label: '📚 Central Library - Reading Hall', actionValue: 'Central Library, Ground Floor, Reading Hall' },
          { label: '🎙️ Auditorium / Seminar Hall', actionValue: 'Main Academic Building (MAB), Ground Floor, Auditorium' },
        ];

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Thanks for the details! 📍 **Where is this ${draftRef.current.subcategory} located on campus?**\n\nPick a location below or type your room number:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedOptions: locationOptions,
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
      // =========================================================================
      // STEP 3: Capture Location -> Show Confirmation Summary Card
      // =========================================================================
      else if (currentStep === 'asking_location') {
        // Parse building, floor, room
        if (lower.includes('science') || lower.includes('lab') || lower.includes('tower')) {
          draftRef.current.building = CAMPUS_BUILDINGS[1]?.name || 'Science & Research Block';
        } else if (lower.includes('library')) {
          draftRef.current.building = 'Central Library & Reading Hall';
        } else {
          draftRef.current.building = 'Main Academic Building (MAB)';
        }

        if (lower.includes('ground') || lower.includes('floor 0')) {
          draftRef.current.floor = 0;
        } else if (lower.includes('2nd') || lower.includes('second') || lower.includes('floor 2') || lower.includes('20')) {
          draftRef.current.floor = 2;
        } else {
          draftRef.current.floor = 1;
        }

        const roomMatch = query.match(/(?:room|class|hall|lab|cabin)\s*([a-zA-Z0-9-]+)/i);
        if (roomMatch && roomMatch[1]) {
          draftRef.current.roomNumber = roomMatch[1].toUpperCase();
        } else if (lower.includes('102')) {
          draftRef.current.roomNumber = '102';
        } else if (lower.includes('201')) {
          draftRef.current.roomNumber = '201';
        } else {
          draftRef.current.roomNumber = 'Room 102';
        }

        conversationStepRef.current = 'confirming';

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Here is the complaint summary ready to be dispatched to our campus maintenance technician:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isConfirmationCard: true,
          draftSummary: { ...draftRef.current },
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
      // =========================================================================
      // STEP 4: Confirming dispatch
      // =========================================================================
      else if (currentStep === 'confirming') {
        await executeTicketCreation();
      }
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

  const executeTicketCreation = async () => {
    if (!currentUser) return;
    setIsThinking(true);

    try {
      const draft = draftRef.current;
      const title = `${draft.subcategory} Fault: ${draft.specificProblem || 'Maintenance Required'}`;
      const description = `${draft.specificProblem || draft.subcategory + ' issue'}\n\n[Location]: ${draft.building}, Floor ${draft.floor}, Room ${draft.roomNumber}\n[Reported via]: Gemini 2.0 Flash AI Voice & Chat Assistant.`;

      const newTicket = await createTicket({
        title,
        description,
        category: draft.category,
        subcategory: draft.subcategory,
        priority: draft.priority,
        building: draft.building,
        floor: draft.floor,
        wing: draft.wing,
        roomNumber: draft.roomNumber,
        locationDescription: `${draft.building}, Floor ${draft.floor}, ${draft.wing.toUpperCase()} Wing (${draft.roomNumber})`,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName,
        reporterEmail: currentUser.email,
        reporterRole: currentUser.role,
        source: 'voice',
        urgencyScore: draft.urgencyScore,
      });

      conversationStepRef.current = 'idle';

      const aiReplyText = `✅ **Work Order #${newTicket.id} Successfully Dispatched!**\n\nOur campus technician **${newTicket.assignedToName}** has been notified via phone & email.\n\n📍 **Location**: ${draft.building} (Room ${draft.roomNumber})\n⏱️ **Target SLA**: ${new Date(newTicket.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nYou will receive a notification and email update as soon as the problem is resolved!`;

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
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#821930', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {}
    } catch (e: any) {
      alert(`Failed to create ticket: ${e.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col h-[650px] max-h-[92vh] overflow-hidden">
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
                  Gemini 2.0 Flash
                </span>
              </div>
              <p className="text-[11px] text-maroon-200">
                Interactive Voice & Chat • Automated technician dispatch for Students & Teachers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetConversation}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                <div className={`space-y-2.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-maroon-800 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>

                  {/* Render Confirmation Card before Dispatching */}
                  {msg.isConfirmationCard && msg.draftSummary && (
                    <div className="p-4 bg-white border-2 border-maroon-300 rounded-2xl shadow-md text-xs space-y-3 animate-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 font-bold text-maroon-900">
                          <Wrench className="w-4 h-4 text-maroon-700" />
                          <span>Dispatch Confirmation</span>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase">
                          {msg.draftSummary.priority} Priority
                        </span>
                      </div>

                      <div className="space-y-1.5 text-slate-700">
                        <div>
                          <strong>Equipment:</strong> {msg.draftSummary.subcategory} (
                          <span className="capitalize">{msg.draftSummary.category}</span>)
                        </div>
                        <div>
                          <strong>Specific Issue:</strong> {msg.draftSummary.specificProblem || 'Not specified'}
                        </div>
                        <div>
                          <strong>Location:</strong> {msg.draftSummary.building} • Room {msg.draftSummary.roomNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Auto-Routing: Will notify on-duty Department Technician immediately.
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={executeTicketCreation}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Send Technician Now</span>
                        </button>
                        <button
                          onClick={handleResetConversation}
                          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          <span>Change Details</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Work Order Slip if Ticket is Created */}
                  {msg.ticketData && (
                    <div className="p-4 bg-white border-2 border-emerald-300 rounded-2xl shadow-md text-xs space-y-2.5 animate-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono font-bold text-emerald-900">
                            Ticket #{msg.ticketData.id} (Dispatched)
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {msg.ticketData.priority} Priority
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-700">
                        <div>
                          <strong>Assigned Technician:</strong> {msg.ticketData.assignedToName}
                        </div>
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

                  {/* Interactive Selectable Option Chips */}
                  {msg.suggestedOptions && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(opt.actionValue)}
                          className="text-left px-3.5 py-2 bg-white hover:bg-maroon-50 border border-slate-200 hover:border-maroon-400 rounded-xl text-xs font-semibold text-slate-800 hover:text-maroon-900 transition shadow-2xs active:scale-95 flex items-center gap-1.5"
                        >
                          <span>{opt.label}</span>
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
                <span>Gemini 2.0 Flash is analyzing details & preparing work order...</span>
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
              <span className="font-bold">Listening to your voice... Speak your problem or room number</span>
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
                  : 'Type or speak: e.g. "AC not cooling in Room 102"...'
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
            <span>Powered by Google Gemini 2.0 Flash AI</span>
            <span>Click Mic 🎙️ to talk or select an option above</span>
          </div>
        </div>
      </div>
    </div>
  );
};
