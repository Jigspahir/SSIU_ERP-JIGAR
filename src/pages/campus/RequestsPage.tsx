import React, { useState } from 'react';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { FileCheck, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import { fileStorage } from '../../services/fileStorage';

interface AdminRequestItem {
  id: string;
  applicantName: string;
  enrollmentNo: string;
  requestType: 'EXAM_FORM' | 'CERTIFICATE' | 'FEE_CONCESSION' | 'RE_CHECKING';
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  details: string;
}

const initialRequests: AdminRequestItem[] = [
  {
    id: 'req-1',
    applicantName: 'Aarav Patel',
    enrollmentNo: '230101001',
    requestType: 'EXAM_FORM',
    date: '2024-03-01',
    status: 'APPROVED',
    details: 'Mid-Sem Exam Registration & Document Verification'
  },
  {
    id: 'req-2',
    applicantName: 'Ananya Roy',
    enrollmentNo: '230101002',
    requestType: 'CERTIFICATE',
    date: '2024-03-04',
    status: 'PENDING',
    details: 'Bonafide Certificate Request for Education Loan'
  }
];

export const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<AdminRequestItem[]>(initialRequests);

  const handleUpdateStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
          Student Requests &amp; Applications Manager
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          University Administrative Desk: Verify, approve, or reject student document requests, exam applications, and concessions
        </p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Pending &amp; Processed Applications ({requests.length})
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student Candidate</th>
                <th>Request Type</th>
                <th>Details</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{req.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{req.applicantName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.enrollmentNo}</div>
                  </td>
                  <td>
                    <Badge variant="navy">{req.requestType}</Badge>
                  </td>
                  <td style={{ fontSize: '0.8125rem', maxWidth: '240px' }}>{req.details}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{req.date}</td>
                  <td>
                    <Badge variant={req.status === 'APPROVED' ? 'active' : req.status === 'PENDING' ? 'orange' : 'inactive'}>
                      {req.status}
                    </Badge>
                  </td>
                  <td>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="btn btn-active btn-sm">
                          Approve
                        </button>
                        <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="btn btn-danger btn-sm">
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
