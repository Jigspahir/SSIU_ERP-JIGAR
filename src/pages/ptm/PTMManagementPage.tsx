import React, { useState, useMemo } from 'react';
import { 
  Users, Calendar, Clock, CheckCircle2, AlertTriangle, AlertCircle, 
  FileText, MessageSquare, Plus, Search, Filter, Download, 
  ChevronRight, ArrowUpDown, UserCheck, ShieldAlert, Check, 
  RotateCcw, Edit3, Eye, Video, MapPin, Sparkles, TrendingUp, 
  BarChart3, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ptmService } from '../../services/ptmService';
import { db } from '../../services/db';
import { Student, UserRole } from '../../types';
import { 
  PTMEvent, 
  PTMSchedule, 
  PTMRecord, 
  PTMFollowUpAction, 
  PTMAttendanceStatus,
  PTMScheduleStatus 
} from '../../types/ptm';
import { Badge } from '../../components/common/Badge';
import { StudentPTMDossierModal } from '../../components/ptm/StudentPTMDossierModal';
import { CreatePTMEventModal } from '../../components/ptm/CreatePTMEventModal';

export type PTMTab = 
  | 'dashboard' 
  | 'ptm-schedule' 
  | 'ptm-my' 
  | 'ptm-records' 
  | 'ptm-feedback' 
  | 'ptm-followups' 
  | 'ptm-reports';

interface PTMManagementPageProps {
  initialTab?: PTMTab;
}

export const PTMManagementPage: React.FC<PTMManagementPageProps> = ({ initialTab = 'dashboard' }) => {
  const { user, activeRole } = useAuth();
  const role: UserRole = activeRole || user?.role || 'FACULTY';

  const [activeTab, setActiveTab] = useState<PTMTab>(initialTab);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Data fetching
  const stats = useMemo(() => ptmService.getPTMStats(user!, role), [user, role, refreshTrigger]);
  const deptParticipation = useMemo(() => ptmService.getDepartmentParticipationStats(user!, role), [user, role, refreshTrigger]);
  const events = useMemo(() => ptmService.getEvents(user!, role), [user, role, refreshTrigger]);
  const schedules = useMemo(() => ptmService.getSchedules(user!, role), [user, role, refreshTrigger]);
  const records = useMemo(() => ptmService.getRecords(user!, role), [user, role, refreshTrigger]);
  const followUps = useMemo(() => ptmService.getFollowUpActions(user!, role), [user, role, refreshTrigger]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<{ student: Student; schedule?: PTMSchedule } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      if (selectedEventId !== 'ALL' && s.ptmEventId !== selectedEventId) return false;
      if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;
      if (selectedDeptFilter !== 'ALL' && s.departmentName !== selectedDeptFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          s.studentName.toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.facultyName.toLowerCase().includes(q) ||
          s.programName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [schedules, selectedEventId, selectedStatus, selectedDeptFilter, searchQuery]);

  // Filtered Follow-ups
  const filteredFollowUps = useMemo(() => {
    return followUps.filter(f => {
      if (selectedStatus !== 'ALL' && f.status !== selectedStatus) return false;
      if (selectedPriority !== 'ALL' && f.priority !== selectedPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          f.studentName.toLowerCase().includes(q) ||
          f.enrollmentNo.toLowerCase().includes(q) ||
          f.actionDescription.toLowerCase().includes(q) ||
          f.assignedToName.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [followUps, selectedStatus, selectedPriority, searchQuery]);

  // Quick attendance marking
  const handleQuickAttendance = (scheduleId: string, attStatus: PTMAttendanceStatus) => {
    ptmService.markAttendance(scheduleId, attStatus, user?.name || 'Faculty');
    setRefreshTrigger(prev => prev + 1);
  };

  // Follow-up status transition
  const handleToggleFollowUpStatus = (actionId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    ptmService.updateFollowUpAction(actionId, {
      status: nextStatus as any,
      completionDate: nextStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : undefined,
      completionRemarks: nextStatus === 'COMPLETED' ? 'Marked complete by faculty mentor.' : undefined
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenDossier = (studentId: string, schedule?: PTMSchedule) => {
    const student = db.getStudentById(studentId);
    if (student) {
      setSelectedStudentForDossier({ student, schedule });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>
      
      {/* ═══ Header Section ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', color: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Parent–Teacher Meeting (PTM) Management
              </h2>
              <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                Consultation scheduling, attendance coordination, student 360° dossiers &amp; follow-up action tracking
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(role) && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0F2C59' }}
            >
              <Plus size={16} /> Schedule PTM Event
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => ptmService.exportPTMReportToExcel({}, user!, role)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Download full PTM report in Excel format"
          >
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* ═══ Navigation Tabs Bar ═══ */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #CBD5E1',
        background: '#fff',
        borderRadius: '8px 8px 0 0',
        padding: '0 1rem',
        overflowX: 'auto',
        gap: '0.5rem'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard & KPIs', icon: BarChart3 },
          { id: 'ptm-schedule', label: 'PTM Schedule', icon: Calendar, badge: schedules.length },
          { id: 'ptm-my', label: 'My PTMs (Workspace)', icon: UserCheck },
          { id: 'ptm-records', label: 'PTM Records & Dossiers', icon: FileText, badge: records.length },
          { id: 'ptm-feedback', label: 'Parent Feedback', icon: MessageSquare },
          { id: 'ptm-followups', label: 'Follow-up Actions', icon: CheckCircle2, badge: stats.followUpsPending, badgeVariant: stats.followUpsOverdue > 0 ? 'danger' : 'warning' },
          { id: 'ptm-reports', label: 'Reports & Analytics', icon: TrendingUp },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as PTMTab)}
              style={{
                padding: '0.85rem 1.15rem',
                fontWeight: 700,
                fontSize: '0.84375rem',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '3px solid #F58220' : '3px solid transparent',
                color: isActive ? '#0F2C59' : '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? '#F58220' : '#64748B'} />
              {t.label}
              {t.badge !== undefined && (
                <span style={{
                  fontSize: '0.6875rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  background: t.badgeVariant === 'danger' ? '#FEE2E2' : isActive ? '#0F2C59' : '#F1F5F9',
                  color: t.badgeVariant === 'danger' ? '#B91C1C' : isActive ? '#fff' : '#475569',
                  fontWeight: 800
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ TAB 1: DASHBOARD & KPIS ═══ */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 7 KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #0F2C59' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Total PTMs</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F2C59', marginTop: '0.2rem' }}>{stats.totalPTMs}</div>
              <span style={{ fontSize: '0.725rem', color: '#64748B' }}>{events.length} Master Events</span>
            </div>

            <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #2563EB' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Upcoming PTMs</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2563EB', marginTop: '0.2rem' }}>{stats.upcomingPTMs}</div>
              <span style={{ fontSize: '0.725rem', color: '#2563EB', fontWeight: 600 }}>Active Schedules</span>
            </div>

            <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #15803D' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Completed PTMs</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803D', marginTop: '0.2rem' }}>{stats.completedPTMs}</div>
              <span style={{ fontSize: '0.725rem', color: '#15803D', fontWeight: 600 }}>Recorded in Vault</span>
            </div>

            <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #6366F1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Parents Invited</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#6366F1', marginTop: '0.2rem' }}>{stats.parentsInvited}</div>
              <span style={{ fontSize: '0.725rem', color: '#64748B' }}>Total Scheduled Slots</span>
            </div>

            <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #10B981' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Parents Attended</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10B981', marginTop: '0.2rem' }}>{stats.parentsAttended}</div>
              <span style={{ fontSize: '0.725rem', color: '#10B981', fontWeight: 600 }}>{stats.attendanceRate}% Participation</span>
            </div>

            <div className="card" style={{ padding: '1.15rem', borderLeft: '4px solid #F59E0B' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Parents Pending</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.2rem' }}>{stats.parentsPending}</div>
              <span style={{ fontSize: '0.725rem', color: '#B45309' }}>Awaiting Confirmation</span>
            </div>

            <div className="card" style={{ padding: '1.15rem', borderLeft: `4px solid ${stats.followUpsOverdue > 0 ? '#EF4444' : '#EA580C'}` }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Follow-ups Pending</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: stats.followUpsOverdue > 0 ? '#EF4444' : '#EA580C', marginTop: '0.2rem' }}>
                {stats.followUpsPending}
              </div>
              {stats.followUpsOverdue > 0 && (
                <span style={{ fontSize: '0.725rem', color: '#DC2626', fontWeight: 800 }}>
                  🚨 {stats.followUpsOverdue} Overdue Action(s)
                </span>
              )}
            </div>
          </div>

          {/* 2-Column: Upcoming & Today's PTMs + Department Participation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            
            {/* Upcoming PTM Events */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="#0F2C59" />
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0F2C59' }}>
                    Active &amp; Upcoming PTM Schedules
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('ptm-schedule')}
                  style={{ background: 'transparent', border: 'none', color: '#2563EB', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  View All ({schedules.length}) <ChevronRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {schedules.slice(0, 4).map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.8125rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0F2C59' }}>{s.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Parent: <strong>{s.parentName}</strong> ({s.parentRelationship}) • Slot: {s.slotTime || s.startTime}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Badge variant={s.status === 'CONFIRMED' || s.status === 'COMPLETED' ? 'active' : s.status === 'RESCHEDULED' ? 'warning' : 'danger'}>
                        {s.status}
                      </Badge>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleOpenDossier(s.studentId, s)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Open Dossier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Participation Analytics */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="#0F2C59" />
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0F2C59' }}>
                    Department-wise PTM Participation
                  </h4>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700 }}>
                  Overall: {stats.attendanceRate}% Attended
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {deptParticipation.map(dp => (
                  <div key={dp.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#0F2C59' }}>{dp.department}</strong>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>{dp.attended} of {dp.total} Parents ({dp.percentage}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${dp.percentage}%`, 
                          background: dp.percentage >= 75 ? '#15803D' : dp.percentage >= 60 ? '#F59E0B' : '#EF4444',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic & Attendance Risk Student Spotlight */}
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #EF4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="#EF4444" />
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#B91C1C' }}>
                  Critical Academic &amp; Attendance Concerns Identified
                </h4>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Requires immediate faculty follow-up &amp; parent consultation</span>
            </div>

            <div className="table-responsive" style={{ margin: 0 }}>
              <table className="table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: '#FEE2E2' }}>
                    <th>Student Name</th>
                    <th>Enrollment No.</th>
                    <th>Parent Name &amp; Contact</th>
                    <th>Concern Details</th>
                    <th>PTM Outcome</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.filter(r => r.attendanceConcern || r.actionRequired || r.outcome === 'ATTENDANCE_CONCERN' || r.outcome === 'ACADEMIC_CONCERN').map(rec => (
                    <tr key={rec.id}>
                      <td><strong>{rec.studentName}</strong></td>
                      <td><code style={{ color: '#D97706', fontWeight: 700 }}>{rec.enrollmentNo}</code></td>
                      <td>{rec.parentName}</td>
                      <td>
                        <span style={{ color: '#B91C1C', fontWeight: 600 }}>
                          {rec.attendanceConcernDetails || rec.areasForImprovement || 'Attendance < 60% Warning'}
                        </span>
                      </td>
                      <td>
                        <Badge variant="danger">{rec.outcome}</Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleOpenDossier(rec.studentId)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Review Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: PTM SCHEDULE ═══ */}
      {activeTab === 'ptm-schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Filters Bar */}
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              
              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search student, parent or enrollment..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2rem', fontSize: '0.8125rem', height: '36px' }}
                />
              </div>

              {/* Event Filter */}
              <select
                className="form-input"
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
                style={{ fontSize: '0.8125rem', height: '36px', minWidth: '180px' }}
              >
                <option value="ALL">All PTM Events</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                className="form-input"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ fontSize: '0.8125rem', height: '36px', minWidth: '140px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="INVITED">Invited</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ATTENDED">Attended</option>
                <option value="MISSED">Missed</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>
              Showing {filteredSchedules.length} of {schedules.length} Schedules
            </div>
          </div>

          {/* Schedules Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table className="table" style={{ width: '100%', minWidth: '1200px', fontSize: '0.8125rem', verticalAlign: 'middle' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
                    <th style={{ minWidth: '180px', textAlign: 'left', padding: '0.75rem 1rem' }}>Student Name</th>
                    <th style={{ minWidth: '120px', textAlign: 'left' }}>Enrollment No.</th>
                    <th style={{ minWidth: '160px', textAlign: 'left' }}>Parent / Guardian</th>
                    <th style={{ minWidth: '140px', textAlign: 'left' }}>Date &amp; Slot</th>
                    <th style={{ minWidth: '140px', textAlign: 'left' }}>Faculty Mentor</th>
                    <th style={{ minWidth: '110px', textAlign: 'left' }}>Venue / Mode</th>
                    <th style={{ minWidth: '120px', textAlign: 'center' }}>Parent Response</th>
                    <th style={{ minWidth: '110px', textAlign: 'center' }}>PTM Status</th>
                    <th style={{ minWidth: '160px', textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map(sch => (
                    <tr key={sch.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: '#0F2C59', display: 'block' }}>{sch.studentName}</strong>
                        <span style={{ fontSize: '0.725rem', color: '#64748B' }}>{sch.programName}</span>
                      </td>

                      <td>
                        <code style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--brand-orange)', background: '#FFF7ED', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #FFEDD5' }}>
                          {sch.enrollmentNo}
                        </code>
                      </td>

                      <td>
                        <strong>{sch.parentName}</strong>
                        <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{sch.parentPhone} ({sch.parentRelationship})</div>
                      </td>

                      <td>
                        <strong>{sch.date}</strong>
                        <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{sch.slotTime || `${sch.startTime} - ${sch.endTime}`}</div>
                      </td>

                      <td>{sch.facultyName}</td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{sch.mode}</div>
                        <span style={{ fontSize: '0.725rem', color: '#64748B' }}>{sch.venue}</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={sch.parentResponse === 'CONFIRMED' ? 'active' : sch.parentResponse === 'RESCHEDULE_REQUESTED' ? 'warning' : 'danger'}>
                          {sch.parentResponse}
                        </Badge>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={sch.status === 'COMPLETED' || sch.status === 'ATTENDED' ? 'active' : sch.status === 'CONFIRMED' ? 'navy' : sch.status === 'RESCHEDULED' ? 'warning' : 'danger'}>
                          {sch.status}
                        </Badge>
                      </td>

                      <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          
                          {/* Quick Attendance */}
                          {sch.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleQuickAttendance(sch.id, 'PRESENT')}
                              style={{ padding: '0.3rem 0.5rem', background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                              title="Mark Present"
                            >
                              Present
                            </button>
                          )}

                          {/* Open Dossier / Form */}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleOpenDossier(sch.studentId, sch)}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <FileText size={13} /> Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 3: MY PTMS (FACULTY WORKSPACE) ═══ */}
      {activeTab === 'ptm-my' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card" style={{ padding: '1rem 1.25rem', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <UserCheck size={20} color="#1E40AF" />
              <div>
                <strong style={{ color: '#1E3A8A', fontSize: '0.9375rem' }}>
                  Faculty / Mentor Personal PTM Workspace
                </strong>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: '#1E40AF' }}>
                  Showing assigned student consultation slots strictly scoped to your authorized mentoring batch and department.
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table className="table" style={{ width: '100%', minWidth: '1100px', fontSize: '0.8125rem', verticalAlign: 'middle' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Student Name</th>
                    <th style={{ textAlign: 'left' }}>Enrollment No.</th>
                    <th style={{ textAlign: 'left' }}>Program &amp; Sem</th>
                    <th style={{ textAlign: 'left' }}>Parent Name</th>
                    <th style={{ textAlign: 'left' }}>PTM Date &amp; Slot</th>
                    <th style={{ textAlign: 'center' }}>Attendance %</th>
                    <th style={{ textAlign: 'center' }}>Parent Response</th>
                    <th style={{ textAlign: 'center' }}>PTM Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map(sch => {
                    const st = db.getStudentById(sch.studentId);
                    const att = st ? db.getStudentAttendanceStats(st.id) : { percentage: 85 };
                    return (
                      <tr key={sch.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <strong style={{ color: '#0F2C59' }}>{sch.studentName}</strong>
                          <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{st?.email}</div>
                        </td>

                        <td>
                          <code style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--brand-orange)', background: '#FFF7ED', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #FFEDD5' }}>
                            {sch.enrollmentNo}
                          </code>
                        </td>

                        <td>{sch.programName} (Sem {sch.semesterNumber})</td>

                        <td>
                          <strong>{sch.parentName}</strong>
                          <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{sch.parentPhone}</div>
                        </td>

                        <td>
                          <strong>{sch.date}</strong>
                          <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{sch.slotTime || sch.startTime}</div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <Badge variant={att.percentage >= 75 ? 'active' : att.percentage >= 60 ? 'warning' : 'danger'}>
                            {att.percentage}%
                          </Badge>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <Badge variant={sch.parentResponse === 'CONFIRMED' ? 'active' : 'warning'}>
                            {sch.parentResponse}
                          </Badge>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <Badge variant={sch.status === 'COMPLETED' ? 'active' : sch.status === 'CONFIRMED' ? 'navy' : 'warning'}>
                            {sch.status}
                          </Badge>
                        </td>

                        <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleOpenDossier(sch.studentId, sch)}
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#0F2C59' }}
                          >
                            <FileText size={14} /> Open PTM Record
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 4: PTM RECORDS ═══ */}
      {activeTab === 'ptm-records' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table className="table" style={{ width: '100%', minWidth: '1150px', fontSize: '0.8125rem', verticalAlign: 'middle' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Student &amp; Enrollment</th>
                    <th style={{ textAlign: 'left' }}>Parent Name</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Faculty Mentor</th>
                    <th style={{ textAlign: 'left' }}>Academic Discussion Summary</th>
                    <th style={{ textAlign: 'center' }}>Outcome</th>
                    <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: '#0F2C59' }}>{rec.studentName}</strong>
                        <div style={{ fontSize: '0.725rem', color: '#D97706', fontWeight: 700 }}>{rec.enrollmentNo}</div>
                      </td>

                      <td>{rec.parentName}</td>

                      <td>{rec.date}</td>

                      <td>{rec.facultyName}</td>

                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rec.academicPerformance}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={rec.outcome === 'SATISFACTORY' ? 'active' : rec.outcome === 'IMPROVEMENT_REQUIRED' ? 'warning' : 'danger'}>
                          {rec.outcome}
                        </Badge>
                      </td>

                      <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleOpenDossier(rec.studentId)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          View Full Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 5: PARENT FEEDBACK ═══ */}
      {activeTab === 'ptm-feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 800, color: '#0F2C59' }}>
              Parent Feedback &amp; Consultation Inquiries ({records.filter(r => r.parentFeedback || r.parentConcerns).length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {records.filter(r => r.parentFeedback || r.parentConcerns).map(rec => (
                <div key={rec.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.35rem' }}>
                    <div>
                      <strong style={{ color: '#0F2C59' }}>{rec.parentName}</strong> (Parent of {rec.studentName} - {rec.enrollmentNo})
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Recorded: {rec.date}</span>
                  </div>

                  {rec.parentFeedback && (
                    <div style={{ marginBottom: '0.4rem' }}>
                      <span style={{ color: '#15803D', fontWeight: 700 }}>Feedback:</span>{' '}
                      <span style={{ color: '#334155' }}>"{rec.parentFeedback}"</span>
                    </div>
                  )}

                  {rec.parentConcerns && (
                    <div>
                      <span style={{ color: '#B45309', fontWeight: 700 }}>Inquiry / Concern:</span>{' '}
                      <span style={{ color: '#334155' }}>"{rec.parentConcerns}"</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 6: FOLLOW-UP ACTIONS ═══ */}
      {activeTab === 'ptm-followups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-input"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                style={{ fontSize: '0.8125rem', height: '36px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>

              <select
                className="form-input"
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                style={{ fontSize: '0.8125rem', height: '36px' }}
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {filteredFollowUps.length} Actions Listed
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table className="table" style={{ width: '100%', minWidth: '1050px', fontSize: '0.8125rem', verticalAlign: 'middle' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Action Description</th>
                    <th style={{ textAlign: 'left' }}>Student</th>
                    <th style={{ textAlign: 'left' }}>Assigned To</th>
                    <th style={{ textAlign: 'center' }}>Priority</th>
                    <th style={{ textAlign: 'left' }}>Due Date</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFollowUps.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong style={{ color: '#0F2C59' }}>{item.actionDescription}</strong>
                        {item.completionRemarks && (
                          <div style={{ fontSize: '0.725rem', color: '#15803D', fontStyle: 'italic' }}>
                            ✓ {item.completionRemarks}
                          </div>
                        )}
                      </td>

                      <td>
                        <strong>{item.studentName}</strong>
                        <div style={{ fontSize: '0.725rem', color: '#D97706' }}>{item.enrollmentNo}</div>
                      </td>

                      <td>
                        <strong>{item.assignedToName}</strong>
                        <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{item.assignedToRole}</div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={item.priority === 'CRITICAL' ? 'danger' : item.priority === 'HIGH' ? 'warning' : 'active'}>
                          {item.priority}
                        </Badge>
                      </td>

                      <td>
                        <strong>{item.dueDate}</strong>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={item.status === 'COMPLETED' ? 'active' : item.status === 'OVERDUE' ? 'danger' : 'warning'}>
                          {item.status}
                        </Badge>
                      </td>

                      <td style={{ textAlign: 'right', paddingRight: '1rem' }}>
                        <button
                          type="button"
                          className={item.status === 'COMPLETED' ? 'btn btn-secondary' : 'btn btn-primary'}
                          onClick={() => handleToggleFollowUpStatus(item.id, item.status)}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Check size={14} /> {item.status === 'COMPLETED' ? 'Re-open' : 'Mark Done'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 7: REPORTS ═══ */}
      {activeTab === 'ptm-reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <FileText size={42} color="#0F2C59" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F2C59' }}>Comprehensive PTM Analytical Reports</h3>
            <p style={{ maxWidth: '600px', margin: '0 auto 1.25rem', color: '#64748B', fontSize: '0.84375rem' }}>
              Export structured reports including student-wise discussions, parent feedback, attendance ratios, and outstanding action items.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => ptmService.exportPTMReportToExcel({}, user!, role)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0F2C59', padding: '0.65rem 1.5rem' }}
            >
              <Download size={16} /> Download Full Excel Master Report (.xlsx)
            </button>
          </div>
        </div>
      )}

      {/* ═══ Create PTM Modal ═══ */}
      <CreatePTMEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={() => setRefreshTrigger(prev => prev + 1)}
      />

      {/* ═══ Student PTM Dossier Modal ═══ */}
      {selectedStudentForDossier && (
        <StudentPTMDossierModal
          isOpen={true}
          onClose={() => setSelectedStudentForDossier(null)}
          student={selectedStudentForDossier.student}
          schedule={selectedStudentForDossier.schedule}
          onRecordSaved={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}
    </div>
  );
};
