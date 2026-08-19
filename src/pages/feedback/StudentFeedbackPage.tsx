import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { feedbackService } from '../../services/feedbackService';
import { 
  DetailedStudentFeedback, StudentSuggestionItem, FeedbackCategoryType, 
  CampusFacilityCategory, SuggestionCategory 
} from '../../types/feedback';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { 
  MessageSquare, Star, Send, CheckCircle2, AlertCircle, Clock, 
  FileText, Plus, ShieldCheck, UserCheck, Building, HelpCircle, 
  Sparkles, ThumbsUp, Eye, Lock, RefreshCw, X, Check
} from 'lucide-react';

export const StudentFeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'GIVE_FEEDBACK' | 'MY_FEEDBACK' | 'SUGGESTIONS'>('GIVE_FEEDBACK');

  // Feedback Form State
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategoryType>('SUBJECT');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedCampusFacility, setSelectedCampusFacility] = useState<CampusFacilityCategory>('CAMPUS_INFRASTRUCTURE');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [overallRating, setOverallRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Suggestion Form State
  const [suggestionCategory, setSuggestionCategory] = useState<SuggestionCategory>('ACADEMIC');
  const [suggestionTitle, setSuggestionTitle] = useState<string>('');
  const [suggestionDescription, setSuggestionDescription] = useState<string>('');
  const [expectedImprovement, setExpectedImprovement] = useState<string>('');
  const [suggestionAnonymous, setSuggestionAnonymous] = useState<boolean>(false);

  // Modals & Details View
  const [viewingFeedback, setViewingFeedback] = useState<DetailedStudentFeedback | null>(null);
  const [viewingSuggestion, setViewingSuggestion] = useState<StudentSuggestionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Resolved Targets for student
  const targets = useMemo(() => {
    if (!user) return null;
    try {
      return feedbackService.getStudentFeedbackTargets(user.id || user.enrollmentNo || user.email);
    } catch {
      return null;
    }
  }, [user, refreshKey]);

  // Student's Feedbacks & Suggestions
  const myFeedbacks = useMemo(() => {
    if (!user) return [];
    return feedbackService.getMyFeedbacks(user);
  }, [user, refreshKey]);

  const mySuggestions = useMemo(() => {
    if (!user) return [];
    return feedbackService.getMySuggestions(user);
  }, [user, refreshKey]);

  // Handle Criteria Definitions per Category
  const criteriaList = useMemo(() => {
    switch (selectedCategory) {
      case 'SUBJECT':
        return [
          { key: 'Teaching Quality', label: 'Teaching Quality' },
          { key: 'Course Coverage', label: 'Course Coverage & Syllabus Completion' },
          { key: 'Clarity of Teaching', label: 'Clarity of Explanations' },
          { key: 'Study Material', label: 'Quality of Study Materials & Notes' },
          { key: 'Doubt Resolution', label: 'Doubt Resolution in Class' },
          { key: 'Class Engagement', label: 'Class Engagement & Interaction' }
        ];
      case 'FACULTY':
        return [
          { key: 'Communication', label: 'Communication & Delivery' },
          { key: 'Teaching Clarity', label: 'Teaching Clarity & Concepts' },
          { key: 'Knowledge', label: 'Subject Knowledge & Depth' },
          { key: 'Class Management', label: 'Class Management & Discipline' },
          { key: 'Doubt Resolution', label: 'Availability for Doubts' },
          { key: 'Punctuality', label: 'Punctuality & Regularity' },
          { key: 'Student Engagement', label: 'Student Engagement' }
        ];
      case 'MENTOR':
        return [
          { key: 'Mentor Availability', label: 'Mentor Availability' },
          { key: 'Guidance', label: 'Guidance & Advice' },
          { key: 'Communication', label: 'Communication & Responsiveness' },
          { key: 'Academic Support', label: 'Academic & Progress Support' },
          { key: 'Problem Resolution', label: 'Assistance with Queries & Issues' },
          { key: 'Student Support', label: 'Overall Student Welfare Support' }
        ];
      case 'HOD':
        return [
          { key: 'Accessibility', label: 'Accessibility & Availability' },
          { key: 'Communication', label: 'Communication & Department Updates' },
          { key: 'Department Support', label: 'Departmental Academic Atmosphere' },
          { key: 'Issue Resolution', label: 'Timely Grievance Resolution' },
          { key: 'Student Support', label: 'Student Support & Guidance' }
        ];
      case 'HOI':
        return [
          { key: 'Accessibility', label: 'Leadership & Accessibility' },
          { key: 'Communication', label: 'Institutional Vision & Communication' },
          { key: 'Academic Environment', label: 'Academic Standards & Environment' },
          { key: 'Student Support', label: 'Campus Amenities & Student Welfare' },
          { key: 'Issue Resolution', label: 'Responsiveness to Student Needs' }
        ];
      case 'CAMPUS':
        return [
          { key: 'Infrastructure', label: 'Infrastructure & Condition' },
          { key: 'Cleanliness', label: 'Cleanliness & Hygiene' },
          { key: 'Functionality', label: 'Operational Efficiency' },
          { key: 'Staff Helpfulness', label: 'Staff Support & Helpfulness' }
        ];
      case 'GENERAL_UNIVERSITY':
        return [
          { key: 'Academic Environment', label: 'Overall Academic Environment' },
          { key: 'Student Services', label: 'Student Services Efficiency' },
          { key: 'Campus Experience', label: 'Overall Campus Experience' },
          { key: 'Events & Co-curricular', label: 'Events, Clubs & Activities' }
        ];
      default:
        return [];
    }
  }, [selectedCategory]);

  // Auto-set selected subject/faculty defaults
  React.useEffect(() => {
    if (targets && targets.subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(targets.subjects[0].subject.id);
    }
    if (targets && targets.teachingFaculty.length > 0 && !selectedFacultyId) {
      setSelectedFacultyId(targets.teachingFaculty[0].id);
    }
  }, [targets, selectedSubjectId, selectedFacultyId]);

  // Set default ratings to 5 for criteria
  React.useEffect(() => {
    const initial: Record<string, number> = {};
    criteriaList.forEach(c => {
      initial[c.key] = 5;
    });
    setRatings(initial);
    setOverallRating(5);
  }, [criteriaList]);

  // Handle Submit Feedback
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      feedbackService.submitFeedback({
        category: selectedCategory,
        campusFacilityCategory: selectedCategory === 'CAMPUS' ? selectedCampusFacility : undefined,
        subjectId: selectedCategory === 'SUBJECT' ? selectedSubjectId : undefined,
        facultyId: selectedCategory === 'FACULTY' ? selectedFacultyId : undefined,
        ratings,
        overallRating,
        comments,
        suggestions,
        isAnonymous
      }, user);

      setComments('');
      setSuggestions('');
      setRefreshKey(k => k + 1);
      showToast('success', `${selectedCategory.replace(/_/g, ' ')} Feedback submitted successfully.`);
      setActiveTab('MY_FEEDBACK');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit feedback.');
    }
  };

  // Handle Submit Suggestion
  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      feedbackService.submitSuggestion({
        category: suggestionCategory,
        title: suggestionTitle,
        description: suggestionDescription,
        expectedImprovement,
        isAnonymous: suggestionAnonymous
      }, user);

      setSuggestionTitle('');
      setSuggestionDescription('');
      setExpectedImprovement('');
      setRefreshKey(k => k + 1);
      showToast('success', 'Your improvement suggestion has been recorded.');
      setActiveTab('SUGGESTIONS');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit suggestion.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <Badge variant="navy">SUBMITTED</Badge>;
      case 'UNDER_REVIEW': return <Badge variant="gold">UNDER REVIEW</Badge>;
      case 'ACKNOWLEDGED': return <Badge variant="orange">ACKNOWLEDGED</Badge>;
      case 'RESOLVED':
      case 'CLOSED': return <Badge variant="active">RESOLVED</Badge>;
      default: return <Badge variant="navy">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000,
          backgroundColor: toastMessage.type === 'success' ? '#10B981' : '#EF4444',
          color: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontWeight: 600
        }}>
          {toastMessage.text}
        </div>
      )}

      {/* Header Banner */}
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
            <Badge variant="gold">Student Voice &amp; Quality Feedback</Badge>
            <span style={{ fontSize: '0.8rem', color: '#FEF3C7' }}>Academic Year 2026</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={28} /> Feedback &amp; Suggestions Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#E2E8F0', marginTop: '0.25rem' }}>
            Share constructive evaluation on subjects, teaching, mentorship, campus facilities, and submit improvement suggestions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'GIVE_FEEDBACK' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('GIVE_FEEDBACK')}
            style={{ backgroundColor: activeTab === 'GIVE_FEEDBACK' ? 'var(--brand-gold)' : 'rgba(255,255,255,0.15)', color: activeTab === 'GIVE_FEEDBACK' ? '#000' : '#FFF', border: 'none' }}
          >
            <Plus size={16} /> Give Feedback
          </button>
          <button 
            className={`btn ${activeTab === 'MY_FEEDBACK' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('MY_FEEDBACK')}
            style={{ backgroundColor: activeTab === 'MY_FEEDBACK' ? 'var(--brand-gold)' : 'rgba(255,255,255,0.15)', color: activeTab === 'MY_FEEDBACK' ? '#000' : '#FFF', border: 'none' }}
          >
            <FileText size={16} /> My Feedback ({myFeedbacks.length})
          </button>
          <button 
            className={`btn ${activeTab === 'SUGGESTIONS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('SUGGESTIONS')}
            style={{ backgroundColor: activeTab === 'SUGGESTIONS' ? 'var(--brand-gold)' : 'rgba(255,255,255,0.15)', color: activeTab === 'SUGGESTIONS' ? '#000' : '#FFF', border: 'none' }}
          >
            <Sparkles size={16} /> Suggestions ({mySuggestions.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: GIVE FEEDBACK ────────────────────────────────────────── */}
      {activeTab === 'GIVE_FEEDBACK' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category Selector Grid */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
              Select Feedback Category
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
              {[
                { id: 'SUBJECT', label: 'Subject Feedback', desc: 'Enrolled subjects' },
                { id: 'FACULTY', label: 'Faculty / Teaching', desc: 'Teaching quality' },
                { id: 'MENTOR', label: 'Mentor Feedback', desc: 'Assigned faculty mentor' },
                { id: 'HOD', label: 'HOD Feedback', desc: 'Department head' },
                { id: 'HOI', label: 'HOI Feedback', desc: 'Institute principal' },
                { id: 'CAMPUS', label: 'Campus Feedback', desc: 'Facilities & services' },
                { id: 'GENERAL_UNIVERSITY', label: 'University Feedback', desc: 'Overall university' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as FeedbackCategoryType)}
                  style={{
                    padding: '0.85rem', borderRadius: '8px', textAlign: 'left',
                    border: selectedCategory === cat.id ? '2px solid var(--brand-navy)' : '1px solid var(--border-color)',
                    backgroundColor: selectedCategory === cat.id ? 'rgba(26, 54, 93, 0.08)' : 'var(--bg-surface-hover)',
                    cursor: 'pointer', transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', color: selectedCategory === cat.id ? 'var(--brand-navy)' : 'var(--text-main)' }}>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {cat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Form Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Target Identification Box */}
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)' }}>
                {selectedCategory === 'SUBJECT' && (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Select Enrolled Subject *
                    </label>
                    <select 
                      className="form-control" 
                      value={selectedSubjectId} 
                      onChange={e => setSelectedSubjectId(e.target.value)}
                      required
                    >
                      {targets?.subjects.map(p => (
                        <option key={p.subject.id} value={p.subject.id}>
                          {p.subject.code} - {p.subject.name} {p.faculty ? `(Teacher: ${p.faculty.name})` : ''}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Teacher is automatically mapped from the student's active subject schedule.
                    </div>
                  </div>
                )}

                {selectedCategory === 'FACULTY' && (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Select Teaching Faculty *
                    </label>
                    <select 
                      className="form-control" 
                      value={selectedFacultyId} 
                      onChange={e => setSelectedFacultyId(e.target.value)}
                      required
                    >
                      {targets?.teachingFaculty.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.designation}) - {f.departmentId}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      Only active faculty members currently teaching your subjects are available.
                    </div>
                  </div>
                )}

                {selectedCategory === 'MENTOR' && (
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Current Assigned Mentor</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <UserCheck size={18} color="#10B981" /> {targets?.activeMentor?.name || 'Assigned Faculty Mentor'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Emp ID: {targets?.activeMentor?.employeeId || 'FAC001'} • {targets?.activeMentor?.email || 'mentor@university.edu'}
                    </div>
                  </div>
                )}

                {selectedCategory === 'HOD' && (
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Department Head (HOD)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={18} color="var(--brand-navy)" /> {targets?.hod?.name || 'Department HOD'}
                    </div>
                  </div>
                )}

                {selectedCategory === 'HOI' && (
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Institute Principal / Head of Institute (HOI)</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={18} color="var(--brand-gold)" /> {targets?.hoi?.name || 'Principal'}
                    </div>
                  </div>
                )}

                {selectedCategory === 'CAMPUS' && (
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Campus Facility Category *</label>
                    <select 
                      className="form-control" 
                      value={selectedCampusFacility} 
                      onChange={e => setSelectedCampusFacility(e.target.value as any)}
                    >
                      <option value="CAMPUS_INFRASTRUCTURE">Campus Infrastructure &amp; Buildings</option>
                      <option value="CLASSROOMS">Classrooms &amp; Smart Boards</option>
                      <option value="LABORATORIES">Laboratories &amp; Equipment</option>
                      <option value="LIBRARY">Library &amp; Digital Resources</option>
                      <option value="HOSTEL">Hostel &amp; Residential Living</option>
                      <option value="FOOD_CAFETERIA">Food &amp; Cafeteria</option>
                      <option value="TRANSPORT">University Bus &amp; Transport</option>
                      <option value="SPORTS_FACILITIES">Sports Facilities &amp; Gym</option>
                      <option value="CLEANLINESS">Cleanliness &amp; Hygiene</option>
                      <option value="SECURITY">Campus Safety &amp; Security</option>
                      <option value="WIFI_INTERNET">Wi-Fi &amp; Internet Connectivity</option>
                      <option value="PARKING">Vehicle Parking</option>
                      <option value="STUDENT_SERVICES">Student Section Services</option>
                      <option value="OTHER">Other Campus Amenities</option>
                    </select>
                  </div>
                )}

                {selectedCategory === 'GENERAL_UNIVERSITY' && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', fontWeight: 600 }}>
                    Providing overall university-level feedback on academic atmosphere and governance.
                  </div>
                )}
              </div>

              {/* Criteria Star Ratings (1-5) */}
              <div>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.75rem' }}>
                  Performance Evaluation Rubric (1 = Very Poor, 5 = Excellent)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {criteriaList.map(crit => (
                    <div key={crit.key} style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#FFF' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                        {crit.label}
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatings(prev => ({ ...prev, [crit.key]: star }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                          >
                            <Star 
                              size={20} 
                              color="#F59E0B" 
                              fill={(ratings[crit.key] || 5) >= star ? '#F59E0B' : 'none'} 
                            />
                          </button>
                        ))}
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-navy)', marginLeft: '0.5rem' }}>
                          {ratings[crit.key] || 5} / 5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Rating */}
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.4rem' }}>
                  Overall Rating *
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setOverallRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                    >
                      <Star size={26} color="#F59E0B" fill={overallRating >= star ? '#F59E0B' : 'none'} />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-navy)', marginLeft: '0.75rem' }}>
                    {overallRating === 5 ? '5 - Excellent' : overallRating === 4 ? '4 - Good' : overallRating === 3 ? '3 - Average' : overallRating === 2 ? '2 - Poor' : '1 - Very Poor'}
                  </span>
                </div>
              </div>

              {/* Qualitative Comments & Suggestions */}
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Detailed Comments &amp; Remarks (Optional)
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="Share specific observations or positive feedback..." 
                    value={comments} 
                    onChange={e => setComments(e.target.value)} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Constructive Suggestions for Improvement (Optional)
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="Suggest concrete ways to improve..." 
                    value={suggestions} 
                    onChange={e => setSuggestions(e.target.value)} 
                  />
                </div>
              </div>

              {/* Anonymous Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface-hover)' }}>
                <input 
                  type="checkbox" 
                  id="anonymous-feedback-check"
                  checked={isAnonymous} 
                  onChange={e => setIsAnonymous(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="anonymous-feedback-check" style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', fontWeight: 600, cursor: 'pointer' }}>
                  Submit Anonymously (Your name and enrollment number will be hidden from normal reviewer dashboards)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MY FEEDBACK LEDGER ────────────────────────────────────── */}
      {activeTab === 'MY_FEEDBACK' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
            My Feedback Submissions ({myFeedbacks.length})
          </h3>

          {myFeedbacks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600 }}>You have not submitted any feedback yet.</p>
              <button className="btn btn-sm btn-primary" onClick={() => setActiveTab('GIVE_FEEDBACK')} style={{ marginTop: '0.5rem' }}>
                Give Feedback Now
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Feedback No</th>
                    <th>Category</th>
                    <th>Target / Subject / Faculty</th>
                    <th>Overall Rating</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myFeedbacks.map(f => (
                    <tr key={f.id}>
                      <td><code style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{f.feedbackNo}</code></td>
                      <td><Badge variant="navy">{f.category.replace(/_/g, ' ')}</Badge></td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                          {f.subjectName || f.facultyName || f.mentorName || f.hodName || f.hoiName || f.campusFacilityCategory?.replace(/_/g, ' ') || 'University'}
                        </div>
                        {f.isAnonymous && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Submitted Anonymously)</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontWeight: 700 }}>
                          <Star size={16} fill="#F59E0B" /> {f.overallRating} / 5
                        </div>
                      </td>
                      <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(f.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setViewingFeedback(f)}>
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: SUGGESTIONS ───────────────────────────────────────────── */}
      {activeTab === 'SUGGESTIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Create Suggestion Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--brand-gold)" /> Submit an Improvement Suggestion
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Propose institutional improvements, new club activities, technological innovations, or facility upgrades.
            </p>

            <form onSubmit={handleSubmitSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Suggestion Category *</label>
                  <select 
                    className="form-control" 
                    value={suggestionCategory} 
                    onChange={e => setSuggestionCategory(e.target.value as any)}
                  >
                    <option value="ACADEMIC">Academic Curriculum</option>
                    <option value="TEACHING">Teaching Pedagogy</option>
                    <option value="CAMPUS">Campus Environment</option>
                    <option value="INFRASTRUCTURE">Infrastructure &amp; Labs</option>
                    <option value="TECHNOLOGY">Technology &amp; ERP Portals</option>
                    <option value="STUDENT_SERVICES">Student Services</option>
                    <option value="HOSTEL">Hostel &amp; Residential</option>
                    <option value="TRANSPORT">Transport Facilities</option>
                    <option value="EVENTS">Events &amp; Hackathons</option>
                    <option value="CLUBS">Student Clubs</option>
                    <option value="LIBRARY">Library &amp; Books</option>
                    <option value="SPORTS">Sports &amp; Athletics</option>
                    <option value="CAFETERIA">Cafeteria &amp; Mess</option>
                    <option value="OTHER">Other Improvement</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Suggestion Title *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 24/7 Digital Library Terminal in CS Building" 
                    value={suggestionTitle} 
                    onChange={e => setSuggestionTitle(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Detailed Description *</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Explain the proposed improvement in detail..." 
                  value={suggestionDescription} 
                  onChange={e => setSuggestionDescription(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Expected Impact / Improvement (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Enables students to access ACM digital library journals after class hours" 
                  value={expectedImprovement} 
                  onChange={e => setExpectedImprovement(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input 
                  type="checkbox" 
                  id="suggestion-anon-check"
                  checked={suggestionAnonymous} 
                  onChange={e => setSuggestionAnonymous(e.target.checked)} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="suggestion-anon-check" style={{ fontSize: '0.875rem', color: 'var(--brand-navy)', fontWeight: 600, cursor: 'pointer' }}>
                  Submit suggestion anonymously
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Submit Suggestion
                </button>
              </div>
            </form>
          </div>

          {/* My Suggestions List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1rem' }}>
              My Suggestions ({mySuggestions.length})
            </h3>

            {mySuggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <Sparkles size={40} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 600 }}>No suggestions submitted yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Suggestion No</th>
                      <th>Category</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Admin Response</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySuggestions.map(s => (
                      <tr key={s.id}>
                        <td><code style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{s.suggestionNo}</code></td>
                        <td><Badge variant="navy">{s.category}</Badge></td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{s.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.description.slice(0, 70)}...</div>
                        </td>
                        <td>{getStatusBadge(s.status)}</td>
                        <td>
                          {s.adminResponse ? (
                            <span style={{ color: 'var(--brand-navy)', fontWeight: 600, fontSize: '0.8125rem' }}>
                              {s.adminResponse}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Under Review</span>
                          )}
                        </td>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW FEEDBACK DETAILS ─────────────────────────────────── */}
      {viewingFeedback && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '1.75rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                  Feedback Details
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{viewingFeedback.feedbackNo}</span>
              </div>
              <button className="btn-icon" onClick={() => setViewingFeedback(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category</div>
                  <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{viewingFeedback.category.replace(/_/g, ' ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Rating</div>
                  <div style={{ fontWeight: 800, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={16} fill="#F59E0B" /> {viewingFeedback.overallRating} / 5
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {Object.keys(viewingFeedback.ratings || {}).length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Criteria Ratings</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {Object.entries(viewingFeedback.ratings).map(([k, v]) => (
                      <div key={k} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{k}</span>
                        <strong style={{ color: '#F59E0B' }}>{v} / 5</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingFeedback.comments && (
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Comments</div>
                  <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface-hover)', fontSize: '0.875rem' }}>
                    {viewingFeedback.comments}
                  </div>
                </div>
              )}

              {viewingFeedback.suggestions && (
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>Improvement Suggestions</div>
                  <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--bg-surface-hover)', fontSize: '0.875rem' }}>
                    {viewingFeedback.suggestions}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setViewingFeedback(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
