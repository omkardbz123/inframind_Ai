export type NotificationType =
  | 'ticket_created'
  | 'ticket_assigned'
  | 'ticket_status'
  | 'ticket_resolved'
  | 'cctv_alert'
  | 'predictive_maintenance'
  | 'sla_breach'
  | 'emergency_sos';

export interface AppNotification {
  id: string;
  userId: string; // Recipient UID or 'broadcast'
  title: string;
  message: string;
  type: NotificationType;
  linkedTicketId?: string;
  linkedCameraId?: string;
  linkedAssetId?: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}
