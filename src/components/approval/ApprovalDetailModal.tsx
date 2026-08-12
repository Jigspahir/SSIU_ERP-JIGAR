import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ApprovalOfficeType, ApprovalRequest, ApprovalStatus } from '../../types';
import { getCategoryLabel, getOfficeLabel, PriorityBadge, StatusBadge } from './ApprovalWorkflowBadge';
import { CheckCircle, XCircle, ArrowRight, MessageSquare, Clock, FileText, Download, AlertTriangle, UserCheck } from 'lucide-react';

interface ApprovalDetailModalProps {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  
  const [actionStatus, setActionStatus] = useState<ApprovalStatus>('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [forwardOffice, setForwardOffice] = useState<ApprovalOfficeType>('REGISTRAR');
  const [showActionPanel, setShowActionPanel] = useState(false);

  if (!request || !user) return null;

  const isCompleted = request.status === 'APPROVED' || request.status === 'REJECTED' || request.status === 'WITHDRAWN';

  const handleExecuteAction = (status: ApprovalStatus) => {
    setActionStatus(status);
    setShowActionPanel(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim() && actionStatus !== 'APPROVED') {
      alert('Remarks are required when rejecting, requesting changes, or forwarding requests.');
      return;
    }

    db.updateApprovalRequestStatus(
      request.id,
      actionStatus,
      remarks.trim() || `Action: ${actionStatus}`,
      user,
      actionStatus === 'FORWARDED' ? forwardOffice : undefined
    );

    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Approval Request Details — ${request.requestNo}`} maxWidth="760px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Summary */}
        <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{request.requestNo}</span>
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>{request.title}</h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Category: <strong>{getCategoryLabel(request.category)}</strong> • Deadline: <strong>{request.deadlineDate}</strong>
            </div>
          </div>
        </div>

        {/* Grid Info */}
        <div className="grid-2" style={{ fontSize: '0.875rem' }}>
          <div className="card" style={{ padding: '1rem', background: '#F8FAFC' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} color="var(--brand-orange)" /> Applicant Profile
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Name:</strong> {request.applicantName} ({request.applicantRole})</div>
              <div><strong>Email:</strong> {request.applicantEmail}</div>
              <div><strong>ID / Reg No:</strong> {request.applicantEnrollmentOrEmpId || '-'}</div>
              <div><strong>Phone:</strong> {request.applicantPhone || '-'}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', background: '#F8FAFC' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="var(--brand-navy)" /> Office Routing
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Original Office:</strong> {getOfficeLabel(request.targetOffice)}</div>
              <div><strong>Current Custodian:</strong> <span style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>{getOfficeLabel(request.currentOffice)}</span></div>
              <div><strong>Submitted Date:</strong> {new Date(request.createdAt).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {request.status}</div>
            </div>
          </div>
        </div>

        {/* Detailed Proposal */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
            Detailed Proposal &amp; Justification
          </h4>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {request.description}
          </div>
        </div>

        {/* Attachments Section */}
        {request.attachments && request.attachments.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
              Attached Documents ({request.attachments.length})
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {request.attachments.map(att => (
                <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                  <FileText size={16} color="var(--brand-orange)" />
                  <div>
                    <div style={{ fontWeight: 700 }}>{att.fileName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{att.fileSize} • {att.fileType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Audit & Remark History Timeline */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={16} color="var(--brand-gold)" /> Audit Trail &amp; Remarks History
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
            {request.remarksHistory && request.remarksHistory.length > 0 ? (
              request.remarksHistory.map((rem, idx) => (
                <div key={rem.id || idx} style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderLeft: '3px solid var(--brand-orange)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>
                      {rem.actionByUserName} ({rem.actionByUserRole})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rem.timestamp}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', marginBottom: '2px' }}>
                    Action: <strong>{rem.action}</strong> • Office: <strong>{getOfficeLabel(rem.office)}</strong>
                  </div>
                  <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"{rem.remarks}"</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No audit history available yet.</div>
            )}
          </div>
        </div>

        {/* Action Panel for Officer / Admin */}
        {!isCompleted && (
          <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            {!showActionPanel ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="btn btn-active btn-sm" onClick={() => handleExecuteAction('APPROVED')}>
                  <CheckCircle size={14} /> Approve Request
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleExecuteAction('UNDER_REVIEW')}>
                  <Clock size={14} /> Mark Under Review
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleExecuteAction('FORWARDED')}>
                  <ArrowRight size={14} /> Forward to Office
                </button>
                <button className="btn btn-warning btn-sm" onClick={() => handleExecuteAction('CHANGES_REQUESTED')}>
                  <AlertTriangle size={14} /> Request Changes
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleExecuteAction('REJECTED')}>
                  <XCircle size={14} /> Reject Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#FFF9E6', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-gold)' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-navy)', fontSize: '0.875rem' }}>
                  Execute Action: <span style={{ color: 'var(--brand-orange)' }}>{actionStatus}</span>
                </div>

                {actionStatus === 'FORWARDED' && (
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Select Office to Forward Request To *</label>
                    <select
                      className="form-select"
                      value={forwardOffice}
                      onChange={e => setForwardOffice(e.target.value as ApprovalOfficeType)}
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
                )}

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Officer Remarks / Reason *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter official review remarks, rationale, or instructions..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    required={actionStatus !== 'APPROVED'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowActionPanel(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Confirm &amp; Record Decision
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
