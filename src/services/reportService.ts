import { db } from './db';
import { UserRole } from '../types';

export type ReportMode = 'SINGLE' | 'FILTERED' | 'DASHBOARD';

export type SingleRecordType = 
  | 'STUDENT'
  | 'FACULTY'
  | 'FEE_ACCOUNT'
  | 'PAYMENT'
  | 'ADMISSION'
  | 'EXAM'
  | 'HOSTEL'
  | 'VEHICLE'
  | 'DRIVER'
  | 'TRANSPORT_ROUTE'
  | 'REQUEST'
  | 'WORK_DIARY'
  | 'EDP_DUTY';

export type DashboardReportType = 
  | 'CAMPUS_HOME'
  | 'ATTENDANCE'
  | 'FEES'
  | 'ADMISSION'
  | 'EXAMINATION'
  | 'HOSTEL'
  | 'TRANSPORT'
  | 'LIBRARY'
  | 'PLACEMENT'
  | 'WORK_DIARY'
  | 'EDP_DUTY';

export interface ReportFilterOptions {
  instituteId?: string;
  departmentId?: string;
  programId?: string;
  academicYearId?: string;
  semesterId?: string;
  divisionId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  gender?: string;
  paymentStatus?: 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  attendanceStatus?: 'ALL' | 'REGULAR' | 'LOW_ATTENDANCE' | 'CRITICAL';
  approvalStatus?: string;
  searchQuery?: string;
  dateRangePreset?: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_SEMESTER' | 'THIS_ACADEMIC_YEAR' | 'CUSTOM';
}

export interface ReportSummaryMetric {
  label: string;
  value: number | string;
  percentage?: number;
  color?: string;
  sublabel?: string;
}

export interface SingleRecordDossier {
  title: string;
  subtitle: string;
  recordType: SingleRecordType;
  referenceId: string;
  headerFields: { label: string; value: string | number; badgeVariant?: string }[];
  sections: {
    title: string;
    description?: string;
    metrics?: ReportSummaryMetric[];
    fields?: { label: string; value: string | number; badgeVariant?: string }[];
    table?: {
      headers: string[];
      rows: (string | number)[][];
    };
  }[];
}

export interface MultiRecordReportData {
  reportTitle: string;
  moduleName: string;
  generatedDate: string;
  generatedBy: string;
  appliedFilters: { label: string; value: string }[];
  totalCount: number;
  summaryMetrics: ReportSummaryMetric[];
  distributionCharts?: {
    title: string;
    type: 'DONUT' | 'BAR';
    data: { label: string; value: number; percentage: number; color?: string }[];
  }[];
  headers: string[];
  rows: (string | number)[][];
  rawItems?: any[];
}

export interface ReportHistoryItem {
  id: string;
  reportName: string;
  reportMode: ReportMode;
  moduleOrType: string;
  generatedBy: string;
  generatedDate: string;
  recordCount: number;
  filtersSummary: string;
  exportFormat: 'PDF' | 'EXCEL' | 'PRINT';
}

const REPORT_HISTORY_KEY = 'ssiu_erp_report_history_v1';

export class ReportEngineService {
  public calcPercentage(val: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Number(((val / total) * 100).toFixed(1));
  }

  public getHistory(): ReportHistoryItem[] {
    try {
      const raw = localStorage.getItem(REPORT_HISTORY_KEY);
      if (!raw) return this.getDefaultHistory();
      return JSON.parse(raw);
    } catch {
      return this.getDefaultHistory();
    }
  }

  public addHistory(item: Omit<ReportHistoryItem, 'id' | 'generatedDate'>) {
    try {
      const history = this.getHistory();
      const newItem: ReportHistoryItem = {
        ...item,
        id: `rep-hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        generatedDate: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
      const updated = [newItem, ...history].slice(0, 50);
      localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(updated));
      return newItem;
    } catch (e) {
      console.warn('Failed to save report history', e);
      return null;
    }
  }

  public clearHistory() {
    localStorage.removeItem(REPORT_HISTORY_KEY);
  }

  private getDefaultHistory(): ReportHistoryItem[] {
    return [
      {
        id: 'rep-hist-01',
        reportName: 'SSIU Attendance Shortage (Low Attendance < 75%)',
        reportMode: 'FILTERED',
        moduleOrType: 'ATTENDANCE',
        generatedBy: 'Administrator (SUPER_ADMIN)',
        generatedDate: '12 Aug 2026, 11:30 AM',
        recordCount: 42,
        filtersSummary: 'Department: Computer Engineering | Semester: 5 | Attendance < 75%',
        exportFormat: 'PDF'
      },
      {
        id: 'rep-hist-02',
        reportName: 'Single Student Dossier - Jigar Parmar (230101001)',
        reportMode: 'SINGLE',
        moduleOrType: 'STUDENT',
        generatedBy: 'Administrator (SUPER_ADMIN)',
        generatedDate: '11 Aug 2026, 03:15 PM',
        recordCount: 1,
        filtersSummary: 'Enrollment: 230101001',
        exportFormat: 'PDF'
      },
      {
        id: 'rep-hist-03',
        reportName: 'University Central Dashboard Executive Report',
        reportMode: 'DASHBOARD',
        moduleOrType: 'CAMPUS_HOME',
        generatedBy: 'University Registrar',
        generatedDate: '10 Aug 2026, 09:45 AM',
        recordCount: 1284,
        filtersSummary: 'Campus Wide | AY: 2026-27',
        exportFormat: 'EXCEL'
      }
    ];
  }

  // =========================================================================
  // 1. SINGLE RECORD SEARCH & DOSSIER GENERATOR
  // =========================================================================

  public searchSingleRecords(type: SingleRecordType, query: string, role?: string | null, user?: any) {
    const q = (query || '').toLowerCase().trim();

    switch (type) {
      case 'STUDENT': {
        let students = db.getStudents();
        if (role === 'STUDENT' && user) {
          students = students.filter(s => s.id === user.id || s.enrollmentNo === user.enrollmentNo);
        }
        return students
          .filter(s => !q || s.name.toLowerCase().includes(q) || s.enrollmentNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
          .map(s => {
            const dept = db.getDepartmentById(s.departmentId);
            return {
              id: s.id,
              primaryText: s.name,
              secondaryText: `${s.enrollmentNo} • ${dept?.name || 'Department'} • Sem ${s.semesterId?.replace('sem-', '') || '4'}`,
              tag: s.status,
              raw: s
            };
          });
      }

      case 'FACULTY': {
        const faculty = db.getFaculty();
        return faculty
          .filter(f => !q || f.name.toLowerCase().includes(q) || f.employeeId.toLowerCase().includes(q) || f.email.toLowerCase().includes(q))
          .map(f => {
            const dept = db.getDepartmentById(f.departmentId);
            return {
              id: f.id,
              primaryText: f.name,
              secondaryText: `${f.employeeId} • ${f.designation} • ${dept?.name || 'Dept'}`,
              tag: f.status,
              raw: f
            };
          });
      }

      case 'FEE_ACCOUNT': {
        const feeRecords = db.getStudentFeeRecords();
        return feeRecords
          .filter(fr => !q || fr.studentName.toLowerCase().includes(q) || fr.enrollmentNo.toLowerCase().includes(q))
          .map(fr => ({
            id: fr.id,
            primaryText: `${fr.studentName} (${fr.enrollmentNo})`,
            secondaryText: `Total Fee: ₹${fr.totalAmount.toLocaleString()} • Paid: ₹${fr.paidAmount.toLocaleString()} • Pending: ₹${fr.pendingAmount.toLocaleString()}`,
            tag: fr.status,
            raw: fr
          }));
      }

      case 'ADMISSION': {
        const applications = db.getAdmissionApplications();
        return applications
          .filter(app => !q || app.applicantName.toLowerCase().includes(q) || app.id.toLowerCase().includes(q))
          .map(app => ({
            id: app.id,
            primaryText: `${app.applicantName} (#${app.id})`,
            secondaryText: `Program: ${app.programId} • Email: ${app.email}`,
            tag: app.status,
            raw: app
          }));
      }

      case 'EXAM': {
        const exams = db.getExams();
        return exams
          .filter(e => !q || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
          .map(e => ({
            id: e.id,
            primaryText: e.name,
            secondaryText: `Type: ${e.type} • Fee: ₹${e.baseFee} • Deadline: ${e.formDeadline}`,
            tag: e.status,
            raw: e
          }));
      }

      case 'REQUEST': {
        const requests = db.getApprovalRequests();
        return requests
          .filter(r => !q || r.requestNo.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.applicantName.toLowerCase().includes(q))
          .map(r => ({
            id: r.id,
            primaryText: `${r.requestNo}: ${r.title}`,
            secondaryText: `Applicant: ${r.applicantName} (${r.applicantRole}) • Office: ${r.currentOffice}`,
            tag: r.status,
            raw: r
          }));
      }

      case 'EDP_DUTY': {
        const duties = db.getEdpDuties();
        return duties
          .filter(d => !q || d.dutyCode.toLowerCase().includes(q) || d.eventName.toLowerCase().includes(q) || d.assignedUserName.toLowerCase().includes(q))
          .map(d => ({
            id: d.id,
            primaryText: `${d.dutyCode}: ${d.eventName} (${d.eventType})`,
            secondaryText: `Assigned: ${d.assignedUserName} • Date: ${d.dutyDate} • Venue: ${d.venue || 'Campus'}`,
            tag: d.status,
            raw: d
          }));
      }

      case 'TRANSPORT_ROUTE':
      case 'VEHICLE':
      case 'DRIVER': {
        const routes = [
          { id: 'r-1', routeNo: 'Route 101', routeName: 'Ahmedabad ISRO Colony - Swarrnim Campus', driverName: 'Demo Driver 1', driverPhone: '+91 00000 50001', vehicleNo: 'GJ-01-SS-1001', capacity: 50, assignedStudents: 44, status: 'ACTIVE' },
          { id: 'r-2', routeNo: 'Route 102', routeName: 'Gandhinagar Sector 11 - Swarrnim Campus', driverName: 'Demo Driver 2', driverPhone: '+91 00000 50002', vehicleNo: 'GJ-01-SS-1002', capacity: 50, assignedStudents: 48, status: 'ACTIVE' },
          { id: 'r-3', routeNo: 'Route 103', routeName: 'Chandkheda Circle - Swarrnim Campus', driverName: 'Demo Driver 3', driverPhone: '+91 00000 50003', vehicleNo: 'GJ-01-SS-1003', capacity: 40, assignedStudents: 32, status: 'ACTIVE' }
        ];
        return routes
          .filter(r => !q || r.routeName.toLowerCase().includes(q) || r.routeNo.toLowerCase().includes(q) || r.driverName.toLowerCase().includes(q) || r.vehicleNo.toLowerCase().includes(q))
          .map(r => ({
            id: r.id,
            primaryText: `${r.routeNo}: ${r.routeName}`,
            secondaryText: `Driver: ${r.driverName} • Vehicle: ${r.vehicleNo} • Occupancy: ${r.assignedStudents}/${r.capacity}`,
            tag: r.status,
            raw: r
          }));
      }

      case 'HOSTEL': {
        const hostelRooms = [
          { id: 'h-101', blockName: 'Block A (Boys Hostel)', roomNo: 'A-101', capacity: 3, occupied: 3, status: 'FULL', fee: 45000 },
          { id: 'h-102', blockName: 'Block A (Boys Hostel)', roomNo: 'A-102', capacity: 3, occupied: 2, status: 'AVAILABLE', fee: 45000 },
          { id: 'h-201', blockName: 'Block B (Girls Hostel)', roomNo: 'B-201', capacity: 2, occupied: 2, status: 'FULL', fee: 48000 },
          { id: 'h-202', blockName: 'Block B (Girls Hostel)', roomNo: 'B-202', capacity: 2, occupied: 1, status: 'AVAILABLE', fee: 48000 }
        ];
        return hostelRooms
          .filter(hr => !q || hr.roomNo.toLowerCase().includes(q) || hr.blockName.toLowerCase().includes(q))
          .map(hr => ({
            id: hr.id,
            primaryText: `${hr.blockName} - Room ${hr.roomNo}`,
            secondaryText: `Beds: ${hr.occupied} / ${hr.capacity} Occupied • Annual Rent: ₹${hr.fee.toLocaleString()}`,
            tag: hr.status,
            raw: hr
          }));
      }

      default:
        return [];
    }
  }

  public generateSingleRecordDossier(type: SingleRecordType, recordId: string): SingleRecordDossier | null {
    switch (type) {
      case 'STUDENT': {
        const student = db.getStudents().find(s => s.id === recordId || s.enrollmentNo === recordId) || db.getStudents()[0];
        if (!student) return null;

        const inst = db.getInstituteById(student.instituteId);
        const dept = db.getDepartmentById(student.departmentId);
        const prog = db.getProgramById(student.programId);
        const attStats = db.getStudentAttendanceStats(student.id);
        const feeRecord = db.getStudentFeeRecords().find(f => f.studentId === student.id || f.enrollmentNo === student.enrollmentNo);
        const payments = db.getFeePaymentTransactions().filter(p => p.studentId === student.id || p.enrollmentNo === student.enrollmentNo);
        const results = db.getStudentResults().filter(r => r.studentId === student.id || r.enrollmentNo === student.enrollmentNo);
        const documents = db.getStudentDocuments().filter(d => d.studentId === student.id);

        return {
          title: `Comprehensive Student Dossier - ${student.name}`,
          subtitle: `Enrollment No: ${student.enrollmentNo} • ${dept?.name || 'Department'} • Swarrnim Startup & Innovation University`,
          recordType: 'STUDENT',
          referenceId: student.enrollmentNo,
          headerFields: [
            { label: 'Student Name', value: student.name },
            { label: 'Enrollment No', value: student.enrollmentNo },
            { label: 'Institute', value: inst?.name || 'Swarrnim Institute of Technology' },
            { label: 'Department', value: dept?.name || 'Computer Engineering' },
            { label: 'Program', value: prog?.name || 'B.Tech Computer Science & Engineering' },
            { label: 'Semester / Div', value: `${student.semesterId?.replace('sem-', 'Sem ') || 'Sem 4'} / Div A` },
            { label: 'Academic Status', value: student.status, badgeVariant: student.status === 'ACTIVE' ? 'active' : 'orange' },
            { label: 'Admission Category', value: 'Regular Admission' }
          ],
          sections: [
            {
              title: '1. Academic & Classroom Attendance Record',
              metrics: [
                { label: 'Overall Attendance Rate', value: `${attStats.percentage}%`, percentage: attStats.percentage, color: attStats.percentage >= 75 ? '#34A853' : '#EA4335' },
                { label: 'Lectures Attended', value: `${attStats.presentClasses} / ${attStats.totalClasses}`, sublabel: 'Conducted Sessions' },
                { label: 'Excused / Leaves', value: '3 Approved' },
                { label: 'Attendance Benchmark', value: attStats.percentage >= 75 ? 'ELIGIBLE' : 'DEBARRED (LOW)', color: attStats.percentage >= 75 ? '#34A853' : '#EA4335' }
              ],
              table: {
                headers: ['Subject Code', 'Subject Name', 'Conducted', 'Attended', 'Attendance %', 'Eligibility'],
                rows: [
                  ['CS-401', 'Data Structures & Algorithms', 32, 30, '93.8%', 'Eligible'],
                  ['CS-402', 'Database Management Systems', 30, 28, '93.3%', 'Eligible'],
                  ['CS-403', 'Operating Systems & System Calls', 28, 26, '92.9%', 'Eligible'],
                  ['CS-404', 'Computer Architecture & Org', 28, 25, '89.3%', 'Eligible'],
                  ['CS-405', 'Web Application Development Lab', 14, 14, '100.0%', 'Eligible']
                ]
              }
            },
            {
              title: '2. Fee Ledger & Financial Accounts',
              metrics: [
                { label: 'Total Invoiced Demand', value: `₹${(feeRecord?.totalAmount || 85000).toLocaleString()}` },
                { label: 'Total Paid / Realized', value: `₹${(feeRecord?.paidAmount || 85000).toLocaleString()}`, color: '#34A853' },
                { label: 'Pending Dues Balance', value: `₹${(feeRecord?.pendingAmount || 0).toLocaleString()}`, color: (feeRecord?.pendingAmount || 0) === 0 ? '#34A853' : '#EA4335' },
                { label: 'Payment Status', value: feeRecord?.status || 'PAID', color: feeRecord?.status === 'PAID' ? '#34A853' : '#FBBC05' }
              ],
              table: {
                headers: ['Receipt No', 'Payment Date', 'Payment Mode', 'Fee Type', 'Amount Paid', 'Receipt Status'],
                rows: payments.length > 0
                  ? payments.map(p => [p.receiptNo || 'REC-1001', p.paymentDate || '2026-07-15', p.paymentMode || 'Online UPI', p.feeType || 'TUITION', `₹${p.paidAmount.toLocaleString()}`, 'SUCCESS'])
                  : [['REC-2026-001', '15 Jul 2026', 'Net Banking', 'TUITION', '₹50,000', 'SUCCESS'], ['REC-2026-002', '10 Aug 2026', 'Online UPI', 'OTHER', '₹35,000', 'SUCCESS']]
              }
            },
            {
              title: '3. Examination & Grade Outcomes (NAAC Metric)',
              metrics: [
                { label: 'Current SGPA', value: results[0]?.sgpa ? `${results[0].sgpa} / 10.0` : '8.75 / 10.0', color: '#0F2C59' },
                { label: 'Cumulative CGPA', value: results[0]?.cgpa ? `${results[0].cgpa} / 10.0` : '8.60 / 10.0', color: '#0F2C59' },
                { label: 'Credits Earned', value: '64 / 64 Credits' },
                { label: 'Result Classification', value: 'FIRST CLASS WITH DISTINCTION', color: '#34A853' }
              ],
              table: {
                headers: ['Course Code', 'Course Title', 'Credits', 'Internal Marks', 'External Marks', 'Grade', 'Status'],
                rows: [
                  ['CS-301', 'Object Oriented Programming in Java', 4, '28/30', '62/70', 'AA (9.0)', 'PASS'],
                  ['CS-302', 'Discrete Mathematics', 4, '26/30', '58/70', 'AB (8.0)', 'PASS'],
                  ['CS-303', 'Digital Logic & Design', 4, '29/30', '65/70', 'AA (9.0)', 'PASS'],
                  ['CS-304', 'Data Communication & Networks', 3, '27/30', '59/70', 'AB (8.0)', 'PASS'],
                  ['CS-305', 'Environmental Sciences', 2, '25/30', '60/70', 'AA (9.0)', 'PASS']
                ]
              }
            },
            {
              title: '4. Documents, Bonafide & Institutional Clearances',
              table: {
                headers: ['Document Code', 'Document Title', 'Upload Date', 'Verification Status', 'Issued By'],
                rows: documents.length > 0
                  ? documents.map(d => [d.id, d.title || 'Document', d.uploadDate || '2026-01-10', d.status, 'Student Section Office'])
                  : [
                      ['DOC-101', '10th & 12th Marksheet Transcripts', '10 Jun 2024', 'VERIFIED', 'Registrar Secretariat'],
                      ['DOC-102', 'Aadhaar Card & ABC ID Card', '10 Jun 2024', 'VERIFIED', 'Student Section Bureau'],
                      ['DOC-103', 'Bonafide Certificate (Passport/Scholarship)', '12 Jul 2026', 'VERIFIED', 'Controller of Admin']
                    ]
              }
            }
          ]
        };
      }

      case 'FACULTY': {
        const faculty = db.getFaculty().find(f => f.id === recordId || f.employeeId === recordId) || db.getFaculty()[0];
        if (!faculty) return null;
        const dept = db.getDepartmentById(faculty.departmentId);
        const inst = db.getInstituteById(faculty.instituteId);
        const duties = db.getEdpDuties().filter(d => d.assignedUserId === faculty.id || d.assignedUserName === faculty.name);
        const feedbacks = db.getStudentFeedbacks().filter(f => f.facultyId === faculty.id);
        const avgScore = feedbacks.length > 0 ? (feedbacks.reduce((a, b) => a + (b.overallRating || 4), 0) / feedbacks.length).toFixed(2) : '4.75';

        return {
          title: `Faculty Academic Dossier - ${faculty.name}`,
          subtitle: `Emp Code: ${faculty.employeeId} • ${faculty.designation} • ${dept?.name || 'Department'}`,
          recordType: 'FACULTY',
          referenceId: faculty.employeeId,
          headerFields: [
            { label: 'Faculty Name', value: faculty.name },
            { label: 'Employee Code', value: faculty.employeeId },
            { label: 'Designation', value: faculty.designation },
            { label: 'Department', value: dept?.name || 'Computer Engineering' },
            { label: 'Constituent Institute', value: inst?.name || 'Swarrnim Institute of Technology' },
            { label: 'Qualification', value: faculty.qualification || 'M.Tech, Ph.D (Pursuing)' },
            { label: 'Specialization', value: faculty.specialization || 'Distributed Systems & Cloud' },
            { label: 'Status', value: faculty.status, badgeVariant: 'active' }
          ],
          sections: [
            {
              title: '1. Teaching Workload & Session Allocations',
              metrics: [
                { label: 'Weekly Teaching Hours', value: '16 Hours / Week' },
                { label: 'Allocated Theory Subjects', value: '2 Subjects' },
                { label: 'Allocated Practical Labs', value: '2 Lab Batches' },
                { label: 'Student Feedback Rating', value: `${avgScore} / 5.0`, color: '#34A853' }
              ],
              table: {
                headers: ['Subject Code', 'Subject Name', 'Semester', 'Weekly Hours', 'Type', 'Status'],
                rows: [
                  ['CS-401', 'Data Structures & Algorithms', 'Sem 4', '4 Hrs/Wk', 'Theory', 'Active'],
                  ['CS-405', 'Web Application Development Lab', 'Sem 4', '4 Hrs/Wk', 'Practical Lab', 'Active'],
                  ['CS-601', 'Advanced Cloud Infrastructure', 'Sem 6', '4 Hrs/Wk', 'Theory', 'Active'],
                  ['CS-604', 'Project Phase 1 Guidance', 'Sem 6', '4 Hrs/Wk', 'Project Studio', 'Active']
                ]
              }
            },
            {
              title: '2. Institutional EDP Duties & Committee Assignments',
              table: {
                headers: ['Duty Code', 'Event Title', 'Event Category', 'Duty Date', 'Venue / Hall', 'Duty Status'],
                rows: duties.length > 0
                  ? duties.map(d => [d.dutyCode, d.eventName, d.eventType, d.dutyDate, d.venue || 'Campus', d.status])
                  : [
                      ['EDP-101', 'University End-Sem Exam Invigilation', 'EXAM_INVIGILATION', '18 Aug 2026', 'Block A - Hall 201', 'COMPLETED'],
                      ['EDP-102', 'NAAC Criterion 2 Data Verification', 'NAAC_AUDIT', '10 Aug 2026', 'IQAC Central Boardroom', 'COMPLETED'],
                      ['EDP-103', 'Student TechFest Hackathon Mentor', 'WORKSHOP', '02 Aug 2026', 'Auditorium Dome', 'COMPLETED']
                    ]
              }
            }
          ]
        };
      }

      case 'FEE_ACCOUNT': {
        const feeRecord = db.getStudentFeeRecords().find(f => f.id === recordId || f.enrollmentNo === recordId) || db.getStudentFeeRecords()[0];
        if (!feeRecord) return null;
        const payments = db.getFeePaymentTransactions().filter(p => p.studentFeeRecordId === feeRecord.id || p.enrollmentNo === feeRecord.enrollmentNo);

        return {
          title: `Student Financial Account Statement - ${feeRecord.studentName}`,
          subtitle: `Account ID: ${feeRecord.id} • Enrollment: ${feeRecord.enrollmentNo} • SSIU Finance Bureau`,
          recordType: 'FEE_ACCOUNT',
          referenceId: feeRecord.enrollmentNo,
          headerFields: [
            { label: 'Student Name', value: feeRecord.studentName },
            { label: 'Enrollment No', value: feeRecord.enrollmentNo },
            { label: 'Total Invoiced Fee', value: `₹${feeRecord.totalAmount.toLocaleString()}` },
            { label: 'Total Realized / Paid', value: `₹${feeRecord.paidAmount.toLocaleString()}` },
            { label: 'Outstanding Balance', value: `₹${feeRecord.pendingAmount.toLocaleString()}` },
            { label: 'Due Date', value: feeRecord.dueDate || '2026-08-30' },
            { label: 'Account Status', value: feeRecord.status, badgeVariant: feeRecord.status === 'PAID' ? 'active' : 'orange' }
          ],
          sections: [
            {
              title: 'Fee Head Breakdown & Invoiced Components',
              table: {
                headers: ['Fee Head Component', 'Term / Sem', 'Invoiced Amount', 'Paid Amount', 'Pending Amount', 'Head Status'],
                rows: [
                  ['Tuition & Academic Training Fee', 'Term 1 (AY 2026-27)', '₹60,000', `₹${Math.min(60000, feeRecord.paidAmount).toLocaleString()}`, `₹${Math.max(0, 60000 - feeRecord.paidAmount).toLocaleString()}`, feeRecord.paidAmount >= 60000 ? 'SETTLED' : 'PARTIAL'],
                  ['University Exam & Examination Board Fee', 'Term 1 (AY 2026-27)', '₹15,000', `₹${Math.min(15000, Math.max(0, feeRecord.paidAmount - 60000)).toLocaleString()}`, `₹${Math.max(0, 15000 - Math.max(0, feeRecord.paidAmount - 60000)).toLocaleString()}`, feeRecord.paidAmount >= 75000 ? 'SETTLED' : 'PENDING'],
                  ['Lab, Computing & Internet Amenities', 'Term 1 (AY 2026-27)', '₹10,000', `₹${Math.min(10000, Math.max(0, feeRecord.paidAmount - 75000)).toLocaleString()}`, `₹${Math.max(0, 10000 - Math.max(0, feeRecord.paidAmount - 75000)).toLocaleString()}`, feeRecord.paidAmount >= 85000 ? 'SETTLED' : 'PENDING']
                ]
              }
            },
            {
              title: 'Official Transaction & Payment Receipts Log',
              table: {
                headers: ['Receipt No', 'Transaction Date', 'Payment Channel', 'Reference UTR', 'Amount (INR)', 'Settlement'],
                rows: payments.length > 0
                  ? payments.map(p => [p.receiptNo || 'REC-901', p.paymentDate || '2026-07-20', p.paymentMode || 'Online UPI', p.transactionId || 'UTR99882211', `₹${p.paidAmount.toLocaleString()}`, 'CLEARED'])
                  : [['REC-2026-901', '15 Jul 2026', 'Net Banking', 'HDFC-8899221133', '₹50,000', 'CLEARED'], ['REC-2026-902', '10 Aug 2026', 'Online UPI', 'UPI-9922114455', '₹35,000', 'CLEARED']]
              }
            }
          ]
        };
      }

      default: {
        return {
          title: `Single Record Report - ${type}`,
          subtitle: `Reference Identifier: ${recordId} • Swarrnim Startup & Innovation University`,
          recordType: type,
          referenceId: recordId,
          headerFields: [
            { label: 'Record Type', value: type },
            { label: 'Reference ID', value: recordId },
            { label: 'Generated On', value: new Date().toLocaleDateString('en-US') },
            { label: 'Status', value: 'ACTIVE', badgeVariant: 'active' }
          ],
          sections: [
            {
              title: 'Record Attributes & Audit Trail',
              table: {
                headers: ['Property', 'Value', 'Verification'],
                rows: [
                  ['Entity Class', type, 'Verified'],
                  ['System Tracking ID', recordId, 'Valid'],
                  ['Compliance Status', 'UGC / NAAC Audit Pass', 'Compliant'],
                  ['Last Synchronized', new Date().toISOString(), 'Synchronized']
                ]
              }
            }
          ]
        };
      }
    }
  }

  // =========================================================================
  // 2. FILTER-WISE REPORT GENERATOR
  // =========================================================================

  public generateFilteredReport(
    moduleCategory: string,
    filters: ReportFilterOptions,
    role?: string | null,
    user?: any
  ): MultiRecordReportData {
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const inst = filters.instituteId && filters.instituteId !== 'ALL' ? db.getInstituteById(filters.instituteId)?.name : 'All Institutes';
    const dept = filters.departmentId && filters.departmentId !== 'ALL' ? db.getDepartmentById(filters.departmentId)?.name : 'All Departments';
    const prog = filters.programId && filters.programId !== 'ALL' ? db.getProgramById(filters.programId)?.name : 'All Programs';
    const ay = filters.academicYearId && filters.academicYearId !== 'ALL' ? db.getAcademicYears().find(a => a.id === filters.academicYearId)?.name : 'Current AY (2026-27)';
    const sem = filters.semesterId && filters.semesterId !== 'ALL' ? filters.semesterId.replace('sem-', 'Semester ') : 'All Semesters';

    const appliedFilterList = [
      { label: 'Institute', value: inst || 'All' },
      { label: 'Department', value: dept || 'All' },
      { label: 'Program', value: prog || 'All' },
      { label: 'Academic Year', value: ay || '2026-27' },
      { label: 'Semester', value: sem || 'All' },
      filters.status && filters.status !== 'ALL' ? { label: 'Status', value: filters.status } : null,
      filters.paymentStatus && filters.paymentStatus !== 'ALL' ? { label: 'Payment Status', value: filters.paymentStatus } : null,
      filters.attendanceStatus && filters.attendanceStatus !== 'ALL' ? { label: 'Attendance Filter', value: filters.attendanceStatus } : null,
      filters.searchQuery ? { label: 'Search Query', value: filters.searchQuery } : null
    ].filter(Boolean) as { label: string; value: string }[];

    switch (moduleCategory) {
      case 'ATTENDANCE':
      case 'ATTENDANCE_SUMMARY': {
        let students = db.getStudents();
        if (filters.instituteId && filters.instituteId !== 'ALL') students = students.filter(s => s.instituteId === filters.instituteId);
        if (filters.departmentId && filters.departmentId !== 'ALL') students = students.filter(s => s.departmentId === filters.departmentId);
        if (filters.programId && filters.programId !== 'ALL') students = students.filter(s => s.programId === filters.programId);
        if (filters.semesterId && filters.semesterId !== 'ALL') students = students.filter(s => s.semesterId === filters.semesterId);

        const rowsWithStats = students.map(s => {
          const stats = db.getStudentAttendanceStats(s.id);
          const studentDept = db.getDepartmentById(s.departmentId);
          return {
            student: s,
            dept: studentDept?.name || 'Computer Engineering',
            stats
          };
        });

        let filtered = rowsWithStats;
        if (filters.attendanceStatus === 'LOW_ATTENDANCE' || filters.attendanceStatus === 'CRITICAL') {
          filtered = filtered.filter(item => item.stats.percentage < 75);
        } else if (filters.attendanceStatus === 'REGULAR') {
          filtered = filtered.filter(item => item.stats.percentage >= 75);
        }

        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(item => item.student.name.toLowerCase().includes(q) || item.student.enrollmentNo.toLowerCase().includes(q));
        }

        const total = filtered.length;
        const eligibleCount = filtered.filter(f => f.stats.percentage >= 75).length;
        const shortageCount = total - eligibleCount;
        const avgPercentage = total > 0 ? (filtered.reduce((a, b) => a + b.stats.percentage, 0) / total).toFixed(1) : '0.0';

        const tableHeaders = ['Enrollment No', 'Student Name', 'Department', 'Sem / Div', 'Conducted', 'Present', 'Attendance %', 'Status / Notice'];
        const tableRows = filtered.map(item => [
          item.student.enrollmentNo,
          item.student.name,
          item.dept,
          `${item.student.semesterId?.replace('sem-', 'Sem ') || 'Sem 4'}`,
          item.stats.totalClasses,
          item.stats.presentClasses,
          `${item.stats.percentage}%`,
          item.stats.percentage >= 75 ? 'REGULAR (ELIGIBLE)' : 'SHORTAGE (NOTICE ISSUED)'
        ]);

        return {
          reportTitle: filters.attendanceStatus === 'LOW_ATTENDANCE' ? 'SSIU Low Attendance & Shortage Report (< 75%)' : 'SSIU Comprehensive Attendance & Classroom Engagement Report',
          moduleName: 'Attendance',
          generatedDate: timestamp,
          generatedBy: user?.name ? `${user.name} (${role || 'STAFF'})` : 'Authorized ERP Officer',
          appliedFilters: appliedFilterList,
          totalCount: total,
          summaryMetrics: [
            { label: 'Total Audited Students', value: total, sublabel: 'Matching Filters' },
            { label: 'Eligible (>= 75%)', value: eligibleCount, percentage: this.calcPercentage(eligibleCount, total), color: '#34A853', sublabel: `${this.calcPercentage(eligibleCount, total)}% Compliance` },
            { label: 'Shortage (< 75%)', value: shortageCount, percentage: this.calcPercentage(shortageCount, total), color: '#EA4335', sublabel: `${this.calcPercentage(shortageCount, total)}% Action Required` },
            { label: 'Batch Avg Attendance', value: `${avgPercentage}%`, color: '#0F2C59', sublabel: 'Average Presence' }
          ],
          distributionCharts: [
            {
              title: 'Attendance Compliance Distribution',
              type: 'DONUT',
              data: [
                { label: 'Regular (>= 75%)', value: eligibleCount, percentage: this.calcPercentage(eligibleCount, total), color: '#34A853' },
                { label: 'Shortage (< 75%)', value: shortageCount, percentage: this.calcPercentage(shortageCount, total), color: '#EA4335' }
              ]
            }
          ],
          headers: tableHeaders,
          rows: tableRows
        };
      }

      case 'FEES':
      case 'FEES_OUTSTANDING':
      case 'FEE_PAYMENTS': {
        let feeRecords = db.getStudentFeeRecords();
        if (filters.paymentStatus === 'PAID') feeRecords = feeRecords.filter(f => f.status === 'PAID');
        if (filters.paymentStatus === 'PENDING') feeRecords = feeRecords.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL');
        if (filters.paymentStatus === 'OVERDUE') feeRecords = feeRecords.filter(f => f.pendingAmount > 0);

        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          feeRecords = feeRecords.filter(f => f.studentName.toLowerCase().includes(q) || f.enrollmentNo.toLowerCase().includes(q));
        }

        const totalRecords = feeRecords.length;
        const totalDemand = feeRecords.reduce((a, b) => a + b.totalAmount, 0);
        const totalCollected = feeRecords.reduce((a, b) => a + b.paidAmount, 0);
        const totalPending = feeRecords.reduce((a, b) => a + b.pendingAmount, 0);
        const collectionRate = this.calcPercentage(totalCollected, totalDemand);

        const tableHeaders = ['Enrollment No', 'Student Name', 'Academic Session', 'Total Invoiced', 'Paid Amount', 'Pending Amount', 'Due Date', 'Status'];
        const tableRows = feeRecords.map(f => [
          f.enrollmentNo,
          f.studentName,
          f.academicYearId || 'AY 2026-27',
          `₹${f.totalAmount.toLocaleString()}`,
          `₹${f.paidAmount.toLocaleString()}`,
          `₹${f.pendingAmount.toLocaleString()}`,
          f.dueDate || '2026-08-30',
          f.status
        ]);

        return {
          reportTitle: 'SSIU Fee Collection & Outstanding Demand Report',
          moduleName: 'Fees & Finance',
          generatedDate: timestamp,
          generatedBy: user?.name ? `${user.name} (${role || 'FINANCE'})` : 'Finance Accounts Desk',
          appliedFilters: appliedFilterList,
          totalCount: totalRecords,
          summaryMetrics: [
            { label: 'Total Fee Demand', value: `₹${(totalDemand / 100000).toFixed(2)} L`, sublabel: `${totalRecords} Accounts` },
            { label: 'Total Realized', value: `₹${(totalCollected / 100000).toFixed(2)} L`, percentage: collectionRate, color: '#34A853', sublabel: `${collectionRate}% Collected` },
            { label: 'Total Outstanding', value: `₹${(totalPending / 100000).toFixed(2)} L`, percentage: this.calcPercentage(totalPending, totalDemand), color: '#EA4335', sublabel: 'Pending Invoices' },
            { label: 'Fully Paid Accounts', value: feeRecords.filter(f => f.status === 'PAID').length, color: '#34A853', sublabel: 'Settled' }
          ],
          distributionCharts: [
            {
              title: 'Fee Collection Realization',
              type: 'DONUT',
              data: [
                { label: 'Collected Revenue', value: totalCollected, percentage: collectionRate, color: '#34A853' },
                { label: 'Pending Dues', value: totalPending, percentage: this.calcPercentage(totalPending, totalDemand), color: '#EA4335' }
              ]
            }
          ],
          headers: tableHeaders,
          rows: tableRows
        };
      }

      case 'STUDENTS':
      case 'STUDENTS_ROSTER':
      default: {
        let students = db.getStudents();
        if (filters.instituteId && filters.instituteId !== 'ALL') students = students.filter(s => s.instituteId === filters.instituteId);
        if (filters.departmentId && filters.departmentId !== 'ALL') students = students.filter(s => s.departmentId === filters.departmentId);
        if (filters.programId && filters.programId !== 'ALL') students = students.filter(s => s.programId === filters.programId);
        if (filters.semesterId && filters.semesterId !== 'ALL') students = students.filter(s => s.semesterId === filters.semesterId);
        if (filters.status && filters.status !== 'ALL') students = students.filter(s => s.status === filters.status);
        if (filters.gender && filters.gender !== 'ALL') students = students.filter(s => s.gender === filters.gender);

        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          students = students.filter(s => s.name.toLowerCase().includes(q) || s.enrollmentNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
        }

        const total = students.length;
        const activeCount = students.filter(s => s.status === 'ACTIVE').length;
        const activePct = this.calcPercentage(activeCount, total);

        const tableHeaders = ['Enrollment No', 'Student Name', 'Department', 'Program', 'Semester', 'Email Address', 'Mobile No', 'Status'];
        const tableRows = students.map(s => {
          const studentDept = db.getDepartmentById(s.departmentId);
          const studentProg = db.getProgramById(s.programId);
          return [
            s.enrollmentNo,
            s.name,
            studentDept?.name || 'Engineering',
            studentProg?.name || 'B.Tech CSE',
            s.semesterId?.replace('sem-', 'Sem ') || 'Sem 4',
            s.email,
            s.phone || '+91 98765 43210',
            s.status
          ];
        });

        return {
          reportTitle: 'SSIU Enrolled Student Roster & Demographic Directory',
          moduleName: 'Students',
          generatedDate: timestamp,
          generatedBy: user?.name ? `${user.name} (${role || 'ADMIN'})` : 'University Administrator',
          appliedFilters: appliedFilterList,
          totalCount: total,
          summaryMetrics: [
            { label: 'Total Enrolled Scholars', value: total, sublabel: 'Directory Count' },
            { label: 'Active Students', value: activeCount, percentage: activePct, color: '#34A853', sublabel: `${activePct}% On Roster` },
            { label: 'Inactive / Alumni', value: total - activeCount, color: '#94A3B8', sublabel: 'Graduated / On Leave' },
            { label: 'Mapped Institutes', value: db.getInstitutes().length, color: '#0F2C59', sublabel: 'Constituent Schools' }
          ],
          headers: tableHeaders,
          rows: tableRows
        };
      }
    }
  }

  // =========================================================================
  // 3. DASHBOARD-WISE REPORT GENERATOR
  // =========================================================================

  public generateDashboardReport(
    dashboardType: DashboardReportType,
    currentFilters: ReportFilterOptions,
    role?: string | null,
    user?: any
  ): MultiRecordReportData {
    switch (dashboardType) {
      case 'CAMPUS_HOME': {
        const timestamp = new Date().toLocaleString('en-IN');
        const students = db.getStudents();
        const faculty = db.getFaculty();
        const finance = db.getFinanceOverviewStats();
        const requests = db.getApprovalRequests();

        return {
          reportTitle: 'Swarrnim University Central Campus Executive Report',
          moduleName: 'Campus Home Overview',
          generatedDate: timestamp,
          generatedBy: user?.name ? `${user.name} (${role || 'EXECUTIVE'})` : 'Vice Chancellor Secretariat',
          appliedFilters: [{ label: 'Scope', value: 'University Headquarters & All Constituent Schools' }, { label: 'Academic Session', value: 'AY 2026-27' }],
          totalCount: students.length,
          summaryMetrics: [
            { label: 'Total Enrolled Students', value: students.length, color: '#F37023', sublabel: `${this.calcPercentage(students.filter(s => s.status === 'ACTIVE').length, students.length)}% Active` },
            { label: 'Active Faculty on Roster', value: faculty.length, color: '#0F2C59', sublabel: '1:18 Student-Faculty Ratio' },
            { label: 'Daily Attendance Benchmark', value: '92.4%', color: '#34A853', sublabel: '1,185 Present Today' },
            { label: 'Revenue Realization', value: `₹${(finance.totalCollected / 100000).toFixed(2)} L`, color: '#34A853', sublabel: `${finance.collectionPercentage}% Collected` },
            { label: 'Outstanding Demand', value: `₹${(finance.totalPending / 100000).toFixed(2)} L`, color: '#EA4335', sublabel: 'Term 2 Invoices' },
            { label: 'Pending Central Approvals', value: requests.filter(r => r.status === 'PENDING').length, color: '#FBBC05', sublabel: 'Approval Desk' }
          ],
          distributionCharts: [
            {
              title: 'Student Enrollment Distribution',
              type: 'DONUT',
              data: [
                { label: 'Regular B.Tech/B.Sc', value: Math.round(students.length * 0.82), percentage: 82, color: '#4285F4' },
                { label: 'Lateral Entry (D2D)', value: Math.round(students.length * 0.12), percentage: 12, color: '#34A853' },
                { label: 'Management / NRI Quota', value: Math.round(students.length * 0.06), percentage: 6, color: '#FBBC05' }
              ]
            },
            {
              title: 'Fee Realization vs Pending',
              type: 'DONUT',
              data: [
                { label: 'Collected Fee', value: finance.totalCollected, percentage: finance.collectionPercentage, color: '#34A853' },
                { label: 'Pending Fee', value: finance.totalPending, percentage: Number((100 - finance.collectionPercentage).toFixed(1)), color: '#EA4335' }
              ]
            }
          ],
          headers: ['Constituent Institute', 'Departments', 'Active Programs', 'Faculty Strength', 'Student Enrollment', 'Audit Status'],
          rows: db.getInstitutes().map(i => {
            const instDepts = db.getDepartments().filter(d => d.instituteId === i.id);
            const instProgs = db.getPrograms().filter(p => instDepts.some(d => d.id === p.departmentId));
            const instFaculty = db.getFaculty().filter(f => f.instituteId === i.id);
            const instStudents = db.getStudents().filter(s => s.instituteId === i.id);
            return [
              i.name,
              `${instDepts.length} Departments`,
              `${instProgs.length} Programs`,
              `${instFaculty.length || 18} Faculty`,
              `${instStudents.length || 240} Students`,
              'NAAC AUDITED'
            ];
          })
        };
      }

      case 'ATTENDANCE':
        return this.generateFilteredReport('ATTENDANCE', currentFilters, role, user);

      case 'FEES':
        return this.generateFilteredReport('FEES', currentFilters, role, user);

      case 'ADMISSION': {
        const timestamp = new Date().toLocaleString('en-IN');
        const leads = db.getCRMLeads();
        const apps = db.getAdmissionApplications();
        const converted = apps.filter(a => a.status === 'CONVERTED').length;
        const approved = apps.filter(a => a.status === 'APPROVED').length;
        const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;

        return {
          reportTitle: 'SSIU Admission & CRM Conversion Funnel Report',
          moduleName: 'Admissions & CRM',
          generatedDate: timestamp,
          generatedBy: user?.name ? `${user.name} (${role || 'ADMISSION_OFFICER'})` : 'Admissions Bureau',
          appliedFilters: [{ label: 'Academic Session', value: 'AY 2026-27 Intake' }],
          totalCount: apps.length || leads.length,
          summaryMetrics: [
            { label: 'Total Inquiries / Leads', value: leads.length || 500, sublabel: 'CRM Campaign' },
            { label: 'Submitted Applications', value: apps.length || 420, percentage: 84.0, color: '#4285F4', sublabel: '84.0% Conversion' },
            { label: 'Shortlisted & Approved', value: shortlisted + approved || 300, percentage: 60.0, color: '#FBBC05', sublabel: 'Eligible Candidates' },
            { label: 'Converted to Students', value: converted || 280, percentage: 56.0, color: '#34A853', sublabel: '56.0% Seat Realization' }
          ],
          headers: ['Application No', 'Applicant Name', 'Program Applied', 'Email', 'Phone', 'Status'],
          rows: (apps.length > 0 ? apps : [
            { id: 'APP-2026-001', applicantName: 'Karan Patel', programId: 'B.Tech CSE', email: 'karan@example.com', phone: '+91 98765 00001', status: 'CONVERTED' },
            { id: 'APP-2026-002', applicantName: 'Sneha Shah', programId: 'B.Tech AI-DS', email: 'sneha@example.com', phone: '+91 98765 00002', status: 'APPROVED' },
            { id: 'APP-2026-003', applicantName: 'Rahul Mehta', programId: 'B.Tech IT', email: 'rahul@example.com', phone: '+91 98765 00003', status: 'DOCUMENT_VERIFICATION' }
          ]).map((a: any) => [
            a.id || 'APP-2026-101',
            a.applicantName || 'Applicant',
            a.programId || 'B.Tech CSE',
            a.email || 'applicant@email.com',
            a.phone || '+91 98765 43210',
            a.status || 'CONVERTED'
          ])
        };
      }

      case 'EXAMINATION': {
        const timestamp = new Date().toLocaleString('en-IN');
        const exams = db.getExams();
        const results = db.getStudentResults();

        return {
          reportTitle: 'SSIU Examination Series & NAAC Grading Outcomes Report',
          moduleName: 'Examination Cell',
          generatedDate: timestamp,
          generatedBy: user?.name ? `${user.name} (${role || 'CONTROLLER_OF_EXAMS'})` : 'Controller of Examinations',
          appliedFilters: [{ label: 'Exam Cycle', value: 'Summer / Winter 2026 Series' }],
          totalCount: results.length || 100,
          summaryMetrics: [
            { label: 'Total Evaluated Scholars', value: results.length || 1284, sublabel: 'Registered Candidates' },
            { label: 'Pass Rate Benchmark', value: '94.2%', percentage: 94.2, color: '#34A853', sublabel: 'NAAC Standard' },
            { label: 'Distinction & 1st Class', value: '78.5%', percentage: 78.5, color: '#0F2C59', sublabel: 'SGPA >= 7.5' },
            { label: 'Remedial Backlogs Pending', value: '5.8%', percentage: 5.8, color: '#EA4335', sublabel: 'Remedial Exams Scheduled' }
          ],
          headers: ['Exam Code', 'Exam Title', 'Exam Type', 'Registered Candidates', 'Form Deadline', 'Pass %', 'Series Status'],
          rows: exams.map(e => [
            e.id,
            e.name,
            e.type,
            '420 Candidates',
            e.formDeadline || '2026-05-15',
            '94.2%',
            e.status
          ])
        };
      }

      default:
        return this.generateFilteredReport(dashboardType, currentFilters, role, user);
    }
  }

  // =========================================================================
  // 4. EXPORT ENGINE (PDF, EXCEL MULTI-SHEET, PRINT)
  // =========================================================================

  public exportExcel(reportData: MultiRecordReportData) {
    const timestamp = reportData.generatedDate;
    const filterStr = reportData.appliedFilters.map(f => `${f.label}: ${f.value}`).join(' | ') || 'All Records';

    const lines: string[] = [
      `"SWARRNIM STARTUP & INNOVATION UNIVERSITY"`,
      `"OFFICIAL INSTITUTIONAL ERP DATA REPORT"`,
      `"Report Title: ${reportData.reportTitle}"`,
      `"Module: ${reportData.moduleName}"`,
      `"Generated On: ${timestamp}"`,
      `"Generated By: ${reportData.generatedBy}"`,
      `"Applied Filters: ${filterStr}"`,
      `"Total Records: ${reportData.totalCount}"`,
      `""`,
      `"==================== SHEET 1: EXECUTIVE SUMMARY METRICS ===================="`,
      `"Metric Label","Metric Value","Percentage / Proportion","Benchmark"`
    ];

    reportData.summaryMetrics.forEach(m => {
      lines.push(`"${m.label}","${m.value}","${m.percentage !== undefined ? m.percentage + '%' : 'N/A'}","${m.sublabel || ''}"`);
    });

    lines.push(`""`);
    lines.push(`"==================== SHEET 2: ITEMIZED DATA RECORDS ===================="`);
    lines.push(reportData.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

    reportData.rows.forEach(row => {
      const formattedRow = row.map(cell => {
        const str = cell === null || cell === undefined ? '' : String(cell);
        return `"${str.replace(/"/g, '""')}"`;
      });
      lines.push(formattedRow.join(','));
    });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `SSIU_${reportData.moduleName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.addHistory({
      reportName: reportData.reportTitle,
      reportMode: 'FILTERED',
      moduleOrType: reportData.moduleName,
      generatedBy: reportData.generatedBy,
      recordCount: reportData.totalCount,
      filtersSummary: filterStr,
      exportFormat: 'EXCEL'
    });
  }

  public exportSingleRecordExcel(dossier: SingleRecordDossier, generatedBy: string) {
    const lines: string[] = [
      `"SWARRNIM STARTUP & INNOVATION UNIVERSITY"`,
      `"OFFICIAL SINGLE RECORD DOSSIER"`,
      `"Title: ${dossier.title}"`,
      `"Reference: ${dossier.referenceId}"`,
      `"Generated By: ${generatedBy}"`,
      `"Generated Date: ${new Date().toLocaleString('en-IN')}"`,
      `""`,
      `"==================== PROFILE ATTRIBUTES ===================="`,
      ...dossier.headerFields.map(f => `"${f.label}","${f.value}"`),
      `""`
    ];

    dossier.sections.forEach((sec, idx) => {
      lines.push(`"==================== SECTION ${idx + 1}: ${sec.title.toUpperCase()} ===================="`);
      if (sec.metrics) {
        lines.push(`"Metric","Value","Sublabel"`);
        sec.metrics.forEach(m => lines.push(`"${m.label}","${m.value}","${m.sublabel || ''}"`));
        lines.push(`""`);
      }
      if (sec.table) {
        lines.push(sec.table.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
        sec.table.rows.forEach(r => {
          lines.push(r.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','));
        });
        lines.push(`""`);
      }
    });

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `SSIU_${dossier.recordType}_${dossier.referenceId}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.addHistory({
      reportName: dossier.title,
      reportMode: 'SINGLE',
      moduleOrType: dossier.recordType,
      generatedBy,
      recordCount: 1,
      filtersSummary: `Record ID: ${dossier.referenceId}`,
      exportFormat: 'EXCEL'
    });
  }

  public triggerPrint(reportTitle: string, moduleName: string, generatedBy: string, filterStr: string, recordCount: number) {
    this.addHistory({
      reportName: reportTitle,
      reportMode: 'FILTERED',
      moduleOrType: moduleName,
      generatedBy,
      recordCount,
      filtersSummary: filterStr,
      exportFormat: 'PRINT'
    });
    window.print();
  }
}

export const reportEngine = new ReportEngineService();
