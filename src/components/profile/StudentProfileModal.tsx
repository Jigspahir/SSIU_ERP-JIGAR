import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Student, StudentDocument } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { fileStorage } from '../../services/fileStorage';
import { StudentDocumentsSection } from './StudentDocumentsSection';
import { 
  GraduationCap, Mail, Phone, Calendar, User, ShieldCheck, 
  Edit3, FileText, Download, Lock, Unlock, Plus, Trash2, Check, XCircle, AlertCircle, Eye, RefreshCw
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEditClick?: (student: Student) => void;
  canMutate?: boolean;
}

const PRESET_DOCUMENT_TYPES = [
  { title: 'Aadhaar National Identity Card', category: 'IDENTITY' },
  { title: 'Passport Size Photograph', category: 'IDENTITY' },
  { title: 'Specimen Student Signature', category: 'IDENTITY' },
  { title: 'PAN Card Proof', category: 'IDENTITY' },
  { title: '10th Secondary School Certificate & Marksheet', category: 'ACADEMIC' },
  { title: '12th Higher Secondary Science Marksheet', category: 'ACADEMIC' },
  { title: 'Diploma / Prior Graduation Marksheet', category: 'ACADEMIC' },
  { title: 'School Leaving & Transfer Certificate (TC)', category: 'ADMISSION' },
  { title: 'Migration Certificate', category: 'ADMISSION' },
  { title: 'Character & Conduct Certificate', category: 'CERTIFICATE' },
  { title: 'Academic Bank of Credits (ABC ID Card)', category: 'CERTIFICATE' },
  { title: 'Category / Caste / Domicile Certificate', category: 'CERTIFICATE' },
  { title: 'Custom Certificate / Other Document', category: 'OTHER' }
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onEditClick,
  canMutate = true
}) => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'ATTENDANCE' | 'ASSIGNMENTS'>('OVERVIEW');

  // Documents State
  const [docsList, setDocsList] = useState<StudentDocument[]>(() => {
    if (!student) return [];
    return db.getStudentDocuments().filter(d => d.studentId === student.id);
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<StudentDocument | null>(null);
  const [previewingDoc, setPreviewingDoc] = useState<StudentDocument | null>(null);

  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<StudentDocument['category']>('ACADEMIC');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!student) return null;

  const isAdmin = role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL' || role === 'HOD';

  const institute = db.getInstituteById(student.instituteId);
  const department = db.getDepartmentById(student.departmentId);
  const program = db.getProgramById(student.programId);
  const batch = db.getBatchById(student.batchId);
  const semester = db.getSemesterById(student.semesterId);
  const division = db.getDivisionById(student.divisionId);

  // Attendance & Assignment Summaries
  const attStats = db.getStudentAttendanceStats(student.id);
  const allAssignments = db.getAssignments();
  const studentSubmissions = db.getAssignmentSubmissions().filter(s => s.studentId === student.id);
  const subjects = db.getSubjects();

  const refreshDocs = () => {
    setDocsList(db.getStudentDocuments().filter(d => d.studentId === student.id));
  };

  const handleOpenAddDoc = (presetTitle?: string, presetCat?: any) => {
    setEditingDoc(null);
    setNewDocTitle(presetTitle || '');
    setNewDocCategory(presetCat || 'ACADEMIC');
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  const handleOpenEditDoc = (doc: StudentDocument) => {
    if (!isAdmin && doc.isLocked) {
      alert('🔒 This document is VERIFIED and LOCKED. You cannot edit or modify a verified document.');
      return;
    }
    setEditingDoc(doc);
    setNewDocTitle(doc.title);
    setNewDocCategory(doc.category);
    setSelectedFile(null);
    setIsUploadModalOpen(true);
  };

  // Download Handler
  const handleDownloadFile = (doc: StudentDocument) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl || 'https://swarrnim.edu.in/docs/sample.pdf';
    link.download = doc.fileName || `${doc.title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload / Re-upload Document Handler
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) {
      alert('Please fill out the document title.');
      return;
    }

    try {
      if (editingDoc) {
        // Re-uploading / Editing unverified or rejected document
        const storedUrl = selectedFile ? await fileStorage.saveFile(selectedFile) : null;

        db.updateEntity<StudentDocument>('studentDocuments', editingDoc.id, {
          title: newDocTitle,
          category: newDocCategory,
          fileName: selectedFile ? selectedFile.name : editingDoc.fileName,
          fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : editingDoc.fileSize,
          fileUrl: storedUrl || editingDoc.fileUrl,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'PENDING_VERIFICATION',
          isLocked: false,
          remarks: 'Re-uploaded by student for verification'
        }, `Re-uploaded document "${newDocTitle}" for ${student.name}`);
      } else {
        // New document upload
        if (!selectedFile) {
          alert('Please select a file to upload.');
          return;
        }
        const storedUrl = await fileStorage.saveFile(selectedFile);

        db.addEntity<StudentDocument>('studentDocuments', {
          studentId: student.id,
          studentName: student.name,
          enrollmentNo: student.enrollmentNo,
          title: newDocTitle,
          category: newDocCategory,
          fileName: selectedFile.name,
          fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          fileUrl: storedUrl,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'PENDING_VERIFICATION',
          isLocked: false,
          remarks: 'Uploaded by student for verification'
        }, `Uploaded document "${newDocTitle}" for ${student.name}`);
      }

      refreshDocs();
      setIsUploadModalOpen(false);
      setEditingDoc(null);
      setNewDocTitle('');
      setSelectedFile(null);
    } catch (err) {
      alert('Failed to save file document.');
    }
  };

  // Admin Document Actions
  const handleVerifyAndLockDoc = (doc: StudentDocument) => {
    db.updateEntity<StudentDocument>('studentDocuments', doc.id, {
      status: 'VERIFIED',
      isLocked: true, // Permanent lock after Admin verification
      verifiedBy: user?.name || 'Admin Registrar',
      verifiedAt: new Date().toISOString().split('T')[0],
      remarks: 'Verified against university records & permanently locked.'
    }, `Verified & locked document "${doc.title}" for ${student.name}`);

    refreshDocs();
  };

  const handleRejectDoc = (doc: StudentDocument) => {
    const reason = prompt('Specify rejection reason for student:', 'Illegible scan or document mismatch');
    if (reason === null) return;

    db.updateEntity<StudentDocument>('studentDocuments', doc.id, {
      status: 'REJECTED',
      isLocked: false, // Unlocked so student can re-upload
      remarks: `Rejected by Admin: ${reason}`
    }, `Rejected document "${doc.title}" for ${student.name}`);

    refreshDocs();
  };

  const handleUnlockDoc = (doc: StudentDocument) => {
    if (!isAdmin) return;
    if (confirm(`Admin Override: Unlock "${doc.title}" to allow student re-upload?`)) {
      db.updateEntity<StudentDocument>('studentDocuments', doc.id, {
        isLocked: false,
        status: 'PENDING_VERIFICATION',
        remarks: 'Unlocked by Admin override'
      }, `Admin unlocked document "${doc.title}"`);
      refreshDocs();
    }
  };

  const handleDeleteDoc = (doc: StudentDocument) => {
    if (!isAdmin && doc.isLocked) {
      alert('🔒 This document has been VERIFIED and PERMANENTLY LOCKED by the University Admin. Students cannot delete or modify verified documents.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      db.deleteEntity('studentDocuments', doc.id, `Deleted document "${doc.title}"`);
      refreshDocs();
    }
  };

  const getDocStatusBadge = (doc: StudentDocument) => {
    if (doc.status === 'VERIFIED' && doc.isLocked) {
      return <Badge variant="active" icon={<Lock size={12} />}>VERIFIED &amp; LOCKED</Badge>;
    }
    if (doc.status === 'REJECTED') {
      return <Badge variant="danger" icon={<XCircle size={12} />}>REJECTED</Badge>;
    }
    return <Badge variant="orange" icon={<AlertCircle size={12} />}>PENDING VERIFICATION</Badge>;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
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
                  {/* ABC ID: only shown to authorized student record managers, not Faculty/HOD */}
                  {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'REGISTRAR' || role === 'STUDENT_SECTION' || role === 'PRINCIPAL') && (
                    <>
                      <div><span style={{ color: 'var(--text-muted)' }}>ABC ID:</span> <strong style={{ color: 'var(--brand-orange)' }}>{student.abcId || 'Not Submitted'}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>ABC Status:</span> <Badge variant={student.abcIdStatus === 'VERIFIED' ? 'active' : student.abcIdStatus === 'REJECTED' ? 'danger' : 'orange'}>{student.abcIdStatus || 'NOT_SUBMITTED'}</Badge></div>
                    </>
                  )}
                  {student.address && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Residential Address:</span> <strong>{student.address}</strong></div>
                  )}
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--brand-orange-light)', border: '1px solid rgba(243,112,35,0.2)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-orange)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Guardian &amp; Emergency Contact
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Guardian Name:</span> <strong>{student.guardianName || 'Not specified'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Guardian Phone:</span> <strong>{student.guardianPhone || 'Not specified'}</strong></div>
              </div>
            </div>
          </div>
        );

      case 'DOCUMENTS':
        return <StudentDocumentsSection student={student} onRefresh={refreshDocs} />;

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

      case 'ASSIGNMENTS':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Coursework Assignment Submissions &amp; Evaluation Grades
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Assignment Title</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Obtained Score</th>
                    <th>Faculty Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No coursework submissions recorded for this student yet.
                      </td>
                    </tr>
                  ) : (
                    studentSubmissions.map(subm => {
                      const asg = allAssignments.find(a => a.id === subm.assignmentId);

                      return (
                        <tr key={subm.id}>
                          <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{asg?.title || 'Assignment'}</td>
                          <td>{subm.submittedDate}</td>
                          <td><Badge variant={subm.status === 'GRADED' ? 'active' : 'inactive'}>{subm.status}</Badge></td>
                          <td style={{ fontWeight: 800, color: 'var(--brand-orange)' }}>
                            {subm.obtainedMarks !== undefined ? `${subm.obtainedMarks} / ${asg?.totalMarks || 20}` : 'Pending Grade'}
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{subm.feedback || 'None'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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
        maxWidth="840px"
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
                {program?.name} ({program?.code}) • {institute?.code}
              </div>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('OVERVIEW')}
            >
              Academic &amp; Personal Info
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'DOCUMENTS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('DOCUMENTS')}
            >
              Document Vault ({docsList.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ATTENDANCE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('ATTENDANCE')}
            >
              Attendance Summary ({attStats.percentage}%)
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ASSIGNMENTS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('ASSIGNMENTS')}
            >
              Assignments ({studentSubmissions.length})
            </button>
          </div>

          {/* Tab Body */}
          {renderTabContent()}
        </div>
      </Modal>

      {/* Document Preview Modal */}
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

              {getDocStatusBadge(previewingDoc)}
            </div>

            {/* Document Preview Display Box */}
            <div style={{ width: '100%', minHeight: '260px', borderRadius: 'var(--radius-md)', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
              {previewingDoc.fileUrl && previewingDoc.fileUrl.startsWith('http') ? (
                <img
                  src={previewingDoc.fileUrl}
                  alt={previewingDoc.title}
                  style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <FileText size={48} color="var(--brand-navy-medium)" />
                  <div style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--brand-navy)' }}>{previewingDoc.fileName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Digital Student Verification Credential</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem', background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div><strong>Document Category:</strong> {previewingDoc.category}</div>
              <div><strong>Uploaded File:</strong> {previewingDoc.fileName} ({previewingDoc.fileSize})</div>
              <div><strong>Upload Timestamp:</strong> {previewingDoc.uploadDate}</div>
              {previewingDoc.verifiedBy && (
                <div><strong>Verified By:</strong> {previewingDoc.verifiedBy} on {previewingDoc.verifiedAt}</div>
              )}
              {previewingDoc.remarks && (
                <div><strong>Admin Remarks:</strong> {previewingDoc.remarks}</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setPreviewingDoc(null)}>Close Preview</button>
              <button className="btn btn-primary" onClick={() => handleDownloadFile(previewingDoc)}>
                <Download size={16} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload / Edit Document Modal */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
              {editingDoc ? `Edit & Re-upload "${editingDoc.title}"` : 'Upload Student Document'}
            </h3>

            <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Standard Document Type / Title *</label>
                <select
                  className="form-select"
                  value={newDocTitle}
                  onChange={e => {
                    const titleVal = e.target.value;
                    setNewDocTitle(titleVal);
                    const matchedPreset = PRESET_DOCUMENT_TYPES.find(p => p.title === titleVal);
                    if (matchedPreset) {
                      setNewDocCategory(matchedPreset.category as any);
                    }
                  }}
                >
                  <option value="">-- Select Standard Certificate / Document Type --</option>
                  {PRESET_DOCUMENT_TYPES.map(p => (
                    <option key={p.title} value={p.title}>{p.title}</option>
                  ))}
                </select>
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Or enter custom document title..."
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={newDocCategory}
                  onChange={e => setNewDocCategory(e.target.value as any)}
                >
                  <option value="ACADEMIC">ACADEMIC (10th / 12th / Graduation Marksheets)</option>
                  <option value="IDENTITY">IDENTITY (Aadhaar / Photo / Signature / PAN)</option>
                  <option value="ADMISSION">ADMISSION (TC / Migration / Allotment)</option>
                  <option value="CERTIFICATE">CERTIFICATE (ABC ID / Character / Category)</option>
                  <option value="OTHER">OTHER CERTIFICATE</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingDoc ? 'Select New File to Replace (Optional)' : 'Select File (PDF / JPG / PNG) *'}
                </label>
                <input
                  type="file"
                  className="form-input"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg"
                  required={!editingDoc}
                />
              </div>

              <div style={{ background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.3)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#92400E' }}>
                ⚠️ Notice: Ensure document images/scans are clear. Verified documents will be permanently locked.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingDoc ? 'Save & Re-submit' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
