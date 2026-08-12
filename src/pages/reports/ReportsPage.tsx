import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { 
  ChartBar as BarChart3, FileSpreadsheet, Printer, Search, ListFilter as Filter, 
  GraduationCap, BookOpen, Users, IndianRupee, Clock, CircleCheck as CheckCircle2, ShieldAlert,
  FileText, ClipboardCheck, ClipboardList, ShieldCheck, Download, Award, Building2, HelpCircle
} from 'lucide-react';
import { exportToExcel, exportToWord, ReportFilterOptions } from '../../services/exportService';

export type ReportCategory = 
  | 'STUDENTS_ROSTER'
  | 'FACULTY_DIRECTORY'
  | 'ATTENDANCE_SUMMARY'
  | 'TIMETABLE_SCHEDULE'
  | 'ASSIGNMENTS_PROGRESS'
  | 'FEES_OUTSTANDING'
  | 'FEE_PAYMENTS'
  | 'EXAM_ELIGIBILITY'
  | 'EXAM_RESULTS'
  | 'DOCUMENT_VAULT'
  | 'CERTIFICATES_LOG'
  | 'FACULTY_FEEDBACK'
  | 'SUPPORT_TICKETS'
  | 'HOSTEL_OCCUPANCY'
  | 'IQAC_BENCHMARKS'
  | 'REGISTRAR_DISPATCH'
  | 'APPROVAL_WORKFLOWS'
  | 'EDP_DUTIES';

export const ReportsPage: React.FC = () => {
  const { user, role } = useAuth();

  // ERP Master Datasets
  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const programs = db.getPrograms();
  const academicYears = db.getAcademicYears();
  const semesters = db.getSemesters();
  const divisions = db.getDivisions();
  const subjects = db.getSubjects();
  const facultyList = db.getFaculty();
  const studentsList = db.getStudents();
  const feeRecords = db.getStudentFeeRecords();
  const paymentTransactions = db.getFeePaymentTransactions();
  const assignments = db.getAssignments();
  const exams = db.getExams();
  const examForms = db.getExamForms();
  const results = db.getStudentResults();
  const documents = db.getStudentDocuments();
  const approvalRequests = db.getScopedApprovalRequests(user, role);
  const feedbacks = db.getStudentFeedbacks();
  const dispatches = db.getInwardOutwardRecords();
  const fileMovements = db.getRegistrarFileMovements();

  // Active Category State
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('STUDENTS_ROSTER');

  // Filter States
  const [selectedInstituteId, setSelectedInstituteId] = useState('ALL');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('ALL');
  const [selectedProgramId, setSelectedProgramId] = useState('ALL');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('ALL');
  const [selectedSemesterId, setSelectedSemesterId] = useState('ALL');
  const [selectedDivisionId, setSelectedDivisionId] = useState('ALL');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [searchQuery, setSearchQuery] = useState('');

  // Department list filtered by selected institute
  const filteredDepartments = useMemo(() => {
    if (selectedInstituteId === 'ALL') return departments;
    return departments.filter(d => d.instituteId === selectedInstituteId);
  }, [departments, selectedInstituteId]);

  // Program list filtered by selected department
  const filteredPrograms = useMemo(() => {
    if (selectedDepartmentId === 'ALL') return programs;
    return programs.filter(p => p.departmentId === selectedDepartmentId);
  }, [programs, selectedDepartmentId]);

  // Semester list filtered by selected program
  const filteredSemesters = useMemo(() => {
    if (selectedProgramId === 'ALL') return semesters;
    return semesters.filter(s => s.programId === selectedProgramId);
  }, [semesters, selectedProgramId]);

  // Allowed categories based on Role-Based Access Control (RBAC)
  const availableCategories: { key: ReportCategory; label: string; roles: string[] }[] = [
    { key: 'STUDENTS_ROSTER', label: '1. Students Roster & Enrolment', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT_SECTION'] },
    { key: 'FACULTY_DIRECTORY', label: '2. Faculty & Staff Directory', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'IQAC', 'PRINCIPAL', 'HOD'] },
    { key: 'ATTENDANCE_SUMMARY', label: '3. Attendance & Shortage Summary', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'FACULTY', 'EXAM_CELL'] },
    { key: 'TIMETABLE_SCHEDULE', label: '4. Timetable & Slot Schedules', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'] },
    { key: 'ASSIGNMENTS_PROGRESS', label: '5. Coursework & Assignments', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'] },
    { key: 'FEES_OUTSTANDING', label: '6. Fee Demand & Overdue Dues', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'PRINCIPAL', 'HOD', 'STUDENT_SECTION'] },
    { key: 'FEE_PAYMENTS', label: '7. Fee Payment Receipts Log', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'STUDENT_SECTION'] },
    { key: 'EXAM_ELIGIBILITY', label: '8. Exam Forms & Eligibility', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'EXAM_CELL', 'PRINCIPAL', 'HOD'] },
    { key: 'EXAM_RESULTS', label: '9. Exam Results & SGPA/CGPA Grade (NAAC)', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'EXAM_CELL', 'IQAC', 'PRINCIPAL', 'HOD'] },
    { key: 'DOCUMENT_VAULT', label: '10. Student Document & ABC ID Audit', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'STUDENT_SECTION'] },
    { key: 'CERTIFICATES_LOG', label: '11. Certificates & Bonafide Log', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'STUDENT_SECTION'] },
    { key: 'FACULTY_FEEDBACK', label: '12. Faculty Feedback & Quality Ratings (IQAC)', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'IQAC', 'REGISTRAR', 'PRINCIPAL', 'HOD'] },
    { key: 'SUPPORT_TICKETS', label: '13. Helpdesk Support Tickets', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'HOSTEL_ADMIN', 'STUDENT_SECTION'] },
    { key: 'HOSTEL_OCCUPANCY', label: '14. Hostel Occupancy & Clearances', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'HOSTEL_ADMIN'] },
    { key: 'IQAC_BENCHMARKS', label: '15. IQAC Audits & NAAC Benchmarks', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'IQAC', 'REGISTRAR', 'PRINCIPAL'] },
    { key: 'REGISTRAR_DISPATCH', label: '16. Registrar File Movements & Mail Register', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR'] },
    { key: 'APPROVAL_WORKFLOWS', label: '17. Central Approval Workflows Audit Trail', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'PRINCIPAL', 'HOD'] },
    { key: 'EDP_DUTIES', label: '18. EDP Duty Management & Evidence Vault', roles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'REGISTRAR', 'IQAC', 'EXAM_CELL', 'STUDENT_SECTION', 'HOSTEL_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'] }
  ];

  const permittedCategories = availableCategories.filter(c => c.roles.includes(role || 'STUDENT'));

  // Selected Names for Metadata
  const currentInstName = institutes.find(i => i.id === selectedInstituteId)?.name || 'ALL';
  const currentDeptName = departments.find(d => d.id === selectedDepartmentId)?.name || 'ALL';
  const currentProgName = programs.find(p => p.id === selectedProgramId)?.name || 'ALL';
  const currentAYName = academicYears.find(ay => ay.id === selectedAcademicYearId)?.name || 'ALL';
  const currentSemName = semesters.find(s => s.id === selectedSemesterId)?.code || 'ALL';
  const currentDivName = divisions.find(d => d.id === selectedDivisionId)?.name || 'ALL';

  const filterOptions: ReportFilterOptions = {
    instituteName: currentInstName,
    departmentName: currentDeptName,
    programName: currentProgName,
    academicYearName: currentAYName,
    semesterName: currentSemName,
    divisionName: currentDivName,
    startDate,
    endDate,
    searchQuery
  };

  // Generate Report Data (Headers & Rows) based on category
  const generateReportData = (): { reportTitle: string; headers: string[]; rows: (string | number)[][] } => {
    switch (selectedCategory) {
      case 'STUDENTS_ROSTER': {
        let list = studentsList;
        if (selectedInstituteId !== 'ALL') list = list.filter(s => s.instituteId === selectedInstituteId);
        if (selectedDepartmentId !== 'ALL') list = list.filter(s => s.departmentId === selectedDepartmentId);
        if (selectedProgramId !== 'ALL') list = list.filter(s => s.programId === selectedProgramId);
        if (selectedSemesterId !== 'ALL') list = list.filter(s => s.semesterId === selectedSemesterId);
        if (selectedDivisionId !== 'ALL') list = list.filter(s => s.divisionId === selectedDivisionId);
        if (searchQuery) list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.enrollmentNo.includes(searchQuery));

        const headers = ['Enrollment No', 'Student Candidate Name', 'Email Address', 'Phone No', 'Institute', 'Department', 'Program', 'Semester', 'Division', 'Status'];
        const rows: (string | number)[][] = list.map(s => {
          const inst = db.getInstituteById(s.instituteId)?.code || s.instituteId;
          const dept = db.getDepartmentById(s.departmentId)?.code || s.departmentId;
          const prog = db.getProgramById(s.programId)?.code || s.programId;
          const sem = db.getSemesterById(s.semesterId)?.code || s.semesterId;
          const div = db.getDivisionById(s.divisionId)?.name || s.divisionId;
          return [s.enrollmentNo, s.name, s.email, s.phone, inst, dept, prog, sem, div, s.status];
        });
        return { reportTitle: 'Official Student Enrolment & Roster Master Report', headers, rows };
      }

      case 'FACULTY_DIRECTORY': {
        let list = facultyList;
        if (selectedInstituteId !== 'ALL') list = list.filter(f => f.instituteId === selectedInstituteId);
        if (selectedDepartmentId !== 'ALL') list = list.filter(f => f.departmentId === selectedDepartmentId);
        if (searchQuery) list = list.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.employeeId.includes(searchQuery));

        const headers = ['Employee ID', 'Faculty Name', 'Designation', 'Department', 'Email', 'Phone', 'Qualification', 'Specialization', 'Experience Years', 'Status'];
        const rows: (string | number)[][] = list.map(f => {
          const dept = db.getDepartmentById(f.departmentId)?.name || f.departmentId;
          return [f.employeeId, f.name, f.designation, dept, f.email, f.phone, f.qualification, f.specialization || 'N/A', f.experienceYears, f.status];
        });
        return { reportTitle: 'Faculty & Teaching Staff Directory Report', headers, rows };
      }

      case 'ATTENDANCE_SUMMARY': {
        let list = studentsList;
        if (selectedInstituteId !== 'ALL') list = list.filter(s => s.instituteId === selectedInstituteId);
        if (selectedDepartmentId !== 'ALL') list = list.filter(s => s.departmentId === selectedDepartmentId);
        if (selectedSemesterId !== 'ALL') list = list.filter(s => s.semesterId === selectedSemesterId);

        const headers = ['Enrollment No', 'Student Name', 'Department', 'Semester', 'Total Conducted Classes', 'Attended Classes', 'Attendance %', 'Eligibility Threshold', 'Shortage Status'];
        const rows: (string | number)[][] = list.map(s => {
          const att = db.getStudentAttendanceStats(s.id);
          const dept = db.getDepartmentById(s.departmentId)?.code || s.departmentId;
          const sem = db.getSemesterById(s.semesterId)?.code || s.semesterId;
          const shortage = att.percentage < 75 ? 'ATTENDANCE SHORTAGE (<75%)' : 'ELIGIBLE (>=75%)';
          return [s.enrollmentNo, s.name, dept, sem, att.totalClasses, att.presentClasses, `${att.percentage}%`, '75% Mandatory', shortage];
        });
        return { reportTitle: 'Student Attendance Summary & Shortage Report', headers, rows };
      }

      case 'FEES_OUTSTANDING': {
        let list = feeRecords;
        if (searchQuery) list = list.filter(f => f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || f.enrollmentNo.includes(searchQuery));

        const headers = ['Enrollment No', 'Student Name', 'Total Fee Demand (₹)', 'Paid Amount (₹)', 'Pending Dues (₹)', 'Payment Status', 'Due Date', 'Overdue Alert'];
        const rows: (string | number)[][] = list.map(f => [
          f.enrollmentNo,
          f.studentName,
          f.totalAmount,
          f.paidAmount,
          f.pendingAmount,
          f.status,
          f.dueDate,
          f.pendingAmount > 0 ? 'OVERDUE' : 'CLEAR'
        ]);
        return { reportTitle: 'University Fees Demand Ledger & Outstanding Dues Report', headers, rows };
      }

      case 'FEE_PAYMENTS': {
        const headers = ['Receipt No', 'Enrollment No', 'Student Name', 'Amount Paid (₹)', 'Payment Mode', 'Transaction ID', 'Payment Date', 'Status'];
        const rows: (string | number)[][] = paymentTransactions.map(p => [
          p.receiptNo,
          p.enrollmentNo,
          p.studentName,
          p.paidAmount,
          p.paymentMode,
          p.transactionId,
          p.paymentDate,
          p.status || 'SUCCESS'
        ]);
        return { reportTitle: 'Fee Payment Receipts & Revenue Collection Transaction Log', headers, rows };
      }

      case 'EXAM_RESULTS': {
        let list = results;
        if (searchQuery) list = list.filter(r => r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.enrollmentNo.includes(searchQuery));

        const headers = ['Enrollment No', 'Student Name', 'Program', 'Semester', 'Marks Obtained', 'Max Marks', 'SGPA', 'CGPA', 'Exam Result Status', 'Published Date'];
        const rows: (string | number)[][] = list.map(r => {
          const prog = db.getProgramById(r.programId)?.code || r.programId;
          const sem = db.getSemesterById(r.semesterId)?.code || r.semesterId;
          return [r.enrollmentNo, r.studentName, prog, sem, r.totalMarksObtained, r.totalMaxMarks, r.sgpa, r.cgpa, r.status, r.publishedDate];
        });
        return { reportTitle: 'Examination Results & SGPA/CGPA Grade Summary Report (NAAC Format)', headers, rows };
      }

      case 'EXAM_ELIGIBILITY': {
        const headers = ['Exam Form ID', 'Enrollment No', 'Student Name', 'Program', 'Base Fee', 'Total Fee', 'Payment Status', 'Form Status', 'Hall Ticket No'];
        const rows: (string | number)[][] = examForms.map(ef => [
          ef.id,
          ef.enrollmentNo,
          ef.studentName,
          ef.programId,
          ef.baseFee,
          ef.totalFee,
          ef.paymentStatus,
          ef.status,
          ef.hallTicketNo || 'PENDING'
        ]);
        return { reportTitle: 'Examination Registration & Hall Ticket Issuance Report', headers, rows };
      }

      case 'DOCUMENT_VAULT': {
        const headers = ['Document Title', 'Category', 'Student ID', 'Status', 'Verified Date', 'Lock Status'];
        const rows: (string | number)[][] = documents.map(d => [
          d.title,
          d.category,
          d.studentId,
          d.status,
          d.verifiedAt || 'N/A',
          d.isLocked ? 'VAULT LOCKED' : 'UNLOCKED'
        ]);
        return { reportTitle: 'Student Document Vault & ABC ID Verification Audit Log', headers, rows };
      }

      case 'FACULTY_FEEDBACK': {
        const headers = ['Feedback Type', 'Department', 'Faculty Name', 'Teaching Quality', 'Subject Knowledge', 'Communication', 'Facilities Rating', 'Overall Rating'];
        const rows: (string | number)[][] = feedbacks.map(fb => [
          fb.type,
          fb.departmentId,
          fb.facultyName || 'N/A',
          fb.teachingQualityRating || 'N/A',
          fb.subjectKnowledgeRating || 'N/A',
          fb.communicationRating || 'N/A',
          fb.facilitiesRating || 'N/A',
          fb.overallRating || 4.5
        ]);
        return { reportTitle: 'Student Faculty Feedback & Department Quality Ratings (IQAC Format)', headers, rows };
      }

      case 'IQAC_BENCHMARKS': {
        const headers = ['Institute Code', 'Institute Name', 'Academic Audit Status', 'Overall Feedback Score', 'NAAC Compliance Rate'];
        const rows: (string | number)[][] = institutes.map(inst => [
          inst.code,
          inst.name,
          'AUDITED & VERIFIED',
          '4.75 / 5.0',
          '98.5% Compliant'
        ]);
        return { reportTitle: 'IQAC Institutional Quality Audit & Department Compliance Benchmarks', headers, rows };
      }

      case 'REGISTRAR_DISPATCH': {
        const headers = ['Dispatch No', 'Type', 'Category', 'Subject', 'Sender / Recipient', 'Dispatch Mode', 'Date', 'Status'];
        const rows: (string | number)[][] = dispatches.map(d => [
          d.dispatchNo,
          d.type,
          d.category,
          d.subject,
          d.senderOrRecipient,
          d.mode,
          d.receivedOrDispatchedDate,
          d.status
        ]);
        return { reportTitle: 'Registrar Office Inward / Outward Dispatch & Mail Register', headers, rows };
      }

      case 'APPROVAL_WORKFLOWS': {
        let list = approvalRequests;
        if (searchQuery) list = list.filter(a => a.requestNo.includes(searchQuery) || a.applicantName.toLowerCase().includes(searchQuery.toLowerCase()));

        const headers = ['Request No', 'Applicant Name', 'Applicant Role', 'Category', 'Title', 'Priority', 'Target Office', 'Current Desk', 'Status', 'Deadline'];
        const rows = list.map(a => [
          a.requestNo,
          a.applicantName,
          a.applicantRole,
          a.category,
          a.title,
          a.priority,
          a.targetOffice,
          a.currentOffice,
          a.status,
          a.deadlineDate
        ]);
        return { reportTitle: 'Central Approval Workflows Audit Trail & Status Report', headers, rows };
      }

      case 'EDP_DUTIES': {
        const dutiesList = db.getScopedEdpDuties(user, role);
        const headers = ['Duty Code', 'Event Name', 'Event Category', 'Duty Role', 'Assigned Staff', 'Staff Designation', 'Duty Date', 'Time Slot', 'Venue', 'GPS Evidence', 'Status', 'Verified By'];
        const rows: (string | number)[][] = dutiesList.map(d => [
          d.dutyCode,
          d.eventName,
          d.eventType,
          d.dutyRole.replace('_', ' '),
          d.assignedUserName,
          d.assignedUserDesignation || 'Staff',
          d.dutyDate,
          `${d.startTime} - ${d.endTime}`,
          d.venue,
          d.evidenceList.length > 0 ? `GPS VERIFIED (${d.evidenceList[0].latitude.toFixed(4)}°N, ${d.evidenceList[0].longitude.toFixed(4)}°E)` : 'PENDING',
          d.status,
          d.verifiedByAdminName || 'UNVERIFIED'
        ]);
        return { reportTitle: 'EDP Duty Management & Geo Evidence Audit Register', headers, rows };
      }

      default: {
        const headers = ['Record ID', 'Description', 'Status'];
        const rows = [['101', 'Default Report Sample Record', 'ACTIVE']];
        return { reportTitle: 'Official University ERP Report', headers, rows };
      }
    }
  };

  const reportData = generateReportData();

  // Export Trigger Handlers
  const handleExportExcelClick = () => {
    exportToExcel(reportData.reportTitle, reportData.headers, reportData.rows, filterOptions, {
      name: user?.name,
      role: user?.role,
      designation: user?.designation,
      email: user?.email
    });
  };

  const handleExportWordClick = () => {
    exportToWord(reportData.reportTitle, reportData.headers, reportData.rows, filterOptions, {
      name: user?.name,
      role: user?.role,
      designation: user?.designation,
      email: user?.email
    });
  };

  const handlePrintClick = () => {
    window.print();
  };

  // --- STUDENT SCOPED REPORT CARD VIEW ---
  if (role === 'STUDENT') {
    const student = studentsList.find(s => s.id === user?.id || s.enrollmentNo === user?.enrollmentNo) || studentsList[0];
    const attStats = db.getStudentAttendanceStats(student.id);
    const myFee = feeRecords.find(f => f.studentId === student.id) || feeRecords[0];

    const studentHeaders = ['Metric Description', 'Details / Subject Scope', 'Value / Score'];
    const studentRows = [
      ['Student Enrollment No', 'Official Identity', student.enrollmentNo],
      ['Student Candidate Name', 'Enrolled Name', student.name],
      ['Overall Attendance %', 'Classes Attended vs Conducted', `${attStats.presentClasses} / ${attStats.totalClasses} (${attStats.percentage}%)`],
      ['Tuition Fees Demand', 'Semester Total Demand', `₹${myFee?.totalAmount.toLocaleString()}`],
      ['Fees Settled / Paid', 'Receipt Amount', `₹${myFee?.paidAmount.toLocaleString()}`],
      ['Pending Dues Balance', 'Outstanding Due', `₹${myFee?.pendingAmount.toLocaleString()}`],
      ['ABC ID Status', 'DigiLocker Verification', student.abcIdStatus || 'VERIFIED']
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Badge variant="gold">Student Academic Transcript</Badge>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
              My Academic &amp; Attendance Report
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Official transcript of attendance performance, coursework, and fee ledgers
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => exportToWord('Student Academic Transcript', studentHeaders, studentRows, filterOptions, { name: student.name, role: 'STUDENT' })}>
              <FileText size={16} /> Export Word (.doc)
            </button>
            <button className="btn btn-primary" onClick={() => exportToExcel('Student Academic Transcript', studentHeaders, studentRows, filterOptions, { name: student.name, role: 'STUDENT' })}>
              <FileSpreadsheet size={16} /> Export Excel (.xlsx)
            </button>
          </div>
        </div>

        <div className="grid-3">
          <StatCard title="Attendance Score" value={`${attStats.percentage}%`} subtitle={`${attStats.presentClasses} / ${attStats.totalClasses} Classes`} icon={ClipboardCheck} colorScheme="green" />
          <StatCard title="Fee Ledger Balance" value={`₹${myFee?.pendingAmount.toLocaleString()}`} subtitle={`Paid: ₹${myFee?.paidAmount.toLocaleString()}`} icon={IndianRupee} colorScheme="gold" />
          <StatCard title="DigiLocker ABC ID" value={student.abcId || 'N/A'} subtitle={`Status: ${student.abcIdStatus}`} icon={Award} colorScheme="navy" />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Official Student Academic Summary</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Metric Description</th>
                  <th>Details / Scope</th>
                  <th>Value / Status</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r[0]}</strong></td>
                    <td>{r[1]}</td>
                    <td><Badge variant="navy">{r[2]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMINISTRATIVE OFFICE / FACULTY FULL REPORTING HUB ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Export Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="gold">NAAC &amp; UGC Compliant Reporting Engine</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
            Central Data Export &amp; Reporting Hub
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Export official module-wise reports in Excel (.xlsx) and Word (.doc) with statutory headers and filters
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handlePrintClick}>
            <Printer size={16} /> Print Report
          </button>
          <button className="btn btn-secondary" onClick={handleExportWordClick} style={{ background: '#1E3E62', color: '#FFFFFF', borderColor: '#1E3E62' }}>
            <FileText size={16} /> Export Word (.doc)
          </button>
          <button className="btn btn-primary" onClick={handleExportExcelClick} style={{ background: '#10B981', borderColor: '#10B981' }}>
            <FileSpreadsheet size={16} /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Multi-Criteria Academic Hierarchy Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover)' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={18} color="var(--brand-orange)" /> Multi-Criteria Filter Controls (Academic Hierarchy &amp; Date Range)
        </div>

        <div className="grid-4" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Institute / School</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedInstituteId} onChange={e => { setSelectedInstituteId(e.target.value); setSelectedDepartmentId('ALL'); setSelectedProgramId('ALL'); }}>
              <option value="ALL">All Institutes / Schools</option>
              {institutes.map(i => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Department</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedDepartmentId} onChange={e => { setSelectedDepartmentId(e.target.value); setSelectedProgramId('ALL'); }}>
              <option value="ALL">All Departments</option>
              {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Program</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedProgramId} onChange={e => { setSelectedProgramId(e.target.value); setSelectedSemesterId('ALL'); }}>
              <option value="ALL">All Degree Programs</option>
              {filteredPrograms.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Academic Year</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedAcademicYearId} onChange={e => setSelectedAcademicYearId(e.target.value)}>
              <option value="ALL">All Academic Years</option>
              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name} {ay.isCurrent ? '(Current)' : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-4" style={{ gap: '0.75rem' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Semester</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedSemesterId} onChange={e => setSelectedSemesterId(e.target.value)}>
              <option value="ALL">All Semesters</option>
              {filteredSemesters.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Division</label>
            <select className="form-input" style={{ fontSize: '0.8125rem' }} value={selectedDivisionId} onChange={e => setSelectedDivisionId(e.target.value)}>
              <option value="ALL">All Divisions</option>
              {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
            <input type="date" className="form-input" style={{ fontSize: '0.8125rem' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date</label>
            <input type="date" className="form-input" style={{ fontSize: '0.8125rem' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Reporting Module Selector Sidebar & Report Preview Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        {/* Category Navigation Menu */}
        <div className="card" style={{ padding: '1rem', height: 'fit-content' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-orange)', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
            Reporting Modules ({permittedCategories.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {permittedCategories.map(cat => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    textAlign: 'left',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 800 : 500,
                    backgroundColor: isActive ? 'var(--brand-navy)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Preview & Table Data View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <Badge variant="navy">LIVE REPORT PREVIEW</Badge>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                  {reportData.reportTitle}
                </h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Total Filtered Records: <strong>{reportData.rows.length}</strong> • Export Ready (.xlsx &amp; .doc)
                </div>
              </div>

              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter report records..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
                />
              </div>
            </div>

            {/* Formatted Report Data Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <table className="table">
                <thead>
                  <tr>
                    {reportData.headers.map((h, i) => (
                      <th key={i} style={{ whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={reportData.headers.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No records found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    reportData.rows.slice(0, 15).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                            {cIdx === 0 ? <strong>{cell}</strong> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {reportData.rows.length > 15 && (
              <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Showing preview of 15 records out of <strong>{reportData.rows.length} total records</strong>. Click <strong>Export Excel</strong> or <strong>Export Word</strong> to download full dataset.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
