import { create } from 'zustand';
import { Ticket, TicketPriority, TicketStatus, TimelineEntry, FaultSource } from '../types/ticket';
import { DepartmentType } from '../types/user';
import { WingType } from '../types/location';
import { sendTransactionalEmail } from '../lib/emailSimulator';

interface CreateTicketParams {
  title: string;
  description: string;
  category: DepartmentType;
  subcategory: string;
  priority: TicketPriority;
  building: string;
  floor: number;
  wing: WingType;
  roomNumber?: string;
  locationDescription?: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: string;
  photoURLs?: string[];
  source?: FaultSource;
  assetId?: string;
  assetTag?: string;
  aiAnalysis?: string;
  urgencyScore?: number;
  isAutoDetected?: boolean;
}

interface TicketFilterState {
  searchQuery: string;
  statusFilter: TicketStatus | 'all';
  categoryFilter: DepartmentType | 'all';
  priorityFilter: TicketPriority | 'all';
  buildingFilter: string;
}

interface TicketStoreState {
  tickets: Ticket[];
  filters: TicketFilterState;

  // Actions
  createTicket: (params: CreateTicketParams) => Promise<Ticket>;
  assignTicket: (ticketId: string, assignedToId: string, assignedToName: string, managerName: string) => void;
  updateTicketStatus: (
    ticketId: string,
    status: TicketStatus,
    userId: string,
    userName: string,
    notes?: string,
    resolvedPhotos?: string[],
    cost?: number,
    parts?: string[]
  ) => void;
  addTicketComment: (ticketId: string, userId: string, userName: string, comment: string) => void;
  submitTicketFeedback: (ticketId: string, rating: number, comment?: string) => void;
  setFilters: (filters: Partial<TicketFilterState>) => void;
  resetFilters: () => void;
}

const STORAGE_TICKETS_KEY = 'campuscare_tickets_store';

function getSlaDeadline(priority: TicketPriority): string {
  const now = new Date();
  const hoursMap: Record<TicketPriority, number> = {
    critical: 2,
    high: 8,
    medium: 24,
    low: 72,
  };
  now.setHours(now.getHours() + hoursMap[priority]);
  return now.toISOString();
}

// Initial realistic campus tickets
const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-2026-0101',
    title: 'Water Purifier RO Filter Leaking on 2nd Floor West',
    description: 'The Kent Commercial RO water purifier near Room 213 is leaking rapidly from the bottom drain filter. Water is puddling in the corridor and causing slipping hazard for students.',
    category: 'plumbing',
    subcategory: 'RO Water Purifier',
    priority: 'high',
    status: 'assigned',
    building: 'Main Academic Block (MAB)',
    floor: 2,
    wing: 'west',
    roomNumber: '213',
    locationDescription: 'Corridor water station opposite CAD Lab',
    reporterId: 'user-student-01',
    reporterName: 'Omkar Sharma',
    reporterEmail: 'omkar.student@college.edu',
    reporterRole: 'Student (TE Comp)',
    assignedTo: 'user-plumber-01',
    assignedToName: 'Suresh Patil (Plumbing Tech)',
    assignedDepartment: 'plumbing',
    photoURLs: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    assignedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    slaDeadline: getSlaDeadline('high'),
    urgencyScore: 84,
    isAutoDetected: false,
    source: 'manual',
    assetTag: 'RO-MAB-2F-W01',
    timeline: [
      {
        id: 'tl-1',
        action: 'created',
        toStatus: 'open',
        userId: 'user-student-01',
        userName: 'Omkar Sharma',
        comment: 'Fault ticket raised via Mobile PWA.',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tl-2',
        action: 'assigned',
        toStatus: 'assigned',
        userId: 'user-manager-01',
        userName: 'Er. Ramesh Kulkarni (Facilities Manager)',
        comment: 'Assigned to Suresh Patil (Plumbing Tech). Spares: replacement RO sediment filter.',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'T-2026-0102',
    title: 'Ceiling Fan #3 Squeaking & Sparks in Room 002',
    description: 'During morning lecture, ceiling fan #3 in classroom 002 started making violent bearing screeching noises and small electrical spark was noticed near the ceiling hook clamp.',
    category: 'electrical',
    subcategory: 'Ceiling Fan',
    priority: 'critical',
    status: 'in_progress',
    building: 'Main Academic Block (MAB)',
    floor: 0,
    wing: 'east',
    roomNumber: '002',
    locationDescription: 'Student Facilitation Center / Class 002 (3rd row ceiling)',
    reporterId: 'user-teacher-01',
    reporterName: 'Dr. Rajiv Deshpande (Prof. CS)',
    reporterEmail: 'dr.deshpande@college.edu',
    reporterRole: 'Teacher',
    assignedTo: 'user-electrician-01',
    assignedToName: 'Rajesh Kamble (Senior Electrician)',
    assignedDepartment: 'electrical',
    photoURLs: ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80'],
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    assignedAt: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
    inProgressAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    slaDeadline: getSlaDeadline('critical'),
    urgencyScore: 96,
    isAutoDetected: false,
    source: 'manual',
    assetTag: 'FAN-MAB-002-03',
    timeline: [
      {
        id: 'tl-10',
        action: 'created',
        toStatus: 'open',
        userId: 'user-teacher-01',
        userName: 'Dr. Rajiv Deshpande',
        comment: 'Raised urgent classroom hazard report.',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tl-11',
        action: 'assigned',
        toStatus: 'assigned',
        userId: 'user-admin-01',
        userName: 'Dr. Surekha Patil (Admin)',
        comment: 'Critical priority triage dispatched immediately.',
        timestamp: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tl-12',
        action: 'status_changed',
        fromStatus: 'assigned',
        toStatus: 'in_progress',
        userId: 'user-electrician-01',
        userName: 'Rajesh Kamble',
        comment: 'Isolated room MCB. Dismounting fan motor for stator & capacitor testing.',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'T-2026-0103',
    title: 'Epson Interactive Projector Lamp Failure in Room 101',
    description: 'Overhead projector in Room 101 displays "Lamp Temp Error" warning and shuts down after 2 minutes. BE Project presentations scheduled for tomorrow afternoon.',
    category: 'technical',
    subcategory: 'Projector Display / Bulb',
    priority: 'high',
    status: 'open',
    building: 'Main Academic Block (MAB)',
    floor: 1,
    wing: 'east',
    roomNumber: '101',
    locationDescription: 'Classroom 101 Podium Ceiling Mount',
    reporterId: 'user-student-01',
    reporterName: 'Omkar Sharma',
    reporterEmail: 'omkar.student@college.edu',
    reporterRole: 'Student',
    photoURLs: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'],
    createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    slaDeadline: getSlaDeadline('high'),
    urgencyScore: 78,
    isAutoDetected: false,
    source: 'qr_scan',
    assetTag: 'PROJ-MAB-101-01',
    timeline: [
      {
        id: 'tl-20',
        action: 'created',
        toStatus: 'open',
        userId: 'user-student-01',
        userName: 'Omkar Sharma',
        comment: 'Reported via QR Code sticker scan on podium.',
        timestamp: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'T-2026-0104',
    title: 'AI Vision Alert: 2nd Floor East Corridor LED Tube Light Failure',
    description: 'Gemini Vision AI automatic night CCTV comparison detected dead LED fixtures at position #3 and #7 in East corridor. Main electrical grid is verified operational.',
    category: 'electrical',
    subcategory: 'LED Tube Light',
    priority: 'high',
    status: 'assigned',
    building: 'Main Academic Block (MAB)',
    floor: 2,
    wing: 'east',
    locationDescription: '2nd Floor East Corridor (Between Room 202 and 205)',
    reporterId: 'system-cctv-ai',
    reporterName: 'Gemini CCTV Vision Node #02',
    reporterEmail: 'cctv.ai@college.edu',
    reporterRole: 'System AI Monitor',
    assignedTo: 'user-electrician-01',
    assignedToName: 'Rajesh Kamble (Senior Electrician)',
    assignedDepartment: 'electrical',
    photoURLs: ['https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'],
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    assignedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    slaDeadline: getSlaDeadline('high'),
    urgencyScore: 88,
    isAutoDetected: true,
    source: 'cctv',
    aiAnalysis: 'High confidence (94%) lumen degradation. 2 out of 8 fixtures non-responsive during 02:00 AM nightly scan.',
    timeline: [
      {
        id: 'tl-30',
        action: 'created',
        toStatus: 'open',
        userId: 'system-cctv-ai',
        userName: 'Gemini Vision AI',
        comment: 'Automated defect ticket synthesized from CCTV comparative analysis.',
        timestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tl-31',
        action: 'assigned',
        toStatus: 'assigned',
        userId: 'user-manager-01',
        userName: 'Er. Ramesh Kulkarni (Manager)',
        comment: 'Auto-routed to night shift electrical staff.',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'T-2026-0098',
    title: 'Washroom 1st Floor Flush Valve Jammed',
    description: 'Gents washroom flush valve leaking water continuously into drain.',
    category: 'plumbing',
    subcategory: 'Flush Tank Issue',
    priority: 'medium',
    status: 'resolved',
    building: 'Main Academic Block (MAB)',
    floor: 1,
    wing: 'west',
    roomNumber: '113',
    locationDescription: '1st Floor West Restroom Stall #2',
    reporterId: 'user-student-01',
    reporterName: 'Omkar Sharma',
    reporterEmail: 'omkar.student@college.edu',
    reporterRole: 'Student',
    assignedTo: 'user-plumber-01',
    assignedToName: 'Suresh Patil (Plumbing Tech)',
    assignedDepartment: 'plumbing',
    photoURLs: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'],
    resolvedPhotoURLs: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'],
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    assignedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    slaDeadline: getSlaDeadline('medium'),
    urgencyScore: 45,
    isAutoDetected: false,
    source: 'manual',
    resolutionNotes: 'Replaced faulty rubber diaphragm and calibrated pressure regulator valve. Leak tested successfully.',
    actualCost: 280,
    partsUsed: ['Jaquar Diaphragm Kit', 'Teflon Tape'],
    feedbackRating: 5,
    feedbackComment: 'Repaired very quickly on the same day. Great job!',
    timeline: [
      {
        id: 'tl-40',
        action: 'created',
        toStatus: 'open',
        userId: 'user-student-01',
        userName: 'Omkar Sharma',
        timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      },
      {
        id: 'tl-41',
        action: 'resolved',
        fromStatus: 'in_progress',
        toStatus: 'resolved',
        userId: 'user-plumber-01',
        userName: 'Suresh Patil',
        comment: 'Fixed diaphragm seal and tested water flow.',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

export const useTicketStore = create<TicketStoreState>((set, get) => {
  let initialTickets = INITIAL_TICKETS;
  try {
    const saved = localStorage.getItem(STORAGE_TICKETS_KEY);
    if (saved) {
      initialTickets = JSON.parse(saved);
    }
  } catch {
    initialTickets = INITIAL_TICKETS;
  }

  const persist = (tickets: Ticket[]) => {
    localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));
  };

  return {
    tickets: initialTickets,
    filters: {
      searchQuery: '',
      statusFilter: 'all',
      categoryFilter: 'all',
      priorityFilter: 'all',
      buildingFilter: 'all',
    },

    createTicket: async (params: CreateTicketParams) => {
      const state = get();
      const newId = `T-2026-${String(state.tickets.length + 105).padStart(4, '0')}`;
      const nowIso = new Date().toISOString();

      const newTicket: Ticket = {
        id: newId,
        title: params.title,
        description: params.description,
        category: params.category,
        subcategory: params.subcategory,
        priority: params.priority,
        status: 'open',
        building: params.building,
        floor: params.floor,
        wing: params.wing,
        roomNumber: params.roomNumber,
        locationDescription: params.locationDescription,
        reporterId: params.reporterId,
        reporterName: params.reporterName,
        reporterEmail: params.reporterEmail,
        reporterRole: params.reporterRole,
        photoURLs: params.photoURLs || [],
        createdAt: nowIso,
        slaDeadline: getSlaDeadline(params.priority),
        urgencyScore: params.urgencyScore || 65,
        isAutoDetected: params.isAutoDetected || false,
        source: params.source || 'manual',
        assetId: params.assetId,
        assetTag: params.assetTag,
        aiAnalysis: params.aiAnalysis,
        timeline: [
          {
            id: `tl-${Date.now()}`,
            action: 'created',
            toStatus: 'open',
            userId: params.reporterId,
            userName: params.reporterName,
            userRole: params.reporterRole,
            comment: `Fault registered. SLA targeted for ${new Date(getSlaDeadline(params.priority)).toLocaleTimeString()}.`,
            timestamp: nowIso,
          },
        ],
      };

      const updated = [newTicket, ...state.tickets];
      set({ tickets: updated });
      persist(updated);

      // Dispatch simulated confirmation email with PDF attachment
      sendTransactionalEmail({
        to: params.reporterEmail,
        subject: `[Registered] CampusCare Fault Ticket #${newId}: ${params.title}`,
        template: 'TicketCreated',
        ticket: newTicket,
        hasPdfAttachment: true,
      });

      return newTicket;
    },

    assignTicket: (ticketId: string, assignedToId: string, assignedToName: string, managerName: string) => {
      const state = get();
      const nowIso = new Date().toISOString();

      const updated = state.tickets.map((t) => {
        if (t.id === ticketId) {
          const newTimeline: TimelineEntry = {
            id: `tl-${Date.now()}`,
            action: 'assigned',
            fromStatus: t.status,
            toStatus: 'assigned',
            userId: 'manager-user',
            userName: managerName,
            comment: `Assigned task to technician: ${assignedToName}.`,
            timestamp: nowIso,
          };

          return {
            ...t,
            status: 'assigned' as TicketStatus,
            assignedTo: assignedToId,
            assignedToName,
            assignedAt: nowIso,
            timeline: [...t.timeline, newTimeline],
          };
        }
        return t;
      });

      set({ tickets: updated });
      persist(updated);
    },

    updateTicketStatus: (
      ticketId: string,
      newStatus: TicketStatus,
      userId: string,
      userName: string,
      notes?: string,
      resolvedPhotos?: string[],
      cost?: number,
      parts?: string[]
    ) => {
      const state = get();
      const nowIso = new Date().toISOString();

      const updated = state.tickets.map((t) => {
        if (t.id === ticketId) {
          const newTimeline: TimelineEntry = {
            id: `tl-${Date.now()}`,
            action: newStatus === 'resolved' ? 'resolved' : 'status_changed',
            fromStatus: t.status,
            toStatus: newStatus,
            userId,
            userName,
            comment: notes || `Status transitioned to ${newStatus.toUpperCase().replace('_', ' ')}`,
            timestamp: nowIso,
          };

          return {
            ...t,
            status: newStatus,
            resolutionNotes: notes || t.resolutionNotes,
            resolvedPhotoURLs: resolvedPhotos || t.resolvedPhotoURLs,
            actualCost: cost !== undefined ? cost : t.actualCost,
            partsUsed: parts || t.partsUsed,
            inProgressAt: newStatus === 'in_progress' ? nowIso : t.inProgressAt,
            resolvedAt: newStatus === 'resolved' ? nowIso : t.resolvedAt,
            timeline: [...t.timeline, newTimeline],
          };
        }
        return t;
      });

      set({ tickets: updated });
      persist(updated);
    },

    addTicketComment: (ticketId: string, userId: string, userName: string, comment: string) => {
      const state = get();
      const nowIso = new Date().toISOString();

      const updated = state.tickets.map((t) => {
        if (t.id === ticketId) {
          const entry: TimelineEntry = {
            id: `tl-${Date.now()}`,
            action: 'commented',
            userId,
            userName,
            comment,
            timestamp: nowIso,
          };
          return {
            ...t,
            timeline: [...t.timeline, entry],
          };
        }
        return t;
      });

      set({ tickets: updated });
      persist(updated);
    },

    submitTicketFeedback: (ticketId: string, rating: number, comment?: string) => {
      const state = get();
      const updated = state.tickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            feedbackRating: rating,
            feedbackComment: comment,
          };
        }
        return t;
      });

      set({ tickets: updated });
      persist(updated);
    },

    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      }));
    },

    resetFilters: () => {
      set({
        filters: {
          searchQuery: '',
          statusFilter: 'all',
          categoryFilter: 'all',
          priorityFilter: 'all',
          buildingFilter: 'all',
        },
      });
    },
  };
});
