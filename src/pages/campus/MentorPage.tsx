import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { mentorAssignmentService } from '../../services/mentorAssignmentService';
import { attendanceApprovalService } from '../../services/attendanceApprovalService';
import { documentMasterService } from '../../services/documentMasterService';
import { MentorAssignmentTab } from '../../components/mentor/MentorAssignmentTab';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { StudentProfileModal } from '../../components/profile/StudentProfileModal';
import { StudentDocumentsSection } from '../../components/profile/StudentDocumentsSection';
import { 
  UserCheck, Calendar, Clock, MessageSquare, Plus, CheckCircle, 
  User, Users, AlertCircle, FileText, CheckCircle2, Search,
  Mail, Phone, Award, BookOpen, ChevronRight, Eye, ShieldCheck, CheckSquare,
  FolderCheck, Lock, XCircle, Download, Check, AlertTriangle, FileSpreadsheet,
  HelpCircle, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import { AttendanceApplication, Student, Subject, Assignment } from '../../types';
import { StudentAcademicDocumentItem } from '../../types/documentMaster';
import * as XLSX from 'xlsx';

interface MentoringSession {
  id: string;
  studentName: string;
  enrollmentNo: string;
  facultyName: string;
  topic: string;
  date: string;
  timeSlot: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

const initialSessions: MentoringSession[] = [
  {
    id: 'ms-1',
    studentName: 'Aarav Patel',
    enrollmentNo: '230101001',
    facultyName: 'Prof. Demo Faculty',
    topic: 'Career Pathway Guidance & Internship Opportunities',
    date: '2026-03-12',
    timeSlot: '03:00 PM - 03:30 PM',
    status: 'COMPLETED',
    notes: 'Discussed Semester 5 elective choices and AI/ML project domain.'
  },
  {
    id: 'ms-2',
    studentName: 'Diya Sharma',
    enrollmentNo: '230101002',
    facultyName: 'Prof. Demo Faculty',
    topic: 'Mid-term Attendance & Exam Preparation Counseling',
    date: '2026-03-20',
    timeSlot: '04:00 PM - 04:30 PM',
    status: 'SCHEDULED'
  }
];

export type MentorTabType = 
  | 'MY_STUDENTS' 
  | 'STUDENT_PROFILE'
  | 'ACADEMIC_OVERVIEW' 
  | 'STUDENT_ACADEMICS'
  | 'STUDENT_SUBJECTS'
  | 'TIMETABLE'
  | 'ASSIGNMENTS'
  | 'ACADEMIC_PERFORMANCE'
  | 'ATTENDANCE'
  | 'ATTENDANCE_SHORTAGE'
  | 'ATTENDANCE_APPROVALS'
  | 'EXAM_ELIGIBILITY'
  | 'EXAM_REQUESTS'
  | 'STUDENT_DOCUMENTS' 
  | 'PENDING_VERIFICATION' 
  | 'VERIFIED_DOCUMENTS'
  | 'DOCUMENT_HISTORY'
  | 'REQUESTS' 
  | 'SESSIONS' 
  | 'ALLOCATION';

export interface MentorPageProps {
  initialTab?: MentorTabType;
}

export const MentorPage: React.FC<MentorPageProps> = ({ initialTab = 'MY_STUDENTS' }) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<MentorTabType>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [sessions, setSessions] = useState<MentoringSession[]>(initialSessions);
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('02:00 PM - 02:30 PM');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ELIGIBLE' | 'SHORTAGE' | 'RISK'>('ALL');
  const [refreshKey, setRefreshKey] = useState(0);

  // Document Verification Action Modal
  const [rejectingDoc, setRejectingDoc] = useState<StudentAcademicDocumentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Attendance Review Modal state
  const [reviewApp, setReviewApp] = useState<AttendanceApplication | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO'>('APPROVE');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Determine active mentor if user is student
  const studentActiveMentor = useMemo(() => {
    if (role === 'STUDENT') {
      return mentorAssignmentService.getActiveMentorForStudent(user?.id || 'stu-1');
    }
    return null;
  }, [role, user]);

  // 2. Fetch assigned students if user is faculty/mentor (strictly scoped)
  const { assignments, students: myMentees } = useMemo(() => {
    return mentorAssignmentService.getAssignments({
      searchQuery
    }, user);
  }, [user, searchQuery, refreshKey]);

  // 3. Fetch student requests routed to this mentor
  const myMentorRequests = useMemo(() => {
    const allRequests = db.getState().studentRequests || [];
    if (role === 'FACULTY') {
      const myFac = db.getFaculty().find(f => f.id === user?.id || f.email === user?.email);
      const facId = myFac?.id || user?.id;
      return allRequests.filter(r => r.currentHandlerId === facId || r.mentorId === facId);
    }
    return allRequests;
  }, [role, user, refreshKey]);

  // 4. Fetch documents for this mentor's assigned mentees
  const menteeDocuments = useMemo(() => {
    const allDocs = db.getStudentAcademicDocuments();
    const menteeIds = new Set(myMentees.map(m => m.id));
    return allDocs.filter(d => menteeIds.has(d.studentId) || role === 'SUPER_ADMIN');
  }, [myMentees, role, refreshKey]);

  const pendingMenteesDocs = useMemo(() => {
    return menteeDocuments.filter(d => d.status === 'PENDING_VERIFICATION' || !d.isLocked);
  }, [menteeDocuments]);

  const verifiedMenteesDocs = useMemo(() => {
    return menteeDocuments.filter(d => d.status === 'VERIFIED' && d.isLocked);
  }, [menteeDocuments]);

  // 5. Attendance Shortage Calculation & Academic Risk Tracker (Centralized)
  const menteeAttendanceData = useMemo(() => {
    return myMentees.map(student => {
      const stats = db.getStudentAttendanceStats(student.id);
      const studentDocs = menteeDocuments.filter(d => d.studentId === student.id);
      const studentReqs = myMentorRequests.filter(r => r.studentId === student.id);
      const hasShortage = stats.percentage < 75;
      const hasMissingDocs = studentDocs.some(d => d.status !== 'VERIFIED');
      const hasPendingReqs = studentReqs.some(r => r.status === 'SUBMITTED' || r.status === 'WORK_IN_PROGRESS');

      // Academic Risk indicator
      const isRisk = hasShortage || hasMissingDocs;

      return {
        student,
        stats,
        docsCount: studentDocs.length,
        reqsCount: studentReqs.length,
        hasShortage,
        hasMissingDocs,
        hasPendingReqs,
        isRisk
      };
    });
  }, [myMentees, menteeDocuments, myMentorRequests]);

  const shortageStudents = useMemo(() => {
    return menteeAttendanceData.filter(m => m.hasShortage);
  }, [menteeAttendanceData]);

  const riskStudents = useMemo(() => {
    return menteeAttendanceData.filter(m => m.isRisk);
  }, [menteeAttendanceData]);

  // Filtered mentees by quick status filter
  const filteredMenteeData = useMemo(() => {
    if (statusFilter === 'SHORTAGE') {
      return menteeAttendanceData.filter(m => m.hasShortage);
    }
    if (statusFilter === 'ELIGIBLE') {
      return menteeAttendanceData.filter(m => !m.hasShortage);
    }
    if (statusFilter === 'RISK') {
      return menteeAttendanceData.filter(m => m.isRisk);
    }
    return menteeAttendanceData;
  }, [menteeAttendanceData, statusFilter]);

  const pendingRequestsCount = myMentorRequests.filter(r => r.status === 'SUBMITTED' || r.status === 'WORK_IN_PROGRESS' || r.status === 'WITH_MENTOR').length;

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !date) return;

    const newSess: MentoringSession = {
      id: `ms-${Date.now()}`,
      studentName: user?.name || 'Aarav Patel',
      enrollmentNo: user?.enrollmentNo || '230101001',
      facultyName: studentActiveMentor?.mentorName || 'Assigned Faculty Mentor',
      topic,
      date,
      timeSlot,
      status: 'SCHEDULED'
    };

    setSessions([newSess, ...sessions]);
    setShowModal(false);
    setTopic('');
    setDate('');
  };

  const handleVerifyDocument = (doc: StudentAcademicDocumentItem) => {
    try {
      documentMasterService.verifyDocument({
        documentId: doc.id,
        verifierUserId: user?.id || 'fac-1',
        verifierName: user?.name || 'Faculty Mentor',
        verifierRole: 'FACULTY_MENTOR',
        remarks: `Verified and approved by Mentor ${user?.name || 'Faculty'}`
      });
      setRefreshKey(k => k + 1);
      showToast(`Document "${doc.documentName}" for ${doc.studentName} has been VERIFIED & LOCKED.`);
    } catch (err: any) {
      alert(err.message || 'Verification failed.');
    }
  };

  const handleRejectDocumentConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDoc || !rejectionReason.trim()) return;

    try {
      documentMasterService.rejectDocument({
        documentId: rejectingDoc.id,
        verifierUserId: user?.id || 'fac-1',
        verifierName: user?.name || 'Faculty Mentor',
        verifierRole: 'FACULTY_MENTOR',
        rejectionReason: rejectionReason.trim()
      });
      setRejectingDoc(null);
      setRejectionReason('');
      setRefreshKey(k => k + 1);
      showToast(`Document "${rejectingDoc.documentName}" marked as REJECTED.`);
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  const handleAttendanceDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewApp || !user) return;

    try {
      attendanceApprovalService.mentorReview(
        reviewApp.id,
        {
          decision: reviewDecision,
          remarks: reviewRemarks.trim() || `Mentor ${reviewDecision === 'APPROVE' ? 'recommended approval' : 'decision'}`
        },
        user
      );
      setReviewApp(null);
      setReviewRemarks('');
      setRefreshKey(k => k + 1);
      showToast(`Attendance application ${reviewApp.applicationNo} updated successfully.`);
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  // Export Mentee Roster to Excel (.xlsx only)
  const exportMenteeRosterXLSX = () => {
    const rows = menteeAttendanceData.map(m => {
      const prog = db.getProgramById(m.student.programId);
      const sem = db.getSemesterById(m.student.semesterId);
      return {
        'Student Name': m.student.name,
        'Enrollment Number': m.student.enrollmentNo,
        'Program': prog?.code || 'B.Tech',
        'Semester': sem?.number || 4,
        'Section / Division': m.student.divisionId || 'Div A',
        'Attendance %': `${m.stats.percentage}%`,
        'Exam Eligibility': m.hasShortage ? 'ATTENDANCE SHORTAGE' : 'ELIGIBLE',
        'Pending Docs': m.hasMissingDocs ? 'YES' : 'NO',
        'Academic Risk': m.isRisk ? 'HIGH RISK' : 'NORMAL',
        'Email': m.student.email,
        'Contact Phone': m.student.phone || '+91 98250 00000'
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mentees Roster');
    XLSX.writeFile(wb, `Mentor_Assigned_Mentees_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Exported mentee roster to .xlsx successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {toast && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ECFDF5', border: '1px solid #10B981', color: '#10B981', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>
            {role === 'STUDENT' ? 'My Assigned Faculty Mentor' : 'Mentor Workspace & Mentee Management'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT'
              ? 'Your designated faculty mentor is your academic guide, counselor, and first point of contact.'
              : 'Direct oversight for assigned mentees, academic overview, attendance shortage tracking, and document verification.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {role !== 'STUDENT' && (
            <button onClick={exportMenteeRosterXLSX} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileSpreadsheet size={15} color="#10B981" /> Export Mentees (.xlsx)
            </button>
          )}

          {role === 'STUDENT' && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={16} /> Book Mentoring Session
            </button>
          )}
        </div>
      </div>

      {/* ─── STUDENT VIEW: My Assigned Mentor Card ─────────────────────────── */}
      {role === 'STUDENT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--brand-navy) 0%, #1e3a8a 100%)',
            color: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                backgroundColor: 'var(--brand-gold)', color: 'var(--brand-navy)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 900, flexShrink: 0
              }}>
                {studentActiveMentor?.mentorName ? studentActiveMentor.mentorName.charAt(0) : 'M'}
              </div>

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Badge variant="gold">OFFICIAL ACADEMIC MENTOR</Badge>
                  <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>Active Designation</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {studentActiveMentor?.mentorName || 'Prof. Faculty Member'}
                </h3>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#E2E8F0', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={15} color="var(--brand-orange)" /> {studentActiveMentor?.mentorEmail || 'faculty@swarrnim.edu.in'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={15} color="var(--brand-gold)" /> {studentActiveMentor?.mentorPhone || '+91 98250 11001'}
                  </span>
                  <span>Dept: <strong>{studentActiveMentor?.departmentName || 'Computer Engineering'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FACULTY / MENTOR VIEW: Full Workspace ──────────────────────── */}
      {role !== 'STUDENT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top KPI Summary Cards */}
          <div className="grid-4">
            <StatCard 
              title="Total Mentees" 
              value={myMentees.length} 
              subtitle="Assigned students" 
              icon={Users} 
              colorScheme="navy" 
            />
            <StatCard 
              title="Attendance Shortage" 
              value={shortageStudents.length} 
              subtitle="Below 75% requirement" 
              icon={AlertTriangle} 
              colorScheme={shortageStudents.length > 0 ? 'orange' : 'green'} 
            />
            <StatCard 
              title="Pending Documents" 
              value={pendingMenteesDocs.length} 
              subtitle="Requires verification" 
              icon={FolderCheck} 
              colorScheme={pendingMenteesDocs.length > 0 ? 'orange' : 'green'} 
            />
            <StatCard 
              title="Academic Risk" 
              value={riskStudents.length} 
              subtitle="Shortage or missing docs" 
              icon={AlertCircle} 
              colorScheme={riskStudents.length > 0 ? 'orange' : 'green'} 
            />
          </div>

          {/* Sub-Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${activeTab === 'MY_STUDENTS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('MY_STUDENTS'); setSelectedStudentForDocs(null); }}
            >
              <Users size={14} /> Mentee List ({myMentees.length})
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'ACADEMIC_OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('ACADEMIC_OVERVIEW'); setSelectedStudentForDocs(null); }}
            >
              <Award size={14} /> Academic Overview &amp; Risk
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'ATTENDANCE' || activeTab === 'ATTENDANCE_SHORTAGE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('ATTENDANCE'); setSelectedStudentForDocs(null); }}
            >
              <Clock size={14} /> Mentee Attendance ({shortageStudents.length} Shortage)
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'ATTENDANCE_APPROVALS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('ATTENDANCE_APPROVALS'); setSelectedStudentForDocs(null); }}
            >
              <CheckSquare size={14} /> Attendance Approvals
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'EXAM_ELIGIBILITY' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('EXAM_ELIGIBILITY'); setSelectedStudentForDocs(null); }}
            >
              <ShieldCheck size={14} /> Exam Eligibility
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'STUDENT_DOCUMENTS' || activeTab === 'PENDING_VERIFICATION' || activeTab === 'VERIFIED_DOCUMENTS' || activeTab === 'DOCUMENT_HISTORY' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('PENDING_VERIFICATION')}
            >
              <FolderCheck size={14} /> Document Verification ({pendingMenteesDocs.length})
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'REQUESTS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('REQUESTS'); setSelectedStudentForDocs(null); }}
            >
              <MessageSquare size={14} /> Student Requests ({pendingRequestsCount})
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'SESSIONS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('SESSIONS'); setSelectedStudentForDocs(null); }}
            >
              <Calendar size={14} /> Counseling Sessions ({sessions.length})
            </button>
            {(role === 'HOD' || role === 'PRINCIPAL' || role === 'SUPER_ADMIN') && (
              <button 
                className={`btn btn-sm ${activeTab === 'ALLOCATION' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setActiveTab('ALLOCATION'); setSelectedStudentForDocs(null); }}
              >
                <UserCheck size={14} /> Mentor Allocation
              </button>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: Mentee List (Scoped Roster)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'MY_STUDENTS' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                    Assigned Mentees Roster ({filteredMenteeData.length})
                  </h3>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button 
                      className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-navy' : 'btn-outline'}`}
                      onClick={() => setStatusFilter('ALL')}
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    >
                      All ({menteeAttendanceData.length})
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
                      Academic Risk ({riskStudents.length})
                    </button>
                  </div>
                </div>

                <div style={{ position: 'relative', width: '260px' }}>
                  <input 
                    className="form-control" 
                    placeholder="Search by name or enrollment..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    style={{ paddingLeft: '2rem' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {filteredMenteeData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 600 }}>No mentees match the selected filter criteria.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student Name &amp; Enrollment</th>
                        <th>Program &amp; Semester</th>
                        <th>Section</th>
                        <th>Attendance %</th>
                        <th>Academic Status</th>
                        <th>Document Status</th>
                        <th>Requests</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMenteeData.map(({ student, stats, hasShortage, hasMissingDocs, reqsCount }) => {
                        const prog = db.getProgramById(student.programId);
                        const sem = db.getSemesterById(student.semesterId);

                        return (
                          <tr key={student.id}>
                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{student.name}</div>
                              <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{student.enrollmentNo}</code>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{prog?.code || 'B.Tech'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sem {sem?.number || 4}</div>
                            </td>
                            <td>
                              <Badge variant="navy">{student.divisionId || 'Div A'}</Badge>
                            </td>
                            <td>
                              <Badge variant={!hasShortage ? 'active' : 'danger'}>
                                {stats.percentage}% Attendance
                              </Badge>
                            </td>
                            <td>
                              <Badge variant={!hasShortage ? 'active' : 'warning'}>
                                {!hasShortage ? 'IN GOOD STANDING' : 'ATTENDANCE RISK'}
                              </Badge>
                            </td>
                            <td>
                              <Badge variant={!hasMissingDocs ? 'active' : 'orange'}>
                                {!hasMissingDocs ? 'VERIFIED' : 'PENDING DOCS'}
                              </Badge>
                            </td>
                            <td>
                              {reqsCount > 0 ? (
                                <Badge variant="gold">{reqsCount} Active</Badge>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                <button 
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => setSelectedStudentForProfile(student)}
                                  title="View Academic Profile"
                                >
                                  <Eye size={13} /> Profile
                                </button>
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    setSelectedStudentForDocs(student);
                                    setActiveTab('STUDENT_DOCUMENTS');
                                  }}
                                  title="View Documents Vault"
                                >
                                  <FolderCheck size={13} /> Documents
                                </button>
                              </div>
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
              TAB 2: Academic Overview & Academic Risk Tracker
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'ACADEMIC_OVERVIEW' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-orange)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={18} color="var(--brand-orange)" /> Academic Risk Identification &amp; Early Intervention
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Identifies students requiring academic counseling based on attendance shortage (&lt;75%), missing verification documents, or backlog subjects.
                    </p>
                  </div>
                  <Badge variant="orange">{riskStudents.length} Students At Risk</Badge>
                </div>

                {riskStudents.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#10B981', backgroundColor: '#ECFDF5', borderRadius: '8px' }}>
                    <CheckCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ fontWeight: 700 }}>All assigned mentees are in good academic standing. No critical risks detected.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student Mentee</th>
                          <th>Attendance Status</th>
                          <th>Document Vault Status</th>
                          <th>Risk Factor Breakdown</th>
                          <th style={{ textAlign: 'right' }}>Counseling Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskStudents.map(({ student, stats, hasShortage, hasMissingDocs }) => (
                          <tr key={student.id}>
                            <td>
                              <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{student.name}</div>
                              <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{student.enrollmentNo}</code>
                            </td>
                            <td>
                              <Badge variant={!hasShortage ? 'active' : 'danger'}>
                                {stats.percentage}% (Required: 75%)
                              </Badge>
                            </td>
                            <td>
                              <Badge variant={!hasMissingDocs ? 'active' : 'orange'}>
                                {!hasMissingDocs ? 'All Docs Verified' : 'Missing Verification'}
                              </Badge>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem' }}>
                                {hasShortage && <span style={{ color: '#EF4444', fontWeight: 600 }}>• Attendance shortage ({75 - stats.percentage}% below threshold)</span>}
                                {hasMissingDocs && <span style={{ color: '#F59E0B', fontWeight: 600 }}>• Pending academic document verification</span>}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setShowModal(true);
                                  setTopic(`Academic Performance Counseling - ${student.name}`);
                                }}
                              >
                                Schedule Counseling
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
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: Mentee Attendance & Shortage View
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'ATTENDANCE' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Subject-Wise Attendance Breakdown for Mentees
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Official centralized attendance metrics, total lectures attended, and exam condonation eligibility
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setActiveTab('ATTENDANCE_APPROVALS')}>
                    View Condonation Queue →
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Mentee</th>
                      <th>Total Sessions</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Attendance %</th>
                      <th>Required %</th>
                      <th>Eligibility Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menteeAttendanceData.map(({ student, stats, hasShortage }) => (
                      <tr key={student.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{student.name}</div>
                          <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{student.enrollmentNo}</code>
                        </td>
                        <td><strong>{stats.totalClasses} Classes</strong></td>
                        <td><span style={{ color: '#10B981', fontWeight: 700 }}>{stats.presentClasses}</span></td>
                        <td><span style={{ color: '#EF4444', fontWeight: 700 }}>{stats.absentClasses}</span></td>
                        <td>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: !hasShortage ? '#10B981' : '#EF4444' }}>
                            {stats.percentage}%
                          </span>
                        </td>
                        <td><strong>75%</strong></td>
                        <td>
                          <Badge variant={!hasShortage ? 'active' : 'danger'}>
                            {!hasShortage ? 'EXAM ELIGIBLE' : `SHORTAGE (${75 - stats.percentage}%)`}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => setSelectedStudentForProfile(student)}
                          >
                            <Eye size={13} /> Breakdown
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: Attendance Approval Workflow (4-Tier)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'ATTENDANCE_APPROVALS' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Mentee Attendance Condonation Approvals Queue
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    4-Tier Workflow: <code>Student → Subject Faculty → Mentor → HOD → HOI</code>. Endorsing forwards to HOD.
                  </p>
                </div>
              </div>

              {(() => {
                const menteeApps = db.getAttendanceApplications().filter(
                  a => (a.mentorFacultyId === user?.id || role === 'SUPER_ADMIN') &&
                       (a.status === 'FACULTY_APPROVED' || a.status === 'WITH_MENTOR' || a.status === 'MENTOR_APPROVED' || a.status.includes('MENTOR'))
                );

                if (menteeApps.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <ShieldCheck size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                      <p style={{ fontWeight: 600 }}>No attendance condonation applications pending your Mentor review.</p>
                    </div>
                  );
                }

                return (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Application No</th>
                          <th>Student Mentee</th>
                          <th>Subject</th>
                          <th>Attendance %</th>
                          <th>Reason &amp; Remarks</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menteeApps.map(app => {
                          const canDecide = app.status === 'FACULTY_APPROVED' || app.status === 'WITH_MENTOR';

                          return (
                            <tr key={app.id}>
                              <td><code>{app.applicationNo}</code></td>
                              <td>
                                <div style={{ fontWeight: 700 }}>{app.studentName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.enrollmentNo}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{app.subjectName}</div>
                                <code style={{ fontSize: '0.75rem' }}>{app.subjectCode}</code>
                              </td>
                              <td>
                                <span style={{ color: '#EF4444', fontWeight: 800 }}>{app.currentAttendancePct}%</span> / {app.requiredAttendancePct}%
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Shortage: {app.shortagePct}%</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{app.reason.replace(/_/g, ' ')}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Faculty: <em>"{app.facultyRemarks || 'Approved by Faculty'}"</em></div>
                              </td>
                              <td>
                                {app.status === 'FINAL_APPROVED' ? (
                                  <Badge variant="active">FINAL APPROVED</Badge>
                                ) : app.status.includes('REJECTED') ? (
                                  <Badge variant="danger">{app.status}</Badge>
                                ) : (
                                  <Badge variant="warning">{app.status}</Badge>
                                )}
                              </td>
                              <td>
                                {canDecide ? (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                      setReviewApp(app);
                                      setReviewRemarks('');
                                      setReviewDecision('APPROVE');
                                    }}
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                  >
                                    Review &amp; Decide
                                  </button>
                                ) : (
                                  <Badge variant="active">Endorsed to HOD</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 5: Exam Eligibility Official View
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'EXAM_ELIGIBILITY' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Centralized Exam Eligibility Register
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Official semester examination admittance status governed by academic attendance rules and approved condonations.
                </p>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Mentee</th>
                      <th>Attendance %</th>
                      <th>Faculty Endorsement</th>
                      <th>Mentor Endorsement</th>
                      <th>HOD / HOI Approval</th>
                      <th>Final Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menteeAttendanceData.map(({ student, stats, hasShortage }) => (
                      <tr key={student.id}>
                        <td>
                          <strong>{student.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.enrollmentNo}</div>
                        </td>
                        <td>
                          <Badge variant={!hasShortage ? 'active' : 'danger'}>
                            {stats.percentage}%
                          </Badge>
                        </td>
                        <td>
                          <Badge variant="active">VALIDATED</Badge>
                        </td>
                        <td>
                          <Badge variant={!hasShortage ? 'active' : 'gold'}>
                            {!hasShortage ? 'CLEARED' : 'PENDING CONDONATION'}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={!hasShortage ? 'active' : 'navy'}>
                            {!hasShortage ? 'APPROVED' : 'WITH HOD'}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={!hasShortage ? 'active' : 'danger'}>
                            {!hasShortage ? 'ELIGIBLE FOR EXAM' : 'PROVISIONAL / SHORTAGE'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 6: Document Verification Vault & Pending Queue
              ───────────────────────────────────────────────────────────── */}
          {(activeTab === 'PENDING_VERIFICATION' || activeTab === 'VERIFIED_DOCUMENTS' || activeTab === 'DOCUMENT_HISTORY') && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                    Mentee Document Verification &amp; Locking Queue ({pendingMenteesDocs.length} Pending)
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Review submitted student documents, inspect official attachments, permanently lock verified records, or reject with reason.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button 
                    className={`btn btn-sm ${activeTab === 'PENDING_VERIFICATION' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('PENDING_VERIFICATION')}
                  >
                    Pending ({pendingMenteesDocs.length})
                  </button>
                  <button 
                    className={`btn btn-sm ${activeTab === 'VERIFIED_DOCUMENTS' ? 'btn-navy' : 'btn-outline'}`}
                    onClick={() => setActiveTab('VERIFIED_DOCUMENTS')}
                  >
                    Verified &amp; Locked ({verifiedMenteesDocs.length})
                  </button>
                </div>
              </div>

              {((activeTab === 'PENDING_VERIFICATION' ? pendingMenteesDocs : verifiedMenteesDocs).length === 0) ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={48} style={{ opacity: 0.3, margin: '0 auto 1rem', color: '#10B981' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Queue is Clear</h4>
                  <p style={{ fontSize: '0.875rem' }}>No student documents currently match this status.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student Mentee</th>
                        <th>Document Name &amp; Code</th>
                        <th>Category</th>
                        <th>Uploaded Date</th>
                        <th>File Attachment</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Mentor Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === 'PENDING_VERIFICATION' ? pendingMenteesDocs : verifiedMenteesDocs).map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{doc.studentName}</div>
                            <code style={{ fontSize: '0.75rem', color: 'var(--brand-orange)' }}>{doc.enrollmentNo}</code>
                          </td>
                          <td>
                            <strong>{doc.documentName}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {doc.documentCode} • v{doc.currentVersion}</div>
                          </td>
                          <td>
                            <Badge variant="navy">{doc.category}</Badge>
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FileText size={14} /> {doc.fileName}
                            </span>
                          </td>
                          <td>
                            <Badge variant={doc.status === 'VERIFIED' ? 'active' : 'orange'}>
                              {doc.status}
                            </Badge>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {doc.status !== 'VERIFIED' ? (
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleVerifyDocument(doc)}
                                  style={{ backgroundColor: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  title="Approve & Permanently Lock"
                                >
                                  <Lock size={12} /> Verify &amp; Lock
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => {
                                    setRejectingDoc(doc);
                                    setRejectionReason('');
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  title="Reject with Reason"
                                >
                                  <XCircle size={12} /> Reject
                                </button>
                              </div>
                            ) : (
                              <Badge variant="active">
                                <Lock size={11} style={{ marginRight: '3px' }} /> Locked &amp; Verified
                              </Badge>
                            )}
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
              TAB 7: Student Documents Vault (Full View)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'STUDENT_DOCUMENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selectedStudentForDocs ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                        Document Vault: {selectedStudentForDocs.name} ({selectedStudentForDocs.enrollmentNo})
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Verify uploaded student credentials, government certificates, and DigiLocker ABC ID
                      </p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedStudentForDocs(null)}>
                      ← Back to Student List
                    </button>
                  </div>

                  <StudentDocumentsSection student={selectedStudentForDocs} onRefresh={() => setRefreshKey(k => k + 1)} />
                </div>
              ) : (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                    Select Student to Access Document Verification Vault
                  </h3>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Enrollment No</th>
                          <th>Program &amp; Sem</th>
                          <th>ABC ID Status</th>
                          <th>Uploaded Docs</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myMentees.map(student => {
                          const studentDocs = db.getStudentAcademicDocumentsByStudentId(student.id);
                          const prog = db.getProgramById(student.programId);

                          return (
                            <tr key={student.id}>
                              <td><strong>{student.name}</strong></td>
                              <td><code>{student.enrollmentNo}</code></td>
                              <td>{prog?.code || 'B.Tech'} - Sem 4</td>
                              <td>
                                <Badge variant={student.abcIdStatus === 'VERIFIED' ? 'active' : (student.abcIdStatus === 'PENDING_VERIFICATION' ? 'orange' : 'inactive')}>
                                  {student.abcIdStatus || 'NOT_SUBMITTED'}
                                </Badge>
                              </td>
                              <td>
                                <strong>{studentDocs.length} Documents</strong>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => setSelectedStudentForDocs(student)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <FolderCheck size={14} /> Open Document Vault
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
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 8: Student Requests
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'REQUESTS' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                Incoming Mentee Requests &amp; Queries
              </h3>
              {myMentorRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <MessageSquare size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 600 }}>No requests pending mentor review.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Request ID &amp; Type</th>
                        <th>Student</th>
                        <th>Subject / Query Details</th>
                        <th>Date Submitted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myMentorRequests.map((r: any) => (
                        <tr key={r.id}>
                          <td>
                            <code style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{r.requestNo || r.id}</code>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.category || 'General'}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{r.studentName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.enrollmentNo}</div>
                          </td>
                          <td style={{ fontSize: '0.8125rem' }}>{r.subject || r.description || 'Student inquiry'}</td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                          </td>
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
              TAB 9: Mentoring & Counseling Sessions
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'SESSIONS' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Counseling &amp; Mentoring Logs
                </h3>
                <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={14} /> Schedule Counseling Session
                </button>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Mentee</th>
                      <th>Topic / Counseling Agenda</th>
                      <th>Date &amp; Time Slot</th>
                      <th>Status</th>
                      <th>Outcomes &amp; Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{s.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.enrollmentNo}</div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{s.topic}</td>
                        <td>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{s.date}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.timeSlot}</div>
                        </td>
                        <td>
                          <Badge variant={s.status === 'COMPLETED' ? 'active' : 'warning'}>{s.status}</Badge>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {s.notes || 'Counseling in progress'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 10: Institutional Mentor Allocation (Admin / HOD)
              ───────────────────────────────────────────────────────────── */}
          {activeTab === 'ALLOCATION' && (
            <MentorAssignmentTab />
          )}
        </div>
      )}

      {/* Rejection Modal for Documents */}
      {rejectingDoc && (
        <Modal isOpen={!!rejectingDoc} onClose={() => setRejectingDoc(null)} title="Reject Student Document with Reason">
          <form onSubmit={handleRejectDocumentConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '0.84375rem', color: '#EF4444' }}>
              <strong>Document:</strong> {rejectingDoc.documentName} ({rejectingDoc.studentName})
            </div>
            <div className="form-group">
              <label className="form-label">Mandatory Rejection Reason *</label>
              <textarea 
                className="form-control" 
                rows={3} 
                placeholder="Specify why this document is rejected (e.g. Blurred photocopy / Missing official stamp / Wrong semester marksheet)..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRejectingDoc(null)}>Cancel</button>
              <button type="submit" className="btn btn-danger">Confirm Rejection</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Attendance Review Modal */}
      {reviewApp && (
        <Modal isOpen={!!reviewApp} onClose={() => setReviewApp(null)} title={`Review Attendance Application: ${reviewApp.applicationNo}`}>
          <form onSubmit={handleAttendanceDecision} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div><strong>Student:</strong> {reviewApp.studentName} ({reviewApp.enrollmentNo})</div>
              <div><strong>Subject:</strong> {reviewApp.subjectName} ({reviewApp.subjectCode})</div>
              <div><strong>Current Attendance:</strong> {reviewApp.currentAttendancePct}% (Required: {reviewApp.requiredAttendancePct}%)</div>
              <div><strong>Reason:</strong> {reviewApp.reason.replace(/_/g, ' ')}</div>
              <div><strong>Description:</strong> {reviewApp.description}</div>
              {reviewApp.facultyRemarks && <div style={{ marginTop: '0.35rem', color: 'var(--brand-orange)' }}><strong>Subject Faculty Remarks:</strong> {reviewApp.facultyRemarks}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Mentor Decision *</label>
              <select className="form-select" value={reviewDecision} onChange={e => setReviewDecision(e.target.value as any)}>
                <option value="APPROVE">Endorse &amp; Forward to HOD</option>
                <option value="REJECT">Reject Application</option>
                <option value="REQUEST_MORE_INFO">Request Clarification from Faculty</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mentor Remarks / Assessment *</label>
              <textarea 
                className="form-control" 
                rows={3} 
                placeholder="Enter counseling observations and recommendation..."
                value={reviewRemarks}
                onChange={e => setReviewRemarks(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewApp(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Decision</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Book Session Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book Mentoring / Counseling Session">
          <form onSubmit={handleBookSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Discussion Topic / Agenda *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Academic Performance / Career Guidance / Project Review" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Date *</label>
              <input 
                type="date" 
                className="form-control" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot *</label>
              <select className="form-select" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
                <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
                <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Book Session</button>
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
