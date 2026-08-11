import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { BarChart, PieChart } from '../../components/common/Charts';
import { Award, CheckCircle2, ShieldCheck, FileText, Download, BarChart3 } from 'lucide-react';

export const IQACWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const institutes = db.getInstitutes();
  const departments = db.getDepartments();
  const faculty = db.getFaculty();
  const students = db.getStudents();
  const feedbacks = db.getStudentFeedbacks();

  const avgFeedbackScore = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(2)
    : '4.65';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Internal Quality Assurance Cell (IQAC)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            NAAC &amp; NIRF accreditation tracking, quality audits, faculty feedback analysis, and academic performance benchmarks
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid-4">
        <StatCard title="NAAC Accreditation Grade" value="Grade A+" icon={Award} subtitle="Valid Cycle 2 Accreditation" />
        <StatCard title="Average Faculty Feedback" value={`${avgFeedbackScore} / 5.0`} icon={BarChart3} subtitle={`${feedbacks.length} Feedback Responses`} />
        <StatCard title="Active Departments Audited" value={String(departments.length)} icon={ShieldCheck} subtitle="100% Audit Compliance" />
        <StatCard title="Total Enrolled Students" value={String(students.length)} icon={FileText} subtitle="Active University Strength" />
      </div>

      {/* IQAC Quality Benchmarks Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
          Institute Quality Benchmark Audits
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Institute Code</th>
                <th>Institute Name</th>
                <th>Academic Audit Status</th>
                <th>Feedback Rating</th>
                <th>Faculty Strength</th>
                <th>Quality Compliance</th>
              </tr>
            </thead>
            <tbody>
              {institutes.map(inst => (
                <tr key={inst.id}>
                  <td><strong>{inst.code}</strong></td>
                  <td>{inst.name}</td>
                  <td><Badge variant="active">COMPLETED &amp; AUDITED</Badge></td>
                  <td><strong>4.7 / 5.0</strong></td>
                  <td>{faculty.filter(f => f.instituteId === inst.id).length || 5} Faculty</td>
                  <td><Badge variant="navy">98.5% Compliant</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
