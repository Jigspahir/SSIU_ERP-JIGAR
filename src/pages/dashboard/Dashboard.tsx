import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { PieChart } from '../../components/common/Charts';
import { 
  Building2, GitFork, GraduationCap, Users as Users2, UserCheck, 
  BookOpen, Calendar, ArrowRight, ShieldCheck, 
  Layers, CircleCheck as CheckCircle2, Award, UserPlus, Clock, FileText, FileCheck, CalendarDays, Check, IndianRupee, ChartBar as BarChart3, Settings,
  ClipboardCheck, ClipboardList, HelpCircle, Bell, Library, CheckSquare
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/approval/ApprovalWorkflowBadge';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user, role } = useAuth();

  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const programs = db.getPrograms();
  const academicYears = db.getAcademicYears();
  const batches = db.getBatches();
  const semesters = db.getSemesters();
  const divisions = db.getDivisions();
  const subjects = db.getSubjects();
  const facultyList = db.getFaculty();
  const studentsList = db.getStudents();
  
  // Academic, Exam & Approval Datasets
  const timetableEntries = db.getTimetableEntries();
  const attendanceSessions = db.getAttendanceSessions();
  const sessionPlanTopics = db.getSessionPlanTopics();
  const assignments = db.getAssignments();
  const calendarEvents = db.getAcademicCalendarEvents();
  const financeStats = db.getFinanceOverviewStats();
  const studentFeeRecords = db.getStudentFeeRecords();
  const approvalRequests = db.getScopedApprovalRequests(user, role);
  const userNotifications = db.getNotifications(user, role);

  const currentAY = academicYears.find(ay => ay.isCurrent) || academicYears[0];
  const userInstitute = user?.instituteId ? db.getInstituteById(user.instituteId) : null;
  const userDepartment = user?.departmentId ? db.getDepartmentById(user.departmentId) : null;

  // Calculate Scoped Student & Faculty Stats
  const getScopedStats = () => {
    let scopedFaculty = facultyList;
    let scopedStudents = studentsList;

    if (role === 'PRINCIPAL' && userInstitute) {
      scopedFaculty = facultyList.filter(f => f.instituteId === userInstitute.id);
      scopedStudents = studentsList.filter(s => s.instituteId === userInstitute.id);
    } else if ((role === 'HOD' || role === 'FACULTY') && userDepartment) {
      scopedFaculty = facultyList.filter(f => f.departmentId === userDepartment.id);
      scopedStudents = studentsList.filter(s => s.departmentId === userDepartment.id);
    }

    return {
      totalStudents: scopedStudents.length,
      activeStudents: scopedStudents.filter(s => s.status === 'ACTIVE').length,
      totalFaculty: scopedFaculty.length,
      activeFaculty: scopedFaculty.filter(f => f.status === 'ACTIVE').length,
      scopedStudents
    };
  };

  const stats = getScopedStats();

  // 1. Super Admin & University Admin Dashboard
  const renderAdminDashboard = () => {
    const totalActiveSubjects = subjects.filter(s => s.status === 'ACTIVE').length;

    const deptStudentData = [
      { label: 'CSE Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-cse' || s.departmentId === 'dept-1').length || 145, color: '#4285F4' },
      { label: 'IT Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-it' || s.departmentId === 'dept-2').length || 110, color: '#EA4335' },
      { label: 'AI & DS Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-aids' || s.departmentId === 'dept-3').length || 125, color: '#FBBC05' },
      { label: 'Mech Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-mech' || s.departmentId === 'dept-4').length || 85, color: '#34A853' },
      { label: 'EE Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-ee' || s.departmentId === 'dept-5').length || 75, color: '#8E24AA' }
    ];

    const feeCategoryData = [
      { label: 'Tuition Fees Paid', value: Math.round(financeStats.totalCollected * 0.75), color: '#34A853' },
      { label: 'Exam Fees Paid', value: Math.round(financeStats.totalCollected * 0.15), color: '#4285F4' },
      { label: 'Hostel & Mess Paid', value: Math.round(financeStats.totalCollected * 0.10), color: '#FBBC05' },
      { label: 'Pending Dues', value: financeStats.totalPending, color: '#EA4335' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #071325 0%, #0F2C59 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">University Executive Dashboard</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>
            Welcome, {user?.name || 'Administrator'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            {user?.designation || 'Swarrnim Startup & Innovation University Headquarters'}
          </p>
        </div>

        <div className="grid-4">
          <StatCard title="Total Students" value={stats.totalStudents} subtitle="Across constituent schools" icon={Users2} colorScheme="orange" onClick={() => setActiveTab('students')} />
          <StatCard title="Active Faculty" value={stats.activeFaculty} subtitle="Teaching staff on roster" icon={UserCheck} colorScheme="navy" onClick={() => setActiveTab('faculty')} />
          <StatCard title="Collected Revenue" value={`₹${(financeStats.totalCollected / 100000).toFixed(2)} L`} subtitle={`${financeStats.collectionPercentage}% collected`} icon={IndianRupee} colorScheme="green" onClick={() => setActiveTab('fees')} />
          <StatCard title="Pending Approvals" value={approvalRequests.filter(r => r.status === 'PENDING').length} subtitle="Central Workflow Desk" icon={CheckSquare} colorScheme="gold" onClick={() => setActiveTab('requests')} />
        </div>

        <div className="grid-2">
          <PieChart title="Student Distribution by Department" data={deptStudentData} badgeLabel="ADMISSIONS" summaryText="Computer Science & Engineering and AI-DS lead total admissions across university campuses." />
          <PieChart title="Fee Collection & Revenue Breakdown" data={feeCategoryData} unit="₹" badgeLabel="FINANCE" summaryText="Tuition fees account for 75% of total revenue collected across all active student accounts." />
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Academic Operations Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}><span>Constituent Institutes:</span><strong>{institutes.length} Schools</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}><span>Academic Departments:</span><strong>{departments.length} Depts</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}><span>Degree Programs:</span><strong>{programs.length} Programs</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}><span>Active Subjects &amp; Courses:</span><strong>{totalActiveSubjects} Active</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--brand-navy)' }}><span>Current Academic Session:</span><Badge variant="orange">{currentAY.name}</Badge></div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Executive Controls</h3>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('requests')}><CheckSquare size={16} /> Central Approval Desk</button>
              <button className="btn btn-primary" onClick={() => setActiveTab('fees')}><IndianRupee size={16} /> Fees &amp; Billing</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('students')}><Users2 size={16} /> Student Directory</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('faculty')}><UserCheck size={16} /> Faculty Directory</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('reports')}><BarChart3 size={16} /> System Reports</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('settings')}><Settings size={16} /> System Settings</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. Registrar Office Dashboard
  const renderRegistrarDashboard = () => {
    const dispatches = db.getInwardOutwardRecords();
    const movements = db.getRegistrarFileMovements();
    const pendingReqs = approvalRequests.filter(r => r.currentOffice === 'REGISTRAR' && r.status !== 'APPROVED' && r.status !== 'REJECTED');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0F2C59 0%, #183B70 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">Registrar Administrative Desk</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>Welcome, {user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.25rem' }}>University Registrar • Statutory Compliance &amp; Governance Secretariat</p>
        </div>

        <div className="grid-4">
          <StatCard title="Inward/Outward Logs" value={dispatches.length} subtitle="Official Mail Register" icon={FileText} colorScheme="navy" onClick={() => setActiveTab('registrar')} />
          <StatCard title="File Movements" value={movements.length} subtitle="Active File Custodians" icon={FileCheck} colorScheme="green" onClick={() => setActiveTab('registrar')} />
          <StatCard title="Pending Sanctions" value={pendingReqs.length} subtitle="Awaiting Registrar Signoff" icon={ShieldCheck} colorScheme="orange" onClick={() => setActiveTab('requests')} />
          <StatCard title="Total Notifications" value={userNotifications.length} subtitle="Administrative Alerts" icon={Bell} colorScheme="gold" onClick={() => setActiveTab('notifications')} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Pending Registrar Approvals Queue</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('requests')}>View All Desk Requests</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Applicant</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReqs.slice(0, 5).map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.requestNo}</strong></td>
                    <td>{r.applicantName} ({r.applicantRole})</td>
                    <td>{r.category}</td>
                    <td>{r.title}</td>
                    <td><PriorityBadge priority={r.priority} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('requests')}>Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 3. IQAC Cell Dashboard
  const renderIQACDashboard = () => {
    const feedbacks = db.getStudentFeedbacks();
    const avgScore = feedbacks.length > 0 ? (feedbacks.reduce((a, b) => a + (b.overallRating || 4), 0) / feedbacks.length).toFixed(2) : '4.65';
    const pendingReqs = approvalRequests.filter(r => r.currentOffice === 'IQAC' && r.status !== 'APPROVED' && r.status !== 'REJECTED');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">IQAC Quality Portal</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>Welcome, {user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#DCFCE7', marginTop: '0.25rem' }}>Director, Internal Quality Assurance Cell (IQAC) • NAAC Cycle 2 Compliance</p>
        </div>

        <div className="grid-4">
          <StatCard title="NAAC Accreditation" value="Grade A+" subtitle="Valid Cycle 2 Accreditation" icon={Award} colorScheme="green" onClick={() => setActiveTab('iqac')} />
          <StatCard title="Avg Faculty Feedback" value={`${avgScore} / 5.0`} subtitle={`${feedbacks.length} Feedback Submissions`} icon={BarChart3} colorScheme="navy" onClick={() => setActiveTab('feedback')} />
          <StatCard title="Audited Depts" value={departments.length} subtitle="100% Quality Audited" icon={ShieldCheck} colorScheme="gold" onClick={() => setActiveTab('iqac')} />
          <StatCard title="Quality Proposals" value={pendingReqs.length} subtitle="Awaiting IQAC Clearance" icon={CheckSquare} colorScheme="orange" onClick={() => setActiveTab('requests')} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Institute Academic Audit Benchmarks</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Institute Code</th>
                  <th>Institute Name</th>
                  <th>Academic Audit</th>
                  <th>Feedback Rating</th>
                  <th>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {institutes.map(inst => (
                  <tr key={inst.id}>
                    <td><strong>{inst.code}</strong></td>
                    <td>{inst.name}</td>
                    <td><Badge variant="active">AUDITED</Badge></td>
                    <td><strong>4.75 / 5.0</strong></td>
                    <td><Badge variant="navy">98.5% Compliant</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 4. Exam Cell Dashboard
  const renderExamCellDashboard = () => {
    const exams = db.getExams();
    const forms = db.getExamForms();
    const results = db.getStudentResults();
    const pendingForms = forms.filter(f => f.status === 'VERIFICATION_PENDING' || f.status === 'SUBMITTED');
    const pendingReqs = approvalRequests.filter(r => r.currentOffice === 'EXAM_CELL' && r.status !== 'APPROVED' && r.status !== 'REJECTED');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #183B70 0%, #071325 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">Examination Management Portal</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>Welcome, {user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.25rem' }}>Controller of Examinations • Exam Schedules, Hall Tickets &amp; SGPA/CGPA Results</p>
        </div>

        <div className="grid-4">
          <StatCard title="Active Exams" value={exams.length} subtitle="Scheduled Exam Series" icon={FileCheck} colorScheme="navy" onClick={() => setActiveTab('exam-dashboard')} />
          <StatCard title="Forms Approved" value={forms.filter(f => f.status === 'APPROVED').length} subtitle="Hall Tickets Released" icon={ShieldCheck} colorScheme="green" onClick={() => setActiveTab('exam-forms')} />
          <StatCard title="Pending Forms" value={pendingForms.length} subtitle="Form Verification Queue" icon={Clock} colorScheme="orange" onClick={() => setActiveTab('exam-forms')} />
          <StatCard title="Re-evaluation Reqs" value={pendingReqs.length} subtitle="Exam Cell Approval Queue" icon={CheckSquare} colorScheme="gold" onClick={() => setActiveTab('requests')} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Active Examination Series Overview</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Type</th>
                  <th>Form Deadline</th>
                  <th>Base Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(e => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td><Badge variant="navy">{e.type}</Badge></td>
                    <td>{e.formDeadline}</td>
                    <td>₹{e.baseFee}</td>
                    <td><Badge variant="active">{e.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 5. Student Section Dashboard
  const renderStudentSectionDashboard = () => {
    const docs = db.getStudentDocuments();
    const pendingDocs = docs.filter(d => d.status === 'PENDING_VERIFICATION');
    const pendingReqs = approvalRequests.filter(r => r.currentOffice === 'STUDENT_SECTION' && r.status !== 'APPROVED' && r.status !== 'REJECTED');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">Student Section &amp; Certificates Desk</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>Welcome, {user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#E0F2FE', marginTop: '0.25rem' }}>Student Section Officer • Enrolment Validation &amp; Certificate Issuance</p>
        </div>

        <div className="grid-4">
          <StatCard title="Enrolled Students" value={studentsList.length} subtitle="Active Student Roster" icon={Users2} colorScheme="navy" onClick={() => setActiveTab('students')} />
          <StatCard title="Verified Docs" value={docs.filter(d => d.status === 'VERIFIED').length} subtitle="Vault Locked Documents" icon={ShieldCheck} colorScheme="green" onClick={() => setActiveTab('student-section')} />
          <StatCard title="Pending Docs" value={pendingDocs.length} subtitle="Verification Queue" icon={Clock} colorScheme="orange" onClick={() => setActiveTab('student-section')} />
          <StatCard title="Certificates Reqs" value={pendingReqs.length} subtitle="Bonafide &amp; NOC Requests" icon={CheckSquare} colorScheme="gold" onClick={() => setActiveTab('requests')} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Pending Student Certificate &amp; Document Queue</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Student Candidate</th>
                  <th>Certificate / Doc Category</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReqs.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.requestNo}</strong></td>
                    <td>{r.applicantName} ({r.applicantEnrollmentOrEmpId})</td>
                    <td>{r.category}</td>
                    <td>{r.deadlineDate}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => setActiveTab('requests')}>Process</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 6. Hostel Admin Dashboard
  const renderHostelAdminDashboard = () => {
    const hostelReqs = approvalRequests.filter(r => r.currentOffice === 'HOSTEL_ADMIN');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">Hostel Administration Portal</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>Welcome, {user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#FEF3C7', marginTop: '0.25rem' }}>Chief Hostel Warden • Accommodation &amp; No-Dues Clearance</p>
        </div>

        <div className="grid-4">
          <StatCard title="Hostel Residents" value="385" subtitle="Block A &amp; Block B Occupants" icon={Building2} colorScheme="navy" onClick={() => setActiveTab('hostel-admin')} />
          <StatCard title="Occupancy Rate" value="94%" subtitle="24 Beds Available" icon={CheckCircle2} colorScheme="green" onClick={() => setActiveTab('hostel-admin')} />
          <StatCard title="No-Dues Requests" value={hostelReqs.filter(r => r.status === 'PENDING').length} subtitle="Clearance Requests Queue" icon={CheckSquare} colorScheme="gold" onClick={() => setActiveTab('requests')} />
          <StatCard title="Hostel Tickets" value="3" subtitle="Maintenance &amp; Mess Complaints" icon={HelpCircle} colorScheme="orange" onClick={() => setActiveTab('tickets')} />
        </div>
      </div>
    );
  };

  // 7. Department HOD Dashboard
  const renderHODDashboard = () => {
    const deptFaculty = facultyList.filter(f => f.departmentId === userDepartment?.id || f.departmentId === 'dept-1');
    const deptStudents = studentsList.filter(s => s.departmentId === userDepartment?.id || s.departmentId === 'dept-1');
    const deptReqs = approvalRequests.filter(r => r.departmentId === userDepartment?.id || r.currentOffice === 'HOD_ACADEMIC');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #15803D 0%, #0F2C59 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">Department HOD Portal</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>Welcome, {user?.name}</h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.25rem' }}>Head of Department • {userDepartment?.name || 'Computer Science & Engineering'}</p>
        </div>

        <div className="grid-4">
          <StatCard title="Dept Students" value={deptStudents.length} subtitle="Enrolled in Department" icon={Users2} colorScheme="orange" onClick={() => setActiveTab('students')} />
          <StatCard title="Dept Faculty" value={deptFaculty.length} subtitle="Department Professors" icon={UserCheck} colorScheme="navy" onClick={() => setActiveTab('faculty')} />
          <StatCard title="Dept Subjects" value={subjects.filter(s => s.departmentId === 'dept-1').length || 8} subtitle="Active Course Units" icon={BookOpen} colorScheme="green" onClick={() => setActiveTab('subjects')} />
          <StatCard title="Pending Approvals" value={deptReqs.filter(r => r.status === 'PENDING').length} subtitle="HOD Action Queue" icon={CheckSquare} colorScheme="gold" onClick={() => setActiveTab('requests')} />
        </div>
      </div>
    );
  };

  // 8. Faculty Dashboard View
  const renderFacultyDashboard = () => {
    const facultyId = user?.id || '';
    const myClasses = timetableEntries.filter(t => t.facultyId === facultyId || t.facultyId === 'fac-1');
    const myAssignments = assignments.filter(a => a.createdByFacultyId === facultyId || a.createdByFacultyName?.includes(user?.name || ''));
    const myTopics = sessionPlanTopics.filter(t => t.facultyId === facultyId || t.facultyId === 'fac-1');

    const syllabusStatusData = [
      { label: 'Completed Topics', value: myTopics.filter(t => t.status === 'COMPLETED').length || 14, color: '#34A853' },
      { label: 'In Progress Topics', value: myTopics.filter(t => t.status === 'IN_PROGRESS').length || 4, color: '#FBBC05' },
      { label: 'Pending Topics', value: myTopics.filter(t => t.status === 'PENDING').length || 2, color: '#EA4335' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">Faculty &amp; Mentor Academic Portal</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            Welcome, {user?.name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            {user?.designation || 'Associate Professor'} • {userDepartment?.name || 'Dept of Computer Science & Engineering'}
          </p>
        </div>

        <div className="grid-4">
          <StatCard title="Weekly Lectures" value={myClasses.length || 6} subtitle="Assigned timetable slots" icon={Clock} colorScheme="navy" onClick={() => setActiveTab('timetable')} />
          <StatCard title="Session Topics" value={myTopics.length || 20} subtitle="Topics tracked in plan" icon={BookOpen} colorScheme="green" onClick={() => setActiveTab('session-plan')} />
          <StatCard title="Assignments" value={myAssignments.length || 4} subtitle="Created coursework" icon={ClipboardList} colorScheme="gold" onClick={() => setActiveTab('assignments')} />
          <StatCard title="Class Students" value={stats.totalStudents} subtitle="Enrolled in division" icon={Users2} colorScheme="orange" onClick={() => setActiveTab('students')} />
        </div>

        <div className="grid-2">
          <PieChart title="Syllabus Topics Status" data={syllabusStatusData} badgeLabel="SYLLABUS" summaryText="Syllabus coverage progress tracked across assigned subjects." />

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>Faculty Quick Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('attendance')}><UserCheck size={16} /> Mark Lecture Attendance</button>
              <button className="btn btn-primary" onClick={() => setActiveTab('exam-marks')}><FileCheck size={16} /> Enter Internal Exam Marks</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('session-plan')}><BookOpen size={16} /> Update Session Plan Topics</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('materials')}><FileText size={16} /> Upload Study Materials</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('requests')}><CheckSquare size={16} /> Submit / Review Requests</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 9. Student Dashboard View
  const renderStudentDashboard = () => {
    const studentId = user?.id || 'stu-1';
    const stats = db.getStudentAttendanceStats(studentId);
    const todayClasses = timetableEntries.filter(t => t.dayOfWeek === 'Monday');
    const studentAssignments = assignments.filter(a => a.status === 'ACTIVE');
    const studentFee = studentFeeRecords.find(r => r.studentId === studentId || r.enrollmentNo === user?.enrollmentNo) || studentFeeRecords[0];

    const subjectAttendanceData = [
      { label: 'Data Structures', value: 28, color: '#34A853' },
      { label: 'Operating Systems', value: 26, color: '#4285F4' },
      { label: 'DBMS', value: 24, color: '#FBBC05' },
      { label: 'Computer Arch', value: 27, color: '#8E24AA' },
      { label: 'Web Tech Lab', value: 30, color: '#00ACC1' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #8B5CF6 0%, #4C1D95 100%)', color: '#FFFFFF' }}>
          <Badge variant="gold">Student Academic Portal</Badge>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            Welcome, {user?.name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#E9D5FF', marginTop: '0.25rem' }}>
            Enrollment No: <strong>{user?.enrollmentNo || '230101001'}</strong> • B.Tech CSE Semester 4
          </p>
        </div>

        <div className="grid-4">
          <StatCard title="Attendance %" value={`${stats.percentage}%`} subtitle={`${stats.presentClasses} / ${stats.totalClasses} Present`} icon={ClipboardCheck} colorScheme={stats.percentage >= 75 ? 'green' : 'orange'} onClick={() => setActiveTab('attendance')} />
          <StatCard title="Pending Fee Dues" value={`₹${(studentFee?.pendingAmount || 0).toLocaleString()}`} subtitle={`Due: ${studentFee?.dueDate || 'N/A'}`} icon={IndianRupee} colorScheme={studentFee?.pendingAmount === 0 ? 'green' : 'orange'} onClick={() => setActiveTab('fees')} />
          <StatCard title="Active Assignments" value={studentAssignments.length} subtitle="Pending coursework" icon={ClipboardList} colorScheme="gold" onClick={() => setActiveTab('assignments')} />
          <StatCard title="My Requests" value={approvalRequests.length} subtitle="Track approval status" icon={CheckSquare} colorScheme="navy" onClick={() => setActiveTab('requests')} />
        </div>

        <div className="grid-2">
          <PieChart title="Attended Lectures by Subject" data={subjectAttendanceData} badgeLabel="ATTENDANCE" summaryText="All enrolled subjects exceed the 75% attendance rule." />

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--brand-orange)" /> Today's Class Timetable
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {todayClasses.map(tt => {
                const subj = db.getSubjectById(tt.subjectId);
                return (
                  <div key={tt.id} style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{subj?.name} ({subj?.code})</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{tt.timeSlot} • Venue: {tt.roomNo}</div>
                    </div>
                    <Badge variant="active">{subj?.type || 'THEORY'}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Route to proper role dashboard
  if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL') return renderAdminDashboard();
  if (role === 'REGISTRAR') return renderRegistrarDashboard();
  if (role === 'IQAC') return renderIQACDashboard();
  if (role === 'EXAM_CELL') return renderExamCellDashboard();
  if (role === 'STUDENT_SECTION') return renderStudentSectionDashboard();
  if (role === 'HOSTEL_ADMIN') return renderHostelAdminDashboard();
  if (role === 'HOD') return renderHODDashboard();
  if (role === 'FACULTY') return renderFacultyDashboard();
  return renderStudentDashboard();
};
