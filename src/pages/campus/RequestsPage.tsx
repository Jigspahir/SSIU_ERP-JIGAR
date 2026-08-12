import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { ApprovalOfficeType, ApprovalPriority, ApprovalRequest, ApprovalStatus } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { ApprovalRequestModal } from '../../components/approval/ApprovalRequestModal';
import { ApprovalDetailModal } from '../../components/approval/ApprovalDetailModal';
import { getCategoryLabel, getOfficeLabel, PriorityBadge, StatusBadge } from '../../components/approval/ApprovalWorkflowBadge';
import { FileCheck, CheckCircle2, Clock, Plus, Filter, Search, ShieldCheck, AlertCircle, Eye } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  const { user, role } = useAuth();
  
  const [requests, setRequests] = useState<ApprovalRequest[]>(() => db.getScopedApprovalRequests(user, role));
  const [activeViewTab, setActiveViewTab] = useState<'ALL' | 'MY_REQUESTS' | 'PENDING_OFFICE' | 'COMPLETED'>('ALL');
  const [filterOffice, setFilterOffice] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  const refreshData = () => {
    setRequests([...db.getScopedApprovalRequests(user, role)]);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          r.requestNo.toLowerCase().includes(q) ||
          r.applicantName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          (r.applicantEnrollmentOrEmpId && r.applicantEnrollmentOrEmpId.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // View Tab
      if (activeViewTab === 'MY_REQUESTS' && user && r.applicantId !== user.id && r.applicantEmail !== user.email) {
        return false;
      }
      if (activeViewTab === 'PENDING_OFFICE' && (r.status === 'APPROVED' || r.status === 'REJECTED' || r.status === 'WITHDRAWN')) {
        return false;
      }
      if (activeViewTab === 'COMPLETED' && r.status !== 'APPROVED' && r.status !== 'REJECTED') {
        return false;
      }

      // Dropdown Filters
      if (filterOffice !== 'ALL' && r.currentOffice !== filterOffice && r.targetOffice !== filterOffice) {
        return false;
      }
      if (filterStatus !== 'ALL' && r.status !== filterStatus) {
        return false;
      }
      if (filterPriority !== 'ALL' && r.priority !== filterPriority) {
        return false;
      }

      return true;
    });
  }, [requests, activeViewTab, filterOffice, filterStatus, filterPriority, searchQuery, user]);

  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'PENDING' || r.status === 'UNDER_REVIEW' || r.status === 'FORWARDED').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const urgentCount = requests.filter(r => (r.priority === 'URGENT' || r.priority === 'HIGH') && r.status !== 'APPROVED' && r.status !== 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Central Approval Workflow &amp; Request Desk
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Integrated multi-office approval portal connecting Registrar, Vice Chancellor, IQAC, Exam Cell, Student Section &amp; Hostels
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsSubmitModalOpen(true)}>
          <Plus size={16} /> Submit New Request
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Total Tracked Requests" value={String(totalCount)} icon={FileCheck} subtitle="Across All Offices" />
        <StatCard title="Pending Action Queue" value={String(pendingCount)} icon={Clock} colorScheme="gold" subtitle="Awaiting Desk Review" />
        <StatCard title="Approved &amp; Sanctioned" value={String(approvedCount)} icon={CheckCircle2} colorScheme="green" subtitle="Completed Workflows" />
        <StatCard title="High / Urgent Priority" value={String(urgentCount)} icon={AlertCircle} colorScheme="orange" subtitle="Expedited Review" />
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* View Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `All Requests (${requests.length})` },
            { key: 'PENDING_OFFICE', label: `Pending Office Desk (${pendingCount})` },
            { key: 'MY_REQUESTS', label: 'My Submitted Requests' },
            { key: 'COMPLETED', label: `Completed Archive (${approvedCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveViewTab(tab.key as any)}
              className={`btn btn-sm ${activeViewTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bar Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.84375rem' }}
              placeholder="Search by Request No, Title, Student or Employee Name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={15} color="var(--brand-orange)" />
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.8125rem' }}
                value={filterOffice}
                onChange={e => setFilterOffice(e.target.value)}
              >
                <option value="ALL">All Target Offices</option>
                <option value="REGISTRAR">Registrar Office</option>
                <option value="UNIVERSITY_ADMIN">Vice Chancellor / Admin</option>
                <option value="IQAC">IQAC Cell</option>
                <option value="EXAM_CELL">Exam Controller</option>
                <option value="STUDENT_SECTION">Student Section</option>
                <option value="HOSTEL_ADMIN">Hostel Warden Office</option>
                <option value="LIBRARY_ADMIN">Library Office</option>
                <option value="TRANSPORT_ADMIN">Transport Office</option>
                <option value="MAINTENANCE_ADMIN">Maintenance Office</option>
                <option value="HOD_ACADEMIC">HOD Desk</option>
                <option value="FINANCE_CELL">Finance Cell</option>
              </select>
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="FORWARDED">FORWARDED</option>
              <option value="CHANGES_REQUESTED">CHANGES REQUESTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.8125rem' }}
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Request Queue Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Applicant Candidate</th>
                <th>Category</th>
                <th>Target Office</th>
                <th>Priority</th>
                <th>Deadline Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <ShieldCheck size={36} color="var(--brand-orange)" style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-navy)' }}>No requests found</div>
                    <div style={{ fontSize: '0.8125rem', marginTop: '4px' }}>There are no approval workflow requests matching the selected filter criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="table-row-hover">
                    <td style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>
                      <div>{req.requestNo}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{req.applicantName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {req.applicantRole} • {req.applicantEnrollmentOrEmpId || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.84375rem' }}>{getCategoryLabel(req.category)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        {req.title}
                      </div>
                    </td>
                    <td>
                      <Badge variant="navy">{getOfficeLabel(req.currentOffice)}</Badge>
                    </td>
                    <td>
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {req.deadlineDate}
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedRequest(req)}
                        style={{ fontSize: '0.78125rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={14} /> Review Request
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ApprovalRequestModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          refreshData();
          alert('Approval Request submitted successfully and dispatched to target office.');
        }}
      />

      <ApprovalDetailModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        onSuccess={() => {
          refreshData();
          alert('Approval request action recorded successfully.');
        }}
      />
    </div>
  );
};
