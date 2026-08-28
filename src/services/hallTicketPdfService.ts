/**
 * Centralized SSIU ERP-Wide Examination Hall Ticket PDF Generator Service
 * Generates an official University Examination Hall Ticket / Admit Card on A4 PORTRAIT (1 Page, 210mm x 297mm).
 * Print-ready with passport photo container, barcode, schedule table, candidate instructions, and official authorization seals.
 * Opens directly in a new browser tab via native browser PDF viewer.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HallTicketData } from '../types/hallTicket';
import { SWARRNIM_LOGO_PNG_BASE64 } from '../assets/logoBase64';

/**
 * 1. Single Hall Ticket PDF Generator (1 Page A4 Portrait)
 */
export async function generateHallTicketPDF(ticket: HallTicketData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  renderSingleHallTicketPage(doc, ticket);

  const arrayBuffer = doc.output('arraybuffer');
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

/**
 * 2. Multi-Student Bulk Hall Tickets PDF Generator (Each student on EXACTLY ONE A4 Portrait page)
 */
export async function generateBulkHallTicketsPDF(tickets: HallTicketData[]): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  tickets.forEach((ticket, index) => {
    if (index > 0) {
      doc.addPage('a4', 'portrait');
    }
    renderSingleHallTicketPage(doc, ticket);
  });

  const arrayBuffer = doc.output('arraybuffer');
  return new Blob([arrayBuffer], { type: 'application/pdf' });
}

/**
 * Core Renderer: Draws one complete official Hall Ticket on the current jsPDF page (210mm x 297mm)
 */
export function renderSingleHallTicketPage(doc: jsPDF, ticket: HallTicketData): void {
  const pageWidth = 210;
  const marginX = 8;
  const contentWidth = pageWidth - (marginX * 2); // 194mm
  const startX = marginX;
  const startY = 8;

  const brandNavy: [number, number, number] = [15, 44, 89]; // #0F2C59
  const brandOrange: [number, number, number] = [243, 112, 35]; // #F37023
  const textDark: [number, number, number] = [15, 23, 42]; // #0F172A
  const textMuted: [number, number, number] = [100, 116, 139]; // #64748B
  const borderCol: [number, number, number] = [148, 163, 184]; // #94A3B8

  let curY = startY;

  // ─── 1. HEADER SECTION (Logo + University Name + Subtitle) ────────────
  try {
    if (SWARRNIM_LOGO_PNG_BASE64) {
      doc.addImage(SWARRNIM_LOGO_PNG_BASE64, 'PNG', startX + 2, curY + 1, 20, 10);
    }
  } catch {
    // Fallback if logo fails
  }

  // University Header Texts
  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('SWARRNIM STARTUP & INNOVATION UNIVERSITY', startX + 25, curY + 4);

  doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
  doc.setFontSize(7.5);
  doc.text('EXAMINATION SECTION • CONTROLLER OF EXAMINATIONS', startX + 25, curY + 7.8);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('Bhoyan Rathod, Opp. IFFCO, Gandhinagar–382420, Gujarat, India • www.swarrnim.edu.in', startX + 25, curY + 11);

  // Far Right: Academic Session Badge
  doc.setFillColor(239, 246, 255); // #EFF6FF
  doc.setDrawColor(59, 130, 246); // #3B82F6
  doc.setLineWidth(0.3);
  doc.roundedRect(startX + contentWidth - 42, curY + 1, 40, 9.5, 0.8, 0.8, 'FD');

  doc.setTextColor(29, 78, 216); // #1D4ED8
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(ticket.examSession || 'Summer 2026', startX + contentWidth - 22, curY + 4.8, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(5.5);
  doc.text(`AY: ${ticket.academicYear || '2025-2026'}`, startX + contentWidth - 22, curY + 8.5, { align: 'center' });

  curY += 13.5;

  // Thin Header Divider
  doc.setDrawColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.setLineWidth(0.35);
  doc.line(startX, curY, startX + contentWidth, curY);
  curY += 1.5;

  // ─── 2. DOCUMENT TITLE BANNER ──────────────────────────────────────────
  doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.roundedRect(startX, curY, contentWidth, 5.5, 0.6, 0.6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('EXAMINATION HALL TICKET / ADMIT CARD', startX + (contentWidth / 2), curY + 3.8, { align: 'center' });

  curY += 7;

  // ─── 3. STUDENT MASTER DETAILS + PASSPORT PHOTO BOX ───────────────────
  const photoBoxWidth = 26;
  const photoBoxHeight = 32;
  const infoTableWidth = contentWidth - photoBoxWidth - 3; // 194 - 26 - 3 = 165mm

  const studentRows = [
    ['Candidate Name:', ticket.studentName || '-', 'Enrollment No:', ticket.enrollmentNo || '-'],
    ['Program & Branch:', `${ticket.programName || '-'}${ticket.departmentName ? ` (${ticket.departmentName})` : ''}`, 'Admission / GR No:', ticket.admissionNo || ticket.grNo || '-'],
    ['Institute Name:', ticket.instituteName || 'Swarrnim Institute of Technology', 'Semester / Term:', ticket.semesterName || 'Semester 4'],
    ['Division / Batch:', `${ticket.division || 'Div-A'} • ${ticket.batch || 'Batch 2024-28'}`, 'Gender / Category:', `${ticket.gender || 'Male'} • Regular`]
  ];

  autoTable(doc, {
    startY: curY,
    margin: { left: startX },
    tableWidth: infoTableWidth,
    theme: 'grid',
    styles: {
      fontSize: 6.2,
      cellPadding: 1.2,
      lineColor: borderCol,
      lineWidth: 0.18,
      textColor: textDark,
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 26, textColor: textMuted },
      1: { cellWidth: 60, fontStyle: 'bold', textColor: brandNavy },
      2: { cellWidth: 26, textColor: textMuted },
      3: { cellWidth: 53, fontStyle: 'bold' }
    },
    body: studentRows
  });

  // Render Passport Photo Container on Far Right
  const photoX = startX + infoTableWidth + 3;
  const photoY = curY;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.setLineWidth(0.3);
  doc.rect(photoX, photoY, photoBoxWidth, photoBoxHeight, 'FD');

  let photoRendered = false;
  if (ticket.photoUrl && ticket.photoUrl.startsWith('data:image')) {
    try {
      const format = ticket.photoUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(ticket.photoUrl, format, photoX + 0.5, photoY + 0.5, photoBoxWidth - 1, photoBoxHeight - 1);
      photoRendered = true;
    } catch {
      photoRendered = false;
    }
  }

  if (!photoRendered) {
    // Clean Official Passport Photo Placeholder
    doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.rect(photoX + 1.5, photoY + 1.5, photoBoxWidth - 3, photoBoxHeight - 3);
    doc.setLineDashPattern([], 0);

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text('AFFIX', photoX + (photoBoxWidth / 2), photoY + 12, { align: 'center' });
    doc.text('PASSPORT', photoX + (photoBoxWidth / 2), photoY + 16, { align: 'center' });
    doc.text('PHOTO', photoX + (photoBoxWidth / 2), photoY + 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.5);
    doc.text('(Duly Verified)', photoX + (photoBoxWidth / 2), photoY + 26, { align: 'center' });
  }

  curY = Math.max((doc as any).lastAutoTable?.finalY ?? curY + 30, photoY + photoBoxHeight) + 2;

  // ─── 4. EXAMINATION EVENT & CENTRE DETAILS GRID ───────────────────────
  const examDetailsRows = [
    [
      'Exam Event:', ticket.examName || 'End Semester Examination Summer 2026',
      'Hall Ticket No:', ticket.hallTicketNo || 'HT-2026-001'
    ],
    [
      'Exam Centre:', `${ticket.centreName || 'Swarrnim Central Examination Centre'} (Code: ${ticket.centreCode || 'SSIU-EX-01'})`,
      'Seat / Exam No:', ticket.examSeatNo || 'SEAT-001'
    ],
    [
      'Reporting Time:', ticket.reportingTime || '09:45 AM (Morning) / 01:45 PM (Afternoon)',
      'Exam Timing:', `${ticket.examStartTime || '10:30 AM'} to ${ticket.examEndTime || '01:30 PM'}`
    ]
  ];

  autoTable(doc, {
    startY: curY,
    margin: { left: startX },
    tableWidth: contentWidth,
    theme: 'grid',
    styles: {
      fontSize: 6.2,
      cellPadding: 1.1,
      lineColor: borderCol,
      lineWidth: 0.18,
      textColor: textDark,
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 26, textColor: textMuted },
      1: { cellWidth: 88, fontStyle: 'bold' },
      2: { cellWidth: 26, textColor: textMuted },
      3: { cellWidth: 54, fontStyle: 'bold', textColor: brandOrange }
    },
    didParseCell: (data) => {
      // Highlight Seat No cell
      if (data.row.index === 1 && data.column.index === 3) {
        data.cell.styles.fillColor = [255, 247, 237]; // #FFF7ED
      }
    },
    body: examDetailsRows
  });

  curY = ((doc as any).lastAutoTable?.finalY ?? curY + 22) + 2.5;

  // ─── 5. SUBJECT / EXAMINATION SCHEDULE TABLE ─────────────────────────
  const scheduleTableBody = (ticket.subjects || []).map((sub, idx) => [
    String(sub.sr || idx + 1),
    sub.subjectCode || '-',
    sub.subjectName || 'Theory Subject',
    sub.examDate || '-',
    sub.examDay || '-',
    sub.examTime || `${ticket.examStartTime} - ${ticket.examEndTime}`,
    sub.roomNo || 'Room 101',
    sub.seatNo || ticket.examSeatNo,
    '' // Space for Invigilator's Initial
  ]);

  autoTable(doc, {
    startY: curY,
    margin: { left: startX },
    tableWidth: contentWidth,
    theme: 'grid',
    head: [['Sr.', 'Code', 'Subject / Paper Title', 'Exam Date', 'Day', 'Timing', 'Room / Block', 'Seat No.', 'Invigilator Sign']],
    headStyles: {
      fillColor: [30, 58, 95], // #1E3A5F
      textColor: [255, 255, 255],
      fontSize: 6.2,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.2
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 16, halign: 'center', fontStyle: 'bold', textColor: brandNavy },
      2: { cellWidth: 58, halign: 'left', fontStyle: 'bold' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 26, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 18, halign: 'center' }
    },
    styles: {
      fontSize: 6,
      cellPadding: 1.1,
      lineColor: borderCol,
      lineWidth: 0.18,
      textColor: textDark,
      font: 'helvetica'
    },
    body: scheduleTableBody
  });

  curY = ((doc as any).lastAutoTable?.finalY ?? curY + 35) + 2.5;

  // ─── 6. IMPORTANT INSTRUCTIONS FOR CANDIDATES ────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.setLineWidth(0.2);
  doc.rect(startX, curY, contentWidth, 24, 'FD');

  doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.text('IMPORTANT INSTRUCTIONS FOR CANDIDATES (EXAMINATION REGULATIONS):', startX + 3, curY + 3.2);

  const instructions = ticket.instructions || [
    '1. Carry this printed Hall Ticket along with your Valid University Student ID Card to every examination session.',
    '2. Report at the examination centre at least 30 minutes prior to exam commencement. No entry allowed after 30 mins from start.',
    '3. Mobile phones, smart watches, programmable calculators, Bluetooth devices, and unauthorized papers are strictly prohibited.',
    '4. Verify question paper code and fill roll number, subject code & barcode accurately on answer booklet before writing.',
    '5. Maintain silence and discipline. Any candidate found adopting unfair means (UFM) will face immediate disciplinary action.',
    '6. Candidates are not allowed to leave the examination hall before half time duration has elapsed.'
  ];

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);

  let instY = curY + 6.5;
  instructions.slice(0, 6).forEach((inst) => {
    doc.text(inst, startX + 3, instY);
    instY += 2.8;
  });

  curY += 26.5;

  // ─── 7. SIGNATURES & OFFICIAL SEALS (3 Equal Columns) ─────────────────
  const sigColWidth = contentWidth / 3;

  // Col 1: Candidate Signature
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.2);
  doc.line(startX + 4, curY + 11, startX + sigColWidth - 4, curY + 11);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.text(ticket.studentSignLabel || "Candidate's Signature", startX + (sigColWidth / 2), curY + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('(In presence of Invigilator on Day 1)', startX + (sigColWidth / 2), curY + 16.8, { align: 'center' });

  // Col 2: Centre Superintendent
  doc.line(startX + sigColWidth + 4, curY + 11, startX + (sigColWidth * 2) - 4, curY + 11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.text(ticket.superintendentLabel || 'Centre Superintendent Signature', startX + sigColWidth + (sigColWidth / 2), curY + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('& Examination Centre Seal', startX + sigColWidth + (sigColWidth / 2), curY + 16.8, { align: 'center' });

  // Col 3: Controller of Examinations
  doc.line(startX + (sigColWidth * 2) + 4, curY + 11, startX + contentWidth - 4, curY + 11);
  doc.setTextColor(4, 120, 87); // Green #047857
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.text('OFFICIALLY AUTHENTICATED', startX + (sigColWidth * 2) + (sigColWidth / 2), curY + 8.8, { align: 'center' });

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(5.8);
  doc.text(ticket.coeLabel || 'Controller of Examinations • SSIU', startX + (sigColWidth * 2) + (sigColWidth / 2), curY + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Swarrnim Startup & Innovation University', startX + (sigColWidth * 2) + (sigColWidth / 2), curY + 16.8, { align: 'center' });

  curY += 19;

  // ─── 8. BOTTOM VERIFICATION FOOTER ───────────────────────────────────
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.18);
  doc.line(startX, curY, startX + contentWidth, curY);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.text(
    `* ${ticket.officialDisclaimer || 'Official Computer-Generated University Hall Ticket. Valid with University ID Card.'} *`,
    startX + (contentWidth / 2),
    curY + 3,
    { align: 'center' }
  );

  doc.setFontSize(4.5);
  doc.text(
    `Document ID: ${ticket.hallTicketNo} • Generated on: ${ticket.generatedDate || new Date().toLocaleString('en-IN')} • SSIU Examination Portal`,
    startX + (contentWidth / 2),
    curY + 5.5,
    { align: 'center' }
  );

  // ─── 9. OUTER BORDER BOX ─────────────────────────────────────────────
  const totalBoxHeight = (curY + 7.5) - startY;
  doc.setDrawColor(brandNavy[0], brandNavy[1], brandNavy[2]);
  doc.setLineWidth(0.4);
  doc.rect(startX, startY, contentWidth, totalBoxHeight);
}

/**
 * 3. Open Hall Ticket PDF in a New Tab with Popup-Blocker Fallback
 */
export async function openHallTicketPDF(ticket: HallTicketData): Promise<string> {
  console.log('Hall ticket data:', ticket);
  console.log('Generating Hall Ticket PDF in A4 Portrait...');

  try {
    const pdfBlob = await generateHallTicketPDF(ticket);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    console.log('Hall Ticket PDF URL:', pdfUrl);

    // Open in new browser tab
    const newTab = window.open(pdfUrl, '_blank');

    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      // Fallback 1: programmatic anchor click
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fallback 2: show toast
      showHallTicketPopupToast(pdfUrl, ticket.hallTicketNo, ticket.studentName);
    }

    return pdfUrl;
  } catch (error) {
    console.error('Hall Ticket PDF generation failed:', error);
    showHallTicketErrorToast(error);
    throw error;
  }
}

/**
 * 4. Download Hall Ticket PDF
 */
export async function downloadHallTicketPDF(ticket: HallTicketData, filename?: string): Promise<void> {
  try {
    const pdfBlob = await generateHallTicketPDF(ticket);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const safeName = filename || `HallTicket_${ticket.enrollmentNo || 'Student'}_${(ticket.examCode || 'EXAM').replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error('Download Hall Ticket PDF failed:', error);
    showHallTicketErrorToast(error);
  }
}

/**
 * 5. Download Bulk Hall Tickets PDF
 */
export async function downloadBulkHallTicketsPDF(tickets: HallTicketData[], filename?: string): Promise<void> {
  try {
    const pdfBlob = await generateBulkHallTicketsPDF(tickets);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const safeName = filename || `BulkHallTickets_${tickets.length}_Students.pdf`;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error('Download Bulk Hall Tickets failed:', error);
    showHallTicketErrorToast(error);
  }
}

/**
 * Toast UI Helper if popup blocker triggered
 */
function showHallTicketPopupToast(pdfUrl: string, hallTicketNo: string, studentName: string): void {
  const toastId = 'ssiu-hall-ticket-toast';
  const existing = document.getElementById(toastId);
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0F2C59;
    color: #FFFFFF;
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    border: 1.5px solid #F37023;
  `;

  toast.innerHTML = `
    <span>🎫 Hall Ticket <strong>${hallTicketNo}</strong> (${studentName}) generated.</span>
    <a href="${pdfUrl}" target="_blank" style="color: #FDBA74; text-decoration: underline; font-weight: bold;">Open PDF</a>
    <button style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 16px; margin-left: 8px;">✕</button>
  `;

  document.body.appendChild(toast);
  const closeBtn = toast.querySelector('button');
  if (closeBtn) closeBtn.onclick = () => toast.remove();
  setTimeout(() => toast.remove(), 10000);
}

/**
 * Toast UI Helper on error
 */
function showHallTicketErrorToast(error: any): void {
  const toastId = 'ssiu-ht-error-toast';
  const existing = document.getElementById(toastId);
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #7F1D1D;
    color: #FFFFFF;
    padding: 12px 18px;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    border: 1.5px solid #EF4444;
  `;
  toast.innerHTML = `⚠️ <strong>Error generating Hall Ticket PDF:</strong> ${error?.message || 'Unknown error'}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}

export class HallTicketPdfService {
  public generatePdf(ticket: HallTicketData): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    renderSingleHallTicketPage(doc, ticket);
    return doc;
  }

  public async generateBlob(ticket: HallTicketData): Promise<Blob> {
    return generateHallTicketPDF(ticket);
  }

  public openInNewTab(ticket: HallTicketData): void {
    openHallTicketPDF(ticket).catch(err => {
      console.error('Error opening Hall Ticket PDF:', err);
    });
  }

  public downloadPdf(ticket: HallTicketData, filename?: string): void {
    downloadHallTicketPDF(ticket, filename);
  }

  public downloadBulkPdf(tickets: HallTicketData[], filename?: string): void {
    downloadBulkHallTicketsPDF(tickets, filename);
  }
}

export const hallTicketPdfService = new HallTicketPdfService();
