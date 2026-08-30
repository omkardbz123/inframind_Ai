import jsPDF from 'jspdf';
import { Ticket } from '../types/ticket';
import { COLLEGE_CONFIG } from './constants';

/**
 * Robustly converts any image URL (data URI, PNG, JPEG, WEBP, or remote URL)
 * into a guaranteed valid JPEG Data URI for jsPDF.
 */
async function getSafeJpegDataUri(url: string): Promise<string | null> {
  if (!url) return null;

  return new Promise((resolve) => {
    const img = new Image();
    // Enable CORS for remote assets
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Standardize dimensions for high-DPI PDF rendering
        const width = img.naturalWidth || img.width || 600;
        const height = img.naturalHeight || img.height || 450;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        // Fill solid white background in case of transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Export strictly as JPEG Data URI
        const jpegUri = canvas.toDataURL('image/jpeg', 0.9);
        resolve(jpegUri);
      } catch (err) {
        // If canvas is tainted by CORS, check if it's already a Data URI
        if (url.startsWith('data:image')) {
          resolve(url);
        } else {
          resolve(null);
        }
      }
    };

    img.onerror = () => {
      // If image failed to load (e.g. offline or CORS blocked), return original data URI if available
      if (url.startsWith('data:image')) {
        resolve(url);
      } else {
        resolve(null);
      }
    };

    img.src = url;
  });
}

export async function generateTicketReportPDF(ticket: Ticket): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 16;

  // Header Banner Background: MIT ACSC Deep Maroon #800020
  doc.setFillColor(128, 0, 32);
  doc.rect(0, 0, pageWidth, 44, 'F');

  // Accent Line: Warm Gold #D97706
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 44, pageWidth, 2.5, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text("MAEER's MIT ARTS, COMMERCE & SCIENCE COLLEGE", pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(254, 205, 211); // Rose-200
  doc.text('Alandi (D.), Pune - 412105 | Campus Facilities & Infrastructure Directorate', pageWidth / 2, y, {
    align: 'center',
  });

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(253, 230, 138); // Warm Gold
  doc.text(
    `Official Work Order Slip: MIT-ACSC-${ticket.id} | Generated: ${new Date().toLocaleString('en-IN')}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // Body content starts
  y = 53;

  // Title Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const maxTitleWidth = pageWidth - 28 - 48;
  const titleLines = doc.splitTextToSize(`Work Order #${ticket.id}: ${ticket.title}`, maxTitleWidth);
  const headerCardHeight = Math.max(22, 12 + titleLines.length * 5.5);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, y, pageWidth - 28, headerCardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, headerCardHeight, 2, 2, 'D');

  doc.setTextColor(128, 0, 32);
  doc.text(titleLines, 20, y + 7);

  const metaY = y + 7 + titleLines.length * 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Priority: ${ticket.priority.toUpperCase()}   |   Status: ${ticket.status.toUpperCase().replace('_', ' ')}   |   Department: ${ticket.category.toUpperCase()}`,
    20,
    metaY
  );

  // Status Color Pill
  const isResolved = ticket.status === 'resolved';
  const statusColor = isResolved ? [22, 163, 74] : ticket.priority === 'critical' ? [220, 38, 38] : [128, 0, 32];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 54, y + 6, 36, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(ticket.status.toUpperCase().replace('_', ' '), pageWidth - 36, y + 12, { align: 'center' });

  y += headerCardHeight + 5;

  // Two Column Details Box
  const colW = (pageWidth - 32) / 2;

  // Left Column: Location & Reporter
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, y, colW, 52, 2, 2, 'D');
  doc.setFillColor(253, 242, 244);
  doc.rect(14, y, colW, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(128, 0, 32);
  doc.text('CAMPUS LOCATION & REPORTER DETAILS', 18, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  let leftY = y + 12;
  doc.text(`Building: ${ticket.building}`, 18, leftY);
  leftY += 5.8;
  doc.text(`Floor & Wing: Floor ${ticket.floor}, ${ticket.wing.toUpperCase()} Wing`, 18, leftY);
  leftY += 5.8;
  doc.text(`Room: ${ticket.roomNumber || 'General Area'}`, 18, leftY);
  leftY += 5.8;
  doc.text(`Reported By: ${ticket.reporterName} (${ticket.reporterRole.toUpperCase()})`, 18, leftY);
  leftY += 5.8;
  doc.text(`Email: ${ticket.reporterEmail || '5454317@mitacsc.edu.in'}`, 18, leftY);
  leftY += 5.8;
  doc.text(`Logged: ${new Date(ticket.createdAt).toLocaleString('en-IN')}`, 18, leftY);

  // Right Column: Assignment & SLA
  const rightX = 14 + colW + 4;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX, y, colW, 52, 2, 2, 'D');
  doc.setFillColor(253, 242, 244);
  doc.rect(rightX, y, colW, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(128, 0, 32);
  doc.text('TECHNICAL ASSIGNMENT & SLA', rightX + 4, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  let rightY = y + 12;
  doc.text(`Assigned Technician: ${ticket.assignedToName || 'In Triage Queue'}`, rightX + 4, rightY);
  rightY += 5.8;
  doc.text(`Department: ${ticket.category.toUpperCase()}`, rightX + 4, rightY);
  rightY += 5.8;
  doc.text(`Target SLA: ${new Date(ticket.slaDeadline).toLocaleString('en-IN')}`, rightX + 4, rightY);
  rightY += 5.8;
  doc.text(`AI Urgency: ${ticket.urgencyScore} / 100`, rightX + 4, rightY);
  rightY += 5.8;
  doc.text(`Source: ${ticket.source.toUpperCase()}${ticket.isAutoDetected ? ' (Vision AI)' : ''}`, rightX + 4, rightY);
  rightY += 5.8;
  doc.text(`Asset Tag: ${ticket.assetTag || 'General Fixture'}`, rightX + 4, rightY);

  y += 57;

  // Fault Description Section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('REPORTED PROBLEM DESCRIPTION', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(ticket.description || 'Standard fault report.', pageWidth - 36);
  doc.text(splitDesc, 18, y + 10.5);

  y += 26;

  // Resolution Summary Section (if resolved)
  if (ticket.resolutionNotes || isResolved) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text('TECHNICIAN COMPLETION & RESOLUTION REPORT', 18, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text(`Action: ${ticket.resolutionNotes || 'Repaired and tested operational.'}`, 18, y + 10.5);
    doc.text(
      `Parts Used: ${ticket.partsUsed?.join(', ') || 'Standard spares'}   |   Actual Repair Cost: INR ${ticket.actualCost || 0}`,
      18,
      y + 15.5
    );

    y += 24;
  }

  // --- EMBED BOTH FAULT & RESOLUTION PHOTOS ---
  const faultPhotoUrl = ticket.photoURLs && ticket.photoURLs.length > 0 ? ticket.photoURLs[0] : null;
  const resolvedPhotoUrl =
    ticket.resolvedPhotoURLs && ticket.resolvedPhotoURLs.length > 0 ? ticket.resolvedPhotoURLs[0] : null;

  let faultBase64: string | null = null;
  let resolvedBase64: string | null = null;

  if (faultPhotoUrl) {
    faultBase64 = await getSafeJpegDataUri(faultPhotoUrl);
  }
  if (resolvedPhotoUrl) {
    resolvedBase64 = await getSafeJpegDataUri(resolvedPhotoUrl);
  }

  const hasAnyPhoto = Boolean(faultBase64 || resolvedBase64);

  if (hasAnyPhoto) {
    // Check if photos fit on Page 1 or create Page 2
    if (y + 60 > pageHeight - 35) {
      doc.addPage();
      y = 16;

      // Page 2 Header
      doc.setFillColor(128, 0, 32);
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`MIT ACSC Work Order #${ticket.id} — Photographic Evidence Attachment`, pageWidth / 2, y - 4, {
        align: 'center',
      });
      y = 28;
    }

    const photoBoxWidth = colW;
    const photoBoxHeight = 54;
    const imgHeight = 38;
    const imgWidth = photoBoxWidth - 8;

    // 1. Fault Photo (Left Box)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, y, photoBoxWidth, photoBoxHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, photoBoxWidth, photoBoxHeight, 2, 2, 'D');

    doc.setFillColor(253, 242, 244);
    doc.rect(14, y, photoBoxWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(128, 0, 32);
    doc.text(`1. FAULT PHOTO (${ticket.reporterRole.toUpperCase()})`, 18, y + 4.5);

    if (faultBase64) {
      try {
        const format = faultBase64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(faultBase64, format, 18, y + 9, imgWidth, imgHeight);
      } catch (err) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('Photo attached to ticket system.', 18, y + 25);
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('No fault photo attached at logging.', 18, y + 25);
    }

    // 2. Resolution Proof Photo (Right Box)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(rightX, y, photoBoxWidth, photoBoxHeight, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(rightX, y, photoBoxWidth, photoBoxHeight, 2, 2, 'D');

    doc.setFillColor(240, 253, 244);
    doc.rect(rightX, y, photoBoxWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text('2. RESOLUTION PROOF (TECHNICIAN)', rightX + 4, y + 4.5);

    if (resolvedBase64) {
      try {
        const format = resolvedBase64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(resolvedBase64, format, rightX + 4, y + 9, imgWidth, imgHeight);
      } catch (err) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('Resolution photo attached to ticket.', rightX + 4, y + 25);
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        isResolved ? 'Resolved (No photo submitted)' : 'Pending technician on-site resolution',
        rightX + 4,
        y + 25
      );
    }

    y += photoBoxHeight + 6;
  }

  // Verification & Sign-off Signatures
  if (y + 24 > pageHeight - 15) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 14, 65, y + 14);
  doc.line(pageWidth - 65, y + 14, pageWidth - 14, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Technician Signature', 16, y + 18);
  doc.text('Estate Manager / Principal Sign-off', pageWidth - 65, y + 18);

  // Bottom Notice
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "MAEER's MIT ACSC CampusCare Platform • Alandi (D.), Pune 412105 • Official Infrastructure Maintenance Slip",
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  return doc;
}

export async function downloadTicketReportPDF(ticket: Ticket) {
  const doc = await generateTicketReportPDF(ticket);
  doc.save(`MIT-ACSC-WorkOrder-${ticket.id}.pdf`);
}

export async function generateTicketReportPDFDataUri(ticket: Ticket): Promise<string> {
  const doc = await generateTicketReportPDF(ticket);
  return doc.output('datauristring');
}
