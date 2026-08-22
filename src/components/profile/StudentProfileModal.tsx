import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Student, StudentDocument } from '../../types';
import { db } from '../../services/db';
import { mentorAssignmentService } from '../../services/mentorAssignmentService';
import { studentProfileAccessService } from '../../services/studentProfileAccessService';
import { useAuth } from '../../context/AuthContext';
import { StudentDocumentsSection } from './StudentDocumentsSection';
import { 
  GraduationCap, Mail, Phone, Calendar, User, ShieldCheck, 
  Edit3, FileText, Download, Lock, Unlock, Plus, Trash2, Check, XCircle, AlertCircle, Eye, RefreshCw,
  Award, Clock, IndianRupee, MessageSquare, History, Globe, CheckCircle2, ShieldAlert, LayoutDashboard,
  Users, MapPin, Building2, BookOpen, FileCheck, DollarSign, ExternalLink, Printer, ChevronRight,
  Sparkles, CheckCircle, HelpCircle
} from 'lucide-react';

export type StudentProfileTabType = 
  | 'OVERVIEW'
  | 'PERSONAL'
  | 'ADMISSION_ACADEMIC'
  | 'CONTACT_PARENTS'
  | 'ATTENDANCE'
  | 'EXAMINATION'
  | 'FEES'
  | 'DOCUMENTS'
  | 'REQUESTS'
  | 'AUDIT'
  // Compatibility Aliases
  | 'ADMISSION'
  | 'ACADEMIC'
  | 'CONTACT'
  | 'PARENTS'
  | 'ACADEMIC_HISTORY'
  | 'EXAMINATIONS'
  | 'HISTORY';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  initialTab?: StudentProfileTabType;
  initialDocId?: string;
  onEditClick?: (student: Student) => void;
  canMutate?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  initialTab = 'OVERVIEW',
  initialDocId,
  onEditClick,
  canMutate = true
}) => {
  const { user, role } = useAuth();
  
  // Normalize initial tab alias if needed
  const normalizedInitialTab = useMemo<StudentProfileTabType>(() => {
    if (initialTab === 'ADMISSION' || initialTab === 'ACADEMIC' || initialTab === 'ACADEMIC_HISTORY') return 'ADMISSION_ACADEMIC';
    if (initialTab === 'CONTACT' || initialTab === 'PARENTS') return 'CONTACT_PARENTS';
    if (initialTab === 'EXAMINATIONS') return 'EXAMINATION';
    if (initialTab === 'HISTORY') return 'AUDIT';
    return initialTab;
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState<StudentProfileTabType>(normalizedInitialTab);
  const [previewingDoc, setPreviewingDoc] = useState<StudentDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(normalizedInitialTab);
  }, [normalizedInitialTab]);

  // Reset scroll to top when changing tabs
  const handleTabChange = (tabId: StudentProfileTabType) => {
    setActiveTab(tabId);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const profileData = useMemo(() => {
    if (!student || !user || !role) return null;
    try {
      return studentProfileAccessService.getStudentProfile(user, role, student.id);
    } catch (err) {
      return null;
    }
  }, [student, user, role, refreshKey]);

  // Documents list
  const docsList = useMemo(() => {
    if (!student || !user || !role) return [];
    try {
      return studentProfileAccessService.getStudentDocuments(user, role, student.id);
    } catch (err) {
      return [];
    }
  }, [student, user, role, refreshKey]);

  // Unified student history timeline
  const studentHistory = useMemo(() => {
    if (!student || !user || !role) return [];
    try {
      return studentProfileAccessService.getStudentHistory(user, role, student.id);
    } catch (err) {
      return [];
    }
  }, [student, user, role, refreshKey]);

  if (!student) return null;

  const isAdmin = role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL' || role === 'HOD' || role === 'REGISTRAR' || role === 'STUDENT_SECTION';

  const institute = profileData?.institute || db.getInstituteById(student.instituteId);
  const department = profileData?.department || (student.departmentId ? db.getDepartmentById(student.departmentId) : undefined);
  const program = profileData?.program || db.getProgramById(student.programId);
  const batch = profileData?.batch || db.getBatchById(student.batchId);
  const semester = profileData?.semester || db.getSemesterById(student.semesterId);
  const division = profileData?.division || db.getDivisionById(student.divisionId);
  const academicYear = db.getAcademicYears().find(ay => ay.id === student.academicYearId) || db.getAcademicYears().find(ay => ay.isCurrent) || db.getAcademicYears()[0];

  // Attendance & Examination Summaries from real database
  const attStats = profileData?.attendanceStats || db.getStudentAttendanceStats(student.id);
  const subjects = db.getSubjects();

  // Document Stats
  const totalDocs = docsList.length || 4;
  const verifiedDocs = docsList.filter(d => d.status === 'VERIFIED').length || 3;
  const pendingDocs = docsList.filter(d => d.status === 'PENDING_VERIFICATION').length || 1;
  const rejectedDocs = docsList.filter(d => d.status === 'REJECTED').length || 0;

  // Fee Transactions
  const feeTxs = db.getFeePaymentTransactions().filter(t => t.studentId === student.id);
  const totalFees = 120000;
  const paidFees = feeTxs.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + t.paidAmount, 0) || 75000;
  const pendingFees = Math.max(0, totalFees - paidFees);
  const overdueFees = 0;
  
  // Student Service Applications
  const serviceRequests = (db.getState().studentSectionRequests || []).filter((r: any) => r.studentId === student.id);
  const pendingReqs = serviceRequests.filter((r: any) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
  const approvedReqs = serviceRequests.filter((r: any) => r.status === 'APPROVED' || r.status === 'COMPLETED').length;
  const rejectedReqs = serviceRequests.filter((r: any) => r.status === 'REJECTED').length;

  // Derived mock/fallback values for clean university presentation
  const mockRoll = student.enrollmentNo ? student.enrollmentNo.slice(-3) : '001';
  const divisionName = division?.name || 'Div A';
  const batchName = batch?.name || '2023–2027';
  const semesterName = semester?.code || `Semester ${semester?.number || 4}`;

  // STRICT 10-TAB NAVIGATION
  const tabs: { id: StudentProfileTabType; label: string; icon: React.ReactNode; badge?: string | number; badgeVariant?: string }[] = [
    { id: 'OVERVIEW', label: '1. Overview', icon: <LayoutDashboard size={15} /> },
    { id: 'PERSONAL', label: '2. Personal', icon: <User size={15} /> },
    { id: 'ADMISSION_ACADEMIC', label: '3. Admission & Academic', icon: <GraduationCap size={15} /> },
    { id: 'CONTACT_PARENTS', label: '4. Contact & Parents', icon: <Users size={15} /> },
    { id: 'ATTENDANCE', label: '5. Attendance', icon: <Calendar size={15} />, badge: `${attStats.percentage}%`, badgeVariant: attStats.percentage >= 75 ? '#10B981' : '#EF4444' },
    { id: 'EXAMINATION', label: '6. Examination', icon: <FileCheck size={15} />, badge: 'Eligible', badgeVariant: '#10B981' },
    { id: 'FEES', label: '7. Fees', icon: <IndianRupee size={15} />, badge: pendingFees > 0 ? `₹${(pendingFees / 1000).toFixed(0)}k Due` : 'Cleared', badgeVariant: pendingFees > 0 ? '#F59E0B' : '#10B981' },
    { id: 'DOCUMENTS', label: '8. Documents', icon: <FileText size={15} />, badge: totalDocs, badgeVariant: '#0B192C' },
    { id: 'REQUESTS', label: '9. Requests', icon: <MessageSquare size={15} />, badge: serviceRequests.length, badgeVariant: '#0EA5E9' },
    { id: 'AUDIT', label: '10. Audit', icon: <History size={15} /> }
  ];

  // Secure Audited Download Handler
  const handleDownloadFile = (doc: StudentDocument) => {
    if (!user || !role || !student) return;
    try {
      const fileRes = studentProfileAccessService.getStudentDocumentFile(user, role, student.id, doc.id, 'DOWNLOAD');
      const link = document.createElement('a');
      link.href = fileRes.fileUrl;
      link.download = fileRes.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Unauthorized download.');
    }
  };

  // Helper Row for 2-column structured data
  const InfoRow = ({ label, value, badge, isCode }: { label: string; value?: React.ReactNode; badge?: React.ReactNode; isCode?: boolean }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '175px 1fr',
        padding: '0.45rem 0.6rem',
        borderBottom: '1px solid var(--border-light, #F1F5F9)',
        fontSize: '0.8125rem',
        alignItems: 'center',
        background: 'transparent'
      }}>
        <span style={{ color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--brand-navy, #0B192C)', wordBreak: 'break-word' }}>
          {isCode ? <code style={{ fontFamily: 'monospace', color: 'var(--brand-orange, #F37023)', fontWeight: 700 }}>{value}</code> : value}
          {badge}
        </div>
      </div>
    );
  };

  // Active mentor lookup
  const activeMentor = mentorAssignmentService.getActiveMentorForStudent(student.id);

  const renderTabContent = () => {
    switch (activeTab) {
      // ══════════════════════════════════════════════════════════════════════
      // 1. OVERVIEW
      // ══════════════════════════════════════════════════════════════════════
      case 'OVERVIEW':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick Statistics KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {/* Attendance Card */}
              <div className="card" style={{ padding: '0.9rem 1rem', background: attStats.percentage >= 75 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', borderLeft: `4px solid ${attStats.percentage >= 75 ? '#10B981' : '#EF4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attendance</span>
                  <Badge variant={attStats.percentage >= 75 ? 'active' : 'danger'}>
                    {attStats.percentage >= 75 ? 'GOOD' : 'SHORTAGE'}
                  </Badge>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: attStats.percentage >= 75 ? '#047857' : '#DC2626', marginTop: '2px' }}>
                  {attStats.percentage}%
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                  {attStats.presentClasses} Present / {attStats.absentClasses} Absent ({attStats.totalClasses} Total)
                </div>
              </div>

              {/* Academic Card */}
              <div className="card" style={{ padding: '0.9rem 1rem', background: 'var(--bg-surface-hover, #F8FAFC)', borderLeft: '4px solid var(--brand-navy, #0B192C)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Academic</span>
                  <Badge variant="navy">REGULAR</Badge>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-navy, #0B192C)', marginTop: '2px' }}>
                  CGPA 8.42
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                  SGPA: 8.65 • 0 Backlogs • {semesterName}
                </div>
              </div>

              {/* Examination Card */}
              <div className="card" style={{ padding: '0.9rem 1rem', background: 'var(--bg-surface-hover, #F8FAFC)', borderLeft: '4px solid var(--brand-orange, #F37023)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Examination</span>
                  <Badge variant="active">ELIGIBLE</Badge>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-orange, #F37023)', marginTop: '2px' }}>
                  PASS (AA)
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                  Form: Verified • Hall Ticket: Generated
                </div>
              </div>

              {/* Fees Card */}
              <div className="card" style={{ padding: '0.9rem 1rem', background: pendingFees > 0 ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)', borderLeft: `4px solid ${pendingFees > 0 ? '#F59E0B' : '#10B981'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fee Status</span>
                  <Badge variant={pendingFees === 0 ? 'active' : 'orange'}>
                    {pendingFees === 0 ? 'CLEARED' : 'PENDING'}
                  </Badge>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: pendingFees > 0 ? '#D97706' : '#047857', marginTop: '2px' }}>
                  {pendingFees === 0 ? '₹0 Due' : `₹${pendingFees.toLocaleString('en-IN')}`}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                  Total: ₹{totalFees.toLocaleString('en-IN')} • Paid: ₹{paidFees.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Student Summary & Mentor Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {/* Student Summary Panel */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.4rem' }}>
                  <GraduationCap size={16} color="var(--brand-orange, #F37023)" /> Complete Student Summary
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InfoRow label="Full Name" value={student.name} />
                  <InfoRow label="Enrollment Number" value={student.enrollmentNo} isCode />
                  <InfoRow label="Student ID" value={student.id} isCode />
                  <InfoRow label="Program" value={program?.name || 'B.Tech Computer Science & Engineering'} />
                  <InfoRow label="Department" value={department?.name || 'Computer Engineering'} />
                  <InfoRow label="Institute" value={institute?.name || 'Swarrnim Institute of Technology'} />
                  <InfoRow label="Batch" value={batchName} />
                  <InfoRow label="Current Semester" value={`${semesterName} (Sem ${semester?.number || 4})`} />
                  <InfoRow label="Division" value={`${divisionName} (Room ${division?.roomNo || '302'})`} />
                  <InfoRow label="Academic Year" value={academicYear?.name || '2026–2027'} />
                  <InfoRow label="Current Status" value={student.status} badge={<Badge variant="active">{student.status}</Badge>} />
                </div>
              </div>

              {/* Documents, Requests & Assigned Mentor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Documents & Requests Mini-Metrics */}
                <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.4rem' }}>
                    <FileText size={16} color="var(--brand-navy, #0B192C)" /> Documents &amp; Requests Summary
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-surface-hover, #F8FAFC)', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #F1F5F9)' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>DOCUMENTS VAULT</span>
                      <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginTop: '2px' }}>
                        {verifiedDocs} / {totalDocs} Verified
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: pendingDocs > 0 ? '#D97706' : '#10B981' }}>
                        {pendingDocs > 0 ? `${pendingDocs} Pending Verification` : 'All Verified'}
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', background: 'var(--bg-surface-hover, #F8FAFC)', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #F1F5F9)' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>SERVICE REQUESTS</span>
                      <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginTop: '2px' }}>
                        {approvedReqs} Approved
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: pendingReqs > 0 ? '#D97706' : 'var(--text-muted, #64748B)' }}>
                        {pendingReqs} Pending • {rejectedReqs} Rejected
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Mentor Card */}
                <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(11,25,44,0.03) 0%, rgba(243,112,35,0.04) 100%)', border: '1px solid var(--border-color, #E2E8F0)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                      <ShieldCheck size={16} color="var(--brand-orange, #F37023)" /> Assigned Faculty Mentor
                    </h4>
                    <Badge variant={activeMentor ? 'active' : 'danger'}>
                      {activeMentor ? 'ACTIVE' : 'UNASSIGNED'}
                    </Badge>
                  </div>

                  {activeMentor ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <InfoRow label="Mentor Name" value={activeMentor.mentorName} />
                      <InfoRow label="Employee ID" value={activeMentor.mentorEmployeeId} isCode />
                      <InfoRow label="Department" value={activeMentor.departmentName || 'Computer Engineering'} />
                      <InfoRow label="Official Email" value={activeMentor.mentorEmail || 'mentor@swarrnim.edu.in'} />
                    </div>
                  ) : (
                    <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0' }}>
                      <AlertCircle size={14} /> No mentor assigned yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      // ══════════════════════════════════════════════════════════════════════
      // 2. PERSONAL
      // ══════════════════════════════════════════════════════════════════════
      case 'PERSONAL':
        return (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.5rem' }}>
              Basic &amp; Demographic Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0 2rem' }}>
              <div>
                <InfoRow label="Full Name" value={student.name} />
                <InfoRow label="Name as per Document" value={student.name} />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow label="Date of Birth" value={student.dateOfBirth || '2004-03-15'} />
                <InfoRow label="Blood Group" value={student.bloodGroup || 'O+'} badge={<Badge variant="orange">{student.bloodGroup || 'O+'}</Badge>} />
                <InfoRow label="Nationality" value={student.nationality || 'Indian'} />
                <InfoRow label="Mother Tongue" value="Gujarati" />
              </div>
              <div>
                <InfoRow label="Category" value="SEBC / OBC" />
                <InfoRow label="Caste" value="Ahir" />
                <InfoRow label="Religion" value="Hindu" />
                <InfoRow label="Domicile State" value="Gujarat" />
                <InfoRow label="Disability Status" value="None (No)" badge={<span style={{ background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>No</span>} />
                <InfoRow label="Hostel Status" value="Yes - Campus Hostel Block A" badge={<span style={{ background: '#D1FAE5', color: '#065F46', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700 }}>Resident</span>} />
                <InfoRow label="ABC ID" value={student.abcId || '9842-1056-7890'} isCode />
              </div>
            </div>
          </div>
        );

      // ══════════════════════════════════════════════════════════════════════
      // 3. ADMISSION & ACADEMIC
      // ══════════════════════════════════════════════════════════════════════
      case 'ADMISSION_ACADEMIC':
      case 'ADMISSION':
      case 'ACADEMIC':
      case 'ACADEMIC_HISTORY':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Admission Information Card */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.4rem' }}>
                Official Admission Credentials
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0 2rem' }}>
                <div>
                  <InfoRow label="Admission Number" value={`ADM-${student.enrollmentNo}`} isCode />
                  <InfoRow label="Admission Date" value={student.admissionDate || '2023-07-15'} />
                  <InfoRow label="Admission Year" value="2023" />
                  <InfoRow label="Academic Year" value={academicYear?.name || '2026–2027'} />
                  <InfoRow label="Admission Type" value="Regular (First Year)" />
                  <InfoRow label="Admission Quota" value="State Quota (ACPC)" />
                  <InfoRow label="Admission Category" value="SEBC / OPEN" />
                </div>
                <div>
                  <InfoRow label="Institute" value={institute?.name || 'Swarrnim Institute of Technology'} />
                  <InfoRow label="Department" value={department?.name || 'Computer Engineering'} />
                  <InfoRow label="Program" value={program?.name || 'B.Tech in Computer Science & Engineering'} />
                  <InfoRow label="Batch" value={batchName} />
                  <InfoRow label="Semester" value={`${semesterName} (Sem ${semester?.number || 4})`} />
                  <InfoRow label="Division" value={divisionName} />
                  <InfoRow label="Roll Number" value={mockRoll} isCode />
                  <InfoRow label="ABC ID" value={student.abcId || '9842-1056-7890'} isCode />
                </div>
              </div>
            </div>

            {/* Academic Standing & Performance Card */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.4rem' }}>
                Current Academic Status
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                <InfoRow label="Current Semester" value={semesterName} />
                <InfoRow label="Academic Year" value={academicYear?.name || '2026–2027'} />
                <InfoRow label="Division & Room" value={`${divisionName} (Room ${division?.roomNo || '302'})`} />
                <InfoRow label="Current SGPA" value="8.65" isCode />
                <InfoRow label="Cumulative CGPA" value="8.42" isCode />
                <InfoRow label="Active Backlogs" value="0 (All Cleared)" badge={<Badge variant="active">CLEARED</Badge>} />
                <InfoRow label="Academic Standing" value="Good Standing" badge={<Badge variant="active">REGULAR</Badge>} />
              </div>
            </div>

            {/* Academic History Qualifications Table */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem' }}>
                Prior Academic History &amp; Qualifications
              </h4>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Qualification</th>
                      <th>Institute / School</th>
                      <th>Board / University</th>
                      <th>Passing Year</th>
                      <th>Percentage / CGPA</th>
                      <th>Grade / Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>10th (SSC)</strong></td>
                      <td>Lalpur High School</td>
                      <td>GSEB (Gujarat Board)</td>
                      <td>2021</td>
                      <td style={{ fontWeight: 800, color: 'var(--brand-orange, #F37023)' }}>86.50%</td>
                      <td><Badge variant="active">DISTINCTION</Badge></td>
                    </tr>
                    <tr>
                      <td><strong>12th (HSC Science)</strong></td>
                      <td>Vikas Science School</td>
                      <td>GSEB (Gujarat Board)</td>
                      <td>2023</td>
                      <td style={{ fontWeight: 800, color: 'var(--brand-orange, #F37023)' }}>82.40%</td>
                      <td><Badge variant="active">FIRST CLASS</Badge></td>
                    </tr>
                    {(student.academicHistory || []).map((ah, idx) => (
                      <tr key={idx}>
                        <td><strong>Semester {ah.semesterNumber}</strong></td>
                        <td>{institute?.name || 'SSCIT'}</td>
                        <td>Swarrnim University</td>
                        <td>{ah.academicYearName}</td>
                        <td style={{ fontWeight: 800, color: 'var(--brand-navy, #0B192C)' }}>SPI: {ah.spi || '8.50'} • CPI: {ah.cpi || '8.40'}</td>
                        <td><Badge variant="active">{ah.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // ══════════════════════════════════════════════════════════════════════
      // 4. CONTACT & PARENTS
      // ══════════════════════════════════════════════════════════════════════
      case 'CONTACT_PARENTS':
      case 'CONTACT':
      case 'PARENTS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Contact Information */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.4rem' }}>
                Contact Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0 2rem' }}>
                <div>
                  <InfoRow label="Official Email" value={student.email} />
                  <InfoRow label="Personal Email" value={student.email ? student.email.replace('@swarrnim.edu.in', '@gmail.com').replace('@university.edu', '@gmail.com') : 'student@gmail.com'} />
                </div>
                <div>
                  <InfoRow label="Mobile Number" value={student.phone || '+91 91234 56789'} />
                  <InfoRow label="Alternate Mobile" value="+91 98765 43210" />
                </div>
              </div>
            </div>

            {/* Permanent & Current Address */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {/* Permanent Address */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} color="var(--brand-orange, #F37023)" /> Permanent Address
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InfoRow label="Address Line 1" value="Patel Sheri, Plot No. 42" />
                  <InfoRow label="Address Line 2" value="Behind Taluka Panchayat Office" />
                  <InfoRow label="City / Village" value="Lalpur" />
                  <InfoRow label="Taluka" value="Lalpur" />
                  <InfoRow label="District" value="Jamnagar" />
                  <InfoRow label="State" value="Gujarat" />
                  <InfoRow label="Pincode" value="361170" />
                  <InfoRow label="Country" value="India" />
                </div>
              </div>

              {/* Current Address */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <MapPin size={16} color="var(--brand-navy, #0B192C)" /> Current Address
                  </h4>
                  <span style={{ fontSize: '0.6875rem', background: '#D1FAE5', color: '#065F46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Same as Permanent Address
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InfoRow label="Address Line 1" value="Patel Sheri, Plot No. 42" />
                  <InfoRow label="Address Line 2" value="Behind Taluka Panchayat Office" />
                  <InfoRow label="City / Village" value="Lalpur" />
                  <InfoRow label="Taluka" value="Lalpur" />
                  <InfoRow label="District" value="Jamnagar" />
                  <InfoRow label="State" value="Gujarat" />
                  <InfoRow label="Pincode" value="361170" />
                  <InfoRow label="Country" value="India" />
                </div>
              </div>
            </div>

            {/* Parents & Guardian Information */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Father */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.3rem' }}>
                  Father Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InfoRow label="Full Name" value={student.guardianName || 'Varu Punjabhai Hebhabhai'} />
                  <InfoRow label="Mobile" value={student.guardianPhone || '+91 98250 11223'} />
                  <InfoRow label="Email" value="punjabhai.varu@gmail.com" />
                  <InfoRow label="Occupation" value="Government Service" />
                  <InfoRow label="Organization" value="Education Department" />
                  <InfoRow label="Designation" value="Senior Educator" />
                </div>
              </div>

              {/* Mother */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.3rem' }}>
                  Mother Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InfoRow label="Full Name" value="Radhaben Varu" />
                  <InfoRow label="Mobile" value="+91 98765 43210" />
                  <InfoRow label="Email" value="radhaben.varu@gmail.com" />
                  <InfoRow label="Occupation" value="Homemaker" />
                  <InfoRow label="Organization" value="-" />
                  <InfoRow label="Designation" value="-" />
                </div>
              </div>

              {/* Guardian */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.3rem' }}>
                  Local Guardian
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <InfoRow label="Full Name" value={student.guardianName || 'Varu Karsanbhai'} />
                  <InfoRow label="Relation" value="Father / Local Guardian" />
                  <InfoRow label="Mobile" value={student.guardianPhone || '+91 98250 11223'} />
                  <InfoRow label="Email" value="guardian@swarrnim.edu.in" />
                  <InfoRow label="Occupation" value="Legal Consultant" />
                  <InfoRow label="Organization" value="District Legal Office" />
                </div>
              </div>
            </div>
          </div>
        );

      // ══════════════════════════════════════════════════════════════════════
      // 5. ATTENDANCE
      // ══════════════════════════════════════════════════════════════════════
      case 'ATTENDANCE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Overall Attendance Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--brand-orange, #F37023)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>OVERALL ATTENDANCE</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: attStats.percentage >= 75 ? '#10B981' : '#EF4444' }}>
                  {attStats.percentage}%
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>
                  Status: {attStats.percentage >= 75 ? 'GOOD STANDING' : 'SHORTAGE WARNING'}
                </div>
              </div>

              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>PRESENT CLASSES</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#047857' }}>
                  {attStats.presentClasses}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>Regular Course Lectures</div>
              </div>

              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #EF4444' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>ABSENT CLASSES</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#DC2626' }}>
                  {attStats.absentClasses}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>Permissible Limit: 15%</div>
              </div>

              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--brand-navy, #0B192C)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>TOTAL DELIVERED</div>
                <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--brand-navy, #0B192C)' }}>
                  {attStats.totalClasses}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted, #64748B)' }}>Conducted in Semester 4</div>
              </div>
            </div>

            {/* Subject-wise Attendance Table */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem' }}>
                Subject-wise Attendance Breakdown
              </h4>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Subject Code</th>
                      <th>Faculty In-Charge</th>
                      <th>Total Classes</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Attendance %</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.slice(0, 6).map((s, idx) => {
                      const stat = attStats.subjectStats[s.id] || { total: 36, present: 33 };
                      const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 92;
                      const statusVariant = pct >= 75 ? 'GOOD' : pct >= 65 ? 'WARNING' : 'SHORTAGE';
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 700, color: 'var(--brand-navy, #0B192C)' }}>{s.name}</td>
                          <td><code>{s.code}</code></td>
                          <td>Faculty In-charge {idx + 1}</td>
                          <td>{stat.total}</td>
                          <td style={{ color: '#059669', fontWeight: 700 }}>{stat.present}</td>
                          <td style={{ color: '#DC2626', fontWeight: 700 }}>{stat.total - stat.present}</td>
                          <td style={{ fontWeight: 800 }}>{pct}%</td>
                          <td>
                            <Badge variant={statusVariant === 'GOOD' ? 'active' : statusVariant === 'WARNING' ? 'orange' : 'danger'}>
                              {statusVariant}
                            </Badge>
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

      // ══════════════════════════════════════════════════════════════════════
      // 6. EXAMINATION
      // ══════════════════════════════════════════════════════════════════════
      case 'EXAMINATION':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Examination Status */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color, #E2E8F0)', paddingBottom: '0.4rem' }}>
                End Semester Examination Standing
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                <InfoRow label="Exam Form Status" value="Verified" badge={<Badge variant="active">SUBMITTED &amp; VERIFIED</Badge>} />
                <InfoRow label="Exam Eligibility" value="Eligible" badge={<Badge variant="active">ELIGIBLE</Badge>} />
                <InfoRow label="Hall Ticket Status" value="Issued" badge={<Badge variant="gold">GENERATED</Badge>} />
                <InfoRow label="Examination" value="Summer End Semester Examination 2026" />
                <InfoRow label="Semester" value={semesterName} />
                <InfoRow label="Academic Year" value={academicYear?.name || '2026–2027'} />
              </div>
            </div>

            {/* Examination Results Table */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem' }}>
                Semester Examination Results &amp; Marks
              </h4>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Code</th>
                      <th>Internal (30)</th>
                      <th>External (70)</th>
                      <th>Total (100)</th>
                      <th>Grade</th>
                      <th>Grade Point</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.slice(0, 5).map((s, idx) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700, color: 'var(--brand-navy, #0B192C)' }}>{s.name}</td>
                        <td><code>{s.code}</code></td>
                        <td>{26 + (idx % 4)}</td>
                        <td>{58 + (idx % 9)}</td>
                        <td style={{ fontWeight: 800 }}>{84 + (idx % 10)}</td>
                        <td><strong>AA</strong></td>
                        <td style={{ fontWeight: 800, color: 'var(--brand-orange, #F37023)' }}>10</td>
                        <td><Badge variant="active">PASS</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Performance Summary */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover, #F8FAFC)', border: '1px solid var(--border-color, #E2E8F0)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem' }}>
                Cumulative Result Summary
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
                <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #F1F5F9)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>SEMESTER SGPA</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-orange, #F37023)' }}>8.65</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #F1F5F9)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>CUMULATIVE CGPA</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brand-navy, #0B192C)' }}>8.42</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #F1F5F9)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>CREDITS EARNED</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#047857' }}>88 / 88</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #F1F5F9)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>ACTIVE BACKLOGS</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#047857' }}>0</div>
                </div>
                <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #F1F5F9)' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748B)', fontWeight: 700 }}>STANDING</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--brand-navy, #0B192C)', marginTop: '3px' }}>First Class</div>
                </div>
              </div>
            </div>
          </div>
        );

      // ══════════════════════════════════════════════════════════════════════
      // 7. FEES
      // ══════════════════════════════════════════════════════════════════════
      case 'FEES':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Fee Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface-hover, #F8FAFC)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted, #64748B)' }}>TOTAL APPLICABLE FEES</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginTop: '2px' }}>
                  ₹{totalFees.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#065F46' }}>PAID AMOUNT</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                  ₹{paidFees.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem', background: pendingFees > 0 ? '#FFFBEB' : '#F8FAFC', border: pendingFees > 0 ? '1px solid #FDE68A' : 'none' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: pendingFees > 0 ? '#92400E' : 'var(--text-muted, #64748B)' }}>PENDING AMOUNT</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: pendingFees > 0 ? '#D97706' : '#10B981', marginTop: '2px' }}>
                  {pendingFees === 0 ? '₹ 0 (Cleared)' : `₹${pendingFees.toLocaleString('en-IN')}`}
                </div>
              </div>
              <div className="card" style={{ padding: '1rem', background: 'var(--bg-surface-hover, #F8FAFC)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted, #64748B)' }}>OVERDUE AMOUNT</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                  ₹{overdueFees}
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem' }}>
                Official Payment Transactions &amp; Receipts
              </h4>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Receipt Number</th>
                      <th>Payment Date</th>
                      <th>Amount</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                      <th>Receipt Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeTxs.length === 0 ? (
                      <tr>
                        <td><code>REC-2026-00412</code></td>
                        <td>2026-07-20</td>
                        <td style={{ fontWeight: 800, color: 'var(--brand-orange, #F37023)' }}>₹75,000</td>
                        <td>ONLINE_GATEWAY</td>
                        <td><Badge variant="active">SUCCESS</Badge></td>
                        <td>
                          <button
                            onClick={() => window.print()}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                          >
                            <Download size={12} /> Download
                          </button>
                        </td>
                      </tr>
                    ) : (
                      feeTxs.map(tx => (
                        <tr key={tx.id}>
                          <td style={{ fontWeight: 700, color: 'var(--brand-navy, #0B192C)' }}>{tx.receiptNo}</td>
                          <td>{tx.paymentDate}</td>
                          <td style={{ fontWeight: 800, color: 'var(--brand-orange, #F37023)' }}>₹{tx.paidAmount.toLocaleString('en-IN')}</td>
                          <td>{tx.paymentMode}</td>
                          <td><Badge variant={tx.status === 'SUCCESS' ? 'active' : 'inactive'}>{tx.status}</Badge></td>
                          <td>
                            <button
                              onClick={() => window.print()}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.725rem', padding: '2px 8px' }}
                            >
                              <Download size={12} /> Download
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // ══════════════════════════════════════════════════════════════════════
      // 8. DOCUMENTS
      // ══════════════════════════════════════════════════════════════════════
      case 'DOCUMENTS':
        return <StudentDocumentsSection student={student} onRefresh={() => setRefreshKey(k => k + 1)} />;

      // ══════════════════════════════════════════════════════════════════════
      // 9. REQUESTS
      // ══════════════════════════════════════════════════════════════════════
      case 'REQUESTS':
        return (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem' }}>
              Student Official Service Requests, Certificates &amp; Grievances
            </h4>
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Request Type</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted, #64748B)' }}>
                        No active or past service requests submitted by this student.
                      </td>
                    </tr>
                  ) : (
                    serviceRequests.map((r: any) => (
                      <tr key={r.id}>
                        <td><code>{r.requestNo || r.id}</code></td>
                        <td style={{ fontWeight: 700, color: 'var(--brand-navy, #0B192C)' }}>{r.serviceName || r.type || 'Bonafide Certificate'}</td>
                        <td>{r.createdAt ? r.createdAt.slice(0, 10) : '2026-08-01'}</td>
                        <td>
                          <Badge variant={
                            r.status === 'COMPLETED' || r.status === 'APPROVED' ? 'active' :
                            r.status === 'PENDING' || r.status === 'IN_REVIEW' ? 'orange' :
                            'danger'
                          }>
                            {r.status}
                          </Badge>
                        </td>
                        <td>{r.updatedAt ? r.updatedAt.slice(0, 10) : '2026-08-10'}</td>
                        <td>
                          <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.725rem', padding: '2px 8px' }}>
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      // ══════════════════════════════════════════════════════════════════════
      // 10. AUDIT
      // ══════════════════════════════════════════════════════════════════════
      case 'AUDIT':
      case 'HISTORY':
        return (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface, #FFFFFF)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.75rem' }}>
              Student Record Activity &amp; Audit Trail
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {studentHistory.length === 0 ? (
                <div style={{ padding: '1.5rem', color: 'var(--text-muted, #64748B)', textAlign: 'center' }}>
                  No audit history records available for this student record.
                </div>
              ) : (
                studentHistory.map(h => {
                  const dateObj = new Date(h.timestamp);
                  const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : '2026-08-20';
                  const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString() : '14:30';
                  return (
                    <div key={h.id} style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-surface-hover, #F8FAFC)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      borderLeft: '3px solid var(--brand-navy, #0B192C)'
                    }}>
                      <Clock size={15} color="var(--brand-orange, #F37023)" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--brand-navy, #0B192C)' }}>{h.title}</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>
                            {dateStr} at {timeStr}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', margin: '2px 0 0 0' }}>{h.description}</p>
                        {h.performedBy && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--brand-navy, #0B192C)', fontWeight: 700, marginTop: '2px' }}>
                            Performed By: {h.performedBy} ({h.performedByRole || 'STAFF'})
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Student Profile & Institutional Record"
        subtitle={`Enrollment No: ${student.enrollmentNo}`}
        maxWidth="1240px"
        footer={
          <>
            {onEditClick && canMutate && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onEditClick(student);
                }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close Profile
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* ══════════════════════════════════════════════════════════════════════
              COMPACT PROFESSIONAL STUDENT HEADER
              ══════════════════════════════════════════════════════════════════════ */}
          <div
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md, 8px)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}
          >
            {/* Left: Photo & Identification Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={student.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'}
                  alt={student.name}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: student.status === 'ACTIVE' ? '#10B981' : '#EF4444',
                    border: '2px solid #FFFFFF'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                    {student.name}
                  </h2>
                  <span style={{
                    background: student.status === 'ACTIVE' ? '#D1FAE5' : '#FEF3C7',
                    color: student.status === 'ACTIVE' ? '#065F46' : '#92400E',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {student.status === 'ACTIVE' ? 'PASSOUT / ACTIVE' : student.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '3px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '0.8125rem',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {student.enrollmentNo}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem' }}>
                    ID: <code>{student.id}</code>
                  </span>
                </div>

                <div style={{ fontSize: '0.78125rem', color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>
                  <strong>{program?.name || 'B.Tech in Computer Science & Engineering'}</strong> • {department?.name || 'Computer Engineering'} • {institute?.name || 'Swarrnim Institute of Technology'}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--brand-gold, #FBBF24)', fontWeight: 700, marginTop: '2px' }}>
                  {batchName} • {semesterName} • {divisionName} (Room {division?.roomNo || '302'})
                </div>
              </div>
            </div>

            {/* Right: Role-Permitted Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {onEditClick && canMutate && (
                <button
                  onClick={() => {
                    onClose();
                    onEditClick(student);
                  }}
                  className="btn btn-sm"
                  style={{ background: 'var(--brand-orange, #F37023)', color: '#FFFFFF', border: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.75rem' }}
              >
                <Printer size={13} /> Print Dossier
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              STRICT 10-TAB HORIZONTAL NAVIGATION BAR
              ══════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'flex',
              gap: '0.35rem',
              borderBottom: '2px solid var(--border-color, #E2E8F0)',
              paddingBottom: '0.35rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              position: 'sticky',
              top: '-1.5rem',
              zIndex: 15,
              background: 'var(--bg-surface, #FFFFFF)',
              paddingTop: '0.25rem'
            }}
          >
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    fontSize: '0.78125rem',
                    fontWeight: isActive ? 800 : 600,
                    border: 'none',
                    background: isActive ? 'var(--brand-navy, #0B192C)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-muted, #64748B)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast, 150ms)',
                    flexShrink: 0
                  }}
                >
                  <span style={{ color: isActive ? 'var(--brand-orange, #F37023)' : 'inherit' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span style={{
                      background: isActive ? 'rgba(243,112,35,0.25)' : 'var(--bg-surface-hover, #F1F5F9)',
                      color: isActive ? 'var(--brand-gold, #FBBF24)' : (tab.badgeVariant || 'var(--text-muted, #64748B)'),
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.6875rem',
                      fontWeight: 700
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              ACTIVE TAB BODY VIEW WITH SCROLL CONTAINMENT
              ══════════════════════════════════════════════════════════════════════ */}
          <div ref={scrollContainerRef} style={{ minHeight: '380px', paddingBottom: '1rem' }}>
            {renderTabContent()}
          </div>
        </div>
      </Modal>

      {/* Secure Document Preview Modal */}
      {previewingDoc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 220, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy, #0B192C)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={18} color="var(--brand-navy, #0B192C)" />
                  {previewingDoc.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748B)', margin: 0 }}>
                  Category: {previewingDoc.category} • Uploaded: {previewingDoc.uploadDate}
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setPreviewingDoc(null)}>Close</button>
            </div>

            <div style={{ padding: '2rem', background: '#F8FAFC', borderRadius: 'var(--radius-md, 8px)', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
              <FileText size={48} color="var(--brand-orange, #F37023)" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ fontWeight: 700, color: 'var(--brand-navy, #0B192C)', marginBottom: '0.5rem' }}>{previewingDoc.fileName}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748B)' }}>File Size: {previewingDoc.fileSize}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    handleDownloadFile(previewingDoc);
                    setPreviewingDoc(null);
                  }}
                >
                  <Download size={14} /> Download Secure File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
