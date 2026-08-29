import { DepartmentType } from './user';
import { WingType } from './location';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'pending_review'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type FaultSource = 'manual' | 'cctv' | 'qr_scan' | 'voice';

export interface TimelineEntry {
  id: string;
  action:
    | 'created'
    | 'assigned'
    | 'status_changed'
    | 'commented'
    | 'photo_added'
    | 'escalated'
    | 'resolved'
    | 'reopened';
  fromStatus?: TicketStatus;
  toStatus?: TicketStatus;
  userId: string;
  userName: string;
  userRole?: string;
  comment?: string;
  timestamp: string;
}

export interface Ticket {
  id: string; // e.g. "T-2026-0104"
  title: string;
  description: string;
  category: DepartmentType;
  subcategory: string; // e.g. "LED Light", "Ceiling Fan", "Water Purifier", "Projector"
  priority: TicketPriority;
  status: TicketStatus;

  // Location Details
  building: string;
  floor: number;
  wing: WingType;
  roomNumber?: string;
  locationDescription?: string;

  // Reporter & Assigned Person
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterRole: string;
  assignedTo?: string; // UID of employee
  assignedToName?: string;
  assignedDepartment?: DepartmentType;

  // Media
  photoURLs: string[];
  resolvedPhotoURLs?: string[];

  // Timestamps (ISO String)
  createdAt: string;
  assignedAt?: string;
  inProgressAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDeadline: string;

  // AI & Automation Metadata
  aiAnalysis?: string;
  urgencyScore: number; // 0 - 100
  isAutoDetected: boolean;
  source: FaultSource;
  assetId?: string;
  assetTag?: string;

  // Resolution Details
  resolutionNotes?: string;
  costEstimate?: number;
  actualCost?: number;
  partsUsed?: string[];
  feedbackRating?: number; // 1 - 5 stars
  feedbackComment?: string;

  // Timeline History
  timeline: TimelineEntry[];
}
