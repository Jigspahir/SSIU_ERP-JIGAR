import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Faculty } from '../../types';
import { db } from '../../services/db';
import { 
  UserCheck, Mail, Phone, Calendar, MapPin, 
  BookOpen, Award, ShieldCheck, Heart, User, Building2, GitFork, Edit3,
  Clock, Layers, BarChart3, CheckCircle2
} from 'lucide-react';

interface FacultyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: Faculty | null;
  onEditClick?: (faculty: Faculty) => void;
  canMutate?: boolean;
}

export const FacultyProfileModal: React.FC<FacultyProfileModalProps> = ({
  isOpen,
  onClose,
  faculty,
  onEditClick,
  canMutate = true
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TIMETABLE' | 'WORKLOAD'>('OVERVIEW');

  if (!faculty) return null;

  const institute = db.getInstituteById(faculty.instituteId);
  const department = db.getDepartmentById(faculty.departmentId);
  const assignedSubjects = db.getSubjects().filter(s => faculty.subjectIds?.includes(s.id));
  const timetableSlots = db.getTimetableEntries().filter(t => t.facultyId === faculty.id || t.facultyId === 'fac-1');

  // Workload Calculations
  const totalTheoryHours = assignedSubjects.reduce((acc, s) => acc + (s.theoryHoursPerWeek || 3), 0);
  const totalLabHours = assignedSubjects.reduce((acc, s) => acc + (s.labHoursPerWeek || 2), 0);
  const totalWeeklyHours = totalTheoryHours + totalLabHours;

  const getStatusBadge = (status: Faculty['status']) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="active">Active Faculty</Badge>;
      case 'ON_LEAVE': return <Badge variant="warning">On Leave</Badge>;
      default: return <Badge variant="inactive">Inactive</Badge>;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {/* Academic & Employment Details */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover)' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={18} color="var(--brand-orange)" /> Employment &amp; Affiliation
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Institute:</span> <strong>{institute?.name || '-'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> <strong>{department?.name || '-'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Designation:</span> <strong>{faculty.designation}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Joining Date:</span> <strong>{faculty.joiningDate || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Total Experience:</span> <strong>{faculty.experienceYears} Years</strong></div>
                </div>
              </div>

              {/* Qualifications & Specialization */}
              <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover)' }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="var(--brand-gold)" /> Academic Qualifications
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Highest Qualification:</span> <strong>{faculty.qualification}</strong></div>
                  {faculty.specialization && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Research Specialization:</span> <strong>{faculty.specialization}</strong></div>
                  )}
                  <div><span style={{ color: 'var(--text-muted)' }}>Official Email:</span> <strong>{faculty.email}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Phone Number:</span> <strong>{faculty.phone}</strong></div>
                  {faculty.bloodGroup && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Blood Group:</span> <Badge variant="navy">{faculty.bloodGroup}</Badge></div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Subjects Matrix */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--brand-orange)" /> Assigned Course Subjects &amp; Classes
              </h4>
              {assignedSubjects.length === 0 ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No specific subjects assigned yet.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {assignedSubjects.map(sub => (
                    <div key={sub.id} style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--brand-navy-subtle)', color: 'var(--brand-navy-medium)', fontSize: '0.8125rem', fontWeight: 600 }}>
                      {sub.code} - {sub.name} ({sub.credits} Credits • {sub.type})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'TIMETABLE':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Weekly Teaching Timetable &amp; Classroom Schedule Breakdown
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time Slot</th>
                    <th>Subject Name</th>
                    <th>Division</th>
                    <th>Venue / Room</th>
                  </tr>
                </thead>
                <tbody>
                  {timetableSlots.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No timetable slots scheduled for this faculty member.
                      </td>
                    </tr>
                  ) : (
                    timetableSlots.map(slot => {
                      const subj = db.getSubjectById(slot.subjectId);
                      const div = db.getDivisionById(slot.divisionId);

                      return (
                        <tr key={slot.id}>
                          <td style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{slot.dayOfWeek}</td>
                          <td><code style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>{slot.timeSlot}</code></td>
                          <td style={{ fontWeight: 700 }}>{subj?.name || 'Subject'} ({subj?.code})</td>
                          <td>{div?.name || 'Division'}</td>
                          <td><Badge variant="active">{slot.roomNo}</Badge></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'WORKLOAD':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-3">
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--brand-orange)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>THEORY LECTURES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>{totalTheoryHours} Hrs / Wk</div>
              </div>
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>LAB / PRACTICAL</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)' }}>{totalLabHours} Hrs / Wk</div>
              </div>
              <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #3B82F6' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL WORKLOAD</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-orange)' }}>{totalWeeklyHours} Hours</div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-hover)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '0.875rem' }}>
                Subject Workload Contribution Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assignedSubjects.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <strong style={{ color: 'var(--brand-navy)' }}>{sub.name} ({sub.code})</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.type} Course • {sub.credits} Academic Credits</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--brand-orange)' }}>
                      {(sub.theoryHoursPerWeek || 3) + (sub.labHoursPerWeek || 2)} Hours / Week
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Faculty Profile & Workload Summary"
      subtitle={`Employee ID: ${faculty.employeeId}`}
      maxWidth="780px"
      footer={
        <>
          {onEditClick && canMutate && (
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onEditClick(faculty);
              }}
            >
              <Edit3 size={16} /> Edit Faculty Record
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
            src={faculty.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'}
            alt={faculty.name}
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
                {faculty.name}
              </h3>
              <Badge variant="orange">{faculty.designation}</Badge>
              {getStatusBadge(faculty.status)}
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--brand-gold)', fontWeight: 600, marginTop: '0.25rem' }}>
              Employee ID: {faculty.employeeId}
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: '0.35rem' }}>
              Dept of {department?.name} • {institute?.name}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('OVERVIEW')}
          >
            Overview &amp; Subjects ({assignedSubjects.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'TIMETABLE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('TIMETABLE')}
          >
            Timetable Schedule ({timetableSlots.length} Slots)
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'WORKLOAD' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('WORKLOAD')}
          >
            Workload Summary ({totalWeeklyHours} Hrs/Wk)
          </button>
        </div>

        {/* Tab Body */}
        {renderTabContent()}
      </div>
    </Modal>
  );
};
