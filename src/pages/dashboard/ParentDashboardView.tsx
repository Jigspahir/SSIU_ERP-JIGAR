import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, Video, MapPin, CheckCircle2, 
  AlertTriangle, MessageSquare, TrendingUp, BookOpen, Send, 
  ShieldCheck, Megaphone, User, IndianRupee, ArrowRight, 
  HelpCircle, ChevronRight, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ptmService } from '../../services/ptmService';
import { db } from '../../services/db';
import { Badge } from '../../components/common/Badge';
import { SmartActionCenter } from '../../components/dashboard/SmartActionCenter';

interface ParentDashboardViewProps {
  onNavigateTab: (tab: string, params?: any) => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  // Load linked children for current logged in parent
  const linkedStudents = ptmService.getParentLinkedStudents(user?.id || 'user-parent-1');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    linkedStudents[0]?.id || 'student-1'
  );

  const selectedStudent = linkedStudents.find(s => s.id === selectedStudentId) || linkedStudents[0];

  // Load schedules, records, and follow-ups for selected student
  const schedules = ptmService.getSchedules(user!, 'PARENT', { studentId: selectedStudent?.id });
  const upcomingSchedule = schedules.find(
    s => s.status === 'INVITED' || s.status === 'CONFIRMED' || s.status === 'SCHEDULED' || s.status === 'RESCHEDULED'
  );

  // Academic entities
  const program = selectedStudent ? db.getProgramById(selectedStudent.programId) : undefined;
  const semester = selectedStudent ? db.getSemesterById(selectedStudent.semesterId) : undefined;
  const attendanceStats = selectedStudent 
    ? db.getStudentAttendanceStats(selectedStudent.id) 
    : { percentage: 88, attendedSessions: 88, totalSessions: 100 };

  const allFees = db.getStudentFeeRecords();
  const childFee = allFees.find(f => selectedStudent && (f.studentId === selectedStudent.id || f.enrollmentNo === selectedStudent.enrollmentNo));

  // PTM Confirmation State
  const [confirmedScheduleId, setConfirmedScheduleId] = useState<string | null>(null);

  const handleConfirmPTM = (scheduleId: string) => {
    ptmService.recordParentResponse(scheduleId, 'CONFIRMED');
    setConfirmedScheduleId(scheduleId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ─── 1. PARENT WELCOME & WARD SELECTOR ─── */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0F2C59 0%, #1A365D 100%)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          color: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(15, 44, 89, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              background: 'rgba(243, 112, 35, 0.25)', 
              color: '#FDBA74', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '999px',
              border: '1px solid rgba(243, 112, 35, 0.4)'
            }}>
              PARENT / GUARDIAN PORTAL
            </span>
            <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>• Academic Session 2026–27</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
            Welcome, {user?.name || 'Guardian'}
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Monitor your child’s academic journey, attend parent-teacher consultations, and stay connected with the university.
          </p>
        </div>

        {linkedStudents.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.8125rem', color: '#E2E8F0', fontWeight: 600 }}>Switch Child:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{
                background: '#0F2C59',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              {linkedStudents.map(s => (
                <option key={s.id} value={s.id} style={{ background: '#0F2C59', color: '#FFFFFF' }}>
                  {s.name} ({s.enrollmentNo})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ─── 2. PARENT SMART ALERTS & ATTENTION CENTER ─── */}
      <SmartActionCenter setActiveTab={onNavigateTab} />

      {/* ─── 3. WARD OVERVIEW & UPCOMING PTM ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Card A: Child Profile & Academic Progress */}
        <div 
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #E2E8F0)',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, rgba(243, 112, 35, 0.15) 0%, rgba(243, 112, 35, 0.05) 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--brand-orange, #F37023)'
              }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy, #0F2C59)', margin: 0 }}>
                  Child Information
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>Enrolled Scholar Profile</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigateTab('parent-children')}
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--brand-orange, #F37023)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              View Full Profile <ChevronRight size={14} />
            </button>
          </div>

          {selectedStudent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', background: 'var(--bg-subtle, #F8FAFC)', borderRadius: '10px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--brand-navy, #0F2C59)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  {selectedStudent.name ? selectedStudent.name.charAt(0) : 'S'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.975rem', color: 'var(--brand-navy, #0F2C59)' }}>
                    {selectedStudent.name}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748B)' }}>
                    Enrollment: <strong style={{ color: 'var(--text-main, #1E293B)' }}>{selectedStudent.enrollmentNo || selectedStudent.temporaryEnrollmentNumber}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-subtle, #F8FAFC)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>Program & Branch</div>
                  <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: 'var(--brand-navy, #0F2C59)', marginTop: '0.2rem' }}>
                    {program ? program.name : 'B.Tech Computer Engineering'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-subtle, #F8FAFC)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>Current Semester</div>
                  <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: 'var(--brand-navy, #0F2C59)', marginTop: '0.2rem' }}>
                    {semester ? semester.name : 'Semester 1'} (Division A)
                  </div>
                </div>
              </div>

              {/* Attendance & Fee Quick Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 700 }}>Attendance</span>
                    <Badge variant={attendanceStats.percentage >= 75 ? 'success' : 'danger'}>
                      {attendanceStats.percentage}%
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.35rem' }}>
                    {(attendanceStats as any).presentClasses || (attendanceStats as any).attendedSessions || 42} of {(attendanceStats as any).totalClasses || (attendanceStats as any).totalSessions || 48} sessions attended
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: childFee && childFee.pendingAmount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)', border: `1px solid ${childFee && childFee.pendingAmount > 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: childFee && childFee.pendingAmount > 0 ? '#991B1B' : '#065F46', fontWeight: 700 }}>Fee Status</span>
                    <Badge variant={childFee && childFee.pendingAmount > 0 ? 'orange' : 'success'}>
                      {childFee && childFee.pendingAmount > 0 ? `₹${childFee.pendingAmount.toLocaleString('en-IN')}` : 'Cleared'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: childFee && childFee.pendingAmount > 0 ? '#B91C1C' : '#047857', marginTop: '0.35rem' }}>
                    {childFee && childFee.pendingAmount > 0 ? 'Installment pending' : 'All semester dues paid'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card B: PTM Consultation Details */}
        <div 
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #E2E8F0)',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, rgba(15, 44, 89, 0.1) 0%, rgba(15, 44, 89, 0.03) 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--brand-navy, #0F2C59)'
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy, #0F2C59)', margin: 0 }}>
                    Parent–Teacher Meeting (PTM)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>Faculty Consultation Session</span>
                </div>
              </div>
              <Badge variant={upcomingSchedule?.status === 'CONFIRMED' || confirmedScheduleId ? 'success' : 'orange'}>
                {confirmedScheduleId ? 'CONFIRMED' : (upcomingSchedule?.status || 'SCHEDULED')}
              </Badge>
            </div>

            {upcomingSchedule ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-subtle, #F8FAFC)', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--brand-navy, #0F2C59)', fontWeight: 700 }}>
                  <Calendar size={16} color="var(--brand-orange, #F37023)" />
                  <span>{upcomingSchedule.date} • {upcomingSchedule.startTime} – {upcomingSchedule.endTime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted, #64748B)' }}>
                  {upcomingSchedule.mode === 'ONLINE' ? (
                    <><Video size={16} color="#3B82F6" /> Video Consultation via University Portal</>
                  ) : (
                    <><MapPin size={16} color="#10B981" /> Faculty Cabin • Swarrnim Institute of Technology</>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main, #1E293B)', marginTop: '0.25rem' }}>
                  Faculty Mentor: <strong>Prof. ABC (HOD Computer Engineering)</strong>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted, #64748B)', background: 'var(--bg-subtle, #F8FAFC)', borderRadius: '10px' }}>
                No active PTM consultation pending. You will receive an alert when a meeting is scheduled.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            {upcomingSchedule && !confirmedScheduleId && upcomingSchedule.status !== 'CONFIRMED' && (
              <button
                type="button"
                onClick={() => handleConfirmPTM(upcomingSchedule.id)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Check size={16} /> Confirm Attendance
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigateTab('ptm-dashboard')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              Open PTM Portal <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4. QUICK ACTION SHORTCUTS FOR PARENTS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div 
          onClick={() => onNavigateTab('notices')}
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #E2E8F0)',
            padding: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--brand-navy, #0F2C59)' }}>Notices & Updates</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>University & Ward Circulars</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('feedback')}
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #E2E8F0)',
            padding: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--brand-navy, #0F2C59)' }}>Feedback & Suggestions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>Submit Parent Suggestions</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('grievance')}
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #E2E8F0)',
            padding: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--brand-navy, #0F2C59)' }}>Grievance Desk</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>Register & Track Complaints</div>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('profile')}
          style={{
            background: 'var(--bg-card, #FFFFFF)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #E2E8F0)',
            padding: '1.15rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(243, 112, 35, 0.1)', color: 'var(--brand-orange, #F37023)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--brand-navy, #0F2C59)' }}>My Profile</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>Contact & Security Details</div>
          </div>
        </div>
      </div>
    </div>
  );
};
