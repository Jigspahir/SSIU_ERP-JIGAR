import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { PieChart } from '../../components/common/Charts';
import { DashboardReportModal } from '../../components/reports/DashboardReportModal';
import { SmartActionCenter } from '../../components/dashboard/SmartActionCenter';
import { 
  Building2, GitFork, GraduationCap, Users as Users2, UserCheck, 
  BookOpen, Calendar, ArrowRight, ShieldCheck, 
  Layers, CircleCheck as CheckCircle2, Award, UserPlus, Clock, FileText, FileCheck, CalendarDays, Check, IndianRupee, ChartBar as BarChart3, Settings,
  ClipboardCheck, ClipboardList, HelpCircle, Bell, Library, CheckSquare,
  AlertTriangle, AlertCircle, MessageSquare, FileSpreadsheet, FolderCheck
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/approval/ApprovalWorkflowBadge';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user, role } = useAuth();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  // 1. Campus Dashboard (Phase 1 Executive & Admin Foundation)
  const renderAdminDashboard = () => {
    const totalActiveSubjects = subjects.filter(s => s.status === 'ACTIVE').length;
    const totalEnrolled = stats.totalStudents || 1284;
    const activeEnrolled = stats.activeStudents || 1221;
    const activePercentage = ((activeEnrolled / (totalEnrolled || 1)) * 100).toFixed(1);

    // Current Date Formatting
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // 1. Student Enrollment Distribution
    const enrollmentData = [
      { label: 'Regular B.Tech/B.Sc', value: Math.round(totalEnrolled * 0.82), color: '#4285F4' },
      { label: 'Lateral Entry (D2D)', value: Math.round(totalEnrolled * 0.12), color: '#34A853' },
      { label: 'Management / NRI Quota', value: Math.round(totalEnrolled * 0.06), color: '#FBBC05' }
    ];

    // 2. Campus Attendance Distribution
    const attendanceData = [
      { label: 'Present Today', value: 1185, color: '#34A853' },
      { label: 'Unexcused Absent', value: 99, color: '#EA4335' },
      { label: 'Late Arrival', value: 35, color: '#FBBC05' },
      { label: 'Approved Leave', value: 24, color: '#4285F4' }
    ];

    // 3. Fee Revenue Breakdown
    const feeCategoryData = [
      { label: 'Tuition Fees Paid', value: Math.round(financeStats.totalCollected * 0.75), color: '#34A853' },
      { label: 'Exam Fees Paid', value: Math.round(financeStats.totalCollected * 0.15), color: '#4285F4' },
      { label: 'Hostel & Mess Paid', value: Math.round(financeStats.totalCollected * 0.10), color: '#FBBC05' },
      { label: 'Pending Term 2 Dues', value: financeStats.totalPending, color: '#EA4335' }
    ];

    // 4. Department-wise Student Strength
    const deptStudentData = [
      { label: 'CSE Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-cse' || s.departmentId === 'dept-1').length || 145, color: '#4285F4' },
      { label: 'AI & DS Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-aids' || s.departmentId === 'dept-3').length || 125, color: '#FBBC05' },
      { label: 'IT Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-it' || s.departmentId === 'dept-2').length || 110, color: '#34A853' },
      { label: 'Mech Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-mech' || s.departmentId === 'dept-4').length || 85, color: '#FF6D00' },
      { label: 'EE Dept', value: stats.scopedStudents.filter(s => s.departmentId === 'dept-ee' || s.departmentId === 'dept-5').length || 75, color: '#8E24AA' }
    ];

    const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'PENDING').length;
    const userInitials = (user?.name || 'AD').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* =========================================================================
            6 KPI ANALYTICS CARDS (LARGE NUMBERS + PERCENTAGES + TRENDS + HOVER)
            ========================================================================= */}
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* 1. Total Students */}
          <StatCard
            title="Total Students"
            value={totalEnrolled.toLocaleString()}
            subtitle={`${activeEnrolled} Active (${activePercentage}%)`}
            trend="+8.4% YoY"
            icon={GraduationCap}
            colorScheme="orange"
            onClick={() => setActiveTab('students')}
          />

          {/* 2. Faculty & Staff */}
          <StatCard
            title="Faculty & Staff"
            value={stats.totalFaculty.toLocaleString()}
            subtitle="1:18 Faculty-Student Ratio"
            trend="100% on Roster"
            icon={Users2}
            colorScheme="navy"
            onClick={() => setActiveTab('faculty')}
          />

          {/* 3. Campus Attendance */}
          <StatCard
            title="Campus Attendance"
            value="92.4%"
            subtitle="1,185 / 1,284 Students Present"
            trend="+1.8% vs Last Week"
            icon={UserCheck}
            colorScheme="green"
            onClick={() => setActiveTab('attendance')}
          />

          {/* 4. Fee Collection */}
          <StatCard
            title="Fee Collection"
            value={`₹${(financeStats.totalCollected / 100000).toFixed(2)} L`}
            subtitle={`${financeStats.collectionPercentage}% Collected`}
            trend="+12.5% This Month"
            icon={IndianRupee}
            colorScheme="green"
            onClick={() => setActiveTab('fees')}
          />

          {/* 5. Pending Fees */}
          <StatCard
            title="Pending Fees"
            value={`₹${(financeStats.totalPending / 100000).toFixed(2)} L`}
            subtitle={`${(100 - financeStats.collectionPercentage).toFixed(1)}% Outstanding`}
            trend="Term 2 Invoices"
            icon={Clock}
            colorScheme="gold"
            onClick={() => setActiveTab('fees')}
          />

          {/* 6. Active Courses */}
          <StatCard
            title="Active Courses"
            value={`${totalActiveSubjects || 36}`}
            subtitle={`${programs.length} Degree Programs`}
            trend="6 Semesters Mapped"
            icon={BookOpen}
            colorScheme="blue"
            onClick={() => setActiveTab('academics')}
          />
        </div>

        {/* =========================================================================
            6. 4 GOOGLE FORMS-STYLE VISUALIZATIONS & CHARTS (DONUT + RESPONSES)
            ========================================================================= */}
        <div className="grid-2">
          {/* Visual 1: Student Enrollment Distribution */}
          <PieChart
            title="Student Enrollment & Categories"
            data={enrollmentData}
            badgeLabel="ENROLLMENT"
            summaryText="Regular B.Tech admissions represent 82% of current student intake, followed by 12% Lateral Entry scholars."
          />

          {/* Visual 2: Campus Attendance Analytics */}
          <PieChart
            title="Daily Campus Attendance Overview"
            data={attendanceData}
            badgeLabel="ATTENDANCE"
            summaryText="92.4% classroom attendance benchmark achieved today, exceeding the institutional 75% minimum threshold."
          />
        </div>

        <div className="grid-2">
          {/* Visual 3: Fee Revenue & Collection Breakdown */}
          <PieChart
            title="Fee Collection & Revenue Breakdown"
            data={feeCategoryData}
            unit="₹"
            badgeLabel="FINANCE"
            summaryText="Tuition fees account for 75% of total realized revenue, with Term 2 collections underway across all departments."
          />

          {/* Visual 4: Department-wise Student Strength */}
          <PieChart
            title="Department-wise Student Strength"
            data={deptStudentData}
            badgeLabel="DEPARTMENTS"
            summaryText="Computer Science & Engineering and AI-DS lead total admissions across university campuses."
          />
        </div>

        {/* =========================================================================
            7. ACADEMIC OPERATIONS SUMMARY & EXECUTIVE CONTROLS
            ========================================================================= */}
        <div className="grid-2">
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="var(--brand-orange)" /> Academic Operations Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <span>Constituent Institutes:</span><strong>{institutes.length} Schools</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <span>Academic Departments:</span><strong>{departments.length} Depts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <span>Degree Programs:</span><strong>{programs.length} Programs</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <span>Active Subjects &amp; Courses:</span><strong>{totalActiveSubjects || 36} Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--brand-navy)', paddingTop: '0.25rem' }}>
                  <span>Current Academic Session:</span><Badge variant="orange">{currentAY.name}</Badge>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Pending Central Approvals:</span>
              <Badge variant={pendingApprovalsCount > 0 ? 'orange' : 'active'}>{pendingApprovalsCount} Items</Badge>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Executive Quick Actions
            </h3>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('requests')}>
                <CheckSquare size={16} /> Central Approval Desk
              </button>
              <button className="btn btn-primary" onClick={() => setActiveTab('fees')}>
                <IndianRupee size={16} /> Fees &amp; Billing
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('students')}>
                <Users2 size={16} /> Student Directory
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('faculty')}>
                <UserCheck size={16} /> Faculty Directory
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('reports')}>
                <BarChart3 size={16} /> System Reports
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('settings')}>
                <Settings size={16} /> System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. Registrar Office Dashboard
  const renderRegistrarDashboard = () => {
    const allInstitutes = db.getInstitutes();
    const allDepartments = db.getDepartments();
    const allPrograms = db.getPrograms();
    const allStudents = db.getStudents();
    const allFaculty = db.getFaculty();
    const academicYears = db.getAcademicYears();
    const currentAY = academicYears.find(ay => ay.isCurrent) || academicYears[0] || { name: '2025-2026' };
    const pendingStatutory = ((db.getState() as any).statutoryApprovals || []).filter((a: any) => a.status === 'PENDING');
    const pendingReqs = (db.getState().studentRequests || []).filter((r: any) => r.currentOffice === 'REGISTRAR');
    
    // Attendance Shortage Calculation
    const shortageCount = allStudents.filter(s => {
      const stats = db.getStudentAttendanceStats(s.id);
      return stats.percentage < 75;
    }).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* 12 Key Governance Statistics */}
        <div className="grid-4">
          <StatCard title="Total Institutes" value={allInstitutes.length} subtitle="Constituent Colleges" icon={Building2} colorScheme="navy" onClick={() => setActiveTab('reg-uni-institutes')} />
          <StatCard title="Total Departments" value={allDepartments.length} subtitle="Academic Divisions" icon={Layers} colorScheme="navy" onClick={() => setActiveTab('reg-uni-departments')} />
          <StatCard title="Degree Programs" value={allPrograms.length} subtitle="Approved Curriculums" icon={BookOpen} colorScheme="green" onClick={() => setActiveTab('reg-academic-programs')} />
          <StatCard title="University Students" value={allStudents.length} subtitle="Enrolled Scholars" icon={GraduationCap} colorScheme="orange" onClick={() => setActiveTab('reg-students-overview')} />
        </div>

        <div className="grid-4">
          <StatCard title="Total Faculty Strength" value={allFaculty.length} subtitle="Teaching Scholars" icon={UserCheck} colorScheme="navy" onClick={() => setActiveTab('reg-faculty-overview')} />
          <StatCard title="Active Academic Year" value={currentAY.name} subtitle="Current Session" icon={Calendar} colorScheme="green" onClick={() => setActiveTab('reg-academic-year')} />
          <StatCard title="Pending Approvals" value={pendingStatutory.length} subtitle="Statutory Decisions" icon={CheckSquare} colorScheme={pendingStatutory.length > 0 ? 'gold' : 'green'} onClick={() => setActiveTab('reg-approvals-pending')} />
          <StatCard title="Escalated Requests" value={pendingReqs.length} subtitle="Secretariat Petitions" icon={MessageSquare} colorScheme="orange" onClick={() => setActiveTab('reg-requests-escalated')} />
        </div>

        <div className="grid-4">
          <StatCard title="Attendance Shortage" value={shortageCount} subtitle="Students Below 75%" icon={Clock} colorScheme={shortageCount > 0 ? 'gold' : 'green'} onClick={() => setActiveTab('reg-attendance-shortage')} />
          <StatCard title="Exam Form Status" value="98.4%" subtitle="Verified &amp; Cleared" icon={Award} colorScheme="green" onClick={() => setActiveTab('reg-exam-forms')} />
          <StatCard title="Result Status" value="Active" subtitle="Even Sem Tabulation" icon={FileSpreadsheet} colorScheme="navy" onClick={() => setActiveTab('reg-exam-results')} />
          <StatCard title="Audit Alerts" value="0 Critical" subtitle="Security Ledger Clean" icon={ShieldCheck} colorScheme="green" onClick={() => setActiveTab('reg-audit-logs')} />
        </div>

        {/* Institute-wise Comparison Table */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Constituent Institutes Governance &amp; Enrollment Matrix</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Comparative institutional overview across all constituent entities.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('reg-uni-overview')}>View Full University Overview</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Institute Name &amp; Code</th>
                  <th>Head of Institute (HOI)</th>
                  <th>Departments</th>
                  <th>Students</th>
                  <th>Faculty</th>
                  <th>Avg Attendance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allInstitutes.map(inst => {
                  const instDepts = allDepartments.filter(d => d.instituteId === inst.id);
                  const instStudents = allStudents.filter(s => s.instituteId === inst.id || instDepts.some(d => d.id === s.departmentId));
                  const instFaculty = allFaculty.filter(f => f.instituteId === inst.id || instDepts.some(d => d.id === f.departmentId));

                  return (
                    <tr key={inst.id}>
                      <td>
                        <strong>{inst.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>Code: <code>{inst.code}</code></div>
                      </td>
                      <td>
                        <strong>{inst.principalName || 'Dr. Principal'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOI / Dean</div>
                      </td>
                      <td><strong>{instDepts.length}</strong></td>
                      <td><strong>{instStudents.length}</strong></td>
                      <td><strong>{instFaculty.length}</strong></td>
                      <td><Badge variant="active">88.5%</Badge></td>
                      <td><Badge variant={inst.status === 'INACTIVE' ? 'inactive' : 'active'}>{inst.status || 'ACTIVE'}</Badge></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('reg-uni-institutes')}>
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 2b. Deputy Registrar Office Dashboard (Jurisdictional Scope Architecture)
  const renderDeputyRegistrarDashboard = () => {
    const assignedScopes = db.getDeputyRegistrarScopeByUserId(user?.id || '');
    const scopedStudents = db.getScopedStudents(user, role);
    const scopedFaculty = db.getScopedFaculty(user, role);
    const scopedNoteSheets = db.getScopedNoteSheets(user, role);
    const pendingNotes = db.getPendingWithMeNotesheets(user, role);
    const scopedRequests = db.getScopedApprovalRequests(user, role);
    const academicYears = db.getAcademicYears();
    const currentAY = academicYears.find(ay => ay.isCurrent) || academicYears[0] || { name: '2025-2026' };
    const allInstitutes = db.getInstitutes();
    const allDepartments = db.getDepartments();

    // Attendance shortage in scope
    const shortageCount = scopedStudents.filter(s => {
      const stats = db.getStudentAttendanceStats(s.id);
      return stats.percentage < 75;
    }).length;

    // Assigned Institutes & Departments count
    const assignedInstIds = Array.from(new Set(assignedScopes.map(s => s.instituteId)));
    const assignedInsts = allInstitutes.filter(i => assignedInstIds.includes(i.id));
    const allAssignedDeptIds = Array.from(new Set(assignedScopes.flatMap(s => s.departmentIds)));
    const assignedDepts = allDepartments.filter(d => allAssignedDeptIds.includes(d.id));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Deputy Registrar Jurisdictional Banner */}
        <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#fff' }}>Office of the Deputy Registrar</h2>
                <Badge variant="navy" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  DELEGATED JURISDICTIONAL SCOPE
                </Badge>
                <Badge variant="success">AY {currentAY.name} Active</Badge>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                Authorized scope across <strong>{assignedInsts.length} Institute(s)</strong> and <strong>{allAssignedDeptIds.length} Department(s)</strong>.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', alignSelf: 'center', fontWeight: 600 }}>Assigned Departments:</span>
                {assignedDepts.length > 0 ? (
                  assignedDepts.map(d => (
                    <span key={d.id} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      {d.name} ({d.code})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-amber-300">All departments in assigned institute(s)</span>
                )}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('deputy-registrar-workspace')}>
              Open Scoped Workspace
            </button>
          </div>
        </div>

        {/* 12 Key Scoped Governance Statistics */}
        <div className="grid-4">
          <StatCard title="Assigned Institutes" value={assignedInsts.length} subtitle="Delegated Units" icon={Building2} colorScheme="navy" onClick={() => setActiveTab('deputy-registrar-workspace')} />
          <StatCard title="Assigned Departments" value={allAssignedDeptIds.length} subtitle="Academic Divisions" icon={Layers} colorScheme="navy" onClick={() => setActiveTab('deputy-registrar-workspace')} />
          <StatCard title="Jurisdictional Students" value={scopedStudents.length} subtitle="Scholars in Scope" icon={GraduationCap} colorScheme="orange" onClick={() => setActiveTab('deputy-registrar-workspace')} />
          <StatCard title="Faculty Strength" value={scopedFaculty.length} subtitle="Assigned Teaching Staff" icon={UserCheck} colorScheme="green" onClick={() => setActiveTab('deputy-registrar-workspace')} />
        </div>

        <div className="grid-4">
          <StatCard title="Pending With Me" value={pendingNotes.length} subtitle="Actionable Notesheets" icon={ClipboardCheck} colorScheme={pendingNotes.length > 0 ? 'orange' : 'green'} onClick={() => setActiveTab('notesheet')} />
          <StatCard title="Scoped Notesheets" value={scopedNoteSheets.length} subtitle="Jurisdictional Files" icon={FileText} colorScheme="navy" onClick={() => setActiveTab('notesheet')} />
          <StatCard title="Delegated Petitions" value={scopedRequests.length} subtitle="Secretariat Requests" icon={MessageSquare} colorScheme="green" onClick={() => setActiveTab('deputy-registrar-workspace')} />
          <StatCard title="Attendance Shortage" value={shortageCount} subtitle="Students < 75% in Scope" icon={Clock} colorScheme={shortageCount > 0 ? 'gold' : 'green'} onClick={() => setActiveTab('deputy-registrar-workspace')} />
        </div>

        {/* Scoped Institute Breakdown Matrix */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>Delegated Institutional Governance &amp; Department Matrix</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Jurisdictional scope assigned by Registrar Office.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('deputy-registrar-workspace')}>View Full Scoped Roster</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Institute Name &amp; Code</th>
                  <th>Assigned Departments</th>
                  <th>Students in Scope</th>
                  <th>Faculty in Scope</th>
                  <th>Actionable Files</th>
                  <th>Scope Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedInsts.map(inst => {
                  const scope = assignedScopes.find(s => s.instituteId === inst.id);
                  const instDepts = allDepartments.filter(d => (scope?.departmentIds || []).includes(d.id) || (scope?.departmentIds.length === 0 && d.instituteId === inst.id));
                  const instStudents = scopedStudents.filter(s => s.instituteId === inst.id);
                  const instFaculty = scopedFaculty.filter(f => f.instituteId === inst.id);
                  const instPending = pendingNotes.filter(ns => ns.instituteId === inst.id);

                  return (
                    <tr key={inst.id}>
                      <td>
                        <strong>{inst.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>Code: <code>{inst.code}</code></div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {instDepts.map(d => (
                            <span key={d.id} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              {d.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td><strong>{instStudents.length}</strong></td>
                      <td><strong>{instFaculty.length}</strong></td>
                      <td>
                        <Badge variant={instPending.length > 0 ? 'warning' : 'success'}>
                          {instPending.length} Pending
                        </Badge>
                      </td>
                      <td><Badge variant="active">DELEGATED</Badge></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('deputy-registrar-workspace')}>
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
    const allStudentsList = db.getStudents();
    const activeStudentsCount = allStudentsList.filter(s => s.status === 'ACTIVE').length;
    const docs = db.getStudentDocuments();
    const pendingDocs = docs.filter(d => d.status === 'PENDING_VERIFICATION');
    const rejectedDocs = docs.filter(d => d.status === 'REJECTED');
    const verifiedDocs = docs.filter(d => d.status === 'VERIFIED');
    
    const secRequests = db.getStudentSectionRequests();
    const pendingSecReqs = secRequests.filter(r => r.status === 'UNDER_REVIEW' || r.status === 'PROCESSING' || r.status === 'SUBMITTED');
    const bonafideReqs = secRequests.filter(r => r.serviceCode === 'BONAFIDE');
    const transcriptReqs = secRequests.filter(r => r.serviceCode === 'TRANSCRIPT');
    const degreeReqs = secRequests.filter(r => r.serviceCode === 'DEGREE');
    const idCardReqs = secRequests.filter(r => r.serviceCode === 'ID_CARD_DUP');
    const pendingFeePayments = secRequests.filter(r => r.paymentStatus === 'PENDING');
    const completedSecReqs = secRequests.filter(r => r.status === 'COMPLETED');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="grid-4">
          <StatCard title="Active Students" value={activeStudentsCount} subtitle="Enrolled Roster" icon={Users2} colorScheme="navy" onClick={() => setActiveTab('section-students-list')} />
          <StatCard title="Pending Requests" value={pendingSecReqs.length} subtitle="Service Applications Queue" icon={Clock} colorScheme={pendingSecReqs.length > 0 ? 'orange' : 'green'} onClick={() => setActiveTab('section-service-bonafide')} />
          <StatCard title="Certificates &amp; Transcripts" value={bonafideReqs.length + transcriptReqs.length + degreeReqs.length} subtitle={`${bonafideReqs.length} Bonafide • ${transcriptReqs.length} Transcripts`} icon={Award} colorScheme="gold" onClick={() => setActiveTab('section-service-transcript')} />
          <StatCard title="Pending Documents" value={pendingDocs.length} subtitle={`${rejectedDocs.length} Rejected • ${verifiedDocs.length} Verified`} icon={ShieldCheck} colorScheme={pendingDocs.length > 0 ? 'gold' : 'green'} onClick={() => setActiveTab('section-docs-verification')} />
        </div>

        <div className="grid-4">
          <StatCard title="ID Card Requests" value={idCardReqs.length} subtitle="Replacement Queue" icon={UserCheck} colorScheme="navy" onClick={() => setActiveTab('section-id-generate')} />
          <StatCard title="Pending Payments" value={pendingFeePayments.length} subtitle="Service Fee Dues" icon={IndianRupee} colorScheme={pendingFeePayments.length > 0 ? 'orange' : 'green'} onClick={() => setActiveTab('section-fees-pending')} />
          <StatCard title="Completed Services" value={completedSecReqs.length} subtitle="Delivered to Students" icon={CheckCircle2} colorScheme="green" onClick={() => setActiveTab('section-requests-history')} />
          <StatCard title="Document Master" value="Active" subtitle="ABC ID &amp; Vault Sync" icon={FolderCheck} colorScheme="navy" onClick={() => setActiveTab('section-docs-master')} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Recent Student Service &amp; Certificate Requests ({secRequests.length})
            </h3>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('section-service-bonafide')}>View All</button>
          </div>
          {secRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No student service requests logged.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request No</th>
                    <th>Student Candidate</th>
                    <th>Service Type</th>
                    <th>Fee Status</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {secRequests.slice(0, 5).map(r => (
                    <tr key={r.id}>
                      <td><code>{r.requestNo}</code></td>
                      <td>
                        <strong>{r.studentName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{r.enrollmentNo}</div>
                      </td>
                      <td>
                        <strong>{r.serviceName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.category}</div>
                      </td>
                      <td>
                        <Badge variant={r.paymentStatus === 'PAID' ? 'active' : r.calculatedFee > 0 ? 'warning' : 'navy'}>
                          {r.paymentStatus === 'PAID' ? `PAID (₹${r.calculatedFee})` : r.calculatedFee > 0 ? `PENDING (₹${r.calculatedFee})` : 'FREE'}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={r.status === 'COMPLETED' ? 'active' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('section-service-bonafide')}>
                          Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 6. Hostel Admin Dashboard
  const renderHostelAdminDashboard = () => {
    const hostelReqs = approvalRequests.filter(r => r.currentOffice === 'HOSTEL_ADMIN');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
    const deptId = userDepartment?.id || user?.departmentId || 'dept-1';
    const deptFaculty = facultyList.filter(f => f.departmentId === deptId || deptId === 'dept-1');
    const deptStudents = studentsList.filter(s => s.departmentId === deptId || (deptId === 'dept-1' && s.departmentId === 'dept-1'));
    const deptPrograms = programs.filter(p => p.departmentId === deptId || deptId === 'dept-1');
    const deptSubs = subjects.filter(s => s.departmentId === deptId || (deptId === 'dept-1' && s.departmentId === 'dept-1'));

    const allApps = db.getAttendanceApplications();
    const pendingHODApps = allApps.filter(a => (a.departmentId === deptId || deptId === 'dept-1') && (a.status === 'MENTOR_APPROVED' || a.status === 'WITH_HOD'));
    const deptReqs = approvalRequests.filter(r => r.departmentId === deptId || r.currentOffice === 'HOD_ACADEMIC');
    const pendingReqs = deptReqs.filter(r => r.status === 'PENDING' || r.status === 'SUBMITTED');

    // Calculate real attendance shortages (<75%)
    const shortageCount = deptStudents.filter(s => {
      const stats = db.getStudentAttendanceStats(s.id);
      return stats.percentage < 75;
    }).length;

    const riskCount = deptStudents.filter(s => {
      const stats = db.getStudentAttendanceStats(s.id);
      const docs = db.getStudentAcademicDocumentsByStudentId(s.id);
      return stats.percentage < 75 || docs.some(d => d.status !== 'VERIFIED');
    }).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="grid-4">
          <StatCard title="Dept Students" value={deptStudents.length} subtitle={`${deptPrograms.length} Active Programs`} icon={Users2} colorScheme="orange" onClick={() => setActiveTab('hod-dept-students')} />
          <StatCard title="Dept Faculty" value={deptFaculty.length} subtitle="Teaching Professors" icon={UserCheck} colorScheme="navy" onClick={() => setActiveTab('hod-dept-faculty')} />
          <StatCard title="Active Courses" value={deptSubs.length || 8} subtitle="Department Curriculum" icon={BookOpen} colorScheme="green" onClick={() => setActiveTab('hod-academic-subjects')} />
          <StatCard title="Pending Approvals" value={pendingHODApps.length} subtitle="Attendance Condonation Queue" icon={CheckSquare} colorScheme={pendingHODApps.length > 0 ? 'gold' : 'green'} onClick={() => setActiveTab('hod-attendance-approvals')} />
        </div>

        <div className="grid-4">
          <StatCard title="Attendance Shortage" value={shortageCount} subtitle="Students Below 75%" icon={AlertTriangle} colorScheme={shortageCount > 0 ? 'orange' : 'green'} onClick={() => setActiveTab('hod-attendance-shortage')} />
          <StatCard title="Academic At-Risk" value={riskCount} subtitle="Attendance / Doc Deficits" icon={AlertCircle} colorScheme={riskCount > 0 ? 'orange' : 'green'} onClick={() => setActiveTab('hod-students-at-risk')} />
          <StatCard title="Pending Requests" value={pendingReqs.length} subtitle="Grievances & Queries" icon={MessageSquare} colorScheme="navy" onClick={() => setActiveTab('hod-requests-dept')} />
          <StatCard title="Exam Eligibility" value={`${deptStudents.length - shortageCount} / ${deptStudents.length}`} subtitle="Semester Admitted" icon={Award} colorScheme="green" onClick={() => setActiveTab('hod-exam-eligibility')} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>HOD Department Quick Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('hod-attendance-approvals')}>
              <CheckSquare size={16} /> Review Attendance Condonations ({pendingHODApps.length})
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('hod-faculty-allocation')}>
              <UserCheck size={16} /> Course Subject Allocations
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('hod-students-at-risk')}>
              <AlertCircle size={16} /> Inspect At-Risk Students ({riskCount})
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('hod-reports-academic')}>
              <FileSpreadsheet size={16} /> Department Reports (.xlsx)
            </button>
          </div>
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
    const students = db.getStudents();
    const student = students.find(s => s.id === studentId || s.enrollmentNo === user?.enrollmentNo) || students[0];

    const deptObj = departments.find(d => d.id === student.departmentId);
    const progObj = programs.find(p => p.id === student.programId);
    const semObj = semesters.find(s => s.id === student.semesterId);
    const ayObj = academicYears.find(ay => ay.id === student.academicYearId) || currentAY;
    const semNumber = semObj ? `Semester ${semObj.number}` : 'Semester 4';
    const ayName = ayObj?.name || '2026-2027';

    const stats = db.getStudentAttendanceStats(student.id);
    const todayClasses = timetableEntries.filter(t => t.dayOfWeek === 'Monday' || t.divisionId === student.divisionId).slice(0, 4);
    const studentAssignments = assignments.filter(a => a.status === 'ACTIVE');
    const pendingAssignments = studentAssignments.filter(a => !(db.getAssignmentSubmissions() || []).some(sub => sub.assignmentId === a.id && sub.studentId === student.id));

    const studentFee = studentFeeRecords.find(r => r.studentId === student.id || r.enrollmentNo === student.enrollmentNo) || studentFeeRecords[0];
    const studentPayments = (db.getFeePaymentTransactions() || []).filter(t => t.studentId === student.id || t.enrollmentNo === student.enrollmentNo).slice(0, 4);

    const examsList = db.getExams();
    const upcomingExams = examsList.filter(e => e.status === 'SCHEDULED' || e.status === 'ONGOING').slice(0, 3);

    const studentGeneralReqs = (db.getState().studentRequests || []).filter((r: any) => r.studentId === student.id || r.enrollmentNo === student.enrollmentNo);
    const studentSectionReqs = (db.getState().studentSectionRequests || []).filter((r: any) => r.studentId === student.id || r.enrollmentNo === student.enrollmentNo);
    const combinedRequests = [
      ...studentGeneralReqs.map((r: any) => ({ id: r.id, reqNo: r.requestNo, title: r.category.replace(/_/g, ' '), date: r.createdAt, status: r.status, type: 'GENERAL' })),
      ...studentSectionReqs.map((r: any) => ({ id: r.id, reqNo: r.requestNo, title: r.serviceName, date: r.createdAt, status: r.status, type: 'STUDENT_SECTION' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

    const studentPendingReqs = combinedRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'REJECTED' && r.status !== 'CLOSED');
    const myNotifs = userNotifications.slice(0, 4);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* 6 Summary Cards */}
        <div className="grid-6">
          <StatCard
            title="Attendance %"
            value={`${stats.percentage}%`}
            subtitle={`${stats.presentClasses} / ${stats.totalClasses} Lectures`}
            icon={ClipboardCheck}
            colorScheme={stats.percentage >= 75 ? 'green' : 'orange'}
            onClick={() => setActiveTab('attendance')}
          />
          <StatCard
            title="Pending Fees"
            value={`₹${(studentFee?.pendingAmount || 0).toLocaleString()}`}
            subtitle={studentFee?.pendingAmount === 0 ? 'All Clear' : `Due: ${studentFee?.dueDate || 'Immediate'}`}
            icon={IndianRupee}
            colorScheme={studentFee?.pendingAmount === 0 ? 'green' : 'orange'}
            onClick={() => setActiveTab('fees')}
          />
          <StatCard
            title="Upcoming Exam"
            value={`${upcomingExams.length} Active`}
            subtitle={upcomingExams[0]?.name || 'End Sem Exam'}
            icon={FileCheck}
            colorScheme="navy"
            onClick={() => setActiveTab('exam-forms')}
          />
          <StatCard
            title="Pending Requests"
            value={studentPendingReqs.length}
            subtitle="In Progress / Review"
            icon={CheckSquare}
            colorScheme="gold"
            onClick={() => setActiveTab('requests')}
          />
          <StatCard
            title="Assignments Due"
            value={pendingAssignments.length}
            subtitle="Coursework to Submit"
            icon={ClipboardList}
            colorScheme="orange"
            onClick={() => setActiveTab('assignments')}
          />
          <StatCard
            title="Notifications"
            value={myNotifs.length}
            subtitle="Recent Alerts"
            icon={Bell}
            colorScheme="green"
            onClick={() => setActiveTab('notifications')}
          />
        </div>

        {/* 2-Column Section: Today's Classes & Upcoming Exams */}
        <div className="grid-2">
          {/* 1. Today's Classes */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--brand-orange)" /> Today's Scheduled Lectures
              </h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('timetable')}>View Timetable</button>
            </div>
            {todayClasses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No lectures scheduled for today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {todayClasses.map(tt => {
                  const subj = db.getSubjectById(tt.subjectId);
                  const fac = db.getFaculty().find(f => f.id === tt.facultyId);
                  return (
                    <div key={tt.id} style={{ padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{subj?.name || 'Class Lecture'} ({subj?.code || 'CSE'})</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {tt.timeSlot} • Room: <strong>{tt.roomNo}</strong> • Faculty: {fac?.name || 'Assigned Professor'}
                        </div>
                      </div>
                      <Badge variant="active">{subj?.type || 'THEORY'}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Upcoming Exams */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck size={20} color="var(--brand-orange)" /> Upcoming University Examinations
              </h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('exam-forms')}>Exam Forms</button>
            </div>
            {upcomingExams.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No examinations scheduled currently.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingExams.map(ex => (
                  <div key={ex.id} style={{ padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{ex.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Starts: <strong>{ex.startDate}</strong> • Status: {ex.status}
                      </div>
                    </div>
                    <Badge variant="gold">{ex.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Section: Recent Fee Payments & Recent Requests */}
        <div className="grid-2">
          {/* 3. Recent Fee Payments */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IndianRupee size={20} color="var(--brand-orange)" /> Recent Fee Payments &amp; Receipts
              </h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('fees')}>View All Receipts</button>
            </div>
            {studentPayments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No payment transactions recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {studentPayments.map(tx => (
                  <div key={tx.id} style={{ padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>
                        Receipt: <code style={{ color: 'var(--brand-orange)' }}>{tx.receiptNo}</code>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Date: {tx.paymentDate} • Mode: {tx.paymentMode} • Ref: {tx.transactionId}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#10B981', fontSize: '1rem' }}>₹{tx.paidAmount.toLocaleString()}</div>
                      <Badge variant="active">SUCCESS</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Recent Requests */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={20} color="var(--brand-orange)" /> Recent Service Requests &amp; Queries
              </h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('requests')}>Track Requests</button>
            </div>
            {combinedRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No service requests or queries logged.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {combinedRequests.map(req => (
                  <div key={req.id} style={{ padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{req.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Req No: <code style={{ color: 'var(--brand-orange)' }}>{req.reqNo}</code> • Date: {new Date(req.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={req.status === 'COMPLETED' || req.status === 'READY' ? 'active' : req.status === 'REJECTED' ? 'danger' : 'gold'}>
                      {req.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Important Notifications */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} color="var(--brand-orange)" /> Important University Notifications &amp; Alerts
            </h3>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('notifications')}>All Notifications</button>
          </div>
          {myNotifs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No unread notifications.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myNotifs.map(n => (
                <div key={n.id} style={{ padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Badge variant="navy">{n.module}</Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.timestamp || (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent')}</span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-navy)' }}>{n.title}</h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{n.message}</p>
                  </div>
                  {n.linkTab && (
                    <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab(n.linkTab || 'dashboard')}>
                      View Details
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 1B. Principal / HOI Dashboard
  const renderPrincipalDashboard = () => {
    const instId = user?.instituteId || 'inst-1';
    const currentInst = institutes.find(i => i.id === instId) || institutes[0];
    const instDepts = departments.filter(d => d.instituteId === currentInst?.id || instId === 'inst-1');
    const instProgs = programs.filter(p => p.instituteId === currentInst?.id || instDepts.some(d => d.id === p.departmentId));
    const instStuds = studentsList.filter(s => s.instituteId === currentInst?.id || instDepts.some(d => d.id === s.departmentId));
    const instFac = facultyList.filter(f => f.instituteId === currentInst?.id || instDepts.some(d => d.id === f.departmentId));

    const allApps = db.getAttendanceApplications();
    const pendingHOIApps = allApps.filter(a => (a.instituteId === currentInst?.id || instId === 'inst-1') && (a.status === 'HOD_APPROVED' || a.status === 'WITH_HOI'));
    const instReqs = approvalRequests.filter(r => (r.currentOffice as any) === 'HOI' || (r.currentOffice as any) === 'PRINCIPAL' || instDepts.some(d => d.id === r.departmentId));
    const pendingReqs = instReqs.filter(r => r.status === 'PENDING' || r.status === 'SUBMITTED');

    const shortageCount = instStuds.filter(s => db.getStudentAttendanceStats(s.id).percentage < 75).length;
    const riskCount = instStuds.filter(s => {
      const stats = db.getStudentAttendanceStats(s.id);
      const docs = db.getStudentAcademicDocumentsByStudentId(s.id);
      return stats.percentage < 75 || docs.some(d => d.status !== 'VERIFIED');
    }).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div className="grid-4">
          <StatCard title="Constituent Depts" value={instDepts.length} subtitle={`${instProgs.length} Degree Programs`} icon={Building2} colorScheme="navy" onClick={() => setActiveTab('hoi-inst-departments')} />
          <StatCard title="Institute Students" value={instStuds.length} subtitle="Active Headcount" icon={Users2} colorScheme="orange" onClick={() => setActiveTab('hoi-inst-students')} />
          <StatCard title="Faculty Strength" value={instFac.length} subtitle="Teaching Professors" icon={UserCheck} colorScheme="green" onClick={() => setActiveTab('hoi-inst-faculty')} />
          <StatCard title="Final Approvals" value={pendingHOIApps.length} subtitle="Attendance Condonation Queue" icon={CheckSquare} colorScheme={pendingHOIApps.length > 0 ? 'gold' : 'green'} onClick={() => setActiveTab('hoi-attendance-approvals')} />
        </div>

        <div className="grid-4">
          <StatCard title="Attendance Shortage" value={shortageCount} subtitle="Students Below 75%" icon={AlertTriangle} colorScheme={shortageCount > 0 ? 'orange' : 'green'} onClick={() => setActiveTab('hoi-attendance-shortage')} />
          <StatCard title="Academic At-Risk" value={riskCount} subtitle="Attendance / Doc Deficits" icon={AlertCircle} colorScheme={riskCount > 0 ? 'orange' : 'green'} onClick={() => setActiveTab('hoi-students-at-risk')} />
          <StatCard title="Pending Requests" value={pendingReqs.length} subtitle="Grievances & Escalations" icon={MessageSquare} colorScheme="navy" onClick={() => setActiveTab('hoi-requests-pending')} />
          <StatCard title="Exam Admitted" value={`${instStuds.length - shortageCount} / ${instStuds.length}`} subtitle="Semester Exam Clear" icon={Award} colorScheme="green" onClick={() => setActiveTab('hoi-exam-eligibility')} />
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>HOI Executive Quick Controls</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={() => setActiveTab('hoi-attendance-approvals')}>
              <CheckSquare size={16} /> Review Final Condonations ({pendingHOIApps.length})
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('hoi-inst-departments')}>
              <Building2 size={16} /> Department Comparison
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('hoi-students-at-risk')}>
              <AlertCircle size={16} /> Inspect At-Risk Students ({riskCount})
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('hoi-reports-academic')}>
              <FileSpreadsheet size={16} /> Institute Reports (.xlsx)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') return renderAdminDashboard();
    if (role === 'PRINCIPAL') return renderPrincipalDashboard();
    if (role === 'REGISTRAR') return renderRegistrarDashboard();
    if (role === 'DEPUTY_REGISTRAR') return renderDeputyRegistrarDashboard();
    if (role === 'IQAC') return renderIQACDashboard();
    if (role === 'EXAM_CELL') return renderExamCellDashboard();
    if (role === 'STUDENT_SECTION') return renderStudentSectionDashboard();
    if (role === 'HOSTEL_ADMIN') return renderHostelAdminDashboard();
    if (role === 'HOD') return renderHODDashboard();
    if (role === 'FACULTY') return renderFacultyDashboard();
    return renderStudentDashboard();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ─── PHASE 3: SMART ACTION CENTER ("WHAT NEEDS MY ATTENTION?") ─── */}
      <SmartActionCenter setActiveTab={setActiveTab} />

      {/* Role-Specific Dashboard Content (Preserved Intact) */}
      {renderCurrentView()}

      <DashboardReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dashboardType="CAMPUS_HOME"
        user={user}
        role={role}
      />
    </div>
  );
};
