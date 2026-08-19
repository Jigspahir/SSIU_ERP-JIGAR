import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Student, StudentDocument } from '../../types';
import { db } from '../../services/db';
import { mentorAssignmentService } from '../../services/mentorAssignmentService';
import { studentProfileAccessService, StudentProfileData } from '../../services/studentProfileAccessService';
import { useAuth } from '../../context/AuthContext';
import { StudentDocumentsSection } from './StudentDocumentsSection';
import { 
  GraduationCap, Mail, Phone, Calendar, User, ShieldCheck, 
  Edit3, FileText, Download, Lock, Unlock, Plus, Trash2, Check, XCircle, AlertCircle, Eye, RefreshCw,
  Award, Clock, IndianRupee, MessageSquare, History, Globe, CheckCircle2, ShieldAlert
} from 'lucide-react';

export type StudentProfileTabType = 
  | 'OVERVIEW'
  | 'PERSONAL'
  | 'ACADEMIC'
  | 'DOCUMENTS'
  | 'ATTENDANCE'
  | 'EXAMINATIONS'
  | 'FEES'
  | 'REQUESTS'
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
  const [activeTab, setActiveTab] = useState<StudentProfileTabType>(initialTab);
  const [previewingDoc, setPreviewingDoc] = useState<StudentDocument | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

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

  // Attendance & Assignment Summaries
  const attStats = profileData?.attendanceStats || db.getStudentAttendanceStats(student.id);
  const allAssignments = db.getAssignments();
  const studentSubmissions = db.getAssignmentSubmissions().filter(s => s.studentId === student.id);
  const subjects = db.getSubjects();

  // Fee Transactions
  const feeTxs = db.getFeePaymentTransactions().filter(t => t.studentId === student.id);
  
  // Student Service Applications
  const serviceRequests = (db.getState().studentSectionRequests || []).filter((r: any) => r.studentId === student.id);

  // Secure Audited Download Handler
  const handleDownloadFile = (doc: StudentDocument) => {
    if (!user || !role) return;
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

  // Secure Audited Preview Handler
  const handlePreviewFile = (doc: StudentDocument) => {
    if (!user || !role) return;
    try {
      studentProfileAccessService.getStudentDocumentFile(user, role, student.id, doc.id, 'PREVIEW');
      setPreviewingDoc(doc);
    } catch (err: any) {
      alert(err.message || 'Unauthorized document preview.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Academic Hierarchy */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover)' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={18} color="var(--brand-orange)" /> Academic Placement
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Institute:</span> <strong>{institute?.name || '-'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> <strong>{department?.name || '-'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Program:</span> <strong>{program?.name || '-'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Batch:</span> <strong>{batch?.name || '-'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Semester:</span> <strong>{semester?.code || '-'} (Sem {semester?.number})</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Division &amp; Room:</span> <strong>{division?.name || '-'} (Room {division?.roomNo || '-'})</strong></div>
                  {student.admissionDate && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Admission Date:</span> <strong>{student.admissionDate}</strong></div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover)' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color="var(--brand-navy-medium)" /> Personal Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Gender:</span> <strong>{student.gender}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Date of Birth:</span> <strong>{student.dateOfBirth || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Blood Group:</span> <Badge variant="orange">{student.bloodGroup || 'N/A'}</Badge></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Student Email:</span> <strong>{student.email}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Phone Number:</span> <strong>{student.phone}</strong></div>
                  {/* ABC ID */}
                  <div><span style={{ color: 'var(--text-muted)' }}>ABC ID:</span> <strong style={{ color: 'var(--brand-orange)' }}>{student.abcId || 'Not Submitted'}</strong></div>
                  {student.address && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Residential Address:</span> <strong>{student.address}</strong></div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Faculty Mentor Card */}
            {(() => {
              const activeMentor = mentorAssignmentService.getActiveMentorForStudent(student.id);
              return (
                <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(243, 112, 35, 0.05) 100%)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <ShieldCheck size={18} color="var(--brand-navy)" /> Assigned Faculty Mentor
                    </h4>
                    <Badge variant={activeMentor ? 'gold' : 'danger'}>
                      {activeMentor ? 'ACTIVE MENTOR' : 'UNASSIGNED'}
                    </Badge>
                  </div>

                  {activeMentor ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Mentor Name</span>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--brand-navy)' }}>{activeMentor.mentorName}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Employee ID</span>
                        <code style={{ fontWeight: 700, color: 'var(--brand-orange)' }}>{activeMentor.mentorEmployeeId}</code>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Department</span>
                        <strong>{activeMentor.departmentName || 'Computer Engineering'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Official Email</span>
                        <strong style={{ color: 'var(--brand-navy)' }}>{activeMentor.mentorEmail || 'email@university.edu'}</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} /> No faculty mentor currently assigned to this student.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );

      case 'PERSONAL':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>Identity &amp; Citizenship</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Student Type:</span> <Badge variant="gold">{student.studentType || 'DOMESTIC'}</Badge></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Nationality:</span> <strong>{student.nationality || 'Indian'}</strong></div>
                  {student.passportNumber && <div><span style={{ color: 'var(--text-muted)' }}>Passport No:</span> <strong>{student.passportNumber}</strong></div>}
                  {student.visaNumber && <div><span style={{ color: 'var(--text-muted)' }}>Visa No:</span> <strong>{student.visaNumber}</strong></div>}
                  <div><span style={{ color: 'var(--text-muted)' }}>ABC ID:</span> <strong style={{ color: 'var(--brand-orange)' }}>{student.abcId || 'Not Registered'}</strong></div>
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>Emergency &amp; Guardian</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Guardian Name:</span> <strong>{student.guardianName || 'Not specified'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Guardian Phone:</span> <strong>{student.guardianPhone || 'Not specified'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Student Phone:</span> <strong>{student.phone}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Official Email:</span> <strong>{student.email}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Address:</span> <strong>{student.address || 'Ahmedabad, Gujarat'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ACADEMIC':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>Semester Progression &amp; Performance History</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Semester</th>
                      <th>Academic Year</th>
                      <th>SPI</th>
                      <th>CPI</th>
                      <th>Attendance</th>
                      <th>Fee Status</th>
                      <th>Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(student.academicHistory || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          Currently pursuing Semester {semester?.number || 1}. No prior semester history recorded.
                        </td>
                      </tr>
                    ) : (
                      (student.academicHistory || []).map((ah, idx) => (
                        <tr key={idx}>
                          <td><strong>Semester {ah.semesterNumber}</strong></td>
                          <td>{ah.academicYearName}</td>
                          <td style={{ fontWeight: 800, color: 'var(--brand-orange)' }}>{ah.spi || '-'}</td>
                          <td style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{ah.cpi || '-'}</td>
                          <td>{ah.attendancePercentage ? `${ah.attendancePercentage}%` : '-'}</td>
                          <td><Badge variant={ah.feeClearanceStatus === 'CLEARED' ? 'active' : 'inactive'}>{ah.feeClearanceStatus || 'CLEARED'}</Badge></td>
                          <td><Badge variant={ah.status === 'COMPLETED' || ah.status === 'PROMOTED' ? 'active' : 'danger'}>{ah.status}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'DOCUMENTS':
        return <StudentDocumentsSection student={student} onRefresh={() => setRefreshKey(k => k + 1)} />;

      case 'ATTENDANCE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-3">
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--brand-orange)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>OVERALL ATTENDANCE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: attStats.percentage >= 75 ? '#10B981' : '#EF4444' }}>{attStats.percentage}%</div>
              </div>
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRESENT / LATE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>{attStats.presentClasses} / {attStats.totalClasses}</div>
              </div>
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #EF4444' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ABSENT CLASSES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#EF4444' }}>{attStats.absentClasses}</div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Classes Attended</th>
                    <th>Percentage</th>
                    <th>Eligibility Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(s => {
                    const stat = attStats.subjectStats[s.id] || { total: 0, present: 0 };
                    const pct = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 100;

                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{s.name} ({s.code})</td>
                        <td>{stat.present} / {stat.total}</td>
                        <td style={{ fontWeight: 800 }}>{pct}%</td>
                        <td><Badge variant={pct >= 75 ? 'active' : 'inactive'}>{pct >= 75 ? 'Eligible' : 'Warning'}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'EXAMINATIONS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>Examination Forms &amp; Results</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Exam eligibility: <Badge variant={attStats.percentage >= 75 ? 'active' : 'danger'}>{attStats.percentage >= 75 ? 'ELIGIBLE' : 'ATTENDANCE_SHORTAGE'}</Badge>
              </p>
            </div>
          </div>
        );

      case 'FEES':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>Fee Transactions &amp; Receipts</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Receipt No</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Transaction ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeTxs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          No fee payment records found.
                        </td>
                      </tr>
                    ) : (
                      feeTxs.map(tx => (
                        <tr key={tx.id}>
                          <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{tx.receiptNo}</td>
                          <td>{tx.paymentDate}</td>
                          <td style={{ fontWeight: 800, color: 'var(--brand-orange)' }}>₹{tx.paidAmount.toLocaleString('en-IN')}</td>
                          <td>{tx.paymentMode}</td>
                          <td><code>{tx.transactionId}</code></td>
                          <td><Badge variant={tx.status === 'SUCCESS' ? 'active' : 'inactive'}>{tx.status}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'REQUESTS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>Official Service Applications</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Request No</th>
                      <th>Service Name</th>
                      <th>Submission Date</th>
                      <th>Fee</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          No active or past service requests submitted by this student.
                        </td>
                      </tr>
                    ) : (
                      serviceRequests.map((r: any) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{r.requestNo}</td>
                          <td>{r.serviceName}</td>
                          <td>{r.createdAt ? r.createdAt.slice(0, 10) : '2026-08-01'}</td>
                          <td>₹{r.calculatedFee || 0}</td>
                          <td><Badge variant={r.status === 'COMPLETED' || r.status === 'APPROVED' ? 'active' : 'orange'}>{r.status}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'HISTORY':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Chronological Audit Log of Academic, Verification &amp; Service Events
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {studentHistory.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No historical activity recorded yet.
                </div>
              ) : (
                studentHistory.map(item => (
                  <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: `4px solid ${item.category === 'DOCUMENT' ? 'var(--brand-orange)' : item.category === 'FEE' ? '#10B981' : 'var(--brand-navy)'}` }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {item.description}
                      </div>
                      {item.performedBy && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>
                          Performed by: <strong>{item.performedBy}</strong> {item.performedByRole ? `(${item.performedByRole})` : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}
                      </div>
                      {item.status && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <Badge variant="orange">{item.status}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Student Profile & Academic Summary"
        subtitle={`Enrollment No: ${student.enrollmentNo}`}
        maxWidth="920px"
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
                <Edit3 size={16} /> Edit Student Profile
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Profile Card Banner */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem'
            }}
          >
            <img
              src={student.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'}
              alt={student.name}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--brand-orange)',
                flexShrink: 0
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {student.name}
                </h3>
                <Badge variant={student.status === 'ACTIVE' ? 'active' : 'inactive'}>{student.status}</Badge>
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--brand-gold)', fontWeight: 600, marginTop: '0.25rem' }}>
                Enrollment No: {student.enrollmentNo}
              </div>

              <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                {program?.name} ({program?.code}) • {institute?.code || 'SSIU'}
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('OVERVIEW')}
            >
              Overview
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'PERSONAL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('PERSONAL')}
            >
              Personal Details
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ACADEMIC' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('ACADEMIC')}
            >
              Academic History
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'DOCUMENTS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('DOCUMENTS')}
            >
              Documents Vault ({docsList.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ATTENDANCE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('ATTENDANCE')}
            >
              Attendance ({attStats.percentage}%)
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'FEES' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('FEES')}
            >
              Fees &amp; Receipts
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'REQUESTS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('REQUESTS')}
            >
              Service Requests
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'HISTORY' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('HISTORY')}
            >
              Activity &amp; Audit Log
            </button>
          </div>

          {/* Tab Body */}
          {renderTabContent()}
        </div>
      </Modal>

      {/* Secure Document Preview Modal */}
      {previewingDoc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 220, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={20} color="var(--brand-orange)" /> {previewingDoc.title}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Student: {previewingDoc.studentName} ({previewingDoc.enrollmentNo})
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setPreviewingDoc(null)}>✕ Close</button>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', backgroundColor: '#F8FAFC', minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={48} color="var(--brand-orange)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>{previewingDoc.fileName || `${previewingDoc.title}.pdf`}</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '1.25rem' }}>
                Secure Document Vault Record • Size: {previewingDoc.fileSize} • Uploaded: {previewingDoc.uploadDate}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownloadFile(previewingDoc)}
                >
                  <Download size={14} /> Download Secure File
                </button>
              </div>
            </div>

            {previewingDoc.verificationHistory && previewingDoc.verificationHistory.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <h5 style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>Verification Trail</h5>
                {previewingDoc.verificationHistory.map(vh => (
                  <div key={vh.id} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    • {vh.action} by <strong>{vh.verifiedByName}</strong> ({vh.verifiedByRole}) on {new Date(vh.timestamp).toLocaleString()} {vh.remarks ? `- "${vh.remarks}"` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
