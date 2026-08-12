import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { FileCheck, ShieldCheck, Ticket, Award, CheckCircle2, Clock } from 'lucide-react';

export const ExamCellWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const exams = db.getExams();
  const forms = db.getExamForms();
  const results = db.getStudentResults();
  const students = db.getStudents();

  const approvedForms = forms.filter(f => f.status === 'APPROVED');
  const pendingForms = forms.filter(f => f.status === 'VERIFICATION_PENDING' || f.status === 'SUBMITTED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Examination Cell &amp; Controller of Examinations
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage university examination schedules, hall ticket issuance, result compilation, and marksheet generation
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <StatCard title="Active University Exams" value={String(exams.length)} icon={FileCheck} subtitle="Current Exam Series" />
        <StatCard title="Exam Forms Approved" value={String(approvedForms.length)} icon={ShieldCheck} subtitle="Hall Tickets Released" />
        <StatCard title="Pending Form Approvals" value={String(pendingForms.length)} icon={Clock} subtitle="Awaiting Verification" />
        <StatCard title="Results Declared" value={String(results.length)} icon={Award} subtitle="SGPA/CGPA Compiled" />
      </div>

      {/* Exam Forms Approval Queue */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Examination Form Approvals &amp; Hall Ticket Queue
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Form ID</th>
                <th>Student Name</th>
                <th>Enrollment No</th>
                <th>Fee Payment</th>
                <th>Attendance Eligibility</th>
                <th>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.id}</strong></td>
                  <td>{f.studentName}</td>
                  <td>{f.enrollmentNo}</td>
                  <td><Badge variant={f.paymentStatus === 'PAID' ? 'active' : 'danger'}>{f.paymentStatus}</Badge></td>
                  <td><Badge variant={f.isEligible !== false ? 'active' : 'danger'}>{f.isEligible !== false ? 'ELIGIBLE' : 'SHORT ATTENDANCE'}</Badge></td>
                  <td>
                    <Badge variant={f.status === 'APPROVED' ? 'active' : f.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {f.status}
                    </Badge>
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
