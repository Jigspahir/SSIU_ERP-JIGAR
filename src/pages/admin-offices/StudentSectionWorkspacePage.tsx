import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { StudentDocument } from '../../types';
import { Users, FileText, CheckCircle2, Clock, Award, ShieldCheck, Download, Eye } from 'lucide-react';

export const StudentSectionWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const students = db.getStudents();
  const docs = db.getStudentDocuments();
  const applications = db.getAdmissionApplications();

  const verifiedDocs = docs.filter(d => d.status === 'VERIFIED');
  const pendingDocs = docs.filter(d => d.status === 'PENDING_VERIFICATION');

  const handleVerifyDoc = (docId: string) => {
    db.updateEntity<StudentDocument>('studentDocuments', docId, {
      status: 'VERIFIED',
      isLocked: true,
      verifiedBy: user?.name || 'Student Section Officer',
      verifiedDate: new Date().toISOString().split('T')[0]
    }, `Verified document ${docId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Student Section &amp; Certificate Office
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Student enrollment verification, document validation, Bonafide/Character certificate processing, and ABC ID audits
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Enrolled Students" value={String(students.length)} icon={Users} subtitle="Active University Roster" />
        <StatCard title="Verified Documents" value={String(verifiedDocs.length)} icon={ShieldCheck} subtitle="Vault Locked &amp; Approved" />
        <StatCard title="Pending Verifications" value={String(pendingDocs.length)} icon={Clock} subtitle="Action Required" />
        <StatCard title="Admissions Processed" value={String(applications.length)} icon={FileText} subtitle="Current Academic Year" />
      </div>

      {/* Pending Document Verification Queue */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Document Verification &amp; Validation Queue
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.slice(0, 10).map(d => (
                <tr key={d.id}>
                  <td><strong>{d.title}</strong></td>
                  <td><Badge variant="navy">{d.category}</Badge></td>
                  <td>{d.uploadDate}</td>
                  <td>
                    <Badge variant={d.status === 'VERIFIED' ? 'active' : d.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {d.status}
                    </Badge>
                  </td>
                  <td>
                    {d.status !== 'VERIFIED' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleVerifyDoc(d.id)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <CheckCircle2 size={13} /> Verify &amp; Lock
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
  );
};
