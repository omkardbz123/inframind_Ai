import { Ticket } from '../types/ticket';
import { COLLEGE_CONFIG } from './constants';

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  template: string;
  sentAt: string;
  hasPdfAttachment: boolean;
  pdfFileName?: string;
  htmlContent: string;
  deliveryStatus?: 'sent_live' | 'simulated' | 'error';
  backendMessage?: string;
}

export const SENT_EMAILS_STORAGE_KEY = 'campuscare_sent_emails';

export function getSentEmails(): SentEmailRecord[] {
  try {
    const raw = localStorage.getItem(SENT_EMAILS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSentEmail(email: SentEmailRecord) {
  const existing = getSentEmails();
  const updated = [email, ...existing].slice(0, 50);
  localStorage.setItem(SENT_EMAILS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('campuscare_email_sent', { detail: email }));
}

/**
 * Check if the built-in Nodemailer service is running and configured
 */
export async function checkMailServerHealth(): Promise<{
  online: boolean;
  configured: boolean;
  senderEmail: string | null;
  message: string;
}> {
  try {
    const res = await fetch('/api/health', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        configured: data.configured,
        senderEmail: data.senderEmail,
        message: data.message,
      };
    }
    return {
      online: false,
      configured: false,
      senderEmail: null,
      message: 'Server responded with non-200 status',
    };
  } catch {
    return {
      online: false,
      configured: false,
      senderEmail: null,
      message: 'Email service initializing...',
    };
  }
}

/**
 * Send a live test email to any address using Nodemailer + Gmail
 */
export async function sendLiveTestEmail(recipientEmail: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: recipientEmail }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to connect: ${err.message || 'Connection error'}`,
    };
  }
}

/**
 * Dispatch transactional email with MIT ACSC Maroon Template Styling
 */
export function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  template:
    | 'TicketCreated'
    | 'TicketAssigned'
    | 'TicketResolved'
    | 'LEDFailureAlert'
    | 'SLABreach'
    | 'PredictiveAlert'
    | 'EmergencySOS'
    | 'DailyDigest';
  ticket?: Ticket;
  customData?: Record<string, any>;
  hasPdfAttachment?: boolean;
}): SentEmailRecord {
  const { to, subject, template, ticket, customData, hasPdfAttachment } = params;

  let bodyHtml = '';

  if (template === 'TicketCreated' && ticket) {
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background-color: #821930; padding: 22px; text-align: center; border-bottom: 3px solid #d97706;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">${COLLEGE_CONFIG.name}</h2>
            <p style="color: #fde68a; margin: 4px 0 0 0; font-size: 12px;">CampusCare Infrastructure & Maintenance Portal</p>
          </div>
          <div style="padding: 24px;">
            <h3 style="color: #821930; margin-top: 0;">Fault Report Registered: #${ticket.id}</h3>
            <p>Dear <strong>${ticket.reporterName}</strong>,</p>
            <p>Your campus fault ticket has been successfully registered and routed to the <strong>${ticket.category.toUpperCase()}</strong> Department.</p>
            
            <div style="background: #fdf2f4; border: 1px solid #f8cfd6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #821930; font-weight: bold; width: 120px;">Location:</td><td><strong>${ticket.building} - Floor ${ticket.floor}, ${ticket.wing.toUpperCase()} Wing (Room ${ticket.roomNumber || 'General'})</strong></td></tr>
                <tr><td style="color: #821930; font-weight: bold;">Subcategory:</td><td><strong>${ticket.subcategory}</strong></td></tr>
                <tr><td style="color: #821930; font-weight: bold;">Priority:</td><td><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${ticket.priority.toUpperCase()}</span></td></tr>
                <tr><td style="color: #821930; font-weight: bold;">SLA Target:</td><td>${new Date(ticket.slaDeadline).toLocaleString('en-IN')}</td></tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #475569;">Description: <em>"${ticket.description}"</em></p>
          </div>
          <div style="background: #f8fafc; padding: 12px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
            MIT Arts, Commerce & Science College, Alandi (D.), Pune - 412105
          </div>
        </div>
      </div>
    `;
  } else if (template === 'TicketAssigned' && ticket) {
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background-color: #1e293b; padding: 22px; text-align: center; border-bottom: 3px solid #3b82f6;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">${COLLEGE_CONFIG.name} — Work Assignment</h2>
            <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px;">Assigned to Technician: ${ticket.assignedToName || 'Campus Technician'}</p>
          </div>
          <div style="padding: 24px;">
            <h3 style="color: #1e293b; margin-top: 0;">New Work Order #${ticket.id}: ${ticket.title}</h3>
            <p>You have been assigned a campus maintenance task.</p>
            
            <div style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #475569; font-weight: bold; width: 120px;">Location:</td><td><strong>${ticket.building} - Floor ${ticket.floor}, ${ticket.wing.toUpperCase()} Wing (Room ${ticket.roomNumber || 'General'})</strong></td></tr>
                <tr><td style="color: #475569; font-weight: bold;">Equipment:</td><td><strong>${ticket.subcategory} (${ticket.category.toUpperCase()})</strong></td></tr>
                <tr><td style="color: #475569; font-weight: bold;">Priority:</td><td><span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${ticket.priority.toUpperCase()}</span></td></tr>
                <tr><td style="color: #475569; font-weight: bold;">SLA Deadline:</td><td><strong style="color: #d97706;">${new Date(ticket.slaDeadline).toLocaleString('en-IN')}</strong></td></tr>
              </table>
            </div>

            <p style="font-size: 13px; color: #475569;">Description: <em>"${ticket.description}"</em></p>
            <p style="font-size: 12px; color: #64748b;">Reported by: ${ticket.reporterName} (${ticket.reporterRole})</p>
          </div>
        </div>
      </div>
    `;
  } else if (template === 'TicketResolved' && ticket) {
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="background-color: #059669; padding: 22px; text-align: center; border-bottom: 3px solid #10b981;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">✅ Problem Resolved — ${COLLEGE_CONFIG.name}</h2>
            <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 12px;">CampusCare Work Order #${ticket.id} Closed</p>
          </div>
          <div style="padding: 24px;">
            <p>Dear <strong>${ticket.reporterName}</strong>,</p>
            <p>Your reported maintenance issue has been inspected and resolved by our campus technician team.</p>
            
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <table style="width: 100%; font-size: 13px;">
                <tr><td style="color: #065f46; font-weight: bold; width: 120px;">Equipment:</td><td><strong>${ticket.subcategory} (${ticket.category.toUpperCase()})</strong></td></tr>
                <tr><td style="color: #065f46; font-weight: bold;">Location:</td><td><strong>${ticket.building} - Floor ${ticket.floor}, Room ${ticket.roomNumber || 'General'}</strong></td></tr>
                <tr><td style="color: #065f46; font-weight: bold;">Resolved By:</td><td><strong>${ticket.assignedToName || 'Campus Technician'}</strong></td></tr>
                <tr><td style="color: #065f46; font-weight: bold;">Resolution Notes:</td><td><em>${ticket.resolutionNotes || 'Repaired and verified operational.'}</em></td></tr>
              </table>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; margin: 16px 0; display: flex; align-items: center; justify-content: space-between;">
              <div style="font-size: 12px; color: #1e293b;">
                <strong>📎 Attached Document:</strong> <span style="font-family: monospace; color: #821930; font-weight: bold;">MIT-ACSC-WorkOrder-${ticket.id}.pdf</span>
                <div style="color: #64748b; font-size: 11px;">Official signed completion record with parts & technician verification</div>
              </div>
            </div>

            <p style="font-size: 13px; color: #065f46; font-weight: bold;">Thank you for helping keep MIT ACSC campus safe and functional!</p>
          </div>
        </div>
      </div>
    `;
  } else if (template === 'LEDFailureAlert') {
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background-color: #991b1b; padding: 18px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px;">🚨 CCTV AI Vision Alert — Corridor LED Failure</h2>
          </div>
          <div style="padding: 24px;">
            <p><strong>Camera Node:</strong> ${customData?.cameraName || 'CAM-MAB-2F-EAST-01'}</p>
            <p><strong>Area:</strong> ${customData?.areaDescription || '2nd Floor East Corridor'}</p>
            <p><strong>Gemini Vision Verdict:</strong> <span style="color: #dc2626; font-weight: bold;">LED Tube Light Failure Confirmed (Confidence: ${customData?.confidence || '96%'})</span></p>
            
            <div style="background: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #ef4444; margin: 16px 0;">
              <strong>Automated Work Order Generated:</strong> #${customData?.ticketId || 'T-AUTO-2026'}<br/>
              <span style="font-size: 12px; color: #64748b;">Routed to: Rajesh Kamble (Senior Electrician)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    bodyHtml = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #821930; margin-top: 0;">${COLLEGE_CONFIG.name} — CampusCare System Notice</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${customData?.message || 'A campus maintenance event has been recorded in the Smart Campus portal.'}</p>
      </div>
    `;
  }

  const record: SentEmailRecord = {
    id: `EMAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    to,
    subject,
    template,
    sentAt: new Date().toISOString(),
    hasPdfAttachment: !!hasPdfAttachment,
    pdfFileName: hasPdfAttachment && ticket ? `MIT-ACSC-WorkOrder-${ticket.id}.pdf` : undefined,
    htmlContent: bodyHtml,
    deliveryStatus: 'simulated',
  };

  saveSentEmail(record);

  // Send live email via API
  fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      subject,
      html: bodyHtml,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        record.deliveryStatus = 'sent_live';
        record.backendMessage = `Delivered via Google SMTP: ${data.messageId}`;
        saveSentEmail(record);
      }
    })
    .catch(() => {
      console.log('[Email Status]: Simulator mode active.');
    });

  return record;
}
