/**
 * SSIU ERP — Faculty Workload & Workforce Governance Card Component
 * File: src/modules/staff/components/FacultyWorkloadAllocationCard.tsx
 */

import React from 'react';
import { Briefcase, BookOpen, Award, BarChart3, Building2, CheckCircle2 } from 'lucide-react';
import { StaffGovernanceMetricsDTO } from '../types';
import { Badge } from '../../../components/common/Badge';

interface FacultyWorkloadAllocationCardProps {
  metrics: StaffGovernanceMetricsDTO;
}

export const FacultyWorkloadAllocationCard: React.FC<FacultyWorkloadAllocationCardProps> = ({ metrics }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(30, 62, 98, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-navy)' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Academic Faculty</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{metrics.totalFaculty}</div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>{metrics.activeFaculty} Active on Campus</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student-Faculty Ratio (SFR)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-navy)' }}>1 : {metrics.studentFacultyRatio}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AICTE / UGC Benchmark (1:20)</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(235, 94, 40, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-orange)' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ph.D &amp; Doctorate Faculty</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{metrics.phdHolderCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Research Faculty Ratio: {Math.round((metrics.phdHolderCount / Math.max(1, metrics.totalFaculty)) * 100)}%</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Teaching Workload</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-navy)' }}>{metrics.avgTeachingHoursPerWeek} hrs/wk</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Balanced Distribution</div>
          </div>
        </div>
      </div>

      {/* Department Workload Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="var(--brand-orange)" /> Department-Wise SFR &amp; Teaching Load Distribution
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-light)' }}>
                <th>Department</th>
                <th>Institute</th>
                <th>Faculty Strength</th>
                <th>Student Count</th>
                <th>SFR</th>
                <th>Avg Teaching Load</th>
                <th>Workload Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.departmentWorkloadStats.map(stat => (
                <tr key={stat.departmentId}>
                  <td style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{stat.departmentName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{stat.instituteName}</td>
                  <td style={{ fontWeight: 600 }}>{stat.totalFaculty} Faculty</td>
                  <td>{stat.studentCount} Students</td>
                  <td style={{ fontWeight: 600, color: stat.studentFacultyRatio > 25 ? '#EF4444' : 'var(--brand-navy)' }}>
                    1 : {stat.studentFacultyRatio}
                  </td>
                  <td>{stat.averageWorkloadHours} Hours / Week</td>
                  <td>
                    <Badge variant={stat.workloadStatus === 'OPTIMAL' ? 'success' : stat.workloadStatus === 'UNDERLOADED' ? 'navy' : 'danger'}>
                      {stat.workloadStatus}
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
