import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import { DetailedStudentFeedback, StudentSuggestionItem, FeedbackCategoryType, SuggestionStatus } from '../../types/feedback';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { 
  MessageSquare, Star, Download, Filter, CheckCircle2, 
  Sparkles, Building, UserCheck, ShieldCheck, HelpCircle, 
  ArrowRight, Search, Eye, X, Check, Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AdminFeedbackDashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const isFaculty = role === 'FACULTY';
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEEDBACK_LIST' | 'SUGGESTIONS' | 'FACULTY_VIEW'>(isFaculty ? 'FACULTY_VIEW' : 'OVERVIEW');

  // Suggestion action modal
  const [actioningSuggestion, setActioningSuggestion] = useState<StudentSuggestionItem | null>(null);
  const [newStatus, setNewStatus] = useState<SuggestionStatus>('ACKNOWLEDGED');
  const [assignedDepartment, setAssignedDepartment] = useState<string>('Department of Computer Science & Engineering');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');

  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useMemo(() => {
    return feedbackService.getAdminDashboardStats();
  }, [refreshKey]);

  const facultySelfSummary = useMemo(() => {
    if (!user) return null;
    return feedbackService.getFacultyFeedbackSummary(user);
  }, [user, refreshKey]);

  const mentorSelfSummary = useMemo(() => {
    if (!user) return null;
    return feedbackService.getMentorFeedbackSummary(user.id);
  }, [user, refreshKey]);

  // Filtered Feedbacks
  const filteredFeedbacks = useMemo(() => {
    return stats.feedbacks.filter(f => {
      if (selectedCategoryFilter !== 'ALL' && f.category !== selectedCategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const target = (f.subjectName || f.facultyName || f.mentorName || f.hodName || f.hoiName || f.campusFacilityCategory || '').toLowerCase();
        if (!target.includes(q) && !f.feedbackNo.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [stats.feedbacks, selectedCategoryFilter, searchQuery]);

  // Export to Excel (.xlsx only)
  const handleExportXlsx = () => {
    const rows = filteredFeedbacks.map(f => ({
      'Feedback Number': f.feedbackNo,
      'Category': f.category,
      'Target / Entity': f.subjectName || f.facultyName || f.mentorName || f.hodName || f.hoiName || f.campusFacilityCategory || 'University',
      'Student Identity': f.isAnonymous ? 'ANONYMOUS' : `${f.studentName} (${f.studentEnrollmentNo})`,
      'Overall Rating (1-5)': f.overallRating,
      'Comments': f.comments || '',
      'Improvement Suggestions': f.suggestions || '',
      'Status': f.status,
      'Submitted Date': new Date(f.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Feedback Report');
    XLSX.writeFile(wb, `Student_Feedback_Report_${Date.now()}.xlsx`);
  };

  const handleUpdateSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actioningSuggestion || !user) return;

    feedbackService.updateSuggestionStatus(actioningSuggestion.id, {
      status: newStatus,
      assignedDepartment,
      adminResponse,
      actionTaken
    }, user);

    setActioningSuggestion(null);
    setRefreshKey(k => k + 1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <Badge variant="navy">SUBMITTED</Badge>;
      case 'UNDER_REVIEW': return <Badge variant="gold">UNDER REVIEW</Badge>;
      case 'ACKNOWLEDGED': return <Badge variant="orange">ACKNOWLEDGED</Badge>;
      case 'ACTION_REQUIRED': return <Badge variant="warning">ACTION REQUIRED</Badge>;
      case 'RESOLVED':
      case 'CLOSED': return <Badge variant="active">RESOLVED</Badge>;
      default: return <Badge variant="navy">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--brand-navy) 0%, #1e3a8a 100%)',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="gold">Academic &amp; Institutional Governance</Badge>
            <span style={{ fontSize: '0.8rem', color: '#FEF3C7' }}>Quality Assurance Cell (IQAC)</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={28} /> Student Feedback &amp; Suggestions Management
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#E2E8F0', marginTop: '0.25rem' }}>
            Aggregated institutional analytics, anonymized evaluations, department routing, and official Excel reporting.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportXlsx} style={{ backgroundColor: '#10B981', color: '#FFF', border: 'none' }}>
            <Download size={16} /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--brand-navy)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL FEEDBACKS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
            {stats.totalFeedbacks}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG FACULTY RATING</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={22} fill="#10B981" /> {stats.categoryAverages.FACULTY} / 5
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG SUBJECT RATING</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F59E0B', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={22} fill="#F59E0B" /> {stats.categoryAverages.SUBJECT} / 5
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG MENTOR RATING</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#3B82F6', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={22} fill="#3B82F6" /> {stats.categoryAverages.MENTOR} / 5
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>IMPROVEMENT SUGGESTIONS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#8B5CF6', marginTop: '0.25rem' }}>
            {stats.totalSuggestions}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {(isFaculty
          ? [{ id: 'FACULTY_VIEW', label: 'My Student Feedback & Teaching Evaluation' }]
          : [
              { id: 'OVERVIEW', label: 'Dashboard & Metrics' },
              { id: 'FEEDBACK_LIST', label: `All Feedbacks (${stats.totalFeedbacks})` },
              { id: 'SUGGESTIONS', label: `Suggestions & Routing (${stats.totalSuggestions})` },
              { id: 'FACULTY_VIEW', label: 'My Faculty Evaluation' }
            ]
        ).map(tab => (
          <button
            key={tab.id}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-2">
            {/* Category Performance Breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
                Category-wise Average Ratings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { name: 'Faculty Teaching Quality', avg: stats.categoryAverages.FACULTY, count: stats.categoryCounts.FACULTY },
                  { name: 'Subject Curriculum', avg: stats.categoryAverages.SUBJECT, count: stats.categoryCounts.SUBJECT },
                  { name: 'Faculty Mentorship', avg: stats.categoryAverages.MENTOR, count: stats.categoryCounts.MENTOR },
                  { name: 'Department Leadership (HOD)', avg: stats.categoryAverages.HOD, count: stats.categoryCounts.HOD },
                  { name: 'Institutional Leadership (HOI)', avg: stats.categoryAverages.HOI, count: stats.categoryCounts.HOI },
                  { name: 'Campus Facilities & Wi-Fi', avg: stats.categoryAverages.CAMPUS, count: stats.categoryCounts.CAMPUS },
                  { name: 'General University Experience', avg: stats.categoryAverages.GENERAL_UNIVERSITY, count: stats.categoryCounts.GENERAL_UNIVERSITY }
                ].map(item => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--brand-navy)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.count} Submissions</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontWeight: 800, fontSize: '0.95rem' }}>
                      <Star size={18} fill="#F59E0B" /> {item.avg} / 5.0
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Privacy Controls */}
            <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                Governance &amp; Privacy Policies
              </h3>
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={18} /> Anonymity Protection Active
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.35rem' }}>
                  When students opt for anonymous feedback, personal identifiers (Student Name and Enrollment Number) are strictly redacted from faculty and public reviewer dashboards.
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface-hover)' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Duplicate Prevention Engine
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Students are limited to 1 evaluation per Subject/Faculty/Mentor/HOD/HOI per semester to guarantee authentic, non-spam feedback.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEEDBACK LIST */}
      {activeTab === 'FEEDBACK_LIST' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Filter size={16} color="var(--text-muted)" />
              <select 
                className="form-control" 
                style={{ width: '220px' }}
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="SUBJECT">Subject Feedback</option>
                <option value="FACULTY">Faculty Feedback</option>
                <option value="MENTOR">Mentor Feedback</option>
                <option value="HOD">HOD Feedback</option>
                <option value="HOI">HOI Feedback</option>
                <option value="CAMPUS">Campus Feedback</option>
                <option value="GENERAL_UNIVERSITY">General University</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={16} color="var(--text-muted)" />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search by target or ID..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '250px' }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Feedback No</th>
                  <th>Category</th>
                  <th>Target / Entity</th>
                  <th>Student Identity</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No feedback entries matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map(f => (
                    <tr key={f.id}>
                      <td><code style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{f.feedbackNo}</code></td>
                      <td><Badge variant="navy">{f.category}</Badge></td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                          {f.subjectName || f.facultyName || f.mentorName || f.hodName || f.hoiName || f.campusFacilityCategory?.replace(/_/g, ' ') || 'University'}
                        </div>
                      </td>
                      <td>
                        {f.isAnonymous ? (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                            Anonymous Student
                          </span>
                        ) : (
                          <span style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.8125rem' }}>
                            {f.studentName} ({f.studentEnrollmentNo})
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#F59E0B', fontWeight: 700 }}>
                          <Star size={16} fill="#F59E0B" /> {f.overallRating} / 5
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {f.comments || '-'}
                        </div>
                      </td>
                      <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(f.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUGGESTIONS MANAGEMENT & ROUTING */}
      {activeTab === 'SUGGESTIONS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--brand-gold)" /> Student Improvement Suggestions
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Suggestion No</th>
                  <th>Category</th>
                  <th>Title &amp; Description</th>
                  <th>Student</th>
                  <th>Assigned Dept</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.suggestions.map(s => (
                  <tr key={s.id}>
                    <td><code style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{s.suggestionNo}</code></td>
                    <td><Badge variant="navy">{s.category}</Badge></td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{s.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.description}</div>
                    </td>
                    <td>
                      {s.isAnonymous ? (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Anonymous</span>
                      ) : (
                        <span>{s.studentName}</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                        {s.assignedDepartment || 'General Administration'}
                      </span>
                    </td>
                    <td>{getStatusBadge(s.status)}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => {
                        setActioningSuggestion(s);
                        setNewStatus(s.status);
                        setAssignedDepartment(s.assignedDepartment || 'Department of Computer Science & Engineering');
                        setAdminResponse(s.adminResponse || '');
                        setActionTaken(s.actionTaken || '');
                      }}>
                        Manage Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY SELF VIEW */}
      {activeTab === 'FACULTY_VIEW' && facultySelfSummary && (
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                {facultySelfSummary.facultyName} — Teaching Feedback Evaluation
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Aggregated evaluation calculated from student semester feedback.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Teaching Rating</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={24} fill="#10B981" /> {facultySelfSummary.overallAverageRating} / 5.0
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {Object.entries(facultySelfSummary.criteriaAverages).map(([k, v]) => (
              <div key={k} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-hover)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-navy)' }}>{k}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.25rem' }}>
                  {v} / 5.0
                </div>
              </div>
            ))}
          </div>

          {facultySelfSummary.comments.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                Student Remarks &amp; Feedback Highlights
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {facultySelfSummary.comments.map((comm, idx) => (
                  <div key={idx} style={{ padding: '0.75rem 1rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface-hover)', fontSize: '0.875rem' }}>
                    "{comm}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUGGESTION ACTION MODAL */}
      {actioningSuggestion && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Manage Suggestion
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{actioningSuggestion.suggestionNo}</span>
              </div>
              <button className="btn-icon" onClick={() => setActioningSuggestion(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleUpdateSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Suggestion Title</label>
                <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{actioningSuggestion.title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{actioningSuggestion.description}</div>
              </div>

              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Update Status *</label>
                  <select 
                    className="form-control" 
                    value={newStatus} 
                    onChange={e => setNewStatus(e.target.value as any)}
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ACTION_REQUIRED">ACTION REQUIRED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Assign To Department</label>
                  <select 
                    className="form-control" 
                    value={assignedDepartment} 
                    onChange={e => setAssignedDepartment(e.target.value)}
                  >
                    <option value="Department of Computer Science & Engineering">CSE Department</option>
                    <option value="Department of Electronics & Communication">ECE Department</option>
                    <option value="Estate & Infrastructure Cell">Estate &amp; Maintenance Cell</option>
                    <option value="University Central Library">Central Library</option>
                    <option value="Student Welfare & Sports Office">Student Welfare Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Administrative Response to Student</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder="e.g. Suggestion approved. Purchase request initiated for digital library terminals." 
                  value={adminResponse} 
                  onChange={e => setAdminResponse(e.target.value)} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Action Taken Notes</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  placeholder="Internal action documentation..." 
                  value={actionTaken} 
                  onChange={e => setActionTaken(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActioningSuggestion(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Action</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
