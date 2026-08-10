import React, { useState, useEffect } from 'react';
import { Student, StudentDocument, STANDARD_STUDENT_DOCUMENTS } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { fileStorage } from '../../services/fileStorage';
import { Badge } from '../common/Badge';
import { 
  FileText, Upload, Download, Eye, CheckCircle2, XCircle, AlertCircle, 
  Lock, Unlock, RefreshCw, Trash2, Edit3, ShieldCheck, Check, AlertTriangle, Plus, Search, Filter
} from 'lucide-react';

interface StudentDocumentsSectionProps {
  student: Student;
  onRefresh?: () => void;
}

export const StudentDocumentsSection: React.FC<StudentDocumentsSectionProps> = ({
  student,
  onRefresh
}) => {
  if (!student) return null;

  const { user, role } = useAuth();
  const isAdmin = role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL' || role === 'HOD';
  const isStudent = role === 'STUDENT';

  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [uploadModalDoc, setUploadModalDoc] = useState<{ title: string; category: StudentDocument['category']; existingDoc?: StudentDocument } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);
  const [rejectModalDoc, setRejectModalDoc] = useState<StudentDocument | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Form input state for upload modal
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<StudentDocument['category']>('ACADEMIC');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadDocuments = () => {
    if (!student?.id) return;
    const list = db.getStudentDocumentsByStudentId(student.id);
    setDocuments(list);
    if (onRefresh) onRefresh();
  };

  useEffect(() => {
    if (student?.id) {
      loadDocuments();
    }
  }, [student?.id]);

  // Combine standard 13 documents with student's current documents
  const documentRows = STANDARD_STUDENT_DOCUMENTS.map(stdDoc => {
    const uploadedDoc = documents.find(d => 
      d.title.toLowerCase().trim() === stdDoc.title.toLowerCase().trim() ||
      d.title.toLowerCase().includes(stdDoc.title.toLowerCase().slice(0, 8))
    );
    return {
      standard: stdDoc,
      uploadedDoc: uploadedDoc || null
    };
  });

  // Custom uploaded documents that are not in standard 13 list
  const customDocs = documents.filter(d => 
    !STANDARD_STUDENT_DOCUMENTS.some(std => 
      d.title.toLowerCase().trim() === std.title.toLowerCase().trim() ||
      d.title.toLowerCase().includes(std.title.toLowerCase().slice(0, 8))
    )
  );

  // Filter & search logic
  const filteredStandardRows = documentRows.filter(row => {
    const titleMatch = row.standard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       row.standard.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch) return false;

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'NOT_UPLOADED') return !row.uploadedDoc;
    if (!row.uploadedDoc) return false;
    return row.uploadedDoc.status === filterStatus;
  });

  const filteredCustomDocs = customDocs.filter(d => {
    const titleMatch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch) return false;
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'NOT_UPLOADED') return false;
    return d.status === filterStatus;
  });

  // Statistics calculation
  const totalStandard = STANDARD_STUDENT_DOCUMENTS.length;
  const uploadedCount = documentRows.filter(r => r.uploadedDoc).length + customDocs.length;
  const verifiedCount = documentRows.filter(r => r.uploadedDoc?.status === 'VERIFIED').length + customDocs.filter(d => d.status === 'VERIFIED').length;
  const pendingCount = documentRows.filter(r => r.uploadedDoc?.status === 'PENDING_VERIFICATION').length + customDocs.filter(d => d.status === 'PENDING_VERIFICATION').length;
  const rejectedCount = documentRows.filter(r => r.uploadedDoc?.status === 'REJECTED').length + customDocs.filter(d => d.status === 'REJECTED').length;

  // Handlers
  const handleOpenUploadModal = (title: string, category: StudentDocument['category'], existingDoc?: StudentDocument) => {
    // Check permission for Student: Locked documents cannot be re-uploaded by student
    if (isStudent && existingDoc && existingDoc.isLocked && existingDoc.status === 'VERIFIED') {
      alert('🔒 This document is VERIFIED and PERMANENTLY LOCKED by the Admin. You cannot modify or re-upload a verified document.');
      return;
    }

    setUploadModalDoc({ title, category, existingDoc });
    setDocTitle(existingDoc ? existingDoc.title : title);
    setDocCategory(existingDoc ? existingDoc.category : category);
    setSelectedFile(null);
    setErrorMsg('');
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) {
      setErrorMsg('Please specify the document title.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    try {
      if (uploadModalDoc?.existingDoc) {
        // Re-upload / Edit existing document
        const existing = uploadModalDoc.existingDoc;

        // If student is re-uploading, check locking rule
        if (isStudent && existing.isLocked && existing.status === 'VERIFIED') {
          setErrorMsg('This document is verified and locked.');
          setUploading(false);
          return;
        }

        let fileUrl = existing.fileUrl;
        let fileName = existing.fileName;
        let fileSize = existing.fileSize;

        if (selectedFile) {
          fileUrl = await fileStorage.saveFile(selectedFile);
          fileName = selectedFile.name;
          fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
        }

        db.updateEntity<StudentDocument>('studentDocuments', existing.id, {
          title: docTitle,
          category: docCategory,
          fileName,
          fileSize,
          fileUrl,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'PENDING_VERIFICATION',
          isLocked: false,
          remarks: isStudent ? 'Re-uploaded by student for Admin Verification' : 'Updated by Admin',
          rejectionReason: undefined
        }, `Re-uploaded document "${docTitle}" for ${student.name}`);
      } else {
        // New upload
        if (!selectedFile) {
          setErrorMsg('Please select a document file to upload (PDF / JPG / PNG).');
          setUploading(false);
          return;
        }

        const fileUrl = await fileStorage.saveFile(selectedFile);
        const fileName = selectedFile.name;
        const fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;

        db.addEntity<StudentDocument>('studentDocuments', {
          studentId: student.id,
          studentName: student.name,
          enrollmentNo: student.enrollmentNo,
          title: docTitle,
          category: docCategory,
          fileName,
          fileSize,
          fileUrl,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'PENDING_VERIFICATION',
          isLocked: false,
          remarks: isStudent ? 'Uploaded by student for Admin Verification' : 'Uploaded by Admin'
        }, `Uploaded document "${docTitle}" for ${student.name}`);
      }

      loadDocuments();
      setUploadModalDoc(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to store document in secure storage.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc: StudentDocument) => {
    if (!doc.fileUrl) {
      alert('Document file is unavailable.');
      return;
    }
    fileStorage.downloadFile(doc.fileUrl, doc.fileName || `${doc.title}.pdf`);
  };

  // Admin Actions
  const handleAdminVerify = (doc: StudentDocument) => {
    db.updateEntity<StudentDocument>('studentDocuments', doc.id, {
      status: 'VERIFIED',
      isLocked: true, // Permanent lock after Admin verification
      verifiedBy: user?.name || 'University Registrar Admin',
      verifiedAt: new Date().toISOString().split('T')[0],
      remarks: `Verified & permanently locked by ${user?.name || 'Admin'} on ${new Date().toISOString().split('T')[0]}`,
      rejectionReason: undefined
    }, `Verified & locked document "${doc.title}" for ${student.name}`);

    loadDocuments();
  };

  const handleOpenAdminRejectModal = (doc: StudentDocument) => {
    setRejectModalDoc(doc);
    setRejectionReasonInput(doc.rejectionReason || doc.remarks || '');
  };

  const handleConfirmAdminReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalDoc || !rejectionReasonInput.trim()) {
      alert('Please state a valid rejection reason.');
      return;
    }

    const reason = rejectionReasonInput.trim();

    db.updateEntity<StudentDocument>('studentDocuments', rejectModalDoc.id, {
      status: 'REJECTED',
      isLocked: false, // Unlocked so student can fix and re-upload!
      remarks: `Rejected by Admin: ${reason}`,
      rejectionReason: reason
    }, `Rejected document "${rejectModalDoc.title}" for ${student.name}`);

    loadDocuments();
    setRejectModalDoc(null);
    setRejectionReasonInput('');
  };

  const handleAdminUnlockOverride = (doc: StudentDocument) => {
    if (!isAdmin) return;
    if (confirm(`Admin Override: Unlock "${doc.title}" to allow student re-upload?`)) {
      db.updateEntity<StudentDocument>('studentDocuments', doc.id, {
        isLocked: false,
        status: 'PENDING_VERIFICATION',
        remarks: `Unlocked by ${user?.name} for student re-upload`
      }, `Admin unlocked document "${doc.title}"`);
      loadDocuments();
    }
  };

  const handleDeleteDocument = (doc: StudentDocument) => {
    if (isStudent && doc.isLocked && doc.status === 'VERIFIED') {
      alert('🔒 Verified documents are permanently locked and cannot be deleted by students.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      db.deleteEntity('studentDocuments', doc.id, `Deleted document "${doc.title}" for ${student.name}`);
      loadDocuments();
    }
  };

  const getStatusBadge = (doc: StudentDocument | null) => {
    if (!doc) {
      return <Badge variant="inactive"><AlertTriangle size={12} /> NOT UPLOADED</Badge>;
    }
    if (doc.status === 'VERIFIED') {
      return <Badge variant="active" icon={<Lock size={12} />}>VERIFIED &amp; LOCKED</Badge>;
    }
    if (doc.status === 'REJECTED') {
      return <Badge variant="danger" icon={<XCircle size={12} />}>REJECTED</Badge>;
    }
    return <Badge variant="orange" icon={<AlertCircle size={12} />}>PENDING VERIFICATION</Badge>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Overview Statistics & Progress */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)', color: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} color="var(--brand-orange)" /> Student Verification Documents Vault
            </h3>
            <p style={{ fontSize: '0.84375rem', color: '#94A3B8', marginTop: '0.2rem' }}>
              Official credentials, identity proofs, marksheets, and government certificates required by Swarrnim University
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => handleOpenUploadModal('', 'OTHER')}>
              <Plus size={16} /> Upload Custom Document
            </button>
          </div>
        </div>

        {/* Audit / Policy Notice */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8125rem', color: '#CBD5E1' }}>
          <Lock size={16} color="var(--brand-gold)" />
          <span>
            <strong>Locking Policy:</strong> Students can upload &amp; re-upload only <strong>Pending</strong> or <strong>Rejected</strong> documents. Once verified by Admin, documents are <strong>permanently locked</strong> 🔒.
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: '#E2E8F0' }}>
            <span>VERIFICATION PROGRESS: {verifiedCount} / {totalStandard} VERIFIED</span>
            <span>{Math.round((verifiedCount / totalStandard) * 100)}% COMPLETE</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.round((verifiedCount / totalStandard) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, #F37023 0%, #10B981 100%)', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            style={{ border: 'none', background: 'transparent', padding: '0.4rem', fontSize: '0.875rem' }}
            placeholder="Search standard or custom document by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: '180px', height: '36px', fontSize: '0.8125rem' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Documents ({totalStandard + customDocs.length})</option>
            <option value="VERIFIED">Verified &amp; Locked ({verifiedCount})</option>
            <option value="PENDING_VERIFICATION">Pending Verification ({pendingCount})</option>
            <option value="REJECTED">Rejected ({rejectedCount})</option>
            <option value="NOT_UPLOADED">Not Uploaded</option>
          </select>
        </div>
      </div>

      {/* Standard 13 Mandatory Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--brand-orange)" /> Standard Mandatory Documents Checklist ({STANDARD_STUDENT_DOCUMENTS.length})
        </div>

        {filteredStandardRows.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No documents matched your search filter.
          </div>
        ) : (
          filteredStandardRows.map(({ standard, uploadedDoc }, idx) => {
            const isVerified = uploadedDoc?.status === 'VERIFIED';
            const isRejected = uploadedDoc?.status === 'REJECTED';
            const isPending = uploadedDoc?.status === 'PENDING_VERIFICATION';

            // Student Upload/Re-upload Permission Logic:
            // Student can upload if not uploaded yet, or if status is PENDING or REJECTED.
            // Student CANNOT upload if status is VERIFIED & locked!
            const canStudentUpload = !isStudent || !uploadedDoc || !uploadedDoc.isLocked || isRejected || isPending;

            return (
              <div
                key={standard.title}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderLeft: isVerified ? '4px solid #10B981' : isRejected ? '4px solid #EF4444' : isPending ? '4px solid var(--brand-orange)' : '4px solid var(--border-color)',
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--brand-navy)' }}>
                        {idx + 1}. {standard.title}
                      </span>
                      <span style={{ fontSize: '0.75rem' }}><Badge variant="navy">{standard.category}</Badge></span>
                      {standard.required && <span style={{ fontSize: '0.75rem' }}><Badge variant="orange">MANDATORY</Badge></span>}
                      {getStatusBadge(uploadedDoc)}
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      {standard.description}
                    </div>

                    {/* Upload Details */}
                    {uploadedDoc && (
                      <div style={{ fontSize: '0.78125rem', color: 'var(--brand-navy-medium)', marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <span>📄 File: <strong>{uploadedDoc.fileName}</strong> ({uploadedDoc.fileSize})</span>
                        <span>📅 Uploaded: <strong>{uploadedDoc.uploadDate}</strong></span>
                        {uploadedDoc.verifiedBy && (
                          <span>✔️ Verified by: <strong>{uploadedDoc.verifiedBy}</strong> on {uploadedDoc.verifiedAt}</span>
                        )}
                      </div>
                    )}

                    {/* REJECTION REASON ALERT BANNER */}
                    {isRejected && (uploadedDoc.rejectionReason || uploadedDoc.remarks) && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          padding: '0.75rem 1rem',
                          background: '#FEF2F2',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#B91C1C',
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem'
                        }}
                      >
                        <XCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        <div>
                          <strong>Rejection Reason:</strong> {uploadedDoc.rejectionReason || uploadedDoc.remarks}
                          <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: '#991B1B' }}>
                            💡 Action Required: Please review the rejection notes above, select a corrected file, and click <strong>"Re-upload Document"</strong> below.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* View / Preview Button */}
                    {uploadedDoc && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setPreviewDoc(uploadedDoc)} title="View / Preview Document">
                        <Eye size={14} /> View/Preview
                      </button>
                    )}

                    {/* Download Button */}
                    {uploadedDoc && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(uploadedDoc)} title="Download Document File">
                        <Download size={14} /> Download
                      </button>
                    )}

                    {/* Upload / Re-upload Button */}
                    {canStudentUpload ? (
                      <button
                        className={`btn btn-sm ${uploadedDoc ? 'btn-primary' : 'btn-navy'}`}
                        onClick={() => handleOpenUploadModal(standard.title, standard.category, uploadedDoc || undefined)}
                      >
                        <Upload size={14} /> {uploadedDoc ? 'Re-upload' : 'Upload'}
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} title="Verified and Locked by Admin">
                        <Lock size={14} color="#10B981" /> Locked
                      </button>
                    )}

                    {/* ADMIN MANAGEMNET CONTROLS */}
                    {isAdmin && uploadedDoc && (
                      <>
                        {uploadedDoc.status !== 'VERIFIED' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAdminVerify(uploadedDoc)} title="Verify & Lock Document">
                            <Check size={14} /> Verify &amp; Lock
                          </button>
                        )}

                        {uploadedDoc.status !== 'REJECTED' && (
                          <button className="btn btn-secondary btn-sm" style={{ color: '#EF4444' }} onClick={() => handleOpenAdminRejectModal(uploadedDoc)} title="Reject Document with Reason">
                            <XCircle size={14} /> Reject
                          </button>
                        )}

                        {uploadedDoc.isLocked && (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleAdminUnlockOverride(uploadedDoc)} title="Admin Override to Unlock">
                            <Unlock size={14} /> Unlock
                          </button>
                        )}

                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDocument(uploadedDoc)} title="Delete Document">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Uploaded Documents (If Any) */}
      {filteredCustomDocs.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} color="var(--brand-orange)" /> Custom &amp; Additional Uploaded Certificates ({filteredCustomDocs.length})
          </div>

          {filteredCustomDocs.map(doc => (
            <div key={doc.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-navy-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {doc.title}
                    {getStatusBadge(doc)}
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Category: <strong>{doc.category}</strong> • File: {doc.fileName} ({doc.fileSize}) • Uploaded {doc.uploadDate}
                  </div>
                  {doc.rejectionReason && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#B91C1C', fontSize: '0.78125rem' }}>
                      <strong>Rejection Reason:</strong> {doc.rejectionReason}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPreviewDoc(doc)}>
                    <Eye size={14} /> Preview
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(doc)}>
                    <Download size={14} /> Download
                  </button>
                  {isAdmin && (
                    <>
                      {doc.status !== 'VERIFIED' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleAdminVerify(doc)}>
                          <Check size={14} /> Verify &amp; Lock
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDocument(doc)}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD / RE-UPLOAD MODAL */}
      {uploadModalDoc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 220, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} color="var(--brand-orange)" />
              {uploadModalDoc.existingDoc ? `Re-upload "${uploadModalDoc.existingDoc.title}"` : `Upload Document: ${uploadModalDoc.title || 'New Document'}`}
            </h3>

            {errorMsg && (
              <div style={{ padding: '0.75rem', background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Document Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="e.g. Aadhaar Card, 10th Marksheet..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Category *</label>
                <select
                  className="form-select"
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value as any)}
                >
                  <option value="IDENTITY">IDENTITY (Aadhaar / Photo / Signature / PAN)</option>
                  <option value="ACADEMIC">ACADEMIC (10th / 12th / Diploma / Graduation Marksheets)</option>
                  <option value="ADMISSION">ADMISSION (TC / Migration Certificate)</option>
                  <option value="CERTIFICATE">CERTIFICATE (Caste / Income / ABC ID / Passbook)</option>
                  <option value="OTHER">OTHER CERTIFICATE</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {uploadModalDoc.existingDoc ? 'Select New File to Replace (PDF / JPG / PNG)' : 'Select Document File (PDF / JPG / PNG) *'}
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
                  required={!uploadModalDoc.existingDoc}
                />
                {selectedFile && (
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: '0.35rem' }}>
                    Selected File: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#B45309' }}>
                ℹ️ File is stored in secure encrypted IndexedDB storage. Maximum recommended file size is 10 MB.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setUploadModalDoc(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Storing Document...' : uploadModalDoc.existingDoc ? 'Save & Re-submit' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PREVIEW MODAL */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 230, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={22} color="var(--brand-orange)" /> {previewDoc.title}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Student: {previewDoc.studentName} ({previewDoc.enrollmentNo})
                </div>
              </div>
              {getStatusBadge(previewDoc)}
            </div>

            {/* Document Image / File View Container */}
            <div style={{ width: '100%', minHeight: '260px', borderRadius: 'var(--radius-md)', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
              {previewDoc.fileUrl && (previewDoc.fileUrl.startsWith('http') || previewDoc.fileUrl.startsWith('data:image')) ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <FileText size={54} color="var(--brand-navy-medium)" />
                  <div style={{ fontWeight: 800, marginTop: '0.75rem', color: 'var(--brand-navy)', fontSize: '1rem' }}>{previewDoc.fileName}</div>
                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Digital University Verification Document ({previewDoc.fileSize})</div>
                </div>
              )}
            </div>

            {/* Document Metadata Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <div><strong>Document Name:</strong> {previewDoc.title}</div>
              <div><strong>Category:</strong> {previewDoc.category}</div>
              <div><strong>File Name:</strong> {previewDoc.fileName} ({previewDoc.fileSize})</div>
              <div><strong>Upload Date:</strong> {previewDoc.uploadDate}</div>
              <div><strong>Verification Status:</strong> {previewDoc.status}</div>
              {previewDoc.verifiedBy && (
                <div><strong>Verified By:</strong> {previewDoc.verifiedBy} on {previewDoc.verifiedAt}</div>
              )}
              {previewDoc.rejectionReason && (
                <div style={{ color: '#EF4444' }}><strong>Rejection Reason:</strong> {previewDoc.rejectionReason}</div>
              )}
              {previewDoc.remarks && (
                <div><strong>Admin Remarks:</strong> {previewDoc.remarks}</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setPreviewDoc(null)}>Close Preview</button>
              <button className="btn btn-primary" onClick={() => handleDownload(previewDoc)}>
                <Download size={16} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN REJECT MODAL WITH MANDATORY REASON INPUT */}
      {rejectModalDoc && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 230, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <XCircle size={20} color="#EF4444" /> Reject Document Submission
            </h3>
            <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              State clear rejection notes for <strong>"{rejectModalDoc.title}"</strong> ({rejectModalDoc.studentName}). The student will see this reason and can re-upload.
            </p>

            <form onSubmit={handleConfirmAdminReject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Mandatory Rejection Reason *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="e.g. Scanned document is blurry / Mismatch in student name / Expired certificate. Please re-upload clear original."
                  value={rejectionReasonInput}
                  onChange={e => setRejectionReasonInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectModalDoc(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
