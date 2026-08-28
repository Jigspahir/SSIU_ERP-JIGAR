import React from 'react';
import { HallTicketData } from '../../types/hallTicket';
import logoSvg from '../../assets/swarrnim-logo.svg';

interface HallTicketPrintProps {
  ticket: HallTicketData;
}

export const HallTicketPrint: React.FC<HallTicketPrintProps> = ({ ticket }) => {
  const brandNavy = '#0F2C59';
  const brandOrange = '#F37023';
  const borderCol = '#94A3B8';
  const textDark = '#0F172A';
  const textMuted = '#64748B';

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body > * {
            visibility: hidden !important;
          }

          #ssiu-hall-ticket-print-root,
          #ssiu-hall-ticket-print-root * {
            visibility: visible !important;
          }

          #ssiu-hall-ticket-print-root {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 194mm !important;
            max-width: 194mm !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 0 !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            background: #FFFFFF !important;
            z-index: 999999 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            overflow: hidden !important;
          }

          .no-print,
          .no-print * {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="ssiu-hall-ticket-print-root"
        style={{
          width: '100%',
          maxWidth: '194mm',
          border: `1.5px solid ${brandNavy}`,
          padding: '8px 12px',
          boxSizing: 'border-box',
          background: '#FFFFFF',
          color: textDark,
          fontFamily: "'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif",
          fontSize: '9px',
          lineHeight: 1.25,
        }}
      >
        {/* 1. Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1.5px solid ${brandNavy}`, paddingBottom: '6px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logoSvg} alt="SSIU Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '11px', color: brandNavy }}>SWARRNIM STARTUP &amp; INNOVATION UNIVERSITY</div>
              <div style={{ fontSize: '8px', fontWeight: 800, color: brandOrange, textTransform: 'uppercase' }}>{ticket.universitySubtitle}</div>
              <div style={{ fontSize: '7px', color: textMuted }}>Gandhinagar – 382420, Gujarat, India • www.swarrnim.edu.in</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #3B82F6', fontWeight: 800, fontSize: '8px', padding: '2px 8px', borderRadius: '3px', marginBottom: '2px' }}>
              {ticket.examSession}
            </div>
            <div style={{ fontSize: '7.5px', fontWeight: 700, color: textDark }}>AY: {ticket.academicYear}</div>
          </div>
        </div>

        {/* 2. Title Strip */}
        <div style={{ background: brandNavy, color: '#FFFFFF', textAlign: 'center', padding: '3px 6px', fontWeight: 900, fontSize: '9.5px', borderRadius: '2px', marginBottom: '6px', letterSpacing: '0.4px' }}>
          {ticket.documentTitle}
        </div>

        {/* 3. Student Details + Photo */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <table style={{ flex: 1, borderCollapse: 'collapse', fontSize: '8px' }}>
            <tbody>
              <tr>
                <td style={{ width: '22%', color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Candidate Name:</td>
                <td style={{ width: '38%', fontWeight: 800, color: brandNavy, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.studentName}</td>
                <td style={{ width: '18%', color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Enrollment No:</td>
                <td style={{ width: '22%', fontWeight: 800, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.enrollmentNo}</td>
              </tr>
              <tr>
                <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Program &amp; Branch:</td>
                <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.programName}</td>
                <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Admission/GR No:</td>
                <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.admissionNo}</td>
              </tr>
              <tr>
                <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Institute:</td>
                <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.instituteName}</td>
                <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Semester / Term:</td>
                <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.semesterName}</td>
              </tr>
              <tr>
                <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Division &amp; Batch:</td>
                <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.division} • {ticket.batch}</td>
                <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Gender / Type:</td>
                <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.gender} • Regular</td>
              </tr>
            </tbody>
          </table>

          {/* Photo Container */}
          <div style={{ width: '75px', height: '90px', border: `1px solid ${brandNavy}`, background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textAlign: 'center', padding: '2px' }}>
            {ticket.photoUrl ? (
              <img src={ticket.photoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ border: `1px dashed ${borderCol}`, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: textMuted, fontSize: '8px', fontWeight: 800 }}>
                <span>AFFIX</span>
                <span>PHOTO</span>
                <span style={{ fontSize: '6px', fontWeight: 'normal' }}>(Verified)</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Exam Centre & Seat Details */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', marginBottom: '6px' }}>
          <tbody>
            <tr>
              <td style={{ width: '16%', color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Exam Event:</td>
              <td style={{ width: '44%', fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.examName}</td>
              <td style={{ width: '18%', color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Hall Ticket No:</td>
              <td style={{ width: '22%', fontWeight: 800, color: brandNavy, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.hallTicketNo}</td>
            </tr>
            <tr>
              <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Exam Centre:</td>
              <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.centreName} (Code: {ticket.centreCode})</td>
              <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Seat / Exam No:</td>
              <td style={{ fontWeight: 900, color: brandOrange, background: '#FFF7ED', padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.examSeatNo}</td>
            </tr>
            <tr>
              <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Reporting Time:</td>
              <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.reportingTime}</td>
              <td style={{ color: textMuted, padding: '2px 4px', border: `1px solid ${borderCol}` }}>Exam Timing:</td>
              <td style={{ fontWeight: 700, padding: '2px 4px', border: `1px solid ${borderCol}` }}>{ticket.examStartTime} to {ticket.examEndTime}</td>
            </tr>
          </tbody>
        </table>

        {/* 5. Examination Schedule Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px', marginBottom: '6px' }}>
          <thead>
            <tr style={{ background: '#1E3A5F', color: '#FFFFFF', textAlign: 'center' }}>
              <th style={{ padding: '3px 4px', border: `1px solid ${borderCol}`, width: '5%' }}>Sr.</th>
              <th style={{ padding: '3px 4px', border: `1px solid ${borderCol}`, width: '12%' }}>Code</th>
              <th style={{ padding: '3px 4px', border: `1px solid ${borderCol}`, width: '38%', textAlign: 'left' }}>Subject / Paper Title</th>
              <th style={{ padding: '3px 4px', border: `1px solid ${borderCol}`, width: '12%' }}>Exam Date</th>
              <th style={{ padding: '3px 4px', border: `1px solid ${borderCol}`, width: '10%' }}>Day</th>
              <th style={{ padding: '3px 4px', border: `1px solid ${borderCol}`, width: '13%' }}>Timing</th>
              <th style={{ padding: '3px 4px', border: `1px solid ${borderCol}`, width: '10%' }}>Room</th>
            </tr>
          </thead>
          <tbody>
            {ticket.subjects.map((sub, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }}>
                <td style={{ padding: '2.5px 4px', textAlign: 'center', border: `1px solid ${borderCol}` }}>{sub.sr}</td>
                <td style={{ padding: '2.5px 4px', textAlign: 'center', fontWeight: 800, color: brandNavy, border: `1px solid ${borderCol}` }}>{sub.subjectCode}</td>
                <td style={{ padding: '2.5px 4px', fontWeight: 700, border: `1px solid ${borderCol}` }}>{sub.subjectName}</td>
                <td style={{ padding: '2.5px 4px', textAlign: 'center', border: `1px solid ${borderCol}` }}>{sub.examDate}</td>
                <td style={{ padding: '2.5px 4px', textAlign: 'center', border: `1px solid ${borderCol}` }}>{sub.examDay}</td>
                <td style={{ padding: '2.5px 4px', textAlign: 'center', border: `1px solid ${borderCol}` }}>{sub.examTime}</td>
                <td style={{ padding: '2.5px 4px', textAlign: 'center', border: `1px solid ${borderCol}` }}>{sub.roomNo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 6. Candidate Instructions */}
        <div style={{ border: `1px solid ${borderCol}`, background: '#F8FAFC', padding: '4px 6px', fontSize: '7px', marginBottom: '6px', lineHeight: 1.3 }}>
          <div style={{ fontWeight: 800, color: brandNavy, marginBottom: '2px' }}>IMPORTANT INSTRUCTIONS FOR CANDIDATES:</div>
          <ol style={{ margin: 0, paddingLeft: '12px' }}>
            <li>Carry this printed Hall Ticket along with your Valid University Student ID Card to every examination session.</li>
            <li>Report at the examination centre at least 30 minutes prior to exam commencement. No entry after 30 mins from start.</li>
            <li>Mobile phones, smart watches, programmable calculators, Bluetooth devices, and unauthorized papers are strictly prohibited.</li>
            <li>Verify question paper code and fill roll number, subject code &amp; barcode accurately on answer booklet before writing.</li>
            <li>Maintain silence and discipline. Any candidate found adopting unfair means (UFM) will face immediate disciplinary action.</li>
          </ol>
        </div>

        {/* 7. Signatures */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7.5px', marginTop: '6px' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'bottom', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <div style={{ fontWeight: 700 }}>Candidate&apos;s Signature</div>
                <div style={{ fontSize: '6.5px', color: textMuted }}>(In presence of Invigilator)</div>
              </td>
              <td style={{ width: '33%', textAlign: 'center', verticalAlign: 'bottom', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <div style={{ fontWeight: 700 }}>Centre Superintendent</div>
                <div style={{ fontSize: '6.5px', color: textMuted }}>Signature &amp; Examination Seal</div>
              </td>
              <td style={{ width: '34%', textAlign: 'center', verticalAlign: 'bottom', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                <div style={{ fontWeight: 800, color: '#047857' }}>OFFICIALLY AUTHENTICATED</div>
                <div style={{ fontWeight: 800, color: brandNavy }}>Controller of Examinations</div>
                <div style={{ fontSize: '6.5px', color: textMuted }}>SSIU Gandhinagar</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 8. Footer */}
        <div style={{ borderTop: `1px solid ${borderCol}`, paddingTop: '2px', marginTop: '4px', fontSize: '6.5px', color: textMuted, textAlign: 'center' }}>
          * This Hall Ticket is computer-generated and officially authenticated by the Controller of Examinations, SSIU. *
        </div>
      </div>
    </>
  );
};
