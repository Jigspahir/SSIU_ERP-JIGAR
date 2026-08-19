import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { attendanceApprovalService } from '../../services/attendanceApprovalService';
import {
  SubjectAttendanceStat,
  AttendanceApplication,
  Student,
  ATTENDANCE_REASONS
} from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Download,
  Search,
  Filter,
  ArrowRight,
  Send,
  Upload,
  UserCheck,
  BarChart3,
  HelpCircle
} from 'lucide-react';

export const ExamEligibilityPage: React.FC = () => {
  const { user, role } = useAuth();
  const isStudent = role === 'STUDENT';
  const isController = ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'EXAM_CELL', 'EXAM_CONTROLLER', 'REGISTRAR', 'PRINCIPAL', 'HOD'].includes(role || '');

  // Master Data & Matrix
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Application Modal (Student)
  const [applyingSubject, setApplyingSubject] = useState<SubjectAttendanceStat | null>(null);
  const [reason, setReason] = useState<any>('MEDICAL');
  const [description, setDescription] = useState('');
  const [supportingDocName, setSupportingDocName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Details Modal (Staff/Student)
  const [selectedApplication, setSelectedApplication] = useState<AttendanceApplication | null>(null);

  const departments = useMemo(() => db.getDepartments(), []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Student specific data
  const studentData = useMemo(() => {
    if (!isStudent || !user) return [];
    return attendanceApprovalService.calculateStudentSubjectAttendance(user.id);
  }, [isStudent, user, selectedApplication, applyingSubject]);

  // Institutional Matrix (for Staff / Exam Controller)
  const matrixData = useMemo(() => {
    if (isStudent) return [];
    return attendanceApprovalService.getExamEligibilityMatrix(user, role);
  }, [isStudent, user, role, selectedApplication]);

  const filteredMatrix = useMemo(() => {
    return matrixData.filter(item => {
      if (filterDepartment !== 'ALL' && item.student.departmentId !== filterDepartment) return false;
      if (filterStatus === 'ELIGIBLE' && !item.allEligible) return false;
      if (filterStatus === 'SHORTAGE' && item.shortageCount === 0) return false;
      if (filterStatus === 'CONDONED' && item.condonedCount === 0) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = item.student.name.toLowerCase().includes(q);
        const matchEnroll = item.student.enrollmentNo.toLowerCase().includes(q);
        if (!matchName && !matchEnroll) return false;
      }
      return true;
    });
  }, [matrixData, filterDepartment, filterStatus, searchQuery]);

  // Submit Application
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingSubject || !user) return;
    if (!description.trim()) {
      showToast('error', 'Please provide a clear justification / description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const app = attendanceApprovalService.createAttendanceApplication({
        subjectId: applyingSubject.subjectId,
        reason,
        description,
        supportingDocumentName: supportingDocName || 'Medical_Certificate.pdf',
        supportingDocumentUrl: 'https://cdn.ssiu.edu/documents/medical_proof.pdf'
      }, user);

      showToast('success', `Attendance condonation application ${app.applicationNo} submitted successfully to Subject Faculty.`);
      setApplyingSubject(null);
      setDescription('');
      setSupportingDocName('');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to Excel
  const handleExportXlsx = () => {
    try {
      const bytes = attendanceApprovalService.exportAttendanceReportXlsx(matrixData);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Exam_Attendance_Eligibility_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Official Exam Attendance Eligibility Report downloaded (.XLSX).');
    } catch (err: any) {
      showToast('error', 'Failed to export report.');
    }
  };

  const studentSummary = useMemo(() => {
    if (!isStudent) return null;
    const total = studentData.length;
    const eligible = studentData.filter(s => s.isEligible).length;
    const shortage = studentData.filter(s => !s.isEligible).length;
    const condoned = studentData.filter(s => s.status === 'CONDONED_APPROVAL').length;
    return { total, eligible, shortage, condoned };
  }, [isStudent, studentData]);

  // Student Clearance Details Modal for Staff/Controller
  const [inspectingRow, setInspectingRow] = useState<any | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          padding: '0.875rem 1.25rem',
          borderRadius: '8px',
          backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: toast.type === 'success' ? '#065F46' : '#991B1B',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShieldCheck size={26} color="var(--brand-orange)" />
            Subject-Wise Exam Eligibility & 75% Rule
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Official Statutory Attendance Benchmarks & 4-Tier Condonation Workflow (Faculty → Mentor → HOD → HOI)
          </p>
        </div>

        {!isStudent && (
          <button className="btn btn-secondary" onClick={handleExportXlsx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export Eligibility Matrix (.XLSX)
          </button>
        )}
      </div>

      {/* ─── 1. STUDENT VIEW ──────────────────────────────────────────────────────── */}
      {isStudent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary KPI Cards */}
          {studentSummary && (
            <div className="grid-4">
              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-navy)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Subjects</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>{studentSummary.total}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semester Curriculum</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Exam Eligible Subjects</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem' }}>{studentSummary.eligible}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Meets 75% or Condoned</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #EF4444' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attendance Shortage</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444', marginTop: '0.25rem' }}>{studentSummary.shortage}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Below 75% Minimum Threshold</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved Condonations</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3B82F6', marginTop: '0.25rem' }}>{studentSummary.condoned}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Granted by Principal / HOI</div>
              </div>
            </div>
          )}

          {/* Subject Attendance Breakdown Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="var(--brand-orange)" />
              Subject-Wise Attendance & Clearance Status
            </h3>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Code</th>
                    <th>Conducted Classes</th>
                    <th>Attended / Absent</th>
                    <th>Attendance %</th>
                    <th>Statutory Rule</th>
                    <th>Eligibility Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.map(subj => (
                    <tr key={subj.subjectId}>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{subj.subjectName}</td>
                      <td><code>{subj.subjectCode}</code></td>
                      <td>{subj.totalClasses} Lectures</td>
                      <td>
                        <span style={{ color: '#10B981', fontWeight: 700 }}>{subj.presentClasses}</span> / <span style={{ color: '#EF4444', fontWeight: 700 }}>{subj.absentClasses}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(subj.percentage, 100)}%`, height: '100%', backgroundColor: subj.percentage >= 75 ? '#10B981' : '#EF4444' }} />
                          </div>
                          <span style={{ fontWeight: 800, color: subj.percentage >= 75 ? '#10B981' : '#EF4444' }}>{subj.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min: {subj.requiredPercentage}%</span>
                      </td>
                      <td>
                        {subj.percentage >= 75 ? (
                          <Badge variant="active">EXAM ELIGIBLE</Badge>
                        ) : subj.status === 'CONDONED_APPROVAL' ? (
                          <Badge variant="navy">ELIGIBLE (CONDONED)</Badge>
                        ) : (
                          <Badge variant="danger">ATTENDANCE SHORTAGE</Badge>
                        )}
                      </td>
                      <td>
                        {subj.percentage >= 75 ? (
                          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Cleared</span>
                        ) : subj.status === 'CONDONED_APPROVAL' ? (
                          <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>HOI Approved</span>
                        ) : subj.applicationId ? (
                          <Badge variant="warning">Application Pending ({subj.applicationStatus})</Badge>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setApplyingSubject(subj)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
                          >
                            <Send size={12} /> Apply for Approval
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. STAFF / CONTROLLER MATRIX VIEW ──────────────────────────────────────── */}
      {!isStudent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filter Bar */}
          <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by student name or enrollment..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Department:</label>
              <select
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Clearance:</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ELIGIBLE">100% Cleared Only</option>
                <option value="SHORTAGE">Contains Shortage</option>
                <option value="CONDONED">Contains Condonation</option>
              </select>
            </div>
          </div>

          {/* Institutional Matrix Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              Institutional Student Exam Eligibility Clearance Matrix ({filteredMatrix.length} Students)
            </h3>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Enrollment No</th>
                    <th>Student Name</th>
                    <th>Department</th>
                    <th>Subject Breakdown & Attendance %</th>
                    <th>Shortage Count</th>
                    <th>Overall Exam Clearance</th>
                    <th>Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map(item => (
                    <tr key={item.student.id}>
                      <td><code>{item.student.enrollmentNo}</code></td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{item.student.name}</td>
                      <td>{db.getDepartmentById(item.student.departmentId)?.name || item.student.departmentId}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {item.subjects.map((s: any) => (
                            <div key={s.subjectId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                              <span style={{ fontWeight: 600, minWidth: '70px' }}>{s.subjectCode}:</span>
                              <span style={{ color: s.percentage >= 75 ? '#10B981' : '#EF4444', fontWeight: 700 }}>{s.percentage}%</span>
                              {s.percentage >= 75 ? (
                                <Badge variant="active">Attendance Eligible</Badge>
                              ) : s.status === 'CONDONED_APPROVAL' ? (
                                <Badge variant="navy">Condoned ({s.applicationNo || 'HOI Granted'})</Badge>
                              ) : (
                                <Badge variant="danger">Shortage ({s.shortagePercentage}%)</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        {item.shortageCount > 0 ? (
                          <span style={{ color: '#EF4444', fontWeight: 800 }}>{item.shortageCount} Shortages</span>
                        ) : (
                          <span style={{ color: '#10B981', fontWeight: 700 }}>0 Shortages</span>
                        )}
                      </td>
                      <td>
                        {item.allEligible ? (
                          <Badge variant="active">EXAM FORM CLEARED</Badge>
                        ) : (
                          <Badge variant="danger">EXAM FORM BLOCKED</Badge>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setInspectingRow(item)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <FileText size={12} /> Inspect
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

      {/* ─── MODAL: EXAM CONTROLLER CLEARANCE AUDIT INSPECTION ──────────────────────── */}
      {inspectingRow && (
        <Modal
          isOpen={Boolean(inspectingRow)}
          onClose={() => setInspectingRow(null)}
          title={`Exam Eligibility Audit: ${inspectingRow.student.name} (${inspectingRow.student.enrollmentNo})`}
          maxWidth="700px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.875rem 1rem', borderRadius: '8px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
              <div className="grid-2" style={{ gap: '0.5rem' }}>
                <div><strong>Student:</strong> {inspectingRow.student.name}</div>
                <div><strong>Enrollment:</strong> {inspectingRow.student.enrollmentNo}</div>
                <div><strong>Department:</strong> {db.getDepartmentById(inspectingRow.student.departmentId)?.name || inspectingRow.student.departmentId}</div>
                <div><strong>Overall Status:</strong> {inspectingRow.allEligible ? <Badge variant="active">Cleared for Exam</Badge> : <Badge variant="danger">Blocked (&lt; 75%)</Badge>}</div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Attendance %</th>
                    <th>Eligibility Status</th>
                    <th>Approval Reference</th>
                    <th>Final Approved By</th>
                    <th>Approval Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectingRow.subjects.map((subj: any) => (
                    <tr key={subj.subjectId}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{subj.subjectName}</div>
                        <code>{subj.subjectCode}</code>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: subj.percentage >= 75 ? '#10B981' : '#EF4444' }}>
                          {subj.percentage}%
                        </span>
                      </td>
                      <td>
                        {subj.percentage >= 75 ? (
                          <Badge variant="active">Attendance Eligible</Badge>
                        ) : subj.status === 'CONDONED_APPROVAL' ? (
                          <Badge variant="navy">Attendance Approval Eligible</Badge>
                        ) : (
                          <Badge variant="danger">Attendance Shortage</Badge>
                        )}
                      </td>
                      <td>
                        {subj.applicationNo ? <code>{subj.applicationNo}</code> : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                      </td>
                      <td>
                        {subj.finalApprovedBy ? (
                          <span style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{subj.finalApprovedBy}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>{subj.percentage >= 75 ? 'Automatic' : 'None'}</span>
                        )}
                      </td>
                      <td>
                        {subj.finalApprovedAt ? (
                          new Date(subj.finalApprovedAt).toLocaleDateString()
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setInspectingRow(null)}>Close Audit</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: STUDENT ATTENDANCE CONDONATION APPLICATION ──────────────────────── */}
      {applyingSubject && (
        <Modal
          isOpen={Boolean(applyingSubject)}
          onClose={() => setApplyingSubject(null)}
          title={`Apply for Attendance Approval: ${applyingSubject.subjectName}`}
          maxWidth="580px"
        >
          <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Attendance:</span>
                <span style={{ fontSize: '0.875rem', color: '#EF4444', fontWeight: 800 }}>{applyingSubject.percentage}% ({applyingSubject.presentClasses}/{applyingSubject.totalClasses} Classes)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Required Statutory Threshold:</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', fontWeight: 700 }}>{applyingSubject.requiredPercentage}% Minimum</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Required Condonation:</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--brand-orange)', fontWeight: 800 }}>{applyingSubject.shortagePercentage}% Shortage</span>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Reason Category *</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as any)}
                style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                required
              >
                {ATTENDANCE_REASONS.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Detailed Justification / Explanation *</label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain the specific dates of absence, medical circumstances, hospital details, or university event..."
                style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>Supporting Document Attachment</label>
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <Upload size={24} color="var(--brand-orange)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {supportingDocName || 'Medical_Certificate_Proof.pdf'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Medical certificate, hospital discharge card, official university duty order
                </div>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', backgroundColor: 'rgba(59,130,246,0.06)', fontSize: '0.75rem', color: 'var(--brand-navy)' }}>
              <strong>Sequential Approval Sequence:</strong> Subject Faculty ({applyingSubject.facultyName || 'Faculty'}) → Mentor → HOD → Principal (HOI) → Exam Eligible.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setApplyingSubject(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit to Subject Faculty'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
