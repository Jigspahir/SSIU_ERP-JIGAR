import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { attendanceApprovalService } from '../../services/attendanceApprovalService';
import { studentRequestService } from '../../services/studentRequestService';
import { mentorAssignmentService } from '../../services/mentorAssignmentService';
import { documentMasterService } from '../../services/documentMasterService';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { StudentProfileModal } from '../../components/profile/StudentProfileModal';
import { 
  Building2, Users, UserCheck, BookOpen, Clock, Award, 
  CheckSquare, AlertCircle, AlertTriangle, FileText, CheckCircle2, 
  Search, Mail, Phone, Eye, ShieldCheck, FolderCheck, Lock, 
  XCircle, Download, Check, FileSpreadsheet, Plus, RefreshCw,
  BarChart3, MessageSquare, Calendar, ChevronRight, Filter, ExternalLink,
  GitFork, Layers, UserPlus
} from 'lucide-react';
import { AttendanceApplication, Student, Faculty, Subject, Program, Department, Semester } from '../../types';
import * as XLSX from 'xlsx';

export type HOITabType = 
  | 'OVERVIEW'
  | 'DEPARTMENTS'
  | 'HODS'
  | 'STUDENTS'
  | 'AT_RISK'
  | 'FACULTY'
  | 'FACULTY_WORKLOAD'
  | 'ATTENDANCE'
  | 'ATTENDANCE_SHORTAGE'
  | 'ATTENDANCE_APPROVALS'
  | 'EXAMINATION'
  | 'EXAM_ELIGIBILITY'
  | 'DOCUMENTS'
  | 'REQUESTS'
  | 'FEEDBACK'
  | 'REPORTS';

export interface HOIWorkspacePageProps {
  initialTab?: HOITabType;
}

export const HOIWorkspacePage: React.FC<HOIWorkspacePageProps> = ({ initialTab = 'OVERVIEW' }) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<HOITabType>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ELIGIBLE' | 'SHORTAGE' | 'RISK'>('ALL');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // HOD Assignment Modal State
  const [isHODModalOpen, setIsHODModalOpen] = useState(false);
  const [hodAssignDeptId, setHodAssignDeptId] = useState('');
  const [hodAssignFacultyId, setHodAssignFacultyId] = useState('');
  const [hodAssignRemarks, setHodAssignRemarks] = useState('');

  // Attendance Final Review Modal state
  const [reviewApp, setReviewApp] = useState<AttendanceApplication | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO'>('APPROVE');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Resolve Authorized Institute (Strict Institute Boundary Scoping)
  const targetInstituteId = useMemo(() => {
    if (role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') {
      return user?.instituteId || 'inst-1';
    }
    return user?.instituteId || 'inst-1';
  }, [role, user]);

  const institute = useMemo(() => {
    return db.getInstituteById(targetInstituteId) || db.getInstitutes()[0];
  }, [targetInstituteId]);

  // 2. Institute-Scoped Datasets
  const instDepartments = useMemo(() => {
    const all = db.getDepartments();
    return all.filter(d => d.instituteId === institute?.id || targetInstituteId === 'inst-1');
  }, [institute, targetInstituteId, refreshKey]);

  const instPrograms = useMemo(() => {
    const all = db.getPrograms();
    return all.filter(p => p.instituteId === institute?.id || instDepartments.some(d => d.id === p.departmentId));
  }, [institute, instDepartments, refreshKey]);

  const instStudents = useMemo(() => {
    const all = db.getStudents();
    return all.filter(s => s.instituteId === institute?.id || instDepartments.some(d => d.id === s.departmentId));
  }, [institute, instDepartments, refreshKey]);

  const instFaculty = useMemo(() => {
    const all = db.getFaculty();
    return all.filter(f => f.instituteId === institute?.id || instDepartments.some(d => d.id === f.departmentId));
  }, [institute, instDepartments, refreshKey]);

  const instSubjects = useMemo(() => {
    const all = db.getSubjects();
    return all.filter(s => instDepartments.some(d => d.id === s.departmentId));
  }, [instDepartments, refreshKey]);

  // 3. Centralized Attendance & Risk Analysis for Institute Students
  const instAttendanceData = useMemo(() => {
    return instStudents.map(student => {
      const stats = db.getStudentAttendanceStats(student.id);
      const docs = db.getStudentAcademicDocumentsByStudentId(student.id);
      const hasShortage = stats.percentage < 75;
      const hasMissingDocs = docs.some(d => d.status !== 'VERIFIED');
      const isRisk = hasShortage || hasMissingDocs;

      return {
        student,
        stats,
        docsCount: docs.length,
        hasShortage,
        hasMissingDocs,
        isRisk
      };
    });
  }, [instStudents, refreshKey]);

  const shortageStudents = useMemo(() => {
    return instAttendanceData.filter(d => d.hasShortage);
  }, [instAttendanceData]);

  const atRiskStudents = useMemo(() => {
    return instAttendanceData.filter(d => d.isRisk);
  }, [instAttendanceData]);

  // 4. Pending Final Attendance Approvals Queue for HOI
  const pendingHOIAttendanceApps = useMemo(() => {
    const allApps = db.getAttendanceApplications();
    return allApps.filter(a => 
      (a.instituteId === institute?.id || role === 'SUPER_ADMIN') &&
      (a.status === 'HOD_APPROVED' || a.status === 'WITH_HOI')
    );
  }, [institute, role, refreshKey]);

  // 5. Institute Requests
  const instRequests = useMemo(() => {
    const all = db.getState().studentRequests || [];
    return all.filter(r => r.instituteId === institute?.id || (r as any).currentOffice === 'HOI' || (r as any).currentOffice === 'PRINCIPAL' || role === 'SUPER_ADMIN');
  }, [institute, role, refreshKey]);

  const pendingRequests = useMemo(() => {
    return instRequests.filter(r => r.status === 'SUBMITTED' || r.status === 'WORK_IN_PROGRESS' || r.status === 'WITH_HOI' || r.status === 'FORWARDED_TO_HOI');
  }, [instRequests]);

  // 6. Department Comparison Metrics
  const deptComparisonData = useMemo(() => {
    return instDepartments.map(dept => {
      const dStudents = instStudents.filter(s => s.departmentId === dept.id);
      const dFaculty = instFaculty.filter(f => f.departmentId === dept.id);
      const dShortages = dStudents.filter(s => {
        const stats = db.getStudentAttendanceStats(s.id);
        return stats.percentage < 75;
      }).length;
      const dPendingApps = pendingHOIAttendanceApps.filter(a => a.departmentId === dept.id).length;

      const avgAtt = dStudents.length > 0
        ? Math.round(dStudents.reduce((sum, s) => sum + db.getStudentAttendanceStats(s.id).percentage, 0) / dStudents.length)
        : 85;

      return {
        dept,
        studentsCount: dStudents.length,
        facultyCount: dFaculty.length,
        shortagesCount: dShortages,
        pendingAppsCount: dPendingApps,
        avgAttendance: avgAtt
      };
    });
  }, [instDepartments, instStudents, instFaculty, pendingHOIAttendanceApps, refreshKey]);

  // 7. Filtered Students Roster
  const filteredStudents = useMemo(() => {
    return instAttendanceData.filter(({ student, hasShortage, isRisk }) => {
      if (selectedDeptFilter !== 'ALL' && student.departmentId !== selectedDeptFilter) return false;
      if (selectedProgramFilter !== 'ALL' && student.programId !== selectedProgramFilter) return false;
      if (statusFilter === 'SHORTAGE' && !hasShortage) return false;
      if (statusFilter === 'ELIGIBLE' && hasShortage) return false;
      if (statusFilter === 'RISK' && !isRisk) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return student.name.toLowerCase().includes(q) || student.enrollmentNo.toLowerCase().includes(q);
      }
      return true;
    });
  }, [instAttendanceData, selectedDeptFilter, selectedProgramFilter, statusFilter, searchQuery]);

  // Handle Final HOI Attendance Decision
  const handleHOIAttendanceDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewApp || !user) return;

    try {
      attendanceApprovalService.hoiReview(
        reviewApp.id,
        {
          decision: reviewDecision,
          remarks: reviewRemarks.trim() || `HOI ${reviewDecision === 'APPROVE' ? 'approved & granted exam eligibility' : 'decision'}`
        },
        user
      );
      setReviewApp(null);
      setReviewRemarks('');
      setRefreshKey(k => k + 1);
      showToast(`Attendance application ${reviewApp.applicationNo} updated successfully (Status: ${reviewDecision === 'APPROVE' ? 'FINAL_APPROVED → Exam Eligible' : 'HOI_REJECTED'}).`);
    } catch (err: any) {
      alert(err.message || 'HOI Action failed.');
    }
  };

  // Handle HOD Assignment
  const handleSaveHODAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hodAssignDeptId || !hodAssignFacultyId) return;

    const dept = db.getDepartments().find(d => d.id === hodAssignDeptId);
    const fac = db.getFaculty().find(f => f.id === hodAssignFacultyId);

    if (dept && fac) {
      db.updateEntity<Department>('departments', dept.id, { hodId: fac.id, hodName: fac.name }, `Appointed ${fac.name} as HOD of ${dept.name}`);
      setIsHODModalOpen(false);
      setRefreshKey(k => k + 1);
      showToast(`Prof. ${fac.name} appointed as Head of Department for ${dept.name}.`);
    }
  };

  // Export to Excel (.xlsx only)
  const exportInstituteReportXLSX = (type: 'STUDENTS' | 'ATTENDANCE' | 'FACULTY' | 'DEPARTMENTS') => {
    let rows: any[] = [];
    let filename = `HOI_${institute?.code || 'INST'}_Report.xlsx`;

    if (type === 'STUDENTS') {
      rows = instAttendanceData.map(m => {
        const dept = db.getDepartmentById(m.student.departmentId);
        const prog = db.getProgramById(m.student.programId);
        const sem = db.getSemesterById(m.student.semesterId);
        return {
          'Student Name': m.student.name,
          'Enrollment Number': m.student.enrollmentNo,
          'Department': dept?.name || 'CSE',
          'Program': prog?.code || 'B.Tech',
          'Semester': sem?.number || 4,
          'Section': m.student.divisionId || 'Div A',
          'Attendance %': `${m.stats.percentage}%`,
          'Status': m.hasShortage ? 'ATTENDANCE SHORTAGE' : 'GOOD STANDING',
          'Exam Eligibility': m.hasShortage ? 'CONDONATION REQUIRED' : 'ELIGIBLE',
          'Email': m.student.email,
          'Phone': m.student.phone || '+91 98250 00000'
        };
      });
      filename = `HOI_Students_Roster_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (type === 'ATTENDANCE') {
      rows = instAttendanceData.map(m => {
        const dept = db.getDepartmentById(m.student.departmentId);
        return {
          'Department': dept?.name || 'CSE',
          'Student Name': m.student.name,
          'Enrollment': m.student.enrollmentNo,
          'Total Classes': m.stats.totalClasses,
          'Present': m.stats.presentClasses,
          'Absent': m.stats.absentClasses,
          'Attendance %': `${m.stats.percentage}%`,
          'Required %': '75%',
          'Exam Eligibility': m.hasShortage ? 'SHORTAGE (CONDONATION REQUIRED)' : 'ELIGIBLE'
        };
      });
      filename = `HOI_Attendance_Audit_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (type === 'FACULTY') {
      rows = instFaculty.map(f => {
        const dept = db.getDepartmentById(f.departmentId);
        const assignedSubs = instSubjects.filter(s => s.assignedFacultyId === f.id);
        const totalThHours = assignedSubs.reduce((sum, s) => sum + (s.theoryHoursPerWeek || 3), 0);
        const totalLabHours = assignedSubs.reduce((sum, s) => sum + (s.labHoursPerWeek || 2), 0);
        return {
          'Faculty Name': f.name,
          'Employee ID': f.employeeId,
          'Department': dept?.name || 'CSE',
          'Designation': f.designation,
          'Assigned Courses': assignedSubs.map(s => s.code).join(', ') || 'None',
          'Theory Hours / Wk': totalThHours,
          'Lab Hours / Wk': totalLabHours,
          'Total Weekly Load': totalThHours + totalLabHours,
          'Status': f.status
        };
      });
      filename = `HOI_Faculty_Workload_${new Date().toISOString().split('T')[0]}.xlsx`;
    } else {
      rows = deptComparisonData.map(d => ({
        'Department Name': d.dept.name,
        'Code': d.dept.code,
        'HOD Name': d.dept.hodName || 'Assigned HOD',
        'Total Students': d.studentsCount,
        'Total Faculty': d.facultyCount,
        'Attendance Shortage (<75%)': d.shortagesCount,
        'Average Attendance %': `${d.avgAttendance}%`,
        'Pending Approvals': d.pendingAppsCount
      }));
      filename = `HOI_Department_Comparison_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report Data');
    XLSX.writeFile(wb, filename);
    showToast(`Exported ${type} report to .xlsx successfully.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ECFDF5', border: '1px solid #10B981', color: '#10B981', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)', margin: 0 }}>
            {institute?.name || 'Swarrnim Institute of Technology & Engineering'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Institutional governance across {instDepartments.length} Departments, {instStudents.length} Students, {instFaculty.length} Faculty Members.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => exportInstituteReportXLSX('DEPARTMENTS')} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileSpreadsheet size={15} color="#10B981" /> Export Institute Summary (.xlsx)
          </button>
          <button onClick={() => exportInstituteReportXLSX('STUDENTS')} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileSpreadsheet size={15} color="#0EA5E9" /> Export Students (.xlsx)
          </button>
          <button onClick={() => setIsHODModalOpen(true)} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <UserPlus size={15} /> Appoint / Reassign HOD
          </button>
        </div>
      </div>

      {/* Top Institute KPI Statistics */}
      <div className="grid-4">
        <StatCard 
          title="Departments" 
          value={instDepartments.length} 
          subtitle={`${instPrograms.length} Degree Programs`} 
          icon={Building2} 
          colorScheme="navy" 
          onClick={() => setActiveTab('DEPARTMENTS')}
        />
        <StatCard 
          title="Enrolled Students" 
          value={instStudents.length} 
          subtitle="Active Institute Headcount" 
          icon={Users} 
          colorScheme="orange" 
          onClick={() => setActiveTab('STUDENTS')}
        />
        <StatCard 
          title="Faculty Strength" 
          value={instFaculty.length} 
          subtitle="Professors & Lecturers" 
          icon={UserCheck} 
          colorScheme="green" 
          onClick={() => setActiveTab('FACULTY')}
        />
        <StatCard 
          title="Final Approvals Queue" 
          value={pendingHOIAttendanceApps.length} 
          subtitle="Awaiting Final HOI Approval" 
          icon={CheckSquare} 
          colorScheme={pendingHOIAttendanceApps.length > 0 ? 'gold' : 'green'} 
          onClick={() => setActiveTab('ATTENDANCE_APPROVALS')}
        />
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn btn-sm ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('OVERVIEW')}
        >
          <Building2 size={14} /> Institute Overview
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'DEPARTMENTS' || activeTab === 'HODS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('DEPARTMENTS')}
        >
          <GitFork size={14} /> Departments &amp; HODs ({instDepartments.length})
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'STUDENTS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('STUDENTS')}
        >
          <Users size={14} /> Student Roster ({instStudents.length})
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'AT_RISK' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('AT_RISK')}
        >
          <AlertCircle size={14} /> At-Risk Students ({atRiskStudents.length})
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'FACULTY' || activeTab === 'FACULTY_WORKLOAD' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('FACULTY')}
        >
          <UserCheck size={14} /> Faculty &amp; Workload ({instFaculty.length})
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'ATTENDANCE' || activeTab === 'ATTENDANCE_SHORTAGE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ATTENDANCE')}
        >
          <Clock size={14} /> Attendance ({shortageStudents.length} Shortage)
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'ATTENDANCE_APPROVALS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ATTENDANCE_APPROVALS')}
        >
          <CheckSquare size={14} /> Final Approvals ({pendingHOIAttendanceApps.length})
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'EXAMINATION' || activeTab === 'EXAM_ELIGIBILITY' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('EXAMINATION')}
        >
          <Award size={14} /> Exam Eligibility
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'REQUESTS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('REQUESTS')}
        >
          <MessageSquare size={14} /> Requests ({pendingRequests.length})
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'FEEDBACK' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('FEEDBACK')}
        >
          <BarChart3 size={14} /> Feedback Analytics
        </button>
        <button 
          className={`btn btn-sm ${activeTab === 'REPORTS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('REPORTS')}
        >
          <FileSpreadsheet size={14} /> Reports &amp; Analytics
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: Institute Overview & Department Comparison
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--brand-navy) 0%, #1e3a8a 100%)', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--brand-gold)', textTransform: 'uppercase' }}>Institute Governance Master</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.25rem' }}>{institute?.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                  Institute Code: <code>{institute?.code || 'SITE'}</code> • Principal / HOI: <strong>{user?.name || 'Dr. Principal'}</strong> • Academic Year: <strong>2025-2026</strong>
                </p>
              </div>
              <Badge variant="gold">OFFICIAL HOI WORKSPACE</Badge>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              Institute Department Comparison &amp; Academic Health Matrix
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Department Name &amp; Code</th>
                    <th>Head of Department (HOD)</th>
                    <th>Students</th>
                    <th>Faculty</th>
                    <th>Average Attendance %</th>
                    <th>Attendance Shortages (&lt;75%)</th>
                    <th>Pending Approvals</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deptComparisonData.map(d => (
                    <tr key={d.dept.id}>
                      <td>
                        <strong>{d.dept.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: <code>{d.dept.code}</code></div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{d.dept.hodName || 'Dr. HOD'}</div>
                        <Badge variant="navy">ACTIVE HOD</Badge>
                      </td>
                      <td><strong>{d.studentsCount} Students</strong></td>
                      <td><strong>{d.facultyCount} Faculty</strong></td>
                      <td>
                        <span style={{ fontWeight: 800, color: d.avgAttendance >= 75 ? '#10B981' : '#EF4444' }}>
                          {d.avgAttendance}%
                        </span>
                      </td>
                      <td>
                        <Badge variant={d.shortagesCount === 0 ? 'active' : 'danger'}>
                          {d.shortagesCount} Students
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={d.pendingAppsCount === 0 ? 'active' : 'warning'}>
                          {d.pendingAppsCount} Pending
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setSelectedDeptFilter(d.dept.id);
                            setActiveTab('STUDENTS');
                          }}
                        >
                          View Students →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: Departments & HOD Management
          ───────────────────────────────────────────────────────────── */}
      {(activeTab === 'DEPARTMENTS' || activeTab === 'HODS') && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Department Governance &amp; HOD Appointments ({instDepartments.length})
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Appoint, change, or review active Head of Department leadership and departmental performance.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsHODModalOpen(true)}>
              <UserPlus size={14} /> Appoint / Change HOD
            </button>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            {instDepartments.map(dept => {
              const dStudents = instStudents.filter(s => s.departmentId === dept.id);
              const dFaculty = instFaculty.filter(f => f.departmentId === dept.id);

              return (
                <div key={dept.id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>{dept.name}</h4>
                      <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>Dept Code: {dept.code}</code>
                    </div>
                    <Badge variant="gold">ACTIVE DEPT</Badge>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>HEAD OF DEPARTMENT (HOD)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                      {dept.hodName || 'Dr. HOD'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Academic Head • AY 2025-2026</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <span>Students: <strong>{dStudents.length}</strong></span>
                    <span>Faculty: <strong>{dFaculty.length}</strong></span>
                    <span>Programs: <strong>{instPrograms.filter(p => p.departmentId === dept.id).length}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setHodAssignDeptId(dept.id);
                        setIsHODModalOpen(true);
                      }}
                    >
                      Reassign HOD
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedDeptFilter(dept.id);
                        setActiveTab('STUDENTS');
                      }}
                    >
                      Inspect Department
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: Student Roster
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'STUDENTS' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                Institute Student Roster ({filteredStudents.length})
              </h3>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button 
                  className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-navy' : 'btn-outline'}`}
                  onClick={() => setStatusFilter('ALL')}
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                >
                  All ({instStudents.length})
                </button>
                <button 
                  className={`btn btn-sm ${statusFilter === 'SHORTAGE' ? 'btn-danger' : 'btn-outline'}`}
                  onClick={() => setStatusFilter('SHORTAGE')}
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                >
                  Shortage ({shortageStudents.length})
                </button>
                <button 
                  className={`btn btn-sm ${statusFilter === 'RISK' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setStatusFilter('RISK')}
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: statusFilter === 'RISK' ? '#F59E0B' : undefined }}
                >
                  At Risk ({atRiskStudents.length})
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select 
                className="form-select form-select-sm" 
                value={selectedDeptFilter} 
                onChange={e => setSelectedDeptFilter(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="ALL">All Departments</option>
                {instDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <div style={{ position: 'relative', width: '220px' }}>
                <input 
                  className="form-control form-control-sm" 
                  placeholder="Search student..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  style={{ paddingLeft: '1.8rem' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name &amp; Enrollment</th>
                  <th>Department &amp; Program</th>
                  <th>Semester &amp; Section</th>
                  <th>Attendance %</th>
                  <th>Academic Standing</th>
                  <th>Exam Eligibility</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(({ student, stats, hasShortage }) => {
                  const dept = db.getDepartmentById(student.departmentId);
                  const prog = db.getProgramById(student.programId);
                  const sem = db.getSemesterById(student.semesterId);

                  return (
                    <tr key={student.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{student.name}</div>
                        <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{student.enrollmentNo}</code>
                      </td>
                      <td>
                        <strong>{dept?.code || 'CSE'}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prog?.code || 'B.Tech'}</div>
                      </td>
                      <td>
                        <strong>Sem {sem?.number || 4}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.divisionId || 'Div A'}</div>
                      </td>
                      <td>
                        <Badge variant={!hasShortage ? 'active' : 'danger'}>
                          {stats.percentage}%
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={!hasShortage ? 'active' : 'warning'}>
                          {!hasShortage ? 'GOOD STANDING' : 'ATTENDANCE RISK'}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={!hasShortage ? 'active' : 'danger'}>
                          {!hasShortage ? 'ELIGIBLE' : 'SHORTAGE'}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => setSelectedStudentForProfile(student)}
                        >
                          <Eye size={13} /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: At-Risk Students
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'AT_RISK' && (
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={18} color="#EF4444" /> Institute At-Risk Students ({atRiskStudents.length})
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Identified based on attendance shortage (&lt;75%), missing verification documents, or academic backlog risks.
              </p>
            </div>
            <Badge variant="danger">{atRiskStudents.length} Institute Risk Cases</Badge>
          </div>

          {atRiskStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#10B981' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontWeight: 800 }}>No Institute At-Risk Students</h4>
              <p style={{ fontSize: '0.85rem' }}>All students meet attendance and document verification criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Candidate</th>
                    <th>Department</th>
                    <th>Attendance Status</th>
                    <th>Document Vault</th>
                    <th>Risk Details</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map(({ student, stats, hasShortage, hasMissingDocs }) => {
                    const dept = db.getDepartmentById(student.departmentId);
                    return (
                      <tr key={student.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{student.name}</div>
                          <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{student.enrollmentNo}</code>
                        </td>
                        <td><strong>{dept?.name || 'CSE'}</strong></td>
                        <td>
                          <span style={{ color: '#EF4444', fontWeight: 800 }}>{stats.percentage}%</span> / 75%
                        </td>
                        <td>
                          <Badge variant={!hasMissingDocs ? 'active' : 'orange'}>
                            {!hasMissingDocs ? 'Verified' : 'Pending Verification'}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                            {hasShortage && `• ${75 - stats.percentage}% Attendance Shortage`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600 }}>
                            {hasMissingDocs && `• Unverified Academic Records`}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedStudentForProfile(student)}
                          >
                            Inspect Record
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: Faculty & Workload Matrix
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'FACULTY' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Institute Faculty Roster &amp; Teaching Workload ({instFaculty.length})
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Faculty members across all departments with designation, active course assignments, and weekly load.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Faculty Name &amp; Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Assigned Courses</th>
                  <th>Theory Hours</th>
                  <th>Lab Hours</th>
                  <th>Total Workload</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {instFaculty.map(f => {
                  const dept = db.getDepartmentById(f.departmentId);
                  const assignedSubs = instSubjects.filter(s => s.assignedFacultyId === f.id);
                  const thHours = assignedSubs.reduce((sum, s) => sum + (s.theoryHoursPerWeek || 3), 0);
                  const labHours = assignedSubs.reduce((sum, s) => sum + (s.labHoursPerWeek || 2), 0);

                  return (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{f.name}</div>
                        <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{f.employeeId}</code>
                      </td>
                      <td><strong>{dept?.name || 'CSE'}</strong></td>
                      <td>{f.designation}</td>
                      <td>
                        {assignedSubs.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {assignedSubs.map(s => (
                              <Badge key={s.id} variant="navy">{s.code}</Badge>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>
                      <td><strong>{thHours} Hrs</strong></td>
                      <td><strong>{labHours} Hrs</strong></td>
                      <td>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                          {thHours + labHours} Hrs/Wk
                        </span>
                      </td>
                      <td>
                        <Badge variant={f.status === 'ACTIVE' ? 'active' : 'inactive'}>{f.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: Final 4-Tier Attendance Approvals Queue
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ATTENDANCE_APPROVALS' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Final Attendance Condonation Approvals Queue for Principal / HOI ({pendingHOIAttendanceApps.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Strict 4-Tier Sequence: <code>Student → Faculty → Mentor → HOD → HOI (FINAL)</code>. Approving grants <code>FINAL_APPROVED</code> and sets exam eligibility.
            </p>
          </div>

          {pendingHOIAttendanceApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>No attendance condonation applications currently awaiting final HOI decision.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Application No</th>
                    <th>Student &amp; Department</th>
                    <th>Subject</th>
                    <th>Endorsement Chain</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                    <th>Final Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingHOIAttendanceApps.map(app => (
                    <tr key={app.id}>
                      <td><code>{app.applicationNo}</code></td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{app.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.enrollmentNo} • {app.departmentName}</div>
                      </td>
                      <td>
                        <strong>{app.subjectName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.subjectCode}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem' }}>Faculty: <em>"{app.facultyRemarks || 'Approved'}"</em></div>
                        <div style={{ fontSize: '0.75rem' }}>Mentor: <em>"{app.mentorRemarks || 'Endorsed'}"</em></div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-navy)' }}>HOD: <em>"{app.hodRemarks || 'Recommended'}"</em></div>
                      </td>
                      <td>
                        <span style={{ color: '#EF4444', fontWeight: 800 }}>{app.currentAttendancePct}%</span> / {app.requiredAttendancePct}%
                      </td>
                      <td>
                        <Badge variant="warning">{app.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setReviewApp(app);
                            setReviewRemarks('');
                            setReviewDecision('APPROVE');
                          }}
                        >
                          Review &amp; Grant Final Approval
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 7: Examination Oversight & Exam Eligibility
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'EXAMINATION' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Institute Semester Exam Eligibility Register
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Overall candidate clearance across all departments based on attendance requirements and completed 4-tier condonations.
            </p>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Department</th>
                  <th>Attendance %</th>
                  <th>Faculty Endorsement</th>
                  <th>Mentor Status</th>
                  <th>HOD Endorsement</th>
                  <th>Final HOI Status</th>
                  <th>Exam Hall Ticket Clearance</th>
                </tr>
              </thead>
              <tbody>
                {instAttendanceData.map(({ student, stats, hasShortage }) => {
                  const dept = db.getDepartmentById(student.departmentId);
                  return (
                    <tr key={student.id}>
                      <td>
                        <strong>{student.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.enrollmentNo}</div>
                      </td>
                      <td><strong>{dept?.name || 'CSE'}</strong></td>
                      <td>
                        <Badge variant={!hasShortage ? 'active' : 'danger'}>
                          {stats.percentage}%
                        </Badge>
                      </td>
                      <td><Badge variant="active">CLEARED</Badge></td>
                      <td><Badge variant={!hasShortage ? 'active' : 'gold'}>{!hasShortage ? 'CLEARED' : 'CONDONED'}</Badge></td>
                      <td><Badge variant={!hasShortage ? 'active' : 'navy'}>{!hasShortage ? 'APPROVED' : 'RECOMMENDED'}</Badge></td>
                      <td><Badge variant={!hasShortage ? 'active' : 'navy'}>{!hasShortage ? 'FINAL APPROVED' : 'PENDING'}</Badge></td>
                      <td>
                        <Badge variant={!hasShortage ? 'active' : 'danger'}>
                          {!hasShortage ? 'EXAM ELIGIBLE' : 'PROVISIONAL'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 8: Escalated Student Requests & Routing
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'REQUESTS' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
              Institute Grievance &amp; Escalated Requests Desk ({instRequests.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Student requests escalated from HODs or requiring institute-level resolution or transfer to central offices.
            </p>
          </div>

          {instRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>No requests currently require Principal / HOI attention.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Subject / Query</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {instRequests.map((r: any) => (
                    <tr key={r.id}>
                      <td><code>{r.requestNo || r.id}</code></td>
                      <td>
                        <strong>{r.studentName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.enrollmentNo}</div>
                      </td>
                      <td><Badge variant="navy">{r.category || 'Academic'}</Badge></td>
                      <td>{r.subject || r.description}</td>
                      <td>{new Date(r.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td>
                        <Badge variant={r.status === 'RESOLVED' || r.status === 'APPROVED' ? 'active' : 'warning'}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 9: Feedback Analytics
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'FEEDBACK' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
            Institute Feedback &amp; Institutional Quality Indices
          </h3>
          <div className="grid-4" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>OVERALL TEACHING</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>4.65 / 5.0</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACADEMIC RIGOR</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-navy)' }}>4.70 / 5.0</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>INFRASTRUCTURE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-gold)' }}>4.80 / 5.0</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>STUDENT SATISFACTION</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0EA5E9' }}>94.2%</div>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            * Institutional policy protects student identity; feedback reports are compiled from anonymized evaluations.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 10: Reports & Analytics
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'REPORTS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Official Institute Reports Generator (.xlsx)
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Generate standard institute records for accreditation (NAAC/NBA), audits, and governing council reviews.
          </p>

          <div className="grid-4" style={{ gap: '1rem' }}>
            <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>Institute Department Matrix</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Department metrics, student/faculty strength, and attendance averages.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => exportInstituteReportXLSX('DEPARTMENTS')}>
                <Download size={14} /> Download (.xlsx)
              </button>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>Students Enrolment Roster</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Institute-wide student directory with program, department, and standing.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => exportInstituteReportXLSX('STUDENTS')}>
                <Download size={14} /> Download (.xlsx)
              </button>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>Attendance &amp; Shortage Audit</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Detailed attendance percentages, shortage counts, and eligibility status.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => exportInstituteReportXLSX('ATTENDANCE')}>
                <Download size={14} /> Download (.xlsx)
              </button>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>Faculty Workload Distribution</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Teaching workload calculations across all institute departments.</p>
              <button className="btn btn-secondary btn-sm" onClick={() => exportInstituteReportXLSX('FACULTY')}>
                <Download size={14} /> Download (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOD Assignment Modal */}
      {isHODModalOpen && (
        <Modal isOpen={isHODModalOpen} onClose={() => setIsHODModalOpen(false)} title="Appoint / Reassign Head of Department (HOD)">
          <form onSubmit={handleSaveHODAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" value={hodAssignDeptId} onChange={e => setHodAssignDeptId(e.target.value)} required>
                <option value="">Select Department...</option>
                {instDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Appoint Faculty as HOD *</label>
              <select className="form-select" value={hodAssignFacultyId} onChange={e => setHodAssignFacultyId(e.target.value)} required>
                <option value="">Select Faculty Member...</option>
                {instFaculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.designation} • {db.getDepartmentById(f.departmentId)?.code || 'CSE'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Remarks / Terms</label>
              <textarea 
                className="form-control" 
                rows={2} 
                placeholder="Enter appointment terms, tenure, or executive order number..."
                value={hodAssignRemarks}
                onChange={e => setHodAssignRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsHODModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Confirm Appointment</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Final Attendance Review Modal */}
      {reviewApp && (
        <Modal isOpen={!!reviewApp} onClose={() => setReviewApp(null)} title={`Final HOI Decision: Attendance Application ${reviewApp.applicationNo}`}>
          <form onSubmit={handleHOIAttendanceDecision} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div><strong>Student:</strong> {reviewApp.studentName} ({reviewApp.enrollmentNo})</div>
              <div><strong>Department:</strong> {reviewApp.departmentName}</div>
              <div><strong>Subject:</strong> {reviewApp.subjectName} ({reviewApp.subjectCode})</div>
              <div><strong>Attendance:</strong> {reviewApp.currentAttendancePct}% (Required: {reviewApp.requiredAttendancePct}%)</div>
              <div><strong>Shortage:</strong> {reviewApp.shortagePct}%</div>
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ENDORSEMENTS:</div>
                <div style={{ fontSize: '0.8rem' }}>• Faculty: <em>"{reviewApp.facultyRemarks || 'Approved'}"</em></div>
                <div style={{ fontSize: '0.8rem' }}>• Mentor: <em>"{reviewApp.mentorRemarks || 'Endorsed'}"</em></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--brand-navy)', fontWeight: 700 }}>• HOD: <em>"{reviewApp.hodRemarks || 'Recommended'}"</em></div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Principal / HOI Final Decision *</label>
              <select className="form-select" value={reviewDecision} onChange={e => setReviewDecision(e.target.value as any)}>
                <option value="APPROVE">Grant Final Approval (Make Student Exam Eligible)</option>
                <option value="REJECT">Reject Application</option>
                <option value="REQUEST_MORE_INFO">Request Clarification from HOD</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Final Remarks / Justification *</label>
              <textarea 
                className="form-control" 
                rows={3} 
                placeholder="Enter final executive observations or conditions..."
                value={reviewRemarks}
                onChange={e => setReviewRemarks(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewApp(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Final Decision</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Profile Modal */}
      {selectedStudentForProfile && (
        <StudentProfileModal isOpen={true} student={selectedStudentForProfile} onClose={() => setSelectedStudentForProfile(null)} />
      )}
    </div>
  );
};
