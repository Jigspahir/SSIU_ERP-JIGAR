import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { ChartBar as BarChart3, FileSpreadsheet, Printer, Search, ListFilter as Filter, GraduationCap, BookOpen, Users, IndianRupee, Clock, CircleCheck as CheckCircle2, ShieldAlert, FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user, role } = useAuth();

  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const programs = db.getPrograms();
  const semesters = db.getSemesters();
  const subjects = db.getSubjects();
  const facultyList = db.getFaculty();
  const studentsList = db.getStudents();
  const feeRecords = db.getStudentFeeRecords();
  const paymentTransactions = db.getFeePaymentTransactions();
  const leads = db.getCRMLeads();
  const applications = db.getAdmissionApplications();
  const assignments = db.getAssignments();
  const submissions = db.getAssignmentSubmissions();
  
  const financeStats = db.getFinanceOverviewStats();

  // Tab State
  const [activeReportTab, setActiveReportTab] = useState<'ACADEMIC' | 'FINANCE' | 'CRM'>('ACADEMIC');

  // Filters State
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState('2025-05-30');
  const [searchQuery, setSearchQuery] = useState('');

  // Exports
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- STUDENT PERSONALIZED REPORT VIEW ---
  if (role === 'STUDENT') {
    const student = studentsList.find(s => s.id === user?.id || s.enrollmentNo === user?.enrollmentNo) || studentsList[0];
    const attStats = db.getStudentAttendanceStats(student.id);
    const mySubmissions = submissions.filter(s => s.studentId === student.id);
    const myFee = feeRecords.find(f => f.studentId === student.id) || feeRecords[0];
    const myApp = applications.find(a => a.email === student.email || a.studentId === student.id);

    const paidPct = myFee ? Math.round((myFee.paidAmount / Math.max(1, myFee.totalAmount)) * 100) : 0;

    const exportStudentReport = () => {
      const headers = ['Metric', 'Details / Status', 'Value / Score'];
      const rows = [
        ['Overall Attendance', 'Classes Attended vs Conducted', `${attStats.presentClasses} / ${attStats.totalClasses} (${attStats.percentage}%)`],
        ['Assignments Submitted', 'Graded & Submitted Work', `${mySubmissions.length} Submitted`],
        ['Tuition Fees Details', 'Total Fee Demand', `₹${myFee?.totalAmount.toLocaleString()}`],
        ['Fees Paid Amount', 'Received Settled', `₹${myFee?.paidAmount.toLocaleString()}`],
        ['Fees Pending Amount', 'Outstanding Balance', `₹${myFee?.pendingAmount.toLocaleString()}`],
        ['Admission Status', 'Admissions Status Badge', myApp ? myApp.status : 'CONVERTED']
      ];
      handleExportCSV(`swarrnim-report-card-${student.enrollmentNo}`, headers, rows);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              My Academic Report Card
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Personalized overview of academic attendance, coursework submissions, and financial ledgers
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print Report
            </button>
            <button className="btn btn-primary" onClick={exportStudentReport}>
              <FileSpreadsheet size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Overview Stats for Student */}
        <div className="grid-4">
          <StatCard title="Overall Attendance" value={`${attStats.percentage}%`} subtitle={`${attStats.presentClasses} / ${attStats.totalClasses} Conducted`} icon={Clock} colorScheme={attStats.percentage >= 75 ? 'green' : 'orange'} />
          <StatCard title="Coursework Submissions" value={mySubmissions.length} subtitle="Assignments submitted" icon={GraduationCap} colorScheme="navy" />
          <StatCard title="Pending Fees Dues" value={`₹${myFee?.pendingAmount.toLocaleString()}`} subtitle={`Due: ${myFee?.dueDate}`} icon={IndianRupee} colorScheme={myFee?.pendingAmount === 0 ? 'green' : 'orange'} />
          <StatCard title="Admission status" value={myApp?.status || 'CONVERTED'} subtitle="Admission Application Verified" icon={CheckCircle2} colorScheme="green" />
        </div>

        <div className="grid-2">
          {/* Attendance Breakdown */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Subject-wise Attendance Statistics
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Conduct Details</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(s => {
                    const stats = attStats.subjectStats[s.id] || { total: 0, present: 0 };
                    const pct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700 }}>{s.name} ({s.code})</td>
                        <td>{stats.present} / {stats.total} Classes</td>
                        <td style={{ fontWeight: 800 }}>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fee & Financial Summary */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Fee Account Status Ledger
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tuition Fees:</span>
                <strong>₹{myFee?.tuitionFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lab &amp; Equipment Fees:</span>
                <strong>₹{myFee?.labFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Development Fees:</span>
                <strong>₹{myFee?.developmentFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hostel Lodging Fees:</span>
                <strong>₹{myFee?.hostelFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'var(--brand-navy)' }}>
                <span>TOTAL PAID BALANCE:</span>
                <span style={{ color: '#10B981' }}>₹{myFee?.paidAmount.toLocaleString()} ({paidPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FACULTY SCOPED REPORTS ---
  if (role === 'FACULTY') {
    const faculty = facultyList.find(f => f.email === user?.email) || facultyList[0];
    const mySubjects = subjects.filter(s => faculty.subjectIds?.includes(s.id));

    // Scoped Attendance Trends & Student Stats
    const handleExportFacultyReport = () => {
      const headers = ['Subject Code', 'Subject Name', 'Enrolled Divisions', 'Average Attendance'];
      const rows = mySubjects.map(s => [
        s.code,
        s.name,
        'Division A',
        `${(() => { const subSessions = db.getAttendanceSessions().filter(a => a.subjectId === s.id); const total = subSessions.reduce((sum, a) => sum + a.records.length, 0); const present = subSessions.reduce((sum, a) => sum + a.records.filter(r => r.status === 'PRESENT').length, 0); return total > 0 ? Math.round((present / total) * 100) : 0; })()}%`
      ]);
      handleExportCSV(`faculty-subject-report-${faculty.employeeId}`, headers, rows);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Assigned Subjects &amp; Academic Reports
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Review class academic performance, average attendance trends, and coursework grades
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print Reports
            </button>
            <button className="btn btn-primary" onClick={handleExportFacultyReport}>
              <FileSpreadsheet size={16} /> Export Excel
            </button>
          </div>
        </div>

        {/* Assigned Subjects Summary Cards */}
        <div className="grid-2">
          {mySubjects.map(sub => (
            <div key={sub.id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-orange)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>{sub.code}</span>
                <Badge variant="active">{sub.type}</Badge>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                {sub.name}
              </h3>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <div>Lectures/Week: <strong>{sub.theoryHoursPerWeek} Hrs</strong></div>
                <div>Class Average Attendance: <strong style={{ color: '#10B981' }}>{(() => { const subSessions = db.getAttendanceSessions().filter(a => a.subjectId === sub.id); const total = subSessions.reduce((sum, a) => sum + a.records.length, 0); const present = subSessions.reduce((sum, a) => sum + a.records.filter(r => r.status === 'PRESENT').length, 0); return total > 0 ? Math.round((present / total) * 100) : 0; })()}%</strong></div>
                <div>Course Credits: <strong>{sub.credits} Credits</strong></div>
              </div>
            </div>
          ))}
        </div>

        {/* Student Performance List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            Enrolled Students Academic Progress
          </h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Student Name</th>
                  <th>Attendance %</th>
                  <th>DBMS Assignment Score</th>
                  <th>Academic Status</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.slice(0, 3).map(stu => {
                  const att = db.getStudentAttendanceStats(stu.id);
                  return (
                    <tr key={stu.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-orange)' }}>{stu.enrollmentNo}</td>
                      <td style={{ fontWeight: 700 }}>{stu.name}</td>
                      <td>{att.percentage}%</td>
                      <td>{submissions.filter(sub => sub.studentId === stu.id).length} submitted</td>
                      <td><Badge variant={att.percentage >= 75 ? 'active' : 'inactive'}>{att.percentage >= 75 ? 'Eligible' : 'Warning'}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN MASTER REPORTS ---
  // Filters Logic for Directories
  const filteredStudents = studentsList.filter(s => {
    const matchesDept = selectedDept === 'ALL' || s.departmentId === selectedDept;
    const matchesSem = selectedSem === 'ALL' || s.semesterId === selectedSem;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.enrollmentNo.includes(searchQuery);
    return matchesDept && matchesSem && matchesSearch;
  });

  const exportAdminAcademicReport = () => {
    const headers = ['Enrollment No', 'Student Name', 'Department', 'Semester', 'Attendance Rate'];
    const rows = filteredStudents.map(s => {
      const deptCode = departments.find(d => d.id === s.departmentId)?.code || '-';
      const semCode = semesters.find(sem => sem.id === s.semesterId)?.code || '-';
      const att = db.getStudentAttendanceStats(s.id);
      return [
        s.enrollmentNo,
        s.name,
        deptCode,
        semCode,
        `${att.percentage}%`
      ];
    });
    handleExportCSV('swarrnim-academic-report', headers, rows);
  };

  const exportAdminFinanceReport = () => {
    const headers = ['Enrollment', 'Student Name', 'Total Fees', 'Paid Amount', 'Pending Amount', 'Status'];
    const rows = feeRecords.map(f => [
      f.enrollmentNo,
      f.studentName,
      `₹${f.totalAmount}`,
      `₹${f.paidAmount}`,
      `₹${f.pendingAmount}`,
      f.status
    ]);
    handleExportCSV('swarrnim-finance-report', headers, rows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Reports &amp; Analytical Intelligence
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            System-wide operational analytics, financial statements, and CRM conversion reports
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Master Report
          </button>
          <button className="btn btn-primary" onClick={activeReportTab === 'FINANCE' ? exportAdminFinanceReport : exportAdminAcademicReport}>
            <FileSpreadsheet size={16} /> Export Selected
          </button>
        </div>
      </div>

      {/* Analytical Filters Panel */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="grid-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Academic Department</label>
            <select className="form-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              <option value="ALL">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Semester Placement</label>
            <select className="form-select" value={selectedSem} onChange={e => setSelectedSem(e.target.value)}>
              <option value="ALL">All Semesters</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date Range Start</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date Range End</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeReportTab === 'ACADEMIC' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('ACADEMIC')}
        >
          Academic &amp; Student Operations
        </button>
        <button
          className={`btn btn-sm ${activeReportTab === 'FINANCE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('FINANCE')}
        >
          Fees Collection &amp; Outstanding Statements
        </button>
        <button
          className={`btn btn-sm ${activeReportTab === 'CRM' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveReportTab('CRM')}
        >
          CRM &amp; Admissions Conversion Funnel
        </button>
      </div>

      {/* Tab Body: ACADEMIC */}
      {activeReportTab === 'ACADEMIC' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stat Cards */}
          <div className="grid-4">
            <StatCard title="Active Enrolled" value={studentsList.length} subtitle="Registered students" icon={Users} colorScheme="orange" />
            <StatCard title="Teaching Workload" value={`${subjects.length} Subjects`} subtitle="Class hours distributed" icon={BookOpen} colorScheme="navy" />
            <StatCard title="Daily Attendance Avg" value={`${(() => { const sessions = db.getAttendanceSessions(); const total = sessions.reduce((sum, s) => sum + s.records.length, 0); const present = sessions.reduce((sum, s) => sum + s.records.filter(r => r.status === 'PRESENT').length, 0); return total > 0 ? Math.round((present / total) * 100) : 0; })()}%`} subtitle="Average across semesters" icon={CheckCircle2} colorScheme="green" />
            <StatCard title="Assignments Load" value={`${assignments.length} Courseworks`} subtitle="Assignments created" icon={FileText} colorScheme="gold" />
          </div>

          {/* Student Academic Status Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Student Academic Attendance &amp; Eligibility Audit
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Enrollment No</th>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Average Attendance %</th>
                    <th>Syllabus Cover Avg</th>
                    <th>Eligibility Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => {
                    const att = db.getStudentAttendanceStats(s.id);
                    const dept = departments.find(d => d.id === s.departmentId);
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700, color: 'var(--brand-orange)' }}>{s.enrollmentNo}</td>
                        <td style={{ fontWeight: 700 }}>{s.name}</td>
                        <td>{dept?.code}</td>
                        <td style={{ fontWeight: 800 }}>{att.percentage}%</td>
                        <td>{(() => { const deptSubjects = subjects.filter(sub => sub.departmentId === s.departmentId); const deptTopics = db.getSessionPlanTopics().filter(t => deptSubjects.some(sub => sub.id === t.subjectId)); return deptTopics.length > 0 ? Math.round((deptTopics.filter(t => t.status === 'COMPLETED').length / deptTopics.length) * 100) : 0; })()}%</td>
                        <td><Badge variant={att.percentage >= 75 ? 'active' : 'inactive'}>{att.percentage >= 75 ? 'ELIGIBLE' : 'WARNING'}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Body: FINANCE */}
      {activeReportTab === 'FINANCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stat Cards */}
          <div className="grid-4">
            <StatCard title="Collected Dues" value={`₹${(financeStats.totalCollected / 100000).toFixed(2)} L`} subtitle={`${financeStats.collectionPercentage}% Collected`} icon={CheckCircle2} colorScheme="green" />
            <StatCard title="Outstanding Balance" value={`₹${(financeStats.totalPending / 100000).toFixed(2)} L`} subtitle="Outstanding dues" icon={Clock} colorScheme="orange" />
            <StatCard title="Overdue Accounts" value={financeStats.overdueCount} subtitle="Past payment deadline" icon={ShieldAlert} colorScheme="gold" />
            <StatCard title="Active Billing demand" value={`₹${(financeStats.totalDemand / 100000).toFixed(2)} L`} subtitle="Semester Total" icon={IndianRupee} colorScheme="navy" />
          </div>

          {/* Ledger Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Student Billing Accounts Directory
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Enrollment</th>
                    <th>Student Name</th>
                    <th>Total Demand (₹)</th>
                    <th>Paid Amount (₹)</th>
                    <th>Outstanding Dues (₹)</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRecords.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{f.enrollmentNo}</td>
                      <td>{f.studentName}</td>
                      <td>₹{f.totalAmount.toLocaleString()}</td>
                      <td style={{ color: '#10B981', fontWeight: 700 }}>₹{f.paidAmount.toLocaleString()}</td>
                      <td style={{ color: f.pendingAmount > 0 ? '#EF4444' : 'inherit', fontWeight: 800 }}>₹{f.pendingAmount.toLocaleString()}</td>
                      <td><Badge variant={f.status === 'PAID' ? 'active' : 'orange'}>{f.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Body: CRM */}
      {activeReportTab === 'CRM' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stat Cards */}
          <div className="grid-3">
            <StatCard title="Total Leads logged" value={leads.length} subtitle="Leads in CRM" icon={Users} colorScheme="navy" />
            <StatCard title="Conversions to Applications" value={leads.filter(l => l.status === 'CONVERTED').length} subtitle="Converted leads" icon={CheckCircle2} colorScheme="green" />
            <StatCard title="Enrolment Applications" value={applications.length} subtitle="Admission applications" icon={GraduationCap} colorScheme="orange" />
          </div>

          {/* Pipeline Details */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              CRM Enquiry &amp; Lead Conversion Analytics
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Enquiry Channel</th>
                    <th>Assigned Coordinator</th>
                    <th>Lead Status</th>
                    <th>Latest Update</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 700 }}>{l.name}</td>
                      <td><Badge variant="orange">{l.source}</Badge></td>
                      <td>{l.counsellorName}</td>
                      <td><Badge variant={l.status === 'CONVERTED' ? 'active' : 'orange'}>{l.status}</Badge></td>
                      <td>{l.followUps[l.followUps.length - 1]?.notes || 'No log details'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
