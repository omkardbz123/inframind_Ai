import jsPDF from 'jspdf';
import { Ticket } from '../types/ticket';
import { COLLEGE_CONFIG } from './constants';

export function generateTicketReportPDF(ticket: Ticket): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner Background: MIT ACSC Deep Maroon
  doc.setFillColor(130, 25, 48); // Maroon #821930
  doc.rect(0, 0, pageWidth, 44, 'F');

  // Accent Line: Gold
  doc.setFillColor(217, 119, 6); // Amber Gold
  doc.rect(0, 44, pageWidth, 2.5, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("MAEER's MIT ARTS, COMMERCE & SCIENCE COLLEGE", pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(254, 205, 211); // Rose-200
  doc.text('Alandi (D.), Pune - 412105 | Campus Facilities Management Directorate', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(8.5);
  doc.setTextColor(253, 230, 138); // Warm Gold
  doc.text(`Official Work Order Ref: MIT-ACSC-${ticket.id} | Timestamp: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, y, { align: 'center' });

  // Body content starts
  y = 58;

  // Status Badge Block (Clean White with Maroon border)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(130, 25, 48); // Maroon text
  doc.text(`Work Order #${ticket.id}: ${ticket.title}`, 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Priority: ${ticket.priority.toUpperCase()}   |   Status: ${ticket.status.toUpperCase().replace('_', ' ')}   |   Department: ${ticket.category.toUpperCase()}`, 20, y + 16);

  // Status Color Pill on Right
  const statusColor = ticket.status === 'resolved' ? [22, 163, 74] : ticket.priority === 'critical' ? [220, 38, 38] : [130, 25, 48];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 55, y + 5, 36, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(ticket.status.toUpperCase(), pageWidth - 37, y + 11.5, { align: 'center' });

  y += 30;

  // Two Column Details Box
  const colW = (pageWidth - 32) / 2;

  // Left Column: Location & Reporter
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, y, colW, 60, 2, 2, 'D');
  doc.setFillColor(253, 242, 244); // Maroon-50
  doc.rect(14, y, colW, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(130, 25, 48);
  doc.text('CAMPUS LOCATION & REPORTER DETAILS', 18, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let leftY = y + 14;
  doc.text(`Building: ${ticket.building}`, 18, leftY);
  leftY += 7;
  doc.text(`Floor & Wing: Floor ${ticket.floor}, ${ticket.wing.toUpperCase()} Wing`, 18, leftY);
  leftY += 7;
  doc.text(`Room / Sector: ${ticket.roomNumber || 'General Corridor / Area'}`, 18, leftY);
  leftY += 7;
  doc.text(`Reported By: ${ticket.reporterName} (${ticket.reporterRole})`, 18, leftY);
  leftY += 7;
  doc.text(`Contact: ${ticket.reporterEmail}`, 18, leftY);
  leftY += 7;
  doc.text(`Recorded Date: ${new Date(ticket.createdAt).toLocaleString('en-IN')}`, 18, leftY);

  // Right Column: Assignment & SLA
  const rightX = 14 + colW + 4;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX, y, colW, 60, 2, 2, 'D');
  doc.setFillColor(253, 242, 244);
  doc.rect(rightX, y, colW, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(130, 25, 48);
  doc.text('TECHNICAL ASSIGNMENT & SLA SLA TARGET', rightX + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  let rightY = y + 14;
  doc.text(`Assigned Technician: ${ticket.assignedToName || 'In Triage Queue'}`, rightX + 4, rightY);
  rightY += 7;
  doc.text(`Department: ${ticket.category.toUpperCase()}`, rightX + 4, rightY);
  rightY += 7;
  doc.text(`SLA Target Deadline: ${new Date(ticket.slaDeadline).toLocaleString('en-IN')}`, rightX + 4, rightY);
  rightY += 7;
  doc.text(`AI Risk Index: ${ticket.urgencyScore} / 100`, rightX + 4, rightY);
  rightY += 7;
  doc.text(`Source: ${ticket.source.toUpperCase()}${ticket.isAutoDetected ? ' (Gemini Vision AI)' : ''}`, rightX + 4, rightY);
  rightY += 7;
  doc.text(`Asset Tag: ${ticket.assetTag || 'General Fixture'}`, rightX + 4, rightY);

  y += 68;

  // Fault Description Section
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('REPORTED SYMPTOMS & ISSUE DIAGNOSTIC', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const splitDesc = doc.splitTextToSize(ticket.description || 'Standard inspection report logged.', pageWidth - 36);
  doc.text(splitDesc, 18, y + 12);

  if (ticket.aiAnalysis) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(130, 25, 48);
    doc.text(`AI Diagnostic Note: ${ticket.aiAnalysis}`, 18, y + 25);
  }

  y += 36;

  // Resolution Notes (if available)
  if (ticket.resolutionNotes || ticket.status === 'resolved') {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text('TECHNICIAN COMPLETION & REPAIR SUMMARY', 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(21, 128, 61);
    doc.text(`Action Performed: ${ticket.resolutionNotes || 'Repaired and verified operational by technician.'}`, 18, y + 13);
    doc.text(`Parts Used: ${ticket.partsUsed?.join(', ') || 'Standard spares from inventory'}   |   Actual Repair Cost: INR ${ticket.actualCost || 0}`, 18, y + 20);

    y += 32;
  }

  // Verification & Sign-off Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 16, 65, y + 16);
  doc.line(pageWidth - 65, y + 16, pageWidth - 14, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Technician Signature', 16, y + 21);
  doc.text('Estate Manager / Principal Sign-off', pageWidth - 65, y + 21);

  // Bottom Notice
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('MIT ACSC CampusCare Platform — Alandi (D.), Pune 412105', pageWidth / 2, 287, { align: 'center' });

  return doc;
}

export function downloadTicketReportPDF(ticket: Ticket) {
  const doc = generateTicketReportPDF(ticket);
  doc.save(`MIT-ACSC-WorkOrder-${ticket.id}.pdf`);
}
