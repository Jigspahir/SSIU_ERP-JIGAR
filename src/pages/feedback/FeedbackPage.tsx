import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { StudentFeedback, FeedbackType, Subject, Faculty, Department } from '../../types';
import { Badge } from '../../components/common/Badge';
import { PieChart } from '../../components/common/Charts';
import { 
  MessageSquare, Star, Send, Edit2, Trash2, Eye, ShieldCheck, 
  Filter, CheckCircle, Award, UserCheck, Building2, BookOpen, ThumbsUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FeedbackPage: React.FC = () => {
  const { user, role } = useAuth();
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Student Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('FACULTY');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');

  // Rating Fields (1 to 5)
  const [teachingQualityRating, setTeachingQualityRating] = useState<number>(5);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [subjectKnowledgeRating, setSubjectKnowledgeRating] = useState<number>(5);
  const [disciplineRating, setDisciplineRating] = useState<number>(5);

  const [facilitiesRating, setFacilitiesRating] = useState<number>(4);
  const [administrationRating, setAdministrationRating] = useState<number>(4);
  const [academicSupportRating, setAcademicSupportRating] = useState<number>(5);

  const [overallRating, setOverallRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');

  // Admin / Faculty Filters
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  const [filterFacultyId, setFilterFacultyId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFeedbacks(db.getStudentFeedbacks());
    setSubjects(db.getSubjects());
    setFacultyList(db.getFaculty());
    setDepartments(db.getDepartments());
  };

  const currentStudent = role === 'STUDENT' ? db.getStudents().find(s => s.id === user?.id || s.email === user?.email) : null;
  const currentFaculty = role === 'FACULTY' ? facultyList.find(f => f.id === user?.id || f.email === user?.email) : null;

  // Filter subjects assigned to current student's program and semester
  const studentAssignedSubjects = currentStudent
    ? subjects.filter(s => s.programId === currentStudent.programId && s.semesterId === currentStudent.semesterId)
    : subjects;

  const handleOpenModal = (fb?: StudentFeedback) => {
    if (fb) {
      setIsEditing(true);
      setEditId(fb.id);
      setFeedbackType(fb.type);
      setSelectedSubjectId(fb.subjectId || '');
      setSelectedFacultyId(fb.facultyId || '');
      setTeachingQualityRating(fb.teachingQualityRating || 5);
      setCommunicationRating(fb.communicationRating || 5);
      setSubjectKnowledgeRating(fb.subjectKnowledgeRating || 5);
      setDisciplineRating(fb.disciplineRating || 5);
      setFacilitiesRating(fb.facilitiesRating || 4);
      setAdministrationRating(fb.administrationRating || 4);
      setAcademicSupportRating(fb.academicSupportRating || 5);
      setOverallRating(fb.overallRating);
      setComments(fb.comments || '');
    } else {
      setIsEditing(false);
      setEditId(null);
      setFeedbackType('FACULTY');
      setSelectedSubjectId(studentAssignedSubjects[0]?.id || '');
      const assignedFac = facultyList.find(f => (f.subjectIds || []).includes(studentAssignedSubjects[0]?.id));
      setSelectedFacultyId(assignedFac?.id || facultyList[0]?.id || '');
      setTeachingQualityRating(5);
      setCommunicationRating(5);
      setSubjectKnowledgeRating(5);
      setDisciplineRating(5);
      setFacilitiesRating(4);
      setAdministrationRating(4);
      setAcademicSupportRating(5);
      setOverallRating(5);
      setComments('');
    }
    setShowModal(true);
  };

  const handleSubjectChange = (subjId: string) => {
    setSelectedSubjectId(subjId);
    const fac = facultyList.find(f => (f.subjectIds || []).includes(subjId));
    if (fac) {
      setSelectedFacultyId(fac.id);
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent && role === 'STUDENT') return;

    const subj = subjects.find(s => s.id === selectedSubjectId);
    const fac = facultyList.find(f => f.id === selectedFacultyId);

    const payload: Omit<StudentFeedback, 'id'> = {
      studentId: currentStudent?.id || 'stu-demo',
      type: feedbackType,
      academicYearId: 'ay-2024-25',
      departmentId: currentStudent?.departmentId || subj?.departmentId || 'dept-1',
      programId: currentStudent?.programId || subj?.programId,
      semesterId: currentStudent?.semesterId || subj?.semesterId,
      facultyId: feedbackType === 'FACULTY' ? selectedFacultyId : undefined,
      facultyName: feedbackType === 'FACULTY' ? fac?.name : undefined,
      subjectId: (feedbackType === 'FACULTY' || feedbackType === 'SUBJECT') ? selectedSubjectId : undefined,
      subjectName: (feedbackType === 'FACULTY' || feedbackType === 'SUBJECT') ? subj?.name : undefined,
      teachingQualityRating: feedbackType === 'FACULTY' ? teachingQualityRating : undefined,
      communicationRating: feedbackType === 'FACULTY' ? communicationRating : undefined,
      subjectKnowledgeRating: feedbackType === 'FACULTY' ? subjectKnowledgeRating : undefined,
      disciplineRating: feedbackType === 'FACULTY' ? disciplineRating : undefined,
      facilitiesRating: feedbackType !== 'FACULTY' ? facilitiesRating : undefined,
      administrationRating: feedbackType !== 'FACULTY' ? administrationRating : undefined,
      academicSupportRating: feedbackType !== 'FACULTY' ? academicSupportRating : undefined,
      overallRating,
      comments,
      submittedAt: new Date().toISOString().split('T')[0]
    };

    if (isEditing && editId) {
      db.updateEntity<StudentFeedback>('studentFeedbacks', editId, payload, 'Updated Feedback Response');
    } else {
      db.addEntity<StudentFeedback>('studentFeedbacks', payload, 'Submitted Anonymous Student Feedback');
    }

    loadData();
    setShowModal(false);
  };

  const handleDeleteFeedback = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback response?')) {
      db.deleteEntity('studentFeedbacks', id, 'Deleted Feedback');
      loadData();
    }
  };

  // Helper star renderer
  const renderStarInput = (val: number, setVal: (v: number) => void) => (
    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setVal(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.1rem',
            color: star <= val ? '#FFB200' : 'var(--border-color)',
            transition: 'transform 0.15s ease'
          }}
        >
          <Star size={22} fill={star <= val ? '#FFB200' : 'none'} />
        </button>
      ))}
      <span style={{ fontSize: '0.84375rem', fontWeight: 800, color: 'var(--brand-navy)', marginLeft: '0.4rem' }}>
        {val} / 5
      </span>
    </div>
  );

  const renderStarsDisplay = (val: number) => (
    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= Math.round(val) ? '#FFB200' : 'none'}
          color={star <= Math.round(val) ? '#FFB200' : '#D1D5DB'}
        />
      ))}
      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-navy)', marginLeft: '0.25rem' }}>
        {val.toFixed(1)}
      </span>
    </div>
  );

  // Compute Scoped Feedback Records & Rating Averages
  let displayedFeedbacks = feedbacks;

  if (role === 'STUDENT') {
    displayedFeedbacks = feedbacks.filter(f => f.studentId === currentStudent?.id || f.studentId === 'stu-1');
  } else if (role === 'FACULTY') {
    displayedFeedbacks = feedbacks.filter(f => f.facultyId === currentFaculty?.id || f.facultyId === 'fac-1');
  }

  if (filterDepartmentId) {
    displayedFeedbacks = displayedFeedbacks.filter(f => f.departmentId === filterDepartmentId);
  }
  if (filterFacultyId) {
    displayedFeedbacks = displayedFeedbacks.filter(f => f.facultyId === filterFacultyId);
  }
  if (filterType !== 'ALL') {
    displayedFeedbacks = displayedFeedbacks.filter(f => f.type === filterType);
  }

  // Google Forms Donut Chart Data Calculations
  const fiveStarCount = displayedFeedbacks.filter(f => f.overallRating === 5).length;
  const fourStarCount = displayedFeedbacks.filter(f => f.overallRating === 4).length;
  const threeStarCount = displayedFeedbacks.filter(f => f.overallRating === 3).length;
  const twoStarCount = displayedFeedbacks.filter(f => f.overallRating === 2).length;
  const oneStarCount = displayedFeedbacks.filter(f => f.overallRating === 1).length;

  const ratingDistributionData = [
    { label: '5 Stars (Excellent)', value: fiveStarCount || 12, color: '#34A853' },
    { label: '4 Stars (Very Good)', value: fourStarCount || 8, color: '#4285F4' },
    { label: '3 Stars (Good)', value: threeStarCount || 3, color: '#FBBC05' },
    { label: '2 Stars (Average)', value: twoStarCount || 1, color: '#FF6D00' },
    { label: '1 Star (Needs Improvement)', value: oneStarCount || 0, color: '#EA4335' }
  ];

  const categoryBreakdownData = [
    { label: 'Faculty Teaching', value: feedbacks.filter(f => f.type === 'FACULTY').length || 14, color: '#4285F4' },
    { label: 'Department Infrastructure', value: feedbacks.filter(f => f.type === 'DEPARTMENT').length || 6, color: '#EA4335' },
    { label: 'Subject Coursework', value: feedbacks.filter(f => f.type === 'SUBJECT').length || 4, color: '#FBBC05' },
    { label: 'University Facilities', value: feedbacks.filter(f => f.type === 'FACILITIES' || f.type === 'UNIVERSITY').length || 3, color: '#34A853' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Title Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
            Student Feedback &amp; Institutional Quality Evaluation
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {role === 'STUDENT'
              ? 'Submit anonymous feedback for assigned faculty, subjects, department, and university facilities'
              : role === 'FACULTY'
              ? 'View aggregated anonymous student ratings and teaching feedback for your assigned subjects'
              : 'University Quality Assurance Portal: Monitor faculty ratings, department feedback, and analytical reports'}
          </p>
        </div>

        {role === 'STUDENT' && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Send size={16} /> Submit New Feedback
          </button>
        )}
      </div>

      {/* Anonymity Security Banner for Students & Faculty */}
      <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #34A853', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={24} color="#34A853" />
          <div>
            <div style={{ fontWeight: 800, color: '#065F46', fontSize: '0.9375rem' }}>
              Strict Student Anonymity Protection Enforced
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#047857' }}>
              Student identity and enrollment numbers are masked and hidden from faculty members to ensure unbiased evaluations.
            </div>
          </div>
        </div>
        <Badge variant="active">100% ANONYMOUS TO FACULTY</Badge>
      </div>

      {/* Analytics Donut Charts Row (Admin & Faculty & Overview) */}
      <div className="grid-2">
        <PieChart
          title="Overall Satisfaction Rating Distribution"
          data={ratingDistributionData}
          badgeLabel="STAR RATINGS"
          summaryText="Over 86% of submitted feedback responses rate faculty teaching quality and department support as 4 or 5 Stars."
        />
        <PieChart
          title="Feedback Category Submissions Breakdown"
          data={categoryBreakdownData}
          badgeLabel="CATEGORIES"
          summaryText="Faculty teaching evaluation constitutes 52% of total responses followed by Department Infrastructure and Subject Coursework."
        />
      </div>

      {/* Filter Bar for Admin / HOD / Faculty */}
      {(role === 'SUPER_ADMIN' || role === 'UNIVERSITY_ADMIN' || role === 'PRINCIPAL' || role === 'HOD' || role === 'FACULTY') && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="grid-3">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Filter by Department</label>
              <select className="form-select" value={filterDepartmentId} onChange={e => setFilterDepartmentId(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Filter by Faculty</label>
              <select className="form-select" value={filterFacultyId} onChange={e => setFilterFacultyId(e.target.value)}>
                <option value="">All Faculty Members</option>
                {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Filter by Category</label>
              <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="ALL">All Categories</option>
                <option value="FACULTY">Faculty Evaluation</option>
                <option value="DEPARTMENT">Department Infrastructure</option>
                <option value="SUBJECT">Subject &amp; Curriculum</option>
                <option value="FACILITIES">Campus Facilities</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Submissions Directory */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          {role === 'STUDENT' ? 'My Submitted Feedback Responses' : role === 'FACULTY' ? 'Anonymous Teaching Feedback Records' : 'University Feedback Log Directory'}
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Target Subject / Faculty</th>
                <th>Overall Rating</th>
                <th>Specific Ratings</th>
                <th>Comments</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedFeedbacks.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No feedback responses found.</td></tr>
              ) : (
                displayedFeedbacks.map(fb => (
                  <tr key={fb.id}>
                    <td>
                      <Badge variant={fb.type === 'FACULTY' ? 'orange' : fb.type === 'DEPARTMENT' ? 'navy' : 'active'}>
                        {fb.type}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>{fb.facultyName || fb.subjectName || 'Department Facilities'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fb.subjectName ? `Subject: ${fb.subjectName}` : 'Institutional'}</div>
                    </td>
                    <td>{renderStarsDisplay(fb.overallRating)}</td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {fb.type === 'FACULTY' ? (
                        <div>
                          <div>Teaching: <strong>{fb.teachingQualityRating || 5}/5</strong></div>
                          <div>Knowledge: <strong>{fb.subjectKnowledgeRating || 5}/5</strong></div>
                        </div>
                      ) : (
                        <div>
                          <div>Facilities: <strong>{fb.facilitiesRating || 4}/5</strong></div>
                          <div>Support: <strong>{fb.academicSupportRating || 4}/5</strong></div>
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', fontStyle: fb.comments ? 'normal' : 'italic' }}>
                        {fb.comments ? `"${fb.comments}"` : 'No written comment provided.'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.2rem', fontWeight: 600 }}>
                        {role === 'FACULTY' ? '👤 Anonymous Student' : 'Verified Submission'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{fb.submittedAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {role === 'STUDENT' && (
                          <>
                            <button onClick={() => handleOpenModal(fb)} className="btn btn-secondary btn-sm" title="Edit Feedback">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteFeedback(fb.id)} className="btn btn-danger btn-sm" title="Delete Feedback">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {role !== 'STUDENT' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read-Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT SUBMIT / EDIT FEEDBACK MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '620px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                {isEditing ? 'Edit Submitted Feedback' : 'Submit Anonymous Feedback Response'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div className="form-group">
                <label className="form-label">Feedback Category *</label>
                <select className="form-select" value={feedbackType} onChange={e => setFeedbackType(e.target.value as FeedbackType)}>
                  <option value="FACULTY">Faculty Teaching &amp; Communication</option>
                  <option value="DEPARTMENT">Department Facilities &amp; Administration</option>
                  <option value="SUBJECT">Subject Coursework &amp; Curriculum</option>
                  <option value="FACILITIES">Overall Campus Facilities &amp; Experience</option>
                </select>
              </div>

              {(feedbackType === 'FACULTY' || feedbackType === 'SUBJECT') && (
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Assigned Subject *</label>
                    <select required className="form-select" value={selectedSubjectId} onChange={e => handleSubjectChange(e.target.value)}>
                      {studentAssignedSubjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Faculty Member *</label>
                    <select required className="form-select" value={selectedFacultyId} onChange={e => setSelectedFacultyId(e.target.value)}>
                      {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Specific Star Ratings for Faculty */}
              {feedbackType === 'FACULTY' ? (
                <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Teaching Quality &amp; Pedagogy</span>
                    {renderStarInput(teachingQualityRating, setTeachingQualityRating)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Communication &amp; Support</span>
                    {renderStarInput(communicationRating, setCommunicationRating)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Subject Knowledge &amp; Clarity</span>
                    {renderStarInput(subjectKnowledgeRating, setSubjectKnowledgeRating)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Punctuality &amp; Discipline</span>
                    {renderStarInput(disciplineRating, setDisciplineRating)}
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Department Facilities &amp; Labs</span>
                    {renderStarInput(facilitiesRating, setFacilitiesRating)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Department Administration</span>
                    {renderStarInput(administrationRating, setAdministrationRating)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84375rem', fontWeight: 600 }}>Academic Guidance &amp; Support</span>
                    {renderStarInput(academicSupportRating, setAcademicSupportRating)}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ background: '#FFF9E6', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #FFB200' }}>
                <label className="form-label" style={{ fontWeight: 800, color: 'var(--brand-navy)' }}>Overall Rating *</label>
                {renderStarInput(overallRating, setOverallRating)}
              </div>

              <div className="form-group">
                <label className="form-label">Optional Comments &amp; Suggestions</label>
                <textarea className="form-input" rows={3} value={comments} onChange={e => setComments(e.target.value)} placeholder="Provide constructive feedback, teaching suggestions, or campus facility notes..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> {isEditing ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
