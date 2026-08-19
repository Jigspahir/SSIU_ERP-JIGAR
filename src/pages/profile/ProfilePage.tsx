import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { User, ShieldCheck, Mail, Phone, Lock, Save, CheckCircle2, Award, FileText, Check, XCircle, Upload, AlertCircle, RefreshCw, FolderCheck } from 'lucide-react';
import { db } from '../../services/db';
import { mentorAssignmentService } from '../../services/mentorAssignmentService';
import { Student } from '../../types';
import { StudentDocumentsSection } from '../../components/profile/StudentDocumentsSection';

export const ProfilePage: React.FC = () => {
  const { user, role, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'ACCOUNT'>(role === 'STUDENT' ? 'DOCUMENTS' : 'ACCOUNT');

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState('');
  const [error, setError] = useState('');

  // ABC ID & Student Record State (only for STUDENT role)
  const studentRecord = role === 'STUDENT' ? (db.getStudents().find(s => s.id === user?.id || s.enrollmentNo === user?.enrollmentNo) || null) : null;
  
  const [abcIdInput, setAbcIdInput] = useState(studentRecord?.abcId || '');
  const [abcDocName, setAbcDocName] = useState(studentRecord?.abcIdDocUrl ? 'DigiLocker_ABC_Proof.pdf' : '');
  const [abcRemarks, setAbcRemarks] = useState('');
  const [isRejectingModalOpen, setIsRejectingModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!user) return null;

  const institute = db.getInstituteById(user.instituteId);
  const department = db.getDepartmentById(user.departmentId);
  const program = db.getProgramById(user.programId);

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSavedSuccess('');

    updateProfile({ name, phone });
    setSavedSuccess('Personal profile details updated successfully.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSavedSuccess('');

    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    updateProfile({ password });
    setPassword('');
    setConfirmPassword('');
    setSavedSuccess('Security password updated successfully.');
  };

  // ABC ID Handlers
  const handleSaveStudentAbcId = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSavedSuccess('');

    const cleaned = abcIdInput.replace(/\D/g, '');
    if (cleaned.length !== 12) {
      setError('ABC ID must be a valid 12-digit number (e.g. 9842-1056-7890).');
      return;
    }

    const formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;

    if (studentRecord) {
      db.updateEntity<Student>('students', studentRecord.id, {
        abcId: formatted,
        abcIdStatus: 'PENDING_VERIFICATION',
        abcIdDocUrl: abcDocName || 'DigiLocker_ABC_Proof.pdf',
        abcIdRemarks: 'Submitted by student via profile portal'
      }, `Student updated ABC ID ${formatted}`);
    }

    setSavedSuccess(`ABC ID ${formatted} submitted successfully for Admin Verification.`);
  };

  const handleAdminVerifyAbcId = () => {
    if (!studentRecord) return;
    db.updateEntity<Student>('students', studentRecord.id, {
      abcIdStatus: 'VERIFIED',
      abcIdRemarks: `Verified by ${user.name} on ${new Date().toISOString().split('T')[0]}`
    }, `Admin verified ABC ID for ${studentRecord.name}`);

    setSavedSuccess(`ABC ID for ${studentRecord.name} has been VERIFIED.`);
  };

  const handleAdminRejectAbcIdConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason || !studentRecord) return;

    db.updateEntity<Student>('students', studentRecord.id, {
      abcIdStatus: 'REJECTED',
      abcIdRemarks: `Rejected by Admin: ${rejectReason}`
    }, `Admin rejected ABC ID for ${studentRecord.name}`);

    setIsRejectingModalOpen(false);
    setRejectReason('');
    setSavedSuccess(`ABC ID status updated to REJECTED with remarks.`);
  };

  const getAbcStatusBadge = (status?: Student['abcIdStatus']) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="active">VERIFIED BY DIGILOCKER &amp; ADMIN</Badge>;
      case 'PENDING_VERIFICATION':
        return <Badge variant="orange">PENDING ADMIN VERIFICATION</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED - ACTION REQUIRED</Badge>;
      default:
        return <Badge variant="inactive">NOT SUBMITTED</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={user.name}
            style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-orange)' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>{user.name}</h2>
              <Badge variant="orange" icon={<ShieldCheck size={14} />}>
                {user.role.replace('_', ' ')}
              </Badge>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.875rem', color: '#94A3B8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={16} color="var(--brand-orange)" /> {user.email}
              </span>
              {user.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={16} color="var(--brand-gold)" /> {user.phone}
                </span>
              )}
              {user.employeeId && <span>Employee ID: <strong>{user.employeeId}</strong></span>}
              {user.enrollmentNo && <span>Enrollment No: <strong>{user.enrollmentNo}</strong></span>}
              {role === 'STUDENT' && studentRecord?.abcId && <span>ABC ID: <strong>{studentRecord.abcId}</strong></span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {(role === 'STUDENT' || role === 'STUDENT_SECTION' || role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN') && (
          <button
            className={`btn ${activeTab === 'DOCUMENTS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('DOCUMENTS')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <FolderCheck size={18} /> Student Verification Vault
          </button>
        )}
        <button
          className={`btn ${activeTab === 'ACCOUNT' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ACCOUNT')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <User size={18} /> Personal Details &amp; Account Credentials
        </button>
      </div>

      {savedSuccess && (
        <div style={{ padding: '1rem', background: '#ECFDF5', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {savedSuccess}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* TAB CONTENT: STUDENT DOCUMENTS VAULT */}
      {activeTab === 'DOCUMENTS' && studentRecord && (
        <StudentDocumentsSection student={studentRecord} />
      )}

      {/* TAB CONTENT: ACCOUNT & PERSONAL DETAILS */}
      {activeTab === 'ACCOUNT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>


      {/* --- ABC ID MODULE SECTION: Student-Only --- */}
      {role === 'STUDENT' && (
      <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--brand-orange)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={22} color="var(--brand-orange)" /> Academic Bank of Credits (ABC ID) Management
            </h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              12-digit Government UGC / DigiLocker Unique Credit Identification Number
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {getAbcStatusBadge(studentRecord?.abcIdStatus)}
          </div>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {/* Current ABC ID Display & Form */}
          <form onSubmit={handleSaveStudentAbcId} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">12-Digit Academic Bank of Credits ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 9842-1056-7890"
                value={abcIdInput}
                onChange={e => setAbcIdInput(e.target.value)}
                maxLength={14}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Format: 12 numerical digits matching your official DigiLocker card.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">DigiLocker ABC Card Proof (PDF / Image)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="file"
                  className="form-input"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setAbcDocName(e.target.files[0].name);
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              {abcDocName && (
                <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={14} /> Attached Document: {abcDocName}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Submit ABC ID for Verification
              </button>
            </div>
          </form>

          {/* Verification Status (read-only for Student – verification done by Student Section) */}
          <div style={{ background: 'var(--bg-surface-hover)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={18} color="#10B981" /> Verification Status &amp; Remarks
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                After submission, your ABC ID is verified by the Student Section office. Verification typically takes 1–3 working days.
              </p>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <div><strong>Current ABC ID:</strong> {studentRecord?.abcId || 'Not submitted yet'}</div>
                <div><strong>Submission Status:</strong> {studentRecord?.abcIdStatus || 'NOT_SUBMITTED'}</div>
                <div><strong>Admin Remarks:</strong> {studentRecord?.abcIdRemarks || 'No remarks added yet'}</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>📋 Steps:</strong> 1. Enter your 12-digit ABC ID from DigiLocker &nbsp;→&nbsp; 2. Upload proof &nbsp;→&nbsp; 3. Submit &nbsp;→&nbsp; 4. Await Student Section verification
            </div>
          </div>
        </div>
      </div>
      )}

      {/* --- Assigned Faculty Mentor Section: Student-Only --- */}
      {role === 'STUDENT' && (() => {
        const student = studentRecord || (db.getStudents()[0]);
        const activeMentor = student ? mentorAssignmentService.getActiveMentorForStudent(student.id) : null;
        return (
          <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--brand-navy)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <ShieldCheck size={22} color="var(--brand-navy)" /> Assigned Faculty Mentor
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Your assigned academic mentor and counselor
                </p>
              </div>
              <Badge variant={activeMentor ? 'gold' : 'danger'}>
                {activeMentor ? 'ACTIVE MENTOR' : 'UNASSIGNED'}
              </Badge>
            </div>

            {activeMentor ? (
              <div className="grid-3" style={{ gap: '1.25rem', fontSize: '0.84375rem' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>FACULTY NAME</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--brand-navy)' }}>{activeMentor.mentorName}</strong>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>EMPLOYEE ID</span>
                  <code style={{ fontWeight: 700, color: 'var(--brand-orange)', fontSize: '0.9rem' }}>{activeMentor.mentorEmployeeId}</code>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>DEPARTMENT</span>
                  <strong>{activeMentor.departmentName || 'Computer Engineering'}</strong>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>OFFICIAL EMAIL</span>
                  <strong style={{ color: 'var(--brand-navy)' }}>{activeMentor.mentorEmail || 'faculty@university.edu'}</strong>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>CONTACT PHONE</span>
                  <strong>{activeMentor.mentorPhone || '+91 98250 11001'}</strong>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>ASSIGNMENT DATE</span>
                  <span>{new Date(activeMentor.assignedDate).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#EF4444', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> No faculty mentor currently assigned. Please contact your department HOD.
              </div>
            )}
          </div>
        );
      })()}

      {/* --- Faculty Academic & Employment Details Section --- */}
      {role === 'FACULTY' && (() => {
        const facRecord = db.getFaculty().find(f => f.id === user?.id || f.email === user?.email);
        const mySubjects = db.getSubjects().filter(s => s.departmentId === (facRecord?.departmentId || user?.departmentId));
        return (
          <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--brand-orange)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Award size={22} color="var(--brand-orange)" /> Faculty Academic &amp; Employment Profile
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Official university appointment, department allocation, and teaching responsibilities
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Badge variant="navy">READ ONLY (AUTHORIZED HR MASTER)</Badge>
                {((facRecord as any)?.isMentor || Boolean((user as any).isMentor)) && <Badge variant="gold">ASSIGNED MENTOR</Badge>}
              </div>
            </div>

            <div className="grid-3" style={{ gap: '1.25rem', fontSize: '0.84375rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>EMPLOYEE ID</span>
                <code style={{ fontWeight: 700, color: 'var(--brand-orange)', fontSize: '1rem' }}>{facRecord?.employeeId || user.employeeId || 'FAC-001'}</code>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>DESIGNATION</span>
                <strong style={{ fontSize: '1rem', color: 'var(--brand-navy)' }}>{facRecord?.designation || 'Assistant Professor'}</strong>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>DEPARTMENT</span>
                <strong>{department?.name || 'Department of Computer Science & Engineering'}</strong>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>INSTITUTE</span>
                <strong>{institute?.name || 'Swarrnim Institute of Technology'}</strong>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>ACADEMIC YEAR</span>
                <strong>2025-2026 (Even Semester)</strong>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>ASSIGNED SUBJECTS</span>
                <strong style={{ color: 'var(--brand-orange)' }}>{mySubjects.length} Curriculum Courses</strong>
              </div>
            </div>

            {mySubjects.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>Active Teaching Subjects:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {mySubjects.map(sub => (
                    <span key={sub.id} style={{ padding: '0.35rem 0.75rem', background: '#F1F5F9', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                      <strong>{sub.code}:</strong> {sub.name} ({sub.credits} Credits • {sub.type})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Responsibilities Details */}
            {(() => {
              const { students: mentees } = mentorAssignmentService.getAssignments({}, user);
              if (mentees.length > 0 || (facRecord as any)?.isMentor) {
                return (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Award size={16} color="var(--brand-gold)" /> Designated Official Academic Mentor
                      </div>
                      <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                        Currently mentoring and counseling <strong>{mentees.length} assigned students</strong> for AY 2025-2026.
                      </div>
                    </div>
                    <Badge variant="gold">{mentees.length} Assigned Mentees</Badge>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        );
      })()}

      <div className="grid-2">
        {/* Profile Info Form */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--brand-orange)" /> Personal Details
          </h3>

          <form onSubmit={handleUpdateInfo}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institutional Email (Read Only)</label>
              <input
                type="email"
                className="form-input"
                value={user.email}
                disabled
                style={{ backgroundColor: 'var(--bg-surface-hover)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
              <Save size={16} /> Save Personal Details
            </button>
          </form>
        </div>

        {/* Change Password Form & Institutional Scope */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Institutional Scope Info */}
          <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem' }}>
              Assigned Institutional Scope
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.84375rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Institute:</span>{' '}
                <strong>{institute ? institute.name : 'All Institutes (Global)'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Department:</span>{' '}
                <strong>{department ? department.name : 'All Departments'}</strong>
              </div>
              {program && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Enrolled Program:</span>{' '}
                  <strong>{program.name} ({program.code})</strong>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Form */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} color="var(--brand-navy-medium)" /> Security &amp; Credentials
            </h3>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-navy" style={{ marginTop: '0.75rem' }}>
                <Lock size={16} /> Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Admin Reject ABC ID Modal */}
      {isRejectingModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
              Reject Student ABC ID Submission
            </h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Specify rejection reason for {studentRecord?.name} ({studentRecord?.abcId})
            </p>

            <form onSubmit={handleAdminRejectAbcIdConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Rejection Reason / Correction Notes *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. DigiLocker card name mismatch or invalid 12-digit number."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsRejectingModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Reject ABC ID</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
