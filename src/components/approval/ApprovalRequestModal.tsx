import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ApprovalOfficeType, ApprovalPriority, ApprovalRequestCategory } from '../../types';
import { FileUp, Send, AlertCircle } from 'lucide-react';

interface ApprovalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApprovalRequestModal: React.FC<ApprovalRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  
  const [category, setCategory] = useState<ApprovalRequestCategory>('BONAFIDE_CERTIFICATE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetOffice, setTargetOffice] = useState<ApprovalOfficeType>('STUDENT_SECTION');
  const [priority, setPriority] = useState<ApprovalPriority>('MEDIUM');
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [fileName, setFileName] = useState('');
  const [remarks, setRemarks] = useState('');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide a title and detailed description for your request.');
      return;
    }

    const attachments = fileName.trim() ? [
      {
        id: `att-${Date.now()}`,
        fileName: fileName.trim(),
        fileSize: '1.5 MB',
        fileType: fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Document',
        fileUrl: '#',
        uploadedAt: new Date().toISOString()
      }
    ] : [];

    db.addApprovalRequest({
      applicantId: user.id,
      applicantName: user.name,
      applicantRole: user.role,
      applicantEmail: user.email,
      applicantPhone: user.phone || '+91 98765 43210',
      applicantEnrollmentOrEmpId: user.enrollmentNo || user.employeeId || 'ID-GENERIC',
      departmentId: user.departmentId,
      instituteId: user.instituteId,
      category,
      title: title.trim(),
      description: description.trim(),
      priority,
      targetOffice,
      currentOffice: targetOffice,
      status: 'PENDING',
      deadlineDate,
      attachments
    }, remarks.trim() || `Submitted request ${title.trim()} to ${targetOffice}`);

    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit New Central Approval Request" maxWidth="760px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ background: 'var(--bg-surface-hover)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.84375rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={18} color="var(--brand-orange)" />
          <div>
            Request submitted by <strong>{user.name}</strong> ({user.role}). It will be routed directly to the selected target office workflow desk.
          </div>
        </div>

        <div className="grid-2">
          <div>
            <label className="form-label" style={{ fontWeight: 700 }}>Request Category *</label>
            <select
              className="form-select"
              value={category}
              onChange={e => setCategory(e.target.value as ApprovalRequestCategory)}
              required
            >
              <option value="BONAFIDE_CERTIFICATE">Bonafide Certificate</option>
              <option value="TRANSCRIPT_DEGREE">Transcript / Degree Marksheet</option>
              <option value="FEE_CONCESSION">Fee Concession / Installment</option>
              <option value="HOSTEL_NO_DUES">Hostel Clearance &amp; No-Dues</option>
              <option value="RE_EVALUATION">Exam Script Re-evaluation</option>
              <option value="NO_OBJECTION_CERTIFICATE">NOC Certificate Request</option>
              <option value="LEAVE_APPLICATION">Faculty / Student Leave Sanction</option>
              <option value="RESEARCH_GRANT">Research Grant / Project Sanction</option>
              <option value="EVENT_PERMISSION">Event / Guest Seminar Clearance</option>
              <option value="INFRASTRUCTURE_MAINTENANCE">Maintenance Work Order</option>
              <option value="GENERAL_ADMINISTRATIVE">General Administrative Proposal</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 700 }}>Target Office Desk *</label>
            <select
              className="form-select"
              value={targetOffice}
              onChange={e => setTargetOffice(e.target.value as ApprovalOfficeType)}
              required
            >
              <option value="REGISTRAR">Registrar Office</option>
              <option value="UNIVERSITY_ADMIN">Vice Chancellor / Admin</option>
              <option value="IQAC">IQAC Quality Assurance Cell</option>
              <option value="EXAM_CELL">Examination Controller Office</option>
              <option value="STUDENT_SECTION">Student Section &amp; Certificates</option>
              <option value="HOSTEL_ADMIN">Hostel Warden Office</option>
              <option value="LIBRARY_ADMIN">Library Administration</option>
              <option value="TRANSPORT_ADMIN">Transport Office</option>
              <option value="MAINTENANCE_ADMIN">Estate &amp; Maintenance Office</option>
              <option value="HOD_ACADEMIC">Department HOD Desk</option>
              <option value="FINANCE_CELL">Finance &amp; Accounts Office</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Request Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Urgent Bonafide Certificate for Education Loan Sanction"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Detailed Proposal / Justification *</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Provide complete details, purpose, background context, and statutory requirements..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid-2">
          <div>
            <label className="form-label" style={{ fontWeight: 700 }}>Priority Level *</label>
            <select
              className="form-select"
              value={priority}
              onChange={e => setPriority(e.target.value as ApprovalPriority)}
            >
              <option value="LOW">Low Priority (Standard SLA)</option>
              <option value="MEDIUM">Medium Priority (Regular)</option>
              <option value="HIGH">High Priority (Urgent Action)</option>
              <option value="URGENT">Urgent (Immediate Review)</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 700 }}>Required Resolution Deadline *</label>
            <input
              type="date"
              className="form-input"
              value={deadlineDate}
              onChange={e => setDeadlineDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Attach Supporting Document (Optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <FileUp size={20} color="var(--brand-orange)" />
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Supporting_Doc_Proof.pdf"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700 }}>Submission Remarks / Comments</label>
          <input
            type="text"
            className="form-input"
            placeholder="Initial comments for the receiving office officer..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Send size={16} /> Submit Approval Request
          </button>
        </div>
      </form>
    </Modal>
  );
};
